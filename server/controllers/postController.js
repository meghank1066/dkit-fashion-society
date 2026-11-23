import Post from "../models/Post.js";

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
        } = req.body;

        const post = await Post.create({
            title,
            subtitle,
            coverImage,
            content,
            category,
            isFeatured,
            sectionId,
            isArchived,
            showOnHomeBlog,
            author: req.user.id,
        });

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
        const posts = await Post.find()
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
            .populate("author", "username profilePic");

        console.log("Found post:", post);

        if (!post) {
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
        } = req.body;

        const updates = {};

        if (title !== undefined) updates.title = title;
        if (subtitle !== undefined) updates.subtitle = subtitle;
        if (coverImage !== undefined) updates.coverImage = coverImage;
        if (content !== undefined) updates.content = content;
        if (category !== undefined) updates.category = category;
        if (isFeatured !== undefined) updates.isFeatured = isFeatured;
        if (sectionId !== undefined) updates.sectionId = sectionId;
        if (isArchived !== undefined) updates.isArchived = isArchived;
        if (showOnHomeBlog !== undefined) updates.showOnHomeBlog = showOnHomeBlog;

        const post = await Post.findByIdAndUpdate(
            req.params.id,
            updates,
            {
                new: true,
                runValidators: true,
            }
        );

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

        await Post.bulkWrite(
            ids.map((id, index) => ({
                updateOne: {
                    filter: { _id: id },
                    update: { $set: { order: index } },
                },
            }))
        );

        res.json({ message: "Order saved" });

    } catch (error) {
        console.error("Reorder posts error:", error);
        res.status(500).json({ message: error.message });
    }
};
