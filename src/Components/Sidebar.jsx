import React, { useState, useContext } from "react";
import { Search, Plus, Users, MessageSquare, LogOut, Sun, Moon } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";

export default function Sidebar({
  conversations,
  selectedConversation,
  onSelectConversation,
  onOpenNewChat,
  onOpenNewGroup,
  onOpenProfile,
  theme,
  onToggleTheme,
}) {
  const { user, logoutUser, API_URL } = useContext(AuthContext);
  const { onlineUsers } = useContext(SocketContext);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredConversations = conversations.filter((c) => {
    if (filter === "direct" && c.type !== "direct") return false;
    if (filter === "groups" && c.type !== "group") return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      if (c.type === "group") {
        return c.groupName?.toLowerCase().includes(q);
      } else {
        const other = c.members?.find((m) => m._id !== user?._id);
        return (
          other?.name?.toLowerCase().includes(q) ||
          other?.email?.toLowerCase().includes(q)
        );
      }
    }
    return true;
  });

  const getConversationDetails = (c) => {
    if (c.type === "group") {
      return {
        name: c.groupName || "Group Chat",
        avatar: c.groupAvatar,
        isOnline: false,
        memberCount: c.members?.length || 0,
      };
    } else {
      const other = c.members?.find((m) => m._id !== user?._id);
      const isOnline = other ? onlineUsers.includes(other._id?.toString()) : false;
      return {
        name: other?.name || "User",
        avatar: other?.avatar,
        isOnline,
        email: other?.email,
      };
    }
  };

  return (
    <div className="w-full md:w-80 lg:w-96 h-full bg-[#121420] border-r border-[#232636] flex flex-col flex-shrink-0 z-20 font-sans">
      {/* Top App Header */}
      <div className="p-4.5 border-b border-[#232636] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl btn-gradient flex items-center justify-center shadow-accent">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-serif tracking-tight text-white">Utalk</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenNewChat}
            title="New Direct Message"
            className="p-2.5 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={onOpenNewGroup}
            title="New Group Chat"
            className="p-2.5 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition"
          >
            <Users className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Bar & Monospace Filter Tabs */}
      <div className="p-4 space-y-3.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-[#181a26] border border-[#2a2e42] text-white text-xs rounded-xl focus:outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] placeholder-slate-500 font-medium"
          />
        </div>

        {/* Monospace Filter Chips */}
        <div className="flex gap-2">
          {["all", "direct", "groups"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg font-mono text-[11px] uppercase tracking-wider transition ${
                filter === tab
                  ? "btn-gradient text-white font-semibold shadow-accent"
                  : "bg-[#181a26] text-slate-400 hover:text-white border border-[#2a2e42]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto custom-scroll px-2.5 space-y-1.5">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3 opacity-40" />
            <p className="text-xs text-slate-400 font-medium mb-2">No conversations found</p>
            <button
              onClick={onOpenNewChat}
              className="text-xs font-mono uppercase tracking-wider text-[#4D7CFF] hover:underline"
            >
              + Start new conversation
            </button>
          </div>
        ) : (
          filteredConversations.map((c) => {
            const { name, avatar, isOnline, memberCount } = getConversationDetails(c);
            const isSelected = selectedConversation?._id === c._id;
            const lastMsg = c.lastMessage;

            return (
              <div
                key={c._id}
                onClick={() => onSelectConversation(c)}
                className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3.5 border ${
                  isSelected
                    ? "bg-[#0052FF]/15 border-[#0052FF]/40 shadow-sm"
                    : "bg-transparent border-transparent hover:bg-white/5"
                }`}
              >
                {/* Avatar with Animated Online Dot */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#0052FF] to-[#4D7CFF] flex items-center justify-center text-white font-bold overflow-hidden shadow-sm">
                    {avatar ? (
                      <img src={`${API_URL}/${avatar}`} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      name.charAt(0).toUpperCase()
                    )}
                  </div>
                  {c.type === "direct" && isOnline && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#121420] rounded-full shadow-sm"></span>
                  )}
                </div>

                {/* Conversation Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-sm font-semibold text-white truncate">{name}</h4>
                    {lastMsg?.createdAt && (
                      <span className="font-mono text-[10px] text-slate-500">
                        {new Date(lastMsg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate">
                    {lastMsg ? (
                      lastMsg.attachment?.url ? "📎 [Attachment]" : lastMsg.message
                    ) : c.type === "group" ? (
                      `${memberCount} members`
                    ) : (
                      "Click to chat"
                    )}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* User Footer Profile & Settings */}
      <div className="p-3.5 border-t border-[#232636] bg-[#0e101a] flex items-center justify-between">
        <div
          onClick={onOpenProfile}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition min-w-0"
        >
          <div className="w-9 h-9 rounded-full btn-gradient flex items-center justify-center text-white font-bold overflow-hidden shrink-0 shadow-accent">
            {user?.avatar ? (
              <img src={`${API_URL}/${user.avatar}`} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name ? user.name.charAt(0).toUpperCase() : "U"
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-white truncate">{user?.name}</h4>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onToggleTheme}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
            title="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={logoutUser}
            className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5 transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
