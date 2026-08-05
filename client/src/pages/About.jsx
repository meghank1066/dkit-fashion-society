import React, { useState, useEffect } from "react";

export default function About() {
  // 1. Dynamic State for Committee Sections
  const [committees, setCommittees] = useState(() => {
    // Check localStorage synchronously on initial state evaluation to prevent flash/overwrite
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("committees");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved committees", e);
        }
      }
    }
    return [
      {
        id: "2025-2026",
        title: "Academic Year 2025 – 2026",
        members: [
          {
            name: "Meghan Keightley",
            role: "Founder & Chairperson",
            image: "/images/webdesign/members/meghan26.jpg",
          },
          {
            name: "Mila Murphy",
            role: "Committee Member",
            image: "/images/webdesign/members/mila26.jpg",
          },
          {
            name: "Caren Rita Pinheiro",
            role: "Committee Member",
            image: "/images/webdesign/members/caren26.jpg",
          },
          {
            name: "Amber Dempsey",
            role: "Committee Member",
            image: "/images/webdesign/members/amber26.jpg",
          },
        ],
      },
    ];
  });

  // Admin state controls
  const [isAdmin, setIsAdmin] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("Academic Year 2026 – 2027");
  const [saveNotification, setSaveNotification] = useState(false);

  // Drag and drop tracking state
  const [draggedCard, setDraggedCard] = useState(null); // { sectionId, index }

  // Check admin access
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.role === "admin") {
        setIsAdmin(true);
      }
    } catch (err) {
      console.error("Error reading user from localStorage", err);
    }
  }, []);

  // Save changes automatically whenever `committees` state updates
  useEffect(() => {
    localStorage.setItem("committees", JSON.stringify(committees));
  }, [committees]);

  // Manual save trigger to provide user feedback
  const handleSaveToLocalStorage = () => {
    localStorage.setItem("committees", JSON.stringify(committees));
    setSaveNotification(true);
    setTimeout(() => setSaveNotification(false), 3000);
  };

  // Function: Delete Section
  const handleDeleteSection = (sectionId) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      setCommittees((prev) => prev.filter((sec) => sec.id !== sectionId));
    }
  };

  // Function: Copy Committee Section
  const handleCopySection = (sectionToCopy) => {
    const newSection = {
      id: Date.now().toString(),
      title: newSectionTitle || `Copied from ${sectionToCopy.title}`,
      members: sectionToCopy.members.map((m) => ({ ...m })),
    };
    setCommittees([newSection, ...committees]);
  };

  // Function: Add New Blank Section
  const handleCreateNewSection = () => {
    if (!newSectionTitle) return alert("Please enter a section title!");
    const newSection = {
      id: Date.now().toString(),
      title: newSectionTitle,
      members: [],
    };
    setCommittees([newSection, ...committees]);
    setNewSectionTitle("");
  };

  // Function: Upload New Image to Member (Converted to Base64 to persist)
  const handleImageUpload = (e, sectionId, memberIndex) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        setCommittees((prev) =>
          prev.map((sec) => {
            if (sec.id === sectionId) {
              const updatedMembers = [...sec.members];
              updatedMembers[memberIndex] = {
                ...updatedMembers[memberIndex],
                image: base64Image,
              };
              return { ...sec, members: updatedMembers };
            }
            return sec;
          })
        );
      };
      reader.readAsDataURL(file);
    }
  };

  // Function: Add Member to Section
  const handleAddMember = (sectionId) => {
    setCommittees((prev) =>
      prev.map((sec) => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            members: [
              ...sec.members,
              {
                name: "New Member",
                role: "Committee Member",
                image: "https://via.placeholder.com/400x400?text=Upload+Image",
              },
            ],
          };
        }
        return sec;
      })
    );
  };

  // Function: Remove Member from Section
  const handleDeleteMember = (sectionId, memberIndex) => {
    setCommittees((prev) =>
      prev.map((sec) => {
        if (sec.id === sectionId) {
          const updatedMembers = sec.members.filter((_, idx) => idx !== memberIndex);
          return { ...sec, members: updatedMembers };
        }
        return sec;
      })
    );
  };

  // Function: Update Member details
  const handleUpdateMember = (sectionId, memberIndex, field, value) => {
    setCommittees((prev) =>
      prev.map((sec) => {
        if (sec.id === sectionId) {
          const updatedMembers = [...sec.members];
          updatedMembers[memberIndex] = {
            ...updatedMembers[memberIndex],
            [field]: value,
          };
          return { ...sec, members: updatedMembers };
        }
        return sec;
      })
    );
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e, sectionId, index) => {
    setDraggedCard({ sectionId, index });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetSectionId, targetIndex) => {
    e.preventDefault();
    if (!draggedCard) return;

    const { sectionId: sourceSectionId, index: sourceIndex } = draggedCard;

    // Only allow reordering within the same section
    if (sourceSectionId === targetSectionId && sourceIndex !== targetIndex) {
      setCommittees((prev) =>
        prev.map((sec) => {
          if (sec.id === targetSectionId) {
            const updatedMembers = [...sec.members];
            const [movedMember] = updatedMembers.splice(sourceIndex, 1);
            updatedMembers.splice(targetIndex, 0, movedMember);
            return { ...sec, members: updatedMembers };
          }
          return sec;
        })
      );
    }
    setDraggedCard(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans antialiased">
      {/* --- Admin Toggle Header Bar --- */}
      {isAdmin && (
        <div className="sticky top-0 z-50 bg-slate-900 text-white px-4 sm:px-8 py-3 flex items-center justify-between shadow-lg text-sm font-medium">
          <div className="flex items-center">
            <span className="inline-block w-2.5 h-2.5 bg-emerald-400 animate-pulse mr-2"></span>
            DKIT Fashion Society - Admin Dashboard
          </div>
          <button
            onClick={handleSaveToLocalStorage}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 text-xs font-semibold transition shadow"
          >
            {saveNotification ? "✓ Saved!" : "➢ Save Changes"}
          </button>
        </div>
      )}

      {/* --- Main Admin Control Panel --- */}
      {isAdmin && (
        <div className="max-w-7xl mx-auto my-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-50/90 border border-indigo-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-indigo-950 flex items-center gap-2">
                ⚙️ Admin Dashboard Controls
              </h3>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-3 py-1">
                Active
              </span>
            </div>

            <p className="text-xs text-indigo-700">
              Create new sections, edit details, upload images, or drag card handles to reorder members.
            </p>

            <div className="flex flex-wrap gap-3 items-center pt-2">
              <input
                type="text"
                placeholder="New Year Title (e.g. Academic Year 2026 – 2027)"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                className="flex-1 min-w-[280px] px-4 py-2.5 bg-white border border-indigo-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
              <button
                onClick={handleCreateNewSection}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-sm font-semibold transition shadow-sm"
              >
                + Create Blank Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden text-white py-16 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 text-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/webdesign/members/abouthero.png')" }}
        />
        <div className="absolute inset-0 bg-[#0B132B]/85 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-white">
            About Us
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed px-2">
            A creative community where students can explore fashion, express individuality, and celebrate personal style.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 space-y-16 sm:space-y-24">
        {/* Our Story Section */}
        <section>
          <div className="bg-white p-6 sm:p-10 md:p-14 border border-gray-100 shadow-xl shadow-gray-200/50 transition duration-300">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 tracking-tight">
              Our Story
            </h2>
            <div className="space-y-4 sm:space-y-6 text-gray-600 text-base sm:text-lg leading-relaxed">
              <p>
                The DKIT Fashion Society was founded in 2025 with the vision of creating a dedicated space for students who
                share a passion for fashion, creativity and self-expression.
              </p>
              <p>
                The society was established to bring together students from all backgrounds and create opportunities to connect through styling,
                fashion discussions, creative projects, and social events.
              </p>
            </div>
          </div>
        </section>

        {/* Dynamic Committee Sections */}
        {committees.map((section) => (
          <section key={section.id} className="relative space-y-8 bg-white p-6 sm:p-10 border border-gray-100 shadow-sm">
            <div className="text-center space-y-3">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                Society Committee
              </h2>
              <p className="text-indigo-600 font-semibold text-base sm:text-lg">
                {section.title}
              </p>

              {/* Admin Copy, Add Member, and Delete Section Bar */}
              {isAdmin && (
                <div className="flex flex-wrap justify-center gap-3 pt-3 pb-2">
                  <button
                    onClick={() => handleCopySection(section)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 transition shadow-sm"
                  >
                    📋 Copy Section to New Year
                  </button>
                  <button
                    onClick={() => handleAddMember(section.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 transition shadow-sm"
                  >
                    + Add Member Card
                  </button>
                  <button
                    onClick={() => handleDeleteSection(section.id)}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2 transition shadow-sm"
                  >
                    🗑️ Delete This Panel
                  </button>
                </div>
              )}
            </div>

            {/* Committee Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 pt-4">
              {section.members.map((member, index) => (
                <div
                  key={index}
                  draggable={isAdmin}
                  onDragStart={(e) => handleDragStart(e, section.id, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, section.id, index)}
                  className={`group bg-slate-50/50 border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col relative ${
                    isAdmin ? "cursor-grab active:cursor-grabbing" : ""
                  }`}
                >
                  {/* Drag Handle Overlay (Admin) */}
                  {isAdmin && (
                    <div className="bg-slate-800 text-slate-200 text-[10px] font-semibold tracking-wider uppercase px-2 py-1 flex items-center justify-between select-none">
                      <span>⋮⋮ Drag to reorder</span>
                      <button
                        onClick={() => handleDeleteMember(section.id, index)}
                        className="bg-rose-600 hover:bg-rose-700 text-white p-0.5 transition"
                        title="Delete Member"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}

                  <div className="aspect-square w-full overflow-hidden bg-gray-100 relative">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out pointer-events-none"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/400x400?text=Member";
                      }}
                    />

                    {/* Admin Image Upload Overlay */}
                    {isAdmin && (
                      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center text-white text-xs font-medium cursor-pointer transition p-2 text-center">
                        <span>📷 Click to Change Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, section.id, index)}
                        />
                      </label>
                    )}
                  </div>

                  <div className="p-5 text-center space-y-2 flex-1 flex flex-col justify-center bg-white">
                    {isAdmin ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) =>
                            handleUpdateMember(section.id, index, "name", e.target.value)
                          }
                          className="w-full text-center border border-gray-300 px-2 py-1 text-sm font-bold focus:ring-1 focus:ring-indigo-500"
                        />
                        <input
                          type="text"
                          value={member.role}
                          onChange={(e) =>
                            handleUpdateMember(section.id, index, "role", e.target.value)
                          }
                          className="w-full text-center border border-gray-300 px-2 py-1 text-xs text-gray-600 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                          {member.name}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">
                          {member.role}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* View Constitution*/}
       <div className="mt-8 flex justify-center">
  <a
    href="/images/webdesign/pdfs/DUC_DKIT%20Fashion%20Society%20Constitution.pdf"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-block border-2 border-[#011145] text-[#011145] px-8 py-3 text-sm font-medium hover:bg-[#011145] hover:text-white transition duration-300 text-center cursor-pointer shadow-sm"
  >
    View Constitution
  </a>
</div>
      </main>
    </div>
  );
}