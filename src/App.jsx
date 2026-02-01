import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import { Routes, Route } from "react-router-dom";
import PostDetails from "./pages/PostDetails";
import Categories from "./pages/Categories.jsx";
import CategoryPosts from "./pages/CategoryPosts.jsx";
import TagPosts from "./pages/TagPosts.jsx";
import Tags from "./pages/Tags.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <Layout>
         <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts/:slug" element={<PostDetails />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/category/:slug" element={<CategoryPosts />} />
          <Route path="/tags" element={<Tags />} />
          <Route path="/tag/:slug" element={<TagPosts />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}
