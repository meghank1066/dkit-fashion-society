import React from "react";

export default function About() {

  const committee2025 = [
    {
      name: "Meghan Keightley",
      role: "Founder",
      image: "/images/meghan.jpg",
    },
    {
      name: "Mila Murphy",
      role: "Committee Member",
      image: "/images/mila.jpg",
    },
    {
      name: "Caren Rita Pinheiro",
      role: "Committee Member",
      image: "/images/caren.jpg",
    },
    {
      name: "Amber Dempsey",
      role: "Committee Member",
      image: "/images/amber.jpg",
    },
  ];


  const futureCommittee = [
    "Placeholder Name",
    "Placeholder Name",
    "Placeholder Name",
    "Placeholder Name",
  ];


  return (

    <div className="bg-white text-gray-900">


      {/* Hero Section */}
      <section className="bg-black text-white py-24 px-6 text-center">

        <div className="max-w-4xl mx-auto">

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            About DKIT Fashion Society
          </h1>

          <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
            A creative community where students can explore fashion,
            express individuality, and celebrate personal style.
          </p>

        </div>

      </section>



      <main className="max-w-6xl mx-auto px-6 py-16">


        {/* Story Section */}
        <section className="mb-20">

          <div className="bg-gray-50 rounded-3xl p-8 md:p-12 shadow-sm">

            <h2 className="text-3xl font-bold mb-8">
              Our Story
            </h2>


            <div className="space-y-5 text-gray-700 text-lg leading-relaxed">

              <p>
                The DKIT Fashion Society was founded in 2025 by Meghan Keightley
                with the vision of creating a dedicated space for students who
                share a passion for fashion, creativity, and self-expression.
              </p>


              <p>
                The society was established to bring together students from all
                backgrounds and create opportunities to connect through styling,
                fashion discussions, creative projects, and social events.
                It encourages students to explore their personal style while
                building confidence and forming connections with others.
              </p>


              <p>
                Through collaboration, creativity, and community, the DKIT
                Fashion Society celebrates the diversity of fashion and provides
                students with a platform to showcase ideas, discover inspiration,
                and express themselves beyond the classroom.
              </p>

            </div>

          </div>

        </section>




        {/* Committee */}
        <section className="mb-24">


          <div className="text-center mb-12">

            <h2 className="text-4xl font-bold">
              Society Committee
            </h2>

            <p className="text-gray-500 mt-3 text-lg">
              Academic Year 2025 - 2026
            </p>

          </div>



          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">


            {committee2025.map((member,index)=>(

              <div
                key={index}
                className="bg-white rounded-3xl shadow-lg overflow-hidden hover:-translate-y-2 transition duration-300"
              >

                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full aspect-square object-cover"
                />


                <div className="p-6 text-center">

                  <h3 className="text-xl font-semibold">
                    {member.name}
                  </h3>

                  <p className="text-gray-500 mt-2">
                    {member.role}
                  </p>

                </div>

              </div>

            ))}


          </div>


        </section>





        {/* Future Committee */}
        <section>


          <div className="text-center mb-10">

            <h2 className="text-4xl font-bold">
              2026 - 2027 Committee
            </h2>

          </div>



          <div className="bg-gray-100 rounded-3xl p-8 md:p-12 text-center">


            <h3 className="text-3xl font-semibold mb-4">
              Coming Soon ✨
            </h3>


            <p className="text-gray-600 max-w-2xl mx-auto mb-10">
              The next DKIT Fashion Society committee will be announced soon.
              Stay tuned as a new team continues the society's creative journey.
            </p>



            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">


              {futureCommittee.map((member,index)=>(

                <div key={index}>

                  <img
                    src="/images/placeholder.jpg"
                    alt="Future committee member"
                    className="w-full aspect-square object-cover rounded-3xl"
                  />


                  <p className="mt-4 text-gray-600 font-medium">
                    {member}
                  </p>


                </div>

              ))}


            </div>


          </div>


        </section>


      </main>


    </div>

  );
}