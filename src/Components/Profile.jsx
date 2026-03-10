import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImage(URL.createObjectURL(file));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    if (imageFile) formData.append("img", imageFile);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        alert(data.msg || "Profile Saved");
        navigate("/home");
      } else alert(data.msg || "Failed");
    } catch (err) {
      console.error(err);
      alert("Server Error");
    }
  };

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-center text-white mb-2">Your Profile</h1>
        <p className="text-center text-gray-300 mb-8">Add your personal details and customize your account</p>
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/40 shadow-xl">
            <img src={image || "/default-avatar.png"} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <label className="mt-4 px-4 py-2 bg-white text-black rounded-xl cursor-pointer hover:bg-gray-200 transition">
            Upload Photo
            <input type="file" className="hidden" accept="image/*" onChange={handleImage} />
          </label>
        </div>
        <form className="space-y-5" onSubmit={handleProfileSubmit}>
          <input type="text" name="name" placeholder="Full Name" className="w-full px-4 py-3 bg-white/20 text-white placeholder-gray-300 border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:outline-none" />
          <input type="number" name="age" placeholder="Age" className="w-full px-4 py-3 bg-white/20 text-white placeholder-gray-300 border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:outline-none" />
          <select name="gender" className="w-full px-4 py-3 bg-white/20 text-black border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:outline-none">
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <textarea name="about" placeholder="Write About Yourself..." rows="4" className="w-full px-4 py-3 bg-white/20 text-white placeholder-gray-300 border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:outline-none" />
          <button type="submit" className="w-full bg-white text-black font-semibold py-3 rounded-xl shadow-md hover:bg-gray-200 transition mt-2">Save Profile</button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
