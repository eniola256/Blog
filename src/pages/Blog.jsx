import { useEffect, useState } from "react";
import { fetchPublicPosts } from "../api/post";
import { fetchCategories } from "../api/category";
import { Link } from "react-router-dom";
import "./Blog.css";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const POSTS_PER_PAGE = 9;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postsData, categoriesData] = await Promise.all([
        fetchPublicPosts("?status=published"),
        fetchCategories()
      ]);
      
      // Handle different response formats
      const postsArray = Array.isArray(postsData) ? postsData : (postsData.posts || postsData.data || []);
      const categoriesArray = Array.isArray(categoriesData) ? categoriesData : (categoriesData.categories || categoriesData.data || []);
      
      setPosts(postsArray);
      setCategories(categoriesArray);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter posts by search and category
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
                           post.category?.slug === selectedCategory ||
                           post.category?._id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Calculate read time
  const getReadTime = (content) => {
    if (!content) return "1 min read";
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  if (loading) {
    return (
      <div className="blog-loading">
        <div className="blog-spinner"></div>
        <p>Loading articles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-error">
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button onClick={loadData}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="blog-page">
      {/* Hero Section */}
      <section className="blog-hero">
        <div className="blog-hero-content">
          <h1>AE Tech Blog</h1>
          <p>Explore the latest in gaming, technology, AI, and coding. Your source for insightful articles and tutorials.</p>
        </div>
      </section>

      <div className="blog-container">
        {/* Search and Filter Section */}
        <section className="blog-filters">
          <div className="blog-search">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="blog-category-tabs">
            <button
              className={`category-tab ${selectedCategory === "all" ? "active" : ""}`}
              onClick={() => setSelectedCategory("all")}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat._id || cat}
                className={`category-tab ${selectedCategory === (cat.slug || cat._id || cat) ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat.slug || cat._id || cat)}
              >
                {cat.name || cat}
              </button>
            ))}
          </div>
        </section>

        <div className="blog-main">
          {/* Posts Grid */}
          <section className="blog-posts-grid">
            {paginatedPosts.length > 0 ? (
              paginatedPosts.map(post => (
                <article key={post._id} className="blog-post-card">
                  <Link to={`/posts/${post.slug}`}>
                    <div className="blog-post-image">
                      {post.featuredImage ? (
                        <img src={post.featuredImage} alt={post.title} />
                      ) : (
                        <div className="blog-post-placeholder">
                          <span>📝</span>
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
                            day: "numeric",
                            year: "numeric"
                          })}
                        </span>
                      </div>
                      <h2 className="blog-post-title">{post.title}</h2>
                      <p className="blog-post-excerpt">
                        {post.content?.substring(0, 120)}...
                      </p>
                      <div className="blog-post-footer">
                        <span className="blog-post-author">
                          {post.author?.name || "AE Hobs"}
                        </span>
                        <span className="blog-post-readtime">
                          {getReadTime(post.content)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))
            ) : (
              <div className="blog-empty">
                <h3>No articles found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            )}
          </section>

          {/* Sidebar */}
          <aside className="blog-sidebar">
            {/* Popular Posts */}
            <div className="blog-sidebar-section">
              <h3>Popular Posts</h3>
              <div className="blog-popular-posts">
                {posts.slice(0, 3).map((post, index) => (
                  <Link to={`/posts/${post.slug}`} key={post._id} className="blog-popular-item">
                    <span className="blog-popular-number">{index + 1}</span>
                    <div className="blog-popular-content">
                      <h4>{post.title}</h4>
                      <span>{getReadTime(post.content)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="blog-sidebar-section">
              <h3>Categories</h3>
              <div className="blog-sidebar-categories">
                {categories.map(cat => (
                  <Link 
                    to={`/category/${cat.slug || cat._id || cat}`} 
                    key={cat._id || cat}
                    className="blog-sidebar-category"
                  >
                    <span>{cat.name || cat}</span>
                    <span className="blog-category-count">
                      {posts.filter(p => p.category?.slug === (cat.slug || cat._id) || p.category?._id === (cat._id || cat)).length}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="blog-sidebar-section blog-newsletter">
              <h3>Newsletter</h3>
              <p>Get the latest articles delivered to your inbox</p>
              <form onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Enter your email" />
                <button type="submit">Subscribe</button>
              </form>
            </div>
          </aside>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="blog-pagination">
            <button
              className="blog-pagination-btn"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>
            <div className="blog-pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`blog-pagination-number ${currentPage === page ? "active" : ""}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              className="blog-pagination-btn"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
