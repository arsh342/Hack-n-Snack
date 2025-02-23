"use client";

import React, { useState, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { format } from "date-fns";
import { MessageSquare, Search } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { toast } from "react-hot-toast"; // Import toast for error handling
import { ChatMessage } from "../../types/database";
import ChatWindow from "./ChatWindow";

interface ChatListProps {
  userRole: string;
  userId: string;
}

const ChatListFallback: React.FC = () => (
  <div className="p-4 text-center text-gray-500">Failed to load chats. Please try again later.</div>
);

const ChatList: React.FC<ChatListProps> = ({ userRole, userId }) => {
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadChats();
    const subscriptions = [subscribeToChats(), subscribeToMessages()];
    
    return () => {
      // Cleanup subscriptions individually
      subscriptions.forEach(subscription => subscription.unsubscribe());
    };
  }, [userRole, userId]);

  const loadChats = async () => {
    try {
      let query = supabase
        .from("chat_rooms")
        .select(`
          *,
          user:auth.users(user_id, email), -- Corrected syntax for auth.users
          support:auth.users(support_id, email) -- Corrected syntax for auth.users
        `)
        .order("created_at", { ascending: false });

      if (userRole === "user") {
        query = query.eq("user_id", userId);
      } else if (userRole === "canteen" || userRole === "admin") {
        query = query.eq("support_id", userId);
      }

      console.log("Chat rooms query:", query.toString()); // Debug query
      const { data, error } = await query;
      if (error) {
        console.error("Error loading chats:", error);
        if (error.code === "42501") {
          toast.error(
            "Permission denied. Please check your RLS policies for chat_rooms or contact an admin."
          );
        } else {
          toast.error("Failed to load chats");
        }
        return;
      }

      setChats(data || []);

      // Load unread counts for each chat
      const counts: Record<string, number> = {};
      await Promise.all(
        (data || []).map(async (chat) => {
          const { count } = await supabase
            .from("chat_messages")
            .select("id", { count: "exact" })
            .eq("ticket_id", chat.id)
            .not("read_by", "cs", `{${userId}}`);
          counts[chat.id] = count || 0;
        })
      );
      setUnreadCounts(counts);
    } catch (error) {
      console.error("Error loading chats:", error);
      toast.error("Failed to load chats");
    }
  };

  const subscribeToChats = () => {
    return supabase
      .channel("chat_changes")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "chat_rooms",
      }, () => {
        loadChats();
      })
      .subscribe();
  };

  const subscribeToMessages = () => {
    return supabase
      .channel("message_changes")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "chat_messages",
      }, (payload) => {
        const message = payload.new as ChatMessage;
        if (message && !message.read_by?.includes(userId)) {
          setUnreadCounts((prev) => ({
            ...prev,
            [message.ticket_id]: (prev[message.ticket_id] || 0) + 1,
          }));
        }
      })
      .subscribe();
  };

  const filteredChats = chats.filter((chat) =>
    chat.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.support?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ErrorBoundary FallbackComponent={ChatListFallback}>
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2 p-4"
          >
            {filteredChats.map((chat) => (
              <motion.div
                key={chat.id}
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                className="bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedChat(chat.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="text-indigo-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {chat.subject || `Chat with ${userRole === "user" ? chat.support?.email : chat.user?.email}`}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(chat.created_at), "MMM d, yyyy HH:mm")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {unreadCounts[chat.id] > 0 && (
                      <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
                        {unreadCounts[chat.id]}
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        chat.status === "open"
                          ? "bg-green-100 text-green-800"
                          : chat.status === "in_progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {chat.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {selectedChat && userId && (
          <ChatWindow
            userId={userId}
            userRole={userRole}
            onClose={() => setSelectedChat(null)}
            recipientId={
              userRole === "user"
                ? chats.find((c) => c.id === selectedChat)?.support_id
                : chats.find((c) => c.id === selectedChat)?.user_id
            }
            recipientRole={userRole === "user" ? "canteen" : "user"}
            ticketId={selectedChat}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ChatList;