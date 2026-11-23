// Turn a Cloudinary ".transcript" file into readable text + WebVTT captions.
// The file is a list of excerpts: [{ transcript, words: [{ word, start_time, end_time }] }]

const toTime = (s) => {
  const ms = Math.max(0, Math.round(s * 1000));
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
  const sec = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  const milli = String(ms % 1000).padStart(3, "0");
  return `${h}:${m}:${sec}.${milli}`;
};

// Returns { text, vtt } once the transcript exists, or null while it's still being made.
export async function fetchTranscript(url) {
  if (!url) return null;
  const res = await fetch(`${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) return null;
  let data;
  try {
    data = await res.json();
  } catch {
    return null;
  }
  const excerpts = Array.isArray(data) ? data : data?.transcript || [];
  const text = excerpts
    .map((e) => (e.transcript || "").trim())
    .filter(Boolean)
    .join(" ");

  // captions: roughly 8 words per line
  const words = excerpts.flatMap((e) => e.words || []).filter((w) => w && w.word != null);
  let vtt = null;
  if (words.length) {
    const cues = [];
    for (let i = 0; i < words.length; i += 8) {
      const chunk = words.slice(i, i + 8);
      const start = Number(chunk[0].start_time) || 0;
      const end = Number(chunk[chunk.length - 1].end_time) || start + 2;
      cues.push(`${toTime(start)} --> ${toTime(end)}\n${chunk.map((w) => w.word).join(" ")}`);
    }
    vtt = "WEBVTT\n\n" + cues.join("\n\n");
  }
  return text ? { text, vtt } : null;
}
