import { useMemo } from "react";
import Icon from "./Icon";
import "./SeoCheckerCard.css";

function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function countWords(text = "") {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

function keywordDensity(text = "", keyword = "") {
  if (!keyword || !text) return 0;
  const words = text.toLowerCase().split(/\s+/);
  const kw = keyword.toLowerCase();
  const matches = words.filter((word) => word.includes(kw)).length;
  return words.length > 0 ? (matches / words.length) * 100 : 0;
}

function runChecks({ title, slug, metaDescription, plainContent, focusKeyword }) {
  const wordCount = countWords(plainContent);
  const density = keywordDensity(plainContent, focusKeyword);
  const kw = focusKeyword.toLowerCase().trim();
  const titleLower = title.toLowerCase();
  const metaLower = metaDescription.toLowerCase();
  const slugLower = slug.toLowerCase();

  return [
    {
      group: "Title",
      id: "title_exists",
      label: "Title is not empty",
      pass: title.trim().length > 0,
      tip: "Every post must have a title.",
    },
    {
      group: "Title",
      id: "title_length",
      label: `Title length (${title.length}/60 chars)`,
      pass: title.length >= 20 && title.length <= 60,
      tip: "Aim for 20-60 characters so it displays fully in Google results.",
    },
    {
      group: "Title",
      id: "title_keyword",
      label: "Focus keyword in title",
      pass: kw ? titleLower.includes(kw) : null,
      tip: "Include your focus keyword in the post title.",
      requiresKeyword: true,
    },
    {
      group: "Slug",
      id: "slug_length",
      label: `Slug length (${slug.length} chars)`,
      pass: slug.length >= 3 && slug.length <= 75,
      tip: "Keep slugs short and descriptive (under 75 characters).",
    },
    {
      group: "Slug",
      id: "slug_no_numbers_only",
      label: "Slug contains words, not just numbers",
      pass: /[a-z]/.test(slugLower),
      tip: "Slugs should contain real words for better SEO.",
    },
    {
      group: "Slug",
      id: "slug_keyword",
      label: "Focus keyword in slug",
      pass: kw ? slugLower.includes(kw.replace(/\s+/g, "-")) : null,
      tip: "Include the keyword in the slug so search engines understand the topic.",
      requiresKeyword: true,
    },
    {
      group: "Meta Description",
      id: "meta_exists",
      label: "Meta description is filled in",
      pass: metaDescription.trim().length > 0,
      tip: "A meta description improves click-through rate from search results.",
    },
    {
      group: "Meta Description",
      id: "meta_length",
      label: `Meta description length (${metaDescription.length}/160 chars)`,
      pass: metaDescription.length >= 50 && metaDescription.length <= 160,
      tip: "Keep it between 50-160 characters for best display in results.",
    },
    {
      group: "Meta Description",
      id: "meta_keyword",
      label: "Focus keyword in meta description",
      pass: kw ? metaLower.includes(kw) : null,
      tip: "Matching keywords in description can improve visibility and clicks.",
      requiresKeyword: true,
    },
    {
      group: "Content",
      id: "content_length",
      label: `Word count (${wordCount} words)`,
      pass: wordCount >= 300,
      tip: "Aim for at least 300 words; 600+ is stronger for competitive topics.",
    },
    {
      group: "Content",
      id: "keyword_density",
      label: `Keyword density (${density.toFixed(1)}%)`,
      pass: kw ? density >= 0.5 && density <= 3 : null,
      tip: "Keep keyword density between 0.5% and 3%.",
      requiresKeyword: true,
    },
    {
      group: "Content",
      id: "keyword_in_first_para",
      label: "Keyword in opening paragraph",
      pass: kw ? plainContent.toLowerCase().slice(0, 300).includes(kw) : null,
      tip: "Mentioning the keyword early signals relevance.",
      requiresKeyword: true,
    },
  ];
}

function calcScore(checks) {
  const applicable = checks.filter((check) => check.pass !== null);
  if (applicable.length === 0) return 0;
  const passed = applicable.filter((check) => check.pass === true).length;
  return Math.round((passed / applicable.length) * 100);
}

function ScoreRing({ score }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? "var(--seo-good)" : score >= 50 ? "var(--seo-warn)" : "var(--seo-bad)";

  return (
    <div className="seo-score-ring-wrap">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="var(--seo-track)" strokeWidth="6" />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.3s ease" }}
        />
      </svg>
      <span className="seo-score-number" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

function StatusIcon({ pass }) {
  if (pass === null) {
    return (
      <span className="seo-status seo-status-na">
        <Icon name="remove" size={14} />
      </span>
    );
  }

  if (pass) {
    return (
      <span className="seo-status seo-status-pass">
        <Icon name="check" size={14} />
      </span>
    );
  }

  return (
    <span className="seo-status seo-status-fail">
      <Icon name="close" size={14} />
    </span>
  );
}

function CheckGroup({ group, checks }) {
  const allPass = checks.every((check) => check.pass === true || check.pass === null);
  const anyFail = checks.some((check) => check.pass === false);

  return (
    <div className="seo-check-group">
      <div className="seo-group-header">
        <span
          className="seo-group-dot"
          style={{
            background: anyFail
              ? "var(--seo-bad)"
              : allPass
              ? "var(--seo-good)"
              : "var(--seo-warn)",
          }}
        />
        <span className="seo-group-title">{group}</span>
      </div>
      {checks.map((check) => (
        <div key={check.id} className={`seo-check-row ${check.pass === false ? "seo-check-fail" : ""}`}>
          <StatusIcon pass={check.pass} />
          <div className="seo-check-text">
            <span className="seo-check-label">{check.label}</span>
            {check.pass === false && <span className="seo-check-tip">{check.tip}</span>}
            {check.pass === null && check.requiresKeyword && (
              <span className="seo-check-tip seo-na-tip">Set a focus keyword to enable this check</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SeoCheckerCard({
  title = "",
  slug = "",
  content = "",
  metaDescription = "",
  setMetaDescription,
  focusKeyword = "",
  setFocusKeyword,
  variant = "author",
}) {
  const plainContent = useMemo(() => stripHtml(content), [content]);

  const checks = useMemo(
    () => runChecks({ title, slug, metaDescription, plainContent, focusKeyword }),
    [title, slug, metaDescription, plainContent, focusKeyword]
  );

  const score = useMemo(() => calcScore(checks), [checks]);
  const groups = ["Title", "Slug", "Meta Description", "Content"];
  const grouped = groups.map((group) => ({
    group,
    checks: checks.filter((check) => check.group === group),
  }));
  const label = score >= 80 ? "Good" : score >= 50 ? "Needs Work" : "Poor";

  const prefix = variant === "admin" ? "admin" : "author";
  const cardClass = `${prefix}-card`;
  const cardHeaderClass = `${prefix}-card-header`;
  const cardBodyClass = `${prefix}-card-body`;
  const cardTitleClass = `${prefix}-card-title`;
  const formGroupClass = `${prefix}-form-group`;
  const formInputClass = `${prefix}-form-input`;

  return (
    <>
      <div className={cardClass}>
        <div className={cardHeaderClass}>
          <h3 className={cardTitleClass}>
            <Icon name="key" size={16} style={{ marginRight: 6 }} />
            Focus Keyword
          </h3>
        </div>
        <div className={cardBodyClass}>
          <div className={formGroupClass} style={{ marginBottom: 0 }}>
            <input
              type="text"
              className={formInputClass}
              placeholder="e.g. best coffee Lagos"
              value={focusKeyword}
              onChange={(event) => setFocusKeyword(event.target.value)}
            />
            <p className="seo-helper-text">The main phrase you want this post to rank for</p>
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <div className={cardHeaderClass}>
          <h3 className={cardTitleClass}>
            <Icon name="description" size={16} style={{ marginRight: 6 }} />
            Meta Description
          </h3>
        </div>
        <div className={cardBodyClass}>
          <div className={formGroupClass} style={{ marginBottom: 0 }}>
            <textarea
              className={`${formInputClass} seo-meta-textarea`}
              placeholder="Write a short summary for Google search results..."
              value={metaDescription}
              onChange={(event) => setMetaDescription(event.target.value)}
              maxLength={160}
              rows={3}
            />
            <div className="seo-meta-counter">
              <span
                style={{
                  color:
                    metaDescription.length > 160
                      ? "var(--seo-bad)"
                      : metaDescription.length >= 50
                      ? "var(--seo-good)"
                      : "var(--foreground-muted)",
                }}
              >
                {metaDescription.length}/160
              </span>
              {metaDescription.length < 50 && metaDescription.length > 0 && (
                <span className="seo-meta-state seo-meta-state-warn">Too short</span>
              )}
              {metaDescription.length >= 50 && metaDescription.length <= 160 && (
                <span className="seo-meta-state seo-meta-state-good">Good length</span>
              )}
            </div>

            {(title || metaDescription) && (
              <div className="seo-google-preview">
                <p className="seo-preview-label">Preview in Google</p>
                <div className="seo-preview-box">
                  <span className="seo-preview-url">yourblog.com › {slug || "post-slug"}</span>
                  <span className="seo-preview-title">{title || "Your Post Title"}</span>
                  <span className="seo-preview-desc">
                    {metaDescription ||
                      "No meta description yet. Google may use a random excerpt from your post."}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <div className={cardHeaderClass}>
          <h3 className={cardTitleClass}>
            <Icon name="search" size={16} style={{ marginRight: 6 }} />
            SEO Score
          </h3>
        </div>
        <div className={cardBodyClass}>
          <div className="seo-score-header">
            <ScoreRing score={score} />
            <div className="seo-score-meta">
              <span
                className="seo-score-label"
                style={{
                  color:
                    score >= 80
                      ? "var(--seo-good)"
                      : score >= 50
                      ? "var(--seo-warn)"
                      : "var(--seo-bad)",
                }}
              >
                {label}
              </span>
              <span className="seo-score-sub">
                {checks.filter((check) => check.pass === true).length}/
                {checks.filter((check) => check.pass !== null).length} checks passed
              </span>
            </div>
          </div>

          <div className="seo-checks-list">
            {grouped.map(({ group, checks: groupedChecks }) => (
              <CheckGroup key={group} group={group} checks={groupedChecks} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
