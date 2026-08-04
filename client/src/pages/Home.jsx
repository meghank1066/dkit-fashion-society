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

<section className="relative min-h-[80vh] flex items-center justify-center bg-[#030f36] text-white py-48 md:py-60 px-6 text-center overflow-hidden">
  
  {/* Background Image */}
  <img 
    src="/images/webdesign/hero/hero-img4.jpg" 
    alt="DKIT Fashion Society Hero Background" 
    className="absolute inset-0 w-full h-full object-cover object-center"
  />

  {/* Strong Navy Multiply Tint */}
  <div className="absolute inset-0 bg-[#061a52]/60 mix-blend-multiply"></div>

  {/* Subtle Darkening Overlay */}
  <div className="absolute inset-0 bg-[#030f36]/40"></div>

  {/* Hero Content with PNG Logo */}
  <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
    
    {/* White PNG Logo replacing the <h1> */}
    {/* <img 
      src="/images/webdesign/logo/logowhiterm.png" 
      alt="DKIT Fashion Society Logo" 
      className="h-42 md:h-44 w-auto object-contain mb-8 drop-shadow-lg"
    /> */}

    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white max-w-7xl mx-auto font-serif font-normal tracking-wide leading-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
  A creative community celebrating fashion, self-expression, photography and student collaboration.
</h2>

  </div>

</section>


      {/* EVENTS */}

 {/* EVENTS */}

<section className="max-w-7xl mx-auto px-5 sm:px-8 py-20">


  <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-12 gap-5">


    <div>

      <h2 className="text-4xl md:text-5xl font-serif">
        Upcoming Events
      </h2>


      <p className="text-gray-500 mt-3 text-base md:text-lg">
        Discover the latest DKIT Fashion Society activities.
      </p>

    </div>


    <Link
      to="/posts"
      className="uppercase tracking-widest text-sm font-medium hover:opacity-60 transition"
    >
      View All
    </Link>


  </div>



  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">


    {events.slice(0,3).map(post => (

      <Link
        key={post._id}
        to={`/posts/${post._id}`}
        className="group border border-gray-200 bg-white overflow-hidden transition hover:shadow-xl"
      >


        <div className="overflow-hidden">

          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-72 sm:h-80 object-cover group-hover:scale-105 transition duration-500"
          />

        </div>



        <div className="p-6">


          <h3 className="text-2xl font-serif">
            {post.title}
          </h3>


          <p className="text-gray-500 mt-3 leading-relaxed">
            {post.subtitle}
          </p>


        </div>


      </Link>

    ))}


  </div>


</section>


      {/* BLOG */}
{/* BLOG */}
<section className="max-w-7xl mx-auto px-5 sm:px-8 py-20">

  {/* Header with View All link */}
  <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-12 gap-5">
    <div>
      <h2 className="text-4xl md:text-5xl font-serif text-[#011145]">
        Blog
      </h2>
      <p className="text-gray-500 mt-3 text-base md:text-lg">
        Explore fashion, beauty, lifestyle and creative stories.
      </p>
    </div>

    <Link
      to="/posts"
      className="uppercase tracking-widest text-sm font-medium text-[#011145] hover:opacity-60 transition"
    >
      View All
    </Link>
  </div>

  {/* Cards Grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

    {/* Fashion Category */}
    {fashionPosts.slice(0, 1).map((post) => (
      <Link
        key={post._id}
        to={`/posts/${post._id}`}
        className="group border border-gray-200 bg-white overflow-hidden transition hover:shadow-xl flex flex-col"
      >
        <div className="overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-72 sm:h-80 object-cover group-hover:scale-105 transition duration-500"
          />
        </div>

        <div className="p-6">
          <span className="text-xs uppercase tracking-widest font-semibold text-gray-400 block mb-2">
            Fashion
          </span>
          <h3 className="text-2xl font-serif text-[#011145]">
            {post.title}
          </h3>
          <p className="text-gray-500 mt-3 leading-relaxed line-clamp-2">
            {post.subtitle || post.excerpt}
          </p>
        </div>
      </Link>
    ))}

    {/* Beauty / Makeup Category */}
    {makeupPosts.slice(0, 1).map((post) => (
      <Link
        key={post._id}
        to={`/posts/${post._id}`}
        className="group border border-gray-200 bg-white overflow-hidden transition hover:shadow-xl flex flex-col"
      >
        <div className="overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-72 sm:h-80 object-cover group-hover:scale-105 transition duration-500"
          />
        </div>

        <div className="p-6">
          <span className="text-xs uppercase tracking-widest font-semibold text-gray-400 block mb-2">
            Beauty
          </span>
          <h3 className="text-2xl font-serif text-[#011145]">
            {post.title}
          </h3>
          <p className="text-gray-500 mt-3 leading-relaxed line-clamp-2">
            {post.subtitle || post.excerpt}
          </p>
        </div>
      </Link>
    ))}

    {/* Lifestyle Category */}
    {lifestylePosts.slice(0, 1).map((post) => (
      <Link
        key={post._id}
        to={`/posts/${post._id}`}
        className="group border border-gray-200 bg-white overflow-hidden transition hover:shadow-xl flex flex-col"
      >
        <div className="overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-72 sm:h-80 object-cover group-hover:scale-105 transition duration-500"
          />
        </div>

        <div className="p-6">
          <span className="text-xs uppercase tracking-widest font-semibold text-gray-400 block mb-2">
            Lifestyle
          </span>
          <h3 className="text-2xl font-serif text-[#011145]">
            {post.title}
          </h3>
          <p className="text-gray-500 mt-3 leading-relaxed line-clamp-2">
            {post.subtitle || post.excerpt}
          </p>
        </div>
      </Link>
    ))}

  </div>

