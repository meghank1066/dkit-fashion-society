import mongoose from "mongoose";

// A poll embedded in a post. Vote counts stay on the server; the public only ever
// gets percentages back.
const pollSchema = new mongoose.Schema(
    {
        question: { type: String, required: true, trim: true },

        options: {
            type: [
                {
                    text: { type: String, required: true, trim: true },
                    votes: { type: Number, default: 0 },
                },
            ],
            validate: {
                validator: (opts) => opts.length >= 2 && opts.length <= 4,
                message: "A poll needs between 2 and 4 options",
            },
        },

        // hashed browser ids of people who voted, so each browser votes once
        voters: { type: [String], default: [], select: false },

        // which option each voter picked (hashed id -> option index)
        choices: { type: Map, of: Number, default: {}, select: false },

        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

const Poll = mongoose.model("Poll", pollSchema);

export default Poll;
