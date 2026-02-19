import { NavLink, Outlet } from "react-router-dom";
import Icon from "../../components/Icon";
import { useAuth } from "../../contexts/AuthContext";
import "./AuthorDashboard.css";

export default function AuthorDashboard() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <div className="author-dashboard">
      {/* Sidebar */}
      <aside className="author-sidebar">
        <div className="author-sidebar-header">
          <h2>Author Panel</h2>
          <p>Welcome, {user?.name || "Author"}</p>
        </div>

        <nav className="author-nav">
          <NavLink to="/author" end className={({ isActive }) => isActive ? "active" : ""}>
            <Icon name="dashboard" size={20} />
            Overview
          </NavLink>
          <NavLink to="/author/posts" className={({ isActive }) => isActive ? "active" : ""}>
            <Icon name="article" size={20} />
            My Posts
          </NavLink>
          <NavLink to="/author/posts/new" className={({ isActive }) => isActive ? "active" : ""}>
            <Icon name="add_circle" size={20} />
            Create Post
          </NavLink>
        </nav>

        <div className="author-sidebar-footer">
          <a href="/" className="author-nav-link">
            <Icon name="visibility" size={20} />
            View Site
          </a>
          <button onClick={handleLogout} className="author-logout-btn">
            <Icon name="logout" size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="author-main">
        <Outlet />
      </main>
    </div>
  );
}
