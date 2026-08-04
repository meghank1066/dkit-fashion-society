import { useState, useEffect } from "react";
import API from "../api/axios"; // Your custom Axios instance

export default function UserProfile() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await API.get("/auth/me");
        setUserData(response.data.user);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, []);

  if (!userData) return <p>Loading profile...</p>;

  return (
    <div>
      <p>Username: {userData.username}</p>
      <p>Email: {userData.email}</p>
    </div>
  );
}