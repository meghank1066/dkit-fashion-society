import { useEffect, useState } from "react";
import { fetchTranscript } from "../utils/transcript";

// Shows the auto-generated transcript under a video, and adds captions (CC) to the player.
// preview = true (in the editor) also shows "being generated" while Cloudinary works on it.
export default function VideoTranscript({ transcriptUrl, videoEl, preview = false }) {
  const [state, setState] = useState({ status: "loading", text: "" });

  useEffect(() => {
    if (!transcriptUrl) return;
    let cancelled = false;
    let timer;
    let tries = 0;
    let trackUrl;

    const load = async () => {
      tries += 1;
      try {
        const result = await fetchTranscript(transcriptUrl);
        if (cancelled) return;
        if (result) {
          setState({ status: "ready", text: result.text });
          // add captions the viewer can switch on in the video player
          if (videoEl && result.vtt && !videoEl.querySelector("track[data-auto]")) {
            trackUrl = URL.createObjectURL(new Blob([result.vtt], { type: "text/vtt" }));
            const track = document.createElement("track");
            track.kind = "subtitles";
            track.label = "English (auto)";
            track.srclang = "en";
            track.src = trackUrl;
            track.dataset.auto = "1";
            videoEl.appendChild(track);
          }
          return;
        }
      } catch {
        /* not ready yet */
      }
      if (cancelled) return;
      // transcripts can take a few minutes; in the editor keep checking for ~10 minutes
      if (preview && tries < 40) {
        setState({ status: "pending", text: "" });
        timer = setTimeout(load, 15000);
      } else {
        setState({ status: "missing", text: "" });
      }
    };

    load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (trackUrl) URL.revokeObjectURL(trackUrl);
    };
  }, [transcriptUrl, videoEl, preview]);

  if (!transcriptUrl) {
    return preview ? <p className="text-xs text-gray-400 mt-2">No transcript for this video.</p> : null;
  }
  if (state.status === "pending" || (preview && state.status === "loading")) {
    return <p className="text-xs text-gray-500 mt-2">Transcript is being generated… this can take a few minutes.</p>;
  }
  if (state.status !== "ready") {
    return preview ? <p className="text-xs text-gray-400 mt-2">Transcript not available yet. Check back later.</p> : null;
  }

  return (
    <details className="not-prose mt-3 border border-gray-200 bg-white group">
      <summary className="cursor-pointer select-none px-4 py-2.5 text-sm font-semibold text-[#011145] hover:bg-[#011145] hover:text-white transition list-none flex justify-between items-center">
        Read transcript
        <span className="text-xs transition group-open:rotate-180">▾</span>
      </summary>
      <p className="px-4 py-3 text-sm text-gray-700 leading-relaxed">{state.text}</p>
    </details>
  );
}
