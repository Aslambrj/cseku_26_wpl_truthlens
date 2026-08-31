import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
  const [claim, setClaim] = useState('');
  const [activeType, setActiveType] = useState('text');

  const navigate = useNavigate();

  const handleSubmit = () => {
    navigate('/text', {
      state: {
        claim
      }
    });
  };

  const handleTypeChange = (type, path) => {
    setActiveType(type);
    navigate(path);
  };

  return (
    <>
      <style>{`
        .home-page {
  width: 100%;

  box-sizing: border-box;

  padding: 70px 24px 50px;

          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(37, 99, 235, 0.08),
              transparent 38%
            ),
            #f7f9fc;
        }

        .home-container {
          width: 100%;
          max-width: 920px;

          margin: 0 auto;
        }

        .home-hero {
          margin-bottom: 42px;

          text-align: center;
        }

        .home-eyebrow {
          display: inline-flex;
          align-items: center;

          margin-bottom: 14px;

          color: #2563eb;

          font-size: 11px;
          font-weight: 800;

          letter-spacing: 1.4px;
        }

        .home-eyebrow::before {
          content: "";

          width: 6px;
          height: 6px;

          margin-right: 8px;

          border-radius: 50%;

          background: #2563eb;
        }

        .home-hero h1 {
          margin: 0;

          color: #0f172a;

          font-size: clamp(34px, 5vw, 52px);
          font-weight: 800;

          line-height: 1.08;
          letter-spacing: -1.8px;
        }

        .home-hero h1 span {
          color: #2563eb;
        }

        .home-hero p {
          max-width: 650px;

          margin: 18px auto 0;

          color: #64748b;

          font-size: 15px;

          line-height: 1.7;
        }

        .home-card {
          width: 100%;

          box-sizing: border-box;

          padding: 28px;

          background: rgba(255, 255, 255, 0.97);

          border: 1px solid #e2e8f0;

          border-radius: 18px;

          box-shadow:
            0 20px 50px rgba(15, 23, 42, 0.07);
        }

        .home-type-selector {
          display: grid;
          grid-template-columns: repeat(3, 1fr);

          gap: 12px;

          margin-bottom: 22px;
        }

        .home-type-pill {
          padding: 18px;

          border: 1px solid #e2e8f0;

          border-radius: 12px;

          background: #ffffff;

          cursor: pointer;

          transition:
            border-color 0.2s ease,
            background-color 0.2s ease,
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .home-type-pill:hover {
          border-color: #93c5fd;

          background: #eff6ff;

          transform: translateY(-1px);
        }

        .home-type-pill.active {
          border-color: #2563eb;

          background: #eff6ff;

          box-shadow:
            0 0 0 1px rgba(37, 99, 235, 0.08);
        }

        .home-type-title {
          margin-bottom: 6px;

          color: #0f172a;

          font-size: 14px;
          font-weight: 750;
        }

        .home-type-pill.active .home-type-title {
          color: #2563eb;
        }

        .home-type-desc {
          color: #64748b;

          font-size: 11px;

          line-height: 1.5;
        }

        .home-search-row {
          display: flex;
          gap: 12px;
        }

        .home-search-input {
          flex: 1;

          min-width: 0;

          height: 48px;

          box-sizing: border-box;

          padding: 0 15px;

          border: 1px solid #dbe2ea;

          border-radius: 9px;

          outline: none;

          background: #ffffff;

          color: #0f172a;

          font-family: inherit;
          font-size: 14px;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .home-search-input::placeholder {
          color: #a0aec0;
        }

        .home-search-input:hover {
          border-color: #93c5fd;
        }

        .home-search-input:focus {
          border-color: #2563eb;

          box-shadow:
            0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .home-analyze-button {
          min-width: 145px;

          padding: 0 20px;

          border: none;

          border-radius: 9px;

          background: #2563eb;

          color: #ffffff;

          font-family: inherit;
          font-size: 13px;
          font-weight: 700;

          cursor: pointer;

          transition:
            background-color 0.2s ease,
            transform 0.15s ease,
            box-shadow 0.2s ease;
        }

        .home-analyze-button:hover {
          background: #1d4ed8;

          transform: translateY(-1px);

          box-shadow:
            0 8px 18px rgba(37, 99, 235, 0.22);
        }

        .home-analyze-button:active {
          background: #1e40af;

          transform: translateY(0);
        }

        @media (max-width: 720px) {
          .home-page {
            padding: 50px 18px 60px;
          }

          .home-type-selector {
            grid-template-columns: 1fr;
          }

          .home-search-row {
            flex-direction: column;
          }

          .home-analyze-button {
            height: 48px;
          }
        }

        @media (max-width: 480px) {
          .home-card {
            padding: 20px;
          }

          .home-hero h1 {
            font-size: 32px;
          }

          .home-hero p {
            font-size: 13px;
          }
        }
      `}</style>

      <main className="home-page">
        <div className="home-container">
          <section className="home-hero">
            <div className="home-eyebrow">
              EVIDENCE-BASED ANALYSIS
            </div>

            <h1>
              See Beyond Content.
              <br />
              <span>Find the Evidence.</span>
            </h1>

            <p>
              Analyze claims, images, and video with
              evidence-aware AI detection models.
            </p>
          </section>

          <section className="home-card">
            <div className="home-type-selector">
              <div
                className={`home-type-pill ${
                  activeType === 'text'
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  handleTypeChange('text', '/text')
                }
              >
                <div className="home-type-title">
                  Text Claim
                </div>

                <div className="home-type-desc">
                  Cross-reference statements against
                  empirical literature.
                </div>
              </div>

              <div
                className={`home-type-pill ${
                  activeType === 'image'
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  handleTypeChange('image', '/image')
                }
              >
                <div className="home-type-title">
                  Image Analysis
                </div>

                <div className="home-type-desc">
                  Detect synthetic patterns and
                  diffusion anomalies.
                </div>
              </div>

              <div
                className={`home-type-pill ${
                  activeType === 'video'
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  handleTypeChange('video', '/video')
                }
              >
                <div className="home-type-title">
                  Video Analysis
                </div>

                <div className="home-type-desc">
                  Check frame continuity and
                  manipulation signals.
                </div>
              </div>
            </div>

            <div className="home-search-row">
              <input
                type="text"
                value={claim}
                onChange={(e) =>
                  setClaim(e.target.value)
                }
                placeholder="Paste a factual claim, paper title, or quote..."
                className="home-search-input"
              />

              <button
                className="home-analyze-button"
                onClick={handleSubmit}
              >
                Analyze Claim
              </button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};