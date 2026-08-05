import { useState } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/api/auth/login", {
        email,
        password,
      });

      login(res.data.user, res.data.token);

      setMessage("Login successful");

      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-10 w-full max-w-md shadow-lg"
      >
        <h1 className="font-serif text-5xl mb-8 text-center">Login</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-3 mb-4 focus:outline-none focus:border-black"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-3 mb-2 focus:outline-none focus:border-black"
          required
        />

        <div className="text-right mb-6">
          <Link
            to="/forgot-password"
            className="text-sm text-gray-600 hover:text-black hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-3 hover:bg-gray-800 transition"
        >
          Login
        </button>

        <button
          type="button"
          onClick={() => navigate("/register")}
          className="w-full mt-3 border border-black py-3 hover:bg-black hover:text-white transition"
        >
          Register
        </button>

        {message && (
          <p className="mt-5 text-center text-gray-700">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}