import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import NewChatModal from "./NewChatModal";
import NewGroupModal from "./NewGroupModal";
import ProfileModal from "./ProfileModal";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";

export default function Home() {
  const navigate = useNavigate();
  const { user, loading, API_URL } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Fetch Conversations List
  useEffect(() => {
    if (!user) return;
    fetchConversations();
  }, [user]);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_URL}/api/conversations`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error("Fetch conversations error:", err);
    }
  };

  // Listen to socket message updates to refresh conversation list order
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = () => {
      fetchConversations();
    };

    socket.on("receive_message", handleReceiveMessage);
    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#0b0c10] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-medium">Loading Utalk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-[#0b0c10] overflow-hidden font-sans">
      {/* Sidebar (Conversations List) */}
      <div
        className={`${
          selectedConversation ? "hidden md:flex" : "flex"
        } w-full md:w-auto h-full shrink-0`}
      >
        <Sidebar
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          onOpenNewChat={() => setIsNewChatOpen(true)}
          onOpenNewGroup={() => setIsNewGroupOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </div>

      {/* Main Chat Area */}
      <div
        className={`${
          !selectedConversation ? "hidden md:flex" : "flex"
        } flex-1 h-full min-w-0`}
      >
        <ChatWindow
          conversation={selectedConversation}
          onBack={() => setSelectedConversation(null)}
        />
      </div>

      {/* Modals */}
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onSelectConversation={handleSelectConversation}
      />
      <NewGroupModal
        isOpen={isNewGroupOpen}
        onClose={() => setIsNewGroupOpen(false)}
        onSelectConversation={handleSelectConversation}
      />
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}
