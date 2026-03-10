import { useState, useEffect, useRef } from "react";
import { Search, Send, Phone, Video, MoreVertical, Smile, Paperclip, LogOut, User, MessageSquare, Sparkles, Sun, Moon, ArrowLeft, PhoneOff, Mic, MicOff, Camera, CameraOff, X } from "lucide-react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker from 'emoji-picker-react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // --- Emoji & Attachment State ---
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  // --------------------------------

  // --- Calling State ---
  const [callActive, setCallActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null); // { from, name, signal, type }
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [callType, setCallType] = useState(null); // 'voice' or 'video'

  const peerConnection = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  // ---------------------

  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);

      socket.current = io("http://localhost:4000", { withCredentials: true });
      socket.current.emit("register", user.id);

      socket.current.on("receive_message", (message) => {
        setMessages((prev) => [...prev, message]);
      });

      socket.current.on("message_sent", (message) => {
        setMessages((prev) => [...prev, message]);
      });

      // --- Calling Socket Listeners ---
      socket.current.on("incoming_call", ({ from, name, signal, type }) => {
        setIncomingCall({ from, name, signal, type });
      });

      socket.current.on("call_accepted", async (signal) => {
        if (peerConnection.current) {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
        }
      });

      socket.current.on("ice_candidate", async (candidate) => {
        if (peerConnection.current) {
          try {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error("Error adding ice candidate", e);
          }
        }
      });

      socket.current.on("call_ended", () => {
        terminateCall(false);
      });
      // -------------------------------
    } else {
      navigate("/");
    }

    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, [navigate]);

  // --- WebRTC Core Logic ---
  const initPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && selectedUser) {
        socket.current.emit("ice_candidate", { to: selectedUser._id, candidate: event.candidate });
      } else if (event.candidate && incomingCall) {
        socket.current.emit("ice_candidate", { to: incomingCall.from, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    peerConnection.current = pc;
    return pc;
  };

  const startCall = async (type) => {
    if (!selectedUser) return;
    setCallType(type);
    setCallActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true
      });
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = initPeerConnection();
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.current.emit("call_user", {
        userToCall: selectedUser._id,
        signalData: offer,
        from: currentUser.id,
        name: currentUser.name,
        type: type
      });
    } catch (err) {
      console.error("Failed to get local stream", err);
      setCallActive(false);
    }
  };

  const answerCall = async () => {
    if (!incomingCall) return;
    setCallType(incomingCall.type);
    setCallActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: incomingCall.type === 'video',
        audio: true
      });
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = initPeerConnection();
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.signal));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.current.emit("answer_call", { to: incomingCall.from, signal: answer });
      setIncomingCall(null);
    } catch (err) {
      console.error("Failed to answer call", err);
      terminateCall();
    }
  };

  const terminateCall = (notifyPeer = true) => {
    if (notifyPeer) {
      const to = selectedUser?._id || incomingCall?.from;
      if (to) socket.current.emit("end_call", { to });
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    setCallActive(false);
    setIncomingCall(null);
    setLocalStream(null);
    setRemoteStream(null);
    setCallType(null);
  };
  // -------------------------

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`http://localhost:4000/users?search=${searchQuery}`, {
          headers: { "Content-Type": "application/json" },
          credentials: "include"
        });
        const data = await res.json();
        if (data.success) setUsers(data.users);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [searchQuery]);

  useEffect(() => {
    if (selectedUser) {
      const fetchMessages = async () => {
        try {
          const res = await fetch(`http://localhost:4000/messages/${selectedUser._id}`, {
            credentials: "include"
          });
          const data = await res.json();
          if (data.success) setMessages(data.messages);
        } catch (err) {
          console.error("Failed to fetch messages", err);
        }
      };
      fetchMessages();
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if ((!input.trim() && !selectedFile) || !selectedUser) return;

    let attachmentData = null;
    if (selectedFile) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      try {
        const res = await fetch("http://localhost:4000/upload-attachment", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          attachmentData = data.file;
        }
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        setIsUploading(false);
      }
    }

    const messageData = {
      sender: currentUser.id,
      receiver: selectedUser._id,
      message: input.trim() || (attachmentData ? `Sent a ${attachmentData.fileType}` : ""),
      attachment: attachmentData,
    };

    socket.current.emit("send_message", messageData);
    setInput("");
    setSelectedFile(null);
    setShowEmojiPicker(false);
  };

  const onEmojiClick = (emojiObject) => {
    setInput((prev) => prev + emojiObject.emoji);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:4000/logout", {
        method: "POST",
        credentials: "include"
      });
      localStorage.removeItem("user");
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted, localStream]);

  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isCameraOff;
      });
    }
  }, [isCameraOff, localStream]);

  return (
    <div className="app-container font-sans text-text-main">
      {/* Calling UI Overlays */}
      <AnimatePresence>
        {incomingCall && !callActive && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 30, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md bg-bg-card rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border border-border-subtle p-6 flex items-center justify-between glass-effect"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-2xl animate-pulse">
                {incomingCall.name[0]}
              </div>
              <div>
                <p className="font-black text-text-main text-lg">{incomingCall.name}</p>
                <p className="text-[11px] font-black uppercase tracking-widest text-primary/60 italic">Incoming {incomingCall.type} Call</p>
              </div>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIncomingCall(null)}
                className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg"
              >
                <PhoneOff size={22} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={answerCall}
                className="w-12 h-12 rounded-2xl bg-green-500 text-white flex items-center justify-center shadow-[0_8px_16px_rgba(34,197,94,0.4)] transition-all"
              >
                <Phone size={22} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {callActive && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[110] bg-bg-app flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Background Stream (Remote) */}
            <div className="absolute inset-0 bg-black flex items-center justify-center">
              {callType === 'video' ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover opacity-80"
                  srcObject={remoteStream}
                />
              ) : (
                <div className="flex flex-col items-center gap-8">
                  <div className="w-40 h-40 md:w-56 md:h-56 rounded-[60px] bg-primary/10 flex items-center justify-center text-primary font-black text-8xl shadow-2xl ring-2 ring-primary/20 animate-pulse">
                    {(selectedUser?.name || incomingCall?.name)?.[0]}
                  </div>
                  <div className="text-center">
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
                      {selectedUser?.name || incomingCall?.name}
                    </h2>
                    <p className="text-[14px] font-black uppercase tracking-[0.5em] text-primary italic opacity-70">Voice Protocol Active</p>
                  </div>
                </div>
              )}
            </div>

            {/* Local Stream (PIP) */}
            {callType === 'video' && (
              <motion.div
                drag
                dragConstraints={{ left: -300, right: 300, top: -400, bottom: 400 }}
                className="absolute top-10 right-10 w-40 h-60 md:w-56 md:h-80 bg-bg-card rounded-3xl shadow-2xl border-4 border-white/10 overflow-hidden z-20 cursor-move"
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  srcObject={localStream}
                />
              </motion.div>
            )}

            {/* Call Controls */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-6 md:gap-10 bg-black/40 backdrop-blur-3xl px-10 md:px-14 py-6 md:py-8 rounded-[40px] border border-white/10 shadow-2xl">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMuted(!isMuted)}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all ${isMuted ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
              </motion.button>

              {callType === 'video' && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsCameraOff(!isCameraOff)}
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all ${isCameraOff ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  {isCameraOff ? <CameraOff size={28} /> : <Camera size={28} />}
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.1, rotate: 135 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => terminateCall()}
                className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-red-500 text-white flex items-center justify-center shadow-[0_12px_24px_rgba(239,68,68,0.4)] transition-all"
              >
                <PhoneOff size={32} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Section */}
      <div className={`sidebar-container glass-effect shadow-2xl ${isMobile && selectedUser ? 'hidden-mobile' : ''}`}>
        {/* Navigation Rail */}
        <nav className="w-20 bg-rail border-r border-border-subtle flex flex-col items-center py-8 gap-10 flex-shrink-0 z-20">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="p-3.5 bg-primary rounded-2xl shadow-xl ring-4 ring-primary/10 mb-4 cursor-pointer transition-all"
          >
            <MessageSquare className="text-white w-7 h-7" />
          </motion.div>

          <div className="flex flex-col gap-8 items-center flex-1 transition-all">
            <motion.button
              whileHover={{ scale: 1.1, color: "var(--primary)" }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-4 text-text-muted hover:bg-app rounded-2xl transition-all duration-300"
            >
              {theme === 'light' ? <Moon size={28} /> : <Sun size={28} />}
            </motion.button>
            {[User, Smile, Phone, Video].map((Icon, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.1, color: "var(--primary)" }}
                whileTap={{ scale: 0.9 }}
                className="p-4 text-text-muted hover:bg-app rounded-2xl transition-all duration-300"
              >
                <Icon size={26} />
              </motion.button>
            ))}
          </div>

          <div className="flex flex-col gap-8 items-center flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={logout}
              className="p-3 text-red-500/80 hover:text-red-500 rounded-2xl transition"
            >
              <LogOut size={24} />
            </motion.button>
            <div className="relative group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 p-0.5 border-2 border-primary/20 cursor-pointer overflow-hidden group-hover:border-primary transition-all">
                <div className="w-full h-full bg-primary/20 rounded-xl flex items-center justify-center font-black text-primary text-base uppercase">
                  {currentUser?.name?.[0] || 'U'}
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Chat List Pane */}
        <aside className="flex-1 flex flex-col min-w-0 bg-transparent">
          <div className="p-8 pb-8 flex-shrink-0">
            <h2 className="text-3xl font-black text-text-main tracking-tighter mb-10 flex items-center justify-between">
              Messages
              <span className="bg-primary/10 text-primary text-[11px] px-3 py-1 rounded-full font-black uppercase tracking-widest">
                {users.length} Active
              </span>
            </h2>

            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={20} />
              <input
                className="w-full pl-14 pr-6 py-4.5 rounded-2xl border-none bg-bg-surface outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-500 text-[16px] font-semibold placeholder:text-text-muted/50 text-text-main shadow-inner"
                placeholder="Search People..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto px-6 space-y-1.5 py-4 custom-scroll">
            {isLoading ? (
              <div className="h-40 flex flex-col items-center justify-center gap-4 animate-pulse">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-xs font-black uppercase tracking-widest text-primary/40">Syncing Channels</p>
              </div>
            ) : users.length === 0 ? (
              <div className="h-60 flex flex-col items-center justify-center text-center px-8 text-text-muted/40">
                <Search size={40} className="mb-4 opacity-10" />
                <p className="text-sm font-bold italic">No active connections found</p>
              </div>
            ) : (
              users.map((user) => (
                <motion.div
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className={`flex items-center gap-5 p-5 rounded-3xl cursor-pointer transition-all duration-500 group relative border
                             ${selectedUser?._id === user._id
                      ? "bg-bg-card shadow-2xl border-border-subtle ring-1 ring-black/[0.02]"
                      : "hover:bg-bg-card/50 border-transparent"}`}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`w-14 h-14 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center font-black text-2xl transition-all duration-500
                      ${selectedUser?._id === user._id ? "bg-primary text-white scale-105" : "bg-bg-surface text-text-muted/40 group-hover:text-primary/60"}`}>
                      {user.img ? <img src={user.img} className="w-full h-full object-cover" /> : user.name[0]}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-green-500 border-4 border-bg-card shadow-sm" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`font-black text-[17px] truncate tracking-tight ${selectedUser?._id === user._id ? "text-text-main" : "text-text-muted group-hover:text-text-main"}`}>
                      {user.name}
                    </p>
                    <p className="text-[11px] text-text-muted/50 font-black uppercase tracking-[0.1em] mt-1 italic">Live Transmit</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </aside>
      </div>

      {/* Main Chat Area */}
      <main className="chat-main transition-all relative">
        <AnimatePresence mode="wait">
          {selectedUser ? (
            <motion.div
              key={selectedUser._id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 flex flex-col h-full bg-transparent"
            >
              {/* Chat Header */}
              <header className="h-24 bg-bg-card/80 backdrop-blur-xl border-b border-border-subtle px-6 md:px-14 flex items-center justify-between flex-shrink-0 z-10">
                <div className="flex items-center gap-4 md:gap-6 min-w-0">
                  {isMobile && (
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="p-3 -ml-4 text-text-muted hover:text-primary transition-colors"
                    >
                      <ArrowLeft size={28} />
                    </button>
                  )}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-xl ring-4 ring-primary/5">
                      {selectedUser.name[0]}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-green-500 border-4 border-bg-card shadow-lg" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-black text-text-main text-xl md:text-2xl tracking-tighter truncate leading-tight">{selectedUser.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-green-500 opacity-80">Synchronized</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 md:gap-6 flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.02)" }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => startCall('voice')}
                    className="p-3.5 rounded-2xl text-text-muted/60 hover:text-primary transition-all"
                  >
                    <Phone size={24} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.02)" }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => startCall('video')}
                    className="p-3.5 rounded-2xl text-text-muted/60 hover:text-primary transition-all"
                  >
                    <Video size={24} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.02)" }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3.5 rounded-2xl text-text-muted/60 hover:text-primary transition-all"
                  >
                    <MoreVertical size={24} />
                  </motion.button>
                </div>
              </header>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto px-8 md:px-20 py-16 space-y-16 custom-scroll">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20">
                    <div className="w-20 h-20 bg-primary/5 rounded-[40px] flex items-center justify-center mb-6">
                      <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-[0.6em] text-text-main text-center">Protocol Established</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.sender === currentUser?.id;
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        key={msg._id || index}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%] md:max-w-[75%]`}>
                          <div className={`message-bubble ${isMe
                            ? "bg-gradient-to-br from-primary to-indigo-600 text-white rounded-tr-none shadow-2xl shadow-primary/30"
                            : "bg-white dark:bg-bg-surface text-text-main rounded-tl-none border-2 border-border-subtle shadow-sm"}`}>
                            {msg.attachment && (
                              <div className="mb-4 overflow-hidden rounded-xl">
                                {msg.attachment.fileType === 'image' ? (
                                  <img
                                    src={`http://localhost:4000/${msg.attachment.url}`}
                                    alt={msg.attachment.fileName}
                                    className="max-w-full h-auto cursor-pointer hover:scale-[1.02] transition-transform"
                                  />
                                ) : (
                                  <a
                                    href={`http://localhost:4000/${msg.attachment.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-4 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-black/10 transition-colors"
                                  >
                                    <Paperclip size={20} />
                                    <span className="text-sm font-bold truncate max-w-[200px]">{msg.attachment.fileName}</span>
                                  </a>
                                )}
                              </div>
                            )}
                            {msg.message}
                          </div>
                          <span className={`${isMe ? 'text-primary' : 'text-text-muted'} text-[10px] mt-4 font-black uppercase tracking-widest opacity-60 px-3 tracking-[0.2em]`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-8 md:p-14 pb-12 flex-shrink-0 bg-gradient-to-t from-bg-app to-transparent relative">
                {/* Emoji Picker Popover */}
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: -10, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.95 }}
                      className="absolute bottom-full left-14 z-50 shadow-2xl rounded-3xl overflow-hidden mb-4"
                    >
                      <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        theme={theme === 'dark' ? 'dark' : 'light'}
                        width={350}
                        height={450}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="max-w-5xl mx-auto flex flex-col gap-4">
                  {/* Selected File Preview */}
                  {selectedFile && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-4 bg-bg-card rounded-2xl border border-border-subtle shadow-lg self-start"
                    >
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Paperclip size={20} />
                      </div>
                      <span className="text-sm font-bold text-text-main">{selectedFile.name}</span>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="p-1 hover:bg-red-500/10 text-text-muted hover:text-red-500 rounded-md transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </motion.div>
                  )}

                  <div className="flex items-center gap-4 md:gap-6 bg-bg-card p-4 md:p-6 rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] border border-border-subtle focus-within:ring-[20px] focus-within:ring-primary/5 transition-all duration-700">
                    <div className="flex gap-2 md:gap-4">
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`p-3 transition-colors ${showEmojiPicker ? 'text-primary' : 'text-text-muted/60 hover:text-primary'}`}
                      >
                        <Smile size={32} />
                      </motion.button>

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-3 transition-colors ${selectedFile ? 'text-primary' : 'text-text-muted/60 hover:text-primary'} hidden md:block`}
                      >
                        <Paperclip size={32} />
                      </motion.button>
                    </div>

                    <input
                      className="flex-1 bg-transparent border-none outline-none text-xl px-2 text-text-main font-bold placeholder:text-text-muted/30"
                      placeholder={isUploading ? "Uploading payload..." : `Compose to ${selectedUser.name.split(' ')[0]}...`}
                      value={input}
                      disabled={isUploading}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />

                    <motion.button
                      whileHover={(input.trim() || selectedFile) && !isUploading ? { scale: 1.05, filter: "brightness(1.1)" } : {}}
                      whileTap={(input.trim() || selectedFile) && !isUploading ? { scale: 0.95 } : {}}
                      onClick={sendMessage}
                      disabled={isUploading || (!input.trim() && !selectedFile)}
                      className={`p-5 md:p-6 rounded-3xl transition-all duration-500 shadow-2xl ${(input.trim() || selectedFile) && !isUploading
                          ? "bg-primary text-white ring-8 ring-primary/10"
                          : "bg-bg-surface text-text-muted/20"
                        }`}
                    >
                      <Send size={28} className={(input.trim() || selectedFile) ? "translate-x-0.5 -translate-y-0.5" : ""} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-transparent">
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 15 }}
                className="w-40 h-40 md:w-56 md:h-56 bg-bg-card rounded-[60px] shadow-2xl flex items-center justify-center mb-16 border border-border-subtle premium-shadow"
              >
                <MessageSquare size={80} className="text-primary opacity-20" />
              </motion.div>
              <h1 className="text-5xl md:text-8xl font-black text-text-main mb-6 tracking-tighter">
                ChatX <span className="text-primary italic">Pro</span>
              </h1>
              <p className="max-w-md text-text-muted font-black text-[11px] md:text-sm tracking-[0.5em] uppercase mx-auto leading-loose opacity-50">
                Encrypted Peer-to-Peer Communication Protocol
              </p>

              <div className="mt-24 flex justify-center gap-12 md:gap-24 opacity-30">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-text-main">Military Grade</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-text-main">Real-time Sync</p>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
