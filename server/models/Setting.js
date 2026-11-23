import mongoose from "mongoose";

// Simple site-wide settings, e.g. { key: "hero-home", value: "https://res.cloudinary.com/..." }
const settingSchema = new mongoose.Schema(
    {
        key: { type: String, required: true, unique: true },
        value: { type: mongoose.Schema.Types.Mixed, default: null },
    },
    { timestamps: true }
);

const Setting = mongoose.model("Setting", settingSchema);

export default Setting;
