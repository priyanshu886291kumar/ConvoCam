import { useEffect, useState } from "react";
import { io } from "socket.io-client";

let socketInstance = null;

export const useSocket = (userId) => {
  const [socket, setSocket] = useState(socketInstance);

  useEffect(() => {
    if (!socketInstance) {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";
      socketInstance = io(backendUrl, {
        transports: ["websocket", "polling"],
        withCredentials: true,
        autoConnect: true,
      });
    }

    if (userId) {
      if (socketInstance.connected) {
        socketInstance.emit("join", userId);
      } else {
        const onConnect = () => {
          socketInstance.emit("join", userId);
        };
        socketInstance.on("connect", onConnect);
        return () => {
          socketInstance.off("connect", onConnect);
        };
      }
    }

    setSocket(socketInstance);
  }, [userId]);

  return socketInstance || socket;
};

export const getSocket = () => socketInstance;