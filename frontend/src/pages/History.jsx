import React, { useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

const getResultInfo = (item) => {
  if (item.type === 'text' && item.result?.verdict) {
    const verdict = item.result.verdict;
    const tone = verdict === 'Supported' ? 'positive' : verdict === 'Unsupported' ? 'negative' : 'caution';
    const confidence = Number(item.result.confidence);
    return {
      label: verdict,
      detail: Number.isFinite(confidence) ? `${Math.round(confidence)}% confidence` : 'Confidence unavailable',
      tone
    };
  }

  if (item.result?.label) {
    const isGenerated = item.result.label === 'AI-Generated';
    const probability = Number(item.result.aiProbability);
    return {
      label: item.result.label,
      detail: Number.isFinite(probability) ? `${Number(probability.toFixed(1))}% AI probability` : 'Image analysis complete',
      tone: isGenerated ? 'negative' : 'positive'
    };
  }

  return { label: 'Saved', detail: 'No model result available', tone: 'neutral' };
};

const getTypeLabel = (type) => `${type?.charAt(0).toUpperCase() || ''}${type?.slice(1) || 'Analysis'}`;

export const History = () => {
  const { history } = useAuth();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const textCount = history.filter((item) => item.type === 'text').length;
  const imageCount = history.filter((item) => item.type === 'image').length;
  const supportedCount = history.filter((item) => item.result?.verdict === 'Supported').length;

  const filteredHistory = useMemo(() => {
    const query = search.trim().toLowerCase();
    return history.filter((item) => {
      if (activeFilter !== 'all' && item.type !== activeFilter) return false;
      if (!query) return true;
      const result = getResultInfo(item);
      return [item.content, item.type, result.label, item.result?.explanation]
        .some((value) => String(value || '').toLowerCase().includes(query));
    });
  }, [history, search, activeFilter]);

  return (
    <>
      <style>{`
        .history-page {
          min-height: calc(100vh - 150px);
          box-sizing: border-box;
          padding: 48px 24px 72px;
          background: radial-gradient(ellipse at 8% 0%, rgba(219, 234, 254, .56), transparent 35%), #f6f8fc;
        }

        .history-container { width: 100%; max-width: 1120px; margin: 0 auto; }
        .history-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; margin-bottom: 25px; }
        .history-eyebrow { margin: 0 0 9px; color: #2563eb; font-size: 10px; font-weight: 800; letter-spacing: .13em; }
        .history-header h1 { margin: 0 0 8px; color: #101b31; font-size: clamp(28px, 4vw, 36px); font-weight: 800; letter-spacing: -1.1px; }
        .history-header p { margin: 0; color: #64748b; font-size: 14px; line-height: 1.6; }
        .history-private-note { flex: 0 0 auto; display: inline-flex; align-items: center; gap: 7px; padding: 8px 11px; border: 1px solid #dce6f3; border-radius: 999px; background: rgba(255,255,255,.8); color: #59708d; font-size: 11px; font-weight: 650; }

        .history-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 13px; margin-bottom: 20px; }
        .history-stat { padding: 17px 18px; border: 1px solid #e4eaf2; border-radius: 13px; background: #fff; box-shadow: 0 7px 20px rgba(15,23,42,.035); }
        .history-stat-label { display: block; margin-bottom: 7px; color: #78869a; font-size: 11px; font-weight: 650; }
        .history-stat-value { color: #14213a; font-size: 24px; font-weight: 800; letter-spacing: -.5px; }
        .history-stat-mark { float: right; display: grid; width: 29px; height: 29px; place-items: center; border-radius: 9px; background: #eff6ff; color: #2563eb; font-size: 13px; font-weight: 800; }

        .history-board { overflow: hidden; border: 1px solid #e3e9f1; border-radius: 16px; background: #fff; box-shadow: 0 12px 32px rgba(15,23,42,.045); }
        .history-board-header { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 20px 22px; border-bottom: 1px solid #edf1f6; }
        .history-board-title h2 { margin: 0 0 5px; color: #1b2a42; font-size: 15px; font-weight: 760; }
        .history-board-title p { margin: 0; color: #8491a4; font-size: 11px; }
        .history-search-wrap { position: relative; width: min(100%, 280px); }
        .history-search-icon { position: absolute; top: 50%; left: 12px; transform: translateY(-50%); color: #91a0b3; font-size: 15px; pointer-events: none; }
        .history-search { width: 100%; height: 39px; box-sizing: border-box; padding: 0 12px 0 34px; border: 1px solid #e0e7f0; border-radius: 9px; outline: none; background: #fbfcfe; color: #334155; font: inherit; font-size: 12px; }
        .history-search:focus { border-color: #7aa7f5; box-shadow: 0 0 0 3px rgba(59,130,246,.1); }
        .history-filters { display: flex; align-items: center; gap: 7px; padding: 13px 22px; border-bottom: 1px solid #f0f3f7; }
        .history-filter { min-height: 31px; padding: 0 11px; border: 1px solid transparent; border-radius: 7px; background: transparent; color: #758398; font: inherit; font-size: 11px; font-weight: 700; cursor: pointer; }
        .history-filter:hover { background: #f6f8fb; color: #334155; }
        .history-filter.active { border-color: #dbeafe; background: #eff6ff; color: #1d4ed8; }
        .history-list { display: grid; }
        .history-item { display: grid; grid-template-columns: 42px minmax(0, 1fr) auto; align-items: start; gap: 14px; padding: 19px 22px; border-bottom: 1px solid #f0f3f7; transition: background .15s ease; }
        .history-item:last-child { border-bottom: 0; }
        .history-item:hover { background: #fbfdff; }
        .history-type-icon { display: grid; width: 40px; height: 40px; place-items: center; border: 1px solid #e0eaff; border-radius: 11px; background: #f2f7ff; color: #3672d8; font-size: 12px; font-weight: 800; }
        .history-item-main { min-width: 0; }
        .history-item-top { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin: 0 0 7px; }
        .history-type-label { color: #334155; font-size: 11px; font-weight: 760; }
        .history-item-date { color: #96a1b1; font-size: 10px; }
        .history-item-content { display: -webkit-box; max-width: 720px; margin: 0; overflow: hidden; color: #48566b; font-size: 13px; line-height: 1.6; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow-wrap: anywhere; }
        .history-result { min-width: 118px; text-align: right; }
        .history-result-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 9px; border-radius: 999px; font-size: 10px; font-weight: 750; white-space: nowrap; }
        .history-result-badge::before { width: 6px; height: 6px; border-radius: 50%; background: currentColor; content: ''; opacity: .75; }
        .history-result-badge.positive { background: #edf9f1; color: #188048; }
        .history-result-badge.negative { background: #fff0f0; color: #b93636; }
        .history-result-badge.caution { background: #fff8e8; color: #a46c0d; }
        .history-result-badge.neutral { background: #f1f5f9; color: #64748b; }
        .history-result-score { display: block; margin-top: 7px; color: #8491a4; font-size: 10px; white-space: nowrap; }
        .history-empty { padding: 50px 20px; color: #7b8798; text-align: center; }
        .history-empty-icon { display: grid; width: 46px; height: 46px; place-items: center; margin: 0 auto 13px; border-radius: 14px; background: #eff6ff; color: #3478ee; font-size: 20px; }
        .history-empty h3 { margin: 0 0 6px; color: #334155; font-size: 14px; }
        .history-empty p { margin: 0; font-size: 12px; }

        @media (max-width: 760px) {
          .history-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .history-header { align-items: flex-start; flex-direction: column; }
          .history-board-header { align-items: flex-start; flex-direction: column; }
          .history-search-wrap { width: 100%; }
        }
        @media (max-width: 520px) {
          .history-page { padding: 32px 14px 50px; }
          .history-stats { gap: 9px; }
          .history-stat { padding: 14px; }
          .history-stat-value { font-size: 21px; }
          .history-board-header { padding: 17px; }
          .history-filters { padding: 11px 13px; overflow-x: auto; }
          .history-filter { flex: 0 0 auto; }
          .history-item { grid-template-columns: 36px minmax(0, 1fr); gap: 11px; padding: 16px 14px; }
          .history-type-icon { width: 35px; height: 35px; border-radius: 10px; }
          .history-result { grid-column: 2; display: flex; align-items: center; gap: 9px; min-width: 0; margin-top: 2px; text-align: left; }
          .history-result-score { margin: 0; }
        }
      `}</style>

      <main className="history-page">
        <div className="history-container">
          <header className="history-header">
            <div>
              <p className="history-eyebrow">YOUR ACTIVITY</p>
              <h1>Verification history</h1>
              <p>All your previous TruthLens reviews, together in one place.</p>
            </div>
            <div className="history-private-note"><span aria-hidden="true">●</span> Private to your account</div>
          </header>

          <section className="history-stats" aria-label="Analysis summary">
            <div className="history-stat"><span className="history-stat-mark">↗</span><span className="history-stat-label">Total reviews</span><strong className="history-stat-value">{history.length}</strong></div>
            <div className="history-stat"><span className="history-stat-mark">T</span><span className="history-stat-label">Text claims</span><strong className="history-stat-value">{textCount}</strong></div>
            <div className="history-stat"><span className="history-stat-mark">▧</span><span className="history-stat-label">Image checks</span><strong className="history-stat-value">{imageCount}</strong></div>
            <div className="history-stat"><span className="history-stat-mark">✓</span><span className="history-stat-label">Supported claims</span><strong className="history-stat-value">{supportedCount}</strong></div>
          </section>

          <section className="history-board" aria-labelledby="history-list-title">
            <div className="history-board-header">
              <div className="history-board-title">
                <h2 id="history-list-title">Your reviews</h2>
                <p>{filteredHistory.length} {filteredHistory.length === 1 ? 'result' : 'results'}</p>
              </div>
              <label className="history-search-wrap">
                <span className="history-search-icon" aria-hidden="true">⌕</span>
                <input
                  className="history-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search your reviews"
                  aria-label="Search your reviews"
                />
              </label>
            </div>

            <div className="history-filters" aria-label="Filter reviews by type">
              {[
                ['all', 'All reviews'],
                ['text', 'Text'],
                ['image', 'Images'],
                ['video', 'Video']
              ].map(([filter, label]) => (
                <button
                  className={`history-filter ${activeFilter === filter ? 'active' : ''}`}
                  type="button"
                  key={filter}
                  aria-pressed={activeFilter === filter}
                  onClick={() => setActiveFilter(filter)}
                >
                  {label}
                </button>
              ))}
            </div>

            {filteredHistory.length ? (
              <div className="history-list">
                {filteredHistory.map((item) => {
                  const result = getResultInfo(item);
                  const icon = item.type === 'text' ? 'T' : item.type === 'image' ? '▧' : 'V';
                  return (
                    <article className="history-item" key={item._id}>
                      <div className="history-type-icon" aria-hidden="true">{icon}</div>
                      <div className="history-item-main">
                        <div className="history-item-top">
                          <span className="history-type-label">{getTypeLabel(item.type)} review</span>
                          <span className="history-item-date">{new Date(item.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="history-item-content">{item.content}</p>
                      </div>
                      <div className="history-result">
                        <span className={`history-result-badge ${result.tone}`}>{result.label}</span>
                        <span className="history-result-score">{result.detail}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="history-empty">
                <div className="history-empty-icon" aria-hidden="true">⌕</div>
                <h3>{history.length ? 'No matching reviews' : 'Your history starts here'}</h3>
                <p>{history.length ? 'Try another search or choose a different filter.' : 'Run a text or image analysis and it will appear here.'}</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
};
