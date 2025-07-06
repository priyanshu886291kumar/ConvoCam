

import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import useAuthUser from "../hooks/useAuthUser";
import { useSocket } from "../hooks/useSocket";
import { useParams } from "react-router";
import { axiosInstance } from "../lib/axios";
import ChatHeader from "./ChatHeader";
import VideoCall from "./VideoCall";
import { Mic, MicOff,Send } from "lucide-react"; // 👈 Add this at the top


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
  } = useChatStore();

  const [input, setInput] = useState("");
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 🎤 Start or stop voice-to-text
  const toggleListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + " " + transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        if (isListening) recognition.start(); // keep listening
      };

      recognitionRef.current = recognition;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // 👤 Fetch selected user
  useEffect(() => {
    const fetchUser = async () => {
      if (!selectedUserId) return;
      const res = await axiosInstance.get(`/users/${selectedUserId}`);
      setSelectedUser(res.data);
    };
    fetchUser();
  }, [selectedUserId, setSelectedUser]);

  // 💬 Fetch chat messages
  useEffect(() => {
    if (currentUser && selectedUser) getMessages(currentUser._id);
  }, [currentUser, selectedUser, getMessages]);

  // 🔔 Handle incoming messages
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

    return () => {
      socket.off("receiveMessage", handleReceive);
    };
  }, [socket, currentUser, selectedUser, addMessage]);

  // 📤 Send message
  const sendMessage = () => {
    if (input.trim() && currentUser && selectedUser) {
      socket.emit("sendMessage", {
        senderId: currentUser._id,
        receiverId: selectedUser._id,
        text: input,
      });
      setInput("");
    }
  };

  // 🎥 Video call setup
  const handleVideoCall = () => {
    socket.emit("call-user", { from: currentUser._id, to: selectedUser._id });
    setShowVideoCall(true);
  };

  // 🎥 Listen for incoming call
  useEffect(() => {
    if (!socket) return;
    const handleIncomingCall = ({ from }) => {
      if (selectedUser && from === selectedUser._id) {
        setShowVideoCall(true);
      }
    };
    socket.on("incoming-call", handleIncomingCall);
    return () => {
      socket.off("incoming-call", handleIncomingCall);
    };
  }, [socket, selectedUser]);

  // ⬇️ Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentUser || !selectedUser) return null;

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-base-100">
      <ChatHeader
        selectedUser={selectedUser}
        onlineUsers={[]} // Replace with real online users
        onVideoCall={handleVideoCall}
      />

      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-100"
        onScroll={(e) => {
          if (e.target.scrollTop === 0 && !isMessagesLoading) {
            // Add pagination logic here if needed
          }
        }}
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
                className={`rounded-lg px-4 py-2 max-w-xs break-words shadow ${
                  message.senderId === currentUser._id
                    ? "bg-green-200 text-black"
                    : "bg-white text-black"
                }`}
              >
                <span>{message.text}</span>
                <span className="block text-xs text-right mt-1">
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
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

      {/* ✅ Input + Mic + Send */}
      <div className="p-2 border-t border-base-300 flex gap-2 bg-base-100">
        <input
          className="input input-bordered flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message or use voice 🎤"
        />

<button
  className={`btn ${isListening ? "btn-error" : "btn-secondary"}`}
  onClick={toggleListening}
  title={isListening ? "Stop listening" : "Start voice typing"}
>
  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
</button>
       <button
  className="btn btn-primary flex items-center gap-1"
  onClick={sendMessage}
  title="Send message"
>
  <Send className="w-4 h-4" />
  <span className="hidden sm:inline">Send</span>
</button>


      </div>

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




// import { useEffect, useRef, useState } from "react";
// import { useChatStore } from "../store/useChatStore";
// import useAuthUser from "../hooks/useAuthUser";
// import { useSocket } from "../hooks/useSocket";
// import { useParams } from "react-router";
// import { axiosInstance } from "../lib/axios";
// import ChatHeader from "./ChatHeader";
// import VideoCall from "./VideoCall";
// import { Mic, MicOff, Send } from "lucide-react";

// const ChatContainer = () => {
//   const { id: selectedUserId } = useParams();
//   const { authUser: currentUser } = useAuthUser();
//   const socket = useSocket(currentUser?._id);

//   const {
//     messages,
//     isMessagesLoading,
//     hasMore,
//     setSelectedUser,
//     selectedUser,
//     getMessages,
//     addMessage,
//   } = useChatStore();

//   const [input, setInput] = useState("");
//   const [showVideoCall, setShowVideoCall] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const recognitionRef = useRef(null);
//   const messagesEndRef = useRef(null);

//   // 🎤 Start or stop voice-to-text
//   const toggleListening = () => {
//     const SpeechRecognition =
//       window.SpeechRecognition || window.webkitSpeechRecognition;

//     if (!SpeechRecognition) {
//       alert("Speech Recognition is not supported in this browser.");
//       return;
//     }

//     if (!recognitionRef.current) {
//       const recognition = new SpeechRecognition();
//       recognition.lang = "en-US";
//       recognition.interimResults = false;
//       recognition.maxAlternatives = 1;

//       recognition.onresult = (event) => {
//         const transcript = event.results[0][0].transcript;
//         setInput((prev) => prev + " " + transcript);
//       };

