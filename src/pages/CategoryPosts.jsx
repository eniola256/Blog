// src/pages/CategoryPosts.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchCategoryBySlug } from "../api/category";
import { fetchPostsByCategory } from "../api/post";
import "./CategoriesPosts.css";

export default function CategoryPosts() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    
    // First, get category details by slug
    fetchCategoryBySlug(slug)
      .then(data => {
        setCategory(data.category);
        // Then fetch posts using category ID
        return fetchPostsByCategory(data.category.slug);
      })
      .then(data => setPosts(data.posts))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div>Loading posts...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!category) return <div>Category not found</div>;

  return (
    <>
    <div className="Category-Main">
      <div className="C-main"> 
        <div className="c-main-heading">
          <div className="c-main-head">
            <div className="icon">
              <span className="material-symbols-outlined">
                category
              </span> 
            </div>
            <h2 className="c-head"><span>Category</span>Web Development</h2>
        </div>
        <div className="c-main-p">
          <p className="cmp-t">Explore the latest trends, tutorials, and best practices in web development. From frontend frameworks to backend architecture, find everything you need to build modern web applications.</p>
          <p className="cmp-b">6 posts</p>
        </div>
      </div>
      </div>
    </div>
    <div className="posts-grid">
      {posts.map(post => (
        <Link
          key={post._id}
          to={`/posts/${post.slug}`}
          className="post-card"
        >
          <div className="post-image">
            <img src="/Lt.jpg" alt="" />
          </div>

          <div className="post-content">
            <div className="post-tags">
              <p>React</p>
              <p>TypeScript</p>
              <p>Web development</p>
            </div>

            <h3 className="post-title">{post.title}</h3>

            <p className="post-excerpt">
              {post.content.substring(0, 120)}…
            </p>

            <div className="post-meta">
              <span className="author">{post.author?.name}</span>
              <span className="date">Jan 20, 2026</span>
              
              <span className="read-time">•  8 min read</span>
            </div>
          </div>
        </Link>
      ))}
    </div>

    <div className="not-showing">
      <h1>Category: {category.name}</h1>
      <p>Posts in this category</p>
      
      {posts.length === 0 ? (
        <div>No posts found in this category</div>
      ) : (
        <div style={{ display: "grid", gap: "1rem", marginTop: "2rem" }}>
          {posts.map(post => (
            <div key={post._id} style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: "8px" }}>
              <Link to={`/posts/${post.slug}`}>
                <h2>{post.title}</h2>
              </Link>
              <p>{post.content.substring(0, 150)}...</p>
              <small>By {post.author.name}</small>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}