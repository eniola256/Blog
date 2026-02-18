import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/Icon";
import { fetchAdminStats, fetchAdminPosts } from "../../api/post";
import { fetchAdminCategories } from "../../api/category";
import "../../pages/AdminDashboard.css";

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    categoriesCount: 0,
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch stats from API
      try {
        const statsData = await fetchAdminStats();
        // Handle different response formats
        const totalPosts = statsData.totalPosts ?? statsData.total ?? 0;
        const publishedPosts = statsData.publishedPosts ?? statsData.published ?? 0;
        const draftPosts = statsData.draftPosts ?? statsData.drafts ?? 0;
        const categoriesCount = statsData.categoriesCount ?? statsData.categories ?? 0;
        
        setStats({
          totalPosts,
          publishedPosts,
          draftPosts,
          categoriesCount,
        });
      } catch (err) {
        // If stats endpoint doesn't exist, calculate from data
        const [postsData, categories] = await Promise.all([
          fetchAdminPosts(),
          fetchAdminCategories()
        ]);
        
        // Handle both { posts: [] } and [] response formats
        const postsArray = Array.isArray(postsData) ? postsData : (postsData.posts || postsData.data || []);
        // Handle categories response format
        const categoriesArray = Array.isArray(categories) ? categories : (categories.categories || categories.data || []);
        const publishedPosts = postsArray.filter(p => p.status === "published").length;
        const draftPosts = postsArray.filter(p => p.status === "draft").length;
        
        setStats({
          totalPosts: postsArray.length,
          publishedPosts,
          draftPosts,
          categoriesCount: categoriesArray.length,
        });
      }

      // Fetch recent posts
      const postsResponse = await fetchAdminPosts();
      // Handle both { posts: [] } and [] response formats
      const postsArray = Array.isArray(postsResponse) ? postsResponse : (postsResponse.posts || postsResponse.data || []);
      setRecentPosts(postsArray.slice(0, 5)); // Get first 5 posts
      
    } catch (err) {
      setError(err.message);
      // Use default stats on error
      setStats({
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        categoriesCount: 0,
      });
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="admin-loading">
        <Icon name="hourglass_empty" size={32} />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-overview">
      {error && (
        <div className="admin-alert admin-alert-error">
          <Icon name="error" size={18} />
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue">
            <Icon name="article" size={24} />
          </div>
          <div className="admin-stat-content">
            <div className="admin-stat-label">Total Posts</div>
            <div className="admin-stat-value">{stats.totalPosts}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon green">
            <Icon name="check_circle" size={24} />
          </div>
          <div className="admin-stat-content">
            <div className="admin-stat-label">Published</div>
            <div className="admin-stat-value">{stats.publishedPosts}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon yellow">
            <Icon name="edit_note" size={24} />
          </div>
          <div className="admin-stat-content">
            <div className="admin-stat-label">Drafts</div>
            <div className="admin-stat-value">{stats.draftPosts}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon purple">
            <Icon name="category" size={24} />
          </div>
          <div className="admin-stat-content">
            <div className="admin-stat-label">Categories</div>
            <div className="admin-stat-value">{stats.categoriesCount}</div>
          </div>
        </div>
      </div>

      {/* Recent Posts Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Recent Posts</h3>
          <Link to="/admin/posts" className="admin-btn admin-btn-ghost admin-btn-sm">
            View All
            <Icon name="arrow_forward" size={18} />
          </Link>
        </div>
        <div className="admin-card-body">
          {recentPosts.length > 0 ? (
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
                  {recentPosts.map((post) => (
                    <tr key={post._id || post}>
                      <td>
                        <Link to={`/admin/posts/${post._id || post}`} className="admin-post-title">
                          {post.title}
                        </Link>
                      </td>
                      <td>
                        <span className={`admin-badge ${post.status || "draft"}`}>
                          {((post.status) || "draft").charAt(0).toUpperCase() + ((post.status) || "draft").slice(1)}
                        </span>
                      </td>
                      <td>{post.category?.name || post.category || "—"}</td>
                      <td>{formatDate(post.createdAt || post.date)}</td>
                      <td>
                        <div className="admin-actions">
                          <Link 
                            to={`/admin/posts/${post._id || post}`}
                            className="admin-btn admin-btn-icon admin-btn-ghost admin-btn-sm"
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
            <div className="admin-empty">
              <Icon name="article" size={48} className="admin-empty-icon" />
              <h4 className="admin-empty-title">No posts yet</h4>
              <p className="admin-empty-text">Create your first post to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
