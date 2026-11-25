import express from "express";
import mongoose from "mongoose";
import CalendarEvent from "../models/CalendarEvent.js";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";
import Setting from "../models/Setting.js";

// The first time the calendar loads, add the semester 2 plans (dates are provisional; admins can edit them).
// Only ever runs once, so deleting one of these later won't bring it back.
const STARTER_EVENTS = [
    {
        semester: 2,
        date: "2027-01-26",
        title: "EGM for New Members",
        time: "TBC",
        location: "DkIT campus",
        description: "New semester, new faces. Come meet the committee and find out how to get involved.",
    },
    {
        semester: 2,
        date: "2027-02-23",
        title: "Dress Like Your Type",
        time: "TBC",
        location: "TBC",
        description: "Show up as your type, whatever that means to you. Interpret freely.",
    },
    {
        semester: 2,
        date: "2027-03-09",
        title: "Annual Photoshoot",
        time: "TBC",
        location: "TBC",
        description: "Styling, posing and far too many outfit changes. Our big shoot of the year.",
    },
    {
        semester: 2,
        date: "2027-03-16",
        title: "DkIT Fashion Society Ball",
        time: "TBC",
        location: "TBC",
        description: "The night of the year, right before Easter break. Start planning the look now.",
    },
];

let seedChecked = false;
async function seedOnce() {
    if (seedChecked) return;
    seedChecked = true;
    const done = await Setting.findOne({ key: "calendar-seeded" });
    if (done) return;
    if ((await CalendarEvent.countDocuments()) === 0) {
        await CalendarEvent.insertMany(STARTER_EVENTS);
    }
    await Setting.create({ key: "calendar-seeded", value: true });
}

const router = express.Router();

// Only accept the fields we expect, tidied up
function clean(body) {
    const out = {};
    if (body.semester !== undefined) out.semester = Number(body.semester) === 2 ? 2 : 1;
    if (body.date !== undefined) out.date = body.date;
    if (body.title !== undefined) out.title = String(body.title).trim();
    if (body.time !== undefined) out.time = String(body.time).trim() || "TBC";
    if (body.location !== undefined) out.location = String(body.location).trim() || "TBC";
    if (body.description !== undefined) out.description = String(body.description).trim();
    return out;
}

// PUBLIC: all calendar events, in date order
router.get("/", async (req, res) => {
    try {
        await seedOnce().catch((err) => console.error("Calendar seed error:", err));
        const events = await CalendarEvent.find().sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ADMIN: add an event
router.post("/", protect, adminOnly, async (req, res) => {
    try {
        const data = clean(req.body);
        if (!data.title || !data.date) return res.status(400).json({ message: "Add an event name and date" });
        const event = await CalendarEvent.create(data);
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ADMIN: edit an event
router.put("/:id", protect, adminOnly, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: "Event not found" });
        const data = clean(req.body);
        if (data.title === "") return res.status(400).json({ message: "Add an event name" });
        const event = await CalendarEvent.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
        if (!event) return res.status(404).json({ message: "Event not found" });
        res.json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ADMIN: delete an event
router.delete("/:id", protect, adminOnly, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: "Event not found" });
        await CalendarEvent.findByIdAndDelete(req.params.id);
        res.json({ message: "Event deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
