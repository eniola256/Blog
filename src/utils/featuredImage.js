import { fetchPublicPostBySlug } from "../api/post.js";

const featuredImageBySlug = new Map();
const inflightBySlug = new Map();

const normalizeSlug = (value) => (typeof value === "string" ? value.trim() : "");

const normalizeFeaturedImage = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

export async function getFeaturedImageForSlug(slug) {
  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) return null;

  if (featuredImageBySlug.has(normalizedSlug)) {
    return featuredImageBySlug.get(normalizedSlug) || null;
  }

  if (inflightBySlug.has(normalizedSlug)) {
    return inflightBySlug.get(normalizedSlug);
  }

  const request = (async () => {
    try {
      const data = await fetchPublicPostBySlug(normalizedSlug);
      const featuredImage = normalizeFeaturedImage(data?.post?.featuredImage);
      featuredImageBySlug.set(normalizedSlug, featuredImage);
      return featuredImage;
    } catch {
      return null;
    } finally {
      inflightBySlug.delete(normalizedSlug);
    }
  })();

  inflightBySlug.set(normalizedSlug, request);
  return request;
}

export async function hydratePostWithFeaturedImage(post) {
  if (!post || typeof post !== "object") return post;
  const existingFeaturedImage = normalizeFeaturedImage(post.featuredImage);
  if (existingFeaturedImage) return post;

  const slug = normalizeSlug(post.slug);
  if (!slug) return post;

  const featuredImage = await getFeaturedImageForSlug(slug);
  if (!featuredImage) return post;

  return { ...post, featuredImage };
}

export async function hydratePostsWithFeaturedImages(posts = []) {
  if (!Array.isArray(posts) || posts.length === 0) return posts;

  const nextPosts = await Promise.all(posts.map(hydratePostWithFeaturedImage));
  return nextPosts;
}
