import { useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext"; // 1. Import useAuth

export default function ChangePassword() {
  const { user } = useAuth(); // 2. Extract user from context

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    try {
      await API.put("/auth/change-password", {
        currentPassword,
        newPassword
      });

      setMessage("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch(error) {
      setMessage(
        error.response?.data?.message ||
        "Error changing password"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5f0] flex justify-center py-16 px-4">
      <div className="bg-white shadow-lg w-full max-w-2xl border border-gray-100">

        {/* Header */}
        <div className="p-10 border-b border-gray-200">
          <h1 className="font-serif text-5xl text-[#011145]">
            Settings
          </h1>
          <p className="text-gray-500 mt-2">
            Manage your account preferences
          </p>
        </div>

        {/* Account Section */}
        <div className="p-10 border-b border-gray-200">
          <h2 className="uppercase tracking-widest text-xs font-semibold text-gray-400 mb-6">
            Account Details
          </h2>

          <div className="space-y-4">

            {/* Username Row */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <span className="text-gray-600">
                Username
              </span>
              <span className="text-[#011145] font-medium">
                {user?.username || "—"}
              </span>
            </div>

            {/* Email Row */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <span className="text-gray-600">
                Email
              </span>
              <span className="text-[#011145] font-medium">
                {user?.email || "—"}
              </span>
            </div>

          </div>
        </div>

        {/* Password Section */}
        {/* <form 
          onSubmit={submit}
          className="p-10"
        >
          <h2 className="uppercase tracking-widest text-xs font-semibold text-gray-400 mb-6">
            Security
          </h2>

          <label className="block text-sm mb-2 text-[#011145] font-medium">
            Current Password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border p-3 mb-5 focus:outline-none focus:border-[#011145]"
            required
          />

          <label className="block text-sm mb-2 text-[#011145] font-medium">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border p-3 mb-6 focus:outline-none focus:border-[#011145]"
            required
          />

          <button
           type="submit"
            className="bg-[#011145] text-white px-8 py-3 hover:opacity-90 transition cursor-pointer"
          >
            Update Password
          </button>

          {message && (
            <p className="mt-5 text-sm text-gray-600">
              {message}
            </p>
          )}
        </form> */}

      </div>
    </div>
  );
}