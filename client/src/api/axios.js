import axios from "axios";

const API = axios.create({
  baseURL: "https://dkit-fashion-backend.onrender.com",
});

// Send the logged-in user's token with every request, so admin actions
// (feature, reorder, archive, delete…) are accepted by the server.
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
