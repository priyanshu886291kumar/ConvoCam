import { useEffect, useRef, useState, useCallback } from "react";
import { useChatStore } from "../store/useChatStore";
import useAuthUser from "../hooks/useAuthUser";
import { useSocket } from "../hooks/useSocket";
import { useParams, useNavigate } from "react-router";
import { axiosInstance } from "../lib/axios";
import ChatHeader from "./ChatHeader";
import {
  Send,
  Sparkles,
  Volume2,
  Mic,
  MicOff,
  Paperclip,
  Smile,
  Video,
} from "lucide-react";
import Avatar from "./Avatar";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const { id: selectedUserId } = useParams();
  const { authUser: currentUser } = useAuthUser();
  const socket = useSocket(currentUser?._id);
  const navigate = useNavigate();

  const {
    messages,
    isMessagesLoading,
    setSelectedUser,
    selectedUser,
    getMessages,
    addMessage,
  } = useChatStore();

  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isFriendTyping, setIsFriendTyping] = useState(false);
  const [smartReplies, setSmartReplies] = useState([]);
  const [translationLanguage, setTranslationLanguage] = useState("english");
  const [translations, setTranslations] = useState({});
  const [onlineUsersList, setOnlineUsersList] = useState([]);

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  // Fetch online users from backend periodically
  useEffect(() => {
    const fetchOnline = () => {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/online-users`)
        .then((res) => res.json())
        .then((data) => setOnlineUsersList(data.online || []))
        .catch(() => {});
    };
    fetchOnline();
    const interval = setInterval(fetchOnline, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch smart replies for a given text
  const fetchSmartReplies = useCallback(async (text) => {
    if (!text || text.trim() === "") return;
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/gemini/suggest-replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSmartReplies(data.suggestions);
      }
    } catch (err) {
      console.warn("Smart replies fetch error:", err);
    }
  }, []);

  // Text-to-Speech audio pronunciation
  const speakText = (text, lang = "en-US") => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // stop current utterance
      const utterance = new SpeechSynthesisUtterance(text);
      if (lang === "hindi") utterance.lang = "hi-IN";
      else if (lang === "spanish") utterance.lang = "es-ES";
      else if (lang === "french") utterance.lang = "fr-FR";
      else if (lang === "bengali") utterance.lang = "bn-IN";
      else utterance.lang = "en-US";

      utterance.rate = 0.9; // clear pacing for learners
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Text-to-speech not supported in this browser.");
    }
  };

  const uploadFile = async () => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setFile(null);
    return data.url;
  };

  const sendMessage = async (customText) => {
    const textToSend = customText !== undefined ? customText : input;
    if ((textToSend.trim() || file) && currentUser && selectedUser) {
      let fileUrl = null;
      if (file) fileUrl = await uploadFile();

      socket.emit("sendMessage", {
        senderId: currentUser._id,
        receiverId: selectedUser._id,
        text: textToSend,
        file: fileUrl,
      });

      setInput("");
      setFile(null);
      setSmartReplies([]);
    }
  };

  // Voice Typing (Speech to Text)
  const toggleListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice typing is not supported in this browser. Try Chrome/Edge!");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedUser?.learningLanguage || "en-US";
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        toast.success("Voice captured!");
      };

      recognition.onerror = (err) => {
        console.warn("Speech recognition error:", err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast("Listening... Speak now!", { icon: "🎙️" });
      } catch {
        setIsListening(false);
      }
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
    if (currentUser && selectedUser) {
      getMessages(currentUser._id);
    }
  }, [currentUser, selectedUser, getMessages]);

  // Load smart replies for the latest incoming message when chat opens
  useEffect(() => {
    if (messages && messages.length > 0 && selectedUser) {
      const lastMsg = [...messages].reverse().find((m) => m.senderId === selectedUser._id && m.text);
      if (lastMsg && lastMsg.text) {
        fetchSmartReplies(lastMsg.text);
      }
    }
  }, [messages, selectedUser, fetchSmartReplies]);

  useEffect(() => {
    if (!socket) return;

    const handleReceive = async (msg) => {
      const isCurrentChat =
        (msg.senderId === currentUser._id && msg.receiverId === selectedUser?._id) ||
        (msg.senderId === selectedUser?._id && msg.receiverId === currentUser._id);

      if (isCurrentChat) {
        addMessage(msg);

        // For friend's latest message
        if (msg.senderId === selectedUser?._id && msg.text) {
          fetchSmartReplies(msg.text);

          // Translation
          if (translationLanguage !== "english") {
            try {
              const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/translate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: msg.text, targetLang: translationLanguage }),
              });
              const data = await res.json();
              setTranslations((prev) => ({
                ...prev,
                [msg._id]: data.translated || "",
              }));
            } catch (err) {
              console.error("Translation error:", err);
            }
          }
        }
      }
    };

    const handleTyping = ({ senderId, isTyping }) => {
      if (senderId === selectedUser?._id) setIsFriendTyping(isTyping);
    };

    socket.on("receiveMessage", handleReceive);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("receiveMessage", handleReceive);
      socket.off("typing", handleTyping);
    };
  }, [socket, currentUser, selectedUser, translationLanguage, addMessage, fetchSmartReplies]);

  const handleVideoCall = () => {
    if (selectedUser) {
      navigate(`/call/${selectedUser._id}`, { state: { isCaller: true } });
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentUser || !selectedUser) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-base-100 h-full">
      <div className="relative flex flex-col h-full">
        {/* Header with Prominent Video Call Button */}
        <ChatHeader
          selectedUser={selectedUser}
          onlineUsers={onlineUsersList}
          onVideoCall={handleVideoCall}
        />

        {/* Language Selector Bar */}
        <div className="px-4 py-2 border-b border-base-300 bg-base-200/50 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="opacity-75 font-medium">🌐 Auto-Translate Incoming To:</span>
            <select
              className="select select-bordered select-xs sm:select-sm font-medium"
              value={translationLanguage}
              onChange={(e) => setTranslationLanguage(e.target.value)}
            >
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
              <option value="spanish">Spanish</option>
              <option value="french">French</option>
              <option value="bengali">Bengali</option>
            </select>
          </div>
        </div>

        {/* Chat Messages Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-100">
          {isMessagesLoading ? (
            <div className="p-8 text-center opacity-60">⏳ Loading conversations...</div>
          ) : messages.length > 0 ? (
            <>
              {messages.map((message, idx) => {
                const isMe = message.senderId === currentUser._id;
                return (
                  <div
                    key={message._id || idx}
                    className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                    ref={idx === messages.length - 1 ? messagesEndRef : null}
                  >
                    {!isMe && (
                      <Avatar
                        src={selectedUser?.profilePic}
                        name={selectedUser?.fullName}
                        size="xs"
                        className="mb-1 shrink-0"
                      />
                    )}
                    <div
                      className={`relative group rounded-2xl px-4 py-2.5 max-w-sm sm:max-w-md break-words shadow-sm ${
                        isMe
                          ? "bg-primary text-primary-content rounded-tr-none"
                          : "bg-base-200 text-base-content rounded-tl-none border border-base-300"
                      }`}
                    >
                      {message.text && (
                        message.text.startsWith("📹") ? (
                          <div className="flex items-center gap-3 py-1 pr-2">
                            <div
                              className={`p-2.5 rounded-full shrink-0 ${
                                message.text.includes("Missed")
                                  ? "bg-error/20 text-error"
                                  : "bg-success/20 text-success"
                              }`}
                            >
                              <Video className="size-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs sm:text-sm leading-tight">
                                {message.text.includes("Missed") ? "Missed Video Call" : "Video Call"}
                              </div>
                              <div className="text-[11px] opacity-80 mt-0.5 font-medium">
                                {message.text.replace("📹 ", "")}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-sm sm:text-base leading-relaxed">{message.text}</span>
                              {/* Audio Pronunciation (TTS) Button */}
                              <button
                                onClick={() => speakText(message.text, "en-US")}
                                className="opacity-0 group-hover:opacity-100 hover:scale-110 transition-opacity p-0.5 rounded text-current opacity-70"
                                title="Listen to pronunciation (TTS)"
                              >
                                <Volume2 className="size-3.5" />
                              </button>
                            </div>

                            {/* Translated text if available */}
                            {!isMe &&
                              translations[message._id] &&
                              translationLanguage !== "english" && (
                                <div className="text-xs text-info font-medium bg-info/10 p-1.5 rounded flex items-center justify-between gap-2">
                                  <span>🌐 {translations[message._id]}</span>
                                  <button
                                    onClick={() => speakText(translations[message._id], translationLanguage)}
                                    className="hover:scale-110 p-0.5"
                                    title="Listen to translation pronunciation"
                                  >
                                    <Volume2 className="size-3" />
                                  </button>
                                </div>
                              )}
                          </div>
                        )
                      )}

                      {/* File attachment */}
                      {message.file && (
                        <div className="mt-2">
                          {message.file.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img
                              src={message.file}
                              alt="Attachment"
                              className="rounded-lg max-h-56 max-w-full object-cover border border-base-300"
                            />
                          ) : (
                            <a
                              href={message.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 bg-base-100/50 rounded-lg text-xs underline font-medium"
                            >
                              <Paperclip className="size-3.5" />
                              View Attachment
                            </a>
                          )}
                        </div>
                      )}

                      <span className="block text-[10px] text-right mt-1 opacity-60">
                        {new Date(message.createdAt || Date.now()).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {isMe && (
                      <Avatar
                        src={currentUser?.profilePic}
                        name={currentUser?.fullName}
                        size="xs"
                        className="mb-1 shrink-0"
                      />
                    )}
                  </div>
                );
              })}

              {isFriendTyping && (
                <div className="flex items-center gap-2 text-xs text-primary font-medium pl-2">
                  <span className="loading loading-dots loading-xs" />
                  <span>{selectedUser.fullName} is typing...</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60 space-y-2">
              <div className="avatar">
                <div className="w-16 rounded-full ring-2 ring-primary">
                  <img
                    src={selectedUser.profilePic || "https://api.dicebear.com/9.x/avataaars/svg?seed=new"}
                    alt={selectedUser.fullName}
                  />
                </div>
              </div>
              <h4 className="font-semibold text-lg">{selectedUser.fullName}</h4>
              <p className="text-sm">Start your language practice! Say hello or tap a smart reply below.</p>
            </div>
          )}
        </div>

        {/* AI Smart Replies Chips */}
        {smartReplies.length > 0 && (
          <div className="px-4 py-2 flex items-center gap-2 bg-base-200/80 border-t border-base-300 overflow-x-auto scrollbar-none">
            <span className="flex items-center gap-1 text-xs font-semibold text-primary shrink-0">
              <Sparkles className="size-3.5" />
              Smart Replies:
            </span>
            {smartReplies.map((reply, idx) => (
              <button
                key={idx}
                className="badge badge-primary badge-outline hover:badge-primary text-xs cursor-pointer py-3 px-3.5 transition-all shrink-0 active:scale-95"
                onClick={() => sendMessage(reply)}
                title="Click to send smart reply"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* Message Input & Actions Area */}
        <div className="p-3 border-t border-base-300 bg-base-100 flex items-center gap-2">
          {/* File Attachment Input */}
          <label className="btn btn-ghost btn-circle btn-sm shrink-0 cursor-pointer" title="Attach image or file">
            <Paperclip className="size-5 text-base-content/70" />
            <input type="file" onChange={handleFileChange} className="hidden" />
          </label>

          {/* Text Input */}
          <input
            className="input input-bordered input-md flex-1 rounded-full px-4 text-sm"
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={isListening ? "Listening to your voice..." : "Type a message..."}
          />

          {/* Voice Typing (Audio / Microphone) */}
          <button
            className={`btn btn-circle btn-sm shrink-0 ${
              isListening ? "btn-error animate-pulse shadow-md" : "btn-ghost"
            }`}
            onClick={toggleListening}
            title={isListening ? "Stop Voice Typing" : "Start Voice-to-Text Typing"}
          >
            {isListening ? (
              <MicOff className="size-5 text-white" />
            ) : (
              <Mic className="size-5 text-base-content/70" />
            )}
          </button>

          {/* Send Message Button */}
          <button
            className="btn btn-primary btn-circle btn-sm shrink-0 shadow-md"
            onClick={() => sendMessage()}
            title="Send Message"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;