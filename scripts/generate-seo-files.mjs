import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const publicDir = path.join(projectRoot, "public");

const normalizeBaseUrl = (value) => {
  if (!value) return "";
  return value.trim().replace(/\/+$/, "");
};

const isIsoDate = (value) => {
  if (!value) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
};

async function loadDotEnv() {
  const envPath = path.join(projectRoot, ".env");
  try {
    const envRaw = await fs.readFile(envPath, "utf8");
    envRaw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex < 0) return;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim().replace(/^['"]|['"]$/g, "");
      if (!process.env[key]) process.env[key] = value;
    });
  } catch {
    // .env is optional; continue with process env only
  }
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }
  return response.json();
}

async function fetchAllPosts(apiUrl) {
  const posts = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const data = await fetchJson(`${apiUrl}/api/public/posts?page=${page}&limit=24`);
    const pagePosts = Array.isArray(data) ? data : (data.posts || data.data || []);
    posts.push(...pagePosts);

    const nextTotalPages = Number(data.totalPages);
    totalPages = Number.isFinite(nextTotalPages) && nextTotalPages > 0 ? nextTotalPages : page;
    page += 1;

    if (page > 500) break;
  }

  return posts;
}

async function fetchCollection(apiUrl, endpoint, key) {
  try {
    const data = await fetchJson(`${apiUrl}${endpoint}`);
    if (Array.isArray(data)) return data;
    return data[key] || data.data || [];
  } catch {
    return [];
  }
}

function buildSitemapXml(siteUrl, urls) {
  const lines = [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">",
  ];

  urls.forEach((urlEntry) => {
    lines.push("  <url>");
    lines.push(`    <loc>${urlEntry.loc}</loc>`);
    if (urlEntry.lastmod) lines.push(`    <lastmod>${urlEntry.lastmod}</lastmod>`);
    if (urlEntry.changefreq) lines.push(`    <changefreq>${urlEntry.changefreq}</changefreq>`);
    if (urlEntry.priority) lines.push(`    <priority>${urlEntry.priority}</priority>`);
    lines.push("  </url>");
  });

  lines.push("</urlset>");
  return `${lines.join("\n")}\n`;
}

function buildRobotsTxt(siteUrl) {
  return [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${siteUrl}/sitemap.xml`,
    "",
  ].join("\n");
}

async function main() {
  await loadDotEnv();

  const siteUrl = normalizeBaseUrl(
    process.env.VITE_SITE_URL || process.env.SITE_URL || "https://ae-tech-blog.vercel.app"
  );
  const apiUrl = normalizeBaseUrl(process.env.VITE_API_URL || process.env.API_URL || "");
  const usingPlaceholderDomain = !process.env.VITE_SITE_URL && !process.env.SITE_URL;
  if (usingPlaceholderDomain) {
    console.warn("SEO generation warning: VITE_SITE_URL is not set. Using default configured domain.");
  }

  const staticUrls = [
    { loc: `${siteUrl}/`, changefreq: "daily", priority: "1.0" },
    { loc: `${siteUrl}/blog`, changefreq: "daily", priority: "0.9" },
    { loc: `${siteUrl}/posts`, changefreq: "daily", priority: "0.8" },
    { loc: `${siteUrl}/categories`, changefreq: "weekly", priority: "0.7" },
    { loc: `${siteUrl}/tags`, changefreq: "weekly", priority: "0.6" },
    { loc: `${siteUrl}/contact`, changefreq: "monthly", priority: "0.5" },
  ];

  const dynamicUrls = [];

  if (apiUrl) {
    try {
      const [posts, categories, tags] = await Promise.all([
        fetchAllPosts(apiUrl),
        fetchCollection(apiUrl, "/api/public/categories", "categories"),
        fetchCollection(apiUrl, "/api/public/tags", "tags"),
      ]);

      posts.forEach((post) => {
        if (!post?.slug) return;
        dynamicUrls.push({
          loc: `${siteUrl}/posts/${post.slug}`,
          lastmod: isIsoDate(post.updatedAt || post.createdAt)
            ? new Date(post.updatedAt || post.createdAt).toISOString()
            : undefined,
          changefreq: "weekly",
          priority: "0.8",
        });
      });

      categories.forEach((category) => {
        if (!category?.slug) return;
        dynamicUrls.push({
          loc: `${siteUrl}/category/${category.slug}`,
          changefreq: "weekly",
          priority: "0.6",
        });
      });

      tags.forEach((tag) => {
        if (!tag?.slug) return;
        dynamicUrls.push({
          loc: `${siteUrl}/tag/${tag.slug}`,
          changefreq: "weekly",
          priority: "0.5",
        });
      });
    } catch (error) {
      console.warn(`SEO generation warning: ${error.message}`);
    }
  } else {
    console.warn("SEO generation warning: API URL missing, generating static sitemap routes only.");
  }

  const deduped = new Map();
  [...staticUrls, ...dynamicUrls].forEach((entry) => {
    deduped.set(entry.loc, entry);
  });

  const sitemapXml = buildSitemapXml(siteUrl, Array.from(deduped.values()));
  const robotsTxt = buildRobotsTxt(siteUrl);

  await fs.mkdir(publicDir, { recursive: true });
  await fs.writeFile(path.join(publicDir, "sitemap.xml"), sitemapXml, "utf8");
  await fs.writeFile(path.join(publicDir, "robots.txt"), robotsTxt, "utf8");

  console.log(`Generated sitemap.xml with ${deduped.size} URLs`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
