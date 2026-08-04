import { useState } from "react";
import API from "../api/axios";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await API.post("/auth/forgot-password", { email });
      setMessage(res.data.message);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center px-4">
      <div className="bg-white shadow-lg p-10 w-full max-w-md">
        <h1 className="font-serif text-5xl text-center mb-6">
          Forgot Password
        </h1>

        <p className="text-gray-600 text-center mb-8">
          Enter your email address and we'll send you a password reset link.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email Address"
            className="w-full border p-3 mb-6 focus:outline-none focus:border-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <p className="mt-6 text-center text-gray-700">
            {message}
          </p>
        )}

        <div className="text-center mt-8">
          <Link
            to="/login"
            className="text-gray-600 hover:text-black hover:underline"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}