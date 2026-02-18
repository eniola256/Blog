import { useState, useEffect } from "react";
import Icon from "../../components/Icon";
import { fetchAdminTags, createTag, deleteTag } from "../../api/tag";
import "../../pages/AdminDashboard.css";

export default function AdminTags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Load tags
  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminTags();
      setTags(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;

    try {
      setSaving(true);
      await createTag({ name: newTag.trim() });
      setNewTag("");
      await loadTags();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTag = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tag?")) {
      return;
    }

    try {
      setDeleting(id);
      await deleteTag(id);
      setTags(tags.filter((tag) => (tag._id || tag) !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <Icon name="hourglass_empty" size={32} />
        <p>Loading tags...</p>
      </div>
    );
  }

  return (
    <div className="admin-tags-page">
      {error && (
        <div className="admin-alert admin-alert-error">
          <Icon name="error" size={18} />
          {error}
        </div>
      )}

      <div className="admin-page-header">
        <h2>Tags</h2>
      </div>

      <div className="admin-card" style={{ marginBottom: "20px" }}>
        <div className="admin-card-body">
          <form onSubmit={handleAddTag}>
            <div className="admin-tags-input" style={{ minHeight: "48px" }}>
              <input
                type="text"
                placeholder="Add a new tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                style={{ flex: 1, minWidth: "200px" }}
              />
              <button 
                type="submit" 
                className="admin-btn admin-btn-primary"
                disabled={saving}
              >
                <Icon name="add" size={18} />
                {saving ? "Adding..." : "Add Tag"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-body">
          {tags.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              {tags.map((tag) => (
                <div 
                  key={tag._id || tag} 
                  className="admin-tag-chip" 
                  style={{ padding: "8px 16px", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span>
                    {tag.name}
                    <span style={{ color: "var(--admin-text-muted)", marginLeft: "6px" }}>
                      ({tag.postCount || tag.posts?.length || 0})
                    </span>
                  </span>
                  <button 
                    type="button" 
                    className="admin-tag-remove" 
                    onClick={() => handleDeleteTag(tag._id || tag)}
                    disabled={deleting === (tag._id || tag)}
                    style={{ width: "20px", height: "20px" }}
                  >
                    <Icon name="close" size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-empty">
              <Icon name="sell" size={48} className="admin-empty-icon" />
              <h4 className="admin-empty-title">No tags yet</h4>
              <p className="admin-empty-text">Create your first tag to label your posts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
