"use client";

import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Send, X } from "lucide-react";
import { debounce } from "lodash"; // Ensure lodash is installed: `npm install lodash`
import {
  socket,
  connectSocket,
  disconnectSocket,
  sendMessage,
  markMessageAsRead,
  emitTypingStatus,
} from "../../lib/socket";
import { supabase } from "../../lib/supabase";
import { toast } from "react-hot-toast";
import type { ChatMessage } from "../../types/database";

interface Message {
  id: string;
  senderId: string;
  senderRole: string;
  senderName: string;
  content: string;
  timestamp: string;
  readBy?: string[];
}

interface ChatWindowProps {
  onClose: () => void;
  userId: string;
  userRole: "user" | "support" | "admin";
  recipientId?: string;
  recipientRole?: "user" | "support" | "admin";
  ticketId?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  onClose,
  userId,
  userRole,
  recipientId,
  recipientRole,
  ticketId = "default-ticket-id",
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [senderName, setSenderName] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSocketInitialized = useRef(false);

  const isValidUUID = (str: string) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const debouncedEmitTyping = useRef(
    debounce(() => emitTypingStatus(ticketId, true), 500)
  ).current;

  useEffect(() => {
    if (isSocketInitialized.current) return;
    isSocketInitialized.current = true;

    if (!isValidUUID(userId)) {
      console.error("Invalid userId format. Expected UUID:", userId);
      toast.error("Invalid user credentials");
      return;
    }
    if (recipientId && !isValidUUID(recipientId)) {
      console.error("Invalid recipientId format. Expected UUID:", recipientId);
      toast.error("Invalid recipient credentials");
      return;
    }

    const setupChat = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to use chat");
        onClose();
        return;
      }

      const user = session.user;
      const nameFromMetadata = user?.user_metadata?.full_name || user?.email || "User";
      setSenderName(nameFromMetadata);

      connectSocket({
        userId,
        role: userRole,
        name: nameFromMetadata,
      });
      await loadMessages();
    };

    setupChat();

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to chat server");
    });

    socket.on("disconnect", (reason) => {
      setIsConnected(false);
      console.log("Disconnected from chat server:", reason);
      toast.error("Lost connection to chat server. Attempting to reconnect...");
      if (reason === "io server disconnect" || reason === "transport close") {
        setTimeout(() => {
          connectSocket({ userId, role: userRole, name: senderName });
        }, 1000);
      }
    });

    socket.on("connect_error", (error) => {
      setIsConnected(false);
      console.error("Socket connection error:", error.message);
      toast.error(`Failed to connect to chat server: ${error.message}`);
    });

    socket.on("error", (error: string) => {
      toast.error(error);
    });

    socket.on("message", (message: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === message.id)) return prev;
        return [
          ...prev,
          {
            id: message.id,
            senderId: message.sender_id,
            senderRole: message.sender_role,
            senderName: message.sender_name || "Unknown",
            content: message.content,
            timestamp: message.created_at,
            readBy: message.read_by || [],
          },
        ];
      });
      if (message.sender_id !== userId) {
        markMessageAsRead(message.id, userId);
      }
    });

    socket.on("typing", (data: { userId: string; ticketId: string }) => {
      if (data.ticketId === ticketId && data.userId !== userId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    });

    return () => {
      isSocketInitialized.current = false;
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("error");
      socket.off("message");
      socket.off("typing");
      disconnectSocket();
      console.log("Cleaned up socket connection");
    };
  }, [userId, userRole, recipientId, ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data) {
        setMessages(
          data.map((msg: ChatMessage) => ({
            id: msg.id,
            senderId: msg.sender_id,
            senderRole: msg.sender_role,
            senderName: msg.sender_name || "Unknown",
            content: msg.content,
            timestamp: msg.created_at,
            readBy: msg.read_by || [],
          }))
        );
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load messages");
    }
  };

  const scrollToBottom = () => {
    const container = messagesEndRef.current?.parentElement;
    if (container) {
      const isNearBottom =
        container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
      if (isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleTyping = () => {
    debouncedEmitTyping();
    setTimeout(() => emitTypingStatus(ticketId, false), 2000);
  };

  const handleSendMessage = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    if (e.type === "submit" && "preventDefault" in e) {
      e.preventDefault();
    }
    if (!newMessage.trim()) return;

    const messageData: Partial<ChatMessage> = {
      sender_id: userId,
      sender_role: userRole,
      sender_name: senderName,
      recipient_id: recipientId,
      recipient_role: recipientRole,
      content: newMessage,
      created_at: new Date().toISOString(),
    };

    try {
      if (!isConnected) {
        throw new Error("Not connected to chat server");
      }

      const { data, error } = await supabase
        .from("chat_messages")
        .insert([messageData])
        .select()
        .single();

      if (error) throw error;

      await sendMessage({
        id: data.id,
        ...messageData,
      });

      setNewMessage("");
      markMessageAsRead(data.id, userId);
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error(
        error.message === "No active session"
          ? "Please log in to send messages"
          : error.message === "Not connected to chat server"
          ? "Cannot send message: Not connected to chat server"
          : "Failed to send message"
      );
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-semibold">
          Customer Support
          {isConnected && (
            <span className="ml-2 h-2 w-2 bg-green-500 rounded-full inline-block" />
          )}
          {isTyping && <span className="ml-2 text-sm text-gray-500">Typing...</span>}
        </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>

      <div className="h-96 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 flex ${
              message.senderId === userId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs rounded-lg p-3 ${
                message.senderId === userId
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="text-sm font-medium mb-1">
                {message.senderId === userId ? "You" : message.senderName}
                <span className="text-xs opacity-75 ml-2">({message.senderRole})</span>
              </p>
              <p className="text-sm">{message.content}</p>
              <p className="text-xs mt-1 opacity-75">
                {format(new Date(message.timestamp), "HH:mm")}
                {message.readBy?.includes(userId) && message.senderId !== userId && (
                  <span className="ml-2 text-green-500">Read</span>
                )}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            onClick={handleSendMessage}
            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;