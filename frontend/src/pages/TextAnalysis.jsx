import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const TextAnalysis = ({
  runAnalysisPipeline
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [text, setText] = useState(
    location.state?.claim || ''
  );

  const handleRun = () => {
    runAnalysisPipeline(
      'text',
      text || 'Custom claim evaluation',
      () => navigate('/results')
    );
  };

  const handleExample = () => {
    setText(
      'Studies published in mid-2026 show that global ocean surface temperatures have fully stabilized to 1990 baseline averages.'
    );
  };

  return (
    <>
      <style>{`
        .text-page {
  width: 100%;

  padding: 55px 24px 70px;

  box-sizing: border-box;

  background: #f7f9fc;
}

        .text-container {
          width: 100%;
          max-width: 1050px;

          margin: 0 auto;
        }

        .text-header {
          margin-bottom: 28px;
        }

        .text-header h1 {
          margin: 0 0 8px;

          color: #0f172a;

          font-size: 30px;
          font-weight: 800;

          letter-spacing: -0.7px;
        }

        .text-header p {
          margin: 0;

          color: #64748b;

          font-size: 14px;

          line-height: 1.6;
        }

        .text-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(280px, 0.8fr);

          gap: 22px;
        }

        .text-card {
          padding: 28px;

          background: #ffffff;

          border: 1px solid #e2e8f0;

          border-radius: 16px;

          box-shadow:
            0 10px 30px rgba(15, 23, 42, 0.05);
        }

        .text-card-title {
          margin: 0 0 8px;

          color: #0f172a;

          font-size: 19px;
          font-weight: 750;
        }

        .text-card-description {
          margin: 0 0 20px;

          color: #64748b;

          font-size: 13px;

          line-height: 1.6;
        }

        .text-area {
          width: 100%;
          min-height: 170px;

          box-sizing: border-box;

          padding: 14px;

          resize: vertical;

          border: 1px solid #dbe2ea;

          border-radius: 10px;

          outline: none;

          background: #ffffff;

          color: #0f172a;

          font-family: inherit;
          font-size: 14px;

          line-height: 1.6;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .text-area:hover {
          border-color: #93c5fd;
        }

        .text-area:focus {
          border-color: #2563eb;

          box-shadow:
            0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .text-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;

          gap: 12px;

          margin-top: 14px;
        }

        .text-outline-button,
        .text-primary-button {
          min-height: 44px;

          padding: 0 17px;

          border-radius: 8px;

          font-family: inherit;
          font-size: 13px;
          font-weight: 700;

          cursor: pointer;

          transition:
            background-color 0.2s ease,
            color 0.2s ease,
            border-color 0.2s ease,
            transform 0.15s ease;
        }

        .text-outline-button {
          border: 1px solid #cbd5e1;

          background: #ffffff;

          color: #334155;
        }

        .text-outline-button:hover {
          border-color: #2563eb;

          background: #eff6ff;

          color: #2563eb;
        }

        .text-outline-button:active {
          background: #dbeafe;
        }

        .text-primary-button {
          border: none;

          background: #2563eb;

          color: #ffffff;
        }

        .text-primary-button:hover {
          background: #1d4ed8;

          transform: translateY(-1px);
        }

        .text-primary-button:active {
          background: #1e40af;

          transform: translateY(0);
        }

        .text-info-card {
          background: #fafafa;
        }

        .text-info-title {
          margin: 0 0 16px;

          color: #0f172a;

          font-size: 12px;
          font-weight: 800;

          letter-spacing: 1px;
        }

        .text-steps {
          margin: 0;

          padding-left: 20px;

          color: #64748b;

          font-size: 13px;

          line-height: 2;
        }

        .text-step-highlight {
          color: #2563eb;

          font-weight: 650;
        }

        @media (max-width: 800px) {
          .text-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 520px) {
          .text-page {
            padding: 35px 16px 50px;
          }

          .text-card {
            padding: 22px;
          }

          .text-header h1 {
            font-size: 26px;
          }

          .text-actions {
            flex-direction: column-reverse;
            align-items: stretch;
          }
        }
      `}</style>

      <main className="text-page">
        <div className="text-container">
          <header className="text-header">
            <h1>
              Text Claim Analysis
            </h1>

            <p>
              Evaluate factual statements against
              indexed evidence and empirical sources.
            </p>
          </header>

          <div className="text-layout">
            <section className="text-card">
              <h2 className="text-card-title">
                Analyze a Claim
              </h2>

              <p className="text-card-description">
                Enter a factual statement to evaluate
                its evidence, source authority, and
                potential contradictions.
              </p>

              <textarea
                className="text-area"
                rows="6"
                value={text}
                onChange={(e) =>
                  setText(e.target.value)
                }
                placeholder="Enter a factual claim..."
              />

              <div className="text-actions">
                <button
                  className="text-outline-button"
                  onClick={handleExample}
                >
                  Try Example
                </button>

                <button
                  className="text-primary-button"
                  onClick={handleRun}
                >
                  Analyze Claim →
                </button>
              </div>
            </section>

            <aside className="text-card text-info-card">
              <h3 className="text-info-title">
                HOW IT WORKS
              </h3>

              <ol className="text-steps">
                <li>
                  <span className="text-step-highlight">
                    Semantic entity extraction
                  </span>
                </li>

                <li>
                  Cross-reference indexed evidence nodes.
                </li>

                <li>
                  Calculate confidence based on source
                  authority.
                </li>

                <li>
                  Generate transparent explanation logic.
                </li>
              </ol>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
};