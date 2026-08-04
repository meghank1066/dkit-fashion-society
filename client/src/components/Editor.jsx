import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";


export default function Editor({content, setContent}) {


const editor = useEditor({

extensions:[
    StarterKit,
    Image
],


content,


onUpdate:({editor})=>{

    setContent(editor.getHTML());

}


});



return (

<div>

<div className="border p-3 mb-3 flex gap-3">


<button
onClick={()=>editor.chain().focus().toggleBold().run()}
className="border px-3"
>
B
</button>


<button
onClick={()=>editor.chain().focus().toggleItalic().run()}
className="border px-3"
>
I
</button>


<button
onClick={()=>editor.chain().focus().toggleHeading({
level:2
}).run()}
className="border px-3"
>
H2
</button>


</div>


<div className="border p-5 min-h-[300px]">

<EditorContent editor={editor}/>

</div>


</div>

)

}