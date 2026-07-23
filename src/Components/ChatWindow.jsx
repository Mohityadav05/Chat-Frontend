import React, { useState, useEffect, useRef, useContext } from "react";
import { MessageSquare, Phone, Video, MoreVertical, CheckCheck, Trash2, ShieldCheck, Download, FileText } from "lucide-react";
import MessageComposer from "./MessageComposer";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";

export default function ChatWindow({ conversation, onBack }) {
  const { user, API_URL } = useContext(AuthContext);
  const { socket, onlineUsers } = useContext(SocketContext);
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
      const res = await fetch(`${API_URL}/api/messages/${conversation._id}`, {
        credentials: "include",
      });
      const data = await res.json();
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
      if (newMessage.conversation === conversation?._id || newMessage.conversation?._id === conversation?._id) {
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

  const handleSendMessage = ({ message, attachment }) => {
    if (!socket || !conversation) return;

    const payload = {
      sender: user._id || user.id,
      conversationId: conversation._id,
      receiver: otherUser?._id,
      message,
      attachment,
    };

    socket.emit("send_message", payload);
  };

  const handleTypingNotify = () => {
    if (socket && conversation) {
      socket.emit("typing", {
        conversationId: conversation._id,
        userId: user._id,
        userName: user.name,
      });
    }
  };

  const handleStopTypingNotify = () => {
    if (socket && conversation) {
      socket.emit("stop_typing", {
        conversationId: conversation._id,
        userId: user._id,
      });
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const res = await fetch(`${API_URL}/api/messages/${messageId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
      }
    } catch (err) {
      console.error("Delete message error:", err);
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 h-full bg-[#0e101a] flex flex-col items-center justify-center p-8 text-center relative dot-pattern overflow-hidden font-sans">
        {/* Ambient Glow */}
        <div className="absolute w-[500px] h-[300px] glow-orb rounded-full filter blur-[100px] pointer-events-none"></div>

        {/* Section Badge Pattern */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/10 px-4 py-1.5 mb-6">
          <ShieldCheck className="w-4 h-4 text-[#0052FF]" />
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#4D7CFF] font-semibold">
            End-to-End Encrypted
          </span>
        </div>

        <div className="w-16 h-16 rounded-2xl btn-gradient flex items-center justify-center mb-5 shadow-accent">
          <MessageSquare className="w-8 h-8 text-white" />
        </div>

        <h3 className="text-3xl font-serif text-white mb-2">
          Your Conversations on <span className="gradient-text">Utalk</span>
        </h3>
        <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-6 font-sans">
          Select a direct message or group conversation from the sidebar to start instant real-time messaging.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col bg-[#0e101a] relative font-sans">
      {/* Header */}
      <div className="h-16 px-5 bg-[#121420] border-b border-[#232636] flex items-center justify-between z-10">
        <div className="flex items-center gap-3.5">
          <button onClick={onBack} className="md:hidden text-slate-400 hover:text-white p-1">
            &larr;
          </button>

          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0052FF] to-[#4D7CFF] flex items-center justify-center text-white font-bold overflow-hidden shadow-sm">
              {avatar ? (
                <img src={`${API_URL}/${avatar}`} alt={title} className="w-full h-full object-cover" />
              ) : (
                title.charAt(0).toUpperCase()
              )}
            </div>
            {conversation.type === "direct" && isOtherOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#121420] rounded-full"></span>
            )}
          </div>

          <div>
            <h3 className="text-base font-serif text-white leading-tight">{title}</h3>
            <p className="font-mono text-[11px] text-slate-400">
              {typingUsers.size > 0 ? (
                <span className="text-[#4D7CFF] font-semibold animate-pulse">Typing...</span>
              ) : conversation.type === "group" ? (
                `${conversation.members?.length || 0} members`
              ) : isOtherOnline ? (
                <span className="text-emerald-400 font-medium">Online</span>
              ) : (
                "Offline"
              )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button className="p-2.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition">
            <Phone className="w-4.5 h-4.5" />
          </button>
          <button className="p-2.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition">
            <Video className="w-4.5 h-4.5" />
          </button>
          <button className="p-2.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition">
            <MoreVertical className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 custom-scroll dot-pattern">
        {loading ? (
          <p className="text-center font-mono text-xs text-slate-500 py-10">Loading messages...</p>
        ) : messages.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xs text-slate-400">No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = (m.sender?._id || m.sender) === (user._id || user.id);
            const senderName = m.sender?.name || "User";

            return (
              <div
                key={m._id}
                className={`flex flex-col group ${isMe ? "items-end" : "items-start"}`}
              >
                {!isMe && conversation.type === "group" && (
                  <span className="text-[10px] font-semibold text-slate-400 mb-1 ml-1">
                    {senderName}
                  </span>
                )}

                <div className="relative max-w-[75%] sm:max-w-[65%]">
                  {/* Bubble Container */}
                  <div
                    className={`p-3.5 rounded-2xl shadow-md text-xs leading-relaxed break-words relative ${
                      isMe
                        ? "btn-gradient text-white rounded-tr-none shadow-accent"
                        : "bg-[#181a26] text-slate-200 border border-[#2a2e42] rounded-tl-none"
                    }`}
                  >
                    {/* Attachment Display */}
                    {m.attachment?.url && (
                      <div className="mb-2 rounded-xl overflow-hidden bg-black/20 p-1 border border-white/10">
                        {m.attachment.fileType === "image" ? (
                          <img
                            src={`${API_URL}/${m.attachment.url}`}
                            alt="Attachment"
                            className="max-h-60 w-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="flex items-center justify-between p-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-5 h-5 text-indigo-300 shrink-0" />
                              <span className="text-xs truncate">{m.attachment.fileName}</span>
                            </div>
                            <a
                              href={`${API_URL}/${m.attachment.url}`}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-slate-300 hover:text-white"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Content */}
                    {m.message && <p>{m.message}</p>}

                    {/* Timestamp & Status */}
                    <div className="flex items-center justify-end gap-1 mt-1 font-mono text-[9px] text-slate-300/80">
                      <span>
                        {new Date(m.createdAt || m.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isMe && <CheckCheck className="w-3.5 h-3.5 text-indigo-200" />}
                    </div>
                  </div>

                  {/* Message Delete Button */}
                  {isMe && (
                    <button
                      onClick={() => handleDeleteMessage(m._id)}
                      title="Delete Message"
                      className="absolute -left-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-400 transition p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer */}
      <MessageComposer
        onSendMessage={handleSendMessage}
        onTyping={handleTypingNotify}
        onStopTyping={handleStopTypingNotify}
      />
    </div>
  );
}
