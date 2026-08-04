import { useEffect, useState } from "react";
import API from "../api/axios";
import PostCard from "../components/PostCard";

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    API.get("/posts").then((res) => {
      setPosts(res.data);
    });
  }, []);

  return (
    <div className="bg-[#f8f5f0] text-black">
      {/* HERO */}

      <section className="h-screen flex flex-col justify-center items-center text-center px-10">
        <h1 className="font-serif text-8xl tracking-wide">
          DKIT
          <br />
          FASHION
          <br />
          SOCIETY
        </h1>

        <p className="mt-8 text-lg max-w-xl">
          Celebrating creativity, individuality and fashion culture at Dundalk
          Institute of Technology.
        </p>

        <button className="mt-10 border border-black px-8 py-3 hover:bg-black hover:text-white transition">
          JOIN US
        </button>
      </section>

      {/* FEATURE SECTION */}

      <section className="px-12 py-20">
        <h2 className="font-serif text-5xl mb-12">Latest from the Society</h2>

        <div className="grid md:grid-cols-3 gap-10">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
          {/* <p>TEST CARD</p> */}
        </div>
      </section>

      {/* ABOUT */}

      <section className="px-12 py-24 grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="font-serif text-6xl">Our Story</h2>
        </div>

        <div className="text-lg leading-relaxed">
          <p>
            DKIT Fashion Society brings students together through design,
            styling, photography and creative expression.
          </p>
        </div>
      </section>
    </div>
  );
}
