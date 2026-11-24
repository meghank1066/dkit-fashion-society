import { useEffect, useState } from "react";

const KEY = "cookie_consent"; // "accepted" | "declined"

export function hasCookieConsent() {
  try {
    return localStorage.getItem(KEY) === "accepted";
  } catch {
    return false;
  }
}

// Bottom banner asking visitors to accept or decline cookies.
// Article views are only counted for people who accept.
export default function CookieBanner() {
  const [choice, setChoice] = useState(() => {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return "declined";
    }
  });

  useEffect(() => {
    // let other parts of the site react straight away (e.g. count the article being read)
    if (choice) window.dispatchEvent(new CustomEvent("cookie-consent", { detail: choice }));
  }, [choice]);

  const decide = (value) => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* ignore */
    }
    setChoice(value);
  };

  if (choice) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:bottom-6 z-[90] sm:max-w-md font-sans">
      <div className="border border-[#011145]/20 bg-[#f7f8fb] p-6 shadow-2xl">
        <span className="text-[11px] uppercase tracking-[0.3em] text-gray-400 font-semibold">Cookies</span>
        <h3 className="font-serif text-2xl text-[#011145] mt-2 leading-snug">A little cookie, if that's okay?</h3>
        <p className="text-sm text-gray-600 leading-relaxed mt-3">
          We only use cookies to count article views, so we know what you love reading. No ads, and no tracking
          across other sites.
        </p>
        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            type="button"
            onClick={() => decide("declined")}
            className="px-4 py-3 text-[15px] border border-[#011145]/40 bg-white text-[#011145] hover:bg-[#011145] hover:text-white transition-colors cursor-pointer"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => decide("accepted")}
            className="px-4 py-3 text-[15px] border border-[#011145] bg-[#011145] text-white hover:bg-[#02206e] transition-colors cursor-pointer"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
