





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
//   const [isFriendTyping, setIsFriendTyping] = useState(false);
//   const recognitionRef = useRef(null);
//   const messagesEndRef = useRef(null);
//   const typingTimeoutRef = useRef(null);

//   // --- Voice-to-text toggle ---
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

//   // --- Emit typing event ---
//   const handleInputChange = (e) => {
//     setInput(e.target.value);
//     if (socket && currentUser && selectedUser) {
//       socket.emit("typing", {
//         senderId: currentUser._id,
//         receiverId: selectedUser._id,
//         isTyping: true,
//       });
//       // Stop typing after 1.5s of inactivity
//       if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
//       typingTimeoutRef.current = setTimeout(() => {
//         socket.emit("typing", {
//           senderId: currentUser._id,
//           receiverId: selectedUser._id,
//           isTyping: false,
//         });
//       }, 1500);
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

//     // --- Listen for typing event ---
//     const handleTyping = ({ senderId, isTyping }) => {
//       if (senderId === selectedUser?._id) {
//         setIsFriendTyping(isTyping);
//       }
//     };

//     socket.on("receiveMessage", handleReceive);
//     socket.on("typing", handleTyping);

//     return () => {
//       socket.off("receiveMessage", handleReceive);
//       socket.off("typing", handleTyping);
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
//       // Stop typing indicator immediately after sending
//       socket.emit("typing", {
//         senderId: currentUser._id,
//         receiverId: selectedUser._id,
//         isTyping: false,
//       });
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
//             <>
//               {messages.map((message, idx) => (
//                 <div
//                   key={message._id || idx}
//                   className={`flex ${
//                     message.senderId === currentUser._id
//                       ? "justify-end"
//                       : "justify-start"
//                   }`}
//                   ref={idx === messages.length - 1 ? messagesEndRef : null}
//                 >
//                   <div
//                     className={`rounded-lg px-4 py-2 max-w-xs break-words shadow ${
//                       message.senderId === currentUser._id
//                         ? "bg-green-200 text-black"
//                         : "bg-white text-black"
//                     }`}
//                   >
//                     <span>{message.text}</span>
//                     <span className="block text-xs text-right mt-1">
//                       {new Date(message.createdAt).toLocaleTimeString([], {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}
//                       {message.senderId === currentUser._id && (
//                         <>
//                           {message.status === "read" ? (
//                             <span style={{ color: "#34B7F1", marginLeft: 4 }}>✔✔</span>
//                           ) : message.status === "delivered" ? (
//                             <span style={{ color: "#999", marginLeft: 4 }}>✔✔</span>
//                           ) : (
//                             <span style={{ color: "#999", marginLeft: 4 }}>✔</span>
//                           )}
//                         </>
//                       )}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//               {/* --- Typing indicator --- */}
//               {isFriendTyping && (
//                 <div className="flex items-center gap-2 mt-2">
//                   <span className="text-xs text-gray-500">{selectedUser.fullName} is typing...</span>
//                   <span className="animate-bounce text-lg">💬</span>
//                 </div>
//               )}
//             </>
//           ) : (
//             <div>💬 No messages yet.</div>
//           )}
//         </div>

//         {/* ✅ Input section */}
//         <div className="p-2 border-t border-base-300 flex gap-2 bg-base-100">
//           <input
//             className="input input-bordered flex-1"
//             value={input}
//             onChange={handleInputChange}
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
import { Mic, MicOff, Send, Paperclip } from "lucide-react";

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
  const [file, setFile] = useState(null); // ✅ file state
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isFriendTyping, setIsFriendTyping] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // 📂 Handle file change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // 📤 Upload file to backend
  const uploadFile = async () => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("http://localhost:5001/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setFile(null);
    return data.url; // Cloudinary file URL
  };

  
  // 📤 Send message
  const sendMessage = async () => {
    if ((input.trim() || file) && currentUser && selectedUser) {
      let fileUrl = null;
      if (file) {
        fileUrl = await uploadFile();
      }

      socket.emit("sendMessage", {
        senderId: currentUser._id,
        receiverId: selectedUser._id,
        text: input,
        file: fileUrl, // ✅ sending file url
      });

      setInput("");
      setFile(null);

      socket.emit("typing", {
        senderId: currentUser._id,
        receiverId: selectedUser._id,
        isTyping: false,
      });
    }
  };

  // 🎤 Voice-to-text
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
        if (isListening) recognition.start();
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

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (socket && currentUser && selectedUser) {
      socket.emit("typing", {
        senderId: currentUser._id,
        receiverId: selectedUser._id,
        isTyping: true,
      });
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
    if (!selectedUserId) return;
    axiosInstance.get(`/users/${selectedUserId}`).then((res) => {
      setSelectedUser(res.data);
    });
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
        {/* Chat Header */}
        <div className="sticky top-0 z-20 bg-base-100 border-b border-base-300">
          <ChatHeader selectedUser={selectedUser} onVideoCall={handleVideoCall} />
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-100">
          {isMessagesLoading ? (
            <div>⏳ Loading...</div>
          ) : messages.length > 0 ? (
            <>
              {messages.map((message, idx) => (
                <div
                  key={message._id || idx}
                  className={`flex ${
                    message.senderId === currentUser._id ? "justify-end" : "justify-start"
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
                    {message.text && <span>{message.text}</span>}

                    {/* ✅ File rendering */}
                    {message.file && (
                      <a href={message.file} target="_blank" rel="noopener noreferrer">
                        {message.file.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <img
                            src={message.file}
                            alt="file"
                            style={{ maxWidth: 200, marginTop: 8 }}
                          />
                        ) : (
                          <span className="text-blue-500 underline block mt-2">
                            📎 Download file
                          </span>
                        )}
                      </a>
                    )}

                    <span className="block text-xs text-right mt-1">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
              {isFriendTyping && (
                <div className="text-sm text-gray-500 mt-2">
                  {selectedUser.fullName} is typing...
                </div>
              )}
            </>
          ) : (
            <div>💬 No messages yet.</div>
          )}
        </div>

        {/* Input section */}
        <div className="p-2 border-t border-base-300 flex gap-2 bg-base-100 items-center">
          <input
            type="file"
            onChange={handleFileChange}
            className="file-input file-input-bordered"
          />
          <input
            className="input input-bordered flex-1"
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message"
          />

          <button
            className={`btn ${isListening ? "btn-error" : "btn-secondary"}`}
            onClick={toggleListening}
            title={isListening ? "Stop listening" : "Start voice typing"}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            className="btn btn-primary"
            onClick={sendMessage}
            title="Send message"
          >
            <Send className="w-4 h-4" />
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
    </div>
  );
};

export default ChatContainer;
