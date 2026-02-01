// src/pages/CategoryPosts.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchCategoryBySlug } from "../api/category";
import { fetchPostsByCategory } from "../api/post";

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
    <div>
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
  );
}