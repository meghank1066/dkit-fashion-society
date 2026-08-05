import axios from "axios";

const API = axios.create({
    // github backend deployment
  baseURL: "https://dkit-fashion-backend.onrender.com",
});

export default API;