import React from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
        navigate("/home");
      } else {
        alert(data.message || data.msg || "Login failed");
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert("Server Error. Please check console.");
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    navigate("/signup");
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-center text-white mb-2">Welcome Back</h1>
        <p className="text-center text-gray-300 mb-6">Login to access your account</p>
        <form onSubmit={handleLogin} className="space-y-5" method="post" action={Login}>
          <input
            type="email"
            placeholder="Email Address"
            name="email"
            required
            className="w-full px-4 py-3 bg-white/20 text-white placeholder-gray-300 border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            required
            className="w-full px-4 py-3 bg-white/20 text-white placeholder-gray-300 border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full bg-white text-black font-semibold py-3 rounded-xl shadow-md hover:bg-gray-200 transition"
          >
            Login
          </button>
        </form>
        <div className="text-center mt-8 text-gray-300">
          Don't have an account?
          <a
            onClick={handleSignup}
            className="text-blue-400 ml-1 hover:underline font-medium"
          >
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
