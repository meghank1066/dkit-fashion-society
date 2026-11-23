import { useCallback, useEffect, useRef, useState } from "react";
import API from "../api/axios";

// Pop-up image cropper.
// Drag inside the box to move it, drag the corners to resize, then "Save crop".
// The cropped image is uploaded to Cloudinary and onDone(newUrl) is called.
// The original image is never changed or deleted.

const MIN = 30; // smallest crop box, in on-screen pixels

const ASPECTS = [
  { label: "Free", value: null },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
  { label: "3:4", value: 3 / 4 },
];

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

// Largest box of the given aspect that fits, at 80% of the image, centred
function defaultCrop(W, H, aspect) {
  let w = W * 0.8;
  let h = H * 0.8;
  if (aspect) {
    if (w / h > aspect) w = h * aspect;
    else h = w / aspect;
  }
  return { x: (W - w) / 2, y: (H - h) / 2, w, h };
}

function resizeCrop(start, mode, dx, dy, W, H, aspect) {
  let left = start.x;
  let top = start.y;
  let right = start.x + start.w;
  let bottom = start.y + start.h;

  if (mode.includes("w")) left = clamp(left + dx, 0, right - MIN);
  if (mode.includes("e")) right = clamp(right + dx, left + MIN, W);
  if (mode.includes("n")) top = clamp(top + dy, 0, bottom - MIN);
  if (mode.includes("s")) bottom = clamp(bottom + dy, top + MIN, H);

  if (aspect) {
    let w = right - left;
    let h = w / aspect;
    if (mode.includes("n")) {
      top = bottom - h;
      if (top < 0) {
        top = 0;
        h = bottom;
        w = h * aspect;
      }
    } else {
      bottom = top + h;
      if (bottom > H) {
        bottom = H;
        h = H - top;
        w = h * aspect;
      }
    }
    if (mode.includes("w")) left = right - w;
    else right = left + w;
  }

  return { x: left, y: top, w: right - left, h: bottom - top };
}

