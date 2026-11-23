import express from "express";
import multer from "multer";
import os from "os";
import fs from "fs/promises";
import crypto from "crypto";
import cloudinary from "../config/cloudinary.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Videos are saved to a temporary file first, then sent to Cloudinary in chunks
const videoUpload = multer({
    storage: multer.diskStorage({ destination: os.tmpdir() }),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB (Cloudinary free plan's video limit)
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("video/")) cb(null, true);
        else cb(new Error("Only video files are allowed"));
    },
});

const uploadLarge = (path, options) =>
    new Promise((resolve, reject) =>
        cloudinary.uploader.upload_large(path, options, (error, result) =>
            error ? reject(error) : resolve(result)
        )
    );

// Ask Cloudinary to transcribe a video that's already uploaded.
// Done as a direct signed API call so it works whatever version of the Cloudinary SDK is installed.
async function requestTranscription(publicId) {
    const params = {
        auto_transcription: "true",
        public_id: publicId,
        timestamp: Math.floor(Date.now() / 1000).toString(),
        type: "upload",
    };
    const toSign = Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join("&");
    const signature = crypto
        .createHash("sha1")
        .update(toSign + process.env.CLOUDINARY_SECRET)
        .digest("hex");

    const body = new URLSearchParams({ ...params, api_key: process.env.CLOUDINARY_KEY, signature });
    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/video/explicit`,
        { method: "POST", body }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) {
        throw new Error(data.error?.message || `Transcription request failed (${res.status})`);
    }
    return data;
}

// ADMIN/LOGGED IN: upload a video. Returns { url, transcriptUrl, transcribing }
router.post("/", protect, (req, res) => {
    videoUpload.single("video")(req, res, async (uploadError) => {
        if (uploadError) {
            const tooBig = uploadError.code === "LIMIT_FILE_SIZE";
            return res.status(400).json({
                message: tooBig ? "That video is over 100 MB. Try a shorter or compressed version." : uploadError.message,
            });
        }
        if (!req.file) return res.status(400).json({ message: "No video uploaded" });

        try {
            const result = await uploadLarge(req.file.path, {
                resource_type: "video",
                folder: "dkit-fashion-society/videos",
                chunk_size: 20 * 1024 * 1024,
            });

            // Try to get an automatic transcript. If the account can't, the video still works.
            let transcribing = false;
            try {
                await requestTranscription(result.public_id);
                transcribing = true;
            } catch (err) {
                console.warn("Transcription not available:", err.message);
            }

            res.json({
                url: result.secure_url,
                transcriptUrl: transcribing
                    ? cloudinary.url(`${result.public_id}.transcript`, { resource_type: "raw", secure: true })
                    : null,
                transcribing,
            });
        } catch (error) {
            console.error("Video upload error:", error);
            res.status(500).json({ message: error.message || "Video upload failed" });
        } finally {
            fs.unlink(req.file.path).catch(() => {});
        }
    });
});

export default router;
