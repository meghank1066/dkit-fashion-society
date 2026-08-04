import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

export default function Home() {

  const [events, setEvents] = useState([]);

  const [fashionPosts, setFashionPosts] = useState([]);
  const [makeupPosts, setMakeupPosts] = useState([]);
  const [lifestylePosts, setLifestylePosts] = useState([]);



  useEffect(() => {

    const fetchPosts = async () => {

      try {

        const res = await API.get("/posts");

        const posts = res.data;


        setEvents(
          posts.filter(
            post => post.category === "event"
          )
        );


        setFashionPosts(
          posts.filter(
            post => post.category === "fashion"
          )
        );


        setMakeupPosts(
          posts.filter(
            post => post.category === "makeup"
          )
        );


        setLifestylePosts(
          posts.filter(
            post => post.category === "lifestyle"
          )
        );


      } catch(error){

        console.log(error);

      }

    };


    fetchPosts();

  }, []);



  return (

    <div className="bg-white text-gray-900">


      {/* HERO */}

      <section className="bg-black text-white py-32 px-6 text-center">

        <div className="max-w-5xl mx-auto">


          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            DKIT Fashion Society
          </h1>


          <p className="text-xl md:text-2xl text-gray-300">
            A creative community celebrating fashion,
            self-expression, photography, and student collaboration.
          </p>


        </div>

      </section>





      {/* EVENTS */}

      <section className="max-w-6xl mx-auto px-6 py-20">


        <div className="flex justify-between items-center mb-10">


          <div>

            <h2 className="text-4xl font-bold">
              Upcoming Events
            </h2>


            <p className="text-gray-500 mt-2">
              Discover the latest DKIT Fashion Society activities.
            </p>

          </div>


          <Link
            to="/posts"
            className="underline font-semibold"
          >
            View All
          </Link>


        </div>



        <div className="grid md:grid-cols-3 gap-8">


          {events.slice(0,3).map(post => (

            <Link
              key={post._id}
              to={`/posts/${post._id}`}
              className="rounded-3xl overflow-hidden shadow-lg hover:-translate-y-2 transition"
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


                <p className="text-gray-500 mt-2">
                  {post.subtitle}
                </p>


              </div>


            </Link>

          ))}


        </div>


      </section>







      {/* JOURNAL */}

      <section className="bg-gray-100 py-20">


        <div className="max-w-6xl mx-auto px-6">


          <h2 className="text-5xl font-bold mb-5">
            Fashion Journal
          </h2>


          <p className="text-gray-600 mb-12">
            Explore fashion, beauty, lifestyle and creative stories.
          </p>




          <div className="grid md:grid-cols-3 gap-6">



            {/* Fashion */}

            {fashionPosts.slice(0,1).map(post => (

              <Link
                key={post._id}
                to={`/posts/${post._id}`}
                className="relative overflow-hidden rounded-3xl group"
              >

                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-[420px] object-cover group-hover:scale-105 transition"
                />


                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-6">


                  <h3 className="text-3xl font-bold">
                    Fashion
                  </h3>


                  <p className="mt-2">
                    {post.title}
                  </p>


                </div>


              </Link>

            ))}






            {/* Makeup */}

            {makeupPosts.slice(0,1).map(post => (

              <Link
                key={post._id}
                to={`/posts/${post._id}`}
                className="relative overflow-hidden rounded-3xl group"
              >

                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-[420px] object-cover group-hover:scale-105 transition"
                />


                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-6">


                  <h3 className="text-3xl font-bold">
                    Beauty
                  </h3>


                  <p className="mt-2">
                    {post.title}
                  </p>


                </div>


              </Link>

            ))}







            {/* Lifestyle */}

            {lifestylePosts.slice(0,1).map(post => (

              <Link
                key={post._id}
                to={`/posts/${post._id}`}
                className="relative overflow-hidden rounded-3xl group"
              >

                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-[420px] object-cover group-hover:scale-105 transition"
                />


                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-6">


                  <h3 className="text-3xl font-bold">
                    Lifestyle
                  </h3>


                  <p className="mt-2">
                    {post.title}
                  </p>


                </div>


              </Link>

            ))}



          </div>


        </div>


      </section>







      {/* EDITORIALS */}

      <section className="max-w-6xl mx-auto px-6 py-20 text-center">


        <h2 className="text-4xl font-bold mb-5">
          Photoshoot Editorials
        </h2>


        <p className="text-gray-600 max-w-2xl mx-auto mb-10">
          Showcasing creativity through styling, photography,
          and fashion storytelling.
        </p>



        <div className="bg-black text-white rounded-3xl p-12">


          <h3 className="text-3xl font-bold mb-3">
            2026 - 2027 Coming Soon ✨
          </h3>


          <p className="text-gray-300">
            Editorial shoots, collaborations and creative projects
            will be announced soon.
          </p>


        </div>


      </section>







      {/* WHAT WE OFFER */}

      <section className="bg-gray-100 py-20">


        <div className="max-w-6xl mx-auto px-6">


          <h2 className="text-4xl font-bold text-center mb-12">
            What Our Society Offers
          </h2>



          <div className="grid md:grid-cols-3 gap-8">


            <div className="bg-white rounded-3xl p-8">

              <h3 className="text-xl font-bold mb-3">
                Events
              </h3>

              <p>
                Fashion socials, creative activities and student events.
              </p>

            </div>



            <div className="bg-white rounded-3xl p-8">

              <h3 className="text-xl font-bold mb-3">
                Creativity
              </h3>

              <p>
                Opportunities in styling, photography, design and media.
              </p>

            </div>



            <div className="bg-white rounded-3xl p-8">

              <h3 className="text-xl font-bold mb-3">
                Community
              </h3>

              <p>
                A welcoming space for students passionate about fashion.
              </p>

            </div>


          </div>


        </div>


      </section>







      {/* MEMBERSHIP */}

      <section className="bg-black text-white py-20 text-center">


        <div className="max-w-4xl mx-auto px-6">


          <h2 className="text-4xl font-bold mb-5">
            Become A Member
          </h2>


          <p className="text-gray-300 text-lg mb-8">
            Join DKIT Fashion Society and become part of our creative community.
          </p>


          <button className="bg-white text-black px-10 py-4 rounded-full font-semibold">
            Register To Join
          </button>


        </div>


      </section>








      {/* FOOTER */}

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