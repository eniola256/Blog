
import { useEffect, useState } from "react";
import { fetchPublicPosts } from "../api/post";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const POSTS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const latestPosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);


  useEffect(() => {
    fetchPublicPosts()
      .then(data => setPosts(data.posts))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading posts…</p>;
  if (error) return <p>{error}</p>;

  return (
    <>  
    <div id="Home">
      <div className="homepage">
        <main className="home-main">
          <h1>Welcome to <br />AE Tech/Gaming Blog</h1>
          <p>Thoughtful explorations on productivity, creativity, wellness, and living intentionally. Join our community of curious minds seeking meaningful insights</p>
        </main>

        <section className="featured-story">
          <div className="fs">
            <div className="fs-label">
            <p>Featured Story</p>
            </div>
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
        </section>

        <section className="latest-news">
  <h2>Latest News</h2>

  <div className="latest-grid">
    {Array.from({ length: 6 }).map((_, index) => (
      <article key={index} className="latest-card placeholder">

        <div className="ph-image" ><img src="Lt.jpg" alt="" /></div>
        <div className="cat-date">
          <p className="category">Gaming</p>
          <p className="date">January 30, 2026</p>
        </div>
        <div className="ph-title" ><h3>Who is truly the No.1 Gaming content Creator</h3></div>

        <div className="ph-text">
          <p>Exploring the rise of gaming influencers and their impact on the industry.</p>
        </div>

        <div className="wri-more">
          <p className="writer">AE Hobs</p>
          <button className="more">Read More <span className="material-symbols-outlined">
          arrow_forward
          </span>
          </button>
        </div>
      </article>
    ))}
  </div>

  <div className="pagination">
    <button disabled>Prev</button>
    <button className="active">1</button>
    <button>2</button>
    <button>3</button>
    <button>Next</button>
  </div>
</section>
      
      <div className="pst">
        <h1>Blog Posts</h1>
        {posts.map(post => (
          <div key={post._id}>
            <Link to={`/posts/${post.slug}`}>
              <h2>{post.title}</h2>
            </Link>
            <p>{post.content.substring(0, 150)}...</p> {/* ✅ Add excerpt */}
          </div>
        ))}
      </div> 
      </div>
    </div>
    </>
  );
}