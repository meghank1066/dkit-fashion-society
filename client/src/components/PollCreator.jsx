import { useState } from "react";
import API from "../api/axios";

// Pop-up for making a poll: a question and 2-4 options.
// onCreated(pollId) is called once the poll is saved.
export default function PollCreator({ onCancel, onCreated }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [saving, setSaving] = useState(false);

  const filled = options.map((o) => o.trim()).filter(Boolean);
  const canSave = question.trim() && filled.length >= 2 && !saving;

  const setOption = (i, value) => setOptions((prev) => prev.map((o, j) => (j === i ? value : o)));

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const res = await API.post("/api/polls", { question: question.trim(), options: filled });
      onCreated(res.data.id);
    } catch (err) {
      alert("Couldn't create the poll: " + (err.response?.data?.message || err.message));
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && !saving && onCancel()}
    >
      <div className="bg-white w-full max-w-lg shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-serif text-2xl text-[#011145]">Add a poll</h3>
          <p className="text-xs text-gray-500 mt-1">2 to 4 options. Readers only ever see percentages, not vote counts.</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#011145] mb-1">Question</label>
            <input
              autoFocus
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Which event should we run next?"
              maxLength={200}
              className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#011145]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#011145]">Options</label>
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={opt}
                  onChange={(e) => setOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  maxLength={120}
                  className="flex-1 border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#011145]"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    title="Remove option"
                    onClick={() => setOptions((prev) => prev.filter((_, j) => j !== i))}
                    className="px-3 border border-gray-300 text-gray-500 hover:bg-[#011145] hover:text-white hover:border-[#011145] transition"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            {options.length < 4 && (
              <button
                type="button"
                onClick={() => setOptions((prev) => [...prev, ""])}
                className="text-sm font-semibold text-[#011145] hover:underline"
              >
                + Add option
              </button>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-5 h-10 text-sm font-semibold border border-gray-300 text-[#011145] hover:bg-gray-100 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!canSave}
            className="px-6 h-10 text-sm font-semibold bg-[#011145] text-white hover:bg-[#02206e] transition disabled:opacity-40"
          >
            {saving ? "Adding…" : "Add poll"}
          </button>
        </div>
      </div>
    </div>
  );
}
