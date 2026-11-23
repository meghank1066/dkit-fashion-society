import { useState } from "react";
import { Node, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import VideoTranscript from "./VideoTranscript";

// How a video looks inside the editor: the player, transcript status and a Remove button
function VideoNodeView({ node, deleteNode, selected }) {
  const [videoEl, setVideoEl] = useState(null);
  return (
    <NodeViewWrapper className={`my-8 ${selected ? "outline outline-[3px] outline-[#011145] outline-offset-2" : ""}`}>
      <div contentEditable={false}>
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={deleteNode}
            className="bg-white border border-[#011145] text-[#011145] text-xs font-semibold px-3 py-1.5 hover:bg-[#011145] hover:text-white transition"
          >
            ✕ Remove video
          </button>
        </div>
        <video
          ref={setVideoEl}
          src={node.attrs.src}
          controls
          preload="metadata"
          playsInline
          className="w-full max-h-[70vh] bg-black"
        />
        <VideoTranscript transcriptUrl={node.attrs.transcriptUrl} videoEl={videoEl} preview />
      </div>
    </NodeViewWrapper>
  );
}

// Saved in the post as <figure data-video-src="..." data-transcript-url="..."><video controls ...></figure>
const VideoNode = Node.create({
  name: "video",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-video-src"),
        renderHTML: (attrs) => ({ "data-video-src": attrs.src }),
      },
      transcriptUrl: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-transcript-url"),
        renderHTML: (attrs) => (attrs.transcriptUrl ? { "data-transcript-url": attrs.transcriptUrl } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: "figure[data-video-src]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "figure",
      { ...HTMLAttributes, class: "post-video" },
      ["video", { src: node.attrs.src, controls: "true", preload: "metadata", playsinline: "true" }],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoNodeView);
  },
});

export default VideoNode;
