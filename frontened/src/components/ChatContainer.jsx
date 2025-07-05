

// import { useEffect, useRef, useState } from "react";
// import { useChatStore } from "../store/useChatStore";
// import useAuthUser from "../hooks/useAuthUser";
// import { useSocket } from "../hooks/useSocket";
// import { useParams } from "react-router";
// import { axiosInstance } from "../lib/axios";
// import ChatHeader from "./ChatHeader";

// const ChatContainer = () => {
//   const { id: selectedUserId } = useParams();
//   const { authUser: currentUser } = useAuthUser();
//   const socket = useSocket(currentUser?._id);

//   const {
//     messages,
//     isMessagesLoading,
//     setSelectedUser,
//     selectedUser,
//     getMessages,
//     addMessage,
//     // Optionally: add pagination state here
//   } = useChatStore();

//   const [input, setInput] = useState("");
//   const messagesEndRef = useRef(null);

//   // 👤 Fetch selected user's info
//   useEffect(() => {
//     const fetchUser = async () => {
//       if (!selectedUserId) return;
//       const res = await axiosInstance.get(`/users/${selectedUserId}`);
//       setSelectedUser(res.data);
//     };
//     fetchUser();
//   }, [selectedUserId, setSelectedUser]);

//   // 💬 Fetch chat history
//   useEffect(() => {
//     if (currentUser && selectedUser) getMessages(currentUser._id);
//   }, [currentUser, selectedUser, getMessages]);

//   // 🔔 Listen for incoming messages and status updates
//   useEffect(() => {
//     if (!socket) return;
//     const handleReceive = (msg) => {
//       if (
//         (msg.senderId === currentUser._id && msg.receiverId === selectedUser?._id) ||
//         (msg.senderId === selectedUser?._id && msg.receiverId === currentUser._id)
//       ) {
//         addMessage(msg);
//       }
//     };
//     socket.on("receiveMessage", handleReceive);

//     // Listen for status updates (delivered/read)
//     socket.on("messageStatusUpdate", ({ messageId, status }) => {
//       // You should implement a method in your store to update message status by id
//       // updateMessageStatus(messageId, status);
//     });

//     return () => {
//       socket.off("receiveMessage", handleReceive);
//       socket.off("messageStatusUpdate");
//     };
//   }, [socket, currentUser, selectedUser, addMessage]);

//   // 📤 Send message
//   const sendMessage = async () => {
//     if (input.trim() && currentUser && selectedUser) {
//       socket.emit("sendMessage", {
//         senderId: currentUser._id,
//         receiverId: selectedUser._id,
//         text: input,
//       });
//       setInput("");
//     }
//   };

//   // ⬇️ Scroll to bottom on new message
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // 🟢 Example onlineUsers from your store or context
//   const onlineUsers = []; // Replace with your actual online users array

//   // Infinite scroll: load more messages when scrolled to top
//   const handleScroll = (e) => {
//     if (e.target.scrollTop === 0 && !isMessagesLoading) {
//       // Call your getMessages with pagination/skip logic here
//       // getMessages(selectedUser._id, { before: oldestMessageId });
//     }
//   };

//   if (!currentUser || !selectedUser) return null;

//   return (
//     <div className="flex-1 flex flex-col overflow-auto bg-base-100">
//       <ChatHeader selectedUser={selectedUser} onlineUsers={onlineUsers} />
//       <div
//         className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-100"
//         onScroll={handleScroll}
//         style={{ minHeight: 0 }}
//       >
//         {isMessagesLoading ? (
//           <div>⏳ Loading...</div>
//         ) : messages.length > 0 ? (
//           messages.map((message, idx) => (
//             <div
//               key={message._id || idx}
//               className={`flex ${message.senderId === currentUser._id ? "justify-end" : "justify-start"}`}
//               ref={idx === messages.length - 1 ? messagesEndRef : null}
//             >
//               <div
//                 className={`rounded-lg px-4 py-2 max-w-xs break-words shadow
//                   ${message.senderId === currentUser._id
//                     ? "bg-green-200 text-black" // Sender: WhatsApp green
//                     : "bg-white text-black" // Receiver: white
//                   }`}
//                 style={{ position: "relative" }}
//               >
//                 <span>{message.text}</span>
//                 <span className="block text-xs text-right mt-1">
//                   {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
//                   {/* ✅ Read/Delivered ticks */}
//                   {message.senderId === currentUser._id && (
//                     <>
//                       {message.status === "read" ? (
//                         <span style={{ color: "#34B7F1", marginLeft: 4 }}>✔✔</span>
//                       ) : message.status === "delivered" ? (
//                         <span style={{ color: "#999", marginLeft: 4 }}>✔✔</span>
//                       ) : (
//                         <span style={{ color: "#999", marginLeft: 4 }}>✔</span>
//                       )}
//                     </>
//                   )}
//                 </span>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div>💬 No messages yet.</div>
//         )}
//       </div>
//       {/* 📝 Input */}
//       <div className="p-2 border-t border-base-300 flex gap-2 bg-base-100">
//         <input
//           className="input input-bordered flex-1"
//           value={input}
//           onChange={e => setInput(e.target.value)}
//           onKeyDown={e => e.key === "Enter" && sendMessage()}
//           placeholder="Type a message... 😊"
//         />
//         <button className="btn btn-primary" onClick={sendMessage}>
//           Send 🚀
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ChatContainer;













