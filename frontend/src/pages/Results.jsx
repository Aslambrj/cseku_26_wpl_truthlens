import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export const Results = () => {
  const { lastAnalysis } = useAuth();
  const navigate = useNavigate();

  if (!lastAnalysis) {
    return (
      <Navigate
        to="/home"
        replace
      />
    );
  }

  const isHighRisk =
    lastAnalysis.confidence > 80;

  return (
    <>
      <style>{`
        .results-page {
          width: 100%;

          padding: 55px 24px 70px;

          background: #f7f9fc;
        }

        .results-container {
          width: 100%;
          max-width: 1050px;

          margin: 0 auto;
        }

        .results-header {
          margin-bottom: 28px;
        }

        .results-eyebrow {
          display: inline-block;

          margin-bottom: 8px;

          color: #2563eb;

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 1px;
        }

        .results-header h1 {
          margin: 0;

          color: #0f172a;

          font-size: 30px;
          font-weight: 800;
        }

        .results-layout {
          display: grid;

          grid-template-columns:
            minmax(0, 1.5fr)
            minmax(280px, 0.7fr);

          gap: 22px;
        }

        .results-card {
          padding: 28px;

          background: #ffffff;

          border: 1px solid #e2e8f0;

          border-radius: 16px;

          box-shadow:
            0 10px 30px rgba(15, 23, 42, 0.05);
        }

        .results-card + .results-card {
          margin-top: 22px;
        }

        .results-assessment {
          margin: 7px 0 12px;

          color: #0f172a;

          font-size: 23px;
          font-weight: 800;
        }

        .results-description {
          margin: 0;

          color: #64748b;

          font-size: 14px;

          line-height: 1.7;
        }

        .results-section-title {
          margin: 0 0 16px;

          color: #0f172a;

          font-size: 16px;
          font-weight: 750;
        }

        .results-signal {
          padding: 16px;

          border: 1px solid #fee2e2;

          border-radius: 10px;

          background: #fffafa;
        }

        .results-signal-header {
          display: flex;
          justify-content: space-between;

          gap: 15px;

          margin-bottom: 7px;

          color: #334155;

          font-size: 13px;
          font-weight: 700;
        }

        .results-risk {
          color: #dc2626;
        }

        .results-signal-description {
          color: #64748b;

          font-size: 12px;

          line-height: 1.5;
        }

        .results-score-card {
          text-align: center;
        }

        .results-score-circle {
          width: 145px;
          height: 145px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin: 5px auto 22px;

          border: 10px solid;

          border-color: ${
            isHighRisk
              ? '#fecaca'
              : '#bfdbfe'
          };

          border-radius: 50%;

          background: #ffffff;
        }

        .results-score-circle span {
          color: ${
            isHighRisk
              ? '#dc2626'
              : '#2563eb'
          };

          font-size: 30px;
          font-weight: 800;
        }

        .results-score-title {
          margin-bottom: 5px;

          color: #0f172a;

          font-size: 14px;
          font-weight: 750;
        }

        .results-score-description {
          margin: 0 0 20px;

          color: #64748b;

          font-size: 12px;

          line-height: 1.5;
        }

        .results-new-button {
          width: 100%;

          height: 45px;

          border: 1px solid #2563eb;

          border-radius: 9px;

          background: #ffffff;

          color: #2563eb;

          font-family: inherit;
          font-size: 13px;
          font-weight: 700;

          cursor: pointer;

          transition:
            background-color 0.2s ease,
            color 0.2s ease;
        }

        .results-new-button:hover {
          background: #eff6ff;
        }

        .results-new-button:active {
          background: #dbeafe;
        }

        @media (max-width: 800px) {
          .results-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 520px) {
          .results-page {
            padding: 35px 16px 50px;
          }

          .results-card {
            padding: 22px;
          }
        }
      `}</style>

      <main className="results-page">
        <div className="results-container">
          <header className="results-header">
            <div className="results-eyebrow">
              ANALYSIS COMPLETE
            </div>

            <h1>
              Verification Results
            </h1>
          </header>

          <div className="results-layout">
            <div>
              <section className="results-card">
                <h2 className="results-assessment">
                  {lastAnalysis.assessment}
                </h2>

                <p className="results-description">
                  {lastAnalysis.explanation}
                </p>
              </section>

              <section className="results-card">
                <h3 className="results-section-title">
                  Evidence & Detected Signals
                </h3>

                <div className="results-signal">
                  <div className="results-signal-header">
                    <span>
                      Primary Divergence Vector
                    </span>

                    <span className="results-risk">
                      High Risk
                    </span>
                  </div>

                  <div className="results-signal-description">
                    Measured data points deviate from
                    known peer-reviewed controls.
                  </div>
                </div>
              </section>
            </div>

            <aside className="results-card results-score-card">
              <div className="results-score-circle">
                <span>
                  {lastAnalysis.confidence}%
                </span>
              </div>

              <div className="results-score-title">
                Confidence Estimate
              </div>

              <p className="results-score-description">
                Based on aggregated probability vectors
                across independent checks.
              </p>

              <button
                className="results-new-button"
                onClick={() => navigate('/text')}
              >
                Analyze New Content
              </button>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
};