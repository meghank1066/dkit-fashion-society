import { Link } from "react-router-dom";


export default function PostCard({ post }) {

    return (

        <Link
            to={`/posts/${post._id}`}
            className="block group"
        >

            <article>


                <div className="h-64 bg-gray-200 mb-6 overflow-hidden">


                    {post.coverImage ? (

                        <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
                        />

                    ) : (

                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            Fashion Society
                        </div>

                    )}


                </div>



                <p className="uppercase tracking-widest text-sm mb-3">
                    {post.category}
                </p>



                <h3 className="font-serif text-3xl">
                    {post.title}
                </h3>



                {post.subtitle && (

                    <p className="mt-3 text-lg text-gray-500">
                        {post.subtitle}
                    </p>

                )}



                <p
                    className="mt-4 text-gray-600"
                    dangerouslySetInnerHTML={{
                        __html: post.content.substring(0,150) + "..."
                    }}
                />



                <div className="flex items-center gap-2 mt-4">
  {/* Author Profile Picture */}
  <img
    src={post.author?.profilePic || "https://via.placeholder.com/40"}
    alt={post.author?.username || "Author"}
    className="w-8 h-8 rounded-full object-cover border border-gray-200"
  />
  
  {/* Author Name */}
  <span className="text-sm font-medium text-gray-700">
    By {post.author?.username || "Anonymous"}
  </span>
</div>

            </article>


        </Link>

    );

}