import { io } from "socket.io-client";
import { toast } from "react-hot-toast";
import type { ChatMessage } from "../types/database";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
  reconnection: true, // Enable automatic reconnection
  reconnectionAttempts: 5, // Number of reconnection attempts
  reconnectionDelay: 1000, // Delay between reconnection attempts (1 second)
});

interface SocketUser {
  userId: string;
  role: string;
  name: string;
}

export const connectSocket = (user: SocketUser) => {
  if (socket.connected) {
    socket.disconnect(); // Ensure clean disconnect before reconnecting
  }

  socket.auth = user;
  socket.connect();

  socket.on("connect", () => {
    console.log("Connected to chat server");
  });

  socket.on("disconnect", (reason) => {
    console.log("Disconnected from chat server:", reason);
    if (reason === "io server disconnect") {
      // Server-initiated disconnection; try to reconnect
      socket.connect();
    }
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
    toast.error(`Failed to connect to chat server: ${error.message}`);
  });

  socket.on("error", (error: string) => {
    toast.error(error);
  });

  socket.on("typing", (data: { userId: string; ticketId: string }) => {
    socket.emit("typing_indicator", {
      ticketId: data.ticketId,
      isTyping: true,
    });
  });

  socket.on("message_read", (data: { messageId: string; readBy: string[] }) => {
    socket.emit("update_read_status", {
      messageId: data.messageId,
      readBy: data.readBy,
    });
  });
};

export const disconnectSocket = () => {
  socket.disconnect();
  console.log("Socket disconnected manually");
};

export const sendMessage = (message: Partial<ChatMessage>) => {
  return new Promise((resolve, reject) => {
    socket.emit("send_message", message, (response: { success: boolean; error?: string }) => {
      if (response.success) {
        resolve(response);
      } else {
        reject(new Error(response.error || "Failed to send message"));
      }
    });
  });
};

export const uploadAttachment = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload file");
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export const markMessageAsRead = (messageId: string, userId: string) => {
  socket.emit("mark_as_read", { messageId, userId });
};

export const emitTypingStatus = (ticketId: string, isTyping: boolean) => {
  socket.emit("typing_status", { ticketId, isTyping });
};