import { useEffect, useState } from "react";
import API from "../api/axios";
import Editor from "../components/Editor";

export default function AdminDashboard(){

    const [posts, setPosts] = useState([]);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("announcement");
    const [editingPost, setEditingPost] = useState(null);


    const token = localStorage.getItem("token");


    const config = {
        headers:{
            Authorization:`Bearer ${token}`
        }
    };


   const fetchPosts = async () => {

    try {

        const res = await API.get("/posts");

        setPosts(res.data);

    } catch(error){

        console.log(error);

    }

};


    useEffect(()=>{

        fetchPosts();

    },[]);



const createPost = async (e)=>{

    e.preventDefault();


    try {

        await API.post(
            "/posts",
            {
                title,
                content,
                category
            },
            config
        );


        setTitle("");
        setContent("");

        fetchPosts();


    } catch(error){

        console.log(error);

    }

};



    const deletePost = async(id)=>{


        await API.delete(
            `/posts/${id}`,
            config
        );


        fetchPosts();

    };

    const updatePost = async(e)=>{

    e.preventDefault();


    await API.put(
        `/posts/${editingPost._id}`,
        {
            title,
            content,
            category
        },
        config
    );


    setEditingPost(null);

    setTitle("");
    setContent("");

    fetchPosts();

};


return (

<div className="min-h-screen bg-[#f8f5f0] p-10">


<h1 className="font-serif text-6xl mb-10">
Admin Dashboard
</h1>



<div className="grid md:grid-cols-2 gap-10">



{/* CREATE POST */}

<div className="bg-white p-8 shadow">


<h2 className="font-serif text-3xl mb-6">
Create Post
</h2>



<form onSubmit={editingPost ? updatePost : createPost}>


<input
placeholder="Title"
value={title}
onChange={(e)=>setTitle(e.target.value)}
className="w-full border p-3 mb-4"
/>


<Editor
    content={content}
    setContent={setContent}
/>



<select
value={category}
onChange={(e)=>setCategory(e.target.value)}
className="w-full border p-3 mb-4"
>


<option value="announcement">
Announcement
</option>


<option value="event">
Event
</option>


<option value="fashion">
Fashion
</option>


</select>



<button
className="bg-black text-white px-6 py-3"
>
{
editingPost ? "Update Post" : "Publish"
}
</button>



</form>


</div>





{/* POSTS */}


<div>


<h2 className="font-serif text-3xl mb-6">
Manage Posts
</h2>



<div className="space-y-5">


{
posts.map(post=>(

<div
key={post._id}
className="bg-white p-6 shadow"
>


<h3 className="font-serif text-2xl">
{post.title}
</h3>


<p className="text-gray-600 mt-2">
{post.category}
</p>


<p className="mt-3">
{post.content}
</p>



<div className="mt-5 flex gap-3">


<button

onClick={()=>{

setEditingPost(post);

setTitle(post.title);

setContent(post.content);

setCategory(post.category);

}}

className="border px-4 py-2"

>
Edit
</button>



<button
onClick={()=>deletePost(post._id)}
className="bg-black text-white px-4 py-2"
>
Delete
</button>


</div>


</div>


))
}



</div>


</div>


</div>


</div>

)

}