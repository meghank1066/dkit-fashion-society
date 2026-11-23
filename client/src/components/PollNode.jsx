import { Node, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import PollWidget from "./PollWidget";

// How a poll looks inside the editor: a preview with a Remove button
function PollNodeView({ node, deleteNode, selected }) {
  return (
    <NodeViewWrapper className={`relative my-6 ${selected ? "outline outline-[3px] outline-[#011145] outline-offset-2" : ""}`}>
      <div contentEditable={false}>
        <div className="flex justify-end mb-[-1.5rem] relative z-10">
          <button
            type="button"
            onClick={deleteNode}
            className="bg-white border border-[#011145] text-[#011145] text-xs font-semibold px-3 py-1.5 hover:bg-[#011145] hover:text-white transition"
          >
            ✕ Remove poll
          </button>
        </div>
        <PollWidget pollId={node.attrs.pollId} preview />
      </div>
    </NodeViewWrapper>
  );
}

// Saved in the post as <div data-poll-id="..."></div>; the post page turns it into a live poll
const PollNode = Node.create({
  name: "poll",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      pollId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-poll-id"),
        renderHTML: (attributes) => ({ "data-poll-id": attributes.pollId }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-poll-id]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { ...HTMLAttributes, class: "post-poll" }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PollNodeView);
  },
});

export default PollNode;
