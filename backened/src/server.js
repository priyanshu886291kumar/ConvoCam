

// import express from "express";
// import "dotenv/config";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import path from "path";
// import { createServer } from "http";
// import { Server } from "socket.io";

// import authRoutes from "./routes/auth.route.js";
// import userRoutes from "./routes/user.route.js";
// import chatRoutes from "./routes/chat.route.js";
// import messageRoutes from "./routes/message.route.js";
// import Message from "./models/Message.js";
// import { connectDB } from "./lib/db.js";

// const app = express();
// const PORT = process.env.PORT || 5000;
// const __dirname = path.resolve();

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );

// app.use(express.json());
// app.use(cookieParser());

// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/chat", chatRoutes);
// app.use("/api/messages", messageRoutes);

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../frontend/dist")));
//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
//   });
// }

// // --- Socket.io setup ---
// const server = createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     credentials: true,
//   },
// });

// const onlineUsers = new Set(); // <-- Added: Track online users

// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   socket.on("join", (userId) => {
//     socket.join(userId);
//   });




//   // 💬 Chat message event
//   socket.on("sendMessage", async (data) => {
//     try {
//       console.log("Received message data:", data);
//       const { senderId, receiverId, text, image } = data;
//       const message = new Message({ senderId, receiverId, text, image });
//       await message.save();
//       io.to(receiverId).emit("receiveMessage", message);
//       io.to(senderId).emit("receiveMessage", message);
//     } catch (err) {
//       console.error("Error saving message:", err);
//     }
//   });
//   // 📜 Fetch messages for infinite scroll
//   // 📞 Call request: User A wants to call User B
//   socket.on("call-user", ({ from, to }) => {
//     io.to(to).emit("incoming-call", { from });
//   });

//   // 🎥 WebRTC signaling events
//   socket.on("offer", (offer) => socket.broadcast.emit("offer", offer));
//   socket.on("answer", (answer) => socket.broadcast.emit("answer", answer));
//   socket.on("ice-candidate", (candidate) => socket.broadcast.emit("ice-candidate", candidate));

//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
//   });
// });

// server.listen(PORT, '0.0.0.0', () => {
//   console.log(`Server is running on port ${PORT}`);
//   connectDB();
// });









import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import messageRoutes from "./routes/message.route.js";
import Message from "./models/Message.js";
import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// --- Socket.io setup ---
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

const onlineUsers = new Set(); // Track online users
const userSocketMap = {};      // userId -> socket.id

io.on("connection", (socket) => {
  // Get userId from handshake query or from a custom event
  let userId = socket.handshake.query.userId;
  if (!userId) {
    socket.on("join", (id) => {
      userId = id;
      onlineUsers.add(userId);
      userSocketMap[userId] = socket.id;
      io.emit("online-users", Array.from(onlineUsers));
    });
  } else {
    onlineUsers.add(userId);
    userSocketMap[userId] = socket.id;
    io.emit("online-users", Array.from(onlineUsers));
  }

  // 💬 Chat message event
  socket.on("sendMessage", async (data) => {
    try {
      console.log("Received message data:", data);
      const { senderId, receiverId, text, image } = data;
      const message = new Message({ senderId, receiverId, text, image });
      await message.save();

      // Emit to receiver's socket only if online
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", message);
      }
      // Optionally, emit to sender for confirmation
      socket.emit("receiveMessage", message);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  // --- TYPING INDICATOR LOGIC ---
  socket.on("typing", ({ senderId, receiverId, isTyping }) => {
      console.log("Server received typing:", senderId, receiverId, isTyping);
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId, isTyping });
    }
  });


  // 📞 Call request: User A wants to call User B
  socket.on("call-user", ({ from, to }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incoming-call", { from });
    }
  });

  // 🎥 WebRTC signaling events
  socket.on("offer", (offer) => socket.broadcast.emit("offer", offer));
  socket.on("answer", (answer) => socket.broadcast.emit("answer", answer));
  socket.on("ice-candidate", (candidate) => socket.broadcast.emit("ice-candidate", candidate));

  socket.on("disconnect", () => {
    if (userId) {
      onlineUsers.delete(userId);
      delete userSocketMap[userId];
      io.emit("online-users", Array.from(onlineUsers));
    }
    console.log("User disconnected:", socket.id);
  });
});

// API endpoint to get online users
app.get("/online-users", (req, res) => {
  res.json({ online: Array.from(onlineUsers) });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();  
});
