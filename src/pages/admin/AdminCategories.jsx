import { useState, useEffect } from "react";
import Icon from "../../components/Icon";
import { fetchAdminCategories, createCategory, deleteCategory, createCategoriesBatch } from "../../api/category";
import "../../pages/AdminDashboard.css";

// Default gaming/tech categories
const DEFAULT_CATEGORIES = [
  { name: "Gaming", slug: "gaming", description: "Video games, reviews, walkthroughs and gaming culture" },
  { name: "Mobile Gaming", slug: "mobile-gaming", description: "Mobile games, apps and smartphone gaming" },
  { name: "AI", slug: "ai", description: "Artificial intelligence, machine learning and automation" },
  { name: "Coding", slug: "coding", description: "Programming, development and software tutorials" },
  { name: "Technology", slug: "technology", description: "Latest tech news, gadgets and innovations" },
];

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [loadingDefaults, setLoadingDefaults] = useState(false);

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminCategories();
      // Handle different response formats and errors
      if (!data) {
        setCategories([]);
        return;
      }
      const categoriesArray = Array.isArray(data) ? data : (data.categories || data.data || []);
      setCategories(categoriesArray);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setError("Failed to load categories. Please try again.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
  e.preventDefault();
  if (!newCategory.trim()) return;

  try {
    setSaving(true);
    // Remove manual slug generation - let backend handle it
    await createCategory({ 
      name: newCategory.trim(),
      description: "" // Optional
    });
    setNewCategory("");
    setIsAdding(false);
    await loadCategories();
  } catch (err) {
    setError(err.message);
  } finally {
    setSaving(false);
  }
};

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      setDeleting(id);
      await deleteCategory(id);
      setCategories(categories.filter((cat) => (cat._id || cat) !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleAddDefaultCategories = async () => {
    try {
      setLoadingDefaults(true);
      // Try batch creation first, fallback to individual creation
      try {
        await createCategoriesBatch(DEFAULT_CATEGORIES);
      } catch (batchErr) {
        // Fallback: create each category individually
        for (const cat of DEFAULT_CATEGORIES) {
          try {
            await createCategory(cat);
          } catch (err) {
            // Category might already exist, continue
            console.log(`Category ${cat.name} might already exist`);
          }
        }
      }
      await loadCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDefaults(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <Icon name="hourglass_empty" size={32} />
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="admin-categories-page">
      {error && (
        <div className="admin-alert admin-alert-error">
          <Icon name="error" size={18} />
          {error}
        </div>
      )}
      
      <div className="admin-page-header">
        <h2>Categories</h2>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            className="admin-btn admin-btn-secondary"
            onClick={handleAddDefaultCategories}
            disabled={loadingDefaults}
            title="Add default gaming/tech categories"
          >
            <Icon name="auto_awesome" size={20} />
            {loadingDefaults ? "Adding..." : "Add Default Categories"}
          </button>
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => setIsAdding(true)}
          >
            <Icon name="add" size={20} />
            Add Category
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="admin-card" style={{ marginBottom: "20px" }}>
          <div className="admin-card-body">
            <form onSubmit={handleAddCategory}>
              <div className="admin-form-group">
                <label className="admin-form-label">Category Name</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="Enter category name..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="admin-form-actions" style={{ display: "flex", gap: "12px" }}>
                <button 
                  type="submit" 
                  className="admin-btn admin-btn-primary"
                  disabled={saving}
                >
                  {saving ? "Adding..." : "Add Category"}
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setIsAdding(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-body">
          {categories.length > 0 ? (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Post Count</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category._id || category}>
                      <td>
                        <span className="admin-category-name">{category.name}</span>
                      </td>
                      <td>
                        <code style={{ fontSize: "13px", color: "var(--admin-text-muted)" }}>
                          {category.slug}
                        </code>
                      </td>
                      <td>{category.postCount || category.posts?.length || 0}</td>
                      <td>
                        <div className="admin-actions">
                          <button 
                            className="admin-btn admin-btn-icon admin-btn-ghost admin-btn-sm"
                            disabled
                            title="Edit coming soon"
                          >
                            <Icon name="edit" size={18} />
                          </button>
                          <button
                            className="admin-btn admin-btn-icon admin-btn-ghost admin-btn-sm"
                            onClick={() => handleDeleteCategory(category._id || category)}
                            disabled={deleting === (category._id || category)}
                          >
                            <Icon name="delete" size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-empty">
              <Icon name="category" size={48} className="admin-empty-icon" />
              <h4 className="admin-empty-title">No categories yet</h4>
              <p className="admin-empty-text">Create your first category to organize your posts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
