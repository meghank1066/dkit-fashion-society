import express from "express";
import Section from "../models/Section.js";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// PUBLIC: list custom sections in display order
router.get("/", async (req, res) => {
    try {
        const sections = await Section.find().sort({ order: 1, createdAt: 1 });
        res.json(sections.map((s) => ({ id: s.key, title: s.title })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ADMIN: replace the full list of custom sections. Body: { sections: [{ id, title }] }
router.put("/", protect, adminOnly, async (req, res) => {
    try {
        const { sections } = req.body;

        if (!Array.isArray(sections)) {
            return res.status(400).json({ message: "sections must be an array" });
        }

        const clean = sections
            .filter((s) => s && s.id && s.title && s.id !== "featured" && s.id !== "uncategorized")
            .map((s, index) => ({ key: String(s.id), title: String(s.title).trim(), order: index }));

        await Section.deleteMany({});
        if (clean.length > 0) {
            await Section.insertMany(clean);
        }

        res.json(clean.map((s) => ({ id: s.key, title: s.title })));
    } catch (error) {
        console.error("Save sections error:", error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
