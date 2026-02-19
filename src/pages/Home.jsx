
import { useEffect, useState } from "react";
import { fetchPublicPosts } from "../api/post";
import { Link } from "react-router-dom";
import NewsletterPopup from "../components/NewsletterPopup";
import "./Home.css";

export default function Home() {
  const [featuredPost, setFeaturedPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animate, setAnimate] = useState(false);

  // Pagination
  const POSTS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  useEffect(() => {
    fetchPublicPosts("?status=published")
      .then(data => {
        const publishedPosts = data.posts || [];
        setPosts(publishedPosts);
        // First published post becomes featured
        if (publishedPosts.length > 0) {
          setFeaturedPost(publishedPosts[0]);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setAnimate(true);
  }, []);

  if (loading) return <p>Loading posts…</p>;
  if (error) return <p>{error}</p>;


  return (
    <>  
    <NewsletterPopup />
    <div id="Home">
      <div className= "homepage">
        <main className={`home-main ${animate ? 'slide-up' : ''}`}>
          <div className="home-main-left">
          <h1>Welcome to <br />AE Tech/Gaming Blog</h1>
          <p>Thoughtful explorations on productivity, creativity, wellness, and living intentionally. Join our community of curious minds seeking meaningful insights</p>
          </div>
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
                    <img src={featuredPost.featuredImage} alt={featuredPost.title} />
                  ) : (
                    <img src="fs.jpg" alt="Featured" />
                  )}
                </div>
                <div className="featured-post-txt">
                  <h3>{featuredPost.title}</h3>
                  <p className="post-content">
                    {featuredPost.content?.substring(0, 150)}...
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
            {paginatedPosts.length > 0 ? (
              paginatedPosts.map(post => (
                <Link to={`/posts/${post.slug}`} key={post._id} className="latest-card">
                  <div className="ph-image">
                    {post.featuredImage ? (
                      <img src={post.featuredImage} alt={post.title} />
                    ) : (
                      <img src="Lt.jpg" alt="" />
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
                    <p>{post.content?.substring(0, 100)}...</p>
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
      </div>
    </div>
    </>
  );
}
