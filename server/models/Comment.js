import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true, index: true },
        name: { type: String, required: true, trim: true, maxlength: 50 },
        text: { type: String, required: true, trim: true, maxlength: 1000 },
        // set when the commenter was logged in
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
