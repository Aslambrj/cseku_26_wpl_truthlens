import React from 'react';
import { useAuth } from '../auth/AuthContext';

export const History = () => {
  const { history } = useAuth();

  return (
    <>
      <style>{`
        .history-page {
          width: 100%;

          padding: 55px 24px 70px;

          background: #f7f9fc;
        }

        .history-container {
          width: 100%;
          max-width: 1150px;

          margin: 0 auto;
        }

        .history-header {
          margin-bottom: 28px;
        }

        .history-header h1 {
          margin: 0 0 8px;

          color: #0f172a;

          font-size: 30px;
          font-weight: 800;

          letter-spacing: -0.7px;
        }

        .history-header p {
          margin: 0;

          color: #64748b;

          font-size: 14px;
        }

        .history-card {
          overflow: hidden;

          background: #ffffff;

          border: 1px solid #e2e8f0;

          border-radius: 16px;

          box-shadow:
            0 10px 30px rgba(15, 23, 42, 0.05);
        }

        .history-card-header {
          padding: 22px 24px;

          border-bottom: 1px solid #eef2f7;
        }

        .history-card-header h2 {
          margin: 0;

          color: #0f172a;

          font-size: 16px;
          font-weight: 750;
        }

        .history-table-container {
          width: 100%;

          overflow-x: auto;
        }

        .history-table {
          width: 100%;

          border-collapse: collapse;

          font-size: 13px;
        }

        .history-table th {
          padding: 14px 16px;

          background: #f8fafc;

          border-bottom: 1px solid #e2e8f0;

          color: #64748b;

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 0.7px;

          text-align: left;

          white-space: nowrap;
        }

        .history-table td {
          padding: 15px 16px;

          border-bottom: 1px solid #f1f5f9;

          color: #475569;

          white-space: nowrap;
        }

        .history-table tbody tr {
          transition:
            background-color 0.15s ease;
        }

        .history-table tbody tr:hover {
          background: #f8fbff;
        }

        .history-id {
          color: #0f172a;

          font-weight: 750;
        }

        .history-content {
          max-width: 300px;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;
        }

        .history-badge {
          display: inline-flex;

          align-items: center;

          padding: 5px 9px;

          border-radius: 999px;

          font-size: 10px;
          font-weight: 750;
        }

        .history-badge.success {
          background: #dcfce7;

          color: #15803d;
        }

        .history-badge.warning {
          background: #fef3c7;

          color: #b45309;
        }

        .history-badge.danger {
          background: #fee2e2;

          color: #b91c1c;
        }

        .history-empty {
          padding: 45px 20px;

          color: #94a3b8;

          font-size: 13px;

          text-align: center;
        }

        @media (max-width: 520px) {
          .history-page {
            padding: 35px 16px 50px;
          }

          .history-header h1 {
            font-size: 26px;
          }
        }
      `}</style>

      <main className="history-page">
        <div className="history-container">
          <header className="history-header">
            <h1>
              Verification History
            </h1>

            <p>
              Review your previous TruthLens analysis
              activity.
            </p>
          </header>

          <section className="history-card">
            <div className="history-card-header">
              <h2>
                Verification Audit Log
              </h2>
            </div>

            <div className="history-table-container">
              {history.length > 0 ? (
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Content Summary</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>

                  <tbody>
                    {history.map((item) => (
                      <tr key={item._id}>
                        <td>
                          {item.type}
                        </td>

                        <td>
                          <div className="history-content">
                            {item.content}
                          </div>
                        </td>

                        <td>
                          {new Date(item.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="history-empty">
                  No verification history available yet.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
};