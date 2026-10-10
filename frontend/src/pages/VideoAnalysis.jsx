import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const VIDEO_EXTENSIONS = ['.mp4', '.avi', '.mov', '.mkv', '.webm'];

export const VideoAnalysis = () => {
  const [video, setVideo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { submitVideoAnalysis } = useAuth();

  useEffect(() => {
    if (!preview) return undefined;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = '';

    if (!file) {
      return;
    }

    const extension = `.${file.name.split('.').pop()}`.toLowerCase();
    if (!VIDEO_EXTENSIONS.includes(extension)) {
      setVideo(null);
      setPreview(null);
      setError('Choose an MP4, AVI, MOV, MKV, or WEBM video.');
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setVideo(null);
      setPreview(null);
      setError('Videos must be 50 MB or smaller.');
      return;
    }

    setVideo(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleAnalyze = async () => {
    if (!video || isAnalyzing) return;
    setIsAnalyzing(true);
    setError('');
    try {
      await submitVideoAnalysis(video);
      navigate('/results');
    } catch (analysisError) {
      setError(analysisError.message || 'Video analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
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

        .video-analyze-button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          transform: none;
        }

        .video-error {
          margin: 12px 0 0;
          color: #b91c1c;
          font-size: 13px;
          line-height: 1.5;
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
              Sample frames from a video and estimate whether the visible face imagery may be manipulated.
            </p>
          </header>

          <div className="video-layout">
            <section className="video-card">
              <label className="video-upload">
                <input
                  className="video-input"
                  type="file"
                  accept=".mp4,.avi,.mov,.mkv,.webm,video/mp4,video/quicktime,video/webm"
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
                      MP4, AVI, MOV, MKV or WEBM · up to 50 MB
                    </div>
                  </div>
                )}
              </label>

              <button
                className="video-analyze-button"
                onClick={handleAnalyze}
                disabled={!video || isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing video…' : 'Analyze Video →'}
              </button>
              {error && <p className="video-error" role="alert">{error}</p>}
            </section>

            <aside className="video-card">
              <h3 className="video-info-title">
                VIDEO ANALYSIS
              </h3>

              <ol className="video-info-list">
                <li>
                  Sample up to 12 frames across the video.
                </li>

                <li>
                  Detect and crop faces where possible.
                </li>

                <li>
                  Estimate a manipulation score for each sampled frame.
                </li>

                <li>
                  Average the scores and compare them with the model threshold.
                </li>
              </ol>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
};
