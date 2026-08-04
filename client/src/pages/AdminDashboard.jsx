import { useEffect, useState } from "react";
import API from "../api/axios";
import Editor from "../components/Editor";

export default function AdminDashboard() {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);

  const [fullscreen, setFullscreen] = useState(false);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState("announcement");
  const [imagePosition, setImagePosition] = useState("center");

  const [editingPost, setEditingPost] = useState(null);

  // New states for user filtering and precise email search constraint
  const [userSearchEmail, setUserSearchEmail] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // "all", "admin", "user"

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

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users", config);
      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchUsers();
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

  const toggleAdminRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (!window.confirm(`Change user role to ${newRole}?`)) return;

    try {
      await API.put(`/users/${userId}/role`, { role: newRole }, config);
      fetchUsers();
    } catch (err) {
      console.log(err);
      alert("Failed to update user role.");
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to completely delete this user?")) return;

    try {
      await API.delete(`/users/${userId}`, config);
      fetchUsers();
    } catch (err) {
      console.log(err);
      alert("Failed to delete user.");
    }
  };

  // Filter users: Always show admins, but show regular users only if they match search input
  const filteredUsers = users.filter((u) => {
    const role = u.role || "user";
    const matchesRole = roleFilter === "all" || role === roleFilter;

    const isAdmin = role === "admin";
    const isSearchedUser = userSearchEmail.trim() !== "" && 
      u.email.toLowerCase().includes(userSearchEmail.trim().toLowerCase());

    // Show if they are an admin OR if they match the search query (respecting the role dropdown)
    return matchesRole && (isAdmin || isSearchedUser);
  });

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
      <div className="max-w-7xl mx-auto space-y-10">
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="font-serif text-5xl md:text-6xl text-white">
            Admin Dashboard
          </h1>
          <p className="text-blue-100 mt-3">
            Manage posts, publish updates, maintain website content, and handle user permissions.
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
                  className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#011145]"
                />

                <div className="text-center text-gray-400 text-sm">OR</div>

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
                          headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "multipart/form-data",
                          },
                        }
                      );
                      setCoverImage(res.data.url);
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                  className="w-full border border-gray-200 p-3 rounded-xl"
                />

                {/* PREVIEW */}
                {coverImage && (
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className={`w-full h-[350px] rounded-2xl object-cover object-${imagePosition}`}
                  />
                )}
              </div>

              <select
                value={imagePosition}
                onChange={(e) => setImagePosition(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3"
              >
                <option value="center">Image Center</option>
                <option value="top">Image Top</option>
                <option value="bottom">Image Bottom</option>
              </select>

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

            <div className="space-y-6 max-h-[1150px] overflow-y-auto pr-2">
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

        {/* --- USERS / ADMIN MANAGEMENT SECTION --- */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 mt-10">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div>
              <h2 className="font-serif text-3xl text-[#011145]">
                Website Users & Permissions
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Admins are shown automatically. Search user emails to find standard users.
              </p>
            </div>

            <span className="bg-[#eef2f6] text-[#011145] text-xs uppercase tracking-widest px-4 py-2 rounded-full font-semibold">
              {users.length} Total Users in System
            </span>
          </div>

          {/* CONTROLS: Filter by Role & Email Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-2">
            <input
              type="text"
              placeholder="Search exact email to make user an admin..."
              value={userSearchEmail}
              onChange={(e) => setUserSearchEmail(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#011145]"
            />

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#011145]"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins Only</option>
              <option value="user">Users Only</option>
            </select>
          </div>

          {/* Contextual Helper Note */}
          <p className="text-xs text-gray-400 mb-6 italic">
            Tip: Standard users are hidden by default. Search an exact email above to locate a user and grant admin privileges.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-[#011145] text-sm uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Name / Email</th>
                  <th className="py-3 px-4 font-semibold">Current Role</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/80 transition">
                    <td className="py-4 px-4">
                      <div className="font-medium text-[#011145]">
                        {u.name || u.username || "Unnamed User"}
                      </div>
                      <div className="text-sm text-gray-500">{u.email}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          u.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {u.role || "user"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => toggleAdminRole(u._id, u.role)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                          u.role === "admin"
                            ? "border border-red-300 text-red-600 hover:bg-red-50"
                            : "bg-[#011145] text-white hover:bg-[#020d32]"
                        }`}
                      >
                        {u.role === "admin" ? "Demote to User" : "Make Admin"}
                      </button>

                      <button
                        onClick={() => deleteUser(u._id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-red-700 transition"
                      >
                        Delete User
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center py-8 text-gray-400">
                      No users match the current filter or search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}