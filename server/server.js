import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import sectionRoutes from "./routes/sectionRoutes.js";
import pollRoutes from "./routes/pollRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";


dotenv.config();


const app = express();


// Middleware
app.use(cors({
  origin: [
    'https://www.dkitfashionsociety.com', 
    'https://dkitfashionsociety.com',
    'http://localhost:5173' // for local testing
  ],
  credentials: true
}));
app.use(express.json());

// uploads
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/videos", videoRoutes);

// Test route
app.get("/", (req,res)=>{

    res.json({
        message:"Fashion Society API running"
    });

});


// Database
mongoose.connect(process.env.MONGO_URI)
.then(()=>{

    console.log("MongoDB connected ✅");

})
.catch((error)=>{

    console.log(
        "MongoDB connection failed ❌",
        error.message
    );

});


// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});