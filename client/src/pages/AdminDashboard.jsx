import { useEffect, useState } from "react";
import API from "../api/axios";
import Editor from "../components/Editor";

export default function AdminDashboard() {
  const [posts, setPosts] = useState([]);

  const [fullscreen, setFullscreen] = useState(false);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState("announcement");
  const [imagePosition, setImagePosition] = useState("center");

  const [editingPost, setEditingPost] = useState(null);

  const token = localStorage.getItem("token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts");

      setPosts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    setContent("");
    setCoverImage("");
    setCategory("announcement");
    setImagePosition("center");
    setEditingPost(null);
  };

  const submitPost = async (e) => {
    e.preventDefault();

    const data = {
      title,
      subtitle,
      content,
      coverImage,
      category,
      imagePosition,
    };

    try {
      if (editingPost) {
        await API.put(`/posts/${editingPost._id}`, data, config);
      } else {
        await API.post("/posts", data, config);
      }

      resetForm();

      fetchPosts();
    } catch (err) {
      console.log(err);
    }
  };

  const editPost = (post) => {
    setEditingPost(post);

    setTitle(post.title);
    setSubtitle(post.subtitle);
    setCoverImage(post.coverImage);
    setContent(post.content);
    setCategory(post.category);
    setImagePosition(post.imagePosition || "center");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deletePost = async (id) => {
    if (!window.confirm("Delete this post?")) return;

    await API.delete(`/posts/${id}`, config);

    fetchPosts();
  };

  // Remove HTML from Tiptap preview
  const getExcerpt = (html) => {
    const text = html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();

    return text.length > 140
      ? text.substring(0, 140) + "..."
      : text || "No content";
  };

  return (
    <div className="min-h-screen bg-[#011145] p-5 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}

        <div className="mb-10">
          <h1 className="font-serif text-5xl md:text-6xl text-white">
            Admin Dashboard
          </h1>

          <p className="text-blue-100 mt-3">
            Manage posts, publish updates and maintain website content.
          </p>
        </div>

        <div className="grid xl:grid-cols-3 gap-10">
          {/* CREATE / EDIT */}

          <div
            className={
              fullscreen
                ? "fixed inset-0 z-50 bg-white p-8 md:p-16 overflow-y-auto"
                : "xl:col-span-2 bg-white rounded-3xl shadow-2xl p-6 md:p-8"
            }
          >
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
              <div>
                <h2 className="font-serif text-3xl text-[#011145]">
                  {editingPost ? "Edit Post" : "Create Post"}
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  Tiptap editor powered content
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="border border-gray-300 px-4 py-2 rounded-xl hover:bg-gray-100 transition"
                >
                  New
                </button>

                <button
                  type="button"
                  onClick={() => setFullscreen(!fullscreen)}
                  className="border border-[#011145] text-[#011145] px-5 py-2 rounded-xl hover:bg-[#011145] hover:text-white transition"
                >
                  {fullscreen ? "Exit Fullscreen" : "Fullscreen"}
                </button>
              </div>
            </div>

            <form onSubmit={submitPost} className="space-y-5">
              <input
                placeholder="Post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#011145]"
              />

              <input
                placeholder="Short description"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#011145]"
              />

             {/* Cover Image */}
<div className="space-y-3">

  <label className="text-sm font-medium text-[#011145]">
    Cover Image
  </label>


  {/* URL INPUT */}
  <input
    placeholder="Paste image URL"
    value={coverImage}
    onChange={(e) => setCoverImage(e.target.value)}
    className="w-full border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-[#011145]"
  />


  <div className="text-center text-gray-400 text-sm">
    OR
  </div>


  {/* FILE UPLOAD */}
  <input
    type="file"
    accept="image/*"
    onChange={async (e) => {

      const file = e.target.files[0];

      if (!file) return;


      const formData = new FormData();

      formData.append("image", file);


      try {

        const res = await API.post(
          "/upload",
          formData,
          {
            headers:{
              Authorization:`Bearer ${token}`,
              "Content-Type":"multipart/form-data"
            }
          }
        );


        setCoverImage(res.data.url);


      } catch(error){

        console.log(error);

      }

    }}
    className="w-full border border-gray-200 p-3"
  />


  {/* PREVIEW */}
  {coverImage && (
    <img
      src={coverImage}
      alt="Cover preview"
      className={`w-full h-[350px] object-cover object-${imagePosition}`}
    />
  )}

</div>

              <select
                value={imagePosition}
                onChange={(e) => setImagePosition(e.target.value)}
                className="border border-gray-200 rounded-xl p-3"
              >
                <option value="center">Image Center</option>

                <option value="top">Image Top</option>

                <option value="bottom">Image Bottom</option>
              </select>

              {coverImage && (
                <img
                  src={coverImage}
                  alt="preview"
                  className={`w-full h-[350px] rounded-2xl object-cover object-${imagePosition}`}
                />
              )}

<div className="min-h-[600px]">
  <Editor
    content={content}
    setContent={setContent}
  />
</div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3"
              >
                <option value="announcement">Announcement</option>

                <option value="event">Event</option>

                <option value="fashion">Fashion</option>

                <option value="makeup">Beauty</option>

                <option value="lifestyle">Lifestyle</option>

                <option value="editorial">Editorial</option>
              </select>

              <button className="bg-[#011145] text-white px-8 py-3 rounded-xl hover:bg-[#020d32] transition">
                {editingPost ? "Update Post" : "Publish Post"}
              </button>
            </form>
          </div>

          {/* MANAGE POSTS */}

          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-serif text-3xl text-[#011145]">
                Manage Posts
              </h2>

              <span className="bg-[#eef2f6] text-[#011145] text-xs uppercase tracking-widest px-4 py-2 rounded-full">
                {posts.length} Posts
              </span>
            </div>

            <div className="space-y-6">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition"
                >
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />

                  <div className="p-5">
                    <h3 className="font-serif text-2xl text-[#011145]">
                      {post.title}
                    </h3>

                    <span className="inline-block mt-3 bg-[#eef2f6] text-[#011145] text-xs uppercase tracking-widest px-3 py-1 rounded-full">
                      {post.category}
                    </span>

                    <p className="text-gray-600 mt-4 leading-relaxed">
                      {getExcerpt(post.content)}
                    </p>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => editPost(post)}
                        className="border border-[#011145] text-[#011145] px-5 py-2 rounded-xl hover:bg-[#011145] hover:text-white transition"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deletePost(post._id)}
                        className="bg-red-600 text-white px-5 py-2 rounded-xl hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
