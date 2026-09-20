import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },

        subtitle: {
            type: String,
            default: "",
        },

        coverImage: {
            type: String,
            default: "center",
        },

        content: {
            type: String,
            required: true,
        },

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        category: {
            type: String,
            default: "announcement",
        },

        isFeatured: {
            type: Boolean,
            default: false,
        },

        sectionId: {
            type: String,
            default: "",
        },

        isArchived: {
            type: Boolean,
            default: false,
        },

        order: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Post = mongoose.model("Post", postSchema);

export default Post;