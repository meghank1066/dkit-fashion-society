import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();

    // Helper function to handle active link underlining like the reference design
    const getLinkStyle = (path) => {
        const isActive = location.pathname === path;
        return `text-base uppercase tracking-widest transition-all duration-200 hover:opacity-70 ${
            isActive ? "underline underline-offset-8 decoration-1" : ""
        }`;
    };

    return (
        <header className="w-full border-b border-gray-200 bg-white">
            <nav className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
                
                {/* Left Side Navigation */}
              {/* Left Side Navigation */}
<div className="flex items-center gap-8 text-[#011145] font-medium">
  <Link to="/" className={getLinkStyle("/")}>
    Home
  </Link>
  <Link to="/about" className={getLinkStyle("/about")}>
    About
  </Link>
  <Link to="/posts" className={getLinkStyle("/posts")}>
    Blog
  </Link>

</div>

                

                {/* Center Logo */}
                <div className="flex-1 flex justify-center">
                    <Link to="/">
                        <img 
                            src="/images/webdesign/logo/logonavy-rm.png" 
                            alt="DKIT Fashion Society Logo" 
                            className="h-32 w-auto object-contain transition-all"
                        />
                    </Link>
                </div>

                {/* Right Side Auth & Actions */}
                <div className="flex items-center gap-6 text-[#011145] font-medium">
                    {user && (
                        <Link to="/change-password" className={getLinkStyle("/change-password")}>
                            SETTINGS
                        </Link>
                    )}

                    {user?.role === "admin" && (
                        <Link to="/admin" className={getLinkStyle("/admin")}>
                            Dashboard
                        </Link>
                    )}

                    {user ? (
                        <button 
                            onClick={logout}
                            className="text-base uppercase tracking-widest hover:opacity-70 transition-all cursor-pointer"
                        >
                            Logout
                        </button>
                    ) : (
                        <>
                            <Link to="/login" className={getLinkStyle("/login")}>
                                PORTAL
                            </Link>
                            {/* <Link to="/register" className={getLinkStyle("/register")}>
                                Register
                            </Link> */}
                        </>
                    )}

                     {/* Social Icons */}
  <div className="flex items-center gap-4 border-l border-gray-200 pl-4">
    {/* Instagram */}
    <a
      href="https://www.instagram.com/dkitfashionsociety"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Instagram"
      className="text-[#011145] hover:opacity-70 transition-opacity"
    >
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    </a>

    {/* Website / Globe */}
    <a
      href="https://www.dkit.ie/sports-and-societies"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="DKIT Sports & Societies"
      className="text-[#011145] hover:opacity-70 transition-opacity"
    >
      <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    </a>
  </div>
                </div>

            </nav>
        </header>
    );
}