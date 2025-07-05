import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export const useSocket = (userId) => {
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io("http://localhost:5001");
    if (userId) {
      socketRef.current.emit("join", userId);
    }
    return () => {
      socketRef.current.disconnect();
    };
  }, [userId]);

  return socketRef.current;
};