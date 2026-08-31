
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './Login.css';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      {/* Background decoration */}
      <div className="login-grid"></div>
      <div className="login-glow login-glow-one"></div>
      <div className="login-glow login-glow-two"></div>

      <section className="login-container">

        {/* Brand */}
        <div className="login-brand">
          <div className="brand-mark">
            TL
          </div>

          <div>
            <div className="brand-name">TruthLens</div>
            <div className="brand-tagline">
              Evidence-Based AI Analysis
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="login-card">

          <div className="login-header">
            <span className="login-eyebrow">
              SECURE ACCESS
            </span>

            <h1>Welcome back</h1>

            <p>
              Sign in to access your evidence analysis portal.
            </p>
          </div>

          {error && (
            <div className="login-error">
              <span className="error-icon">!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">

            {/* Email */}
            <div className="login-form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <div className="input-wrapper">
                <span className="input-icon">
                  @
                </span>

                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@truthlens.ai"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-form-group">
              <div className="password-label-row">
                <label htmlFor="password">
                  Password
                </label>

                <span className="secure-label">
                  SECURE
                </span>
              </div>

              <div className="input-wrapper">
                <span className="input-icon">
                  •••
                </span>

                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="login-button"
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <span className="button-arrow">→</span>
                </>
              )}
            </button>
          </form>

          {/* Signup */}
          <div className="login-footer">
            <span>Don't have an account?</span>

            <Link to="/signup">
              Create an account
            </Link>
          </div>
        </div>

        {/* Security indicator */}
        <div className="login-security">
          <span className="security-dot"></span>
          <span>Secure authentication</span>
          <span className="security-divider">•</span>
          <span>Your data stays protected</span>
        </div>

      </section>
    </main>
  );
};

