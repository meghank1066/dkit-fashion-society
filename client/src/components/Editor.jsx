import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useRef } from "react";
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

export default function Editor({ content, setContent }) {
  const fileInput = useRef(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,

      CustomImage.configure({
        inline: false,
        allowBase64: false,
      }),

      Placeholder.configure({
        placeholder: "Start writing your article...",
      }),
    ],

    content,

    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  const uploadEditorImage = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("image", file);

    try {
     const res = await API.post(
  "/upload",
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

  return (
    <div>
      {/* TOOLBAR */}

      <div
        className="
border 
border-gray-200 
p-3 
mb-3 
flex 
flex-wrap 
gap-3
"
      >
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="border px-3 py-1"
        >
          B
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="border px-3 py-1"
        >
          I
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 2,
              })
              .run()
          }
          className="border px-3 py-1"
        >
          H2
        </button>

        {/* UPLOAD IMAGE */}

        <button
          type="button"
         onClick={() => fileInput.current?.click()}
          className="border px-3 py-1"
        >
          Add Image
        </button>

        <input
  ref={fileInput}
  type="file"
  accept="image/*"
  hidden
  onChange={uploadEditorImage}
/>

        {/* IMAGE ALIGNMENT */}

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .updateAttributes("image", {
                class: "image-left",
              })
              .run()
          }
          className="border px-3 py-1"
        >
          ← Left
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .updateAttributes("image", {
                class: "image-center",
              })
              .run()
          }
          className="border px-3 py-1"
        >
          Center
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .updateAttributes("image", {
                class: "image-right",
              })
              .run()
          }
          className="border px-3 py-1"
        >
          Right →
        </button>
      </div>

      <div
        className="bg-white min-h-[600px] px-8 py-10 prose prose-lg max-w-none "
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
