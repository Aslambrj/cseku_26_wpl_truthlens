import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { createAnalysisShareLink } from '../services/analysisService';

export const Results = () => {
  const { lastAnalysis } = useAuth();
  const navigate = useNavigate();
  const [shareUrl, setShareUrl] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const videoElementRef = useRef(null);

  useEffect(() => {
    const videoFile = lastAnalysis?.videoFile;
    const videoElement = videoElementRef.current;
    if (!videoFile || !videoElement) return undefined;

    const previewUrl = URL.createObjectURL(videoFile);
    videoElement.src = previewUrl;
    return () => {
      videoElement.removeAttribute('src');
      videoElement.load();
      URL.revokeObjectURL(previewUrl);
    };
  }, [lastAnalysis?.videoFile]);

  if (!lastAnalysis) {
    return (
      <Navigate
        to="/home"
        replace
      />
    );
  }

  const imageConfidence = Number(lastAnalysis.label === 'AI-Generated' ? lastAnalysis.aiProbability : lastAnalysis.realProbability);
  const displayedConfidence = lastAnalysis.type === 'image' && !Number.isFinite(lastAnalysis.confidence)
    ? imageConfidence
    : Number(lastAnalysis.confidence);
  const hasModelResult = Number.isFinite(displayedConfidence);
  const verdict = lastAnalysis.assessment || lastAnalysis.verdict || lastAnalysis.label;
  const outcome = String(lastAnalysis.verdict || lastAnalysis.label || lastAnalysis.assessment || '').toLowerCase();
  const isNegativeOutcome = hasModelResult && (
    lastAnalysis.type === 'image'
      ? outcome.includes('ai-generated')
      : lastAnalysis.type === 'video'
        ? ['fake', 'manipulated', 'deepfake'].some((term) => outcome.includes(term))
        : ['unsupported', 'misleading', 'unverified', 'suspicious', 'suspect', 'misinformation'].some((term) => outcome.includes(term))
  );
  const isPositiveOutcome = hasModelResult && (
    lastAnalysis.type === 'image'
      ? outcome.includes('authentic') || outcome.includes('real')
      : lastAnalysis.type === 'video'
        ? outcome.includes('real') || outcome.includes('authentic')
        : outcome === 'supported'
  );
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

          align-items: start;
          gap: 22px;
        }

        .results-details {
          grid-column: 1;
          grid-row: 1;
          min-height: 0;
          max-height: calc(100vh - 240px + 1cm);
          overflow-y: auto;
          overscroll-behavior: contain;
          padding-right: 8px;
          scrollbar-gutter: stable;
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

        .results-video-preview {
          display: block;
          width: 100%;
          max-height: 430px;
          aspect-ratio: 16 / 9;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: #0f172a;
          object-fit: contain;
        }

        .results-assessment {
          margin: 7px 0 12px;

          color: #0f172a;

          font-size: 23px;
          font-weight: 800;
        }

        .results-description {
          margin: 0;
          white-space: pre-line;

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

        .results-video-steps {
          margin: 14px 0 0;
          padding-left: 20px;
          color: #64748b;
          font-size: 13px;
          line-height: 1.8;
        }

        .results-video-frame-count {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin: 14px 0 0;
          color: #334155;
          font-size: 13px;
        }

        .results-video-frame-count strong {
          color: #0f172a;
          font-size: 18px;
        }

        .results-video-frames-title {
          margin: 20px 0 10px;
          color: #0f172a;
          font-size: 14px;
          font-weight: 750;
        }

        .results-video-frame-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(115px, 1fr));
          gap: 12px;
        }

        .results-video-frame-card {
          min-width: 0;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 9px;
          background: #f8fafc;
        }

        .results-video-frame-image {
          display: block;
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          background: #e2e8f0;
        }

        .results-video-frame-caption {
          padding: 7px 8px;
          color: #475569;
          font-size: 11px;
          line-height: 1.4;
        }

        .results-score-card {
          position: sticky;
          top: 88px;
          grid-column: 2;
          grid-row: 1;
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
            isNegativeOutcome
              ? '#dc2626'
              : isPositiveOutcome ? '#bbf7d0' : '#bfdbfe'
          };

          border-radius: 50%;

          background: #ffffff;
        }

        .results-score-circle span {
          color: ${
            isNegativeOutcome
              ? '#dc2626'
              : isPositiveOutcome ? '#16a34a' : '#2563eb'
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

        .results-score-verdict {
          margin: 0 0 12px;
          color: ${
            isNegativeOutcome
              ? '#dc2626'
              : isPositiveOutcome ? '#16a34a' : '#334155'
          };
          font-size: 13px;
          font-weight: 750;
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

          .results-score-card {
            top: 72px;
            grid-column: 1;
            grid-row: 1;
          }

          .results-details {
            grid-column: 1;
            grid-row: 2;
            max-height: calc(100vh - 330px + 1cm);
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
            <div className="results-details">
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
              {lastAnalysis.type === 'video' && lastAnalysis.videoName && (
                <section className="results-card">
                  <h3 className="results-section-title">Analyzed Video</h3>
                  {lastAnalysis.videoFile && (
                    <video
                      ref={videoElementRef}
                      controls
                      preload="metadata"
                      className="results-video-preview"
                      aria-label={`Analyzed video: ${lastAnalysis.videoName}`}
                    />
                  )}
                  <p className="results-image-name">{lastAnalysis.videoName}</p>
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
              ) : lastAnalysis.type === 'image' ? (
                <section className="results-card">
                  <h3 className="results-section-title">How to read this image result</h3>
                  <div className="results-signal">
                    <div className="results-signal-header">
                      <span>Model estimates</span>
                      <span>{hasModelResult ? lastAnalysis.label : 'Processing'}</span>
                    </div>
                    <div className="results-signal-description">
                      {hasModelResult
                        ? `AI-generated probability: ${lastAnalysis.aiProbability}%. Real-image probability: ${lastAnalysis.realProbability}%. The model labels an image AI-generated when its AI probability reaches the ${(Number(lastAnalysis.threshold ?? 0.3) * 100).toFixed(0)}% threshold. The confidence score shows the probability for the selected label. These are estimates from the model, not proof of how the image was created.`
                        : 'The model has not returned image probabilities yet.'}
                    </div>
                  </div>
                </section>
              ) : (
                <section className="results-card">
                  <h3 className="results-section-title">Video analysis details</h3>
                  {hasModelResult && (
                    <p className="results-video-frame-count">
                      <strong>{lastAnalysis.framesAnalyzed}</strong>
                      <span>frames analyzed · sampled up to 12 across the video</span>
                    </p>
                  )}
                  <div className="results-signal">
                    <div className="results-signal-header">
                      <span>Frame score summary</span>
                      <span>{hasModelResult ? lastAnalysis.label : 'Processing'}</span>
                    </div>
                    <div className="results-signal-description">
                      {hasModelResult
                        ? `The model sampled up to 12 frames across the video and analyzed ${lastAnalysis.framesAnalyzed}. Average fake probability: ${lastAnalysis.fakeProbability}%. Average real probability: ${lastAnalysis.realProbability}%. The decision threshold is ${(Number(lastAnalysis.threshold ?? 0.2) * 100).toFixed(0)}%, so the model labels the video FAKE only when its fake probability reaches that threshold.${lastAnalysis.faceFallbackUsed ? ' It used center crops because no faces were detected; treat this result as less reliable.' : ` Faces were detected in ${lastAnalysis.framesWithFace} frames.`}`
                        : 'The video model has not returned an analysis yet.'}
                    </div>
                  </div>
                  <ol className="results-video-steps">
                    <li>Sample up to 12 frames across the video.</li>
                    <li>Detect faces and score the sampled frames.</li>
                    <li>Average frame scores and compare with the decision threshold.</li>
                  </ol>
                  {lastAnalysis.sampledFrames?.length > 0 && (
                    <>
                      <h4 className="results-video-frames-title">Frames analyzed by the model</h4>
                      <div className="results-video-frame-grid">
                        {lastAnalysis.sampledFrames.map((frame) => (
                          <figure className="results-video-frame-card" key={frame.frame}>
                            <img
                              className="results-video-frame-image"
                              src={frame.preview}
                              alt={`Analyzed video frame ${frame.frame}`}
                              loading="lazy"
                            />
                            <figcaption className="results-video-frame-caption">
                              Frame {frame.frame} · {Math.round(frame.fake_probability * 100)}% fake score
                            </figcaption>
                          </figure>
                        ))}
                      </div>
                    </>
                  )}
                </section>
              )}
            </div>

            <aside className="results-card results-score-card">
              <div className="results-score-circle">
                <span>
                  {hasModelResult ? `${displayedConfidence}%` : 'Pending'}
                </span>
              </div>

              <div className="results-score-title">
                {hasModelResult ? (lastAnalysis.type === 'video'
                  ? 'Decision Confidence'
                  : lastAnalysis.type === 'image'
                    ? `${lastAnalysis.label === 'AI-Generated' ? 'AI' : 'Real'} Confidence`
                    : 'Confidence Estimate') : 'Model Status'}
              </div>

              {verdict && (
                <p className="results-score-verdict">
                  Verdict: {verdict}
                </p>
              )}

              <p className="results-score-description">
                {hasModelResult
                  ? (lastAnalysis.type === 'text'
                    ? 'The model’s confidence in its assessment of this claim.'
                    : lastAnalysis.type === 'video'
                      ? 'A threshold-distance heuristic, not the fake probability. A 53% score does not mean a 53% chance the video is fake.'
                      : lastAnalysis.type === 'image'
                        ? 'Probability estimate for the selected image label.'
                        : 'Based on aggregated probability vectors across independent checks.')
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
                onClick={() => navigate(lastAnalysis.type === 'image' ? '/image' : lastAnalysis.type === 'video' ? '/video' : '/text')}
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
