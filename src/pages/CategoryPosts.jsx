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
        // Then fetch posts using category slug
        return fetchPostsByCategory(data.category.slug);
      })
      .then(data => setPosts(data.posts || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  // Helper function to calculate read time
  const calculateReadTime = (content) => {
    if (!content) return "1 min read";
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  };

  // Get category icon based on name
  const getCategoryIcon = (name) => {
    const nameLower = name?.toLowerCase() || "";
    const iconMap = {
      gaming: "sports_esports",
      technology: "devices",
      smartphones: "smartphone",
      computers: "computer",
      software: "code",
      ai: "psychology",
      cybersecurity: "security",
      reviews: "rate_review",
      tutorials: "school",
      news: "newspaper",
      opinion: "forum",
    };
    
    for (const key of Object.keys(iconMap)) {
      if (nameLower.includes(key)) return iconMap[key];
    }
    return "category";
  };

  if (loading) return <div className="loading-state">Loading posts...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;
  if (!category) return <div className="not-found-state">Category not found</div>;

  return (
    <>
    <div className="Category-Main">
      <div className="C-main"> 
        <div className="c-main-heading">
          <div className="c-main-head">
            <div className="icon">
              <span className="material-symbols-outlined">
                {getCategoryIcon(category.name)}
              </span> 
            </div>
            <h2 className="c-head"><span>Category</span>{category.name}</h2>
        </div>
        <div className="c-main-p">
          <p className="cmp-t">{category.description || `Explore the latest content in ${category.name}. Find articles, tutorials, and insights on this topic.`}</p>
          <p className="cmp-b">{posts.length} {posts.length === 1 ? 'post' : 'posts'}</p>
        </div>
      </div>
      </div>
    </div>
    
    {posts.length === 0 ? (
      <div className="no-posts-message">
        <span className="material-symbols-outlined">article</span>
        <h3>No posts yet</h3>
        <p>There are no posts in this category. Check back soon!</p>
      </div>
    ) : (
      <div className="posts-grid">
        {posts.map(post => (
          <Link
            key={post._id}
            to={`/posts/${post.slug}`}
            className="post-card"
          >
            <div className="post-image">
              <img 
                src={post.featuredImage || post.image || "/Lt.jpg"} 
                alt={post.title} 
              />
            </div>

            <div className="post-content">
              <div className="post-tags">
                {post.tags && post.tags.length > 0 ? (
                  post.tags.slice(0, 3).map((tag, index) => (
                    <p key={index}>{tag.name || tag}</p>
                  ))
                ) : (
                  <p>{category.name}</p>
                )}
              </div>

              <h3 className="post-title">{post.title}</h3>

              <p className="post-excerpt">
                {post.excerpt || ""}
              </p>

              <div className="post-meta">
                <span className="author">{post.author?.name || post.author?.username || 'Unknown'}</span>
                <span className="date">{formatDate(post.createdAt || post.publishedAt)}</span>
                <span className="read-time">{post.readTime || calculateReadTime(post.content)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    )}
    </>
  );
}
