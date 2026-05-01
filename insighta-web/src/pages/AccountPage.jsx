import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Header, MainContent, Navigation } from '../components/Layout';

const AccountPage = () => {
  // Account page displays the current user's profile and role information.
  const { user, logout } = useContext(AuthContext);
  const [error, setError] = React.useState(null);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (err) {
      setError('Failed to logout');
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/profiles', label: 'Profiles' },
    { path: '/search', label: 'Search' },
    { path: '/account', label: 'Account' }
  ];

  const isActive = (path) => window.location.pathname === path;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{
        width: '250px',
        backgroundColor: '#f9f9f9',
        borderRight: '1px solid var(--border-color)',
        padding: '20px 0'
      }}>
        <div style={{ padding: '20px' }}>
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '30px' }}>Insighta</h2>
          <Navigation items={navItems} isActive={isActive} />
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header>
          <h1 style={{ margin: 0 }}>Account Settings</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {user?.username}
            </span>
            {user?.avatar_url && (
              <img
                src={user.avatar_url}
                alt="Avatar"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%'
                }}
              />
            )}
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ padding: '6px 12px' }}
            >
              Logout
            </button>
          </div>
        </Header>

        <MainContent>
          {error && (
            <div className="alert alert-danger">{error}</div>
          )}

          <div style={{ maxWidth: '600px' }}>
            {/* Profile Card */}
            <div className="card" style={{ marginBottom: '30px' }}>
              <h3 style={{ marginTop: 0 }}>Account Information</h3>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '30px',
                paddingBottom: '30px',
                borderBottom: '1px solid var(--border-color)'
              }}>
                {user?.avatar_url && (
                  <img
                    src={user.avatar_url}
                    alt="Avatar"
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      marginRight: '20px',
                      border: '3px solid var(--primary-color)'
                    }}
                  />
                )}

                <div>
                  <h2 style={{ margin: '0 0 10px 0' }}>{user?.username}</h2>
                  <p style={{ margin: '0 0 5px 0', color: 'var(--text-secondary)' }}>
                    {user?.email}
                  </p>
                  <p style={{
                    margin: '0',
                    display: 'inline-block',
                    padding: '4px 8px',
                    backgroundColor: user?.role === 'admin' ? '#e3f2fd' : '#f3e5f5',
                    color: user?.role === 'admin' ? '#1976d2' : '#6a1b9a',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {user?.role}
                  </p>
                </div>
              </div>

              {/* User Details */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>Details</h4>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>
                    Username
                  </label>
                  <p style={{ margin: '0', fontSize: '16px' }}>{user?.username}</p>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>
                    Email
                  </label>
                  <p style={{ margin: '0', fontSize: '16px' }}>{user?.email}</p>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>
                    Role
                  </label>
                  <p style={{ margin: '0', fontSize: '16px', textTransform: 'capitalize' }}>
                    {user?.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Permissions */}
            {user?.role === 'admin' && (
              <div className="card" style={{ marginBottom: '30px' }}>
                <h3 style={{ marginTop: 0 }}>Admin Permissions</h3>
                <ul style={{ paddingLeft: '20px', marginBottom: 0 }}>
                  <li style={{ marginBottom: '10px' }}>Create profiles</li>
                  <li style={{ marginBottom: '10px' }}>Delete profiles</li>
                  <li style={{ marginBottom: '10px' }}>Export profile data</li>
                  <li style={{ marginBottom: '10px' }}>Manage users</li>
                </ul>
              </div>
            )}

            {/* Logout Section */}
            <div className="card" style={{ backgroundColor: '#fff3cd', borderColor: '#ffc107' }}>
              <h3 style={{ marginTop: 0, color: '#856404' }}>Sign Out</h3>
              <p style={{ color: '#856404', marginBottom: '15px' }}>
                You can sign out from this device. You'll need to sign in again with your GitHub account to access your profile.
              </p>
              <button
                onClick={handleLogout}
                className="btn"
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  padding: '10px 20px'
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </MainContent>
      </div>
    </div>
  );
};

export default AccountPage;
