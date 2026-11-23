import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef } from "react";
import API from "../api/axios";

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
    ],

    // re-render the toolbar as the cursor moves, so buttons show what's active
    shouldRerenderOnTransaction: true,

    content,

    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

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
          ⇤ Left
        </ToolbarButton>
        <ToolbarButton title={imageSelected ? "Image centre" : "Centre text"} active={isAligned("center")} onClick={() => align("center")}>
          ↔ Centre
        </ToolbarButton>
        <ToolbarButton title={imageSelected ? "Image right" : "Align text right"} active={isAligned("right")} onClick={() => align("right")}>
          Right ⇥
        </ToolbarButton>

        <Divider />

        <ToolbarButton title="Add image" onClick={() => fileInput.current?.click()}>
          + Image
        </ToolbarButton>
        <input ref={fileInput} type="file" accept="image/*" hidden onChange={uploadEditorImage} />

        <Divider />

        <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          ↶
        </ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          ↷
        </ToolbarButton>

        {imageSelected && (
          <span className="ml-auto text-xs text-gray-500">Image selected: alignment moves the image</span>
        )}
      </div>

      <div className="bg-white min-h-[600px] px-8 py-10 max-w-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
