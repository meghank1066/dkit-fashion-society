import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const getLinkStyle = (path) => {
        const isActive = location.pathname === path;

        return `text-sm md:text-base uppercase tracking-widest transition-all duration-200 hover:opacity-70 ${
            isActive ? "underline underline-offset-8 decoration-1" : ""
        }`;
    };

    return (
    <header className="md:static sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm md:shadow-none">    <nav className="max-w-7xl mx-auto px-5 md:px-8 py-6 md:py-6">

            <div className="relative flex items-center justify-between">

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-[#011145]"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="w-7 h-7"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            {menuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>


                    {/* Desktop Left Links */}
                    <div className="hidden md:flex items-center gap-8 text-[#011145] font-medium">
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


                    {/* Logo */}
                    <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:flex-1 flex justify-center">
    <Link to="/">
        <img
            src="/images/webdesign/logo/logonavy-rm.png"
            alt="DKIT Fashion Society Logo"
           className="h-24 md:h-32 w-auto object-contain"
        />
    </Link>
</div>


                    {/* Desktop Right Actions */}
                    <div className="hidden md:flex items-center gap-6 text-[#011145] font-medium">

                        {user && (
                            <Link
                                to="/change-password"
                                className={getLinkStyle("/change-password")}
                            >
                                SETTINGS
                            </Link>
                        )}


                        {user?.role === "admin" && (
                            <Link
                                to="/admin"
                                className={getLinkStyle("/admin")}
                            >
                                Dashboard
                            </Link>
                        )}


                        {user ? (
                            <button
                                onClick={logout}
                                className="text-base uppercase tracking-widest hover:opacity-70 transition-all"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className={getLinkStyle("/login")}
                            >
                                PORTAL
                            </Link>
                        )}


                        {/* Social Icons */}
                        <div className="flex items-center gap-4 border-l border-gray-200 pl-4">

                            <a
                                href="https://www.instagram.com/dkitfashionsociety"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#011145] hover:opacity-70"
                            >
                               <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
</svg>
                            </a>


                            <a
                                href="https://www.dkit.ie/sports-and-societies"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#011145] hover:opacity-70"
                            >
                                <svg
                                    className="w-5 h-5 fill-none stroke-current stroke-2"
                                    viewBox="0 0 24 24"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                </svg>
                            </a>

                        </div>

                    </div>

                </div>


                {/* Mobile Dropdown */}
                {menuOpen && (
                    <div className="md:hidden mt-5 pb-4 flex flex-col gap-5 text-[#011145] font-medium">

                        <Link
                            onClick={() => setMenuOpen(false)}
                            to="/"
                            className={getLinkStyle("/")}
                        >
                            Home
                        </Link>

                        <Link
                            onClick={() => setMenuOpen(false)}
                            to="/about"
                            className={getLinkStyle("/about")}
                        >
                            About
                        </Link>

                        <Link
                            onClick={() => setMenuOpen(false)}
                            to="/posts"
                            className={getLinkStyle("/posts")}
                        >
                            Blog
                        </Link>


                        {user && (
                            <Link
                                onClick={() => setMenuOpen(false)}
                                to="/change-password"
                                className={getLinkStyle("/change-password")}
                            >
                                Settings
                            </Link>
                        )}


                        {user?.role === "admin" && (
                            <Link
                                onClick={() => setMenuOpen(false)}
                                to="/admin"
                                className={getLinkStyle("/admin")}
                            >
                                Dashboard
                            </Link>
                        )}


                        {user ? (
                            <button
                                onClick={logout}
                                className="text-left uppercase tracking-widest"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className={getLinkStyle("/login")}
                            >
                                Portal
                            </Link>
                        )}

                    </div>
                )}

            </nav>
        </header>
    );
}