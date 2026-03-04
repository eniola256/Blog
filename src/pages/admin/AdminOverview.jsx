import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/Icon";
import { fetchAdminStats, fetchAdminPosts } from "../../api/post";
import { fetchAdminCategories } from "../../api/category";
import { fetchAdminAnalyticsOverview } from "../../api/analytics";
import "../../pages/AdminDashboard.css";

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    categoriesCount: 0,
  });
  const [analytics, setAnalytics] = useState({
    rangeDays: 30,
    totals: {
      uniqueVisitors: 0,
      postViews: 0,
      readCompletes: 0,
      completionRate: 0,
    },
    readDepth: {
      read_25: 0,
      read_50: 0,
      read_75: 0,
      read_100: 0,
    },
    topPosts: [],
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
        const statsAnalytics = statsData.analytics || {};

        setStats({
          totalPosts,
          publishedPosts,
          draftPosts,
          categoriesCount,
        });

        setAnalytics((prev) => ({
          ...prev,
          rangeDays: statsAnalytics.rangeDays ?? prev.rangeDays,
          totals: {
            ...prev.totals,
            uniqueVisitors: statsAnalytics.uniqueVisitors ?? prev.totals.uniqueVisitors,
            postViews: statsAnalytics.postViews ?? prev.totals.postViews,
            readCompletes: statsAnalytics.readCompletes ?? prev.totals.readCompletes,
            completionRate: statsAnalytics.completionRate ?? prev.totals.completionRate,
          },
        }));
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

      try {
        const analyticsOverview = await fetchAdminAnalyticsOverview(30);
        setAnalytics({
          rangeDays: analyticsOverview.rangeDays ?? 30,
          totals: {
            uniqueVisitors: analyticsOverview.totals?.uniqueVisitors ?? 0,
            postViews: analyticsOverview.totals?.postViews ?? 0,
            readCompletes: analyticsOverview.totals?.readCompletes ?? 0,
            completionRate: analyticsOverview.totals?.completionRate ?? 0,
          },
          readDepth: {
            read_25: analyticsOverview.readDepth?.read_25 ?? 0,
            read_50: analyticsOverview.readDepth?.read_50 ?? 0,
            read_75: analyticsOverview.readDepth?.read_75 ?? 0,
            read_100: analyticsOverview.readDepth?.read_100 ?? 0,
          },
          topPosts: analyticsOverview.topPosts || [],
        });
      } catch {
        // Keep fallback analytics from /stats
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

  const formatPercent = (value) => `${Number(value || 0).toFixed(2)}%`;

  const readDepthRows = [
    { key: "read_25", label: "25% read", value: analytics.readDepth.read_25 },
    { key: "read_50", label: "50% read", value: analytics.readDepth.read_50 },
    { key: "read_75", label: "75% read", value: analytics.readDepth.read_75 },
    { key: "read_100", label: "100% read", value: analytics.readDepth.read_100 },
  ];

  const maxDepth = Math.max(...readDepthRows.map((item) => item.value), 1);

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

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Reader Analytics ({analytics.rangeDays} days)</h3>
        </div>
        <div className="admin-card-body">
          <div className="admin-analytics-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-icon blue">
                <Icon name="group" size={24} />
              </div>
              <div className="admin-stat-content">
                <div className="admin-stat-label">Unique Visitors</div>
                <div className="admin-stat-value">{analytics.totals.uniqueVisitors}</div>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon green">
                <Icon name="visibility" size={24} />
              </div>
              <div className="admin-stat-content">
                <div className="admin-stat-label">Post Views</div>
                <div className="admin-stat-value">{analytics.totals.postViews}</div>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon yellow">
                <Icon name="task_alt" size={24} />
              </div>
              <div className="admin-stat-content">
                <div className="admin-stat-label">Read Completes</div>
                <div className="admin-stat-value">{analytics.totals.readCompletes}</div>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon purple">
                <Icon name="insights" size={24} />
              </div>
              <div className="admin-stat-content">
                <div className="admin-stat-label">Completion Rate</div>
                <div className="admin-stat-value">{formatPercent(analytics.totals.completionRate)}</div>
              </div>
            </div>
          </div>

          <div className="admin-analytics-panels">
            <div className="admin-analytics-panel">
              <h4 className="admin-analytics-title">Read Depth</h4>
              <div className="admin-depth-list">
                {readDepthRows.map((item) => (
                  <div key={item.key} className="admin-depth-row">
                    <span className="admin-depth-label">{item.label}</span>
                    <div className="admin-depth-track">
                      <span
                        className="admin-depth-fill"
                        style={{ width: `${(item.value / maxDepth) * 100}%` }}
                      ></span>
                    </div>
                    <span className="admin-depth-value">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-analytics-panel">
              <h4 className="admin-analytics-title">Top Posts by Views</h4>
              {analytics.topPosts.length > 0 ? (
                <div className="admin-top-posts-list">
                  {analytics.topPosts.map((item, index) => (
                    <div key={`${item.slug || item.postId || "unknown"}-${index}`} className="admin-top-post-item">
                      <span className="admin-top-post-rank">#{index + 1}</span>
                      <span className="admin-top-post-slug">{item.slug || "Unknown slug"}</span>
                      <span className="admin-top-post-views">{item.views} views</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="admin-empty-text">No tracked post views yet.</p>
              )}
            </div>
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
