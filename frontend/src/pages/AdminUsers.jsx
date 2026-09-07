import { useEffect, useState } from 'react';
import { deleteAdminUser, getAdminUsers, updateAdminUserRole } from '../services/adminService';
import { useAuth } from '../auth/AuthContext';

const formatDate = (value) => value
  ? new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
  : 'Never';

export const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalAdmins: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const loadUsers = async () => {
    setError('');
    try {
      const data = await getAdminUsers();
      setUsers(data.users);
      setStats(data.stats);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(loadUsers);
  }, []);

  const changeRole = async (targetUser) => {
    const nextRole = targetUser.role === 'admin' ? 'user' : 'admin';
    setBusyId(targetUser._id);
    setError('');

    try {
      await updateAdminUserRole(targetUser._id, nextRole);
      await loadUsers();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyId(null);
    }
  };

  const removeUser = async (targetUser) => {
    const confirmed = window.confirm(
      `Remove ${targetUser.name}? Their saved analysis history will also be deleted.`
    );
    if (!confirmed) return;

    setBusyId(targetUser._id);
    setError('');

    try {
      await deleteAdminUser(targetUser._id);
      await loadUsers();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="admin-page">
      <style>{`
        .admin-page { min-height: 100%; padding: 52px 24px 72px; background: #f7f9fc; }
        .admin-container { max-width: 1180px; margin: 0 auto; }
        .admin-header { display: flex; justify-content: space-between; align-items: end; gap: 20px; margin-bottom: 28px; }
        .admin-header h1 { margin: 0 0 8px; color: #0f172a; font-size: 30px; font-weight: 800; }
        .admin-header p { margin: 0; color: #64748b; font-size: 14px; }
        .admin-refresh { padding: 10px 15px; border: 1px solid #dbe2ea; border-radius: 8px; background: #fff; color: #334155; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
        .admin-refresh:hover { border-color: #93c5fd; color: #2563eb; }
        .admin-stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-bottom: 22px; }
        .admin-stat { padding: 20px 22px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 8px 24px rgba(15, 23, 42, .04); }
        .admin-stat-label { color: #64748b; font-size: 11px; font-weight: 800; letter-spacing: .7px; text-transform: uppercase; }
        .admin-stat-value { margin-top: 8px; color: #0f172a; font-size: 28px; font-weight: 800; }
        .admin-card { overflow: hidden; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 8px 24px rgba(15, 23, 42, .04); }
        .admin-card-title { padding: 20px 22px; border-bottom: 1px solid #eef2f7; color: #0f172a; font-size: 16px; font-weight: 750; }
        .admin-table-wrap { overflow-x: auto; }
        .admin-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .admin-table th { padding: 13px 16px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 10px; letter-spacing: .65px; text-align: left; text-transform: uppercase; white-space: nowrap; }
        .admin-table td { padding: 15px 16px; border-bottom: 1px solid #f1f5f9; color: #475569; white-space: nowrap; }
        .admin-table tr:last-child td { border-bottom: 0; }
        .admin-name { color: #0f172a; font-weight: 750; }
        .admin-role { display: inline-flex; padding: 5px 9px; border-radius: 999px; background: #eff6ff; color: #2563eb; font-size: 10px; font-weight: 800; text-transform: uppercase; }
        .admin-role.user { background: #f1f5f9; color: #64748b; }
        .admin-actions { display: flex; gap: 8px; }
        .admin-action { padding: 7px 10px; border: 1px solid #dbe2ea; border-radius: 7px; background: #fff; color: #475569; font: inherit; font-size: 11px; font-weight: 700; cursor: pointer; }
        .admin-action:hover:not(:disabled) { border-color: #93c5fd; color: #2563eb; }
        .admin-action.danger:hover:not(:disabled) { border-color: #fca5a5; color: #dc2626; }
        .admin-action:disabled { cursor: not-allowed; opacity: .5; }
        .admin-message { margin-bottom: 18px; padding: 12px 14px; border-radius: 8px; background: #fef2f2; color: #b91c1c; font-size: 13px; }
        .admin-empty { padding: 42px 20px; color: #94a3b8; text-align: center; }
        @media (max-width: 650px) { .admin-page { padding: 34px 16px 52px; } .admin-header { align-items: start; flex-direction: column; } .admin-stats { grid-template-columns: 1fr; } }
      `}</style>

      <div className="admin-container">
        <header className="admin-header">
          <div>
            <h1>System Administration</h1>
            <p>Manage TruthLens accounts and access levels.</p>
          </div>
          <button type="button" className="admin-refresh" onClick={loadUsers} disabled={loading}>
            Refresh list
          </button>
        </header>

        {error && <div className="admin-message" role="alert">{error}</div>}

        <section className="admin-stats" aria-label="User statistics">
          <div className="admin-stat"><div className="admin-stat-label">Total users</div><div className="admin-stat-value">{stats.totalUsers}</div></div>
          <div className="admin-stat"><div className="admin-stat-label">Administrators</div><div className="admin-stat-value">{stats.totalAdmins}</div></div>
        </section>

        <section className="admin-card">
          <div className="admin-card-title">Registered accounts</div>
          {loading ? <div className="admin-empty">Loading accounts...</div> : users.length === 0 ? <div className="admin-empty">No accounts found.</div> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>User</th><th>Role</th><th>Joined</th><th>Last login</th><th>Analyses</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map((targetUser) => {
                    const isCurrentUser = targetUser._id === currentUser?.id;
                    const isBusy = busyId === targetUser._id;
                    return (
                      <tr key={targetUser._id}>
                        <td><div className="admin-name">{targetUser.name}</div><div>{targetUser.email}</div></td>
                        <td><span className={`admin-role ${targetUser.role}`}>{targetUser.role}</span></td>
                        <td>{formatDate(targetUser.createdAt)}</td>
                        <td>{formatDate(targetUser.lastLoginAt)}</td>
                        <td>{targetUser.analysisCount}</td>
                        <td><div className="admin-actions"><button type="button" className="admin-action" onClick={() => changeRole(targetUser)} disabled={isCurrentUser || isBusy}>{targetUser.role === 'admin' ? 'Make user' : 'Make admin'}</button><button type="button" className="admin-action danger" onClick={() => removeUser(targetUser)} disabled={isCurrentUser || isBusy}>Remove</button></div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};
