import { useState } from "react";
import { useForm } from "@formspree/react";
import "./Contact.css";

export default function Contact() {
  // Formspree hook for contact form
  const [formState, handleSubmit] = useForm("xpqjkezp");
  
  // Newsletter form state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSuccess(true);
      setNewsletterEmail("");
    }
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-bg">
          <div className="contact-hero-gradient"></div>
          <div className="contact-hero-pattern"></div>
        </div>
        <div className="contact-hero-content">
          <span className="contact-hero-badge">Get in Touch</span>
          <h1>Contact</h1>
          <p>Have a question or feedback? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>
      </section>

      <div className="contact-container">
        <div className="contact-main">
          {/* Contact Form Card */}
          <div className="contact-form-card">
            <div className="contact-form-header">
              <h2>Send a Message</h2>
              <p>Fill out the form below and we'll get back to you within 24-48 hours.</p>
            </div>

            {formState.succeeded ? (
              <div className="contact-success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <div>
                  <h4>Message Sent Successfully!</h4>
                  <p>Thank you for reaching out. We'll get back to you soon.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-form-row">
                  <div className="contact-form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div className="contact-form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="contact-form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    placeholder="What is this about?"
                    required
                  />
                </div>

                <div className="contact-form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Write your message here..."
                    rows={5}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="contact-submit-btn" 
                  disabled={formState.submitting}
                >
                  {formState.submitting ? (
                    <>
                      <svg className="spinner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info Sidebar */}
          <aside className="contact-sidebar">
            {/* Contact Info Card */}
            <div className="contact-info-card">
              <h3>Contact Information</h3>
              
              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div className="contact-info-content">
                  <span className="contact-info-label">Email</span>
                  <a href="mailto:contact@aetechblog.com">contact@aetechblog.com</a>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="contact-info-content">
                  <span className="contact-info-label">Response Time</span>
                  <span>Within 24-48 hours</span>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="contact-info-content">
                  <span className="contact-info-label">Location</span>
                  <span>Lagos, Nigeria</span>
                </div>
              </div>
            </div>

            {/* Social Links Card */}
            <div className="contact-social-card">
              <h3>Follow Us</h3>
              <p>Stay connected with us on social media</p>
              <div className="contact-social-links">
                <a href="#" className="contact-social-link" aria-label="Twitter">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                  </svg>
                </a>
                <a href="#" className="contact-social-link" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a href="#" className="contact-social-link" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a href="#" className="contact-social-link" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Newsletter CTA Strip */}
      <section className="contact-newsletter">
        <div className="contact-newsletter-content">
          <div className="contact-newsletter-text">
            <h3>Subscribe to Our Newsletter</h3>
            <p>Get the latest articles and updates delivered to your inbox</p>
          </div>
          {newsletterSuccess ? (
            <div className="contact-newsletter-success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Thanks for subscribing!</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="contact-newsletter-form">
              <input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
              />
              <button type="submit">Subscribe</button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
