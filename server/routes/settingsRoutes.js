import express from "express";
import Setting from "../models/Setting.js";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// Only these settings can be read/changed through the API
const ALLOWED = new Set(["hero-home", "hero-posts", "hero-about"]);

// PUBLIC: read one setting
router.get("/:key", async (req, res) => {
    try {
        const { key } = req.params;
        if (!ALLOWED.has(key)) return res.status(404).json({ message: "Unknown setting" });
        const setting = await Setting.findOne({ key });
        res.json({ key, value: setting ? setting.value : null });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ADMIN: change one setting. Body: { value }
router.put("/:key", protect, adminOnly, async (req, res) => {
    try {
        const { key } = req.params;
        if (!ALLOWED.has(key)) return res.status(404).json({ message: "Unknown setting" });
        const setting = await Setting.findOneAndUpdate(
            { key },
            { $set: { value: req.body.value ?? null } },
            { upsert: true, new: true }
        );
        res.json({ key, value: setting.value });
    } catch (error) {
        console.error("Save setting error:", error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
