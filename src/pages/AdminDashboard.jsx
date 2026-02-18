import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Icon from "../components/Icon";
import "./AdminDashboard.css";

const navItems = [
  { path: "/admin", icon: "dashboard", label: "Overview", end: true },
  { path: "/admin/posts", icon: "article", label: "Posts" },
  { path: "/admin/posts/new", icon: "add_circle", label: "Create Post", primary: true },
  { path: "/admin/categories", icon: "category", label: "Categories" },
  { path: "/admin/tags", icon: "tag", label: "Tags" },
  { path: "/admin/users", icon: "people", label: "Users" },
  { path: "/admin/settings", icon: "settings", label: "Settings" },
];

const pageTitles = {
  "/admin": "Dashboard",
  "/admin/posts": "Posts",
  "/admin/posts/new": "Create Post",
  "/admin/posts/": "Edit Post",
  "/admin/categories": "Categories",
  "/admin/tags": "Tags",
  "/admin/users": "Users",
  "/admin/settings": "Settings",
};

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getPageTitle = () => {
    const path = window.location.pathname;
    for (const [route, title] of Object.entries(pageTitles)) {
      if (path.startsWith(route)) return title;
    }
    return "Dashboard";
  };

  const getInitials = (name) => {
    if (!name) return "A";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar-header">
          <NavLink to="/admin" className="admin-logo" onClick={() => setSidebarOpen(false)}>
            <div className="admin-logo-icon">B</div>
            <span className="admin-logo-text">Blog CMS</span>
          </NavLink>
        </div>

        <nav className="admin-nav">
          <div className="admin-nav-section">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `admin-nav-item ${isActive ? "active" : ""} ${item.primary ? "primary" : ""}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-nav-item" onClick={handleLogout}>
            <Icon name="logout" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-header">
          <div className="admin-header-left">
            <button className="admin-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Icon name="menu" size={24} />
            </button>
            <h1 className="admin-page-title">{getPageTitle()}</h1>
          </div>

          <div className="admin-header-right">
            <div className="admin-search">
              <Icon name="search" size={20} className="admin-search-icon" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button className="admin-notification-btn">
              <Icon name="notifications" size={22} />
              <span className="admin-notification-badge"></span>
            </button>

            <div className="admin-user-menu" onClick={() => setShowUserMenu(!showUserMenu)}>
              <div className="admin-user-avatar">{getInitials(user?.name)}</div>
              <div className="admin-user-info">
                <div className="admin-user-name">{user?.name || "Admin"}</div>
                <div className="admin-user-role">Administrator</div>
              </div>
              <Icon name="expand_more" size={20} />
            </div>

            {showUserMenu && (
              <div className="admin-user-dropdown">
                <div className="admin-dropdown-item">
                  <Icon name="person" size={18} />
                  <span>Profile</span>
                </div>
                <div className="admin-dropdown-item">
                  <Icon name="settings" size={18} />
                  <span>Settings</span>
                </div>
                <div className="admin-dropdown-divider"></div>
                <div className="admin-dropdown-item" onClick={handleLogout}>
                  <Icon name="logout" size={18} />
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
