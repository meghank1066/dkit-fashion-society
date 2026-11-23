import { useEffect, useRef, useState } from "react";
import API from "../api/axios";

// The hero photo for a page, saved on the server so every visitor sees it.
// pageKey: "home" | "posts" | "about"
export function useHeroPhoto(pageKey, defaultUrl) {
  const [url, setUrl] = useState(defaultUrl);

  useEffect(() => {
    API.get(`/api/settings/hero-${pageKey}`)
      .then((res) => {
        if (res.data?.value) setUrl(res.data.value);
      })
      .catch(() => {}); // keep the default photo if the server can't be reached
  }, [pageKey]);

  return [url, setUrl];
}

// Admin button: pick a photo, upload it to Cloudinary, save it as this page's hero.
export function ChangeHeroPhotoButton({ pageKey, onChange, className = "" }) {
  const input = useRef(null);
  const [status, setStatus] = useState(null); // null | "uploading" | "saved"

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again later
    if (!file) return;
    setStatus("uploading");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const upload = await API.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await API.put(`/api/settings/hero-${pageKey}`, { value: upload.data.url });
      onChange(upload.data.url);
      setStatus("saved");
      setTimeout(() => setStatus(null), 2500);
    } catch (err) {
      setStatus(null);
      alert("Couldn't change the cover photo: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={status === "uploading"}
        className={`bg-white/15 hover:bg-white hover:text-[#011145] backdrop-blur-md border border-white/50 text-white px-4 py-2 text-xs font-semibold tracking-wide transition disabled:opacity-60 cursor-pointer ${className}`}
      >
        {status === "uploading" ? "Uploading…" : status === "saved" ? "Cover photo saved" : "Change cover photo"}
      </button>
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </>
  );
}
