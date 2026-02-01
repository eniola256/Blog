import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import Icon from "./Icon";
import "./NavBar.css";

export default function Navbar() {
  const { isDark, setIsDark } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <h1 className="logo">AE Tech</h1>

      <div className={`nav-items ${menuOpen ? "open" : ""}`}>
        <a href="#">Home</a>
        <a href="#">Blog</a>
        <a href="#">Tags</a>
        <a href="#">Categories</a>
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
