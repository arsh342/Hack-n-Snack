// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"],
  },
  transports: ["websocket"],
});

io.use((socket, next) => {
  const { userId, role, name } = socket.handshake.auth;
  if (!userId || !role || !name) {
    return next(new Error("Authentication error: Missing user details"));
  }
  socket.userId = userId;
  socket.role = role;
  socket.name = name;
  next();
});

io.on("connection", (socket) => {
  console.log(`User ${socket.userId} (${socket.role}) connected with name ${socket.name}`);

  socket.join(socket.userId); // Join user's room

  socket.on("send_message", (message, callback) => {
    io.to(message.recipient_id).emit("message", message);
    callback({ success: true });
  });

  socket.on("typing_status", (data) => {
    io.to(data.ticketId).emit("typing", { userId: socket.userId, ticketId: data.ticketId });
  });

  socket.on("mark_as_read", (data) => {
    io.to(data.messageId).emit("message_read", { messageId: data.messageId, readBy: [socket.userId] });
  });

  socket.on("disconnect", (reason) => {
    console.log(`User ${socket.userId} disconnected: ${reason}`);
  });
});

server.listen(3001, () => {
  console.log("Socket server running on port 3001");
});