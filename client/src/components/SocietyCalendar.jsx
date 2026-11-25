import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SEMESTER_MONTHS = { 1: [8, 9, 10, 11], 2: [0, 1, 2, 3, 4] }; // Sep–Dec, Jan–May

const toInput = (date) => (date ? new Date(date).toISOString().slice(0, 10) : "");
const isPast = (ev) => {
  const end = new Date(ev.date);
  end.setHours(23, 59, 59, 999);
  return end < new Date();
};
// the academic year this calendar shows, e.g. 2026 for 2026–27
const academicStartYear = () => {
  const now = new Date();
  return now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
};
// 2026 for anything from Aug 2026 to Jul 2027
const academicYearOf = (date) => {
  const d = new Date(date);
  return d.getMonth() >= 7 ? d.getFullYear() : d.getFullYear() - 1;
};
const yearLabel = (y) => `${y}–${String(y + 1).slice(2)}`;
const defaultSemester = () => (new Date().getMonth() >= 7 ? 1 : 2);

const btn = "text-[11px] font-semibold px-3 py-1.5 border transition cursor-pointer";
const btnOutline = `${btn} border-[#011145] text-[#011145] bg-white hover:bg-[#011145] hover:text-white`;
const btnSolid = `${btn} border-[#011145] bg-[#011145] text-white hover:bg-[#02206e]`;
const btnDanger = `${btn} border-red-200 text-red-600 bg-white hover:bg-red-600 hover:text-white hover:border-red-600`;
const field =
  "w-full border border-gray-300 px-2.5 py-2 text-sm focus:outline-none focus:border-[#011145] bg-white";

