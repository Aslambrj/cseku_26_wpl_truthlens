import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { createAnalysisShareLink } from '../services/analysisService';

export const Results = () => {
  const { lastAnalysis } = useAuth();
  const navigate = useNavigate();
  const [shareUrl, setShareUrl] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  if (!lastAnalysis) {
    return (
      <Navigate
        to="/home"
        replace
      />
    );
  }

  const hasModelResult = Number.isFinite(lastAnalysis.confidence);
  const isHighRisk = hasModelResult && lastAnalysis.confidence > 80;
  const handleShare = async () => {
    if (!lastAnalysis.analysisId || isSharing) return;
    setIsSharing(true);
    setShareMessage('');
    try {
      const { shareUrl: url } = await createAnalysisShareLink(lastAnalysis.analysisId);
      setShareUrl(url);
      try {
        await navigator.clipboard.writeText(url);
        setShareMessage('Share link copied to clipboard.');
      } catch {
        setShareMessage('Your share link is ready below.');
      }
    } catch (error) {
      setShareMessage(error.message || 'Could not create the share link.');
    } finally {
      setIsSharing(false);
    }
  };

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

        .results-image {
          width: 100%;
          max-height: 430px;

          display: block;

          object-fit: contain;

          border: 1px solid #e2e8f0;

          border-radius: 10px;

          background: #f8fafc;
        }

        .results-image-name {
          margin: 12px 0 0;

          color: #64748b;

          font-size: 12px;

          word-break: break-word;
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

        .results-submitted-text {
          margin: 0;
          padding: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: #f8fafc;
          color: #334155;
          font-size: 14px;
          line-height: 1.7;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .results-claim-list,
        .results-evidence-list {
          display: grid;
          gap: 12px;
        }

        .results-claim-item,
        .results-evidence-item {
          padding: 15px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: #fcfdff;
        }

        .results-claim-meta,
        .results-evidence-meta {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
          color: #64748b;
          font-size: 11px;
        }

        .results-claim-verdict {
          color: #1d4ed8;
          font-weight: 750;
        }

        .results-claim-text {
          margin: 0 0 7px;
          color: #1e293b;
          font-size: 13px;
          font-weight: 700;
          line-height: 1.6;
        }

        .results-claim-explanation,
        .results-evidence-excerpt,
        .results-source-summary {
          margin: 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.65;
        }

        .results-evidence-link {
          color: #1d4ed8;
          font-size: 13px;
          font-weight: 720;
          line-height: 1.5;
          text-decoration: none;
          overflow-wrap: anywhere;
        }

        .results-evidence-link:hover {
          text-decoration: underline;
        }

        .results-evidence-domain {
          color: #94a3b8;
          font-size: 11px;
        }

        .results-share-button {
          width: 100%;
          min-height: 44px;
          margin-bottom: 10px;
          border: 0;
          border-radius: 9px;
          background: #2563eb;
          color: #fff;
          font-family: inherit;
          font-size: 13px;
          font-weight: 750;
          cursor: pointer;
        }

        .results-share-button:hover:not(:disabled) {
          background: #1d4ed8;
        }

        .results-share-button:disabled {
          cursor: wait;
          opacity: 0.7;
        }

        .results-share-message {
          margin: 0 0 8px;
          color: #64748b;
          font-size: 11px;
          line-height: 1.5;
        }

        .results-share-link {
          display: block;
          margin-bottom: 15px;
          color: #1d4ed8;
          font-size: 11px;
          line-height: 1.5;
          overflow-wrap: anywhere;
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
              {hasModelResult ? 'ANALYSIS COMPLETE' : 'MODEL IN PROGRESS'}
            </div>

            <h1>
              Verification Results
            </h1>
          </header>

          <div className="results-layout">
            <div>
              <section className="results-card">
                <h2 className="results-assessment">
                  {hasModelResult ? lastAnalysis.assessment : 'Your analysis is queued'}
                </h2>

                <p className="results-description">
                  {hasModelResult
                    ? lastAnalysis.explanation
                    : 'Your submission was saved successfully. The verification model is currently being connected, so detailed results will appear here when processing is available.'}
                </p>
              </section>

              {lastAnalysis.type === 'text' && lastAnalysis.content && (
                <section className="results-card">
                  <h3 className="results-section-title">Submitted Text</h3>
                  <p className="results-submitted-text">{lastAnalysis.content}</p>
                </section>
              )}

              {lastAnalysis.imagePreview && (
                <section className="results-card">
                  <h3 className="results-section-title">
                    Submitted Image
                  </h3>

                  <img
                    src={lastAnalysis.imagePreview}
                    alt={`Submitted image: ${lastAnalysis.imageName || 'analysis input'}`}
                    className="results-image"
                  />

                  {lastAnalysis.imageName && (
                    <p className="results-image-name">
                      {lastAnalysis.imageName}
                    </p>
                  )}
                </section>
              )}

              {lastAnalysis.type === 'text' ? (
                <>
                  {lastAnalysis.claims?.length > 0 && (
                    <section className="results-card">
                      <h3 className="results-section-title">Claim breakdown</h3>
                      <div className="results-claim-list">
                        {lastAnalysis.claims.map((claim, index) => (
                          <article className="results-claim-item" key={`${index}-${claim.text}`}>
                            <div className="results-claim-meta">
                              <span>Claim {index + 1}</span>
                              <span className="results-claim-verdict">{claim.verdict} · {claim.confidence}%</span>
                            </div>
                            <p className="results-claim-text">{claim.text}</p>
                            {claim.explanation && <p className="results-claim-explanation">{claim.explanation}</p>}
                          </article>
                        ))}
                      </div>
                    </section>
                  )}

                  {lastAnalysis.sourceCheck?.url && (
                    <section className="results-card">
                      <h3 className="results-section-title">Source check</h3>
                      <p className="results-source-summary">
                        {lastAnalysis.sourceCheck.summary || 'This page was submitted for comparison with the claim.'}
                      </p>
                      <p style={{ margin: '10px 0 0' }}>
                        <a className="results-evidence-link" href={lastAnalysis.sourceCheck.url} target="_blank" rel="noreferrer">
                          Open submitted source ↗
                        </a>
                      </p>
                    </section>
                  )}

                  <section className="results-card">
                    <h3 className="results-section-title">Evidence links</h3>
                    {lastAnalysis.evidence?.length ? (
                      <div className="results-evidence-list">
                        {lastAnalysis.evidence.map((source) => (
                          <article className="results-evidence-item" key={source.url}>
                            <div className="results-evidence-meta">
                              <span>{source.kind === 'provided' ? 'Submitted source' : 'Web evidence'}</span>
                              <span className="results-evidence-domain">{(() => { try { return new URL(source.url).hostname; } catch { return ''; } })()}</span>
                            </div>
                            <a className="results-evidence-link" href={source.url} target="_blank" rel="noreferrer">
                              {source.title || source.url} ↗
                            </a>
                            {source.excerpt && <p className="results-evidence-excerpt">{source.excerpt}</p>}
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="results-source-summary">No web citations were returned for this review.</p>
                    )}
                  </section>
                </>
              ) : (
                <section className="results-card">
                  <h3 className="results-section-title">Evidence & Detected Signals</h3>
                  <div className="results-signal">
                    <div className="results-signal-header">
                      <span>Primary Divergence Vector</span>
                      <span className="results-risk">{hasModelResult ? 'High Risk' : 'Processing'}</span>
                    </div>
                    <div className="results-signal-description">
                      {hasModelResult ? 'Measured data points deviate from known peer-reviewed controls.' : 'The model has not returned confidence or signal data yet.'}
                    </div>
                  </div>
                </section>
              )}
            </div>

            <aside className="results-card results-score-card">
              <div className="results-score-circle">
                <span>
                  {hasModelResult ? `${lastAnalysis.confidence}%` : 'Pending'}
                </span>
              </div>

              <div className="results-score-title">
                {hasModelResult ? 'Confidence Estimate' : 'Model Status'}
              </div>

              <p className="results-score-description">
                {hasModelResult
                  ? (lastAnalysis.type === 'text' ? 'The model’s confidence in its assessment of this claim.' : 'Based on aggregated probability vectors across independent checks.')
                  : 'The analysis record is stored. Detailed scoring will be available after the model is connected.'}
              </p>

              {lastAnalysis.type === 'text' && lastAnalysis.analysisId && (
                <>
                  <button className="results-share-button" onClick={handleShare} disabled={isSharing}>
                    {isSharing ? 'Creating link…' : shareUrl ? 'Copy share link again' : 'Share report'}
                  </button>
                  {shareMessage && <p className="results-share-message" role="status">{shareMessage}</p>}
                  {shareUrl && <a className="results-share-link" href={shareUrl}>{shareUrl}</a>}
                </>
              )}

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
