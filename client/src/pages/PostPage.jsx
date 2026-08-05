import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";

export default function PostPage() {
    const { id } = useParams();
    const [post, setPost] = useState(null);

    useEffect(() => {
        API.get(`/api/posts/${id}`)
            .then(res => {
                setPost(res.data);
            })
            .catch(error => {
                console.log(error);
            });
    }, [id]);

    if (!post) {
        return (
            <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center">
                <p>Loading article...</p>
            </div>
        );
    }

    return (
        <article className="bg-[#f8f5f0] min-h-screen">
            {/* HERO IMAGE */}
            <div className="w-full h-[60vh] overflow-hidden">
                <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover object-[center_10%]"
                />
            </div>

            {/* ARTICLE HEADER */}
         {/* ARTICLE HEADER */}
<div className="max-w-5xl mx-auto px-10 py-16 text-center">
    <p className="uppercase tracking-[0.3em] text-sm">
        {post.category}
    </p>

    <h1 className="font-serif text-6xl md:text-8xl mt-8">
        {post.title}
    </h1>

    <p className="text-xl text-gray-600 mt-8">
        {post.subtitle}
    </p>

    {/* Author Profile Picture and Details */}
    <div className="mt-8 flex items-center justify-center gap-3">
        <img
            src={post.author?.profilePic || "https://via.placeholder.com/40"}
            alt={post.author?.username || "DKIT Fashion Society"}
            className="w-10 h-10 rounded-full object-cover border border-gray-300 shadow-sm"
        />
        <div className="text-left text-sm">
            <span className="font-medium text-gray-800">
                By {post.author?.username || "DKIT Fashion Society"}
            </span>
            <br />
            <span className="text-gray-500 text-xs">
                {new Date(post.createdAt).toLocaleDateString()}
            </span>
        </div>
    </div>
</div>

            {/* ARTICLE CONTENT */}
            <div className="max-w-3xl mx-auto px-10 pb-20">
                <div
                    className="prose prose-lg max-w-none [&_p]:mb-6 [&_p:empty]:h-6 [&_h2]:mt-10 [&_h2]:mb-4 [&_ul]:mb-6 [&_ol]:mb-6"
                    dangerouslySetInnerHTML={{
                        __html: post.content
                    }}
                />
            </div>
        </article>
    );
}