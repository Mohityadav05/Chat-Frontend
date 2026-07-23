import React, { useState, useEffect, useContext } from "react";
import { Search, X, Users, Check } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function NewGroupModal({ isOpen, onClose, onSelectConversation }) {
  const { API_URL } = useContext(AuthContext);
  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedUserIds([]);
      setGroupName("");
      return;
    }
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

  const toggleUser = (id) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds((prev) => prev.filter((item) => item !== id));
    } else {
      setSelectedUserIds((prev) => [...prev, id]);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      alert("Please enter a group name");
      return;
    }
    if (selectedUserIds.length === 0) {
      alert("Please select at least 1 member for the group");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/api/conversations/group`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupName: groupName.trim(),
          memberIds: selectedUserIds,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        onSelectConversation(data.conversation);
        onClose();
      } else {
        alert(data.message || "Failed to create group");
      }
    } catch (err) {
      console.error("Create group error:", err);
    } finally {
      setCreating(false);
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
          <Users className="w-5 h-5 text-[#0052FF]" /> Create New Group
        </h2>
        <p className="text-xs text-slate-400 mb-5">Set a group name and invite members to collaborate.</p>

        <form onSubmit={handleCreateGroup}>
          <div className="mb-4">
            <label className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
              Group Name
            </label>
            <input
              type="text"
              placeholder="e.g. Design Team, Friends Circle"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
              className="w-full h-10 px-3.5 bg-[#181a26] border border-[#2a2e42] text-white text-sm rounded-xl focus:outline-none focus:border-[#0052FF] placeholder-slate-500 font-medium"
            />
          </div>

          <div className="mb-2">
            <label className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
              Select Members ({selectedUserIds.length} selected)
            </label>
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-4 bg-[#181a26] border border-[#2a2e42] text-white text-xs rounded-xl focus:outline-none focus:border-[#0052FF] placeholder-slate-500 font-medium"
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 custom-scroll pr-1 mb-6">
            {loading ? (
              <p className="text-center font-mono text-xs text-slate-400 py-4">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="text-center font-mono text-xs text-slate-400 py-4">No users found.</p>
            ) : (
              users.map((u) => {
                const isSelected = selectedUserIds.includes(u._id);
                return (
                  <div
                    key={u._id}
                    onClick={() => toggleUser(u._id)}
                    className={`flex items-center gap-3 p-2.5 border rounded-xl cursor-pointer transition ${
                      isSelected
                        ? "bg-[#0052FF]/20 border-[#0052FF]"
                        : "bg-[#181a26] border-transparent hover:bg-white/5"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full btn-gradient flex items-center justify-center text-white font-bold text-xs overflow-hidden shadow-sm">
                      {u.avatar ? (
                        <img src={`${API_URL}/${u.avatar}`} alt={u.name} className="w-full h-full object-cover" />
                      ) : (
                        u.name ? u.name.charAt(0).toUpperCase() : "U"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate">{u.name}</h4>
                      <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                        isSelected ? "btn-gradient border-[#0052FF] text-white" : "border-slate-600"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full h-11 btn-gradient text-white font-semibold text-sm rounded-xl transition-all shadow-accent hover:shadow-accent-lg hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center disabled:opacity-50"
          >
            {creating ? "Creating Group..." : "Create Group"}
          </button>
        </form>
      </div>
    </div>
  );
}
