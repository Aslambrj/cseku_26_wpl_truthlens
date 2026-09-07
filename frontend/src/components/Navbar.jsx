
import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <style>{`
        .truthlens-navbar {
          position: sticky;
          top: 0;
          z-index: 1000;

          width: 100%;
          min-height: 68px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 0 32px;
          box-sizing: border-box;

          background: rgba(255, 255, 255, 0.94);
          border-bottom: 1px solid #e5eaf1;

          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05);

          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        /* ================================
           BRAND
           ================================ */

        .truthlens-brand {
          display: inline-flex;
          align-items: center;
          gap: 11px;

          color: #0f172a;
          text-decoration: none;

          flex-shrink: 0;

          transition: opacity 0.2s ease;
        }

        .truthlens-brand:hover {
          opacity: 0.88;
        }

        .truthlens-brand-logo {
          width: 38px;
          height: 38px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;

          box-shadow:
            0 6px 16px rgba(37, 99, 235, 0.24);

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .truthlens-brand:hover .truthlens-brand-logo {
          transform: translateY(-1px);
          box-shadow:
            0 8px 20px rgba(37, 99, 235, 0.3);
        }

        .truthlens-brand-name {
          font-size: 18px;
          font-weight: 750;
          line-height: 1;

          letter-spacing: -0.4px;
          color: #0f172a;
        }

        .truthlens-brand-subtitle {
          margin-top: 4px;

          font-size: 8px;
          font-weight: 700;
          line-height: 1;

          letter-spacing: 0.8px;
          text-transform: uppercase;

          color: #94a3b8;
        }

        /* ================================
           NAVIGATION
           ================================ */

        .truthlens-nav-items {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .truthlens-nav-link {
          position: relative;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          min-height: 38px;
          padding: 0 13px;

          border-radius: 8px;

          color: #64748b;
          background: transparent;

          text-decoration: none;

          font-size: 13px;
          font-weight: 600;

          white-space: nowrap;

          transition:
            color 0.2s ease,
            background-color 0.2s ease,
            transform 0.15s ease;
        }

        .truthlens-nav-link:hover {
          color: #2563eb;
          background: #eff6ff;
        }

        .truthlens-nav-link:active {
          transform: scale(0.97);
        }

        .truthlens-nav-link.active {
          color: #2563eb;
          background: #eff6ff;
          font-weight: 700;
        }

        .truthlens-nav-link.active::after {
          content: "";

          position: absolute;
          left: 50%;
          bottom: -1px;

          width: 18px;
          height: 2px;

          transform: translateX(-50%);

          border-radius: 999px;

          background: #2563eb;
        }

        /* ================================
           AUTH AREA
           ================================ */

        .truthlens-auth-area {
          display: flex;
          align-items: center;
          gap: 12px;

          margin-left: 10px;
          padding-left: 14px;

          border-left: 1px solid #e5eaf1;
        }

        .truthlens-user {
          display: flex;
          align-items: center;
          gap: 8px;

          color: #475569;

          font-size: 12px;
          font-weight: 650;

          white-space: nowrap;
        }

        .truthlens-user-avatar {
          width: 30px;
          height: 30px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #eff6ff;
          border: 1px solid #dbeafe;

          color: #2563eb;

          font-size: 11px;
          font-weight: 800;

          text-transform: uppercase;
        }

        /* ================================
           BUTTONS
           ================================ */

        .truthlens-login-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          min-height: 36px;
          padding: 0 14px;

          border: 1px solid #dbe2ea;
          border-radius: 8px;

          background: #ffffff;
          color: #475569;

          font-family: inherit;
          font-size: 12px;
          font-weight: 700;

          text-decoration: none;
          cursor: pointer;

          transition:
            color 0.2s ease,
            background-color 0.2s ease,
            border-color 0.2s ease,
            transform 0.15s ease,
            box-shadow 0.2s ease;
        }

        .truthlens-login-button:hover {
          color: #2563eb;
          background: #eff6ff;
          border-color: #bfdbfe;

          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08);
        }

        .truthlens-login-button:active {
          transform: scale(0.97);
        }

        .truthlens-signup-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          min-height: 36px;
          padding: 0 15px;

          border: 1px solid #2563eb;
          border-radius: 8px;

          background: #2563eb;
          color: #ffffff;

          font-family: inherit;
          font-size: 12px;
          font-weight: 700;

          text-decoration: none;
          cursor: pointer;

          box-shadow: 0 5px 14px rgba(37, 99, 235, 0.18);

          transition:
            background-color 0.2s ease,
            border-color 0.2s ease,
            transform 0.15s ease,
            box-shadow 0.2s ease;
        }

        .truthlens-signup-button:hover {
          background: #1d4ed8;
          border-color: #1d4ed8;

          transform: translateY(-1px);

          box-shadow: 0 7px 18px rgba(37, 99, 235, 0.25);
        }

        .truthlens-signup-button:active {
          transform: translateY(0);
        }

        .truthlens-logout-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          min-height: 34px;
          padding: 0 12px;

          border: 1px solid #dbe2ea;
          border-radius: 8px;

          background: #ffffff;
          color: #64748b;

          font-family: inherit;
          font-size: 11px;
          font-weight: 700;

          cursor: pointer;

          transition:
            color 0.2s ease,
            background-color 0.2s ease,
            border-color 0.2s ease,
            transform 0.15s ease;
        }

        .truthlens-logout-button:hover {
          color: #2563eb;
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        .truthlens-logout-button:active {
          transform: scale(0.97);
        }

        /* ================================
           TABLET
           ================================ */

        @media (max-width: 1050px) {
          .truthlens-navbar {
            padding: 0 22px;
          }

          .truthlens-nav-link {
            padding: 0 9px;
            font-size: 12px;
          }

          .truthlens-user-name {
            display: none;
          }

          .truthlens-auth-area {
            gap: 8px;
            padding-left: 10px;
          }
        }

        /* ================================
           MOBILE
           ================================ */

        @media (max-width: 760px) {
          .truthlens-navbar {
            min-height: 62px;
            padding: 0 16px;
          }

          .truthlens-brand-name {
            font-size: 16px;
          }

          .truthlens-brand-subtitle {
            display: none;
          }

          .truthlens-brand-logo {
            width: 34px;
            height: 34px;
            border-radius: 9px;
          }

          .truthlens-nav-items {
            gap: 2px;
          }

          .truthlens-nav-link {
            min-height: 34px;
            padding: 0 7px;
            font-size: 11px;
          }

          .truthlens-auth-area {
            margin-left: 4px;
            padding-left: 7px;
          }

          .truthlens-user-avatar {
            width: 28px;
            height: 28px;
          }

          .truthlens-logout-button {
            padding: 0 9px;
            font-size: 10px;
          }

          .truthlens-login-button {
            padding: 0 10px;
            font-size: 11px;
          }

          .truthlens-signup-button {
            padding: 0 10px;
            font-size: 11px;
          }
        }

        /* ================================
           SMALL MOBILE
           ================================ */

        @media (max-width: 560px) {
          .truthlens-navbar {
            flex-wrap: wrap;
            min-height: auto;
            padding: 10px 14px;
            gap: 8px;
          }

          .truthlens-brand {
            margin-right: auto;
          }

          .truthlens-nav-items {
            width: 100%;

            display: flex;
            justify-content: center;

            padding-top: 6px;

            border-top: 1px solid #f1f5f9;

            overflow-x: auto;
            scrollbar-width: none;
          }

          .truthlens-nav-items::-webkit-scrollbar {
            display: none;
          }

          .truthlens-nav-link {
            flex-shrink: 0;
          }

          .truthlens-auth-area {
            border-left: none;
            padding-left: 0;
          }

          .truthlens-user {
            display: none;
          }
        }

        /* ================================
           ACCESSIBILITY
           ================================ */

        .truthlens-brand:focus-visible,
        .truthlens-nav-link:focus-visible,
        .truthlens-login-button:focus-visible,
        .truthlens-signup-button:focus-visible,
        .truthlens-logout-button:focus-visible {
          outline: 3px solid rgba(37, 99, 235, 0.2);
          outline-offset: 2px;
        }

        /* ================================
           REDUCED MOTION
           ================================ */

        @media (prefers-reduced-motion: reduce) {
          .truthlens-brand,
          .truthlens-brand-logo,
          .truthlens-nav-link,
          .truthlens-login-button,
          .truthlens-signup-button,
          .truthlens-logout-button {
            transition: none;
          }
        }
      `}</style>

      <nav className="truthlens-navbar">
        {/* Brand */}
        <Link to="/" className="truthlens-brand">
          <div className="truthlens-brand-logo">
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

          <div>
            <div className="truthlens-brand-name">
              TruthLens
            </div>

            <div className="truthlens-brand-subtitle">
              Evidence-Based AI Analysis
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <div className="truthlens-nav-items">
          {isAuthenticated ? (
            <>
              <NavLink
                to="/home"
                className={({ isActive }) =>
                  `truthlens-nav-link ${isActive ? 'active' : ''}`
                }
              >
                Home
              </NavLink>

              <NavLink
                to="/text"
                className={({ isActive }) =>
                  `truthlens-nav-link ${isActive ? 'active' : ''}`
                }
              >
                Text Analysis
              </NavLink>

              <NavLink
                to="/image"
                className={({ isActive }) =>
                  `truthlens-nav-link ${isActive ? 'active' : ''}`
                }
              >
                Image Analysis
              </NavLink>

              <NavLink
                to="/video"
                className={({ isActive }) =>
                  `truthlens-nav-link ${isActive ? 'active' : ''}`
                }
              >
                Video Analysis
              </NavLink>

              <NavLink
                to="/history"
                className={({ isActive }) =>
                  `truthlens-nav-link ${isActive ? 'active' : ''}`
                }
              >
                History
              </NavLink>

              {user?.role === 'admin' && (
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) =>
                    `truthlens-nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  Admin
                </NavLink>
              )}

              <div className="truthlens-auth-area">
                <div className="truthlens-user">
                  <div className="truthlens-user-avatar">
                    {user?.name?.charAt(0) || 'U'}
                  </div>

                  <span className="truthlens-user-name">
                    {user?.name || 'User'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="truthlens-logout-button"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="truthlens-login-button"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="truthlens-signup-button"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
};
