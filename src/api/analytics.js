const API = import.meta.env.VITE_API_URL;

const SESSION_ID_KEY = "blog_session_id";
const SESSION_START_SENT_KEY = "blog_session_start_sent";

const canUseBrowser = () => typeof window !== "undefined";

const generateSessionId = () => {
  if (canUseBrowser() && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

export const getOrCreateSessionId = () => {
  if (!canUseBrowser()) return null;

  const existing = localStorage.getItem(SESSION_ID_KEY);
  if (existing) return existing;

  const sessionId = generateSessionId();
  localStorage.setItem(SESSION_ID_KEY, sessionId);
  return sessionId;
};

const shouldSkipTracking = () => {
  if (!canUseBrowser()) return true;
  if (!API) return true;
  if (navigator.doNotTrack === "1") return true;
  return false;
};

const postAnalyticsEvent = async (payload) => {
  await fetch(`${API}/api/analytics/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  });
};

const ensureSessionStart = async (sessionId, userId = null) => {
  if (!canUseBrowser()) return;
  const sent = sessionStorage.getItem(SESSION_START_SENT_KEY);
  if (sent === sessionId) return;

  sessionStorage.setItem(SESSION_START_SENT_KEY, sessionId);

  try {
    await postAnalyticsEvent({
      eventName: "session_start",
      sessionId,
      userId,
      path: window.location.pathname,
      referrer: document.referrer || null,
      timestamp: new Date().toISOString(),
    });
  } catch {
    // no-op; analytics must not break UI
  }
};

export const trackAnalyticsEvent = async ({
  eventName,
  postId = null,
  slug = null,
  userId = null,
  path = null,
  referrer = null,
  timestamp = null,
} = {}) => {
  if (shouldSkipTracking() || !eventName) return;

  const sessionId = getOrCreateSessionId();
  if (!sessionId) return;

  await ensureSessionStart(sessionId, userId);

  const payload = {
    eventName,
    postId,
    slug,
    sessionId,
    userId,
    path: path || window.location.pathname,
    referrer: referrer ?? (document.referrer || null),
    timestamp: timestamp || new Date().toISOString(),
  };

  try {
    await postAnalyticsEvent(payload);
  } catch {
    // no-op; analytics must not break UI
  }
};

export async function fetchAdminAnalyticsOverview(days = 30) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API}/api/admin/analytics/overview?days=${days}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch analytics overview");
  }

  return response.json();
}
