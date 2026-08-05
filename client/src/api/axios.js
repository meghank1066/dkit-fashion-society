import axios from "axios";

// const API = axios.create({
//     // github backend deployment
//   baseURL: "https://dkit-fashion-backend.onrender.com",
// });

const res = await API.post("/upload", formData, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "multipart/form-data"
  }
});

export default API;
// fix