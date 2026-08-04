import { useEffect, useState } from "react";
import API from "../api/axios";
import PostCard from "../components/PostCard";


export default function Posts(){

    const [posts,setPosts] = useState([]);


    useEffect(()=>{

        API.get("/posts")
        .then(res=>{
            setPosts(res.data);
        });

    },[]);



    return (

        <div className="bg-[#f8f5f0] min-h-screen px-12 py-20">


            <h1 className="font-serif text-6xl mb-12">
                Society Posts
            </h1>


            <div className="grid md:grid-cols-3 gap-10">

                {
                    posts.map(post=>(
                        <PostCard
                            key={post._id}
                            post={post}
                        />
                    ))
                }

            </div>


        </div>

    );

}