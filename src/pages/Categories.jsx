// src/pages/Categories.jsx
import { useEffect, useState } from "react";
import { fetchCategories } from "../api/category";
import { Link } from "react-router-dom";
import "./Categories.css";

// Map category names to appropriate icons and descriptions for gaming/tech blog
const getCategoryInfo = (name) => {
  const nameLower = name.toLowerCase();
  
  const categoryMap = {
    // Gaming categories
    gaming: { icon: "sports_esports", description: "Video games, reviews, walkthroughs and gaming culture" },
    pc_gaming: { icon: "desktop_windows", description: "PC gaming builds, hardware and gameplay" },
    console: { icon: "gamepad", description: "PlayStation, Xbox, Nintendo and console gaming" },
    mobile_gaming: { icon: "phone_android", description: "Mobile games, apps and smartphone gaming" },
    esports: { icon: "emoji_events", description: "Competitive gaming, tournaments and pro scenes" },
    
    // Tech categories
    technology: { icon: "devices", description: "Latest tech news, gadgets and innovations" },
    smartphones: { icon: "smartphone", description: "Phone reviews, releases and mobile tech" },
    computers: { icon: "computer", description: "Laptops, desktops and computer hardware" },
    software: { icon: "code", description: "Software, apps, programming and development" },
    ai: { icon: "psychology", description: "Artificial intelligence, machine learning and automation" },
    cybersecurity: { icon: "security", description: "Privacy, security tips and online protection" },
    
    // Reviews & Features
    reviews: { icon: "rate_review", description: "Product reviews, comparisons and buying guides" },
    tutorials: { icon: "school", description: "How-to guides, tips and tutorials" },
    news: { icon: "newspaper", description: "Latest news and industry updates" },
    opinion: { icon: "forum", description: "Opinion pieces and editorial content" },
    
    // Default fallback
    default: { icon: "folder", description: "Browse our collection of articles" }
  };

  // Check for partial matches
  for (const key of Object.keys(categoryMap)) {
    if (nameLower.includes(key)) {
      return categoryMap[key];
    }
  }
  
  return categoryMap.default;
};

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories()
      .then(data => {
        // Handle different response formats
        const categoriesArray = Array.isArray(data) ? data : (data.categories || data.data || []);
        setCategories(categoriesArray);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: "center", padding: "60px" }}>Loading categories...</div>;
  if (error) return <div style={{ textAlign: "center", padding: "60px", color: "red" }}>Error: {error}</div>;
  if (categories.length === 0) return <div style={{ textAlign: "center", padding: "60px" }}>No categories found</div>;

  return (
    <>
    <div className="categories-page">
      <div className="cat-head">
        <h1>Categories</h1>
        <p>Explore our gaming and tech content. Find the topics that interest you most.</p>
      </div>
      <div className="category-list">
        {categories.map(category => {
          const info = getCategoryInfo(category.name);
          return (
            <Link 
              key={category._id} 
              to={`/category/${category.slug}`}
              className="category-card"
            >
              <span className="material-symbols-outlined category-icon">
                {info.icon}
              </span>
              <h2>{category.name}</h2>
              <p>{info.description}</p>
              {category.postCount !== undefined && (
                <span className="post-count">{category.postCount} posts</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
    </>
  );
}
