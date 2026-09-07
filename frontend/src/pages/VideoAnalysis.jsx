import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export const VideoAnalysis = ({
  runAnalysisPipeline
}) => {
  const [video, setVideo] = useState(null);
  const [preview, setPreview] = useState(null);

  const navigate = useNavigate();
  const { addHistoryItem } = useAuth();

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setVideo(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleAnalyze = async () => {
    const content = video?.name || 'Video analysis';

    await addHistoryItem({ type: 'video', content });
    runAnalysisPipeline(
      'video',
      content,
      () => navigate('/results')
    );
  };

  return (
    <>
      <style>{`
        .video-page {
          width: 100%;

          padding: 55px 24px 70px;

          background: #f7f9fc;
        }

        .video-container {
          width: 100%;
          max-width: 1050px;

          margin: 0 auto;
        }

        .video-header {
          margin-bottom: 28px;
        }

        .video-header h1 {
          margin: 0 0 8px;

          color: #0f172a;

          font-size: 30px;
          font-weight: 800;

          letter-spacing: -0.7px;
        }

        .video-header p {
          margin: 0;

          color: #64748b;

          font-size: 14px;
        }

        .video-layout {
          display: grid;

          grid-template-columns:
            minmax(0, 1.5fr)
            minmax(280px, 0.8fr);

          gap: 22px;
        }

        .video-card {
          padding: 28px;

          background: #ffffff;

          border: 1px solid #e2e8f0;

          border-radius: 16px;

          box-shadow:
            0 10px 30px rgba(15, 23, 42, 0.05);
        }

        .video-upload {
          min-height: 300px;

          display: flex;
          align-items: center;
          justify-content: center;

          overflow: hidden;

          padding: 24px;

          border: 2px dashed #cbd5e1;

          border-radius: 12px;

          background: #f8fafc;

          cursor: pointer;

          transition:
            border-color 0.2s ease,
            background-color 0.2s ease;
        }

        .video-upload:hover {
          border-color: #2563eb;

          background: #eff6ff;
        }

        .video-upload-content {
          text-align: center;
        }

        .video-upload-icon {
          width: 52px;
          height: 52px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin: 0 auto 14px;

          border-radius: 12px;

          background: #dbeafe;

          color: #2563eb;

          font-size: 20px;
        }

        .video-upload-title {
          margin-bottom: 5px;

          color: #0f172a;

          font-size: 15px;
          font-weight: 750;
        }

        .video-upload-description {
          color: #64748b;

          font-size: 12px;
        }

        .video-input {
          display: none;
        }

        .video-preview {
          width: 100%;
          max-height: 320px;

          border-radius: 10px;
        }

        .video-analyze-button {
          width: 100%;

          height: 46px;

          margin-top: 18px;

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
            transform 0.15s ease;
        }

        .video-analyze-button:hover {
          background: #1d4ed8;

          transform: translateY(-1px);
        }

        .video-analyze-button:active {
          background: #1e40af;

          transform: translateY(0);
        }

        .video-info-title {
          margin: 0 0 16px;

          color: #0f172a;

          font-size: 12px;
          font-weight: 800;

          letter-spacing: 1px;
        }

        .video-info-list {
          margin: 0;

          padding-left: 20px;

          color: #64748b;

          font-size: 13px;

          line-height: 2;
        }

        @media (max-width: 800px) {
          .video-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 520px) {
          .video-page {
            padding: 35px 16px 50px;
          }

          .video-card {
            padding: 20px;
          }
        }
      `}</style>

      <main className="video-page">
        <div className="video-container">
          <header className="video-header">
            <h1>
              Video Analysis
            </h1>

            <p>
              Analyze video frames and temporal
              consistency for manipulation signals.
            </p>
          </header>

          <div className="video-layout">
            <section className="video-card">
              <label className="video-upload">
                <input
                  className="video-input"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                />

                {preview ? (
                  <video
                    src={preview}
                    controls
                    className="video-preview"
                  />
                ) : (
                  <div className="video-upload-content">
                    <div className="video-upload-icon">
                      ▶
                    </div>

                    <div className="video-upload-title">
                      Upload a video
                    </div>

                    <div className="video-upload-description">
                      MP4, MOV or WEBM
                    </div>
                  </div>
                )}
              </label>

              <button
                className="video-analyze-button"
                onClick={handleAnalyze}
              >
                Analyze Video →
              </button>
            </section>

            <aside className="video-card">
              <h3 className="video-info-title">
                VIDEO ANALYSIS
              </h3>

              <ol className="video-info-list">
                <li>
                  Extract frame-level features.
                </li>

                <li>
                  Analyze temporal consistency.
                </li>

                <li>
                  Detect manipulation signals.
                </li>

                <li>
                  Generate confidence-based evidence.
                </li>
              </ol>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
};