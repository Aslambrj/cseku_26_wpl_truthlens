
import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <>
      <style>{`
        .truthlens-footer {
          width: 100%;
          box-sizing: border-box;

          margin-top: auto;

          background: #0f172a;
          color: #cbd5e1;

          border-top: 1px solid #1e293b;
        }

        .truthlens-footer-container {
          width: 100%;
          max-width: 1200px;

          margin: 0 auto;
          padding: 48px 32px 24px;

          box-sizing: border-box;
        }

        /* ================================
           FOOTER TOP
           ================================ */

        .truthlens-footer-top {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr;

          gap: 48px;

          padding-bottom: 40px;
        }

        /* ================================
           BRAND
           ================================ */

        .truthlens-footer-brand {
          display: inline-flex;
          align-items: center;

          gap: 11px;

          margin-bottom: 16px;

          color: #ffffff;
          text-decoration: none;
        }

        .truthlens-footer-logo {
          width: 38px;
          height: 38px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 10px;

          background: linear-gradient(
            135deg,
            #2563eb,
            #1d4ed8
          );

          color: #ffffff;

          box-shadow:
            0 6px 18px rgba(37, 99, 235, 0.22);
        }

        .truthlens-footer-brand-name {
          font-size: 18px;
          font-weight: 750;

          line-height: 1;

          letter-spacing: -0.4px;
        }

        .truthlens-footer-description {
          max-width: 340px;

          margin: 0;

          color: #94a3b8;

          font-size: 13px;
          line-height: 1.7;
        }

        .truthlens-footer-tagline {
          display: inline-flex;
          align-items: center;

          gap: 7px;

          margin-top: 18px;

          color: #64748b;

          font-size: 10px;
          font-weight: 700;

          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .truthlens-footer-tagline-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #3b82f6;

          box-shadow:
            0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* ================================
           FOOTER COLUMNS
           ================================ */

        .truthlens-footer-column h3 {
          margin: 2px 0 16px;

          color: #f8fafc;

          font-size: 12px;
          font-weight: 750;

          letter-spacing: 0.4px;
          text-transform: uppercase;
        }

        .truthlens-footer-links {
          display: flex;
          flex-direction: column;

          gap: 10px;
        }

        .truthlens-footer-link {
          width: fit-content;

          color: #94a3b8;

          font-size: 13px;
          font-weight: 500;

          text-decoration: none;

          transition:
            color 0.2s ease,
            transform 0.2s ease;
        }

        .truthlens-footer-link:hover {
          color: #60a5fa;

          transform: translateX(2px);
        }

        /* ================================
           BOTTOM BAR
           ================================ */

        .truthlens-footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;

          padding-top: 22px;

          border-top: 1px solid #1e293b;
        }

        .truthlens-footer-copyright {
          margin: 0;

          color: #64748b;

          font-size: 11px;
          line-height: 1.5;
        }

        .truthlens-footer-bottom-links {
          display: flex;
          align-items: center;

          gap: 18px;
        }

        .truthlens-footer-bottom-link {
          color: #64748b;

          font-size: 11px;
          font-weight: 600;

          text-decoration: none;

          transition: color 0.2s ease;
        }

        .truthlens-footer-bottom-link:hover {
          color: #60a5fa;
        }

        .truthlens-footer-divider {
          width: 3px;
          height: 3px;

          border-radius: 50%;

          background: #475569;
        }

        /* ================================
           RESPONSIVE
           ================================ */

        @media (max-width: 900px) {
          .truthlens-footer-top {
            grid-template-columns: 1.4fr 1fr 1fr;

            gap: 36px;
          }

          .truthlens-footer-brand-section {
            grid-column: 1 / -1;
          }

          .truthlens-footer-description {
            max-width: 500px;
          }
        }

        @media (max-width: 650px) {
          .truthlens-footer-container {
            padding: 38px 22px 20px;
          }

          .truthlens-footer-top {
            grid-template-columns: 1fr 1fr;

            gap: 32px 24px;

            padding-bottom: 32px;
          }

          .truthlens-footer-brand-section {
            grid-column: 1 / -1;
          }

          .truthlens-footer-bottom {
            flex-direction: column;
            align-items: flex-start;

            gap: 14px;
          }
        }

        @media (max-width: 420px) {
          .truthlens-footer-container {
            padding: 32px 18px 18px;
          }

          .truthlens-footer-top {
            grid-template-columns: 1fr;

            gap: 28px;
          }

          .truthlens-footer-brand-section {
            grid-column: auto;
          }

          .truthlens-footer-description {
            font-size: 12px;
          }

          .truthlens-footer-bottom-links {
            gap: 12px;
          }
        }

        /* ================================
           ACCESSIBILITY
           ================================ */

        .truthlens-footer a:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 3px;
          border-radius: 3px;
        }

        @media (prefers-reduced-motion: reduce) {
          .truthlens-footer-link,
          .truthlens-footer-bottom-link {
            transition: none;
          }
        }
      `}</style>

      <footer className="truthlens-footer">
        <div className="truthlens-footer-container">

          <div className="truthlens-footer-top">

            {/* Brand */}
            <div className="truthlens-footer-brand-section">
              <Link
                to="/home"
                className="truthlens-footer-brand"
              >
                <div className="truthlens-footer-logo">
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>

                <span className="truthlens-footer-brand-name">
                  TruthLens
                </span>
              </Link>

              <p className="truthlens-footer-description">
                An evidence-based AI platform designed to help
                users analyze claims, examine content, and make
                more informed decisions through transparent
                evidence analysis.
              </p>

              <div className="truthlens-footer-tagline">
                <span className="truthlens-footer-tagline-dot"></span>
                Evidence-Based AI Analysis
              </div>
            </div>

            {/* Platform */}
            <div className="truthlens-footer-column">
              <h3>Platform</h3>

              <div className="truthlens-footer-links">
                <Link
                  to="/home"
                  className="truthlens-footer-link"
                >
                  Home
                </Link>

                <Link
                  to="/text"
                  className="truthlens-footer-link"
                >
                  Text Analysis
                </Link>

                <Link
                  to="/image"
                  className="truthlens-footer-link"
                >
                  Image Analysis
                </Link>

                <Link
                  to="/video"
                  className="truthlens-footer-link"
                >
                  Video Analysis
                </Link>
              </div>
            </div>

            {/* Analysis */}
            <div className="truthlens-footer-column">
              <h3>Analysis</h3>

              <div className="truthlens-footer-links">
                <Link
                  to="/history"
                  className="truthlens-footer-link"
                >
                  Verification History
                </Link>

                <Link
                  to="/text"
                  className="truthlens-footer-link"
                >
                  Claim Verification
                </Link>

                <Link
                  to="/image"
                  className="truthlens-footer-link"
                >
                  Image Verification
                </Link>

                <Link
                  to="/video"
                  className="truthlens-footer-link"
                >
                  Video Verification
                </Link>
              </div>
            </div>

            {/* Account */}
            <div className="truthlens-footer-column">
              <h3>Account</h3>

              <div className="truthlens-footer-links">
                <Link
                  to="/login"
                  className="truthlens-footer-link"
                >
                  Sign In
                </Link>

                <Link
                  to="/signup"
                  className="truthlens-footer-link"
                >
                  Create Account
                </Link>

                <Link
                  to="/history"
                  className="truthlens-footer-link"
                >
                  Audit Log
                </Link>
              </div>
            </div>

          </div>

          {/* Bottom */}
          <div className="truthlens-footer-bottom">

            <p className="truthlens-footer-copyright">
              © {new Date().getFullYear()} TruthLens. Built for
              evidence-aware content analysis.
            </p>

            <div className="truthlens-footer-bottom-links">
              <Link
                to="/home"
                className="truthlens-footer-bottom-link"
              >
                Privacy
              </Link>

              <span className="truthlens-footer-divider"></span>

              <Link
                to="/home"
                className="truthlens-footer-bottom-link"
              >
                Terms
              </Link>

              <span className="truthlens-footer-divider"></span>

              <Link
                to="/home"
                className="truthlens-footer-bottom-link"
              >
                About
              </Link>
            </div>

          </div>

        </div>
      </footer>
    </>
  );
};

