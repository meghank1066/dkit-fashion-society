import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

export default function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fetchError, setFetchError] = useState("");

  const token = localStorage.getItem("token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await API.get("/api/auth/me", config);
        const user = response.data.user;
        setUserData(user);
        setUsername(user.username || "");
        setProfilePic(user.profilePic || user.profileImage || "");
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setFetchError("Failed to load profile. Please check if you are logged in.");
      }
    };

    fetchUserData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
    const response = await API.put(
  "/api/users/update-profile",
  { username, profilePic },
  config
);
      setUserData(response.data.user);
      setUsername(response.data.user.username);
      setIsEditingUsername(false);
      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      setMessage(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchError) {
    return (
      <div className="min-h-screen bg-[#011145] p-5 md:p-10 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white border border-gray-200 shadow-2xl p-6 md:p-8 text-center text-[#011145]">
          <p className="text-red-600 font-medium">{fetchError}</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-[#011145] flex items-center justify-center">
        <p className="text-white p-6 text-center">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#011145] p-5 md:p-10 text-white">
      <div className="max-w-xl mx-auto bg-white text-[#011145] border border-gray-200 shadow-2xl p-6 md:p-8 rounded-none mt-10">
        <h2 className="font-serif text-3xl text-[#011145] mb-6">User Profile</h2>

        {message && (
          <div
            className={`mb-4 p-3 rounded-none text-sm ${
              message.includes("success")
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-5">
          {/* Profile Picture Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-[#011145]">
              Profile Picture
            </label>

            <div className="flex items-center gap-4">
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Profile preview"
                  className="w-20 h-20 rounded-none object-cover border-2 border-[#011145]"
                />
              ) : (
                <div className="w-20 h-20 rounded-none bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                  No Image
                </div>
              )}

              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="Paste image URL"
                  value={profilePic}
                  onChange={(e) => setProfilePic(e.target.value)}
                  className="w-full border border-gray-300 bg-white text-[#011145] p-3 rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-[#011145]"
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const formData = new FormData();
                    formData.append("image", file);

                    try {
                    const res = await API.post("/api/upload", formData, {
                        headers: {
                          Authorization: `Bearer ${token}`,
                          "Content-Type": "multipart/form-data",
                        },
                      });
                      setProfilePic(res.data.url);
                    } catch (error) {
                      console.error("Image upload failed:", error);
                    }
                  }}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-semibold file:bg-[#011145] file:text-white hover:file:bg-[#020d32] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Username Input with Edit Toggle Button */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-[#011145]">Username</label>
              <button
                type="button"
                onClick={() => setIsEditingUsername(!isEditingUsername)}
                className="text-xs text-blue-700 font-semibold underline hover:text-[#011145] cursor-pointer"
              >
                {isEditingUsername ? "Cancel" : "Edit Username"}
              </button>
            </div>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={!isEditingUsername}
              required
              className={`w-full border rounded-none p-3 focus:outline-none focus:ring-2 focus:ring-[#011145] ${
                isEditingUsername
                  ? "border-gray-300 bg-white text-[#011145]"
                  : "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
              }`}
            />
          </div>

          {/* Unchangeable Email */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#011145]">
              Email (Cannot be changed)
            </label>
            <input
              type="email"
              value={userData.email}
              disabled={true}
              className="w-full border border-gray-200 bg-gray-100 rounded-none p-3 text-gray-500 cursor-not-allowed focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#011145] text-white px-8 py-3 rounded-none hover:bg-[#020d32] transition w-full font-semibold cursor-pointer"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {/* Change Password Navigation Button */}
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <Link
            to="/change-password"
            className="inline-block w-full border border-[#011145] text-[#011145] px-8 py-3 rounded-none hover:bg-[#011145] hover:text-white transition duration-300 font-semibold text-sm"
          >
            Change Password
          </Link>
        </div>
      </div>
    </div>
  );
}