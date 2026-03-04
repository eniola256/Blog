import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPublicPostBySlug, fetchPublicPosts } from "../api/post.js";
import { fetchComments, createComment, deleteComment } from "../api/comment.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import "./PostDetails.css";

export default function PostDetails() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState("");
  const tocListRef = useRef(null);
  const [tocIndicator, setTocIndicator] = useState({ top: 0, height: 0, visible: false });

  useEffect(() => {
    loadPost();
    window.scrollTo(0, 0);
  }, [slug]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const data = await fetchPublicPostBySlug(slug);
      setPost(data.post);
      
      // Load related posts (by category)
      if (data.post?.category?._id || data.post?.category) {
        try {
          const categoryId = data.post.category._id || data.post.category;
          const relatedData = await fetchPublicPosts(`?category=${categoryId}&limit=4&exclude=${data.post._id}`);
          const posts = relatedData.posts || relatedData.data || [];
          setRelatedPosts(posts.slice(0, 3));
        } catch (relatedErr) {
          console.log("Could not load related posts:", relatedErr);
          setRelatedPosts([]);
        }
      }
      
      // Load comments if post exists
      if (data.post?._id) {
        try {
          const commentsData = await fetchComments(data.post._id);
          const commentsArray = Array.isArray(commentsData) 
            ? commentsData 
            : (commentsData.comments || commentsData.data || []);
          setComments(commentsArray);
        } catch (commentErr) {
          console.log("Could not load comments:", commentErr);
          setComments([]);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    try {
      setSubmitting(true);
      const commentData = { content: newComment.trim() };
      const result = await createComment(post._id, commentData);
      
      // Add the new comment to the list
      const newCommentObj = result.comment || result;
      setComments([newCommentObj, ...comments]);
      setNewComment("");
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      await deleteComment(commentId);
      setComments(comments.filter(c => (c._id || c.id) !== commentId));
    } catch (err) {
      alert(err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getReadTime = (content) => {
    if (!content) return "1 min read";
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  // Generate table of contents and inject heading ids into the rendered HTML.
  const { tableOfContents, contentWithIds } = useMemo(() => {
    if (!post?.content) return { tableOfContents: [], contentWithIds: "" };

    const parser = new DOMParser();
    const doc = parser.parseFromString(post.content, "text/html");
    const headings = doc.querySelectorAll("h2, h3");
    const toc = [];
    const usedIds = new Set();

    headings.forEach((heading) => {
      const level = Number(heading.tagName.replace("H", ""));
      const text = (heading.textContent || "").trim();

      if (!text) return;

      const baseId = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      if (!baseId) return;

      let uniqueId = baseId;
      let counter = 2;
      while (usedIds.has(uniqueId)) {
        uniqueId = `${baseId}-${counter}`;
        counter += 1;
      }

      usedIds.add(uniqueId);
      heading.id = uniqueId;
      toc.push({ level, text, id: uniqueId });
    });

    return { tableOfContents: toc, contentWithIds: doc.body.innerHTML };
  }, [post?.content]);

  const showTOC = tableOfContents.length > 0;

  useEffect(() => {
    if (!showTOC) {
      setActiveHeadingId("");
      return;
    }

    const headingElements = tableOfContents
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);
    if (headingElements.length === 0) return;

    const activationOffset = 140;

    const updateActiveHeading = () => {
      let currentId = headingElements[0].id;
      for (const heading of headingElements) {
        if (window.scrollY + activationOffset >= heading.offsetTop) {
          currentId = heading.id;
        } else {
          break;
        }
      }
      setActiveHeadingId((prev) => (prev === currentId ? prev : currentId));
    };

    updateActiveHeading();
    window.addEventListener("scroll", updateActiveHeading, { passive: true });
    window.addEventListener("resize", updateActiveHeading);

    return () => {
      window.removeEventListener("scroll", updateActiveHeading);
      window.removeEventListener("resize", updateActiveHeading);
    };
  }, [showTOC, tableOfContents]);

  useEffect(() => {
    if (!showTOC) return;

    tableOfContents.forEach((item) => {
      const heading = document.getElementById(item.id);
      if (!heading) return;
      heading.classList.toggle("active-heading", item.id === activeHeadingId);
    });
  }, [activeHeadingId, showTOC, tableOfContents]);

  useEffect(() => {
    const updateIndicator = () => {
      if (!showTOC || !tocListRef.current) {
        setTocIndicator((prev) => ({ ...prev, visible: false }));
        return;
      }

      const activeLink = tocListRef.current.querySelector("a.active");
      if (!activeLink) {
        setTocIndicator((prev) => ({ ...prev, visible: false }));
        return;
      }

      const top = activeLink.offsetTop + 2;
      const height = Math.max(activeLink.offsetHeight - 4, 12);
      setTocIndicator({ top, height, visible: true });
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeHeadingId, showTOC, tableOfContents]);

  const handleTOCClick = (event, id) => {
    event.preventDefault();
    const heading = document.getElementById(id);
    if (!heading) {
      window.location.hash = id;
      return;
    }

    const headerOffset = 110;
    const headingTop = heading.getBoundingClientRect().top + window.scrollY;
    const targetTop = Math.max(headingTop - headerOffset, 0);

    setActiveHeadingId(id);
    window.scrollTo({ top: targetTop, behavior: "smooth" });
    window.history.replaceState(null, "", `#${id}`);
  };

  // Copy link handler
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('Link copied!');
    });
  };

  if (loading) return <div className="post-loading">Loading post…</div>;
  if (error) return <div className="post-error">{error}</div>;
  if (!post) return <div className="post-error">Post not found</div>;

  return (
    <div className="post-details-page">
      {/* Post Header - Above the Image */}
      <header className="post-header">
        <div className="post-header-content">
          {post.category && (
            <Link to={`/category/${post.category.slug}`} className="post-category-badge">
              {post.category.name}
            </Link>
          )}
          <h1>{post.title}</h1>
          <div className="post-meta">
            <div className="post-author-info">
              <img 
                src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.name || 'Author'}&background=667eea&color=fff`}
                alt={post.author?.name}
                className="author-avatar"
              />
              <span className="author-name">{post.author?.name || "Unknown Author"}</span>
            </div>
            <span className="post-dot">•</span>
            <span className="post-date">{formatDate(post.createdAt)}</span>
            <span className="post-dot">•</span>
            <span className="post-read-time">{getReadTime(post.content)}</span>
          </div>
        </div>
      </header>

      {/* Featured Image - Below the Header */}
      <div className="post-featured-image-container">
        {post.featuredImage && (
          <img src={post.featuredImage} alt={post.title} className="post-featured-image" />
        )}
      </div>

      {/* Main Content with Sidebar */}
      <div className="post-container">
        {/* Table of Contents Sidebar (Left) */}
        <aside className="post-toc-sidebar">
          <div className="toc-sticky">
            <h4>Table of Contents</h4>
            {showTOC ? (
              <ul
                ref={tocListRef}
                style={{
                  "--toc-indicator-top": `${tocIndicator.top}px`,
                  "--toc-indicator-height": `${tocIndicator.height}px`,
                  "--toc-indicator-opacity": tocIndicator.visible ? "1" : "0",
                }}
              >
                {tableOfContents.map((item, index) => (
                  <li key={index} className={`toc-level-${item.level}`}>
                    <a
                      href={`#${item.id}`}
                      onClick={(event) => handleTOCClick(event, item.id)}
                      className={activeHeadingId === item.id ? "active" : ""}
                      aria-current={activeHeadingId === item.id ? "true" : undefined}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="toc-empty">No headings in this post yet.</p>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="post-main-wrapper">
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.map(tag => (
                <Link key={tag._id || tag} to={`/tag/${tag.slug || tag}`} className="post-tag">
                  #{tag.name || tag}
                </Link>
              ))}
            </div>
          )}

          {/* Content */}
          <article className="post-content-article">
            <div dangerouslySetInnerHTML={{ __html: contentWithIds }} />
          </article>

          {/* Author Bio Section */}
          <div className="post-author-bio">
            <img
              src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.name || 'Author'}&background=667eea&color=fff&size=100`}
              alt={post.author?.name}
              className="author-bio-avatar"
            />
            <div className="author-bio-content">
              <span className="author-bio-label">Written by</span>
              <h4>{post.author?.name || "Unknown Author"}</h4>
              <p className="author-bio-text">{post.author?.bio || "Content creator at AE Tech Blog"}</p>
              {post.author?.socialLinks && (
                <div className="author-social-links">
                  {post.author.socialLinks.twitter && (
                    <a href={post.author.socialLinks.twitter} target="_blank" rel="noopener noreferrer" title="Twitter">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                  )}
                  {post.author.socialLinks.linkedin && (
                    <a href={post.author.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </a>
                  )}
                  {post.author.socialLinks.github && (
                    <a href={post.author.socialLinks.github} target="_blank" rel="noopener noreferrer" title="GitHub">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    </a>
                  )}
                  {post.author.socialLinks.website && (
                    <a href={post.author.socialLinks.website} target="_blank" rel="noopener noreferrer" title="Website">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Related Posts Section */}
          {relatedPosts.length > 0 && (
            <section className="related-posts-section">
              <h3>Related Articles</h3>
              <div className="related-posts-grid">
                {relatedPosts.map(relatedPost => (
                  <Link key={relatedPost._id} to={`/post/${relatedPost.slug}`} className="related-post-card">
                    {relatedPost.featuredImage && (
                      <img src={relatedPost.featuredImage} alt={relatedPost.title} className="related-post-image" />
                    )}
                    <div className="related-post-content">
                      <h4>{relatedPost.title}</h4>
                      <span className="related-post-date">{formatDate(relatedPost.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Comments Section */}
          <div className="post-comments">
            <h3>Comments ({comments.length})</h3>

            {/* Comment Form */}
            {isAuthenticated ? (
              <form onSubmit={handleSubmitComment} className="comment-form">
                <img 
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=667eea&color=fff`}
                  alt={user?.name}
                  className="comment-avatar"
                />
                <div className="comment-input-wrapper">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    rows="3"
                    required
                  />
                  <button type="submit" disabled={submitting || !newComment.trim()}>
                    {submitting ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="comment-login-prompt">
                <p>
                  <Link to="/login">Login</Link> to leave a comment
                </p>
              </div>
            )}

            {/* Comments List */}
            <div className="comments-list">
              {comments.length > 0 ? (
                comments.map(comment => (
                  <div key={comment._id || comment.id} className="comment-item">
                    <img 
                      src={comment.author?.avatar || `https://ui-avatars.com/api/?name=${comment.author?.name || 'User'}&background=667eea&color=fff`}
                      alt={comment.author?.name}
                      className="comment-avatar"
                    />
                    <div className="comment-content">
                      <div className="comment-header">
                        <span className="comment-author">{comment.author?.name || "Anonymous"}</span>
                        <span className="comment-date">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="comment-text">{comment.content}</p>
                      <div className="comment-actions">
                        {/* Show delete if user is comment owner OR admin */}
                        {isAuthenticated && (user?._id === comment.author?._id || user?.role === "admin") && (
                          <button 
                            className="comment-delete"
                            onClick={() => handleDeleteComment(comment._id || comment.id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-comments">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        </div>

        {/* Share Sidebar (Right) */}
        <aside className="post-share-floating">
          <div className="share-sticky">
            <h4>Share this article</h4>
            <button
              className="share-float-btn"
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}
              title="Share on Facebook"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </button>
            <button
              className="share-float-btn"
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${post.title}&url=${window.location.href}`, '_blank')}
              title="Share on X"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </button>
            <button
              className="share-float-btn"
              onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${window.location.href}&title=${post.title}`, '_blank')}
              title="Share on LinkedIn"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </button>
            <button
              className="share-float-btn"
              onClick={copyLink}
              title="Copy Link"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
