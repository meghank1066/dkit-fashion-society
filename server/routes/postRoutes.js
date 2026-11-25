import express from "express";

import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

import {
    createPost,
    getPosts,
    getPost,
    updatePost,
    deletePost,
    reorderPosts,
    recordView,
    getDrafts
} from "../controllers/postController.js";

const router = express.Router();


// PUBLIC

router.get("/", getPosts);

// ADMIN: all drafts (must come before "/:id")
router.get("/drafts", protect, adminOnly, getDrafts);

router.get("/:id", getPost);

router.post("/:id/view", recordView);


// ADMIN

// must come before "/:id" so "reorder" isn't treated as a post id
router.put(
    "/reorder",
    protect,
    adminOnly,
    reorderPosts
);

router.post(
    "/",
    protect,
    adminOnly,
    createPost
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