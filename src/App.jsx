import { Suspense, lazy } from "react";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

const Home = lazy(() => import("./pages/Home.jsx"));
const PostDetails = lazy(() => import("./pages/PostDetails.jsx"));
const Categories = lazy(() => import("./pages/Categories.jsx"));
const Login = lazy(() => import("./pages/login.jsx"));
const CategoryPosts = lazy(() => import("./pages/CategoryPosts.jsx"));
const TagPosts = lazy(() => import("./pages/TagPosts.jsx"));
const Tags = lazy(() => import("./pages/Tags.jsx"));
const Posts = lazy(() => import("./pages/Posts.jsx"));
const Blog = lazy(() => import("./pages/Blog.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));

const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview.jsx"));
const AdminPosts = lazy(() => import("./pages/admin/AdminPosts.jsx"));
const AdminCreatePost = lazy(() => import("./pages/admin/AdminCreatePost.jsx"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories.jsx"));
const AdminTags = lazy(() => import("./pages/admin/AdminTags.jsx"));

const AuthorDashboard = lazy(() => import("./pages/author/AuthorDashboard.jsx"));
const AuthorOverview = lazy(() => import("./pages/author/AuthorOverview.jsx"));
const AuthorPosts = lazy(() => import("./pages/author/AuthorPosts.jsx"));
const AuthorCreatePost = lazy(() => import("./pages/author/AuthorCreatePost.jsx"));

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Layout>
          <Suspense fallback={<div style={{ padding: "24px", textAlign: "center" }}>Loading...</div>}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/posts/:slug" element={<PostDetails />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/posts" element={<Posts />} />
              <Route path="/category/:slug" element={<CategoryPosts />} />
              <Route path="/tags" element={<Tags />} />
              <Route path="/tag/:slug" element={<TagPosts />} />
              <Route path="/contact" element={<Contact />} />
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

              {/* Author Routes */}
              <Route
                path="/author"
                element={
                  <ProtectedRoute role="author">
                    <AuthorDashboard />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AuthorOverview />} />
                <Route path="posts" element={<AuthorPosts />} />
                <Route path="posts/new" element={<AuthorCreatePost />} />
                <Route path="posts/:id" element={<AuthorCreatePost />} />
              </Route>
            </Routes>
          </Suspense>
        </Layout>
      </ThemeProvider>
    </AuthProvider>
  );
}
