// src/pages/Categories.jsx
import { useEffect, useState } from "react";
import { fetchCategories } from "../api/category";
import { Link } from "react-router-dom";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories()
      .then(data => setCategories(data.categories))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading categories...</div>;
  if (error) return <div>Error: {error}</div>;
  if (categories.length === 0) return <div>No categories found</div>;

  return (
    <div>
      <h1>Categories</h1>
      <div style={{ display: "grid", gap: "1rem" }}>
        {categories.map(category => (
          <Link 
            key={category._id} 
            to={`/category/${category.slug}`}
            style={{ 
              padding: "1rem", 
              border: "1px solid #ddd", 
              borderRadius: "8px",
              textDecoration: "none",
              color: "inherit"
            }}
          >
            <h2>{category.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}