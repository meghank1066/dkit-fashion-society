import axios from "axios";

const API = axios.create({
  baseURL: "https://dkit-fashion-backend.onrender.com",
});

export default API;