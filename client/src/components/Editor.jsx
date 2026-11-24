import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef, useState } from "react";
import API from "../api/axios";
import ImageCropper from "./ImageCropper";
import PollNode from "./PollNode";
import PollCreator from "./PollCreator";
import VideoNode from "./VideoNode";

// CUSTOM IMAGE EXTENSION
// Put this HERE (outside the component)

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),

      class: {
        default: "image-center",

        renderHTML: attributes => {
          return {
            class: attributes.class,
          };
        },
      },
    };
  },
});

// TEXT ALIGNMENT for paragraphs and headings (saved as style="text-align: …")
const TextAlign = Extension.create({
  name: "textAlign",

  addGlobalAttributes() {
    return [
      {
        types: ["heading", "paragraph"],
        attributes: {
          textAlign: {
            default: null,
            parseHTML: (element) => element.style.textAlign || null,
            renderHTML: (attributes) =>
              attributes.textAlign ? { style: `text-align: ${attributes.textAlign}` } : {},
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setTextAlign:
        (alignment) =>
        ({ commands }) =>
          ["heading", "paragraph"]
            .map((type) =>
              commands.updateAttributes(type, { textAlign: alignment === "left" ? null : alignment })
            )
            .some(Boolean),
    };
  },
});

// One toolbar button: navy + white on hover, stays navy while that style is on
function ToolbarButton({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={!!active}
      // keep the text selection in the editor when clicking a button
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`min-w-9 h-9 px-3 text-sm font-semibold border transition-colors duration-150 cursor-pointer ${
        active
          ? "bg-[#011145] text-white border-[#011145]"
          : "bg-white text-[#011145] border-gray-300 hover:bg-[#011145] hover:text-white hover:border-[#011145]"
      }`}
    >
      {children}
    </button>
  );
}

const Divider = () => <span className="w-px self-stretch bg-gray-200 mx-1" />;

export default function Editor({ content, setContent }) {
  const fileInput = useRef(null);
  const [cropSrc, setCropSrc] = useState(null); // image being cropped
  const [addingPoll, setAddingPoll] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(0);
  const [videoProgress, setVideoProgress] = useState(null); // null or 0-100
  const videoInput = useRef(null);

  // Upload a video to Cloudinary (it also asks for an automatic transcript) and add it to the post
  const uploadVideo = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      return alert("That video is over 100 MB. Try a shorter or compressed version.");
    }
    setVideoProgress(0);
    try {
      const formData = new FormData();
      formData.append("video", file);
      const res = await API.post("/api/videos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (p) => p.total && setVideoProgress(Math.round((p.loaded / p.total) * 100)),
      });
      editorRef.current
        ?.chain()
        .focus()
        .insertContent([
          { type: "video", attrs: { src: res.data.url, transcriptUrl: res.data.transcriptUrl } },
          { type: "paragraph" },
        ])
        .run();
      if (!res.data.transcribing) {
        alert("Video added! Automatic transcripts aren't available on this Cloudinary account, so this one won't have a transcript.");
      }
    } catch (err) {
      alert("Couldn't upload the video: " + (err.response?.data?.message || err.message));
    } finally {
      setVideoProgress(null);
    }
  };
  const editorRef = useRef(null);

  // ---- Pasting / dropping images (e.g. from Pinterest) ----
  // Every image is copied into our Cloudinary so it never breaks later.
  const insertImageAt = (url, pos) => {
    const ed = editorRef.current;
    if (!ed) return;
    const content = [
      { type: "image", attrs: { src: url, class: "image-center" } },
      { type: "paragraph" },
    ];
    if (typeof pos === "number") ed.chain().focus().insertContentAt(pos, content).run();
    else ed.chain().focus().insertContent(content).run();
  };

  const uploadImageFile = async (file) => {
    const formData = new FormData();
    formData.append("image", file, file.name || "pasted-image.png");
    const res = await API.post("/api/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.url;
  };

  const uploadImageFromUrl = async (url) => {
    const res = await API.post("/api/upload/from-url", { url });
    return res.data.url;
  };

  const handleIncomingImages = async ({ files = [], urls = [] }, pos) => {
    const jobs = [
      ...files.map((f) => () => uploadImageFile(f)),
      ...urls.map((u) => () => uploadImageFromUrl(u)),
    ];
    if (jobs.length === 0) return;
    setUploadingImages((n) => n + jobs.length);
    for (const job of jobs) {
      try {
        insertImageAt(await job(), pos);
      } catch (err) {
        alert("Couldn't add that image: " + (err.response?.data?.message || err.message));
      } finally {
        setUploadingImages((n) => n - 1);
      }
    }
  };

  // Work out what images (if any) are on the clipboard / being dropped
  const looksLikeImageUrl = (text) =>
    /^https?:\/\/\S+$/i.test(text) &&
    (/\.(jpe?g|png|webp|gif|avif)(\?\S*)?$/i.test(text) || /i\.pinimg\.com\//i.test(text));

  const extractImages = (dataTransfer) => {
    if (!dataTransfer) return null;
    const files = Array.from(dataTransfer.files || []).filter((f) => f.type.startsWith("image/"));
    if (files.length) return { files, urls: [] };

    const html = dataTransfer.getData("text/html");
    if (html) {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const urls = Array.from(doc.querySelectorAll("img"))
        .map((img) => img.getAttribute("src"))
        .filter((src) => src && /^https?:/i.test(src));
      const hasText = (doc.body.textContent || "").trim().length > 0;
      // only treat it as an image paste if it's just image(s), not a chunk of an article
      if (urls.length && !hasText) return { files: [], urls };
    }

    const text = (dataTransfer.getData("text/plain") || "").trim();
    if (looksLikeImageUrl(text)) return { files: [], urls: [text] };
    return null;
  };

const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      // 1. REPLACE THE STANDARD 'StarterKit' WITH THIS CONFIGURED VERSION:
// In Editor.jsx, simplify your StarterKit configuration back to:
StarterKit.configure({
  heading: {
    levels: [1, 2, 3],
  },
}),

      CustomImage.configure({
        inline: false,
        allowBase64: false,
      }),

      Placeholder.configure({
        placeholder: "Start writing your article...",
      }),

      TextAlign,

      PollNode,

      VideoNode,
    ],

    // re-render the toolbar as the cursor moves, so buttons show what's active
    shouldRerenderOnTransaction: true,

    editorProps: {
      handlePaste: (view, event) => {
        const found = extractImages(event.clipboardData);
        if (!found) return false; // normal text paste
        event.preventDefault();
        handleIncomingImages(found);
        return true;
      },
      handleDrop: (view, event, slice, moved) => {
        if (moved) return false; // moving something already in the post
        const found = extractImages(event.dataTransfer);
        if (!found) return false;
        event.preventDefault();
        const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
        handleIncomingImages(found, coords?.pos);
        return true;
      },
    },

    content,

    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  editorRef.current = editor;

  // When the parent loads a different post (e.g. clicking Edit, or resetting the form),
  // put that post's text into the editor. Without this the editor only reads
  // `content` once, when it first appears, so edit mode showed an empty box.
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if ((content || "") !== editor.getHTML()) {
      editor.commands.setContent(content || "", { emitUpdate: false });
    }
  }, [content, editor]);

  const uploadEditorImage = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("image", file);

    try {
    const res = await API.post(
  "/api/upload",
  formData,
  {
    headers:{
      Authorization:`Bearer ${localStorage.getItem("token")}`,
      "Content-Type":"multipart/form-data"
    }
  }
);

console.log("Uploaded image:", res.data.url);

      editor
        .chain()
        .focus()
        .insertContent([
          {
            type: "image",
            attrs: {
              src: res.data.url,
              class: "image-center",
            },
          },
          {
            type: "paragraph",
          },
        ])
        .run();
    } catch (error) {
      console.log(error);
    }
  };

  if (!editor) {
    return null;
  }

  // Alignment acts on the selected image if one is selected, otherwise on the text
  const imageSelected = editor.isActive("image");
  const align = (dir) => {
    if (imageSelected) {
      editor.chain().focus().updateAttributes("image", { class: `image-${dir}` }).run();
    } else {
      editor.chain().focus().setTextAlign(dir).run();
    }
  };
  const isAligned = (dir) => {
    if (imageSelected) return (editor.getAttributes("image").class || "image-center") === `image-${dir}`;
    if (dir === "left") return !editor.isActive({ textAlign: "center" }) && !editor.isActive({ textAlign: "right" });
    return editor.isActive({ textAlign: dir });
  };

  return (
    <div>
      {/* TOOLBAR */}
      <div className="sticky top-0 z-20 bg-white border border-gray-200 p-2 mb-3 flex flex-wrap items-center gap-1.5 shadow-sm">
        <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <span className="font-bold">B</span>
        </ToolbarButton>
        <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <span className="italic font-serif">I</span>
        </ToolbarButton>
        <ToolbarButton title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <span className="underline">U</span>
        </ToolbarButton>

        <Divider />

        <ToolbarButton title="Heading" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </ToolbarButton>
        <ToolbarButton title="Subheading" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </ToolbarButton>
        <ToolbarButton title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          ❝
        </ToolbarButton>
        <ToolbarButton title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • List
        </ToolbarButton>
        <ToolbarButton title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1. List
        </ToolbarButton>

        <Divider />

        <ToolbarButton title={imageSelected ? "Image left" : "Align text left"} active={isAligned("left")} onClick={() => align("left")}>
          Left-Aligned
        </ToolbarButton>
        <ToolbarButton title={imageSelected ? "Image centre" : "Centre text"} active={isAligned("center")} onClick={() => align("center")}>
          Centre-Aligned
        </ToolbarButton>
        <ToolbarButton title={imageSelected ? "Image right" : "Align text right"} active={isAligned("right")} onClick={() => align("right")}>
          Right-Aligned
        </ToolbarButton>

        <Divider />

        <ToolbarButton title="Add image" onClick={() => fileInput.current?.click()}>
          Add Image
        </ToolbarButton>
        {imageSelected && (
          <ToolbarButton title="Crop the selected image" onClick={() => setCropSrc(editor.getAttributes("image").src)}>
            ✂ Crop
          </ToolbarButton>
        )}
        <input ref={fileInput} type="file" accept="image/*" hidden onChange={uploadEditorImage} />

        <ToolbarButton title="Add a video" onClick={() => videoInput.current?.click()}>
          Add Video
        </ToolbarButton>
        <input ref={videoInput} type="file" accept="video/*" hidden onChange={uploadVideo} />

        <ToolbarButton title="Add a poll" onClick={() => setAddingPoll(true)}>
          Poll
        </ToolbarButton>

        <Divider />

        <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          ↶ Undo
        </ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          ↷ Redo
        </ToolbarButton>

        {videoProgress !== null ? (
          <span className="ml-auto text-xs font-semibold text-[#011145]">
            {videoProgress < 100 ? `Uploading video… ${videoProgress}%` : "Processing video…"}
          </span>
        ) : uploadingImages > 0 ? (
          <span className="ml-auto text-xs font-semibold text-[#011145]">
            Adding {uploadingImages} image{uploadingImages > 1 ? "s" : ""}…
          </span>
        ) : imageSelected ? (
          <span className="ml-auto text-xs text-gray-500">Image selected: alignment moves the image</span>
        ) : (
          <span className="ml-auto text-xs text-gray-400 hidden lg:inline">Tip: paste or drag images straight in</span>
        )}
      </div>

      <div className="bg-white min-h-[600px] px-8 py-10 max-w-none">
        <EditorContent editor={editor} />
      </div>

      {addingPoll && (
        <PollCreator
          onCancel={() => setAddingPoll(false)}
          onCreated={(pollId) => {
            // insert the poll where the cursor is, with an empty line after it
            editor
              .chain()
              .focus()
              .insertContent([{ type: "poll", attrs: { pollId } }, { type: "paragraph" }])
              .run();
            setAddingPoll(false);
          }}
        />
      )}

      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          onCancel={() => setCropSrc(null)}
          onDone={(url) => {
            // swap in the cropped copy; the image keeps its left/centre/right setting
            editor.chain().focus().updateAttributes("image", { src: url }).run();
            setCropSrc(null);
          }}
        />
      )}
    </div>
  );
}
