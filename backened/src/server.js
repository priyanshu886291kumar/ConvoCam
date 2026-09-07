import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import messageRoutes from "./routes/message.route.js";
import uploadRoutes from "./routes/upload.route.js";
import geminiRoutes from "./routes/gemini.route.js";
import translateRoute from "./routes/translate.js";

import Message from "./models/Message.js";
import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// Allowed origins for CORS (Local development + Production frontend URLs)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:5001",
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      process.env.NODE_ENV !== "production" ||
      /\.vercel\.app$/.test(new URL(origin).hostname) ||
      /\.onrender\.com$/.test(new URL(origin).hostname)
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/translate", translateRoute);

// SOCKET.IO Setup
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    credentials: true,
  },
});

const onlineUsers = new Set(); // To track online user IDs
const userSocketMap = {}; // Map userId to socket.id

io.on("connection", (socket) => {
  let userId = socket.handshake.query.userId;

  if (!userId) {
    socket.on("join", (id) => {
      userId = id;
      onlineUsers.add(userId);
      userSocketMap[userId] = socket.id;
      console.log(`✅ User ${userId} connected with socket ID ${socket.id}`);
      io.emit("online-users", Array.from(onlineUsers));
    });
  } else {
    onlineUsers.add(userId);
    userSocketMap[userId] = socket.id;
    io.emit("online-users", Array.from(onlineUsers));
  }

  // Chat message handling (text + image + file)
  socket.on("sendMessage", async (data) => {
    try {
      console.log("📨 Received message:", data);
      const { senderId, receiverId, text, image, file } = data;

      const message = new Message({
        senderId,
        receiverId,
        text,
        image,
        file,
      });

      await message.save();

      // Emit to receiver (if online)
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", message);
      }

      // Emit to sender as confirmation
      socket.emit("receiveMessage", message);
    } catch (err) {
      console.error("❌ Error saving message:", err);
    }
  });

  // Typing indicator
  socket.on("typing", ({ senderId, receiverId, isTyping }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId, isTyping });
    }
  });

  // --- 📹 Socket.IO WebRTC Video Calling Signaling ---
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
    socket.to(roomId).emit("user-joined", { socketId: socket.id, userId });
  });

  socket.on("leave-room", (roomId) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room ${roomId}`);
    socket.to(roomId).emit("user-left", { socketId: socket.id, userId });
  });

  // Initiate call to user
  socket.on("call-user", ({ from, to }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incoming-call", { from });
    }
  });

  // WebRTC Offer
  socket.on("offer", ({ offer, roomId, to }) => {
    if (to && userSocketMap[to]) {
      io.to(userSocketMap[to]).emit("offer", { offer, roomId, from: userId });
    } else if (roomId) {
      socket.to(roomId).emit("offer", { offer, roomId, from: userId });
    }
  });

  // WebRTC Answer
  socket.on("answer", ({ answer, roomId, to }) => {
    if (to && userSocketMap[to]) {
      io.to(userSocketMap[to]).emit("answer", { answer, roomId, from: userId });
    } else if (roomId) {
      socket.to(roomId).emit("answer", { answer, roomId, from: userId });
    }
  });

  // WebRTC ICE Candidate
  socket.on("ice-candidate", ({ candidate, roomId, to }) => {
    if (to && userSocketMap[to]) {
      io.to(userSocketMap[to]).emit("ice-candidate", { candidate, roomId, from: userId });
    } else if (roomId) {
      socket.to(roomId).emit("ice-candidate", { candidate, roomId, from: userId });
    }
  });

  // End Call
  socket.on("end-call", ({ roomId, to }) => {
    if (to && userSocketMap[to]) {
      io.to(userSocketMap[to]).emit("call-ended", { roomId });
    } else if (roomId) {
      socket.to(roomId).emit("call-ended", { roomId });
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    if (userId) {
      onlineUsers.delete(userId);
      delete userSocketMap[userId];
      io.emit("online-users", Array.from(onlineUsers));
    }
    console.log("🔌 User disconnected:", socket.id);
  });
});

// API to fetch online users
app.get("/online-users", (req, res) => {
  res.json({ online: Array.from(onlineUsers) });
});

// Health check endpoint
app.get("/", (req, res) => {
  res.send("✅ ConvoCam backend is live and DB connected!");
});

// Start server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  connectDB();
});
