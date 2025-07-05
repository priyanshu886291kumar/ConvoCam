// import React, { useEffect, useRef, useState } from "react";
// import { useParams } from "react-router";
// import useAuthUser from "../hooks/useAuthUser";
// import { useSocket } from "../hooks/useSocket";
// import axios from "axios";

// const ChatPage = () => {
//   const { id: selectedUserId } = useParams();
//   const { authUser: currentUser } = useAuthUser();
//   const [selectedUser, setSelectedUser] = useState(null);
//   const socket = useSocket(currentUser?._id);
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const messagesEndRef = useRef(null);

//   // Fetch selected user's info
//   useEffect(() => {
//     const fetchUser = async () => {
//       if (!selectedUserId) return;
//       try {
//         const res = await axios.get(`/api/users/${selectedUserId}`);
//         setSelectedUser(res.data);
//       } catch (err) {
//         setSelectedUser(null);
//       }
//     };
//     fetchUser();
//   }, [selectedUserId]);

//   // Fetch chat history
//   useEffect(() => {
//     const fetchMessages = async () => {
//       if (!currentUser || !selectedUser) return;
//       setLoading(true);
//       try {
//         const res = await axios.get("/api/messages", {
//           params: {
//             userId: currentUser._id,
//             otherUserId: selectedUser._id,
//             limit: 20,
//           },
//         });
//         setMessages(Array.isArray(res.data) ? res.data : []);
//       } catch (err) {
//         setMessages([]);
//       }
//       setLoading(false);
//     };
//     fetchMessages();
//   }, [currentUser, selectedUser]);

//   // Listen for incoming messages
//   useEffect(() => {
//     if (!socket) return;
//     const handleReceive = (msg) => {
//       if (
//         (msg.senderId === currentUser._id && msg.receiverId === selectedUser._id) ||
//         (msg.senderId === selectedUser._id && msg.receiverId === currentUser._id)
//       ) {
//         setMessages((prev) => [...prev, msg]);
//       }
//     };
//     socket.on("receiveMessage", handleReceive);
//     return () => socket?.off("receiveMessage", handleReceive);
//   }, [socket, currentUser, selectedUser]);

//   // Send message
//   const sendMessage = () => {
//     if (input.trim() && currentUser && selectedUser) {
//       socket.emit("sendMessage", {
//         senderId: currentUser._id,
//         receiverId: selectedUser._id,
//         text: input,
//       });
//       setInput("");
//     }
//   };

//   // Scroll to bottom on new message
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   if (!currentUser || !selectedUser) {
//     return <div>👤 Select a user to start chatting.</div>;
//   }

//   return (
//     <div>
//       <h2>
//         Chat with {selectedUser.username} 💬
//       </h2>
//       <div style={{ height: 400, overflowY: "auto", border: "1px solid #eee", padding: 8, marginBottom: 8 }}>
//         {loading ? (
//           <div>Loading... ⏳</div>
//         ) : (
//           Array.isArray(messages) && messages.length > 0 ? (
//             messages.map((msg, idx) => (
//               <div
//                 key={idx}
//                 style={{
//                   textAlign: msg.senderId === currentUser._id ? "right" : "left",
//                   margin: "4px 0",
//                   color: msg.senderId === currentUser._id ? "#1976d2" : "#333",
//                 }}
//               >
//                 {msg.text} {msg.senderId === currentUser._id ? "🧑‍💻" : "👤"}
//               </div>
//             ))
//           ) : (
//             <div>No messages yet. ✉️</div>
//           )
//         )}
//         <div ref={messagesEndRef} />
//       </div>
//       <div style={{ display: "flex", gap: 8 }}>
//         <input
//           value={input}
//           onChange={e => setInput(e.target.value)}
//           onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
//           placeholder="Type a message... 😊"
//           style={{ flex: 1, padding: 8 }}
//         />
//         <button onClick={sendMessage} style={{ padding: "8px 16px" }}>
//           Send 🚀
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ChatPage;
// // Note: This code assumes you have a backend API set up to handle user and message requests.








import { useChatStore } from "../store/useChatStore";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";

const ChatPage = () => {
  const { selectedUser } = useChatStore();
  return (
    <div className="flex flex-1 h-full">
      {selectedUser ? <ChatContainer /> : <NoChatSelected />}
    </div>
  );
};

export default ChatPage;
