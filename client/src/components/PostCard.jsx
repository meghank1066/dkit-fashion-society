export default function PostCard({ post }) {

    return (

        <article className="group">

            <div className="h-64 bg-gray-200 mb-6 overflow-hidden">

                {post.image ? (
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
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


            <p className="mt-4 text-gray-600">
                {post.content}
            </p>


            <p className="mt-5 text-sm">
                By {post.author?.username || "DKIT Fashion Society"}
            </p>


        </article>

    );

}