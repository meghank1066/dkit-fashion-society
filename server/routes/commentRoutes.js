import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

// If the request has a valid login token, return that user (otherwise null). Never blocks.
async function optionalUser(req) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return null;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return await User.findById(decoded.id).select("username role");
    } catch {
        return null;
    }
}

// Very simple flood protection: max 5 comments per 10 minutes from one IP
const recent = new Map();
function tooMany(ip) {
    const now = Date.now();
    const list = (recent.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
    if (list.length >= 5) {
        recent.set(ip, list);
        return true;
    }
    list.push(now);
    recent.set(ip, list);
    return false;
}

const toPublic = (c) => ({
    id: c._id,
    name: c.name,
    text: c.text,
    isMember: !!c.user,
    createdAt: c.createdAt,
});

// PUBLIC: comments on a post, oldest first
router.get("/post/:postId", async (req, res) => {
    try {
        if (!validId(req.params.postId)) return res.json([]);
        const comments = await Comment.find({ post: req.params.postId }).sort({ createdAt: 1 });
        res.json(comments.map(toPublic));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUBLIC: add a comment. Body: { name, text }. Logged-in users comment under their username.
router.post("/post/:postId", async (req, res) => {
    try {
        const { postId } = req.params;
        if (!validId(postId)) return res.status(404).json({ message: "Post not found" });

        // hidden "website" field: real people leave it empty, spam bots fill it in
        if (req.body.website) return res.status(201).json({ ok: true });

        const text = String(req.body.text || "").trim();
        if (!text) return res.status(400).json({ message: "Write a comment first" });
        if (text.length > 1000) return res.status(400).json({ message: "Comments can be up to 1000 characters" });

        const user = await optionalUser(req);
        const name = user ? user.username : String(req.body.name || "").trim();
        if (!name) return res.status(400).json({ message: "Add your name" });
        if (name.length > 50) return res.status(400).json({ message: "Name can be up to 50 characters" });

        const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
        if (tooMany(ip)) return res.status(429).json({ message: "Slow down a little! Try again in a few minutes." });

        const exists = await Post.exists({ _id: postId });
        if (!exists) return res.status(404).json({ message: "Post not found" });

        const comment = await Comment.create({ post: postId, name, text, user: user?._id || null });
        res.status(201).json(toPublic(comment));
    } catch (error) {
        console.error("Add comment error:", error);
        res.status(500).json({ message: error.message });
    }
});

// ADMIN: delete a comment
router.delete("/:id", protect, adminOnly, async (req, res) => {
    try {
        if (!validId(req.params.id)) return res.status(404).json({ message: "Comment not found" });
        const deleted = await Comment.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Comment not found" });
        res.json({ message: "Comment deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
