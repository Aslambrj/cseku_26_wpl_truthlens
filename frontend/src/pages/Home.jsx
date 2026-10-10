import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const formatDate = (date) => {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(value);
};

const getItemResult = (item) => {
  if (item.type === 'text' && item.result?.verdict) {
    const verdict = item.result.verdict;
    const confidence = Number(item.result.confidence);
    return { label: verdict, detail: Number.isFinite(confidence) ? `${Math.round(confidence)}% confidence` : 'Text review', tone: verdict === 'Supported' ? 'good' : verdict === 'Unsupported' ? 'bad' : 'mixed' };
  }
  if (item.type === 'image' && item.result?.label) {
    const isGenerated = item.result.label === 'AI-Generated';
    const probability = Number(item.result.confidence ?? (isGenerated ? item.result.aiProbability : item.result.realProbability));
    return { label: item.result.label, detail: Number.isFinite(probability) ? `${Math.round(probability)}% ${isGenerated ? 'AI' : 'real'} confidence` : 'Image review', tone: isGenerated ? 'bad' : 'good' };
  }
  if (item.type === 'video' && item.result?.label) {
    const confidence = Number(item.result.confidence);
    const isFake = item.result.label === 'FAKE';
    return {
      label: item.result.label,
      detail: Number.isFinite(confidence) ? `${confidence}% confidence` : 'Video review',
      tone: isFake ? 'bad' : 'good',
    };
  }
  return { label: 'Saved', detail: 'Result unavailable', tone: 'neutral' };
};

