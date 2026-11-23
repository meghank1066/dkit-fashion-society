import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const MAX = 1000;

const formatWhen = (date) =>
  new Date(date).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" });

// Comment section shown under every article.
// Anyone can comment with just a name; logged-in users comment under their username.
// Admins see a Delete button on every comment.
export default function Comments({ postId }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem("comment_name") || "";
    } catch {
      return "";
    }
  });
  const [text, setText] = useState("");
  const [website, setWebsite] = useState(""); // hidden spam trap
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    API.get(`/api/comments/post/${postId}`)
      .then((res) => setComments(res.data))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [postId]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!user && !name.trim()) return setError("Add your name so we know who's talking!");
    if (!text.trim()) return setError("Write a comment first.");

    setPosting(true);
    try {
      const res = await API.post(`/api/comments/post/${postId}`, {
        name: name.trim(),
        text: text.trim(),
        website,
      });
      if (res.data?.id) setComments((prev) => [...prev, res.data]);
      setText("");
      if (!user) {
        try {
          localStorage.setItem("comment_name", name.trim());
        } catch {
          /* ignore */
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't post your comment. Try again.");
    } finally {
      setPosting(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this comment? This can't be undone.")) return;
    try {
      await API.delete(`/api/comments/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert("Couldn't delete it: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <section className="max-w-3xl mx-auto px-6 sm:px-10 pb-24">
      <div className="border-t border-[#011145]/15 pt-12">
        <h2 className="font-serif text-4xl text-[#011145]">
          Comments{comments.length > 0 && <span className="text-gray-400 text-2xl ml-2">({comments.length})</span>}
        </h2>

        {/* List */}
        <div className="mt-8 space-y-5">
          {loading ? (
            <p className="text-sm text-gray-400">Loading comments…</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-gray-500">No comments yet. Be the first to say something!</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="bg-white border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-semibold text-[#011145]">{c.name}</span>
                    {c.isMember && (
                      <span className="ml-2 text-[10px] uppercase tracking-widest font-semibold text-white bg-[#011145] px-1.5 py-0.5 align-middle">
                        Member
                      </span>
                    )}
                    <span className="block text-xs text-gray-400 mt-0.5">{formatWhen(c.createdAt)}</span>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => remove(c.id)}
                      className="text-xs font-semibold border border-red-300 text-red-600 px-2.5 py-1 hover:bg-red-600 hover:text-white hover:border-red-600 transition"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="mt-3 text-gray-700 leading-relaxed whitespace-pre-line break-words">{c.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Form */}
        <form onSubmit={submit} className="mt-10 bg-white border border-[#011145]/20 p-5 sm:p-6 space-y-4">
          <h3 className="font-serif text-2xl text-[#011145]">Leave a comment</h3>

          {user ? (
            <p className="text-sm text-gray-500">
              Commenting as <span className="font-semibold text-[#011145]">{user.username}</span>
            </p>
          ) : (
            <div>
              <label className="block text-sm font-medium text-[#011145] mb-1">Your name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                placeholder="e.g. Aoife"
                className="w-full border border-[#011145]/30 bg-white p-3 text-sm focus:outline-none focus:border-[#011145] transition"
              />
            </div>
          )}

          {/* spam trap: hidden from people, bots fill it in */}
          <input
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />

          <div>
            <label className="block text-sm font-medium text-[#011145] mb-1">Comment</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX))}
              rows={4}
              placeholder="What did you think?"
              className="w-full border border-[#011145]/30 bg-white p-3 text-sm focus:outline-none focus:border-[#011145] transition"
            />
            <span className="block text-right text-xs text-gray-400">
              {text.length}/{MAX}
            </span>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={posting}
            className="border border-[#011145] text-[#011145] px-8 py-2.5 text-sm font-medium hover:bg-[#011145] hover:text-white transition duration-300 disabled:opacity-50"
          >
            {posting ? "Posting…" : "Post comment"}
          </button>
        </form>
      </div>
    </section>
  );
}
