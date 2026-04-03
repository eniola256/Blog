import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Login.css";

const API = import.meta.env.VITE_API_URL;

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  show,
  onToggleVisibility,
  toggleLabel = "password",
  ...inputProps
}) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className="password-field">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          {...inputProps}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={onToggleVisibility}
          aria-label={show ? `Hide ${toggleLabel}` : `Show ${toggleLabel}`}
          aria-pressed={show}
          title={show ? `Hide ${toggleLabel}` : `Show ${toggleLabel}`}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            {show ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Toggle between sign in and sign up
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError(null);
    setSuccess(null);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Server returned ${res.status}: Endpoint not found`);
      }

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Sign in failed");

      login(data);
      navigate("/admin");
    } catch (err) {
      setError(err.message);
      console.error("Sign in error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Server returned ${res.status}: Endpoint not found`);
      }

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Registration failed");

      // Show success message and switch to sign in
      setSuccess("Account created successfully! Please sign in.");
      setIsSignUp(false);
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);
      setName("");
    } catch (err) {
      setError(err.message);
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <h1>AE Tech</h1>
          <p>Your source for gaming, technology, AI, and coding insights.</p>
          <div className="auth-branding-features">
            <div className="feature">
              <span>🎮</span>
              <span>Gaming News</span>
            </div>
            <div className="feature">
              <span>💻</span>
              <span>Tech Updates</span>
            </div>
            <div className="feature">
              <span>🤖</span>
              <span>AI Insights</span>
            </div>
            <div className="feature">
              <span>👨‍💻</span>
              <span>Coding Tutorials</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-container">
          <div className="auth-tabs">
            <button 
              className={`auth-tab ${!isSignUp ? 'active' : ''}`}
              onClick={() => !isSignUp || toggleMode()}
            >
              Sign In
            </button>
            <button 
              className={`auth-tab ${isSignUp ? 'active' : ''}`}
              onClick={() => isSignUp || toggleMode()}
            >
              Sign Up
            </button>
          </div>

          {success && <div className="auth-success">{success}</div>}
          {error && <div className="auth-error">{error}</div>}

          {!isSignUp ? (
            // Sign In Form
            <form onSubmit={handleSignIn} className="auth-form">
              <h2>Welcome back!</h2>
              <p className="auth-subtitle">Sign in to access your account</p>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                />
              </div>
               
              <PasswordField
                id="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                show={showPassword}
                onToggleVisibility={() => setShowPassword((prev) => !prev)}
                required
                autoComplete="current-password"
              />

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <p className="auth-switch">
                Don't have an account?{' '}
                <button type="button" className="auth-switch-btn" onClick={toggleMode}>
                  Sign Up
                </button>
              </p>
            </form>
          ) : (
            // Sign Up Form
            <form onSubmit={handleSignUp} className="auth-form">
              <h2>Create account</h2>
              <p className="auth-subtitle">Join our community today</p>
              
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  autoComplete="name"
                />
              </div>
               
              <div className="form-group">
                <label htmlFor="signup-email">Email</label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                />
              </div>
               
              <PasswordField
                id="signup-password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (min 6 characters)"
                show={showPassword}
                onToggleVisibility={() => setShowPassword((prev) => !prev)}
                required
                minLength={6}
                autoComplete="new-password"
              />
               
              <PasswordField
                id="confirm-password"
                label="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                show={showConfirmPassword}
                onToggleVisibility={() => setShowConfirmPassword((prev) => !prev)}
                toggleLabel="confirm password"
                required
                autoComplete="new-password"
              />

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? "Creating account..." : "Sign Up"}
              </button>

              <p className="auth-switch">
                Already have an account?{' '}
                <button type="button" className="auth-switch-btn" onClick={toggleMode}>
                  Sign In
                </button>
              </p>
            </form>
          )}

          <Link to="/" className="auth-back-home">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
