import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import { Routes, Route } from "react-router-dom";
import PostDetails from "./pages/PostDetails";
import Categories from "./pages/Categories.jsx";
import Login from "./pages/login.jsx"
import CategoryPosts from "./pages/CategoryPosts.jsx";
import TagPosts from "./pages/TagPosts.jsx";
import Tags from "./pages/Tags.jsx";
import Posts from "./pages/Posts.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

// Admin imports
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminOverview from "./pages/admin/AdminOverview.jsx";
import AdminPosts from "./pages/admin/AdminPosts.jsx";
import AdminCreatePost from "./pages/admin/AdminCreatePost.jsx";
import AdminCategories from "./pages/admin/AdminCategories.jsx";
import AdminTags from "./pages/admin/AdminTags.jsx";

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/posts/:slug" element={<PostDetails />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/category/:slug" element={<CategoryPosts />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/tag/:slug" element={<TagPosts />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminOverview />} />
              <Route path="posts" element={<AdminPosts />} />
              <Route path="posts/new" element={<AdminCreatePost />} />
              <Route path="posts/:id" element={<AdminCreatePost />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="tags" element={<AdminTags />} />
              <Route path="users" element={<div style={{ padding: "40px", textAlign: "center", color: "var(--admin-text-muted)" }}>Users Management - Coming Soon</div>} />
              <Route path="settings" element={<div style={{ padding: "40px", textAlign: "center", color: "var(--admin-text-muted)" }}>Settings - Coming Soon</div>} />
            </Route>
          </Routes>
        </Layout>
      </ThemeProvider>
    </AuthProvider>
  );
}