</section>

    {/* QUOTE BANNER */}
<section className="relative w-full h-80 sm:h-96 flex items-center justify-center overflow-hidden bg-[#011145]">
  
  {/* Background Image */}
  <img 
    src="/images/webdesign/hero/hero-block2.jpg" 
    alt="DKIT Fashion Society Banner" 
    className="absolute inset-0 w-full h-full object-cover object-center"
  />

  {/* Navy Tint Overlay (Matches the image filter effect) */}
  <div className="absolute inset-0 bg-[#011145]/85 mix-blend-multiply"></div>

  {/* Text Content */}
  <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
    <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif text-white tracking-wide font-normal leading-tight drop-shadow-sm">
      Fashion is the story we choose to tell without words.
    </h2>
  </div>

</section>
    
{/* EDITORIALS */}
<section className="w-full pt-20 pb-0 text-center">

  {/* Header Container */}
  <div className="max-w-3xl mx-auto px-5 sm:px-8 mb-14">
    <span className="text-xs uppercase tracking-[0.3em] font-medium text-gray-400 block mb-3">
      Creative Portfolio
    </span>
    <h2 className="text-4xl md:text-5xl font-serif text-[#000b21] tracking-wide mb-4">
      Photoshoot Editorials
    </h2>
    <p className="text-gray-500 text-base md:text-lg font-light leading-relaxed">
      Showcasing student creativity through styling, photography, and high-fashion storytelling.
    </p>
  </div>

  {/* Full Width Midnight Card */}
  <div className="w-full bg-[#00071c] text-white py-16 md:py-24 px-6 border-y border-white/10 shadow-2xl relative overflow-hidden">
    
    {/* Minimalist Top Accent Line */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[1px] bg-white/30" />

    <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
      
      {/* Editorial Season Label */}
      <span className="text-[11px] uppercase tracking-[0.35em] text-gray-400 font-medium mb-4 border border-white/15 px-4 py-1.5 rounded-full">
        Next Season
      </span>

      {/* Main Title */}
      <h3 className="text-3xl md:text-5xl font-serif font-normal tracking-wide text-white mb-6">
        Coming Soon
      </h3>

      <div className="w-12 h-[1px] bg-white/20 mb-6" />

      {/* Description */}
      <p className="text-gray-300 font-light text-base md:text-lg leading-relaxed max-w-lg">
        Editorial shoots, creative collaborations, and featured student work will be announced throughout the academic year.
      </p>

    </div>

  </div>

</section>
    

    
      {/* MEMBERSHIP */}

      {/* MEMBERSHIP & CONTACT */}
<section className="bg-[#eef2f6] text-[#011145] py-20 px-6 sm:px-12">
  <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-start">

    {/* Left Column: Graphic Card + Membership Button */}
    <div className="md:col-span-5 flex flex-col items-center">
      
     {/* Left Column: Graphic Card + Membership Button */}
<div className="md:col-span-5 flex flex-col items-center">
  
  {/* Square Graphic Card */}
  <div className="w-full aspect-square bg-[#011145] text-white flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
    <img 
      src="/images/webdesign/hero/cover-img-hero2.png" 
      alt="DKIT Fashion Society Cover" 
      className="w-full h-full object-cover object-center"
    />
  </div>

  {/* Place your Membership Button right below here */}

</div>

      {/* Pill Membership Button */}
      <a
        href="https://forms.gle/DxVXfXR5DLojWtkg6"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 border-2 border-[#011145] text-[#011145] px-8 py-3 rounded-2xl text-sm font-medium hover:bg-[#011145] hover:text-white transition duration-300 text-center cursor-pointer"
      >
        Membership Here!
      </a>

        <a
        href="https://forms.gle/VSDTgJMXZf1Cy4uw8"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 border-2 border-[#011145] text-[#011145] px-8 py-3 rounded-2xl text-sm font-medium hover:bg-[#011145] hover:text-white transition duration-300 text-center cursor-pointer"
      >
        Join Our Committee
      </a>

    </div>

    {/* Right Column: Contact Form */}
   <div className="md:col-span-7">
  <form
    onSubmit={async (e) => {
      e.preventDefault();
      const form = e.target;
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerText = "Sending...";

      const formData = new FormData(form);
      // Replace with your Web3Forms Access Key
      formData.append("access_key", "YOUR_WEB3FORMS_ACCESS_KEY");

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();

        if (data.success) {
          alert("Thank you! Your message has been sent.");
          form.reset();
        } else {
          alert(data.message || "Something went wrong. Please try again.");
        }
      } catch (err) {
        alert("An error occurred. Please try again later.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit";
      }
    }}
    className="space-y-6"
  >
    {/* Anti-spam Honeypot (Recommended by Web3Forms) */}
    <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />

    {/* Name Fields Row */}
    <div>
      <label className="block text-sm font-medium mb-2">
        Name
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            name="first_name"
            required
            className="w-full border border-[#011145]/30 bg-white/50 focus:bg-white rounded-2xl p-3 text-sm focus:outline-none focus:border-[#011145] transition"
          />
          <span className="text-xs text-gray-500 mt-1 block">
            First Name <span className="text-gray-400">(required)</span>
          </span>
        </div>

        <div>
          <input
            type="text"
            name="last_name"
            required
            className="w-full border border-[#011145]/30 bg-white/50 focus:bg-white rounded-2xl p-3 text-sm focus:outline-none focus:border-[#011145] transition"
          />
          <span className="text-xs text-gray-500 mt-1 block">
            Last Name <span className="text-gray-400">(required)</span>
          </span>
        </div>
      </div>
    </div>

    {/* Email Field */}
    <div>
      <label className="block text-sm font-medium mb-1">
        Email <span className="text-xs text-gray-500 font-normal">(required)</span>
      </label>
      <input
        type="email"
        name="email"
        required
        className="w-full border border-[#011145]/30 bg-white/50 focus:bg-white rounded-2xl p-3 text-sm focus:outline-none focus:border-[#011145] transition"
      />
    </div>

    {/* Subject Field */}
    <div>
      <label className="block text-sm font-medium mb-1">
        Subject <span className="text-xs text-gray-500 font-normal">(required)</span>
      </label>
      <input
        type="text"
        name="subject"
        required
        className="w-full border border-[#011145]/30 bg-white/50 focus:bg-white rounded-2xl p-3 text-sm focus:outline-none focus:border-[#011145] transition"
      />
    </div>

    {/* Message Field */}
    <div>
      <label className="block text-sm font-medium mb-1">
        Message <span className="text-xs text-gray-500 font-normal">(required)</span>
      </label>
      <textarea
        name="message"
        rows={5}
        required
        className="w-full border border-[#011145]/30 bg-white/50 focus:bg-white rounded-2xl p-3 text-sm focus:outline-none focus:border-[#011145] transition"
      />
    </div>

    {/* Submit Button */}
    <div>
      <button
        type="submit"
        className="border border-[#011145] text-[#011145] px-8 py-2.5 rounded-2xl text-sm font-medium hover:bg-[#011145] hover:text-white transition duration-300 disabled:opacity-50"
      >
        Submit
      </button>
    </div>

  </form>
</div>

  </div>
</section>

     {/* FOOTER */}

<footer className="bg-white text-[#011145] py-12 text-center border-t border-gray-200">

  {/* Logo / Header */}
 <div className="mb-8 flex justify-center">
    <Link to="/">
      <img 
        src="/images/webdesign/logo/logonavy-rm.png" 
        alt="DKIT Fashion Society Logo" 
        className="h-16 w-auto object-contain transition-all hover:opacity-90"
      />
    </Link>
  </div>

  <div className="border-t border-gray-200 max-w-4xl mx-auto mb-8"></div>

  {/* Links */}
  <div className="flex flex-wrap justify-center gap-8 text-sm uppercase tracking-widest mb-8 font-medium">

    <a
      href="https://www.instagram.com/dkitfashionsociety"
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#011145] hover:opacity-70 transition-all duration-200"
    >
      Instagram
    </a>

    <a
      href="https://www.dkit.ie/sports-and-societies"
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#011145] hover:opacity-70 transition-all duration-200"
    >
      DKIT Sports & Societies
    </a>

    <a
      href="#"
      className="text-[#011145] hover:opacity-70 transition-all duration-200"
    >
      Sign Up
    </a>

    <a
      href="#"
      className="text-[#011145] hover:opacity-70 transition-all duration-200"
    >
      WhatsApp
    </a>

  </div>

  {/* Copyright */}
  <p className="text-xs mt-6 text-[#011145]/60">
    © {new Date().getFullYear()} DKIT Fashion Society. All rights reserved.
  </p>

</footer>


    </div>

  );

}