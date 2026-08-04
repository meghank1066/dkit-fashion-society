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
                            Profile
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
                                Login
                            </Link>
                            <Link to="/register" className={getLinkStyle("/register")}>
                                Register
                            </Link>
                        </>
                    )}
                </div>

            </nav>
        </header>
    );
}