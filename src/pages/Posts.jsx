import { useEffect, useState } from "react";
import { fetchPublicPosts } from "../api/post";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const POSTS_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPublicPosts("?status=published")
      .then(data => {
        setPosts(data.posts || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  if (loading) return <p style={{ textAlign: "center", padding: "40px" }}>Loading posts…</p>;
  if (error) return <p style={{ textAlign: "center", padding: "40px", color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ 
        fontSize: "2.5rem", 
        marginBottom: "30px", 
        textAlign: "center",
        color: "var(--foreground)"
      }}>
        All Posts
      </h1>

      {paginatedPosts.length > 0 ? (
        <>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
            gap: "24px",
            marginBottom: "40px"
          }}>
            {paginatedPosts.map(post => (
              <Link 
                to={`/posts/${post.slug}`} 
                key={post._id} 
                style={{ 
                  textDecoration: "none",
                  color: "inherit"
                }}
              >
                <article style={{
                  background: "var(--card-background)",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column"
                }}>
                  <div style={{ height: "200px", overflow: "hidden" }}>
                    {post.featuredImage ? (
                      <img 
                        src={post.featuredImage} 
                        alt={post.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ 
                        width: "100%", 
                        height: "100%", 
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "3rem"
                      }}>
                        📝
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      marginBottom: "12px",
                      fontSize: "0.85rem",
                      color: "var(--foreground-muted)"
                    }}>
                      <span style={{ 
                        background: "var(--primary-color)", 
                        color: "white",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "0.75rem"
                      }}>
                        {post.category?.name || 'Uncategorized'}
                      </span>
                      <span>
                        {new Date(post.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    <h2 style={{ 
                      fontSize: "1.25rem", 
                      marginBottom: "12px",
                      lineHeight: 1.4
                    }}>
                      {post.title}
                    </h2>
                    <p style={{ 
                      color: "var(--foreground-muted)", 
                      fontSize: "0.9rem",
                      lineHeight: 1.6,
                      flex: 1
                    }}>
                      {post.content?.substring(0, 120)}...
                    </p>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      marginTop: "16px",
                      paddingTop: "16px",
                      borderTop: "1px solid var(--border-color)"
                    }}>
                      <span style={{ fontSize: "0.85rem", color: "var(--foreground-muted)" }}>
                        {post.author?.name || 'AE Hobs'}
                      </span>
                      <span style={{ 
                        color: "var(--primary-color)", 
                        fontWeight: "600",
                        fontSize: "0.9rem"
                      }}>
                        Read More →
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              gap: "8px",
              marginTop: "40px"
            }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "10px 20px",
                  border: "1px solid var(--border-color)",
                  background: "var(--background)",
                  color: "var(--foreground)",
                  borderRadius: "8px",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    padding: "10px 16px",
                    border: "1px solid var(--border-color)",
                    background: currentPage === page ? "var(--primary-color)" : "var(--background)",
                    color: currentPage === page ? "white" : "var(--foreground)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: currentPage === page ? "600" : "400"
                  }}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: "10px 20px",
                  border: "1px solid var(--border-color)",
                  background: "var(--background)",
                  color: "var(--foreground)",
                  borderRadius: "8px",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  opacity: currentPage === totalPages ? 0.5 : 1
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: "1.2rem", color: "var(--foreground-muted)" }}>
            No posts available yet.
          </p>
          <p style={{ color: "var(--foreground-muted)", marginTop: "10px" }}>
            Check back soon for new content!
          </p>
        </div>
      )}
    </div>
  );
}
