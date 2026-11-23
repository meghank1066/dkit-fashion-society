// Helpers for a post's optional event date

// "16 Feb 2026"
export const formatEventDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" })
    : "";

// Value for an <input type="date"> ("2026-02-16")
export const toDateInputValue = (date) => (date ? new Date(date).toISOString().slice(0, 10) : "");

// True once the event's day is over (posts without a date never count as past)
export const isPastEvent = (post) => {
  if (!post?.eventDate) return false;
  const endOfDay = new Date(post.eventDate);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay < new Date();
};
