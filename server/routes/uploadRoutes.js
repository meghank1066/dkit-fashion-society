import express from "express";
import upload from "../middleware/upload.js";
import protect from "../middleware/authMiddleware.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// Copy an image from another website (e.g. Pinterest) into our Cloudinary,
// so it keeps working even if the original link changes. Body: { url }
router.post("/from-url", protect, async (req, res) => {
  try {
    const url = String(req.body.url || "");
    if (!/^https?:\/\//i.test(url)) {
      return res.status(400).json({ message: "That isn't an image link" });
    }

    const result = await cloudinary.uploader.upload(url, {
      folder: "dkit-fashion-society",
      resource_type: "image",
    });

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error("Upload from URL error:", error);
    res.status(400).json({ message: "Couldn't copy that image. Try saving it and uploading the file instead." });
  }
});

router.post(
  "/",
  protect,
  upload.single("image"),

  (req,res)=>{

    if(!req.file){

      return res.status(400).json({
        message:"No image uploaded"
      });

    }

    // req.file.path is the permanent Cloudinary URL (https://res.cloudinary.com/...)
    res.json({
      url: req.file.path
    });

  }
);

export default router;
