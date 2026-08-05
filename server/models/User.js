import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, default: "user" },
        profileImage: { type: String, default: "" },
        profilePic: { type: String, default: "" },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema, "users");

export default User;