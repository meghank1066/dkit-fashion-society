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

  // Dynamic Sections Management State
  const [sections, setSections] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("post_sections");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved sections", e);
        }
      }
    }
    return [
      { id: "featured", title: "Featured Posts", isSystem: true },
      { id: "uncategorized", title: "All Posts", isSystem: true },
    ];
  });

  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editingTitleText, setEditingTitleText] = useState("");
  const [saveNotification, setSaveNotification] = useState(false);

  // Drag-and-drop state
  const [draggedCard, setDraggedCard] = useState(null); // { sectionId, index }

  // Fetch initial posts
  useEffect(() => {
    fetchPosts();
  }, []);

  // Save sections to local storage whenever updated
  useEffect(() => {
    localStorage.setItem("post_sections", JSON.stringify(sections));
  }, [sections]);

  const fetchPosts = () => {
    setLoading(true);
    API.get("/api/posts")
      .then((res) => {
        const mapped = res.data.map((p) => ({
          ...p,
          sectionId: p.sectionId || (p.isFeatured ? "featured" : "uncategorized"),
        }));
        setPosts(mapped);
      })
      .catch((err) => console.error("Error fetching posts:", err))
      .finally(() => setLoading(false));
  };

  // --- Dynamic Section Handlers ---

  const handleCreateSection = () => {
    if (!newSectionTitle.trim()) return alert("Please enter a section title!");
    const sectionId = newSectionTitle.toLowerCase().replace(/[^a-z0-9]/g, "-");

    if (sections.some((s) => s.id === sectionId)) {
      return alert("A section with this title or key already exists.");
    }

    const newSec = {
      id: sectionId,
      title: newSectionTitle.trim(),
      isSystem: false,
    };

    setSections((prev) => [...prev, newSec]);
    setNewSectionTitle("");
  };

  const handleDeleteSection = (sectionId) => {
    if (window.confirm("Are you sure you want to delete this section? Posts in it will move to All Posts.")) {
      setSections((prev) => prev.filter((s) => s.id !== sectionId));
      setPosts((prev) =>
        prev.map((p) =>
          p.sectionId === sectionId ? { ...p, sectionId: "uncategorized" } : p
        )
      );
    }
  };

  const handleStartRenameSection = (sec) => {
    setEditingSectionId(sec.id);
    setEditingTitleText(sec.title);
  };

  const handleSaveRenameSection = (sectionId) => {
    if (!editingTitleText.trim()) return;
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, title: editingTitleText.trim() } : s))
    );
    setEditingSectionId(null);
  };

  const handleSaveSections = () => {
    localStorage.setItem("post_sections", JSON.stringify(sections));
    setSaveNotification(true);
    setTimeout(() => setSaveNotification(false), 3000);
  };

  // --- Admin Post Actions ---

  const handleToggleFeatured = async (postId, currentFeatured) => {
    const nextFeatured = !currentFeatured;
    try {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                isFeatured: nextFeatured,
              }
            : p
        )
      );
      await API.patch(`/api/posts/${postId}`, {
        isFeatured: nextFeatured,
      });
    } catch (err) {
      console.error("Failed to update featured status:", err);
      fetchPosts();
    }
  };

  const handleAssignSection = async (postId, newSectionId) => {
    try {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                sectionId: newSectionId,
                ...(newSectionId === "featured" ? { isFeatured: true } : {}),
              }
            : p
        )
      );
     await API.patch(`/api/posts/${postId}`, {
        sectionId: newSectionId,
        ...(newSectionId === "featured" ? { isFeatured: true } : {}),
      });
    } catch (err) {
      console.error("Failed to assign section:", err);
      fetchPosts();
    }
  };

  const handleToggleArchive = async (postId, currentArchived) => {
    try {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, isArchived: !currentArchived } : p
        )
      );
   await API.patch(`/api/posts/${postId}`, { isArchived: !currentArchived });
    } catch (err) {
      console.error("Failed to archive post:", err);
      fetchPosts();
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to permanently delete this post?"))
      return;
    try {
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      await API.delete(`/api/posts/${postId}`);
    } catch (err) {
      console.error("Failed to delete post:", err);
      fetchPosts();
    }
  };

  const handlePostImageUpload = async (e, postId) => {
    const file = e.target.files[0];
    if (!file) return;

    const tempUrl = URL.createObjectURL(file);
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId ? { ...p, image: tempUrl, coverPhoto: tempUrl } : p
      )
    );

    const formData = new FormData();
    formData.append("coverPhoto", file);

    try {
      await API.post(`/api/posts/${postId}/cover`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (err) {
      console.error("Failed to upload image:", err);
    }
  };

  const handleHeroImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHeroImage(URL.createObjectURL(file));
    }
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e, sectionId, index) => {
    setDraggedCard({ sectionId, index });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetSectionId, targetIndex) => {
    e.preventDefault();
    if (!draggedCard) return;

    const { sectionId: sourceSectionId, index: sourceIndex } = draggedCard;

    if (sourceSectionId === targetSectionId && sourceIndex !== targetIndex) {
      const sectionPosts = filteredPosts.filter((p) => 
        targetSectionId === "featured" ? p.isFeatured : p.sectionId === targetSectionId
      );
      const otherPosts = posts.filter((p) => !sectionPosts.includes(p));

      const updatedSectionPosts = [...sectionPosts];
      const [movedPost] = updatedSectionPosts.splice(sourceIndex, 1);
      updatedSectionPosts.splice(targetIndex, 0, movedPost);

      setPosts([...otherPosts, ...updatedSectionPosts]);
    }
    setDraggedCard(null);
  };

  // --- Filtering Logic ---
  const filteredPosts = posts.filter((post) => {
    if (filter === "active") return !post.isArchived;
    if (filter === "archived") return post.isArchived;
    if (filter === "featured") return post.isFeatured && !post.isArchived;
    return true; // 'all'
  });

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans antialiased">
      {/* --- Sticky Admin Bar --- */}
      {isAdminUser && (
        <div className="sticky top-0 z-50 bg-slate-900 text-white px-4 sm:px-8 py-3 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-lg text-sm font-medium">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 bg-emerald-400 animate-pulse"></span>
            <span>DKIT Fashion Society - Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleSaveSections}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-semibold transition shadow-sm"
            >
              {saveNotification ? "✓ Layout Saved!" : "➢ Save Layout"}
            </button>
            <button
              onClick={() => setIsAdminMode(!isAdminMode)}
              className="bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 text-white font-semibold transition shadow-sm text-xs"
            >
              {isAdminMode ? "Exit Admin Mode" : "Admin Panel Mode"}
            </button>
          </div>
        </div>
      )}

      {/* --- Admin Control Dashboard Panel --- */}
      {isAdminUser && isAdminMode && (
        <div className="max-w-7xl mx-auto my-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-50/90 border border-indigo-200/80 p-4 sm:p-6 lg:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-indigo-950 flex items-center gap-2">
                ⚙️ Posts & Section Management Dashboard
              </h3>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-3 py-1">
                Active
              </span>
            </div>

            {/* Create Section Control */}
            <div className="space-y-2 border-b border-indigo-200/60 pb-5">
              <label className="text-xs font-bold text-indigo-900 uppercase tracking-wider block">
                Add New Content Section / Category Column
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder='e.g., "Lifestyle", "Fashion Week 2026", "Highlights"'
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  className="flex-1 min-w-[240px] px-3.5 py-2 bg-white border border-indigo-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />
                <button
                  onClick={handleCreateSection}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-semibold transition shadow-sm"
                >
                  + Add Section
                </button>
              </div>
            </div>

            {/* Filter View Selector with Preserved Custom Emojis */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
              <span className="text-xs font-semibold text-indigo-900 w-full sm:w-auto">
                Filter View:
              </span>
              {[
                { label: "All Posts", value: "all" },
                { label: "Active  📽", value: "active" },
                { label: "Featured  ★", value: "featured" },
                { label: "Archived 𓍢ִ໋🀦", value: "archived" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`px-3 py-1.5 text-xs font-semibold transition ${
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
            Stay updated with the latest news, announcements, creative projects, and event highlights from the DKIT Fashion Society.
          </p>

          {isAdminUser && isAdminMode && (
            <div className="pt-4">
              <label className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white px-4 py-2 text-xs font-semibold cursor-pointer transition">
                <span> 📷 Edit Hero Cover Photo</span>
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

      {/* --- Main Content (Sections & Posts Columns) --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 md:py-16 space-y-16">
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-medium">
            Loading society posts...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white border border-gray-100 shadow-sm max-w-lg mx-auto">
            <p className="text-lg font-semibold text-gray-600">No posts found.</p>
            <p className="text-sm text-gray-400 mt-1">
              {filter !== "all"
                ? `No posts matching the '${filter}' filter.`
                : "Check back later for updates!"}
            </p>
          </div>
        ) : (
          sections.map((sec) => {
            const sectionPosts = filteredPosts.filter((p) => {
              if (sec.id === "featured") {
                return p.isFeatured;
              }
              return p.sectionId === sec.id || (sec.id === "uncategorized" && !p.sectionId && !p.isFeatured);
            });

            if (sectionPosts.length === 0 && (!isAdminUser || !isAdminMode)) {
              return null;
            }

            return (
              <section
                key={sec.id}
                className="bg-white border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6"
              >
                {/* Section Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div className="flex-1 min-w-[200px]">
                    {editingSectionId === sec.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingTitleText}
                          onChange={(e) => setEditingTitleText(e.target.value)}
                          className="text-xl font-bold text-gray-900 border border-indigo-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          onClick={() => handleSaveRenameSection(sec.id)}
                          className="bg-emerald-600 text-white px-3 py-1 text-xs font-semibold"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                          {sec.title}
                        </h2>
                        {isAdminUser && isAdminMode && !sec.isSystem && (
                          <button
                            onClick={() => handleStartRenameSection(sec)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold bg-indigo-50 px-2 py-1 border border-indigo-100"
                          >
                            𓂃🖊 Edit Title
                          </button>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 font-medium mt-0.5">
                      {sectionPosts.length} post{sectionPosts.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  {isAdminUser && isAdminMode && !sec.isSystem && (
                    <button
                      onClick={() => handleDeleteSection(sec.id)}
                      className="bg-rose-100 text-rose-700 hover:bg-rose-200 px-3 py-1.5 text-xs font-semibold transition"
                    >
                      🗑 Remove Section
                    </button>
                  )}
                </div>

                {/* Section Cards Grid */}
                {sectionPosts.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-200 p-8 text-center text-xs text-gray-400 font-medium">
                    This section is empty. Use the post settings below to assign posts here.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {sectionPosts.map((post, index) => (
                      <div
                        key={`${sec.id}-${post._id}`}
                        draggable={isAdminUser && isAdminMode}
                        onDragStart={(e) => handleDragStart(e, sec.id, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, sec.id, index)}
                        className={`bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col relative group ${
                          isAdminUser && isAdminMode
                            ? "cursor-grab active:cursor-grabbing"
                            : ""
                        }`}
                      >
                        {/* Drag Handle Bar */}
                        {isAdminUser && isAdminMode && (
                          <div className="bg-slate-800 text-slate-200 text-[10px] font-semibold tracking-wider uppercase px-3 py-1 flex items-center justify-between select-none">
                            <span>⋮⋮ Drag to reorder</span>
                            <span className="text-indigo-300 font-mono">#{index + 1}</span>
                          </div>
                        )}

                        {/* Badges */}
                        <div className="absolute top-10 left-3 sm:top-10 sm:left-4 z-10 flex flex-wrap gap-1.5">
                          {post.isFeatured && (
                            <span className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 shadow-md">
                              ★ Featured
                            </span>
                          )}
                          {post.isArchived && (
                            <span className="bg-slate-700 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 shadow-md">
                              ִ໋🀦 Archived
                            </span>
                          )}
                        </div>

                        {/* Admin Cover Photo Hover Button */}
                        {isAdminUser && isAdminMode && (
                          <label className="absolute top-10 right-3 sm:top-10 sm:right-4 z-20 bg-slate-900/80 hover:bg-slate-900 text-white text-xs px-2.5 py-1.5 cursor-pointer transition shadow-md flex items-center gap-1">
                            <span>📷 Cover</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handlePostImageUpload(e, post._id)}
                            />
                          </label>
                        )}

                        {/* Post Card Component Wrapper */}
                        <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
                          <PostCard post={post} />
                        </div>

                        {/* Admin Control Bar */}
                        {isAdminUser && isAdminMode && (
                          <div className="p-3 sm:p-4 bg-slate-100 border-t border-slate-200 flex flex-col gap-2.5 text-xs font-semibold mt-auto">
                            {/* Section Assignment Dropdown */}
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] text-gray-500 font-bold uppercase">Section:</span>
                              <select
                                value={post.isFeatured ? "featured" : (post.sectionId || "uncategorized")}
                                onChange={(e) => handleAssignSection(post._id, e.target.value)}
                                className="bg-white border border-gray-300 text-gray-800 px-2 py-1 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none flex-1"
                              >
                                {sections.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.title}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Actions Buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-200/80">
                              <button
                                onClick={() => handleToggleFeatured(post._id, post.isFeatured)}
                                className={`flex-1 px-2 py-1 transition text-center ${
                                  post.isFeatured
                                    ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                    : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-300"
                                }`}
                              >
                                {post.isFeatured ? "Unfeature" : "Feature ★"}
                              </button>

                              <button
                                onClick={() => handleToggleArchive(post._id, post.isArchived)}
                                className={`flex-1 px-2 py-1 transition text-center ${
                                  post.isArchived
                                    ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                    : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-300"
                                }`}
                              >
                                {post.isArchived ? "Unarchive " : "Archive 𓍢ִ໋🀦"}
                              </button>

                              <button
                                onClick={() => handleDeletePost(post._id)}
                                className="px-2 py-1 bg-rose-600 text-white hover:bg-rose-700 transition text-center"
                              >
                                Delete 🗑
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })
        )}
      </main>
    </div>
  );
}