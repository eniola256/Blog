import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import Icon from "./Icon";
import { Link } from "react-router-dom";
import "./NavBar.css";
import { useAuth } from "../contexts/AuthContext";


export default function Navbar() {
  const { isDark, setIsDark } = useTheme();
   const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <h1 className="logo">AE Tech</h1>

      <div className={`nav-items ${menuOpen ? "open" : ""}`}>
        <Link to="/">Home</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/posts">Posts</Link>
        <Link to="/categories">Categories</Link>

        {isAuthenticated && user.role === "admin" && (
          <Link to="/admin">Dashboard</Link>
        )}

        {isAuthenticated && user.role === "author" && (
          <Link to="/author">My Posts</Link>
        )}
      </div>



      <div className="nav-actions">
        {/* Theme toggle */}
        <button
          className="theme-toggle"
          onClick={() => setIsDark(prev => !prev)}
          aria-label="Toggle dark mode"
        >
          {isDark ? (
            <Icon name="light_mode" size={26} />
          ) : (
            <Icon name="dark_mode" size={24} />
          )}
        </button>

        {!isAuthenticated ? (
            <Link to="/login" className="auth-link">
              Login
            </Link>
          ) : (
            <button className="auth-link" onClick={logout}>
              Logout
            </button>
          )}


        {/* Hamburger */}
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          <Icon name={menuOpen ? "close" : "menu"} size={28} />
        </button>
      </div>
    </nav>
  );
}
