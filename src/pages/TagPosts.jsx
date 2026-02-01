// src/pages/TagPosts.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchTagWithPosts } from "../api/tag";

export default function TagPosts() {
  const { slug } = useParams();
  const [tag, setTag] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    
    // First, get tag details by slug
    fetchTagWithPosts(slug)
      .then(data => {
        setTag(data.tag);
        setPosts(data.posts);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div>Loading posts...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!tag) return <div>Tag not found</div>;

  return (
    <div>
      <h1>Tag: {tag.name}</h1>
      <p>Posts with this tag</p>
      
      {posts.length === 0 ? (
        <div>No posts found with this tag</div>
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