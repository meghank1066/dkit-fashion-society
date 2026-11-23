import express from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import Poll from "../models/Poll.js";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

const hashVoter = (voterId) =>
    crypto.createHash("sha256").update(`poll-voter:${voterId}`).digest("hex");

// Percentages that add up to exactly 100 (largest remainder method). No counts are ever sent.
function toPercentages(options) {
    const total = options.reduce((sum, o) => sum + (o.votes || 0), 0);
    if (total === 0) return options.map(() => 0);

    const raw = options.map((o) => ((o.votes || 0) / total) * 100);
    const floored = raw.map(Math.floor);
    let remaining = 100 - floored.reduce((a, b) => a + b, 0);

    raw.map((r, i) => ({ i, frac: r - floored[i] }))
        .sort((a, b) => b.frac - a.frac)
        .forEach(({ i }) => {
            if (remaining > 0) {
                floored[i] += 1;
                remaining -= 1;
            }
        });

    return floored;
}

async function publicPoll(id, voterId) {
    const poll = await Poll.findById(id).select("+choices");
    if (!poll) return null;

    const key = voterId ? hashVoter(voterId) : null;
    const votedFor = key && poll.choices?.has(key) ? poll.choices.get(key) : null;
    const percents = toPercentages(poll.options);

    return {
        id: poll._id,
        question: poll.question,
        options: poll.options.map((o, i) => ({ text: o.text, percent: percents[i] })),
        hasVoted: votedFor !== null,
        votedFor,
    };
}

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

// ADMIN: create a poll. Body: { question, options: ["A", "B", ...] } (2-4 options)
router.post("/", protect, adminOnly, async (req, res) => {
    try {
        const question = String(req.body.question || "").trim();
        const options = (Array.isArray(req.body.options) ? req.body.options : [])
            .map((t) => String(t || "").trim())
            .filter(Boolean);

        if (!question) return res.status(400).json({ message: "Add a question" });
        if (options.length < 2 || options.length > 4) {
            return res.status(400).json({ message: "A poll needs between 2 and 4 options" });
        }

        const poll = await Poll.create({
            question,
            options: options.map((text) => ({ text })),
            createdBy: req.user._id,
        });

        res.status(201).json(await publicPoll(poll._id));
    } catch (error) {
        console.error("Create poll error:", error);
        res.status(500).json({ message: error.message });
    }
});

// PUBLIC: poll with percentages. ?voter=<browser id> tells you if this browser has voted.
router.get("/:id", async (req, res) => {
    try {
        if (!validId(req.params.id)) return res.status(404).json({ message: "Poll not found" });
        const poll = await publicPoll(req.params.id, req.query.voter);
        if (!poll) return res.status(404).json({ message: "Poll not found" });
        res.json(poll);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUBLIC: vote. Body: { option: <index>, voter: <browser id> }. One vote per browser.
router.post("/:id/vote", async (req, res) => {
    try {
        const { id } = req.params;
        const option = Number(req.body.option);
        const voter = String(req.body.voter || "");

        if (!validId(id)) return res.status(404).json({ message: "Poll not found" });
        if (!voter || voter.length < 10) return res.status(400).json({ message: "Missing voter id" });

        const poll = await Poll.findById(id);
        if (!poll) return res.status(404).json({ message: "Poll not found" });
        if (!Number.isInteger(option) || option < 0 || option >= poll.options.length) {
            return res.status(400).json({ message: "Invalid option" });
        }

        const key = hashVoter(voter);

        // Only counts if this browser hasn't voted yet (checked and saved in one step)
        await Poll.updateOne(
            { _id: id, voters: { $ne: key } },
            {
                $inc: { [`options.${option}.votes`]: 1 },
                $push: { voters: key },
                $set: { [`choices.${key}`]: option },
            }
        );

        res.json(await publicPoll(id, voter));
    } catch (error) {
        console.error("Vote error:", error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
