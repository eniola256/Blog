import { useEffect, useState } from "react";
import { fetchPublicPosts } from "../api/post";
import { fetchCategories } from "../api/category";
import { trackAnalyticsEvent } from "../api/analytics";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Link } from "react-router-dom";
import "./Blog.css";

export default function Blog() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const POSTS_PER_PAGE = 7;

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    trackAnalyticsEvent({
      eventName: "blog_home_view",
      userId: user?._id || user?.id || null,
    });
  }, [user?._id, user?.id]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    loadPosts();
  }, [currentPage, debouncedSearch, selectedCategory]);

  const loadCategories = async () => {
    try {
      const categoriesData = await fetchCategories();
      const categoriesArray = Array.isArray(categoriesData) ? categoriesData : (categoriesData.categories || categoriesData.data || []);
      setCategories(categoriesArray);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", String(POSTS_PER_PAGE));
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (selectedCategory !== "all") params.set("category", selectedCategory);

      const postsData = await fetchPublicPosts(`?${params.toString()}`);
      const postsArray = Array.isArray(postsData) ? postsData : (postsData.posts || postsData.data || []);
      setPosts(postsArray);
      setTotalPages(postsData.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get featured post (first post)
  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Handle newsletter subscription
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const SkeletonLoader = () => (
    <>
      <div className="blog-skeleton-header">
        <div className="blog-skeleton blog-skeleton-title"></div>
        <div className="blog-skeleton blog-skeleton-text"></div>
      </div>

      <div className="blog-skeleton-featured">
        <div className="blog-skeleton blog-skeleton-featured-img"></div>
        <div className="blog-skeleton blog-skeleton-featured-text"></div>
        <div className="blog-skeleton blog-skeleton-featured-excerpt"></div>
      </div>

      <section className="blog-skeleton-section">
        <div className="blog-skeleton-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="blog-skeleton-card">
              <div className="blog-skeleton blog-skeleton-card-image"></div>
              <div className="blog-skeleton blog-skeleton-card-category"></div>
              <div className="blog-skeleton blog-skeleton-card-title"></div>
              <div className="blog-skeleton blog-skeleton-card-text"></div>
              <div className="blog-skeleton blog-skeleton-card-footer"></div>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  if (loading) {
    return (
      <div className="blog-page">
        <div className="blog-container">
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-error">
        <div className="blog-error-icon">⚠️</div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={loadPosts} className="blog-error-btn">Try Again</button>
      </div>
    );
  }

  return (
    <div className="blog-page">
      {/* Hero Section */}
      <section className="blog-hero">
        <div className="blog-hero-content">
          <span className="blog-hero-badge">Welcome to</span>
          <h1>AE Tech Blog</h1>
          <p>Discover insights on gaming, technology, AI, and coding. Your daily source for thoughtful posts and in-depth tutorials.</p>
          <div className="blog-hero-search">
            <svg className="hero-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="blog-container">
        {/* Filters Bar */}
        <section className="blog-filters">
          <div className="blog-filters-wrapper">
            <div className="blog-filter-chips">
              <button
                className={`filter-chip ${selectedCategory === "all" ? "active" : ""}`}
                onClick={() => setSelectedCategory("all")}
              >
                All Posts
              </button>
              {categories.map(cat => (
                <button
                  key={cat._id || cat}
                  className={`filter-chip ${selectedCategory === (cat.slug || cat._id || cat) ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat.slug || cat._id || cat)}
                >
                  {cat.name || cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="blog-main">
          {/* Primary Content */}
          <div className="blog-primary">
            {/* Featured Post */}
            {featuredPost && currentPage === 1 && (
              <article className="blog-featured-card">
                <Link to={`/posts/${featuredPost.slug}`}>
                  <div className="blog-featured-image">
                    {featuredPost.featuredImage ? (
                      <img
                        src={featuredPost.featuredImage}
                        alt={featuredPost.title}
                        fetchPriority="high"
                        decoding="async"
                        width="1200"
                        height="720"
                      />
                    ) : (
                      <div className="blog-featured-placeholder">
                        <span>AE</span>
                      </div>
                    )}
                    <div className="blog-featured-overlay"></div>
                  </div>
                  <div className="blog-featured-content">
                    <div className="blog-featured-meta">
                      <span className="blog-featured-category">
                        {featuredPost.category?.name || "Uncategorized"}
                      </span>
                      <span className="blog-featured-date">
                        {new Date(featuredPost.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                    <h2 className="blog-featured-title">{featuredPost.title}</h2>
                    <p className="blog-featured-excerpt">{featuredPost.excerpt || ""}</p>
                    <div className="blog-featured-footer">
                      <div className="blog-featured-author">
                        <div className="blog-featured-avatar">
                          {featuredPost.author?.name?.charAt(0) || "A"}
                        </div>
                        <div className="blog-featured-author-info">
                          <span className="blog-featured-author-name">
                            {featuredPost.author?.name || "AE Hobs"}
                          </span>
                          <span className="blog-featured-readtime">{featuredPost.readTime || "1 min read"}</span>
                        </div>
                      </div>
                      <span className="blog-featured-arrow">→</span>
                    </div>
                  </div>
                </Link>
              </article>
            )}

            {/* Posts Grid */}
            <section className="blog-posts-grid">
              {regularPosts.length > 0 ? (
                regularPosts.map(post => (
                  <article key={post._id} className="blog-post-card">
                    <Link to={`/posts/${post.slug}`}>
                      <div className="blog-post-image">
                        {post.featuredImage ? (
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            loading="lazy"
                            decoding="async"
                            width="640"
                            height="360"
                          />
                        ) : (
                          <div className="blog-post-placeholder">
                            <span>AE</span>
                          </div>
                        )}
                      </div>
                      <div className="blog-post-content">
                        <div className="blog-post-meta">
                          <span className="blog-post-category">
                            {post.category?.name || "Uncategorized"}
                          </span>
                          <span className="blog-post-date">
                            {new Date(post.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric"
                            })}
                          </span>
                        </div>
                        <h3 className="blog-post-title">{post.title}</h3>
                        <p className="blog-post-excerpt">{post.metaDescription || post.excerpt || ""}</p>
                        <div className="blog-post-footer">
                          <span className="blog-post-author">
                            {post.author?.name || "AE Hobs"}
                          </span>
                          <span className="blog-post-readtime">{post.readTime || "1 min read"}</span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))
              ) : (
                <div className="blog-empty">
                  <div className="blog-empty-icon">📝</div>
                  <h3>No posts found</h3>
                  <p>Try adjusting your search or filter criteria</p>
                </div>
              )}
            </section>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="blog-pagination">
                <button
                  className="pagination-btn pagination-prev"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  Previous
                </button>
                <div className="pagination-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`pagination-number ${currentPage === page ? "active" : ""}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  className="pagination-btn pagination-next"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="blog-sidebar">
            {/* Popular Posts */}
            <div className="sidebar-card sidebar-popular">
              <h3 className="sidebar-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                Popular Posts
              </h3>
              <div className="popular-list">
                {posts.slice(0, 4).map((post, index) => (
                  <Link to={`/posts/${post.slug}`} key={post._id} className="popular-item">
                    <div className="popular-number">{String(index + 1).padStart(2, '0')}</div>
                    <div className="popular-content">
                      <h4>{post.title}</h4>
                      <span className="popular-meta">
                        <span className="popular-category">{post.category?.name || "General"}</span>
                        <span className="popular-dot">•</span>
                        <span>{post.readTime || "1 min read"}</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="sidebar-card sidebar-categories">
              <h3 className="sidebar-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                Categories
              </h3>
              <div className="categories-list">
                {categories.map(cat => (
                  <Link 
                    to={`/category/${cat.slug || cat._id || cat}`} 
                    key={cat._id || cat}
                    className="category-item"
                  >
                    <span className="category-name">{cat.name || cat}</span>
                    <span className="category-count">
                      {cat.postCount ?? "-"}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="sidebar-card sidebar-newsletter">
              <div className="newsletter-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h3 className="sidebar-title">Subscribe to Newsletter</h3>
              <p>Get the latest posts and insights delivered straight to your inbox.</p>
              {subscribed ? (
                <div className="newsletter-success">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>Thanks for subscribing!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="newsletter-form">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit">Subscribe</button>
                </form>
              )}
            </div>

            {/* Tags Cloud */}
            <div className="sidebar-card sidebar-tags">
              <h3 className="sidebar-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
                Popular Tags
              </h3>
              <div className="tags-cloud">
                <Link to="/tags" className="tag-item">Technology</Link>
                <Link to="/tags" className="tag-item">AI</Link>
                <Link to="/tags" className="tag-item">Gaming</Link>
                <Link to="/tags" className="tag-item">Coding</Link>
                <Link to="/tags" className="tag-item">Web Dev</Link>
                <Link to="/tags" className="tag-item">Tutorials</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
