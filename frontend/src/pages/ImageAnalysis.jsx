import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export const ImageAnalysis = ({
  runAnalysisPipeline
}) => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const navigate = useNavigate();
  const { addHistoryItem } = useAuth();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleAnalyze = async () => {
    const content = image?.name || 'Image analysis';

    await addHistoryItem({ type: 'image', content });
    runAnalysisPipeline(
      'image',
      content,
      () => navigate('/results')
    );
  };

  return (
    <>
      <style>{`
        .image-page {
  width: 100%;
 

  padding: 55px 24px 70px;

  box-sizing: border-box;

  background: #f7f9fc;
}

        .image-container {
          width: 100%;
          max-width: 1050px;

          margin: 0 auto;
        }

        .image-header {
          margin-bottom: 28px;
        }

        .image-header h1 {
          margin: 0 0 8px;

          color: #0f172a;

          font-size: 30px;
          font-weight: 800;

          letter-spacing: -0.7px;
        }

        .image-header p {
          margin: 0;

          color: #64748b;

          font-size: 14px;
        }

        .image-layout {
          display: grid;

          grid-template-columns:
            minmax(0, 1.5fr)
            minmax(280px, 0.8fr);

          gap: 22px;
        }

        .image-card {
          padding: 28px;

          background: #ffffff;

          border: 1px solid #e2e8f0;

          border-radius: 16px;

          box-shadow:
            0 10px 30px rgba(15, 23, 42, 0.05);
        }

        .image-upload {
          min-height: 300px;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 24px;

          border: 2px dashed #cbd5e1;

          border-radius: 12px;

          background: #f8fafc;

          cursor: pointer;

          transition:
            border-color 0.2s ease,
            background-color 0.2s ease;
        }

        .image-upload:hover {
          border-color: #2563eb;

          background: #eff6ff;
        }

        .image-upload-content {
          text-align: center;
        }

        .image-upload-icon {
          width: 52px;
          height: 52px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin: 0 auto 14px;

          border-radius: 12px;

          background: #dbeafe;

          color: #2563eb;

          font-size: 22px;
          font-weight: 800;
        }

        .image-upload-title {
          margin-bottom: 5px;

          color: #0f172a;

          font-size: 15px;
          font-weight: 750;
        }

        .image-upload-description {
          color: #64748b;

          font-size: 12px;
        }

        .image-file-input {
          display: none;
        }

        .image-preview {
          width: 100%;
          max-height: 320px;

          object-fit: contain;

          border-radius: 10px;
        }

        .image-analyze-button {
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

        .image-analyze-button:hover {
          background: #1d4ed8;

          transform: translateY(-1px);
        }

        .image-analyze-button:active {
          background: #1e40af;

          transform: translateY(0);
        }

        .image-info-title {
          margin: 0 0 16px;

          color: #0f172a;

          font-size: 12px;
          font-weight: 800;

          letter-spacing: 1px;
        }

        .image-info-list {
          margin: 0;

          padding-left: 20px;

          color: #64748b;

          font-size: 13px;

          line-height: 2;
        }

        @media (max-width: 800px) {
          .image-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 520px) {
          .image-page {
            padding: 35px 16px 50px;
          }

          .image-card {
            padding: 20px;
          }
        }
      `}</style>

      <main className="image-page">
        <div className="image-container">
          <header className="image-header">
            <h1>
              Image Analysis
            </h1>

            <p>
              Detect visual inconsistencies and
              synthetic image patterns.
            </p>
          </header>

          <div className="image-layout">
            <section className="image-card">
              <label className="image-upload">
                <input
                  className="image-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />

                {preview ? (
                  <img
                    src={preview}
                    alt="Selected preview"
                    className="image-preview"
                  />
                ) : (
                  <div className="image-upload-content">
                    <div className="image-upload-icon">
                      +
                    </div>

                    <div className="image-upload-title">
                      Upload an image
                    </div>

                    <div className="image-upload-description">
                      PNG, JPG or WEBP
                    </div>
                  </div>
                )}
              </label>

              <button
                className="image-analyze-button"
                onClick={handleAnalyze}
              >
                Analyze Image →
              </button>
            </section>

            <aside className="image-card">
              <h3 className="image-info-title">
                IMAGE ANALYSIS
              </h3>

              <ol className="image-info-list">
                <li>
                  Extract visual features.
                </li>

                <li>
                  Detect synthetic patterns.
                </li>

                <li>
                  Analyze visual inconsistencies.
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