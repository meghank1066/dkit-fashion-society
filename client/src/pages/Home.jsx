import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

export default function Home() {

  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
const [articles, setArticles] = useState([]);


  useEffect(() => {

  const fetchPosts = async () => {

    try {

      const res = await API.get("/posts");

      const allPosts = res.data;


      // Events block
      setEvents(
        allPosts.filter(
          post => post.category === "event"
        )
      );


      // Fashion / Makeup journal block
      setArticles(
        allPosts.filter(
          post =>
            post.category === "fashion" ||
            post.category === "makeup"
        )
      );


      // Optional: newest posts overall
      setPosts(
        allPosts.slice(0,3)
      );


    } catch(error){

      console.log(error);

    }

  };


  fetchPosts();

}, []);



  return (

    <div className="bg-white text-gray-900">


      {/* Hero */}
      <section className="bg-black text-white py-32 px-6 text-center">

        <div className="max-w-5xl mx-auto">

          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            DKIT Fashion Society
          </h1>


          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            A creative space for fashion, self-expression, photography,
            and student collaboration.
          </p>


        </div>

      </section>





      {/* Latest Events / Journal Posts */}
    <section className="max-w-6xl mx-auto px-6 py-20">

<h2 className="text-4xl font-bold mb-10">
Upcoming Events
</h2>


<div className="grid md:grid-cols-3 gap-8">

{
events.slice(0,3).map((post)=>(

<Link
key={post._id}
to={`/posts/${post._id}`}
className="rounded-3xl shadow-lg overflow-hidden"
>

<img
src={post.coverImage}
alt={post.title}
className="w-full h-64 object-cover"
/>


<div className="p-6">

<h3 className="text-xl font-bold">
{post.title}
</h3>

<p className="text-gray-500">
{post.subtitle}
</p>

</div>

</Link>

))

}

</div>

</section>




      {/* Future Blog Section */}
      <section className="bg-gray-100 py-20">


        <div className="max-w-6xl mx-auto px-6">


          <h2 className="text-4xl font-bold mb-5 text-center">
            Fashion Journal
          </h2>


          <p className="text-center text-gray-600 mb-12">
            Explore future articles, fashion inspiration, student features,
            and creative stories.
          </p>



        <div className="grid md:grid-cols-3 gap-8">

{
articles.slice(0,3).map((post)=>(

<Link
key={post._id}
to={`/posts/${post._id}`}
className="bg-white rounded-3xl overflow-hidden shadow"
>


<img
src={post.coverImage}
className="w-full h-56 object-cover"
/>


<div className="p-6">

<h3 className="font-bold text-xl">
{post.title}
</h3>


<p className="text-gray-500 mt-2">
{post.subtitle}
</p>


</div>


</Link>

))

}

</div>


        </div>


      </section>





      {/* Photoshoot Editorials */}
      {/* <section className="max-w-6xl mx-auto px-6 py-20 text-center">


        <h2 className="text-4xl font-bold mb-5">
          Photoshoot Editorials
        </h2>


        <p className="text-gray-600 max-w-2xl mx-auto mb-10">
          Creative editorial shoots showcasing fashion, styling,
          photography, and student creativity.
        </p>


        <div className="bg-black text-white rounded-3xl p-12">

          <h3 className="text-3xl font-bold mb-3">
            2026 - 2027 Coming Soon ✨
          </h3>


          <p className="text-gray-300">
            Editorial concepts, collaborations, and photoshoot projects
            will be announced soon.
          </p>


        </div>


      </section> */}





      {/* What We Offer */}
      <section className="bg-gray-100 py-20">


        <div className="max-w-6xl mx-auto px-6">


          <h2 className="text-4xl font-bold text-center mb-12">
            What Our Society Offers
          </h2>



          <div className="grid md:grid-cols-3 gap-8">


            <div className="bg-white rounded-3xl p-8">

              <h3 className="font-bold text-xl mb-3">
                Events
              </h3>

              <p>
                Fashion-focused socials, creative events, and student activities.
              </p>

            </div>


            <div className="bg-white rounded-3xl p-8">

              <h3 className="font-bold text-xl mb-3">
                Creativity
              </h3>

              <p>
                Opportunities for styling, photography, design, and collaboration.
              </p>

            </div>


            <div className="bg-white rounded-3xl p-8">

              <h3 className="font-bold text-xl mb-3">
                Community
              </h3>

              <p>
                A welcoming space for students passionate about fashion.
              </p>

            </div>


          </div>


        </div>


      </section>





      {/* Registration */}
      <section className="bg-black text-white py-20 text-center">


        <div className="max-w-4xl mx-auto px-6">


          <h2 className="text-4xl font-bold mb-5">
            Become A Member
          </h2>


          <p className="text-gray-300 text-lg mb-8">
            Join DKIT Fashion Society and be part of our creative community.
          </p>


          <button className="bg-white text-black px-10 py-4 rounded-full font-semibold">
            Register To Join
          </button>


        </div>


      </section>




      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-10 text-center">

        <h3 className="text-white text-xl font-bold mb-3">
          DKIT Fashion Society
        </h3>

        <p>
          Fashion • Creativity • Community
        </p>


      </footer>



    </div>

  );

}