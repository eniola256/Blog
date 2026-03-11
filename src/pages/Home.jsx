
import { useEffect, useState } from "react";
import { fetchPublicPosts } from "../api/post";
import { trackAnalyticsEvent } from "../api/analytics";
import { Link } from "react-router-dom";
import NewsletterPopup from "../components/NewsletterPopup";
import { useAuth } from "../contexts/AuthContext.jsx";
import "./Home.css";

export default function Home() {
  const { user } = useAuth();
  const [featuredPost, setFeaturedPost] = useState(null);
  const [featuredId, setFeaturedId] = useState(null);
  const [latestPosts, setLatestPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animate, setAnimate] = useState(false);

  const POSTS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

 const [featuredReady, setFeaturedReady] = useState(false);

// Load featured ONCE on mount
useEffect(() => {
  const loadFeatured = async () => {
    try {
      const featuredData = await fetchPublicPosts("?page=1&limit=1&sort=createdAt:asc");
      const featured = (featuredData.posts || [])[0] || null;
      setFeaturedPost(featured);
      setFeaturedId(featured?._id || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setFeaturedReady(true); // always mark ready, even if featured is null
    }
  };
  loadFeatured();
}, []);
  // Load latest when page changes or featuredId is first set
  useEffect(() => {
    const loadLatest = async () => {
      try {
        setLoading(true);
        setError(null);
        const exclude = featuredId ? `&exclude=${featuredId}` : "";
        const data = await fetchPublicPosts(
          `?page=${currentPage}&limit=${POSTS_PER_PAGE}${exclude}`
        );
        setLatestPosts(data.posts || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadLatest();
  }, [currentPage, featuredId]);

  useEffect(() => { setAnimate(true); }, []);

  useEffect(() => {
    trackAnalyticsEvent({
      eventName: "blog_home_view",
      userId: user?._id || user?.id || null,
    });
  }, [user?._id, user?.id]);

  // Skeleton component for initial load - shows content while fetching
  const SkeletonLoader = () => (
    <>
      <div className="skeleton-header">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-text"></div>
      </div>

      <div className="skeleton-featured">
        <div className="skeleton skeleton-featured-img"></div>
        <div className="skeleton skeleton-featured-text"></div>
        <div className="skeleton skeleton-featured-excerpt"></div>
      </div>

      <section className="latest-news">
        <div className="lt">
          <div className="skeleton" style={{ height: '28px', width: '150px', marginBottom: '20px' }}></div>
          <div className="skeleton-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton skeleton-card-image"></div>
                <div className="skeleton skeleton-card-category"></div>
                <div className="skeleton skeleton-card-title"></div>
                <div className="skeleton skeleton-card-text"></div>
                <div className="skeleton skeleton-card-footer"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );

  if (loading) {
    return (
      <>
        <NewsletterPopup />
        <div id="Home">
          <div className="homepage">
            <SkeletonLoader />
          </div>
        </div>
      </>
    );
  }
  if (error) return <p>{error}</p>;


  return (
    <>  
    <NewsletterPopup />
    <div id="Home">
      <div className= "homepage">
        <main className={`home-main ${animate ? 'slide-up' : ''}`}>
          
          <h1>Welcome to <br />AE Tech/Gaming Blog</h1>
          <p>Thoughtful explorations on productivity, creativity, wellness, and living intentionally. Join our community of curious minds seeking meaningful insights</p>
          
        </main>

        <section className="featured-story">
          {featuredPost ? (
            <Link to={`/posts/${featuredPost.slug}`} className="fs">
              <div className="fs-label">
                <p>Featured Story</p>
              </div>
              <div className="fs-content">
                <div className="img">
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
                    <img src="fs.jpg" alt="Featured" fetchPriority="high" decoding="async" width="1200" height="720" />
                  )}
                  {featuredPost.category?.name && (
                    <span className="featured-category">{featuredPost.category.name}</span>
                  )}
                </div>
                <div className="featured-post-txt">
                  <h3>{featuredPost.title}</h3>
                  <p className="post-content">
                    {featuredPost.metaDescription || featuredPost.excerpt || ""}
                  </p>
                  <p className="featured-date-time"> 
                    {featuredPost.author?.name || 'AE Hobs'} 
                    <span className="dot"></span> 
                    <span className="d-t">{new Date(featuredPost.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </p>
                </div>
              </div>
            </Link>
          ) : (
            <div className="fs">
              <div className="fs-label">
                <p>Featured Story</p>
              </div>
              <div className="fs-content">
                <div className="img">
                  <img src="fs.jpg" alt="Manja Vs Odunwire" />
                  <span className="featured-category">Tech</span>
                </div>
                <div className="featured-post-txt">
                  <h3>Manja Vs Odunwire: The Ultimate Tech Showdown</h3>
                  <p className="post-content">Dive into the epic battle between Manja and Odunwire as they clash over the latest in tech innovations. Who will come out on top in this thrilling showdown?</p>
                  <p> AE Hobs <span>.</span> <span>January 30 2026</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="latest-news">
          <div className="lt">
          <h2>Latest News</h2>

          <div className="latest-grid">
            {latestPosts.length > 0 ? (
              latestPosts.map(post => (
                <Link to={`/posts/${post.slug}`} key={post._id} className="latest-card">
                  <div className="ph-image">
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
                      <img src="Lt.jpg" alt="" loading="lazy" decoding="async" width="640" height="360" />
                    )}
                  </div>
                  <div className="cat-date">
                    <p className="category">{post.category?.name || 'Uncategorized'}</p>
                    <p className="date">{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div className="ph-title">
                    <h3>{post.title}</h3>
                  </div>
                  <div className="ph-text">
                    <p>{post.metaDescription || post.excerpt || ""}</p>
                  </div>
                  <div className="wri-more">
                    <p className="writer">{post.author?.name || 'AE Hobs'}</p>
                    <button className="more">Read More <span className="material-symbols-outlined">
                    arrow_forward
                    </span>
                    </button>
                  </div>
                </Link>
              ))
            ) : (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>No posts available yet.</p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button 
                  key={page}
                  className={currentPage === page ? 'active' : ''}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
          </div>
        </section>

        <footer className="home-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>AE Tech/Gaming Blog</h3>
              <p>Thoughtful explorations on productivity, creativity, wellness, and living intentionally.</p>
            </div>
            <div className="footer-links">
              <div className="footer-section">
                <h4>Quick Links</h4>
                <Link to="/">Home</Link>
                <Link to="/posts">Posts</Link>
                <Link to="/categories">Categories</Link>
                <Link to="/contact">Contact</Link>
              </div>
              <div className="footer-section">
                <h4>Categories</h4>
                <Link to="/categories">Technology</Link>
                <Link to="/categories">Gaming</Link>
                <Link to="/categories">Productivity</Link>
                <Link to="/categories">Lifestyle</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} AE Tech/Gaming Blog. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
    </>
  );
}
