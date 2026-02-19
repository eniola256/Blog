import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/Icon";
import { fetchAdminPosts, deletePost } from "../../api/post";
import { useAuth } from "../../contexts/AuthContext";
import "./AuthorDashboard.css";

export default function AuthorPosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await fetchAdminPosts();
      const allPosts = Array.isArray(response) 
        ? response 
        : (response.posts || response.data || []);
      
      // Filter to only show current author's posts
      const authorPosts = allPosts.filter(post => 
        post.author?._id === user?._id || post.author === user?._id
      );
      
      setPosts(authorPosts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    try {
      await deletePost(postId);
      setPosts(posts.filter(p => p._id !== postId));
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="author-loading">
        <Icon name="hourglass_empty" size={32} />
        <p>Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="author-posts">
      {error && (
        <div className="author-alert author-alert-error">
          <Icon name="error" size={18} />
          {error}
        </div>
      )}

      <div className="author-page-header">
        <h2>My Posts</h2>
        <Link to="/author/posts/new" className="author-btn author-btn-primary">
          <Icon name="add" size={20} />
          Create New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="author-filters">
        <div className="author-search">
          <Icon name="search" size={20} className="author-search-icon" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="author-search-input"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="author-select"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Posts Table */}
      <div className="author-card">
        <div className="author-card-body">
          {filteredPosts.length > 0 ? (
            <div className="author-table-container">
              <table className="author-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Category</th>
                    <th>Tags</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => (
                    <tr key={post._id}>
                      <td>
                        <Link to={`/author/posts/${post._id}`} className="author-post-title">
                          {post.title}
                        </Link>
                      </td>
                      <td>
                        <span className={`author-badge ${post.status || "draft"}`}>
                          {(post.status || "draft").charAt(0).toUpperCase() + (post.status || "draft").slice(1)}
                        </span>
                      </td>
                      <td>{post.category?.name || post.category || "—"}</td>
                      <td>
                        {post.tags && post.tags.length > 0 
                          ? post.tags.map(t => t.name || t).join(", ") 
                          : "—"}
                      </td>
                      <td>{formatDate(post.createdAt)}</td>
                      <td>
                        <div className="author-actions">
                          <Link 
                            to={`/author/posts/${post._id}`}
                            className="author-btn author-btn-icon author-btn-ghost author-btn-sm"
                            title="Edit"
                          >
                            <Icon name="edit" size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(post._id)}
                            className="author-btn author-btn-icon author-btn-danger author-btn-sm"
                            title="Delete"
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
            <div className="author-empty">
              <Icon name="article" size={48} className="author-empty-icon" />
              <h4 className="author-empty-title">No posts found</h4>
              <p className="author-empty-text">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your filters." 
                  : "Create your first post to get started."}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Link to="/author/posts/new" className="author-btn author-btn-primary" style={{ marginTop: "16px" }}>
                  <Icon name="add" size={20} />
                  Create Post
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
