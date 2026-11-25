import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import jwt from "jsonwebtoken";

// True if the request comes from a logged-in admin (view counts are only shown to admins)
const isAdminRequest = (req) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return false;
        return jwt.verify(token, process.env.JWT_SECRET).role === "admin";
    } catch {
        return false;
    }
};

export const createPost = async (req, res) => {
    try {
        const {
            title,
            subtitle,
            coverImage,
            content,
            category,
            isFeatured,
            sectionId,
            isArchived,
            showOnHomeBlog,
            eventDate,
            status,
        } = req.body;

        const isDraft = status === "draft";
        const post = await Post.create({
            title: isDraft && !String(title || "").trim() ? "Untitled draft" : title,
            subtitle,
            coverImage,
            content: isDraft && !content ? "<p></p>" : content,
            category,
            isFeatured,
            sectionId,
            isArchived,
            showOnHomeBlog,
            eventDate: eventDate || null,
            status: isDraft ? "draft" : "published",
            lastEditedBy: req.user.id,
            author: req.user.id,
        });

        await post.populate("lastEditedBy", "username");

        res.status(201).json({
            message: "Post created",
            post,
        });

    } catch (error) {
        console.error("Create post error:", error);

        res.status(500).json({
            message: error.message,
        });
    }
};

export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find({ status: { $ne: "draft" } })
            .select(isAdminRequest(req) ? "" : "-views") // view counts are private to admins
            .populate("author", "username profilePic") // ✅ Fixed from "user" to "author"
            .sort({ order: 1, createdAt: -1 });

        res.json(posts);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const getPost = async (req, res) => {
    try {
        console.log("Searching for post ID:", req.params.id);

        const post = await Post.findById(req.params.id)
            .select(isAdminRequest(req) ? "" : "-views") // view counts are private to admins
            .populate("author", "username profilePic");

        console.log("Found post:", post);

        if (!post || (post.status === "draft" && !isAdminRequest(req))) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        res.json(post);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
};

export const updatePost = async (req, res) => {
    try {
        const {
            title,
            subtitle,
            coverImage,
            content,
            category,
            isFeatured,
            sectionId,
            isArchived,
            showOnHomeBlog,
            eventDate,
            status,
            expectedUpdatedAt,
        } = req.body;

        // If two admins have the same draft open, don't let one silently overwrite the other
        if (expectedUpdatedAt) {
            const current = await Post.findById(req.params.id)
                .select("updatedAt lastEditedBy")
                .populate("lastEditedBy", "username");
            if (current && new Date(current.updatedAt).getTime() !== new Date(expectedUpdatedAt).getTime()) {
                return res.status(409).json({
                    message: `${current.lastEditedBy?.username || "Another admin"} saved changes to this post after you opened it.`,
                    conflict: true,
                });
            }
        }

        const updates = { lastEditedBy: req.user.id };

        if (title !== undefined) updates.title = title;
        if (subtitle !== undefined) updates.subtitle = subtitle;
        if (coverImage !== undefined) updates.coverImage = coverImage;
        if (content !== undefined) updates.content = content;
        if (category !== undefined) updates.category = category;
        if (isFeatured !== undefined) updates.isFeatured = isFeatured;
        if (sectionId !== undefined) updates.sectionId = sectionId;
        if (isArchived !== undefined) updates.isArchived = isArchived;
        if (showOnHomeBlog !== undefined) updates.showOnHomeBlog = showOnHomeBlog;
        if (eventDate !== undefined) updates.eventDate = eventDate || null; // empty clears it
        if (status === "draft" || status === "published") updates.status = status;

        const post = await Post.findByIdAndUpdate(
            req.params.id,
            updates,
            {
                new: true,
                runValidators: true,
            }
        ).populate("lastEditedBy", "username");

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
            });
        }

        res.json({
            message: "Post updated",
            post,
        });

    } catch (error) {
        console.error("Update post error:", error);

        res.status(500).json({
            message: error.message,
        });
    }
};

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        // tidy up: remove the deleted post's comments too
        await Comment.deleteMany({ post: post._id });

        res.json({
            message: "Post deleted"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Save a new display order. Body: { ids: [postId, postId, ...] } in the order to show them.
export const reorderPosts = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "ids must be a non-empty array" });
        }

        // Update each post's position one by one (Mongoose converts the id strings properly here)
        const results = await Promise.all(
            ids.map((id, index) =>
                Post.updateOne({ _id: id }, { $set: { order: index } })
            )
        );
        const updated = results.reduce((sum, r) => sum + (r.matchedCount || 0), 0);
        console.log(`Reorder: ${updated}/${ids.length} posts updated`);

        res.json({ message: "Order saved", updated });

    } catch (error) {
        console.error("Reorder posts error:", error);
        res.status(500).json({ message: error.message });
    }
};


// Count a view - every visit counts. (Only a few seconds' guard against an accidental double send.)
const recentViews = new Map();
export const recordView = async (req, res) => {
    try {
        const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
        const key = `${ip}:${req.params.id}`;
        const now = Date.now();
        if (recentViews.has(key) && now - recentViews.get(key) < 5 * 1000) {
            return res.json({ counted: false });
        }
        recentViews.set(key, now);
        if (recentViews.size > 5000) {
            for (const [k, t] of recentViews) if (now - t > 5 * 1000) recentViews.delete(k);
        }

        // timestamps: false so a view doesn't change the post's "last updated" date
        await Post.updateOne({ _id: req.params.id }, { $inc: { views: 1 } }, { timestamps: false });
        res.json({ counted: true }); // the count itself is never sent back to the public
    } catch (error) {
        res.status(400).json({ message: "Couldn't record view" });
    }
};


// ADMIN: every admin's drafts, most recently edited first
export const getDrafts = async (req, res) => {
    try {
        const drafts = await Post.find({ status: "draft" })
            .populate("author", "username profilePic")
            .populate("lastEditedBy", "username")
            .sort({ updatedAt: -1 });
        res.json(drafts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
