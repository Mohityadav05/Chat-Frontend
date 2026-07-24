import React, { useState, useRef } from "react";
import { Smile, Paperclip, Send, X, FileText, Image as ImageIcon } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { useAuth } from "../hooks/useAuth";
import { chatApi, API_BASE_URL } from "../services/api";

export default function MessageComposer({ conversationId, onSendMessage, onTyping, onStopTyping }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleTextChange = (e) => {
    setText(e.target.value);

    if (onTyping) {
      onTyping();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (onStopTyping) {
        onStopTyping();
      }
    }, 2000);
  };

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/upload-attachment`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.file) {
        setAttachment(data.file);
      } else {
        alert("Failed to upload file");
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !attachment) return;

    const messageText = text.trim();
    const currentAttachment = attachment;

    setText("");
    setAttachment(null);
    setShowEmoji(false);
    if (onStopTyping) onStopTyping();

    try {
      const data = await chatApi.sendMessage({
        conversationId,
        message: messageText,
        attachment: currentAttachment || { url: "", fileType: "", fileName: "" },
      });
      if (data.success && data.message) {
        onSendMessage(data.message);
      }
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  return (
    <div className="p-3.5 bg-[#121420]/95 backdrop-blur-md border-t border-[#232636] relative font-sans shrink-0 select-none">
      {/* Emoji Picker Popover */}
      {showEmoji && (
        <div className="absolute bottom-16 left-4 z-40 shadow-2xl rounded-2xl overflow-hidden border border-[#232636]">
          <EmojiPicker
            theme="dark"
            onEmojiClick={handleEmojiClick}
            height={380}
            width={320}
          />
        </div>
      )}

      {/* Attachment Preview Card */}
      {attachment && (
        <div className="mb-2.5 p-3 bg-[#181a26] border border-[#0052FF]/50 rounded-xl flex items-center justify-between max-w-sm shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            {attachment.fileType === "image" ? (
              <ImageIcon className="w-5 h-5 text-[#4D7CFF] shrink-0" />
            ) : (
              <FileText className="w-5 h-5 text-[#4D7CFF] shrink-0" />
            )}
            <span className="text-xs text-white truncate font-medium">{attachment.fileName}</span>
          </div>
          <button
            type="button"
            onClick={() => setAttachment(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Composer Input Bar */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => setShowEmoji(!showEmoji)}
          className={`p-2.5 rounded-xl transition ${
            showEmoji ? "bg-[#0052FF]/20 text-[#4D7CFF]" : "text-slate-400 hover:text-white hover:bg-white/10"
          }`}
          title="Add Emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition disabled:opacity-50"
          title="Attach File"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder="Type a message..."
          className="flex-1 h-11 px-4 bg-[#181a26] border border-[#2a2e42] text-white text-sm rounded-xl focus:outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] placeholder-slate-500 font-medium transition-all"
        />

        <button
          type="submit"
          disabled={uploading || (!text.trim() && !attachment)}
          className="h-11 px-5 btn-gradient text-white rounded-xl font-semibold flex items-center justify-center transition-all shadow-accent hover:shadow-accent-lg active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
