import Post from "../models/Post.js";

export const createPost = async (req, res) => {
    try {
        const {
            title,
            subtitle,
            coverImage,
            content,
            category
        } = req.body;

        const post = await Post.create({
            title,
            subtitle,
            coverImage,
            content,
            category,
            author: req.user.id
        });

        res.status(201).json({
            message: "Post created",
            post
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "username profilePic") // ✅ Fixed from "user" to "author"
            .sort({ createdAt: -1 });

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
            category
        } = req.body;

        const post = await Post.findByIdAndUpdate(
            req.params.id,
            {
                title,
                subtitle,
                coverImage,
                content,
                category
            },
            {
                new: true
            }
        );

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        res.json({
            message: "Post updated",
            post
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
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