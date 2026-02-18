import { useState } from "react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminPosts() {
  const [posts, setPosts] = useState([
    { id: 1, title: "Getting Started with React", status: "published", category: "Development", date: "2024-01-15" },
    { id: 2, title: "CSS Grid vs Flexbox", status: "published", category: "Design", date: "2024-01-14" },
    { id: 3, title: "Node.js Best Practices", status: "draft", category: "Backend", date: "2024-01-13" },
    { id: 4, title: "TypeScript Tips", status: "published", category: "Development", date: "2024-01-12" },
    { id: 5, title: "Database Optimization", status: "draft", category: "Database", date: "2024-01-11" },
    { id: 6, title: "GraphQL Introduction", status: "published", category: "API", date: "2024-01-10" },
  ]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["Development", "Design", "Backend", "Database", "API"];

  const filteredPosts = posts.filter((post) => {
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || post.category === categoryFilter;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  return (
    <div className="admin-posts-page">
      <div className="admin-page-actions">
        <div className="admin-filters">
          <div className="admin-filter-group">
            <Icon name="search" size={20} />
            <input
              type="text"
              className="admin-form-input"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "200px" }}
            />
          </div>

          <div className="admin-filter-group">
            <select
              className="admin-form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: "140px" }}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="admin-filter-group">
            <select
              className="admin-form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ width: "140px" }}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <Link to="/admin/posts/new" className="admin-btn admin-btn-primary">
          <Icon name="add" size={20} />
          New Post
        </Link>
      </div>

      <div className="admin-card">
        <div className="admin-card-body">
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <tr key={post.id}>
                      <td>
                        <Link to={`/admin/posts/${post.id}`} className="admin-post-title">
                          {post.title}
                        </Link>
                      </td>
                      <td>
                        <span className={`admin-badge ${post.status}`}>
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </span>
                      </td>
                      <td>{post.category}</td>
                      <td>{post.date}</td>
                      <td>
                        <div className="admin-actions">
                          <Link
                            to={`/admin/posts/${post.id}`}
                            className="admin-btn admin-btn-icon admin-btn-ghost admin-btn-sm"
                          >
                            <Icon name="edit" size={18} />
                          </Link>
                          <button className="admin-btn admin-btn-icon admin-btn-ghost admin-btn-sm">
                            <Icon name="delete" size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <div className="admin-empty">
                        <Icon name="inbox" size={48} className="admin-empty-icon" />
                        <h4 className="admin-empty-title">No posts found</h4>
                        <p className="admin-empty-text">Try adjusting your filters or create a new post.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
