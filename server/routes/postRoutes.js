import express from "express";

import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

import {
    createPost,
    getPosts,
    getPost,
    updatePost,
    reorderPosts,
    deletePost
} from "../controllers/postController.js";

const router = express.Router();

// PUBLIC
router.get("/", getPosts);
router.get("/:id", getPost);

// ADMIN
router.post(
    "/",
    protect,
    adminOnly,
    createPost
);

// Add route for bulk reordering (must be placed before /:id routes)
router.put(
    "/reorder",
    protect,
    adminOnly,
    reorderPosts
);

router.put(
    "/:id",
    protect,
    adminOnly,
    updatePost
);

router.patch(
    "/:id",
    protect,
    adminOnly,
    updatePost
);

router.delete(
    "/:id",
    protect,
    adminOnly,
    deletePost
);

export default router;