import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import useAuthUser from "../hooks/useAuthUser";
import { useSocket } from "../hooks/useSocket";
import { useParams } from "react-router";
import { axiosInstance } from "../lib/axios";
import ChatHeader from "./ChatHeader";
import VideoCall from "./VideoCall"; // 👈 Create this component for WebRTC

const ChatContainer = () => {
  const { id: selectedUserId } = useParams();
  const { authUser: currentUser } = useAuthUser();
  const socket = useSocket(currentUser?._id);

  const {
    messages,
    isMessagesLoading,
    setSelectedUser,
    selectedUser,
    getMessages,
    addMessage,
    // Optionally: add pagination state here
  } = useChatStore();

  const [input, setInput] = useState("");
  const [showVideoCall, setShowVideoCall] = useState(false); // 🎥
  const messagesEndRef = useRef(null);

  // 👤 Fetch selected user's info
  useEffect(() => {
    const fetchUser = async () => {
      if (!selectedUserId) return;
      const res = await axiosInstance.get(`/users/${selectedUserId}`);
      setSelectedUser(res.data);
    };
    fetchUser();
  }, [selectedUserId, setSelectedUser]);

  // 💬 Fetch chat history
  useEffect(() => {
    if (currentUser && selectedUser) getMessages(currentUser._id);
  }, [currentUser, selectedUser, getMessages]);

  // 🔔 Listen for incoming messages and status updates
  useEffect(() => {
    if (!socket) return;
    const handleReceive = (msg) => {
      if (
        (msg.senderId === currentUser._id && msg.receiverId === selectedUser?._id) ||
        (msg.senderId === selectedUser?._id && msg.receiverId === currentUser._id)
      ) {
        addMessage(msg);
      }
    };
    socket.on("receiveMessage", handleReceive);

    // Listen for status updates (delivered/read)
    socket.on("messageStatusUpdate", ({ messageId, status }) => {
      // You should implement a method in your store to update message status by id
      // updateMessageStatus(messageId, status);
    });

    return () => {
      socket.off("receiveMessage", handleReceive);
      socket.off("messageStatusUpdate");
    };
  }, [socket, currentUser, selectedUser, addMessage]);

  // 📤 Send message
  const sendMessage = async () => {
    if (input.trim() && currentUser && selectedUser) {
      socket.emit("sendMessage", {
        senderId: currentUser._id,
        receiverId: selectedUser._id,
        text: input,
      });
      setInput("");
    }
  };

  // ⬇️ Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🟢 Example onlineUsers from your store or context
  const onlineUsers = []; // Replace with your actual online users array

  // Infinite scroll: load more messages when scrolled to top
  const handleScroll = (e) => {
    if (e.target.scrollTop === 0 && !isMessagesLoading) {
      // Call your getMessages with pagination/skip logic here
      // getMessages(selectedUser._id, { before: oldestMessageId });
    }
  };

  if (!currentUser || !selectedUser) return null;

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-base-100">
      <ChatHeader
        selectedUser={selectedUser}
        onlineUsers={onlineUsers}
        onVideoCall={() => setShowVideoCall(true)} // 🎥
      />
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-100"
        onScroll={handleScroll}
        style={{ minHeight: 0 }}
      >
        {isMessagesLoading ? (
          <div>⏳ Loading...</div>
        ) : messages.length > 0 ? (
          messages.map((message, idx) => (
            <div
              key={message._id || idx}
              className={`flex ${message.senderId === currentUser._id ? "justify-end" : "justify-start"}`}
              ref={idx === messages.length - 1 ? messagesEndRef : null}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-xs break-words shadow
                  ${message.senderId === currentUser._id
                    ? "bg-green-200 text-black" // Sender: WhatsApp green
                    : "bg-white text-black" // Receiver: white
                  }`}
                style={{ position: "relative" }}
              >
                <span>{message.text}</span>
                <span className="block text-xs text-right mt-1">
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {/* ✅ Read/Delivered ticks */}
                  {message.senderId === currentUser._id && (
                    <>
                      {message.status === "read" ? (
                        <span style={{ color: "#34B7F1", marginLeft: 4 }}>✔✔</span>
                      ) : message.status === "delivered" ? (
                        <span style={{ color: "#999", marginLeft: 4 }}>✔✔</span>
                      ) : (
                        <span style={{ color: "#999", marginLeft: 4 }}>✔</span>
                      )}
                    </>
                  )}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div>💬 No messages yet.</div>
        )}
      </div>
      {/* 📝 Input */}
      <div className="p-2 border-t border-base-300 flex gap-2 bg-base-100">
        <input
          className="input input-bordered flex-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Type a message... 😊"
        />
        <button className="btn btn-primary" onClick={sendMessage}>
          Send 🚀
        </button>
      </div>
      {/* 🎥 Video Call Modal/Component */}
      {showVideoCall && (
        <VideoCall
          currentUser={currentUser}
          remoteUser={selectedUser}
          onClose={() => setShowVideoCall(false)}
        />
      )}
    </div>
  );
};

export default ChatContainer;