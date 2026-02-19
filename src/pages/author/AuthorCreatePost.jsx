import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "../../components/Icon";
import { fetchAdminCategories } from "../../api/category";
import { fetchAdminTags as fetchTagsList } from "../../api/tag";
import { createPost, updatePost, fetchAdminPostById } from "../../api/post";
import { useAuth } from "../../contexts/AuthContext";
import "./AuthorDashboard.css";

export default function AuthorCreatePost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(id);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState("draft");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [featuredImageFile, setFeaturedImageFile] = useState(null);

  // Data state
  const [categories, setCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [id, isEditing]);

  const loadData = async () => {
    try {
      const [cats, tgs] = await Promise.all([
        fetchAdminCategories(),
        fetchTagsList()
      ]);
      
      const categoriesArray = Array.isArray(cats) ? cats : (cats.categories || cats.data || []);
      const tagsArray = Array.isArray(tgs) ? tgs : (tgs.tags || tgs.data || []);
      
      setCategories(categoriesArray);
      setAvailableTags(tagsArray);

      // If editing, load the post
      if (isEditing) {
        const post = await fetchAdminPostById(id);
        
        // Verify this post belongs to the current author
        if (post.author?._id !== user?._id && post.author !== user?._id) {
          setError("You can only edit your own posts");
          setLoading(false);
          return;
        }
        
        setTitle(post.title);
        setContent(post.content);
        setCategory(post.category?._id || post.category || "");
        setTags(post.tags?.map(t => t._id || t) || []);
        setStatus(post.status || "draft");
        setFeaturedImage(post.featuredImage || null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate slug from title
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const tagName = tagInput.trim().toLowerCase();
      
      const existingTag = availableTags.find(
        t => t.name.toLowerCase() === tagName
      );
      
      if (existingTag) {
        const tagId = existingTag._id || existingTag;
        if (!tags.includes(tagId)) {
          setTags([...tags, tagId]);
        }
      } else {
        if (!tags.includes(tagName)) {
          setTags([...tags, tagName]);
        }
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFeaturedImage(imageUrl);
      setFeaturedImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setFeaturedImage(null);
    setFeaturedImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const postData = {
        title,
        slug: generateSlug(title),
        content,
        category,
        tags,
        status,
      };

      const imageFile = featuredImageFile instanceof File ? featuredImageFile : null;

      if (isEditing) {
        await updatePost(id, postData, imageFile);
      } else {
        await createPost(postData, imageFile);
      }

      navigate("/author/posts");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    setStatus("draft");
    const form = document.querySelector(".author-create-post form");
    if (form) {
      form.dispatchEvent(new Event("submit", { bubbles: true }));
    }
  };

  const handlePublish = async () => {
    setStatus("published");
    const form = document.querySelector(".author-create-post form");
    if (form) {
      form.dispatchEvent(new Event("submit", { bubbles: true }));
    }
  };

  const getCategoryName = (catId) => {
    const cat = categories.find(c => (c._id || c) === catId);
    return cat?.name || catId;
  };

  const getTagName = (tagId) => {
    const tag = availableTags.find(t => (t._id || t) === tagId);
    return tag?.name || tagId;
  };

  if (loading) {
    return (
      <div className="author-loading">
        <Icon name="hourglass_empty" size={32} />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="author-create-post">
      {error && (
        <div className="author-alert author-alert-error">
          <Icon name="error" size={18} />
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="author-two-col">
          {/* Main Content */}
          <div className="author-editor-main">
            <div className="author-card">
              <div className="author-card-body">
                <div className="author-form-group">
                  <label className="author-form-label">Title</label>
                  <input
                    type="text"
                    className="author-form-input"
                    placeholder="Enter post title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="author-form-group">
                  <label className="author-form-label">Slug</label>
                  <input
                    type="text"
                    className="author-form-input"
                    placeholder="post-url-slug"
                    value={generateSlug(title)}
                    readOnly
                    style={{ backgroundColor: "var(--background)", opacity: 0.7 }}
                  />
                </div>
                <div className="author-form-group">
                  <label className="author-form-label">Content</label>
                  <textarea
                    className="author-form-textarea"
                    placeholder="Write your content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    style={{ minHeight: "300px" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="author-editor-sidebar">
            {/* Publish Card */}
            <div className="author-card">
              <div className="author-card-header">
                <h3 className="author-card-title">Publish</h3>
              </div>
              <div className="author-card-body">
                <div className="author-form-group">
                  <label className="author-form-label">Status</label>
                  <div className="author-status-buttons">
                    <button
                      type="button"
                      className={`author-status-btn ${status === "draft" ? "active" : ""}`}
                      onClick={() => setStatus("draft")}
                    >
                      <Icon name="edit_note" size={18} />
                      Draft
                    </button>
                    <button
                      type="button"
                      className={`author-status-btn ${status === "published" ? "active" : ""}`}
                      onClick={() => setStatus("published")}
                    >
                      <Icon name="public" size={18} />
                      Published
                    </button>
                  </div>
                </div>
                <div className="author-form-actions">
                  <button 
                    type="button" 
                    className="author-btn author-btn-secondary" 
                    onClick={handleSaveDraft}
                    disabled={saving}
                    style={{ flex: 1 }}
                  >
                    {saving ? "Saving..." : "Save Draft"}
                  </button>
                  <button 
                    type="button" 
                    className="author-btn author-btn-primary" 
                    onClick={handlePublish}
                    disabled={saving}
                    style={{ flex: 1 }}
                  >
                    <Icon name="publish" size={18} />
                    Publish
                  </button>
                </div>
              </div>
            </div>

            {/* Featured Image Card */}
            <div className="author-card">
              <div className="author-card-header">
                <h3 className="author-card-title">Featured Image</h3>
              </div>
              <div className="author-card-body">
                {featuredImage ? (
                  <div className="author-featured-image-preview">
                    <img src={featuredImage} alt="Featured" />
                    <button type="button" className="author-remove-image" onClick={handleRemoveImage}>
                      <Icon name="close" size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="author-upload-area">
                    <Icon name="add_photo_alternate" size={40} />
                    <p>Click to upload an image</p>
                    <span>or drag and drop</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="author-file-input"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Category Card */}
            <div className="author-card">
              <div className="author-card-header">
                <h3 className="author-card-title">Category</h3>
              </div>
              <div className="author-card-body">
                <div className="author-form-group">
                  <select
                    className="author-form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">Select category...</option>
                    {categories.map((cat) => (
                      <option key={cat._id || cat} value={cat._id || cat}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tags Card */}
            <div className="author-card">
              <div className="author-card-header">
                <h3 className="author-card-title">Tags</h3>
              </div>
              <div className="author-card-body">
                <div className="author-tags-input">
                  {tags.map((tag) => (
                    <span key={tag} className="author-tag-chip">
                      {getTagName(tag)}
                      <button type="button" className="author-tag-remove" onClick={() => handleRemoveTag(tag)}>
                        <Icon name="close" size={14} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                </div>
                <p style={{ fontSize: "12px", color: "var(--foreground-muted)", marginTop: "8px" }}>
                  Press Enter to add a tag
                </p>
                {availableTags.length > 0 && (
                  <div style={{ marginTop: "12px" }}>
                    <p style={{ fontSize: "11px", color: "var(--foreground-muted)", marginBottom: "6px" }}>
                      Available tags:
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {availableTags
                        .filter(tag => !tags.includes(tag._id || tag))
                        .slice(0, 10)
                        .map((tag) => (
                          <button
                            key={tag._id || tag}
                            type="button"
                            className="author-tag-chip author-tag-suggestion"
                            onClick={() => setTags([...tags, tag._id || tag])}
                          >
                            {tag.name}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