//       recognition.onerror = (event) => {
//         console.error("Speech recognition error:", event.error);
//         setIsListening(false);
//       };

//       recognition.onend = () => {
//         if (isListening) recognition.start(); // keep listening
//       };

//       recognitionRef.current = recognition;
//     }

//     if (isListening) {
//       recognitionRef.current.stop();
//       setIsListening(false);
//     } else {
//       recognitionRef.current.start();
//       setIsListening(true);
//     }
//   };

//   // 👤 Fetch selected user
//   useEffect(() => {
//     const fetchUser = async () => {
//       if (!selectedUserId) return;
//       const res = await axiosInstance.get(`/users/${selectedUserId}`);
//       setSelectedUser(res.data);
//     };
//     fetchUser();
//   }, [selectedUserId, setSelectedUser]);

//   // 💬 Fetch chat messages
//   useEffect(() => {
//     if (currentUser && selectedUser) getMessages(currentUser._id);
//   }, [currentUser, selectedUser, getMessages]);

//   // 🔔 Handle incoming messages
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

//     return () => {
//       socket.off("receiveMessage", handleReceive);
//     };
//   }, [socket, currentUser, selectedUser, addMessage]);

//   // 📤 Send message
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

//   // 🎥 Video call setup
//   const handleVideoCall = () => {
//     socket.emit("call-user", { from: currentUser._id, to: selectedUser._id });
//     setShowVideoCall(true);
//   };

//   // 🎥 Listen for incoming call
//   useEffect(() => {
//     if (!socket) return;
//     const handleIncomingCall = ({ from }) => {
//       if (selectedUser && from === selectedUser._id) {
//         setShowVideoCall(true);
//       }
//     };
//     socket.on("incoming-call", handleIncomingCall);
//     return () => {
//       socket.off("incoming-call", handleIncomingCall);
//     };
//   }, [socket, selectedUser]);

//   // ⬇️ Scroll to bottom on new messages
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // 🟢 Infinite scroll: load more messages when scrolled to top
//   const handleScroll = (e) => {
//     if (
//       e.target.scrollTop === 0 &&
//       !isMessagesLoading &&
//       hasMore &&
//       messages.length > 0
//     ) {
//       const oldest = messages[0];
//       getMessages(currentUser._id, { before: oldest._id });
//     }
//   };

//   if (!currentUser || !selectedUser) return null;

//   return (
//     <div className="flex-1 flex flex-col overflow-auto bg-base-100">
//       <ChatHeader
//         selectedUser={selectedUser}
//         onlineUsers={[]} // Replace with real online users
//         onVideoCall={handleVideoCall}
//       />

//       <div
//         className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-100"
//         onScroll={handleScroll}
//         style={{ minHeight: 0 }}
//       >
//         {isMessagesLoading && messages.length === 0 ? (
//           <div>⏳ Loading...</div>
//         ) : messages.length > 0 ? (
//           <>
//             {isMessagesLoading && <div className="text-center">Loading more...</div>}
//             {messages.map((message, idx) => (
//               <div
//                 key={message._id || idx}
//                 className={`flex ${message.senderId === currentUser._id ? "justify-end" : "justify-start"}`}
//                 ref={idx === messages.length - 1 ? messagesEndRef : null}
//               >
//                 <div
//                   className={`rounded-lg px-4 py-2 max-w-xs break-words shadow ${
//                     message.senderId === currentUser._id
//                       ? "bg-green-200 text-black"
//                       : "bg-white text-black"
//                   }`}
//                 >
//                   <span>{message.text}</span>
//                   <span className="block text-xs text-right mt-1">
//                     {new Date(message.createdAt).toLocaleTimeString([], {
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })}
//                     {message.senderId === currentUser._id && (
//                       <>
//                         {message.status === "read" ? (
//                           <span style={{ color: "#34B7F1", marginLeft: 4 }}>✔✔</span>
//                         ) : message.status === "delivered" ? (
//                           <span style={{ color: "#999", marginLeft: 4 }}>✔✔</span>
//                         ) : (
//                           <span style={{ color: "#999", marginLeft: 4 }}>✔</span>
//                         )}
//                       </>
//                     )}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </>
//         ) : (
//           <div>💬 No messages yet.</div>
//         )}
//       </div>

//       {/* ✅ Input + Mic + Send */}
//       <div className="p-2 border-t border-base-300 flex gap-2 bg-base-100">
//         <input
//           className="input input-bordered flex-1"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//           placeholder="Type a message or use voice 🎤"
//         />

//         <button
//           className={`btn ${isListening ? "btn-error" : "btn-secondary"}`}
//           onClick={toggleListening}
//           title={isListening ? "Stop listening" : "Start voice typing"}
//         >
//           {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
//         </button>
//         <button
//           className="btn btn-primary flex items-center gap-1"
//           onClick={sendMessage}
//           title="Send message"
//         >
//           <Send className="w-4 h-4" />
//           <span className="hidden sm:inline">Send</span>
//         </button>
//       </div>

//       {showVideoCall && (
//         <VideoCall
//           currentUser={currentUser}
//           remoteUser={selectedUser}
//           onClose={() => setShowVideoCall(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default ChatContainer;