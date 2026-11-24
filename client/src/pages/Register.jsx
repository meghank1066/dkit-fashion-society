import { useEffect, useRef, useState } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const inputClass =
  "w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-[#011145] focus:ring-1 focus:ring-[#011145] transition";
const labelClass = "block text-sm font-medium text-[#011145] mb-1.5";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [photo, setPhoto] = useState(null); // optional profile picture (File)
  const [photoPreview, setPhotoPreview] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const photoInput = useRef(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const passwordRequirements = [
    { text: "At least 8 characters", valid: password.length >= 8 },
    { text: "One uppercase letter", valid: /[A-Z]/.test(password) },
    { text: "One lowercase letter", valid: /[a-z]/.test(password) },
    { text: "One number", valid: /\d/.test(password) },
    { text: "One special character (@ $ ! % * ? &)", valid: /[@$!%*?&]/.test(password) },
  ];
  const passwordValid = passwordRequirements.every((r) => r.valid);
  const passwordsMatch = password === confirmPassword;

  // show a preview of the chosen photo
  useEffect(() => {
    if (!photo) return setPhotoPreview("");
    const url = URL.createObjectURL(photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!passwordsMatch) return setMessage("Passwords do not match");

    setSubmitting(true);
    try {
      await API.post("/api/auth/register", { username: username.trim(), email: email.trim(), password });

      // log the new member straight in
      const res = await API.post("/api/auth/login", { email: email.trim(), password });
      const { token, user } = res.data;
      let loggedInUser = user;

      // upload their profile picture, if they chose one
      if (photo) {
        try {
          const auth = { headers: { Authorization: `Bearer ${token}` } };
          const formData = new FormData();
          formData.append("image", photo);
          const upload = await API.post("/api/upload", formData, {
            headers: { ...auth.headers, "Content-Type": "multipart/form-data" },
          });
          await API.put("/api/users/update-profile", { profilePic: upload.data.url }, auth);
          loggedInUser = { ...user, profilePic: upload.data.url };
        } catch (err) {
          console.error("Profile picture upload failed:", err);
          // account still works; they can add a photo later on their profile page
        }
      }

      login(loggedInUser, token);
      setMessage("Welcome to DkIT Fashion Society!");
      setTimeout(() => navigate("/"), 900);
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#011145] flex items-center justify-center px-4 py-12">
      <form onSubmit={handleRegister} className="bg-white p-8 sm:p-10 w-full max-w-md shadow-lg">
        <h1 className="font-serif text-5xl mb-8 text-center">Create Account</h1>

        {/* Profile picture (optional) */}
        <div className="flex flex-col items-center mb-6">
          <button
            type="button"
            onClick={() => photoInput.current?.click()}
            className="w-24 h-24 rounded-full border border-gray-300 bg-[#f7f8fb] overflow-hidden flex items-center justify-center hover:border-[#011145] transition cursor-pointer"
            title="Choose a profile picture"
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Your profile picture" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[11px] uppercase tracking-widest text-gray-400 px-3 text-center leading-snug">
                Add photo
              </span>
            )}
          </button>
          <input
            ref={photoInput}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          />
          <span className="text-xs text-gray-500 mt-2">
            Profile picture <span className="text-gray-400">(optional)</span>
            {photo && (
              <button
                type="button"
                onClick={() => setPhoto(null)}
                className="ml-2 text-[#011145] underline hover:no-underline"
              >
                Remove
              </button>
            )}
          </span>
        </div>

        <div className="mb-4">
          <label htmlFor="reg-username" className={labelClass}>Username</label>
          <input
            id="reg-username"
            type="text"
            placeholder="e.g. meghan_k"
            value={username}
            autoComplete="username"
            onChange={(e) => setUsername(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="reg-email" className={labelClass}>Email</label>
          <input
            id="reg-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="reg-password" className={labelClass}>Password</label>
          <input
            id="reg-password"
            type="password"
            placeholder="Create a password"
            value={password}
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            required
          />

          {/* only appears once they start typing */}
          {password.length > 0 && (
            <ul className="mt-3 space-y-1.5 text-xs">
              {passwordRequirements.map((req) => (
                <li
                  key={req.text}
                  className={`flex items-center gap-2 transition-colors ${req.valid ? "text-[#011145]" : "text-gray-400"}`}
                >
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] leading-none ${
                      req.valid ? "bg-[#011145] border-[#011145] text-white" : "border-gray-300"
                    }`}
                  >
                    {req.valid ? "✓" : ""}
                  </span>
                  {req.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="reg-confirm" className={labelClass}>Confirm password</label>
          <input
            id="reg-confirm"
            type="password"
            placeholder="Type it again"
            value={confirmPassword}
            autoComplete="new-password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
            required
          />
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="text-xs text-red-600 mt-1.5">Passwords don't match yet</p>
          )}
        </div>

        <button
          disabled={!passwordValid || !passwordsMatch || submitting}
          className="w-full bg-black text-white py-3 hover:bg-gray-800 transition disabled:opacity-40"
        >
          {submitting ? "Creating your account…" : "Register"}
        </button>

        <p className="text-sm text-gray-600 text-center mt-5">
          Already a member?{" "}
          <Link to="/login" className="text-[#011145] font-semibold hover:underline">
            Log in
          </Link>
        </p>

        {message && <p className="mt-4 text-center text-sm">{message}</p>}
      </form>
    </div>
  );
}
