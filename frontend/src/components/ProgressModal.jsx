import React from 'react';

export const ProgressModal = ({
  active,
  status,
  progress
}) => {
  if (!active) {
    return null;
  }

  return (
    <>
      <style>{`
        .tl-progress-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 20px;

          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(6px);
        }

        .tl-progress-card {
          width: 100%;
          max-width: 420px;

          padding: 30px;

          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;

          box-shadow:
            0 25px 60px rgba(15, 23, 42, 0.18);

          text-align: left;
        }

        .tl-progress-title {
          margin: 0 0 18px;

          color: #0f172a;

          font-size: 18px;
          font-weight: 750;
        }

        .tl-progress-track {
          width: 100%;
          height: 8px;

          overflow: hidden;

          background: #e2e8f0;

          border-radius: 999px;
        }

        .tl-progress-fill {
          height: 100%;

          background: #2563eb;

          border-radius: inherit;

          transition: width 0.35s ease;
        }

        .tl-progress-status {
          margin-top: 14px;

          color: #64748b;

          font-size: 13px;
          line-height: 1.5;
        }

        @media (max-width: 520px) {
          .tl-progress-card {
            padding: 24px;
          }

          .tl-progress-title {
            font-size: 17px;
          }
        }
      `}</style>

      <div className="tl-progress-overlay">
        <div className="tl-progress-card">
          <h3 className="tl-progress-title">
            Analyzing Content
          </h3>

          <div className="tl-progress-track">
            <div
              className="tl-progress-fill"
              style={{
                width: `${progress}%`
              }}
            />
          </div>

          <div className="tl-progress-status">
            {status}
          </div>
        </div>
      </div>
    </>
  );
};