import React, { useState, useContext } from "react";
import { X, Camera, User, Mail, Phone, Info } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateUser, API_URL } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [phonenumber, setPhonenumber] = useState(user?.phonenumber || "");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    user?.avatar ? `${API_URL}/${user.avatar}` : ""
  );
  const [saving, setSaving] = useState(false);

  if (!isOpen || !user) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("bio", bio);
    formData.append("phonenumber", phonenumber);
    if (imageFile) {
      formData.append("img", imageFile);
    }

    try {
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.user) {
        updateUser(data.user);
        alert("Profile updated successfully!");
        onClose();
      } else {
        alert(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      alert("Server Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 font-sans">
      <div className="bg-[#13151f] border border-[#232636] w-full max-w-md rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-serif text-white mb-6 text-center">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#0052FF]/60 shadow-accent btn-gradient flex items-center justify-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-serif font-bold text-white">
                  {name ? name.charAt(0).toUpperCase() : "U"}
                </span>
              )}
              <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition">
                <Camera className="w-6 h-6 text-white" />
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 mt-2">
              Click photo to update
            </span>
          </div>

          {/* Name Input */}
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
              Display Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-10 pl-10 pr-3.5 bg-[#181a26] border border-[#2a2e42] text-white text-sm rounded-xl focus:outline-none focus:border-[#0052FF] font-medium"
              />
            </div>
          </div>

          {/* Email (Readonly) */}
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full h-10 pl-10 pr-3.5 bg-[#161722] border border-[#232636] text-slate-400 text-sm rounded-xl cursor-not-allowed font-medium"
              />
            </div>
          </div>

          {/* Phone Input */}
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={phonenumber}
                onChange={(e) => setPhonenumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full h-10 pl-10 pr-3.5 bg-[#181a26] border border-[#2a2e42] text-white text-sm rounded-xl focus:outline-none focus:border-[#0052FF] font-medium"
              />
            </div>
          </div>

          {/* Bio Input */}
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
              About / Bio
            </label>
            <div className="relative">
              <Info className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows="3"
                placeholder="Write a short bio..."
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#181a26] border border-[#2a2e42] text-white text-sm rounded-xl focus:outline-none focus:border-[#0052FF] custom-scroll font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full h-11 btn-gradient text-white font-semibold text-sm rounded-xl transition-all shadow-accent hover:shadow-accent-lg hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center mt-4 disabled:opacity-50"
          >
            {saving ? "Saving Changes..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
