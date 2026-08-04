import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import postRoutes from "./routes/postRoutes.js";


dotenv.config();


const app = express();


// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/posts", postRoutes);


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


app.listen(PORT,()=>{

    console.log(`Server running on port ${PORT}`);

});