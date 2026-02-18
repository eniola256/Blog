import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/Icon";
import { fetchAdminPosts, deletePost } from "../../api/post";
import { fetchAdminCategories } from "../../api/category";
import "../../pages/AdminDashboard.css";

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Load posts
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [postsData, catsData] = await Promise.all([
          fetchAdminPosts(),
          fetchAdminCategories()
        ]);
        setPosts(postsData);
        setCategories(catsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Handle delete
  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      setDeleting(postId);
      await deletePost(postId);
      setPosts(posts.filter(p => (p._id || p) !== postId));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  // Filter posts locally (for now)
  const filteredPosts = (posts?.posts || []).filter((post) => {
    const postStatus = post.status || "draft";
    const postCategory = post.category?._id || post.category || "";
    const matchesStatus = statusFilter === "all" || postStatus === statusFilter;
    const matchesCategory = categoryFilter === "all" || postCategory === categoryFilter;
    const matchesSearch = (post.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Get category name
  const getCategoryName = (cat) => {
    if (!cat) return "—";
    if (typeof cat === "string") {
      const found = categories.find(c => (c._id || c) === cat);
      return found?.name || cat;
    }
    return cat.name || "—";
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <Icon name="hourglass_empty" size={32} />
        <p>Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="admin-posts-page">
      {error && (
        <div className="admin-alert admin-alert-error">
          <Icon name="error" size={18} />
          {error}
        </div>
      )}
      <div className="admin-two-col">
        {/* Main Content - Posts List */}
        <div className="admin-editor-main">
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">All Posts</h3>
              <Link to="/admin/posts/new" className="admin-btn admin-btn-primary">
                <Icon name="add" size={18} />
                New Post
              </Link>
            </div>
            <div className="admin-card-body">
              {filteredPosts.length > 0 ? (
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
                      {filteredPosts.map((post) => (
                        <tr key={post._id || post}>
                          <td>
                            <Link to={`/admin/posts/${post._id || post}`} className="admin-post-title">
                              {post.title}
                            </Link>
                          </td>
                          <td>
                            <span className={`admin-badge ${post.status || "draft"}`}>
                              {(post.status || "draft").charAt(0).toUpperCase() + (post.status || "draft").slice(1)}
                            </span>
                          </td>
                          <td>{getCategoryName(post.category)}</td>
                          <td>{formatDate(post.createdAt || post.date)}</td>
                          <td>
                            <div className="admin-actions">
                              <Link
                                to={`/admin/posts/${post._id || post}`}
                                className="admin-btn admin-btn-icon admin-btn-ghost admin-btn-sm"
                              >
                                <Icon name="edit" size={18} />
                              </Link>
                              <button 
                                className="admin-btn admin-btn-icon admin-btn-ghost admin-btn-sm"
                                onClick={() => handleDelete(post._id || post)}
                                disabled={deleting === (post._id || post)}
                              >
                                <Icon name="delete" size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="admin-empty">
                  <Icon name="inbox" size={48} className="admin-empty-icon" />
                  <h4 className="admin-empty-title">No posts found</h4>
                  <p className="admin-empty-text">Try adjusting your filters or create a new post.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Filters */}
        <div className="admin-editor-sidebar">
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Filters</h3>
            </div>
            <div className="admin-card-body">
              <div className="admin-form-group">
                <label className="admin-form-label">Search</label>
                <div className="admin-search" style={{ width: "100%" }}>
                  <Icon name="search" size={20} className="admin-search-icon" />
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: "44px" }}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Status</label>
                <select
                  className="admin-form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Category</label>
                <select
                  className="admin-form-select"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id || cat} value={cat._id || cat}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
