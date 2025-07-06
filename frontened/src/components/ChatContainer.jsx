

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

//   useEffect(() => {
//     const fetchUser = async () => {
//       if (!selectedUserId) return;
//       const res = await axiosInstance.get(`/users/${selectedUserId}`);
//       setSelectedUser(res.data);
//     };
//     fetchUser();
//   }, [selectedUserId, setSelectedUser]);

//   useEffect(() => {
//     if (currentUser && selectedUser) getMessages(currentUser._id);
//   }, [currentUser, selectedUser, getMessages]);

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

//   const handleVideoCall = () => {
//     socket.emit("call-user", { from: currentUser._id, to: selectedUser._id });
//     setShowVideoCall(true);
//   };

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

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   if (!currentUser || !selectedUser) return null;

//   return (
//     <div className="flex-1 flex flex-col overflow-hidden bg-base-100">
//       <div className="relative flex flex-col h-full">
        
//         {/* ✅ Sticky Chat Header */}
//         <div className="sticky top-0 z-20 bg-base-100 border-b border-base-300">
//           <ChatHeader
//             selectedUser={selectedUser}
//             onlineUsers={[]} // replace with real data if needed
//             onVideoCall={handleVideoCall}
//           />
//         </div>

//         {/* ✅ Scrollable Chat Messages */}
//         <div
//           className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-100"
//           onScroll={(e) => {
//             if (e.target.scrollTop === 0 && !isMessagesLoading) {
//               // Add pagination logic if needed
//             }
//           }}
//         >
//           {isMessagesLoading ? (
//             <div>⏳ Loading...</div>
//           ) : messages.length > 0 ? (
//             messages.map((message, idx) => (
//               <div
//                 key={message._id || idx}
//                 className={`flex ${
//                   message.senderId === currentUser._id
//                     ? "justify-end"
//                     : "justify-start"
//                 }`}
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
//             ))
//           ) : (
//             <div>💬 No messages yet.</div>
//           )}
//         </div>

//         {/* ✅ Input section */}
//         <div className="p-2 border-t border-base-300 flex gap-2 bg-base-100">
//           <input
//             className="input input-bordered flex-1"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//             placeholder="Type a message or use voice 🎤"
//           />

//           <button
//             className={`btn ${isListening ? "btn-error" : "btn-secondary"}`}
//             onClick={toggleListening}
//             title={isListening ? "Stop listening" : "Start voice typing"}
//           >
//             {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
//           </button>

//           <button
//             className="btn btn-primary flex items-center gap-1"
//             onClick={sendMessage}
//             title="Send message"
//           >
//             <Send className="w-4 h-4" />
//             <span className="hidden sm:inline">Send</span>
//           </button>
//         </div>

//         {/* ✅ Video Call Component */}
//         {showVideoCall && (
//           <VideoCall
//             currentUser={currentUser}
//             remoteUser={selectedUser}
//             onClose={() => setShowVideoCall(false)}
//           />
//         )}
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
import VideoCall from "./VideoCall";
import { Mic, MicOff, Send } from "lucide-react";

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
  const [isFriendTyping, setIsFriendTyping] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // --- Voice-to-text toggle ---
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

  // --- Emit typing event ---
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (socket && currentUser && selectedUser) {
      socket.emit("typing", {
        senderId: currentUser._id,
        receiverId: selectedUser._id,
        isTyping: true,
      });
      // Stop typing after 1.5s of inactivity
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing", {
          senderId: currentUser._id,
          receiverId: selectedUser._id,
          isTyping: false,
        });
      }, 1500);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!selectedUserId) return;
      const res = await axiosInstance.get(`/users/${selectedUserId}`);
      setSelectedUser(res.data);
    };
    fetchUser();
  }, [selectedUserId, setSelectedUser]);

  useEffect(() => {
    if (currentUser && selectedUser) getMessages(currentUser._id);
  }, [currentUser, selectedUser, getMessages]);

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

    // --- Listen for typing event ---
    const handleTyping = ({ senderId, isTyping }) => {
      if (senderId === selectedUser?._id) {
        setIsFriendTyping(isTyping);
      }
    };

    socket.on("receiveMessage", handleReceive);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("receiveMessage", handleReceive);
      socket.off("typing", handleTyping);
    };
  }, [socket, currentUser, selectedUser, addMessage]);

  const sendMessage = () => {
    if (input.trim() && currentUser && selectedUser) {
      socket.emit("sendMessage", {
        senderId: currentUser._id,
        receiverId: selectedUser._id,
        text: input,
      });
      setInput("");
      // Stop typing indicator immediately after sending
      socket.emit("typing", {
        senderId: currentUser._id,
        receiverId: selectedUser._id,
        isTyping: false,
      });
    }
  };

  const handleVideoCall = () => {
    socket.emit("call-user", { from: currentUser._id, to: selectedUser._id });
    setShowVideoCall(true);
  };

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentUser || !selectedUser) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-base-100">
      <div className="relative flex flex-col h-full">
        {/* ✅ Sticky Chat Header */}
        <div className="sticky top-0 z-20 bg-base-100 border-b border-base-300">
          <ChatHeader
            selectedUser={selectedUser}
            onlineUsers={[]} // replace with real data if needed
            onVideoCall={handleVideoCall}
          />
        </div>

        {/* ✅ Scrollable Chat Messages */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-100"
          onScroll={(e) => {
            if (e.target.scrollTop === 0 && !isMessagesLoading) {
              // Add pagination logic if needed
            }
          }}
        >
          {isMessagesLoading ? (
            <div>⏳ Loading...</div>
          ) : messages.length > 0 ? (
            <>
              {messages.map((message, idx) => (
                <div
                  key={message._id || idx}
                  className={`flex ${
                    message.senderId === currentUser._id
                      ? "justify-end"
                      : "justify-start"
                  }`}
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
              ))}
              {/* --- Typing indicator --- */}
              {isFriendTyping && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-500">{selectedUser.fullName} is typing...</span>
                  <span className="animate-bounce text-lg">💬</span>
                </div>
              )}
            </>
          ) : (
            <div>💬 No messages yet.</div>
          )}
        </div>

        {/* ✅ Input section */}
        <div className="p-2 border-t border-base-300 flex gap-2 bg-base-100">
          <input
            className="input input-bordered flex-1"
            value={input}
            onChange={handleInputChange}
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

        {/* ✅ Video Call Component */}
        {showVideoCall && (
          <VideoCall
            currentUser={currentUser}
            remoteUser={selectedUser}
            onClose={() => setShowVideoCall(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ChatContainer;