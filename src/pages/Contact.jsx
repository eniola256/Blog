import { useState } from "react";
import Icon from "../components/Icon";
import "./Contact.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // You can replace this with your actual API endpoint
      // For now, we'll simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1>Get In Touch</h1>
          <p>Have a question, suggestion, or just want to say hello? We'd love to hear from you!</p>
        </div>
      </section>

      <div className="contact-container">
        {/* Contact Info Cards */}
        <div className="contact-info-grid">
          <div className="contact-info-card">
            <div className="contact-info-icon">
              <Icon name="mail" size={28} />
            </div>
            <h3>Email Us</h3>
            <p>contact@blog.com</p>
            <span>We'll respond within 24 hours</span>
          </div>

          <div className="contact-info-card">
            <div className="contact-info-icon">
              <Icon name="location_on" size={28} />
            </div>
            <h3>Location</h3>
            <p>Lagos, Nigeria</p>
            <span>West Africa</span>
          </div>

          <div className="contact-info-card">
            <div className="contact-info-icon">
              <Icon name="schedule" size={28} />
            </div>
            <h3>Response Time</h3>
            <p>24-48 Hours</p>
            <span>Business days</span>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-form-wrapper">
          <div className="contact-form-header">
            <h2>Send Us a Message</h2>
            <p>Fill out the form below and we'll get back to you as soon as possible.</p>
          </div>

          {success && (
            <div className="contact-success">
              <Icon name="check_circle" size={24} />
              <div>
                <h4>Message Sent Successfully!</h4>
                <p>Thank you for reaching out. We'll get back to you soon.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="contact-error">
              <Icon name="error" size={24} />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="contact-form-row">
              <div className="contact-form-group">
                <label htmlFor="name">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="contact-form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
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
                value={formData.subject}
                onChange={handleChange}
                placeholder="What is this about?"
                required
              />
            </div>

            <div className="contact-form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message here..."
                rows={6}
                required
              />
            </div>

            <button type="submit" className="contact-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <Icon name="hourglass_empty" size={20} />
                  Sending...
                </>
              ) : (
                <>
                  <Icon name="send" size={20} />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>

        {/* Social Links */}
        <div className="contact-social">
          <h3>Follow Us</h3>
          <div className="contact-social-links">
            <a href="#" className="contact-social-link" aria-label="Twitter">
              <Icon name="tag" size={24} />
            </a>
            <a href="#" className="contact-social-link" aria-label="Facebook">
              <Icon name="facebook" size={24} />
            </a>
            <a href="#" className="contact-social-link" aria-label="Instagram">
              <Icon name="image" size={24} />
            </a>
            <a href="#" className="contact-social-link" aria-label="LinkedIn">
              <Icon name="work" size={24} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
