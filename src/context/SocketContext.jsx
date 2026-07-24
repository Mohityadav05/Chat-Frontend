import React, { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, API_URL } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const newSocket = io(API_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      const userId = user._id || user.id;
      newSocket.emit("register", userId);
    });

    newSocket.on("online_users", (usersList) => {
      setOnlineUsers(usersList);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, API_URL]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
