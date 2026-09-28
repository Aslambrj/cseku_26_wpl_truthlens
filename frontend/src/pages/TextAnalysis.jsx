import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export const TextAnalysis = ({ runAnalysisPipeline }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { submitTextAnalysis } = useAuth();
  const [text, setText] = useState(location.state?.claim || '');
  const [sourceUrl, setSourceUrl] = useState('');
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const remainingCharacters = 5000 - text.length;

  const handleRun = async () => {
    const content = text.trim();
    if (!content || isAnalyzing) {
      setError('Add a claim before starting your review.');
      return;
    }

    const checkedSourceUrl = sourceUrl.trim();
    if (checkedSourceUrl) {
      try {
        const parsedUrl = new URL(checkedSourceUrl);
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error();
      } catch {
        setError('Enter a valid source link beginning with https:// or http://.');
        return;
      }
    }

    setIsAnalyzing(true);
    setError('');
    try {
      await submitTextAnalysis(content, checkedSourceUrl);
      runAnalysisPipeline('text', content, () => navigate('/results'));
    } catch (analysisError) {
      setError(analysisError.message);
      setIsAnalyzing(false);
    }
  };

  const handleExample = () => {
    setText('Water boils at 100°C at sea level.');
    setError('');
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
    if (error) setError('');
  };

  return (
    <>
      <style>{`
        .text-page {
          min-height: calc(100vh - 150px);
          box-sizing: border-box;
          padding: 52px 24px 76px;
          background:
            radial-gradient(ellipse at 8% 0%, rgba(219, 234, 254, 0.62), transparent 34%),
            #f6f8fc;
        }

        .text-container {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
        }

        .text-header {
          max-width: 730px;
          margin: 0 0 30px;
        }

        .text-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 14px;
          padding: 7px 10px;
          border: 1px solid #dbeafe;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.8);
          color: #1d4ed8;
          font-size: 11px;
          font-weight: 750;
          letter-spacing: 0.04em;
        }

        .text-eyebrow-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #3b82f6;
          box-shadow: 0 0 0 3px #dbeafe;
        }

        .text-header h1 {
          margin: 0 0 10px;
          color: #101b31;
          font-size: clamp(30px, 4vw, 42px);
          font-weight: 800;
          letter-spacing: -1.5px;
          line-height: 1.12;
        }

        .text-header p {
          max-width: 650px;
          margin: 0;
          color: #64748b;
          font-size: 15px;
          line-height: 1.75;
        }

        .text-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(270px, 0.8fr);
          align-items: start;
          gap: 20px;
        }

        .text-card {
          min-width: 0;
          padding: 28px;
          border: 1px solid #e4eaf2;
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 14px 38px rgba(15, 23, 42, 0.055);
        }

        .text-form-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 23px;
        }

        .text-form-heading h2 {
          margin: 0 0 7px;
          color: #14213a;
          font-size: 20px;
          font-weight: 760;
          letter-spacing: -0.35px;
        }

        .text-form-heading p {
          max-width: 470px;
          margin: 0;
          color: #718096;
          font-size: 13px;
          line-height: 1.65;
        }

        .text-input-label {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin: 0 0 9px;
          color: #334155;
          font-size: 12px;
          font-weight: 750;
        }

        .text-input-label span:last-child {
          color: #94a3b8;
          font-weight: 600;
        }

        .text-area {
          display: block;
          width: 100%;
          min-height: 218px;
          box-sizing: border-box;
          padding: 17px 18px;
          resize: vertical;
          border: 1px solid #d8e0eb;
          border-radius: 12px;
          outline: none;
          background: linear-gradient(180deg, #fff, #fcfdff);
          color: #17243b;
          font-family: inherit;
          font-size: 15px;
          line-height: 1.75;
          transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
        }

        .text-area::placeholder {
          color: #a0acbc;
        }

        .text-area:hover {
          border-color: #b7c8df;
        }

        .text-area:focus {
          border-color: #4b83e6;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.11);
        }

        .text-input-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: 9px;
          color: #8491a4;
          font-size: 11px;
        }

        .text-input-footer strong {
          color: #64748b;
          font-weight: 700;
        }

        .text-source-field {
          margin-top: 22px;
        }

        .text-source-label {
          display: block;
          margin: 0 0 8px;
          color: #334155;
          font-size: 12px;
          font-weight: 750;
        }

        .text-source-optional {
          margin-left: 5px;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 550;
        }

        .text-source-input {
          width: 100%;
          min-height: 44px;
          box-sizing: border-box;
          padding: 0 13px;
          border: 1px solid #d8e0eb;
          border-radius: 10px;
          outline: none;
          background: #fff;
          color: #17243b;
          font: inherit;
          font-size: 13px;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }

        .text-source-input::placeholder {
          color: #a0acbc;
        }

        .text-source-input:focus {
          border-color: #4b83e6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.11);
        }

        .text-source-help {
          margin: 7px 0 0;
          color: #8491a4;
          font-size: 11px;
          line-height: 1.5;
        }

        .text-error {
          margin: 14px 0 0;
          padding: 11px 13px;
          border: 1px solid #fecaca;
          border-radius: 9px;
          background: #fff7f7;
          color: #b91c1c;
          font-size: 12px;
          line-height: 1.55;
        }

        .text-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px solid #eef2f7;
        }

        .text-example-button,
        .text-submit-button {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 9px;
          min-height: 46px;
          padding: 0 17px;
          border-radius: 10px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 720;
          cursor: pointer;
          transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease, border-color 0.16s ease;
        }

        .text-example-button {
          border: 1px solid #dbe3ed;
          background: #fff;
          color: #475569;
        }

        .text-example-button:hover:not(:disabled) {
          transform: translateY(-1px);
          border-color: #b7c8df;
          background: #f8fbff;
          color: #1d4ed8;
        }

        .text-submit-button {
          min-width: 174px;
          border: 1px solid #2563eb;
          background: linear-gradient(135deg, #3478ee, #2256d8);
          color: #fff;
          box-shadow: 0 7px 15px rgba(37, 99, 235, 0.19);
        }

        .text-submit-button:hover:not(:disabled) {
          transform: translateY(-1px);
          background: linear-gradient(135deg, #286be0, #1d4fc8);
          box-shadow: 0 9px 19px rgba(37, 99, 235, 0.25);
        }

        .text-submit-button:disabled,
        .text-example-button:disabled {
          cursor: not-allowed;
          opacity: 0.62;
        }

        .text-submit-arrow {
          font-size: 17px;
          line-height: 1;
        }

        .text-side-card {
          overflow: hidden;
          padding: 0;
        }

        .text-side-top {
          padding: 23px 23px 21px;
          background: linear-gradient(145deg, #122447, #1c3d70);
          color: #fff;
        }

        .text-side-label {
          margin: 0 0 12px;
          color: #b9d3ff;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.13em;
        }

        .text-side-top h3 {
          margin: 0 0 8px;
          font-size: 17px;
          font-weight: 740;
          letter-spacing: -0.25px;
        }

        .text-side-top p {
          margin: 0;
          color: #d0dced;
          font-size: 12px;
          line-height: 1.65;
        }

        .text-side-body {
          padding: 21px 23px 22px;
        }

        .text-side-body h4 {
          margin: 0 0 16px;
          color: #26364f;
          font-size: 12px;
          font-weight: 780;
        }

        .text-process-list {
          display: grid;
          gap: 15px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .text-process-item {
          display: grid;
          grid-template-columns: 27px 1fr;
          align-items: start;
          gap: 10px;
        }

        .text-process-number {
          display: grid;
          width: 26px;
          height: 26px;
          place-items: center;
          border: 1px solid #dbeafe;
          border-radius: 8px;
          background: #eff6ff;
          color: #2563eb;
          font-size: 11px;
          font-weight: 800;
        }

        .text-process-item strong {
          display: block;
          margin: 1px 0 4px;
          color: #334155;
          font-size: 12px;
          font-weight: 740;
        }

        .text-process-item span:last-child {
          display: block;
          color: #7b8798;
          font-size: 11px;
          line-height: 1.5;
        }

        .text-note {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          padding: 12px;
          border: 1px solid #e5eaf1;
          border-radius: 10px;
          background: #f8fafc;
          color: #64748b;
          font-size: 11px;
          line-height: 1.55;
        }

        .text-note-icon {
          flex: 0 0 19px;
          display: grid;
          width: 19px;
          height: 19px;
          place-items: center;
          border-radius: 50%;
          background: #e2e8f0;
          color: #475569;
          font-size: 11px;
          font-weight: 800;
        }

        @media (max-width: 850px) {
          .text-layout {
            grid-template-columns: minmax(0, 1fr);
          }

          .text-side-card {
            display: grid;
            grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
          }

          .text-side-top {
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
        }

        @media (max-width: 600px) {
          .text-page {
            padding: 34px 16px 52px;
          }

          .text-header {
            margin-bottom: 23px;
          }

          .text-header p {
            font-size: 14px;
          }

          .text-card {
            padding: 21px;
            border-radius: 15px;
          }

          .text-form-heading {
            margin-bottom: 19px;
          }

          .text-area {
            min-height: 190px;
            padding: 14px;
            font-size: 14px;
          }

          .text-actions {
            align-items: stretch;
          }

          .text-example-button,
          .text-submit-button {
            flex: 1;
            min-width: 0;
            padding: 0 10px;
          }

          .text-side-card {
            display: block;
          }
        }

        @media (max-width: 390px) {
          .text-actions {
            flex-direction: column-reverse;
          }

          .text-example-button,
          .text-submit-button {
            width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .text-area,
          .text-example-button,
          .text-submit-button {
            transition: none;
          }
        }
      `}</style>

      <main className="text-page">
        <div className="text-container">
          <header className="text-header">
            <div className="text-eyebrow">
              <span className="text-eyebrow-dot" aria-hidden="true" />
              Text Analysis
            </div>
            <h1>Check a claim, clearly.</h1>
            <p>
              Explore what a statement says, how confident the model is, and which details may need a closer look.
            </p>
          </header>

          <div className="text-layout">
            <section className="text-card" aria-labelledby="text-form-title">
              <div className="text-form-heading">
                <div>
                  <h2 id="text-form-title">What would you like to check?</h2>
                  <p>Paste one factual claim or a short passage. Clear, specific statements are easier to assess.</p>
                </div>
              </div>

              <label className="text-input-label" htmlFor="claim-input">
                <span>Your claim</span>
                <span>Up to 5,000 characters</span>
              </label>
              <textarea
                id="claim-input"
                className="text-area"
                rows={8}
                value={text}
                onChange={handleTextChange}
                placeholder={'For example: “Water boils at 100°C at sea level.”'}
                maxLength={5000}
                aria-describedby="claim-guidance claim-count"
                aria-invalid={Boolean(error)}
              />
              <div className="text-input-footer">
                <span id="claim-guidance">Avoid adding personal or sensitive information.</span>
                <span id="claim-count" aria-live="polite">{remainingCharacters.toLocaleString()} characters left</span>
              </div>

              <div className="text-source-field">
                <label className="text-source-label" htmlFor="source-url">
                  Check against a source<span className="text-source-optional">Optional</span>
                </label>
                <input
                  id="source-url"
                  className="text-source-input"
                  type="url"
                  inputMode="url"
                  value={sourceUrl}
                  onChange={(event) => setSourceUrl(event.target.value)}
                  placeholder="https://example.com/article"
                  disabled={isAnalyzing}
                />
                <p className="text-source-help">We’ll compare the page with the claim and look for independent evidence.</p>
              </div>

              {error && <p className="text-error" role="alert">{error}</p>}

              <div className="text-actions">
                <button
                  type="button"
                  className="text-example-button"
                  onClick={handleExample}
                  disabled={isAnalyzing}
                >
                  <span aria-hidden="true">↻</span>
                  Try an example
                </button>
                <button
                  type="button"
                  className="text-submit-button"
                  onClick={handleRun}
                  disabled={isAnalyzing || !text.trim()}
                >
                  {isAnalyzing ? 'Reviewing claim…' : 'Review this claim'}
                  {!isAnalyzing && <span className="text-submit-arrow" aria-hidden="true">→</span>}
                </button>
              </div>
            </section>

            <aside className="text-card text-side-card" aria-label="How claim review works">
              <div className="text-side-top">
                <p className="text-side-label">A CLEARER WAY TO REVIEW</p>
                <h3>What happens next?</h3>
                <p>Get a verdict, confidence estimate, and evidence links. Add a source link to see how its claims hold up.</p>
              </div>

              <div className="text-side-body">
                <h4>THE REVIEW IN THREE STEPS</h4>
                <ol className="text-process-list">
                  <li className="text-process-item">
                    <span className="text-process-number">01</span>
                    <span><strong>Understand the statement</strong><span>The model identifies the central factual claim.</span></span>
                  </li>
                  <li className="text-process-item">
                    <span className="text-process-number">02</span>
                    <span><strong>Find relevant evidence</strong><span>Search current web sources and check your optional link.</span></span>
                  </li>
                  <li className="text-process-item">
                    <span className="text-process-number">03</span>
                    <span><strong>Explain the result</strong><span>Review the verdict, confidence, and reasoning together.</span></span>
                  </li>
                </ol>

                <div className="text-note">
                  <span className="text-note-icon" aria-hidden="true">i</span>
                  <span>We search the web for supporting sources, but search coverage can be incomplete. Open the citations and verify important claims yourself.</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
};
