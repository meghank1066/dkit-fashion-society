import { useEffect, useState } from "react";
import API from "../api/axios";

// A random id saved in this browser, so each browser can vote once per poll
export function getVoterId() {
  try {
    let id = localStorage.getItem("poll_voter_id");
    if (!id) {
      id =
        (window.crypto?.randomUUID && window.crypto.randomUUID()) ||
        `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem("poll_voter_id", id);
    }
    return id;
  } catch {
    return null;
  }
}

// Shows a poll. Before voting: option buttons. After voting: percentage bars (never vote counts).
// preview = true is used inside the editor: shows the poll but you can't vote.
export default function PollWidget({ pollId, preview = false }) {
  const [poll, setPoll] = useState(null);
  const [error, setError] = useState("");
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    if (!pollId) return;
    const voter = getVoterId();
    API.get(`/api/polls/${pollId}`, { params: voter ? { voter } : {} })
      .then((res) => setPoll(res.data))
      .catch(() => setError("This poll is no longer available."));
  }, [pollId]);

  const vote = async (index) => {
    if (preview || voting || poll?.hasVoted) return;
    const voter = getVoterId();
    if (!voter) return alert("Voting needs browser storage turned on.");
    setVoting(true);
    try {
      const res = await API.post(`/api/polls/${pollId}/vote`, { option: index, voter });
      setPoll(res.data);
    } catch (err) {
      alert("Couldn't record your vote: " + (err.response?.data?.message || err.message));
    } finally {
      setVoting(false);
    }
  };

  if (error) {
    return preview ? (
      <div className="not-prose border border-dashed border-gray-300 p-4 text-sm text-gray-500 my-8">{error}</div>
    ) : null;
  }

  if (!poll) {
    return <div className="not-prose border border-gray-200 p-6 text-sm text-gray-400 my-8">Loading poll…</div>;
  }

  const showResults = poll.hasVoted;

  return (
    <div className="not-prose border border-[#011145]/20 bg-[#f7f8fb] p-6 sm:p-8 my-10 font-sans">
      <span className="text-[11px] uppercase tracking-[0.3em] text-gray-400 font-semibold">Poll</span>
      <h3 className="font-serif text-2xl sm:text-3xl text-[#011145] mt-2 mb-6 leading-snug">{poll.question}</h3>

      <div className="space-y-3">
        {poll.options.map((opt, i) =>
          showResults ? (
            <div key={i} className="relative border border-gray-200 bg-white overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 transition-all duration-700"
                style={{ width: `${opt.percent}%`, backgroundColor: poll.votedFor === i ? "rgba(1,17,69,0.22)" : "rgba(1,17,69,0.10)" }}
              />
              <div className="relative flex items-center justify-between px-4 py-3 text-[15px]">
                <span className={`text-[#011145] ${poll.votedFor === i ? "font-semibold" : ""}`}>
                  {opt.text}
                  {poll.votedFor === i && <span className="ml-2 text-xs">✓ Your vote</span>}
                </span>
                <span className="font-semibold text-[#011145]">{opt.percent}%</span>
              </div>
            </div>
          ) : (
            <button
              key={i}
              type="button"
              disabled={preview || voting}
              onClick={() => vote(i)}
              className={`w-full text-left px-4 py-3 text-[15px] border border-[#011145]/40 bg-white text-[#011145] transition-colors ${
                preview ? "cursor-default" : "hover:bg-[#011145] hover:text-white cursor-pointer"
              } disabled:opacity-80`}
            >
              {opt.text}
            </button>
          )
        )}
      </div>

      <p className="text-xs text-gray-400 mt-4">
        {preview
          ? "Preview: readers vote on the published post."
          : showResults
          ? "Thanks for voting! Results are shown as percentages."
          : "Tap an option to vote. Results appear after you vote."}
      </p>
    </div>
  );
}
