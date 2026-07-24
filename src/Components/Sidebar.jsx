import React, { useState } from "react";
import { Search, Plus, Users, MessageSquare, LogOut, Sun, Moon, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";

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
  const { user, logoutUser, API_URL } = useAuth();
  const { onlineUsers } = useSocket();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const directCount = conversations.filter((c) => c.type === "direct").length;
  const groupCount = conversations.filter((c) => c.type === "group").length;

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
    <div className="w-full md:w-80 lg:w-96 h-full bg-[#121420] border-r border-[#232636] flex flex-col flex-shrink-0 z-20 font-sans select-none">
      {/* Top App Branding Header */}
      <div className="p-4 border-b border-[#232636] flex items-center justify-between bg-[#0e101a]/80 backdrop-blur-md">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={onOpenProfile}>
          <div className="w-10 h-10 rounded-xl btn-gradient flex items-center justify-center shadow-accent group-hover:scale-105 transition-transform">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-serif tracking-tight text-white block leading-none">Utalk</span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Connected
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenNewChat}
            title="New Direct Message"
            className="p-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10 active:scale-95"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={onOpenNewGroup}
            title="New Group Chat"
            className="p-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10 active:scale-95"
          >
            <Users className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Bar & Monospace Filter Chips */}
      <div className="p-4 space-y-3.5 bg-[#121420]">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-9 bg-[#181a26] border border-[#2a2e42] text-white text-xs rounded-xl focus:outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] placeholder-slate-500 font-medium transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Chips with Count Badges */}
        <div className="flex gap-2">
          {[
            { id: "all", label: "All", count: conversations.length },
            { id: "direct", label: "Direct", count: directCount },
            { id: "groups", label: "Groups", count: groupCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex-1 py-1.5 px-2.5 rounded-lg font-mono text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                filter === tab.id
                  ? "btn-gradient text-white font-semibold shadow-accent"
                  : "bg-[#181a26] text-slate-400 hover:text-white border border-[#2a2e42]"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filter === tab.id ? "bg-white/20 text-white" : "bg-white/5 text-slate-400"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto custom-scroll px-3 space-y-1.5 py-1">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-14 px-4 bg-[#181a26]/40 rounded-2xl border border-dashed border-[#232636] my-4">
            <MessageSquare className="w-10 h-10 text-slate-500 mx-auto mb-3 opacity-30 animate-bounce" />
            <p className="text-xs text-slate-300 font-medium mb-1">No conversations found</p>
            <p className="text-[11px] text-slate-500 mb-3">Try clearing search or start a new chat</p>
            <button
              onClick={onOpenNewChat}
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#4D7CFF] hover:text-white px-3 py-1.5 rounded-lg bg-[#4D7CFF]/10 hover:bg-[#4D7CFF]/20 border border-[#4D7CFF]/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> New Chat
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
                className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3.5 border relative group ${
                  isSelected
                    ? "bg-[#0052FF]/15 border-[#0052FF]/50 shadow-accent"
                    : "bg-[#181a26]/50 border-transparent hover:bg-white/5 hover:border-white/5"
                }`}
              >
                {/* Selected Accent Bar */}
                {isSelected && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#0052FF] rounded-r-full"></div>
                )}

                {/* Avatar with Animated Online Dot */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#0052FF] to-[#4D7CFF] flex items-center justify-center text-white font-bold overflow-hidden shadow-sm border border-white/10">
                    {avatar ? (
                      <img src={`${API_URL}/${avatar}`} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      name.charAt(0).toUpperCase()
                    )}
                  </div>
                  {c.type === "direct" && isOnline && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#121420] rounded-full online-pulse"></span>
                  )}
                </div>

                {/* Conversation Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-sm font-semibold text-white truncate group-hover:text-indigo-200 transition-colors">
                      {name}
                    </h4>
                    {lastMsg?.createdAt && (
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">
                        {new Date(lastMsg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                    {lastMsg ? (
                      lastMsg.attachment?.url ? (
                        <span className="text-indigo-400 font-medium">📎 Attachment</span>
                      ) : (
                        lastMsg.message
                      )
                    ) : c.type === "group" ? (
                      <span className="text-slate-500 font-mono text-[11px]">{memberCount} members</span>
                    ) : (
                      <span className="text-slate-500 italic">Click to open chat</span>
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
          className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition min-w-0 group"
          title="View & Edit Profile"
        >
          <div className="w-9 h-9 rounded-full btn-gradient flex items-center justify-center text-white font-bold overflow-hidden shrink-0 shadow-accent group-hover:scale-105 transition-transform">
            {user?.avatar ? (
              <img src={`${API_URL}/${user.avatar}`} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name ? user.name.charAt(0).toUpperCase() : "U"
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-white truncate group-hover:text-indigo-300">{user?.name}</h4>
            <p className="text-[11px] text-slate-400 truncate font-mono">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onToggleTheme}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition border border-transparent hover:border-white/10"
            title="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
          <button
            onClick={logoutUser}
            className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition border border-transparent hover:border-rose-500/20"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
