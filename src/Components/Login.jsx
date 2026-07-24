import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  MessageSquare,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Zap,
  ShieldCheck,
  Globe,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { authApi } from "../services/api";

export function AuthContainer({ initialMode = "login" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loginUser } = useAuth();

  // Mode state: 'login' or 'signup'
  const [isLogin, setIsLogin] = useState(
    initialMode === "signup" || location.pathname === "/signup" ? false : true
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync mode with route changes smoothly
  useEffect(() => {
    if (location.pathname === "/signup") {
      setIsLogin(false);
    } else if (location.pathname === "/") {
      setIsLogin(true);
    }
  }, [location.pathname]);

  // Redirect if logged in
  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  const switchMode = (toLogin) => {
    setError("");
    setIsLogin(toLogin);
    navigate(toLogin ? "/" : "/signup", { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.target);

    if (isLogin) {
      const email = formData.get("email");
      const password = formData.get("password");

      try {
        const data = await authApi.login({ email, password });
        if (data.success && data.user) {
          loginUser(data.user);
          navigate("/home");
        } else {
          setError(data.message || "Invalid email or password");
        }
      } catch (err) {
        setError(err.message || "Login failed. Please check your connection.");
      } finally {
        setLoading(false);
      }
    } else {
      const name = formData.get("name")?.trim();
      const email = formData.get("email")?.trim();
      const phonenumber = formData.get("phonenumber")?.trim();
      const password = formData.get("password");
      const confirmpassword = formData.get("confirmpassword");

      if (password !== confirmpassword) {
        setError("Passwords do not match!");
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        setLoading(false);
        return;
      }

      try {
        const data = await authApi.signup({ name, phonenumber, email, password });
        if (data.success && data.user) {
          loginUser(data.user);
          navigate("/home");
        } else {
          setError(data.message || "Signup failed");
        }
      } catch (err) {
        setError(err.message || "Signup failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex items-center justify-center bg-[#07080c] text-slate-100 font-sans select-none relative p-3 sm:p-6 lg:p-8">
      {/* Background Mesh Glow Orbs */}
      <div className="absolute top-0 left-1/4 w-[700px] h-[500px] bg-gradient-to-br from-[#0052FF]/20 via-[#4D7CFF]/10 to-transparent rounded-full blur-[140px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[500px] bg-gradient-to-tl from-purple-600/15 via-indigo-600/10 to-transparent rounded-full blur-[150px] pointer-events-none"></div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 dot-pattern opacity-50 pointer-events-none"></div>

      {/* Main Glass Shell Container - Fixed Dimensions to eliminate jerks */}
      <div className="w-full max-w-6xl h-full max-h-[720px] flex rounded-3xl border border-[#23273c] bg-[#0c0d14]/80 backdrop-blur-2xl relative z-10 overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.8)]">

        {/* LEFT COLUMN: Modern Hero Showcase with Animated Text */}
        <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] h-full p-10 xl:p-12 flex-col justify-between border-r border-[#1e2235]/80 bg-[#0a0b12]/60 relative z-10 overflow-hidden">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl btn-gradient flex items-center justify-center shadow-accent-lg transform hover:scale-105 transition-transform duration-300">
                <MessageSquare className="w-5.5 h-5.5 text-white" />
              </div>
              <div>
                <span className="text-xl font-serif tracking-tight text-white block leading-tight">Utalk</span>
                <span className="text-[10px] font-mono text-indigo-400 tracking-widest uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} /> Real-time Workspace
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Online</span>
            </div>
          </div>

          {/* Hero Middle Content with Shimmer & Floating Animations */}
          <div className="space-y-6 max-w-lg my-auto py-4 animate-float">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#0052FF]/40 bg-[#0052FF]/10 px-3.5 py-1 text-xs font-mono text-[#4D7CFF] shadow-sm">
                <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span>Zero Latency Socket.io Transmission</span>
              </div>

              <h1 className="text-3xl xl:text-4xl font-serif text-white leading-[1.2] tracking-tight">
                Reimagining How Teams <span className="animate-shimmer-text">Talk & Connect</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans transition-all duration-300">
                Instant WebSocket messaging, multi-user channels, media attachments, and end-to-end security.
              </p>
            </div>

            {/* Interactive Live Chat Mockup Card */}
            <div className="p-4 bg-[#141724]/90 border border-[#262b42] rounded-2xl shadow-xl space-y-2.5 relative overflow-hidden group hover:border-[#0052FF]/40 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between border-b border-[#23273b] pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                  <span className="text-xs font-mono text-slate-400 ml-1.5">#general-discussion</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active
                </span>
              </div>

              <div className="space-y-2 pt-0.5">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/5 transition-all hover:bg-white/10">
                  <div className="w-7 h-7 rounded-full btn-gradient flex items-center justify-center text-white text-xs font-bold shrink-0">
                    A
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold text-white">Alex River</span>
                      <span className="text-[10px] font-mono text-slate-500">10:42 AM</span>
                    </div>
                    <p className="text-xs text-slate-300">Just updated the real-time socket engine! 🚀</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#0052FF]/15 border border-[#0052FF]/30 transition-all hover:bg-[#0052FF]/20">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    U
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold text-white">Utalk Bot</span>
                      <span className="text-[10px] font-mono text-indigo-300">Just now</span>
                    </div>
                    <p className="text-xs text-indigo-200">Welcome back! Sign in or register to begin.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Badges Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 bg-[#141724]/60 border border-[#23273b] rounded-xl text-center hover:border-[#0052FF]/40 transition-all duration-300 hover:-translate-y-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span className="text-xs font-semibold text-white block">Encrypted</span>
                <span className="text-[10px] text-slate-400">JWT Cookie Auth</span>
              </div>

              <div className="p-3 bg-[#141724]/60 border border-[#23273b] rounded-xl text-center hover:border-[#0052FF]/40 transition-all duration-300 hover:-translate-y-0.5">
                <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <span className="text-xs font-semibold text-white block">Zero Latency</span>
                <span className="text-[10px] text-slate-400">Socket.io Engine</span>
              </div>

              <div className="p-3 bg-[#141724]/60 border border-[#23273b] rounded-xl text-center hover:border-[#0052FF]/40 transition-all duration-300 hover:-translate-y-0.5">
                <Globe className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                <span className="text-xs font-semibold text-white block">Cross Platform</span>
                <span className="text-[10px] text-slate-400">Web & Mobile</span>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono pt-3 border-t border-[#1e2235]/60">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> End-to-End Security</span>
            <span>&copy; {new Date().getFullYear()} Utalk Inc.</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Auth Form Panel (Smooth Tab Switcher) */}
        <div className="w-full lg:w-[48%] xl:w-[45%] h-full p-6 sm:p-8 flex flex-col justify-between z-10 overflow-y-auto custom-scroll bg-[#131522]/95 backdrop-blur-3xl">

          {/* Mobile Brand Header */}
          <div className="flex lg:hidden items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl btn-gradient flex items-center justify-center shadow-accent">
                <MessageSquare className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-lg font-serif text-white">Utalk</span>
            </div>
          </div>

          <div className="w-full max-w-md mx-auto my-auto space-y-4 py-2">

            {/* Top Segmented Tab Switcher - Zero Jerk Button Transition */}
            <div className="flex p-1 bg-[#1a1d2d] rounded-2xl border border-[#2a2e45] shadow-inner">
              <button
                type="button"
                onClick={() => switchMode(true)}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${isLogin
                    ? "bg-gradient-to-r from-[#0052FF] to-[#3b72ff] text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode(false)}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${!isLogin
                    ? "bg-gradient-to-r from-[#0052FF] to-[#3b72ff] text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                Register
              </button>
            </div>

            {/* Title Header */}
            <div className="space-y-1 text-center sm:text-left">
              <h2 className="text-2xl font-serif text-white tracking-tight">
                {isLogin ? (
                  <>Sign In to <span className="gradient-text">Utalk</span></>
                ) : (
                  <>Create Account on <span className="gradient-text">Utalk</span></>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                {isLogin
                  ? "Welcome back! Enter your login details."
                  : "Join Utalk to start instant messaging immediately."}
              </p>
            </div>

            {/* Inline Error Alert */}
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-start gap-2 transition-all">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
            )}

            {/* Social Auth Buttons (Shown in Sign In Mode) */}
            {isLogin && (
              <div className="grid grid-cols-2 gap-2.5 transition-all">
                <button
                  type="button"
                  onClick={() => alert("Google login coming soon")}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-[#1a1d2e] hover:bg-[#23273e] border border-[#2d324d] hover:border-[#3d4468] rounded-xl text-xs font-semibold text-slate-200 transition-all hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => alert("GitHub login coming soon")}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-[#1a1d2e] hover:bg-[#23273e] border border-[#2d324d] hover:border-[#3d4468] rounded-xl text-xs font-semibold text-slate-200 transition-all hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
                  GitHub
                </button>
              </div>
            )}

            {/* Dynamic Form Fields with Smooth Layout */}
            <form onSubmit={handleSubmit} key={isLogin ? "login-form" : "signup-form"} className="space-y-3 transition-all duration-300">

              {/* Full Name & Phone Number (Only in Register Mode) */}
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 text-slate-500 absolute left-3" />
                      <input
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        required
                        className="w-full h-10 pl-9 pr-3 bg-[#1a1d2e] border border-[#2d324d] hover:border-[#3d4468] text-white text-xs rounded-xl focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/25 outline-none transition-all placeholder-slate-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                    <div className="relative flex items-center">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3" />
                      <input
                        type="text"
                        name="phonenumber"
                        placeholder="+1 (555) 000-0000"
                        required
                        className="w-full h-10 pl-9 pr-3 bg-[#1a1d2e] border border-[#2d324d] hover:border-[#3d4468] text-white text-xs rounded-xl focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/25 outline-none transition-all placeholder-slate-500 font-medium"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3" />
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    required
                    className="w-full h-10 pl-9 pr-3 bg-[#1a1d2e] border border-[#2d324d] hover:border-[#3d4468] text-white text-xs rounded-xl focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/25 outline-none transition-all placeholder-slate-500 font-medium"
                  />
                </div>
              </div>

              {/* Password Fields */}
              {isLogin ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      required
                      className="w-full h-10 pl-9 pr-10 bg-[#1a1d2e] border border-[#2d324d] hover:border-[#3d4468] text-white text-xs rounded-xl focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/25 outline-none transition-all placeholder-slate-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                    <div className="relative flex items-center">
                      <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••••"
                        required
                        className="w-full h-10 pl-8 pr-7 bg-[#1a1d2e] border border-[#2d324d] hover:border-[#3d4468] text-white text-xs rounded-xl focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/25 outline-none transition-all placeholder-slate-500 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm</label>
                    <div className="relative flex items-center">
                      <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmpassword"
                        placeholder="••••••••"
                        required
                        className="w-full h-10 pl-8 pr-7 bg-[#1a1d2e] border border-[#2d324d] hover:border-[#3d4468] text-white text-xs rounded-xl focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/25 outline-none transition-all placeholder-slate-500 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 btn-gradient text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-accent hover:shadow-accent-lg active:scale-[0.98] flex items-center justify-center gap-2 mt-3 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{isLogin ? "Sign In" : "Create Free Account"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Switch Link */}
            <div className="pt-1 text-center text-xs text-slate-400">
              {isLogin ? (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode(false)}
                    className="text-[#4D7CFF] font-semibold hover:underline bg-transparent border-none cursor-pointer"
                  >
                    Create account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode(true)}
                    className="text-[#4D7CFF] font-semibold hover:underline bg-transparent border-none cursor-pointer"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-[10px] text-slate-500 font-mono pt-2">
            &copy; {new Date().getFullYear()} Utalk Inc. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}

export function Login() {
  return <AuthContainer initialMode="login" />;
}

export function Signup() {
  return <AuthContainer initialMode="signup" />;
}

export default Login;
