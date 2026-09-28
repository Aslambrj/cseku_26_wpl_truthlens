import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSharedAnalysis } from '../services/analysisService';

export const SharedReport = () => {
  const { shareId } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getSharedAnalysis(shareId)
      .then(({ analysis: sharedAnalysis }) => {
        if (active) setAnalysis(sharedAnalysis);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'This shared report is unavailable.');
      });
    return () => { active = false; };
  }, [shareId]);

  const result = analysis?.result || {};
  const sources = Array.isArray(result.evidence) ? result.evidence : [];
  const claims = Array.isArray(result.claims) ? result.claims : [];

  return (
    <main className="shared-report-page">
      <style>{`
        .shared-report-page { min-height: 100vh; box-sizing: border-box; padding: 48px 20px 70px; background: #f6f8fc; color: #17243b; }
        .shared-report-wrap { max-width: 860px; margin: 0 auto; }
        .shared-report-brand { margin-bottom: 22px; color: #2563eb; font-size: 12px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
        .shared-report-panel { margin-bottom: 15px; padding: 25px; border: 1px solid #e2e8f0; border-radius: 15px; background: #fff; box-shadow: 0 12px 34px rgba(15,23,42,.045); }
        .shared-report-panel h1 { margin: 0 0 8px; font-size: 27px; letter-spacing: -.7px; }
        .shared-report-panel h2 { margin: 0 0 14px; font-size: 16px; }
        .shared-report-meta { color: #718096; font-size: 12px; }
        .shared-report-verdict { display: inline-flex; margin: 14px 0 0; padding: 7px 11px; border-radius: 999px; background: #eff6ff; color: #1d4ed8; font-size: 12px; font-weight: 750; }
        .shared-report-confidence { margin-left: 9px; color: #64748b; font-size: 12px; }
        .shared-report-text { margin: 0; padding: 15px; border: 1px solid #e2e8f0; border-radius: 10px; background: #f8fafc; color: #334155; font-size: 14px; line-height: 1.7; white-space: pre-wrap; overflow-wrap: anywhere; }
        .shared-report-copy { margin: 0; color: #64748b; font-size: 13px; line-height: 1.7; }
        .shared-report-list { display: grid; gap: 11px; }
        .shared-report-item { padding: 14px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fcfdff; }
        .shared-report-item strong { color: #334155; font-size: 13px; }
        .shared-report-item p { margin: 7px 0 0; color: #64748b; font-size: 12px; line-height: 1.65; }
        .shared-report-item a { color: #1d4ed8; font-size: 13px; font-weight: 700; overflow-wrap: anywhere; text-decoration: none; }
        .shared-report-item a:hover { text-decoration: underline; }
        .shared-report-error { color: #b91c1c; }
        .shared-report-disclaimer { color: #8491a4; font-size: 11px; line-height: 1.6; }
        @media (max-width: 520px) { .shared-report-page { padding: 30px 14px 48px; } .shared-report-panel { padding: 19px; } .shared-report-panel h1 { font-size: 23px; } }
      `}</style>

      <div className="shared-report-wrap">
        <div className="shared-report-brand">TruthLens · Shared report</div>
        {error ? (
          <section className="shared-report-panel shared-report-error" role="alert">
            <h1>Report unavailable</h1>
            <p>{error}</p>
          </section>
        ) : !analysis ? (
          <section className="shared-report-panel" aria-live="polite">
            <h1>Loading report…</h1>
          </section>
        ) : (
          <>
            <section className="shared-report-panel">
              <h1>Claim review</h1>
              <p className="shared-report-meta">
                {analysis.createdAt ? new Date(analysis.createdAt).toLocaleString() : 'TruthLens analysis'}
                {' · '}{result.model || 'AI-assisted review'}
              </p>
              <span className="shared-report-verdict">{result.verdict || result.label || 'Result unavailable'}</span>
              {Number.isFinite(Number(result.confidence)) && (
                <span className="shared-report-confidence">{Math.round(Number(result.confidence))}% confidence</span>
              )}
            </section>

            <section className="shared-report-panel">
                <h2>{analysis.type === 'text' ? 'Submitted text' : 'Submitted file'}</h2>
              <p className="shared-report-text">{analysis.content}</p>
            </section>

            {result.explanation && (
              <section className="shared-report-panel">
                <h2>Assessment</h2>
                <p className="shared-report-copy">{result.explanation}</p>
              </section>
            )}

            {claims.length > 0 && (
              <section className="shared-report-panel">
                <h2>Claim breakdown</h2>
                <div className="shared-report-list">
                  {claims.map((claim, index) => (
                    <article className="shared-report-item" key={`${index}-${claim.text}`}>
                      <strong>Claim {index + 1} · {claim.verdict} · {claim.confidence}%</strong>
                      <p>{claim.text}</p>
                      {claim.explanation && <p>{claim.explanation}</p>}
                    </article>
                  ))}
                </div>
              </section>
            )}

            {result.sourceCheck?.url && (
              <section className="shared-report-panel">
                <h2>Source check</h2>
                <p className="shared-report-copy">{result.sourceCheck.summary || 'Submitted source checked against this claim.'}</p>
                <p><a href={result.sourceCheck.url} target="_blank" rel="noreferrer">Open submitted source ↗</a></p>
              </section>
            )}

            <section className="shared-report-panel">
              <h2>Evidence links</h2>
              {sources.length ? (
                <div className="shared-report-list">
                  {sources.map((source) => (
                    <article className="shared-report-item" key={source.url}>
                      <a href={source.url} target="_blank" rel="noreferrer">{source.title || source.url} ↗</a>
                      {source.excerpt && <p>{source.excerpt}</p>}
                    </article>
                  ))}
                </div>
              ) : <p className="shared-report-copy">No web citations were returned for this review.</p>}
            </section>

            <p className="shared-report-disclaimer">AI-assisted assessment. Verify important claims using reliable, current sources.</p>
          </>
        )}
      </div>
    </main>
  );
};
