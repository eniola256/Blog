import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "../../components/Icon";
import RichTextEditor from "../../components/RichTextEditor";
import SeoCheckerCard from "../../components/SeoCheckerCard";
import { fetchAdminCategories } from "../../api/category";
import { fetchAdminTags as fetchTagsList } from "../../api/tag";
import { createPost, updatePost, fetchAdminPostById, fetchDraftRevisionForPost } from "../../api/post";
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
  const [metaDescription, setMetaDescription] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [featuredImageFile, setFeaturedImageFile] = useState(null);

  // Data state
  const [categories, setCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [error, setError] = useState("");
  const [draftId, setDraftId] = useState(null);
  const [lastDraftSavedAt, setLastDraftSavedAt] = useState(null);
  const [isEditingPublished, setIsEditingPublished] = useState(false);
  const lastSavedFingerprintRef = useRef("");
  const pendingAutoSaveRef = useRef(false);
  const featuredImageFileRef = useRef(null);

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
          const loadedStatus = post.status || "draft";
          setStatus(loadedStatus);
          setIsEditingPublished(loadedStatus === "published");

          let sourcePost = post;
          if (loadedStatus === "published") {
            try {
              const revisionResponse = await fetchDraftRevisionForPost(post._id || id);
              const revision = revisionResponse?.posts?.[0];
              if (revision) {
                sourcePost = revision;
              }
            } catch (revisionError) {
              // Ignore revision fetch errors and fall back to the published post.
            }
          }

          const normalizedCategory = sourcePost.category?._id || sourcePost.category || "";
          const normalizedTags = sourcePost.tags?.map(t => t._id || t) || [];

          setDraftId(sourcePost.status === "draft" ? (sourcePost._id || id) : null);
          setTitle(sourcePost.title);
          setContent(sourcePost.content);
          setCategory(normalizedCategory);
          setTags(normalizedTags);
          setMetaDescription(sourcePost.metaDescription || "");
          setFocusKeyword(sourcePost.focusKeyword || "");
          setFeaturedImage(sourcePost.featuredImage || null);

          lastSavedFingerprintRef.current = buildDraftFingerprint({
            draftTitle: sourcePost.title || "",
            draftContent: sourcePost.content || "",
            draftCategory: normalizedCategory,
            draftTags: normalizedTags,
            draftMetaDescription: sourcePost.metaDescription || "",
            draftFocusKeyword: sourcePost.focusKeyword || "",
            draftFeaturedImage: sourcePost.featuredImage || null,
          });
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

  const stripHtml = (html = "") => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const isUploadableFile = (value) => {
    if (!value || typeof value !== "object") return false;
    const hasType = typeof value.type === "string";
    const hasSize = typeof value.size === "number";
    const hasSlice = typeof value.slice === "function";
    const hasArrayBuffer = typeof value.arrayBuffer === "function";
    return hasType && hasSize && (hasSlice || hasArrayBuffer);
  };

  const normalizeFeaturedImageUrl = (value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) return null;
    return trimmed;
  };

  const getFeaturedImageKey = (image) => {
    if (!image) return "";
    if (isUploadableFile(image)) {
      const name = typeof image.name === "string" ? image.name : "upload";
      const lastModified = typeof image.lastModified === "number" ? image.lastModified : "";
      return `${name}:${image.size}:${lastModified}`;
    }
    return String(image);
  };

  const buildDraftFingerprint = ({
    draftTitle = title,
    draftContent = content,
    draftCategory = category,
    draftTags = tags,
    draftMetaDescription = metaDescription,
    draftFocusKeyword = focusKeyword,
    draftFeaturedImage = featuredImageFile || featuredImage,
  } = {}) =>
    JSON.stringify({
      title: (draftTitle || "").trim(),
      content: (draftContent || "").trim(),
      contentText: stripHtml(draftContent || ""),
      category: draftCategory || "",
      tags: (draftTags || []).map((tag) => String(tag)).sort(),
      metaDescription: (draftMetaDescription || "").trim(),
      focusKeyword: (draftFocusKeyword || "").trim(),
      featuredImageKey: getFeaturedImageKey(draftFeaturedImage),
    });

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
      featuredImageFileRef.current = file;
      const imageUrl = URL.createObjectURL(file);
      setFeaturedImage(imageUrl);
      setFeaturedImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    if (typeof featuredImage === "string" && featuredImage.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(featuredImage);
      } catch (_revokeError) {
        // Ignore revoke errors.
      }
    }
    setFeaturedImage(null);
    setFeaturedImageFile(null);
    featuredImageFileRef.current = null;
  };

  const savePost = async ({ targetStatus, redirect = false, silent = false, auto = false } = {}) => {
    if (saving || autoSaving) {
      if (auto) {
        pendingAutoSaveRef.current = true;
      }
      return;
    }

    const nextStatus = targetStatus || status;
    const keepPublished =
      isEditing && isEditingPublished && status === "published" && nextStatus === "draft" && auto;
    const plainContent = stripHtml(content);

    if (nextStatus === "published") {
      if (!title.trim()) {
        setError("Title is required to publish.");
        return;
      }
      if (!plainContent) {
        setError("Content is required to publish.");
        return;
      }
      if (!category) {
        setError("Category is required to publish.");
        return;
      }
    }

    if (!silent) {
      setError("");
    }

    if (auto) {
      setAutoSaving(true);
    } else {
      setSaving(true);
    }

    try {
      const hasTitle = Boolean(title.trim());
      const safeTitle = hasTitle ? title.trim() : "Untitled Draft";
      const generatedSlug = hasTitle ? generateSlug(safeTitle) : `untitled-draft-${Date.now()}`;
      const imageFileCandidate = featuredImageFileRef.current || featuredImageFile;
      const imageFile = isUploadableFile(imageFileCandidate) ? imageFileCandidate : null;
      const safeFeaturedImageUrl = imageFile ? null : normalizeFeaturedImageUrl(featuredImage);
      const postData = {
        title: safeTitle,
        slug: generatedSlug,
        content,
        category,
        tags,
        status: nextStatus,
        targetStatus: nextStatus,
        metaDescription: metaDescription.trim(),
        focusKeyword: focusKeyword.trim(),
        featuredImage: imageFile ? undefined : safeFeaturedImageUrl,
        auto,
        silent,
        keepPublished,
        revisionId: keepPublished ? draftId : undefined,
      };

      const postId = id || draftId;

      let response;
      if (postId) {
        response = await updatePost(postId, postData, imageFile);
      } else {
        response = await createPost(postData, imageFile);
      }

      const responsePost = response?.post || response?.data || response;
      const createdId = responsePost?._id || response?._id || response?.id;
      const isRevision = Boolean(response?.isRevision || responsePost?.revisionOf);
      if (createdId && (!postId || keepPublished || isRevision)) {
        setDraftId(createdId);
      }

      if (!keepPublished) {
        setStatus(nextStatus);
      }

      const responseHasFeaturedImageField =
        responsePost && Object.prototype.hasOwnProperty.call(responsePost, "featuredImage");
      if (!silent && imageFile && responseHasFeaturedImageField && !responsePost.featuredImage) {
        setError(
          "Post saved, but the server returned no featured image URL. The image upload likely failed on the backend."
        );
        return;
      }

      if (nextStatus === "draft") {
        lastSavedFingerprintRef.current = buildDraftFingerprint();
        setLastDraftSavedAt(Date.now());
      }

      if (redirect) {
        navigate("/admin/posts");
      }
    } catch (err) {
      if (!silent) {
        setError(err.message);
      }
    } finally {
      if (auto) {
        setAutoSaving(false);
      } else {
        setSaving(false);
      }
      if (pendingAutoSaveRef.current) {
        pendingAutoSaveRef.current = false;
        const currentFingerprint = buildDraftFingerprint();
        if (currentFingerprint !== lastSavedFingerprintRef.current) {
          savePost({ targetStatus: "draft", redirect: false, silent: true, auto: true });
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await savePost({ targetStatus: status, redirect: status === "published" });
  };

  const handleSaveDraft = async () => {
    await savePost({ targetStatus: "draft", redirect: false });
  };

  const handlePublish = async () => {
    await savePost({ targetStatus: "published", redirect: true });
  };

  const slug = generateSlug(title);

  useEffect(() => {
    if (loading) return;

    const hasAnyInput =
      Boolean(title.trim()) ||
      Boolean(stripHtml(content)) ||
      Boolean(category) ||
      tags.length > 0 ||
      Boolean(metaDescription.trim()) ||
      Boolean(focusKeyword.trim()) ||
      Boolean(featuredImageFile) ||
      Boolean(featuredImage);

    if (!hasAnyInput) return;

    const currentFingerprint = buildDraftFingerprint();
    if (currentFingerprint === lastSavedFingerprintRef.current) return;

    const timer = setTimeout(() => {
      savePost({ targetStatus: "draft", redirect: false, silent: true, auto: true });
    }, 1800);

    return () => clearTimeout(timer);
  }, [loading, title, content, category, tags, metaDescription, focusKeyword, featuredImageFile, featuredImage]);

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
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Slug</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="post-url-slug"
                    value={slug}
                    readOnly
                    style={{ backgroundColor: "var(--background)", opacity: 0.7 }}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Content</label>
                  <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Write your content here..."
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
                    disabled={saving || autoSaving}
                    style={{ flex: 1 }}
                  >
                    {saving ? "Saving..." : "Save Draft"}
                  </button>
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-primary" 
                    onClick={handlePublish}
                    disabled={saving || autoSaving}
                    style={{ flex: 1 }}
                  >
                    <Icon name="publish" size={18} />
                    Publish
                  </button>
                </div>
                <p style={{ fontSize: "11px", color: "var(--foreground-muted)", marginTop: "8px" }}>
                  {autoSaving
                    ? "Auto-saving draft..."
                    : lastDraftSavedAt
                    ? `Draft saved at ${new Date(lastDraftSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                    : "Draft auto-save is on."}
                </p>
              </div>
            </div>

            <SeoCheckerCard
              variant="admin"
              title={title}
              slug={slug}
              content={content}
              metaDescription={metaDescription}
              setMetaDescription={setMetaDescription}
              focusKeyword={focusKeyword}
              setFocusKeyword={setFocusKeyword}
            />

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
