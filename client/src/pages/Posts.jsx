import { useEffect, useState } from "react";
import API from "../api/axios";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";

export default function Posts() {
  const { user } = useAuth();
  const isAdminUser = user?.role === "admin";

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hero Cover Photo State
  const [heroImage, setHeroImage] = useState(
    "/images/webdesign/members/abouthero.png"
  );

  // Admin Controls State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [filter, setFilter] = useState("all"); // 'all' | 'active' | 'archived' | 'featured'

  // Fetch initial posts
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    setLoading(true);
    API.get("/posts")
      .then((res) => {
        setPosts(res.data);
      })
      .catch((err) => console.error("Error fetching posts:", err))
      .finally(() => setLoading(false));
  };

  // --- Admin Handler Functions ---

  // 1. Toggle Featured Status
  const handleToggleFeatured = async (postId, currentFeatured) => {
    try {
      // Optimistic update
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, isFeatured: !currentFeatured } : p
        )
      );
      await API.patch(`/posts/${postId}`, { isFeatured: !currentFeatured });
    } catch (err) {
      console.error("Failed to update featured status:", err);
      fetchPosts(); // Rollback on error
    }
  };

  // 2. Toggle Archive Status
  const handleToggleArchive = async (postId, currentArchived) => {
    try {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, isArchived: !currentArchived } : p
        )
      );
      await API.patch(`/posts/${postId}`, { isArchived: !currentArchived });
    } catch (err) {
      console.error("Failed to archive post:", err);
      fetchPosts();
    }
  };

  // 3. Delete Post
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to permanently delete this post?"))
      return;
    try {
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      await API.delete(`/posts/${postId}`);
    } catch (err) {
      console.error("Failed to delete post:", err);
      fetchPosts();
    }
  };

  // 4. Update Post Cover Photo
  const handlePostImageUpload = async (e, postId) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create local preview immediately
    const tempUrl = URL.createObjectURL(file);
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId ? { ...p, image: tempUrl, coverPhoto: tempUrl } : p
      )
    );

    // Prepare upload payload
    const formData = new FormData();
    formData.append("coverPhoto", file);

    try {
      await API.post(`/posts/${postId}/cover`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (err) {
      console.error("Failed to upload image:", err);
    }
  };

  // 5. Hero Cover Photo Change
  const handleHeroImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHeroImage(URL.createObjectURL(file));
      // Optional: API.post('/page-settings/posts-hero', formData)
    }
  };

  // --- Filtering Posts for Display ---
  const filteredPosts = posts.filter((post) => {
    if (filter === "active") return !post.isArchived;
    if (filter === "archived") return post.isArchived;
    if (filter === "featured") return post.isFeatured && !post.isArchived;
    return true; // 'all'
  });

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans antialiased">
      {/* --- Sticky Admin Bar (Only Visible to Logged In Admins) --- */}
      {isAdminUser && (
        <div className="sticky top-0 z-50 bg-slate-900 text-white px-4 sm:px-8 py-3 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-lg text-sm font-medium">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>DKIT Fashion Society - Admin Dashboard</span>
          </div>
          <button
            onClick={() => setIsAdminMode(!isAdminMode)}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded-xl text-white font-semibold transition shadow-sm"
          >
            {isAdminMode ? "Exit Admin Mode" : "Admin Panel Mode"}
          </button>
        </div>
      )}

      {/* --- Admin Control Dashboard Panel --- */}
      {isAdminUser && isAdminMode && (
        <div className="max-w-7xl mx-auto my-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-50/90 border border-indigo-200/80 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-indigo-950 flex items-center gap-2">
                ⚙️ Posts Admin Management
              </h3>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
                Active
              </span>
            </div>

            <p className="text-xs text-indigo-700">
              Filter posts below to manage visibility, feature posts on the
              main feed, update cover photos, or archive/delete outdated posts.
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
              <span className="text-xs font-semibold text-indigo-900 w-full sm:w-auto">
                Filter View:
              </span>
              {[
                { label: "All Posts", value: "all" },
                { label: "Active", value: "active" },
                { label: "Featured ⭐", value: "featured" },
                { label: "Archived 📦", value: "archived" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    filter === tab.value
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-indigo-900 hover:bg-indigo-100 border border-indigo-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- Hero Section --- */}
      <section className="relative overflow-hidden text-white py-12 sm:py-20 md:py-28 px-4 sm:px-6 lg:px-8 text-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
          style={{ backgroundImage: `url('${heroImage}')` }}
        />
        <div className="absolute inset-0 bg-[#0B132B]/85 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-white">
            Society Posts & News
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed px-2">
            Stay updated with the latest news, announcements, creative
            projects, and event highlights from the DKIT Fashion Society.
          </p>

          {/* Admin Hero Image Change Button */}
          {isAdminUser && isAdminMode && (
            <div className="pt-4">
              <label className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition">
                <span>📷 Edit Hero Cover Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleHeroImageUpload}
                />
              </label>
            </div>
          )}
        </div>
      </section>

      {/* --- Main Content --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 md:py-16">
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-medium">
            Loading society posts...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-lg mx-auto">
            <p className="text-lg font-semibold text-gray-600">
              No posts found.
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {filter !== "all"
                ? `No posts matching the '${filter}' filter.`
                : "Check back later for updates!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredPosts.map((post) => (
              <div
                key={post._id}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col relative group"
              >
                {/* Featured / Archived Badges */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex flex-wrap gap-1.5">
                  {post.isFeatured && (
                    <span className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                      ⭐ Featured
                    </span>
                  )}
                  {post.isArchived && (
                    <span className="bg-slate-700 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                      📦 Archived
                    </span>
                  )}
                </div>

                {/* Admin Cover Photo Hover Overlay */}
                {isAdminUser && isAdminMode && (
                  <label className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 bg-slate-900/80 hover:bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-xl cursor-pointer transition shadow-md flex items-center gap-1">
                    <span>📷 Change Cover</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePostImageUpload(e, post._id)}
                    />
                  </label>
                )}

                {/* Post Card Wrapper with added Padding & Overflow safety */}
                <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
                  <PostCard post={post} />
                </div>

                {/* Admin Control Bar for each post card */}
                {isAdminUser && isAdminMode && (
                  <div className="p-3 sm:p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold mt-auto">
                    <button
                      onClick={() =>
                        handleToggleFeatured(post._id, post.isFeatured)
                      }
                      className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg transition text-center ${
                        post.isFeatured
                          ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-300"
                      }`}
                    >
                      {post.isFeatured ? "Unfeature ⭐" : "Feature ⭐"}
                    </button>

                    <button
                      onClick={() =>
                        handleToggleArchive(post._id, post.isArchived)
                      }
                      className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg transition text-center ${
                        post.isArchived
                          ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                          : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-300"
                      }`}
                    >
                      {post.isArchived ? "Unarchive 📤" : "Archive 📦"}
                    </button>

                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="w-full sm:w-auto px-2.5 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition text-center"
                    >
                      Delete 🗑️
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}