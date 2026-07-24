import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
  Download,
  FileText,
  ArrowLeft,
  ShieldCheck,
  Plus,
  Users,
  Smile,
} from "lucide-react";
import MessageComposer from "./MessageComposer";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";
import { chatApi } from "../services/api";

export default function ChatWindow({ conversation, onBack }) {
  const { user, API_URL } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);

  const getOtherUser = () => {
    if (!conversation || conversation.type === "group") return null;
    return conversation.members?.find((m) => m._id !== user?._id);
  };

  const otherUser = getOtherUser();
  const isOtherOnline = otherUser ? onlineUsers.includes(otherUser._id?.toString()) : false;

  const title = conversation?.type === "group" ? conversation.groupName : otherUser?.name || "User";
  const avatar = conversation?.type === "group" ? conversation.groupAvatar : otherUser?.avatar;

  useEffect(() => {
    if (!conversation) return;
    fetchMessages();

    if (socket) {
      socket.emit("join_conversation", conversation._id);
    }

    return () => {
      if (socket) {
        socket.emit("leave_conversation", conversation._id);
      }
    };
  }, [conversation?._id, socket]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await chatApi.getMessages(conversation._id);
      if (data.success) {
        setMessages(data.messages);
        scrollToBottom();
      }
    } catch (err) {
      console.error("Fetch messages error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage) => {
      if (
        newMessage.conversation === conversation?._id ||
        newMessage.conversation?._id === conversation?._id
      ) {
        setMessages((prev) => [...prev, newMessage]);
        scrollToBottom();
      }
    };

    const handleTyping = ({ conversationId, userName }) => {
      if (conversationId === conversation?._id) {
        setTypingUsers((prev) => new Set(prev).add(userName || "Someone"));
      }
    };

    const handleStopTyping = ({ conversationId, userName }) => {
      if (conversationId === conversation?._id) {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          next.delete(userName || "Someone");
          return next;
        });
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
    };
  }, [socket, conversation?._id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = (newMsg) => {
    setMessages((prev) => [...prev, newMsg]);
    scrollToBottom();
  };

  // Empty State View (No conversation selected)
  if (!conversation) {
    return (
      <div className="flex-1 h-full bg-[#0b0c10] dot-pattern flex flex-col items-center justify-center p-6 text-center relative overflow-hidden select-none">
        {/* Ambient Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] glow-orb rounded-full filter blur-[100px] pointer-events-none"></div>

        <div className="max-w-md z-10 space-y-6">
          <div className="w-20 h-20 rounded-3xl btn-gradient mx-auto flex items-center justify-center shadow-accent-lg transform hover:scale-105 transition-transform duration-300">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-serif text-white tracking-tight">Welcome to Utalk</h2>
            <p className="text-sm text-slate-400 font-sans leading-relaxed">
              Select a conversation from the sidebar or start a new chat to connect instantly with real-time messaging and group chats.
            </p>
          </div>

          {/* Quick Feature Badges */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-[#121420]/80 border border-[#232636] rounded-xl text-left">
              <span className="text-xs font-semibold text-indigo-400 block mb-1">⚡ Real-time</span>
              <span className="text-[11px] text-slate-400 block">Instant WebSocket message delivery</span>
            </div>
            <div className="p-3 bg-[#121420]/80 border border-[#232636] rounded-xl text-left">
              <span className="text-xs font-semibold text-emerald-400 block mb-1">🔒 End-to-End</span>
              <span className="text-[11px] text-slate-400 block">Encrypted & private sessions</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-500 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Secure Chat Connection Active</span>
          </div>
        </div>
      </div>
    );
  }

  const typingArray = Array.from(typingUsers);

  return (
    <div className="flex-1 h-full bg-[#0b0c10] flex flex-col min-w-0 font-sans relative">
      {/* Active Chat Header */}
      <div className="h-16 px-4 border-b border-[#232636] bg-[#121420]/90 backdrop-blur-md flex items-center justify-between z-10 shrink-0 select-none">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Avatar Thumbnail */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0052FF] to-[#4D7CFF] flex items-center justify-center text-white font-bold overflow-hidden shadow-sm border border-white/10">
              {avatar ? (
                <img src={`${API_URL}/${avatar}`} alt={title} className="w-full h-full object-cover" />
              ) : (
                title.charAt(0).toUpperCase()
              )}
            </div>
            {conversation.type === "direct" && isOtherOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#121420] rounded-full online-pulse"></span>
            )}
          </div>

          {/* Header Title & Status */}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
            <p className="text-[11px] font-mono truncate text-slate-400">
              {typingArray.length > 0 ? (
                <span className="text-indigo-400 flex items-center gap-1 font-sans">
                  <span>{typingArray.join(", ")} is typing</span>
                  <span className="flex items-center gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-indigo-400 typing-dot"></span>
                    <span className="w-1 h-1 rounded-full bg-indigo-400 typing-dot"></span>
                    <span className="w-1 h-1 rounded-full bg-indigo-400 typing-dot"></span>
                  </span>
                </span>
              ) : conversation.type === "group" ? (
                `${conversation.members?.length || 0} members`
              ) : isOtherOnline ? (
                <span className="text-emerald-400">Online</span>
              ) : (
                <span className="text-slate-500">Offline</span>
              )}
            </p>
          </div>
        </div>

        {/* Action Header Icons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition border border-transparent hover:border-white/10"
            title="Audio Call"
            onClick={() => alert("Audio call feature available soon!")}
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition border border-transparent hover:border-white/10"
            title="Video Call"
            onClick={() => alert("Video call feature available soon!")}
          >
            <Video className="w-4 h-4" />
          </button>
          <button
            className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition border border-transparent hover:border-white/10"
            title="Chat Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scrollable List */}
      <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-4 bg-[#0b0c10] dot-pattern">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-7 h-7 border-2 border-[#0052FF] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#181a26] border border-[#232636] flex items-center justify-center text-slate-400">
              <Smile className="w-7 h-7 text-indigo-400" />
            </div>
            <h4 className="text-sm font-semibold text-white">No messages yet</h4>
            <p className="text-xs text-slate-400 max-w-xs">
              Say hello! Send a message below to start the conversation.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
            const senderName = msg.sender?.name || "User";

            return (
              <div
                key={msg._id || index}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1 group`}
              >
                {!isMe && conversation.type === "group" && (
                  <span className="text-[10px] font-semibold text-slate-400 px-1">
                    {senderName}
                  </span>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm transition-all ${
                    isMe
                      ? "btn-gradient text-white rounded-br-none"
                      : "bg-[#181a26] text-slate-100 border border-[#232636] rounded-bl-none"
                  }`}
                >
                  {/* Media Attachment Preview */}
                  {msg.attachment?.url && (
                    <div className="mb-2 overflow-hidden rounded-xl border border-white/10 bg-black/20">
                      {msg.attachment.fileType === "image" ? (
                        <img
                          src={`${API_URL}/${msg.attachment.url}`}
                          alt="Attachment"
                          className="max-h-60 w-full object-cover rounded-xl"
                        />
                      ) : (
                        <div className="p-3 flex items-center gap-3 bg-[#121420]">
                          <FileText className="w-6 h-6 text-indigo-400 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-mono text-[11px] truncate text-white">
                              {msg.attachment.url.split("/").pop()}
                            </p>
                          </div>
                          <a
                            href={`${API_URL}/${msg.attachment.url}`}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Text Message */}
                  {msg.message && <p className="whitespace-pre-wrap break-words">{msg.message}</p>}

                  {/* Footer Timestamp & Status */}
                  <div
                    className={`flex items-center gap-1 justify-end mt-1.5 font-mono text-[9px] ${
                      isMe ? "text-indigo-200" : "text-slate-400"
                    }`}
                  >
                    <span>
                      {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-indigo-200" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer Footer */}
      <MessageComposer
        conversationId={conversation._id}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
