import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPublicPostBySlug } from "../api/post.js";

// PostDetails.jsx
export default function PostDetails() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPublicPostBySlug(slug)
      .then(data => setPost(data.post))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p>Loading post…</p>;
  if (error) return <p>{error}</p>;
  if (!post) return <p>Post not found</p>;

  return (
    <article>
      <h1>{post.title}</h1>
      <p>By {post.author.name}</p>
      
      {/* ✅ Add category */}
      {post.category && (
        <p>
          Category: <Link to={`/category/${post.category.slug}`}>{post.category.name}</Link>
        </p>
      )}
      
      {/* ✅ Add tags */}
      {post.tags && post.tags.length > 0 && (
        <div>
          Tags: {post.tags.map(tag => (
            <Link 
              key={tag._id} 
              to={`/tag/${tag.slug}`}
              style={{ marginRight: "0.5rem" }}
            >
              {tag.name}
            </Link>
          ))}
        </div>

      )}
      
      <div>{post.content}</div>
    </article>
  );
}