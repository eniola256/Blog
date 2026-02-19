import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/Icon";
import { fetchAdminPosts } from "../../api/post";
import { useAuth } from "../../contexts/AuthContext";
import "./AuthorDashboard.css";

export default function AuthorOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAuthorData();
  }, []);

  const loadAuthorData = async () => {
    try {
      setLoading(true);
      
      // Fetch all posts and filter by author
      const postsResponse = await fetchAdminPosts();
      const allPosts = Array.isArray(postsResponse) 
        ? postsResponse 
        : (postsResponse.posts || postsResponse.data || []);
      
      // Filter to only show current author's posts
      const authorPosts = allPosts.filter(post => 
        post.author?._id === user?._id || post.author === user?._id
      );
      
      const publishedPosts = authorPosts.filter(p => p.status === "published").length;
      const draftPosts = authorPosts.filter(p => p.status === "draft").length;
      
      setStats({
        totalPosts: authorPosts.length,
        publishedPosts,
        draftPosts,
      });
      
      // Get recent 5 posts
      setRecentPosts(authorPosts.slice(0, 5));
      
    } catch (err) {
      setError(err.message);
      setStats({ totalPosts: 0, publishedPosts: 0, draftPosts: 0 });
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="author-loading">
        <Icon name="hourglass_empty" size={32} />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="author-overview">
      {error && (
        <div className="author-alert author-alert-error">
          <Icon name="error" size={18} />
          {error}
        </div>
      )}

      <div className="author-page-header">
        <h2>Author Overview</h2>
        <Link to="/author/posts/new" className="author-btn author-btn-primary">
          <Icon name="add" size={20} />
          Create New Post
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="author-stats-grid">
        <div className="author-stat-card">
          <div className="author-stat-icon blue">
            <Icon name="article" size={24} />
          </div>
          <div className="author-stat-content">
            <div className="author-stat-label">My Posts</div>
            <div className="author-stat-value">{stats.totalPosts}</div>
          </div>
        </div>

        <div className="author-stat-card">
          <div className="author-stat-icon green">
            <Icon name="check_circle" size={24} />
          </div>
          <div className="author-stat-content">
            <div className="author-stat-label">Published</div>
            <div className="author-stat-value">{stats.publishedPosts}</div>
          </div>
        </div>

        <div className="author-stat-card">
          <div className="author-stat-icon yellow">
            <Icon name="edit_note" size={24} />
          </div>
          <div className="author-stat-content">
            <div className="author-stat-label">Drafts</div>
            <div className="author-stat-value">{stats.draftPosts}</div>
          </div>
        </div>
      </div>

      {/* Recent Posts Table */}
      <div className="author-card">
        <div className="author-card-header">
          <h3 className="author-card-title">My Recent Posts</h3>
          <Link to="/author/posts" className="author-btn author-btn-ghost author-btn-sm">
            View All
            <Icon name="arrow_forward" size={18} />
          </Link>
        </div>
        <div className="author-card-body">
          {recentPosts.length > 0 ? (
            <div className="author-table-container">
              <table className="author-table">
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
                  {recentPosts.map((post) => (
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
                      <td>{formatDate(post.createdAt)}</td>
                      <td>
                        <div className="author-actions">
                          <Link 
                            to={`/author/posts/${post._id}`}
                            className="author-btn author-btn-icon author-btn-ghost author-btn-sm"
                          >
                            <Icon name="edit" size={18} />
                          </Link>
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
              <h4 className="author-empty-title">No posts yet</h4>
              <p className="author-empty-text">Create your first post to get started.</p>
              <Link to="/author/posts/new" className="author-btn author-btn-primary" style={{ marginTop: "16px" }}>
                <Icon name="add" size={20} />
                Create Post
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
