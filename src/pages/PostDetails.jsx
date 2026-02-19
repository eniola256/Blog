import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPublicPostBySlug, toggleLikePost } from "../api/post.js";
import { fetchComments, createComment, deleteComment, toggleLikeComment } from "../api/comment.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import "./PostDetails.css";

export default function PostDetails() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [postLikes, setPostLikes] = useState({ count: 0, hasLiked: false });
  const [likingPost, setLikingPost] = useState(false);

  useEffect(() => {
    loadPost();
  }, [slug]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const data = await fetchPublicPostBySlug(slug);
      setPost(data.post);
      
      // Set post likes info
      const likesArray = data.post?.likes || [];
      setPostLikes({
        count: likesArray.length,
        hasLiked: isAuthenticated && likesArray.some(like => 
          like === user?._id || like?._id === user?._id
        )
      });
      
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

  // Handle post like
  const handleLikePost = async () => {
    if (!isAuthenticated) {
      alert("Please login to like this post");
      return;
    }
    
    try {
      setLikingPost(true);
      const result = await toggleLikePost(post._id);
      setPostLikes({
        count: result.likesCount,
        hasLiked: result.hasLiked
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setLikingPost(false);
    }
  };

  // Handle comment like
  const handleLikeComment = async (commentId) => {
    if (!isAuthenticated) {
      alert("Please login to like comments");
      return;
    }
    
    try {
      const result = await toggleLikeComment(commentId);
      // Update the comment in the list
      setComments(comments.map(c => {
        if ((c._id || c.id) === commentId) {
          return {
            ...c,
            likes: result.hasLiked 
              ? [...(c.likes || []), user._id]
              : (c.likes || []).filter(l => l !== user._id && l?._id !== user._id),
            likesCount: result.likesCount
          };
        }
        return c;
      }));
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

  if (loading) return <div className="post-loading">Loading post…</div>;
  if (error) return <div className="post-error">{error}</div>;
  if (!post) return <div className="post-error">Post not found</div>;

  return (
    <div className="post-details-page">
      {/* Hero Section */}
      <div className="post-hero">
        {post.featuredImage && (
          <img src={post.featuredImage} alt={post.title} className="post-hero-image" />
        )}
        <div className="post-hero-overlay"></div>
        <div className="post-hero-content">
          {post.category && (
            <Link to={`/category/${post.category.slug}`} className="post-category-badge">
              {post.category.name}
            </Link>
          )}
          <h1>{post.title}</h1>
          <div className="post-meta">
            <span className="post-author">
              <img 
                src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.name || 'Author'}&background=667eea&color=fff`}
                alt={post.author?.name}
                className="author-avatar"
              />
              {post.author?.name || "Unknown Author"}
            </span>
            <span className="post-date">{formatDate(post.createdAt)}</span>
            <span className="post-read-time">{getReadTime(post.content)}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="post-container">
        <div className="post-main">
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
          <div className="post-content">
            {post.content}
          </div>

          {/* Post Actions - Like & Share */}
          <div className="post-actions-bar">
            <button 
              className={`like-button ${postLikes.hasLiked ? 'liked' : ''}`}
              onClick={handleLikePost}
              disabled={likingPost}
            >
              <span className="heart-icon">{postLikes.hasLiked ? '❤️' : '🤍'}</span>
              <span>{postLikes.count} {postLikes.count === 1 ? 'Like' : 'Likes'}</span>
            </button>
          </div>

          {/* Share Section */}
          <div className="post-share">
            <h4>Share this article</h4>
            <div className="share-buttons">
              <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${post.title}&url=${window.location.href}`, '_blank')}>
                𝕏 Twitter
              </button>
              <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}>
                Facebook
              </button>
              <button onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${window.location.href}&title=${post.title}`, '_blank')}>
                LinkedIn
              </button>
              <button onClick={() => navigator.clipboard.writeText(window.location.href).then(() => alert('Link copied!'))}>
                Copy Link
              </button>
            </div>
          </div>

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
                        {/* Like button for comments */}
                        <button 
                          className={`comment-like-btn ${comment.likes?.some(l => l === user?._id || l?._id === user?._id) ? 'liked' : ''}`}
                          onClick={() => handleLikeComment(comment._id || comment.id)}
                        >
                          <span>{comment.likes?.some(l => l === user?._id || l?._id === user?._id) ? '❤️' : '🤍'}</span>
                          <span>{comment.likes?.length || comment.likesCount || 0}</span>
                        </button>
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

        {/* Sidebar */}
        <aside className="post-sidebar">
          {/* Author Card */}
          <div className="sidebar-card author-card">
            <img 
              src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.name || 'Author'}&background=667eea&color=fff&size=80`}
              alt={post.author?.name}
              className="author-avatar-large"
            />
            <h4>{post.author?.name || "Unknown Author"}</h4>
            <p className="author-bio">{post.author?.bio || "Content creator at AE Tech Blog"}</p>
          </div>

          {/* Related Posts Placeholder */}
          <div className="sidebar-card">
            <h4>Related Posts</h4>
            <p className="sidebar-placeholder">Coming soon</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