export default function ImageCropper({ src, onCancel, onDone }) {
  const imgRef = useRef(null);
  const dragRef = useRef(null);

  const [objectUrl, setObjectUrl] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [size, setSize] = useState(null); // on-screen image size { W, H }
  const [crop, setCrop] = useState(null);
  const [aspect, setAspect] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load the image as a local copy so the browser lets us crop it
  useEffect(() => {
    let url;
    let cancelled = false;
    const absolute = new URL(src, window.location.origin).href;

    fetch(absolute, { mode: "cors", cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`Image couldn't be loaded (${res.status})`);
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setObjectUrl(url);
      })
      .catch(() =>
        setLoadError("This image can't be cropped from where it's stored. Re-upload it, then try again.")
      );

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [src]);

  const sizeRef = useRef(null);

  // Keep the crop box in the same place on the photo if the window is resized
  const measure = useCallback(() => {
    const img = imgRef.current;
    const prev = sizeRef.current;
    if (!img || !prev) return;
    const W = img.clientWidth;
    const H = img.clientHeight;
    if (prev.W === W && prev.H === H) return;
    setCrop((c) =>
      c && { x: (c.x * W) / prev.W, y: (c.y * H) / prev.H, w: (c.w * W) / prev.W, h: (c.h * H) / prev.H }
    );
    sizeRef.current = { W, H };
    setSize({ W, H });
  }, []);

  const onImageLoad = () => {
    const img = imgRef.current;
    const W = img.clientWidth;
    const H = img.clientHeight;
    sizeRef.current = { W, H };
    setSize({ W, H });
    setCrop(defaultCrop(W, H, aspect));
  };

  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  // Esc closes
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !saving && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, saving]);

  const startDrag = (mode) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { mode, startX: e.clientX, startY: e.clientY, start: crop };

    const onMove = (ev) => {
      const d = dragRef.current;
      if (!d || !size) return;
      const dx = ev.clientX - d.startX;
      const dy = ev.clientY - d.startY;
      if (d.mode === "move") {
        setCrop({
          ...d.start,
          x: clamp(d.start.x + dx, 0, size.W - d.start.w),
          y: clamp(d.start.y + dy, 0, size.H - d.start.h),
        });
      } else {
        setCrop(resizeCrop(d.start, d.mode, dx, dy, size.W, size.H, aspect));
      }
    };

    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const chooseAspect = (value) => {
    setAspect(value);
    if (size) setCrop(defaultCrop(size.W, size.H, value));
  };

  const saveCrop = async () => {
    const img = imgRef.current;
    if (!img || !crop || !size) return;
    setSaving(true);

    try {
      // Convert the on-screen box to real image pixels
      const scaleX = img.naturalWidth / size.W;
      const scaleY = img.naturalHeight / size.H;
      const sx = Math.round(crop.x * scaleX);
      const sy = Math.round(crop.y * scaleY);
      const sw = Math.max(1, Math.round(crop.w * scaleX));
      const sh = Math.max(1, Math.round(crop.h * scaleY));

      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      canvas.getContext("2d").drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

      const isPng = /\.png(\?|$)/i.test(src);
      const type = isPng ? "image/png" : "image/jpeg";
      const blob = await new Promise((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't create image"))), type, 0.92)
      );

      const formData = new FormData();
      formData.append("image", blob, isPng ? "cropped.png" : "cropped.jpg");
      const res = await API.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onDone(res.data.url);
    } catch (err) {
      console.error("Crop failed:", err);
      alert("Couldn't save the crop: " + (err.response?.data?.message || err.message));
      setSaving(false);
    }
  };

  const handle = (pos, cursor, style) => (
    <div
      onPointerDown={startDrag(pos)}
      className="absolute w-4 h-4 bg-white border-2 border-[#011145]"
      style={{ cursor, ...style }}
    />
  );

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/75 flex items-center justify-center p-4"
      style={{ touchAction: "none" }}
      onMouseDown={(e) => e.target === e.currentTarget && !saving && onCancel()}
    >
      <div className="bg-white w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-gray-200">
          <h3 className="font-serif text-2xl text-[#011145]">Crop image</h3>
          <div className="flex flex-wrap gap-1.5">
            {ASPECTS.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => chooseAspect(a.value)}
                className={`px-3 h-8 text-xs font-semibold border transition-colors ${
                  aspect === a.value
                    ? "bg-[#011145] text-white border-[#011145]"
                    : "bg-white text-[#011145] border-gray-300 hover:bg-[#011145] hover:text-white hover:border-[#011145]"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Image + crop box */}
        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4 select-none">
          {loadError ? (
            <p className="text-sm text-red-600 text-center max-w-md">{loadError}</p>
          ) : !objectUrl ? (
            <p className="text-sm text-gray-500">Loading image…</p>
          ) : (
            <div className="relative inline-block overflow-hidden">
              <img
                ref={imgRef}
                src={objectUrl}
                alt="To crop"
                onLoad={onImageLoad}
                draggable={false}
                className="block max-w-full max-h-[65vh] w-auto h-auto"
              />
              {crop && (
                <div
                  onPointerDown={startDrag("move")}
                  className="absolute border-2 border-white cursor-move"
                  style={{
                    left: crop.x,
                    top: crop.y,
                    width: crop.w,
                    height: crop.h,
                    boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
                  }}
                >
                  {/* rule-of-thirds guides */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/40" />
                    <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/40" />
                    <div className="absolute top-1/3 left-0 right-0 h-px bg-white/40" />
                    <div className="absolute top-2/3 left-0 right-0 h-px bg-white/40" />
                  </div>
                  {handle("nw", "nwse-resize", { left: -8, top: -8 })}
                  {handle("ne", "nesw-resize", { right: -8, top: -8 })}
                  {handle("sw", "nesw-resize", { left: -8, bottom: -8 })}
                  {handle("se", "nwse-resize", { right: -8, bottom: -8 })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 hidden sm:block">
            Drag the box to move it · drag the corners to resize · Esc to cancel
          </p>
          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="px-5 h-10 text-sm font-semibold border border-gray-300 text-[#011145] hover:bg-gray-100 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveCrop}
              disabled={saving || !crop || !!loadError}
              className="px-6 h-10 text-sm font-semibold bg-[#011145] text-white hover:bg-[#02206e] transition disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save crop"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