// Homepage "What's on" calendar. Everyone sees it; admins can add, edit and delete events in place.
export default function SocietyCalendar() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [events, setEvents] = useState([]);
  const [semester, setSemester] = useState(defaultSemester);
  const [selected, setSelected] = useState(null); // highlighted event id
  const [editMode, setEditMode] = useState(false);
  const [editing, setEditing] = useState(null); // event id, or "new"
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  // the year the homepage shows (set by admins with "Start new academic year"), and the year being viewed
  const [currentYear, setCurrentYear] = useState(academicStartYear);
  const [viewYear, setViewYear] = useState(academicStartYear);

  useEffect(() => {
    Promise.all([
      API.get("/api/calendar"),
      API.get("/api/settings/calendar-year").catch(() => ({ data: {} })),
    ])
      .then(([res, yearRes]) => {
        const year = Number(yearRes.data?.value) || academicStartYear();
        setCurrentYear(year);
        setViewYear(year);
        setEvents(res.data);
        // open on the semester with the next upcoming event (e.g. semester 2 once semester 1 is done)
        const next = res.data
          .filter((e) => !isPast(e) && academicYearOf(e.date) === year)
          .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
        if (next) setSemester(next.semester);
        else if (year !== academicStartYear()) setSemester(1); // a brand-new year starts on semester 1
      })
      .catch(() => setEvents([]));
  }, []);

  // Admin: make a year the one the homepage shows. Nothing is deleted - older years stay in the archive.
  const setHomepageYear = async (y) => {
    try {
      await API.put("/api/settings/calendar-year", { value: y });
      setCurrentYear(y);
      setViewYear(y);
      setSemester(1);
      setEditing(null);
    } catch (err) {
      alert("Couldn't change the academic year: " + (err.response?.data?.message || err.message));
    }
  };

  const startNewYear = () => {
    const next = currentYear + 1;
    if (
      window.confirm(
        `Start the ${yearLabel(next)} academic year?\n\nThe homepage calendar will start fresh for ${yearLabel(next)}. ` +
          `Nothing is deleted: all ${yearLabel(currentYear)} events stay saved, and you can switch back any time.`
      )
    ) {
      setHomepageYear(next);
    }
  };

  const year = viewYear;
  const semEvents = useMemo(
    () =>
      events
        .filter((e) => e.semester === semester && academicYearOf(e.date) === viewYear)
        .sort((a, b) => new Date(a.date) - new Date(b.date)),
    [events, semester, viewYear]
  );

  const startEdit = (ev) => {
    setError("");
    setEditing(ev ? ev._id : "new");
    setForm(
      ev
        ? { ...ev, date: toInput(ev.date) }
        : {
            semester,
            // start the date picker in the right year
            date: `${semester === 1 ? viewYear : viewYear + 1}-${semester === 1 ? "09" : "01"}-01`,
            title: "",
            time: "",
            location: "",
            description: "",
          }
    );
  };

  const cancelEdit = () => {
    setEditing(null);
    setError("");
  };

  const save = async () => {
    if (!form.title?.trim() || !form.date) return setError("Add an event name and date first.");
    setSaving(true);
    try {
      const body = { ...form, semester };
      const saved =
        editing === "new"
          ? (await API.post("/api/calendar", body)).data
          : (await API.put(`/api/calendar/${editing}`, body)).data;
      setEvents((prev) => [...prev.filter((e) => e._id !== saved._id), saved]);
      setSelected(saved._id);
      setEditing(null);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save the event. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (ev) => {
    if (!window.confirm(`Delete "${ev.title}" from the calendar?`)) return;
    try {
      await API.delete(`/api/calendar/${ev._id}`);
      setEvents((prev) => prev.filter((e) => e._id !== ev._id));
    } catch (err) {
      alert("Couldn't delete it: " + (err.response?.data?.message || err.message));
    }
  };

  const editForm = (
    <div className="bg-[#f7f8fb] border border-[#011145]/20 p-4 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          className={field}
          value={form.date || ""}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <input
          className={field}
          placeholder="Time (e.g. 6:00pm)"
          value={form.time || ""}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
        />
      </div>
      <input
        className={field}
        placeholder="Event name"
        value={form.title || ""}
        onChange={(e) => {
          setForm({ ...form, title: e.target.value });
          setError("");
        }}
      />
      <input
        className={field}
        placeholder="Location"
        value={form.location || ""}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
      />
      <textarea
        className={field}
        rows={2}
        maxLength={300}
        placeholder="Short description"
        value={form.description || ""}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={save} disabled={saving} className={`${btnSolid} disabled:opacity-50`}>
          {saving ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={cancelEdit} className={btnOutline}>
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
      {/* Heading + semester switch */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-12 gap-5">
        <div>
          <span className="text-[11px] uppercase tracking-[0.3em] text-gray-400 font-medium">What's on</span>
          <h2 className="text-4xl md:text-5xl font-serif text-[#011145] mt-2">The Society Calendar</h2>
          <p className="text-gray-500 mt-3 text-base md:text-lg">
            Everything we've got planned for the {yearLabel(year)} academic year.
          </p>
        </div>
        <div className="flex gap-1.5">
          {[1, 2].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSemester(s);
                setEditing(null);
                setSelected(null);
              }}
              className={`px-5 py-2.5 text-[11px] uppercase tracking-[0.18em] border border-[#011145] transition cursor-pointer ${
                semester === s ? "bg-[#011145] text-white" : "bg-white text-[#011145] hover:bg-[#011145]/5"
              }`}
            >
              Semester {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-10">
        {/* Semester at a glance: one tile per month */}
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2">
            {SEMESTER_MONTHS[semester].map((m) => {
              const monthEvents = semEvents.filter((e) => new Date(e.date).getMonth() === m);
              const tileYear = semester === 1 ? year : year + 1;
              return (
                <div key={m} className="border border-[#011145]/25 bg-white p-3 min-h-[96px]">
                  <div className="flex items-baseline justify-between">
                    <span className="font-serif text-2xl text-[#011145]">{MONTHS[m]}</span>
                    <span className="text-[10px] text-gray-400">{tileYear}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {monthEvents.length === 0 ? (
                      <span className="text-[11px] text-gray-300">No events</span>
                    ) : (
                      monthEvents.map((e) => (
                        <button
                          key={e._id}
                          type="button"
                          title={e.title}
                          onClick={() => setSelected(e._id)}
                          className={`w-8 h-8 rounded-full text-xs flex items-center justify-center transition cursor-pointer ${
                            isPast(e) ? "bg-[#d7dbe6] text-[#011145]" : "bg-[#011145] text-white hover:bg-[#02206e]"
                          } ${selected === e._id ? "ring-2 ring-offset-2 ring-[#011145]" : ""}`}
                        >
                          {new Date(e.date).getDate()}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 mt-3 text-[11px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#011145] inline-block" /> Upcoming
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d7dbe6] inline-block" /> Past
            </span>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setEditMode(!editMode);
                setEditing(null);
                setViewYear(currentYear);
              }}
              className={`mt-5 ${editMode ? btnSolid : btnOutline}`}
            >
              {editMode ? "Done editing" : "Edit calendar"}
            </button>
          )}

          {isAdmin && editMode && (
            <div className="mt-5 border border-[#011145]/20 bg-[#f7f8fb] p-4">
              <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400">Academic year</span>
              <div className="flex items-center justify-between mt-2">
                <button
                  type="button"
                  aria-label="Previous academic year"
                  onClick={() => {
                    setViewYear(viewYear - 1);
                    setEditing(null);
                  }}
                  className={btnOutline}
                >
                  ‹
                </button>
                <span className="font-serif text-xl text-[#011145]">
                  {yearLabel(viewYear)}
                  {viewYear === currentYear && <span className="block text-[10px] font-sans text-gray-500 text-center">On homepage</span>}
                </span>
                <button
                  type="button"
                  aria-label="Next academic year"
                  onClick={() => {
                    setViewYear(viewYear + 1);
                    setEditing(null);
                  }}
                  className={btnOutline}
                >
                  ›
                </button>
              </div>
              {viewYear === currentYear ? (
                <button type="button" onClick={startNewYear} className={`${btnOutline} w-full mt-3`}>
                  Start new academic year ({yearLabel(currentYear + 1)})
                </button>
              ) : (
                <button type="button" onClick={() => setHomepageYear(viewYear)} className={`${btnSolid} w-full mt-3`}>
                  Show {yearLabel(viewYear)} on the homepage
                </button>
              )}
              <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                Nothing is ever deleted. Older years stay saved here, and you can switch back any time.
              </p>
            </div>
          )}
        </div>

        {/* Event list */}
        <div>
          {semEvents.length === 0 && editing !== "new" && (
            <p className="text-gray-500">Nothing planned yet for semester {semester}. Check back soon.</p>
          )}

          {semEvents.map((e, i) =>
            editing === e._id ? (
              <div key={e._id} className="py-4">{editForm}</div>
            ) : (
              <div
                key={e._id}
                className={`flex gap-5 py-5 ${i > 0 ? "border-t border-gray-200" : ""} ${
                  selected === e._id ? "bg-[#f7f8fb] -mx-3 px-3" : ""
                } ${isPast(e) ? "opacity-55" : ""}`}
              >
                <div className="w-16 shrink-0 border border-[#011145] text-center py-2 h-fit">
                  <div className="font-serif text-3xl leading-none text-[#011145]">{new Date(e.date).getDate()}</div>
                  <div className="text-[10px] tracking-[0.2em] uppercase text-gray-500 mt-1">
                    {MONTHS[new Date(e.date).getMonth()]}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-serif text-2xl text-[#011145] leading-snug">{e.title}</h3>
                    {isPast(e) && (
                      <span className="text-[10px] tracking-[0.15em] uppercase bg-[#eef2f6] text-[#011145] px-2 py-0.5">
                        Past
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {e.time || "TBC"} · {e.location || "TBC"}
                  </p>
                  {e.description && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{e.description}</p>}
                  {isAdmin && editMode && (
                    <div className="flex gap-2 mt-3">
                      <button type="button" onClick={() => startEdit(e)} className={btnOutline}>
                        Edit
                      </button>
                      <button type="button" onClick={() => remove(e)} className={btnDanger}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          )}

          {isAdmin && editMode && (
            <div className="mt-4">
              {editing === "new" ? (
                editForm
              ) : (
                <button type="button" onClick={() => startEdit(null)} className={`${btnSolid} px-5 py-2.5`}>
                  Add event to semester {semester}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
