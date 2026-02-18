// src/pages/Tags.jsx
import { useEffect, useState } from "react";
import { fetchTags } from "../api/tag";
import { Link } from "react-router-dom";

export default function Tags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTags()
      .then(data => {
        // Handle different response formats
        const tagsArray = Array.isArray(data) ? data : (data.tags || data.data || []);
        setTags(tagsArray);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading tags...</div>;
  if (error) return <div>Error: {error}</div>;
  if (tags.length === 0) return <div>No tags found</div>;

  return (
    <div>
      <h1>Tags</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {tags.map(tag => (
          <Link 
            key={tag._id} 
            to={`/tag/${tag.slug}`}
            style={{ 
              padding: "0.5rem 1rem", 
              border: "1px solid #ddd", 
              borderRadius: "20px",
              textDecoration: "none",
              color: "inherit",
              fontSize: "0.9rem"
            }}
          >
            {tag.name}
          </Link>
        ))}
      </div>
    </div>
  );
}