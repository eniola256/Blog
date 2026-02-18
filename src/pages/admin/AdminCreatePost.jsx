import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "../../components/Icon";
import { fetchAdminCategories } from "../../api/category";
import { fetchAdminTags as fetchTagsList } from "../../api/tag";
import { createPost, updatePost, fetchAdminPostById } from "../../api/post";
import "../../pages/AdminDashboard.css";

export default function AdminCreatePost() {
  const { id } = useParams();
  const navigate = useNavigate();
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
    async function loadData() {
      try {
        const [cats, tgs] = await Promise.all([
          fetchAdminCategories(),
          fetchTagsList()
        ]);
        setCategories(cats);
        setAvailableTags(tgs);

        // If editing, load the post
        if (isEditing) {
          const post = await fetchAdminPostById(id);
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
    }
    loadData();
  }, [id, isEditing]);

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
      
      // Check if tag already exists in available tags
      const existingTag = availableTags.find(
        t => t.name.toLowerCase() === tagName
      );
      
      if (existingTag) {
        // Add existing tag ID
        const tagId = existingTag._id || existingTag;
        if (!tags.includes(tagId)) {
          setTags([...tags, tagId]);
        }
      } else {
        // For new tags, we'll add them as a temporary tag name
        // The backend will handle creating new tags
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

      // Pass the actual file if it's a new upload
      const imageFile = featuredImageFile instanceof File ? featuredImageFile : null;

      if (isEditing) {
        await updatePost(id, postData, imageFile);
      } else {
        await createPost(postData, imageFile);
      }

      // Redirect to posts list
      navigate("/admin/posts");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    setStatus("draft");
    // Trigger form submit
    const form = document.querySelector(".admin-create-post form");
    if (form) {
      form.dispatchEvent(new Event("submit", { bubbles: true }));
    }
  };

  const handlePublish = async () => {
    setStatus("published");
    const form = document.querySelector(".admin-create-post form");
    if (form) {
      form.dispatchEvent(new Event("submit", { bubbles: true }));
    }
  };

  // Get category name for display
  const getCategoryName = (catId) => {
    const cat = categories.find(c => (c._id || c) === catId);
    return cat?.name || catId;
  };

  // Get tag name for display
  const getTagName = (tagId) => {
    const tag = availableTags.find(t => (t._id || t) === tagId);
    return tag?.name || tagId;
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <Icon name="hourglass_empty" size={32} />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-create-post">
      {error && (
        <div className="admin-alert admin-alert-error">
          <Icon name="error" size={18} />
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="admin-two-col">
          {/* Main Content */}
          <div className="admin-editor-main">
            <div className="admin-card">
              <div className="admin-card-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Title</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="Enter post title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Slug</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="post-url-slug"
                    value={generateSlug(title)}
                    readOnly
                    style={{ backgroundColor: "var(--background)", opacity: 0.7 }}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Content</label>
                  <textarea
                    className="admin-form-textarea"
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
          <div className="admin-editor-sidebar">
            {/* Publish Card */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">Publish</h3>
              </div>
              <div className="admin-card-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Status</label>
                  <div className="admin-status-buttons">
                    <button
                      type="button"
                      className={`admin-status-btn ${status === "draft" ? "active" : ""}`}
                      onClick={() => setStatus("draft")}
                    >
                      <Icon name="edit_note" size={18} />
                      Draft
                    </button>
                    <button
                      type="button"
                      className={`admin-status-btn ${status === "published" ? "active" : ""}`}
                      onClick={() => setStatus("published")}
                    >
                      <Icon name="public" size={18} />
                      Published
                    </button>
                  </div>
                </div>
                <div className="admin-form-actions">
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-secondary" 
                    onClick={handleSaveDraft}
                    disabled={saving}
                    style={{ flex: 1 }}
                  >
                    {saving ? "Saving..." : "Save Draft"}
                  </button>
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-primary" 
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
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">Featured Image</h3>
              </div>
              <div className="admin-card-body">
                {featuredImage ? (
                  <div className="admin-featured-image-preview">
                    <img src={featuredImage} alt="Featured" />
                    <button type="button" className="admin-remove-image" onClick={handleRemoveImage}>
                      <Icon name="close" size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="admin-upload-area">
                    <Icon name="add_photo_alternate" size={40} />
                    <p>Click to upload an image</p>
                    <span>or drag and drop</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="admin-file-input"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Category Card */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">Category</h3>
              </div>
              <div className="admin-card-body">
                <div className="admin-form-group">
                  <select
                    className="admin-form-select"
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
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">Tags</h3>
              </div>
              <div className="admin-card-body">
                <div className="admin-tags-input">
                  {tags.map((tag) => (
                    <span key={tag} className="admin-tag-chip">
                      {getTagName(tag)}
                      <button type="button" className="admin-tag-remove" onClick={() => handleRemoveTag(tag)}>
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
                            className="admin-tag-chip admin-tag-suggestion"
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
