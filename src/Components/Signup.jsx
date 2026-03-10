import React from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const phonenumber = e.target.phonenumber.value;
    const password = e.target.password.value;
    const confirmpassword = e.target.confirmpassword.value;

    if (password !== confirmpassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phonenumber, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Signup successful! Please login.");
        navigate("/");
      } else {
        alert(data.message || data.msg || "Signup failed");
      }
    } catch (err) {
      console.error("Signup Error:", err);
      alert("Server Error. Please check console.");
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-center text-white mb-2">Create Account</h1>
        <p className="text-center text-gray-300 mb-6">Join us and explore the platform</p>
        <form onSubmit={handleSignup} className="space-y-5">
          <input
            type="text"
            placeholder="Full Name"
            name="name"
            required
            className="w-full px-4 py-3 bg-white/20 text-white placeholder-gray-300 border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Phone Number"
            name="phonenumber"
            required
            className="w-full px-4 py-3 bg-white/20 text-white placeholder-gray-300 border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:outline-none"
          />
          <input
            type="email"
            placeholder="Email Address"
            name="email"
            required
            className="w-full px-4 py-3 bg-white/20 text-white placeholder-gray-300 border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Create Password"
            name="password"
            required
            className="w-full px-4 py-3 bg-white/20 text-white placeholder-gray-300 border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            name="confirmpassword"
            required
            className="w-full px-4 py-3 bg-white/20 text-white placeholder-gray-300 border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full bg-white text-black font-semibold py-3 rounded-xl shadow-md hover:bg-gray-200 transition mt-4"
          >
            Signup
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
