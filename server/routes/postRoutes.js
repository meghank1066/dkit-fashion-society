import express from "express";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";
import { 
    createPost, 
    getPosts, 
    updatePost, 
    deletePost 
} from "../controllers/postController.js";

const router = express.Router();


router.get("/", getPosts);

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

router.delete(
    "/:id",
    protect,
    adminOnly,
    deletePost
);


export default router;