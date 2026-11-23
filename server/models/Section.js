import mongoose from "mongoose";

// Custom post sections created on the blog page (e.g. "Beauty Corner").
// "Featured Posts" and "All Posts" are built in and aren't stored here.
const sectionSchema = new mongoose.Schema(
    {
        key: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const Section = mongoose.model("Section", sectionSchema);

export default Section;
