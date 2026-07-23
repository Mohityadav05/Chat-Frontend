import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Eye, EyeOff, ArrowRight } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { loginUser, API_URL } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.user) {
        loginUser(data.user);
        navigate("/home");
      } else {
        alert(data.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert("Server Error. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#0b0c10] text-slate-100 font-sans p-4 sm:p-6 lg:p-8 relative overflow-hidden dot-pattern">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] glow-orb rounded-full filter blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-32 left-1/3 w-[500px] h-[300px] glow-orb rounded-full filter blur-[120px] pointer-events-none"></div>

      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-4 z-10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-10 h-10 rounded-xl btn-gradient flex items-center justify-center shadow-accent">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-serif tracking-tight text-white">Utalk</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
          <span className="hidden sm:inline">New to Utalk?</span>
          <button 
            type="button" 
            onClick={() => navigate("/signup")}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all font-semibold"
          >
            Create Account
          </button>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="w-full max-w-[440px] mx-auto my-auto z-10 py-6">
        <div className="bg-[#13151f] border border-[#232636] rounded-2xl p-6 sm:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative">
          
          {/* Section Badge Pattern */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/10 px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-[#0052FF] animate-pulse" />
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#4D7CFF] font-semibold">
                Account Login
              </span>
            </div>
          </div>

          {/* Card Headline */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif text-white tracking-tight mb-2">
              Welcome back to <span className="gradient-text">Utalk</span>
            </h1>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Log in to your account to access real-time messaging, voice, and media.
            </p>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button 
              type="button" 
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#181a26] hover:bg-[#202333] border border-[#2a2e42] rounded-xl text-xs font-semibold text-slate-200 transition-all hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button 
              type="button" 
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#181a26] hover:bg-[#202333] border border-[#2a2e42] rounded-xl text-xs font-semibold text-slate-200 transition-all hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78.78-.04 1.94-.78 3.31-.71 1.06.03 2.1.4 2.82 1.14-2.52 1.41-2.08 4.79.25 5.82-.44 1.41-1.28 2.86-2.45 3.92l.99 2.02zm-5.06-13.84c-.28-1.74 1.16-3.35 2.81-3.6 0 0 .14 1.83-1.12 3.19-1.29 1.4-3.05 1.11-2.82.02l.13.39z"/></svg>
              Apple
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 border-t border-[#232636]"></div>
            <span className="font-mono text-[10px] font-semibold text-slate-500 uppercase tracking-widest">or continue with email</span>
            <div className="flex-1 border-t border-[#232636]"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                required
                className="w-full h-11 px-4 bg-[#181a26] border border-[#2a2e42] text-white text-sm rounded-xl focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/30 outline-none transition-all placeholder-slate-500 font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <a href="#" className="text-xs text-[#4D7CFF] hover:underline font-medium">Forgot password?</a>
              </div>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  required
                  className="w-full h-11 px-4 pr-11 bg-[#181a26] border border-[#2a2e42] text-white text-sm rounded-xl focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/30 outline-none transition-all placeholder-slate-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-white transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 accent-[#0052FF] rounded bg-[#181a26] border-[#2a2e42]"
              />
              <label htmlFor="remember" className="text-xs text-slate-300 cursor-pointer select-none">Remember me on this device</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 btn-gradient text-white font-semibold text-sm rounded-xl transition-all shadow-accent hover:shadow-accent-lg hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 mt-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to Utalk</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto py-4 text-center text-xs text-slate-500 z-10 font-mono">
        &copy; {new Date().getFullYear()} Utalk Inc. All rights reserved. • Privacy • Terms
      </footer>
    </div>
  );
}

export default Login;
