import React, { useState, useEffect, useContext } from "react";
import { Search, X, UserPlus, MessageSquare } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function NewChatModal({ isOpen, onClose, onSelectConversation }) {
  const { API_URL } = useContext(AuthContext);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetchUsers();
  }, [isOpen, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/search?search=${encodeURIComponent(search)}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const startChat = async (targetUser) => {
    try {
      const res = await fetch(`${API_URL}/api/conversations/direct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: targetUser._id }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        onSelectConversation(data.conversation);
        onClose();
      }
    } catch (err) {
      console.error("Error starting chat:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 font-sans">
      <div className="bg-[#13151f] border border-[#232636] w-full max-w-md rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-serif text-white mb-1 flex items-center gap-2.5">
          <UserPlus className="w-5 h-5 text-[#0052FF]" /> New Direct Message
        </h2>
        <p className="text-xs text-slate-400 mb-5">Search registered users to start chatting instantly.</p>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-[#181a26] border border-[#2a2e42] text-white text-sm rounded-xl focus:outline-none focus:border-[#0052FF] placeholder-slate-500 font-medium"
          />
        </div>

        {/* Users List */}
        <div className="max-h-64 overflow-y-auto space-y-2 custom-scroll pr-1">
          {loading ? (
            <p className="text-center font-mono text-xs text-slate-400 py-8">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-center font-mono text-xs text-slate-400 py-8">No users found.</p>
          ) : (
            users.map((u) => (
              <div
                key={u._id}
                onClick={() => startChat(u)}
                className="flex items-center gap-3.5 p-3 bg-[#181a26] hover:bg-[#0052FF]/15 border border-transparent hover:border-[#0052FF]/30 rounded-xl cursor-pointer transition"
              >
                <div className="w-10 h-10 rounded-full btn-gradient flex items-center justify-center text-white font-bold overflow-hidden text-sm shadow-accent">
                  {u.avatar ? (
                    <img src={`${API_URL}/${u.avatar}`} alt={u.name} className="w-full h-full object-cover" />
                  ) : (
                    u.name ? u.name.charAt(0).toUpperCase() : "U"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">{u.name}</h4>
                  <p className="text-xs text-slate-400 truncate">{u.email}</p>
                </div>
                <MessageSquare className="w-4 h-4 text-[#4D7CFF]" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
