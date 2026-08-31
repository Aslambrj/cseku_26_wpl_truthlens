
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './Signup.css';

export const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await signup(name, email, password);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">

      {/* Background */}
      <div className="signup-grid"></div>
      <div className="signup-glow signup-glow-one"></div>
      <div className="signup-glow signup-glow-two"></div>

      <div className="signup-container">

        {/* Brand */}
        <div className="signup-brand">
          <div className="signup-brand-mark">
            TL
          </div>

          <div>
            <div className="signup-brand-name">
              TruthLens
            </div>

            <div className="signup-brand-tagline">
              Evidence-Based Analysis
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="signup-card">

          {/* Header */}
          <div className="signup-header">

            <div className="signup-eyebrow">
              CREATE ACCOUNT
            </div>

            <h1>
              Create Analyst Account
            </h1>

            <p>
              Get access to claim verification and media forensics tools.
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="signup-error">
              <span className="signup-error-icon">
                !
              </span>

              <span>
                {error}
              </span>
            </div>
          )}

          {/* Form */}
          <form
            className="signup-form"
            onSubmit={handleSubmit}
          >

            {/* Full Name */}
            <div className="signup-form-group">

              <label htmlFor="signup-name">
                Full Name
              </label>

              <div className="signup-input-wrapper">

                <span className="signup-input-icon">
                  ◉
                </span>

                <input
                  id="signup-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  autoComplete="name"
                />

              </div>

            </div>

            {/* Work Email */}
            <div className="signup-form-group">

              <label htmlFor="signup-email">
                Work Email
              </label>

              <div className="signup-input-wrapper">

                <span className="signup-input-icon">
                  @
                </span>

                <input
                  id="signup-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@organization.org"
                  autoComplete="email"
                />

              </div>

            </div>

            {/* Password */}
            <div className="signup-form-group">

              <div className="signup-label-row">

                <label htmlFor="signup-password">
                  Password
                </label>

                <span className="signup-helper">
                  MIN. 6 CHARACTERS
                </span>

              </div>

              <div className="signup-input-wrapper">

                <span className="signup-input-icon">
                  •••
                </span>

                <input
                  id="signup-password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />

              </div>

            </div>

            {/* Confirm Password */}
            <div className="signup-form-group">

              <label htmlFor="signup-confirm-password">
                Confirm Password
              </label>

              <div className="signup-input-wrapper">

                <span className="signup-input-icon">
                  •••
                </span>

                <input
                  id="signup-confirm-password"
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                />

              </div>

            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="signup-button"
            >

              {loading ? (
                <>
                  <span className="signup-loading-spinner"></span>
                  Registering...
                </>
              ) : (
                <>
                  Create Account
                  <span className="signup-button-arrow">
                    →
                  </span>
                </>
              )}

            </button>

          </form>

          {/* Footer */}
          <div className="signup-footer">
            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Sign in
            </Link>
          </div>

        </div>

        {/* Security */}
        <div className="signup-security">

          <span className="signup-security-dot"></span>

          <span>
            Secure Authentication
          </span>

          <span className="signup-security-divider">
            •
          </span>

          <span>
            Your data is protected
          </span>

        </div>

      </div>
    </div>
  );
};