export const Home = () => {
  const { user, history } = useAuth();
  const [claim, setClaim] = useState('');
  const navigate = useNavigate();

  const analyses = useMemo(() => [...history].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [history]);
  const counts = useMemo(() => ({
    all: history.length,
    text: history.filter((item) => item.type === 'text').length,
    image: history.filter((item) => item.type === 'image').length,
    video: history.filter((item) => item.type === 'video').length
  }), [history]);

  const handleClaimSubmit = (event) => {
    event.preventDefault();
    if (!claim.trim()) return;
    navigate('/text', { state: { claim: claim.trim() } });
  };

  const displayName = user?.name?.trim()?.split(/\s+/)[0];

  return (
    <>
      <style>{`
        .dashboard-page { min-height: calc(100vh - 150px); box-sizing: border-box; padding: 43px 24px 66px; background: radial-gradient(ellipse at 7% 0%, rgba(219,234,254,.62), transparent 34%), #f6f8fc; }
        .dashboard-container { width: 100%; max-width: 1160px; margin: 0 auto; }
        .dashboard-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; margin-bottom: 25px; }
        .dashboard-eyebrow { margin: 0 0 8px; color: #2563eb; font-size: 10px; font-weight: 800; letter-spacing: .13em; }
        .dashboard-header h1 { margin: 0 0 8px; color: #14213a; font-size: clamp(29px,4vw,37px); font-weight: 800; letter-spacing: -1.1px; }
        .dashboard-header p { margin: 0; color: #64748b; font-size: 14px; line-height: 1.6; }
        .dashboard-history-link { display: inline-flex; align-items: center; justify-content: center; min-height: 41px; padding: 0 14px; border: 1px solid #d7e1ef; border-radius: 9px; background: #fff; color: #385270; font-size: 12px; font-weight: 720; white-space: nowrap; transition: background .16s ease,border-color .16s ease; }
        .dashboard-history-link:hover { border-color: #aac4eb; background: #f7faff; color: #1d4ed8; }
        .dashboard-stats { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 13px; margin-bottom: 20px; }
        .dashboard-stat { position: relative; overflow: hidden; padding: 17px 19px; border: 1px solid #e3eaf3; border-radius: 13px; background: rgba(255,255,255,.94); box-shadow: 0 8px 22px rgba(15,23,42,.035); }
        .dashboard-stat::after { position: absolute; right: -15px; bottom: -23px; width: 75px; height: 75px; border-radius: 50%; background: #f3f7fd; content: ''; }
        .dashboard-stat-label { display: block; margin-bottom: 8px; color: #7c899c; font-size: 11px; font-weight: 650; }
        .dashboard-stat-value { position: relative; z-index: 1; color: #14213a; font-size: 25px; font-weight: 800; letter-spacing: -.5px; }
        .dashboard-stat-icon { position: absolute; z-index: 1; top: 15px; right: 16px; display: grid; width: 29px; height: 29px; place-items: center; border-radius: 9px; background: #eff6ff; color: #2f6fdb; font-size: 12px; font-weight: 800; }
        .dashboard-main-grid { display: grid; grid-template-columns: minmax(0,1.45fr) minmax(310px,.85fr); align-items: start; gap: 18px; }
        .dashboard-panel { overflow: hidden; border: 1px solid #e2e9f2; border-radius: 15px; background: #fff; box-shadow: 0 11px 30px rgba(15,23,42,.04); }
        .dashboard-panel-head { display: flex; justify-content: space-between; align-items: center; gap: 14px; padding: 18px 20px; border-bottom: 1px solid #edf1f6; }
        .dashboard-panel-head h2 { margin: 0 0 4px; color: #1d2b43; font-size: 14px; font-weight: 780; }
        .dashboard-panel-head p { margin: 0; color: #8793a4; font-size: 11px; }
        .dashboard-view-all { padding: 0; border: 0; background: none; color: #2563eb; font: inherit; font-size: 11px; font-weight: 750; cursor: pointer; white-space: nowrap; }
        .dashboard-view-all:hover { text-decoration: underline; }
        .dashboard-activity-list { display: grid; }
        .dashboard-activity { display: grid; grid-template-columns: 37px minmax(0,1fr) auto; align-items: center; gap: 12px; padding: 15px 19px; border-bottom: 1px solid #f0f3f7; }
        .dashboard-activity:last-child { border-bottom: 0; }
        .dashboard-activity-icon { display: grid; width: 36px; height: 36px; place-items: center; border: 1px solid #e0eaff; border-radius: 10px; background: #f2f7ff; color: #3475df; font-size: 12px; font-weight: 800; }
        .dashboard-activity-content { min-width: 0; }
        .dashboard-activity-title { margin: 0 0 5px; color: #334155; font-size: 11px; font-weight: 760; }
        .dashboard-activity-text { display: -webkit-box; margin: 0; overflow: hidden; color: #68778c; font-size: 12px; line-height: 1.55; overflow-wrap: anywhere; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
        .dashboard-activity-date { display: block; margin-top: 5px; color: #a0aaba; font-size: 10px; }
        .dashboard-result { text-align: right; }
        .dashboard-result-badge { display: inline-block; padding: 5px 8px; border-radius: 999px; font-size: 10px; font-weight: 750; white-space: nowrap; }
        .dashboard-result-badge.good { background: #edf9f1; color: #188048; }
        .dashboard-result-badge.bad { background: #fff0f0; color: #b93636; }
        .dashboard-result-badge.mixed { background: #fff8e8; color: #a46c0d; }
        .dashboard-result-badge.neutral { background: #f1f5f9; color: #64748b; }
        .dashboard-result-detail { display: block; margin-top: 5px; color: #8a97a9; font-size: 10px; white-space: nowrap; }
        .dashboard-quick-panel { padding: 19px; }
        .dashboard-quick-panel h2 { margin: 0 0 5px; color: #1d2b43; font-size: 14px; font-weight: 780; }
        .dashboard-quick-intro { margin: 0 0 16px; color: #8793a4; font-size: 11px; line-height: 1.5; }
        .dashboard-quick-actions { display: grid; gap: 9px; }
        .dashboard-action { display: grid; grid-template-columns: 37px minmax(0,1fr) auto; align-items: center; gap: 11px; width: 100%; padding: 11px; border: 1px solid #e7edf4; border-radius: 11px; background: #fff; color: inherit; font: inherit; text-align: left; cursor: pointer; transition: transform .15s ease,border-color .15s ease,background .15s ease; }
        .dashboard-action:hover { transform: translateY(-1px); border-color: #c2d5f1; background: #fbfdff; }
        .dashboard-action-icon { display: grid; width: 36px; height: 36px; place-items: center; border-radius: 10px; background: #eff6ff; color: #2563eb; font-size: 13px; font-weight: 800; }
        .dashboard-action strong { display: block; margin-bottom: 3px; color: #334155; font-size: 11px; font-weight: 760; }
        .dashboard-action small { display: block; color: #8995a6; font-size: 10px; line-height: 1.4; }
        .dashboard-action-arrow { color: #9aa7b8; font-size: 16px; }
        .dashboard-claim-shortcut { margin-top: 16px; padding-top: 16px; border-top: 1px solid #edf1f6; }
        .dashboard-claim-shortcut label { display: block; margin-bottom: 8px; color: #46566c; font-size: 11px; font-weight: 750; }
        .dashboard-claim-row { display: flex; gap: 8px; }
        .dashboard-claim-input { flex: 1; min-width: 0; height: 39px; box-sizing: border-box; padding: 0 10px; border: 1px solid #dfe6ef; border-radius: 8px; outline: none; color: #334155; font: inherit; font-size: 11px; }
        .dashboard-claim-input:focus { border-color: #7aa7f5; box-shadow: 0 0 0 3px rgba(59,130,246,.1); }
        .dashboard-claim-submit { flex: 0 0 auto; height: 39px; padding: 0 11px; border: 0; border-radius: 8px; background: #2563eb; color: #fff; font: inherit; font-size: 10px; font-weight: 750; cursor: pointer; }
        .dashboard-claim-submit:hover:not(:disabled) { background: #1d4ed8; }
        .dashboard-claim-submit:disabled { cursor: not-allowed; opacity: .55; }
        .dashboard-empty { padding: 30px 18px; color: #7c899c; text-align: center; }
        .dashboard-empty-icon { display: grid; width: 39px; height: 39px; place-items: center; margin: 0 auto 10px; border-radius: 12px; background: #eff6ff; color: #3478ee; font-weight: 800; }
        .dashboard-empty strong { display: block; margin-bottom: 5px; color: #3c4c63; font-size: 12px; }
        .dashboard-empty span { display: block; font-size: 11px; line-height: 1.5; }
        @media (max-width: 850px) { .dashboard-main-grid { grid-template-columns: minmax(0,1fr); } }
        @media (max-width: 700px) { .dashboard-page { padding: 33px 16px 50px; } .dashboard-stats { grid-template-columns: repeat(2,minmax(0,1fr)); } .dashboard-header { align-items: flex-start; flex-direction: column; } }
        @media (max-width: 470px) { .dashboard-activity { grid-template-columns: 34px minmax(0,1fr); gap: 10px; padding: 13px; } .dashboard-activity-icon { width: 33px; height: 33px; } .dashboard-result { grid-column: 2; display: flex; align-items: center; gap: 8px; text-align: left; } .dashboard-result-detail { margin: 0; } .dashboard-claim-row { flex-direction: column; } .dashboard-claim-submit { width: 100%; } }
      `}</style>

      <main className="dashboard-page">
        <div className="dashboard-container">
          <header className="dashboard-header">
            <div>
              <p className="dashboard-eyebrow">TRUTHLENS WORKSPACE</p>
              <h1>Welcome back{displayName ? `, ${displayName}` : ''}.</h1>
              <p>Your latest analyses and shortcuts to start a new review.</p>
            </div>
            <button className="dashboard-history-link" type="button" onClick={() => navigate('/history')}>
              View all activity <span aria-hidden="true" style={{ marginLeft: 8 }}>↗</span>
            </button>
          </header>

          <section className="dashboard-stats" aria-label="Analysis totals">
            <div className="dashboard-stat"><span className="dashboard-stat-icon">↗</span><span className="dashboard-stat-label">Total analyses</span><strong className="dashboard-stat-value">{counts.all}</strong></div>
            <div className="dashboard-stat"><span className="dashboard-stat-icon">T</span><span className="dashboard-stat-label">Text claims</span><strong className="dashboard-stat-value">{counts.text}</strong></div>
            <div className="dashboard-stat"><span className="dashboard-stat-icon">▧</span><span className="dashboard-stat-label">Image reviews</span><strong className="dashboard-stat-value">{counts.image}</strong></div>
            <div className="dashboard-stat"><span className="dashboard-stat-icon">▷</span><span className="dashboard-stat-label">Video submissions</span><strong className="dashboard-stat-value">{counts.video}</strong></div>
          </section>

          <div className="dashboard-main-grid">
            <section className="dashboard-panel" aria-labelledby="dashboard-recent-title">
              <div className="dashboard-panel-head">
                <div><h2 id="dashboard-recent-title">Recent activity</h2><p>Your five most recent saved analyses</p></div>
                <button className="dashboard-view-all" type="button" onClick={() => navigate('/history')}>View history →</button>
              </div>
              {analyses.length ? (
                <div className="dashboard-activity-list">
                  {analyses.slice(0, 5).map((item) => {
                    const result = getItemResult(item);
                    const icon = item.type === 'text' ? 'T' : item.type === 'image' ? '▧' : 'V';
                    return (
                      <article className="dashboard-activity" key={item._id}>
                        <div className="dashboard-activity-icon" aria-hidden="true">{icon}</div>
                        <div className="dashboard-activity-content">
                          <p className="dashboard-activity-title">{item.type.charAt(0).toUpperCase() + item.type.slice(1)} analysis</p>
                          <p className="dashboard-activity-text">{item.content}</p>
                          <time className="dashboard-activity-date" dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
                        </div>
                        <div className="dashboard-result"><span className={`dashboard-result-badge ${result.tone}`}>{result.label}</span><span className="dashboard-result-detail">{result.detail}</span></div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="dashboard-empty"><div className="dashboard-empty-icon" aria-hidden="true">＋</div><strong>No analyses yet</strong><span>Start with a text claim or choose another review type.</span></div>
              )}
            </section>

            <aside className="dashboard-panel dashboard-quick-panel" aria-labelledby="dashboard-quick-title">
              <h2 id="dashboard-quick-title">Start a new analysis</h2>
              <p className="dashboard-quick-intro">Choose what you want to review and continue in its workspace.</p>
              <div className="dashboard-quick-actions">
                <button className="dashboard-action" type="button" onClick={() => navigate('/text')}>
                  <span className="dashboard-action-icon">T</span><span><strong>Check a text claim</strong><small>Break down claims and review web evidence</small></span><span className="dashboard-action-arrow" aria-hidden="true">→</span>
                </button>
                <button className="dashboard-action" type="button" onClick={() => navigate('/image')}>
                  <span className="dashboard-action-icon">▧</span><span><strong>Analyze an image</strong><small>Review image authenticity signals</small></span><span className="dashboard-action-arrow" aria-hidden="true">→</span>
                </button>
                <button className="dashboard-action" type="button" onClick={() => navigate('/video')}>
                  <span className="dashboard-action-icon">▷</span><span><strong>Review a video</strong><small>Prepare a video for analysis</small></span><span className="dashboard-action-arrow" aria-hidden="true">→</span>
                </button>
              </div>
              <form className="dashboard-claim-shortcut" onSubmit={handleClaimSubmit}>
                <label htmlFor="dashboard-claim">Or paste a claim to get started</label>
                <div className="dashboard-claim-row">
                  <input id="dashboard-claim" className="dashboard-claim-input" type="text" maxLength={5000} value={claim} onChange={(event) => setClaim(event.target.value)} placeholder="Type a factual statement..." />
                  <button className="dashboard-claim-submit" type="submit" disabled={!claim.trim()}>Continue</button>
                </div>
              </form>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
};
