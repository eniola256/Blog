import { useState, useEffect } from "react";
import { subscribe } from "../api/subscriber";
import "./NewsletterPopup.css";

export default function NewsletterPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // 'success', 'error', 'loading'
  const [errorMessage, setErrorMessage] = useState("");
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    // Check if user has already closed the popup
    const hasClosedPopup = localStorage.getItem("newsletterPopupClosed");
    const hasSubscribed = localStorage.getItem("newsletterSubscribed");

    if (!hasClosedPopup && !hasSubscribed) {
      // Show popup after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setIsClosed(true);
    // Remember that user closed the popup (expires in 7 days)
    localStorage.setItem("newsletterPopupClosed", Date.now().toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      // Call the actual backend API
      await subscribe(email);
      
      setStatus("success");
      localStorage.setItem("newsletterSubscribed", "true");
      
      // Close popup after 2 seconds on success
      setTimeout(() => {
        setIsVisible(false);
      }, 2000);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error.message || "Failed to subscribe. Please try again.");
      console.error("Subscription error:", error.message);
    }
  };

  const handleDontShowAgain = () => {
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <div className="newsletter-overlay">
      <div className="newsletter-popup">
        <button className="newsletter-close" onClick={handleClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
        
        <div className="newsletter-content">
          <div className="newsletter-icon">
            <span className="material-symbols-outlined">mail</span>
          </div>
          
          <h2>Subscribe to Our Newsletter</h2>
          <p>Get the latest articles, tutorials, and updates delivered straight to your inbox. Join our community of tech enthusiasts!</p>
          
          {status === "success" ? (
            <div className="newsletter-success">
              <span className="material-symbols-outlined">check_circle</span>
              <p>Thank you for subscribing!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="newsletter-form">
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "loading"}
                />
                <button type="submit" disabled={status === "loading"}>
                  {status === "loading" ? "Subscribing..." : "Subscribe"}
                </button>
              </div>
              
              {status === "error" && (
                <p className="error-message">{errorMessage || "Please enter a valid email address."}</p>
              )}
              
              <p className="privacy-note">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>
          )}
          
          <button className="dont-show-again" onClick={handleDontShowAgain}>
            Don't show this again
          </button>
        </div>
      </div>
    </div>
  );
}
