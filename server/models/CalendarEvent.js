import mongoose from "mongoose";

// An event on the homepage calendar (separate from blog posts)
const calendarEventSchema = new mongoose.Schema(
    {
        semester: { type: Number, enum: [1, 2], required: true },
        date: { type: Date, required: true },
        title: { type: String, required: true, trim: true, maxlength: 120 },
        time: { type: String, trim: true, default: "TBC", maxlength: 40 },
        location: { type: String, trim: true, default: "TBC", maxlength: 80 },
        description: { type: String, trim: true, default: "", maxlength: 300 },
    },
    { timestamps: true }
);

const CalendarEvent = mongoose.model("CalendarEvent", calendarEventSchema);

export default CalendarEvent;
