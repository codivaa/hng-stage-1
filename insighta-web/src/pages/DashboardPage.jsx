import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Header, MainContent, Navigation } from '../components/Layout';
import * as profileService from '../services/profiles';

const DashboardPage = () => {
  // Dashboard shows quick profile stats after the user is authenticated.
  const { user, logout } = useContext(AuthContext);
  const navigate = window.location;
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      // Get profiles for dashboard stats
      const response = await profileService.getProfiles({
        limit: 1,
        page: 1
      });

      // Fetch gender distribution
      const maleResponse = await profileService.getProfiles({
        gender: 'male',
        limit: 1,
        page: 1
      });

      const femaleResponse = await profileService.getProfiles({
        gender: 'female',
        limit: 1,
        page: 1
      });

      setMetrics({
        totalProfiles: response.total,
        maleCount: maleResponse.total,
        femaleCount: femaleResponse.total,
        malePercentage: response.total ? ((maleResponse.total / response.total) * 100).toFixed(1) : 0,
        femalePercentage: response.total ? ((femaleResponse.total / response.total) * 100).toFixed(1) : 0,
      });
    } catch (err) {
      setError('Failed to load metrics');
      console.error('Metrics error:', err);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 style={{ margin: 0 }}>Dashboard</h1>
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

          {loading ? (
            <div className="flex-center" style={{ height: '400px' }}>
              <div className="loading"></div>
            </div>
          ) : metrics ? (
            <>
              <h2 style={{ marginBottom: '30px' }}>Overview</h2>

              <div className="grid grid-3" style={{ gap: '20px', marginBottom: '40px' }}>
                {/* Total Profiles Card */}
                <div className="card">
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--primary-color)', fontSize: '36px', margin: '0 0 10px 0' }}>
                      {metrics.totalProfiles.toLocaleString()}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', margin: '0' }}>
                      Total Profiles
                    </p>
                  </div>
                </div>

                {/* Male Count Card */}
                <div className="card">
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ color: '#0066cc', fontSize: '36px', margin: '0 0 10px 0' }}>
                      {metrics.maleCount.toLocaleString()}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', margin: '0' }}>
                      Male Profiles
                    </p>
                    <p style={{ fontSize: '12px', color: '#999', margin: '5px 0 0 0' }}>
                      {metrics.malePercentage}% of total
                    </p>
                  </div>
                </div>

                {/* Female Count Card */}
                <div className="card">
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ color: '#e91e63', fontSize: '36px', margin: '0 0 10px 0' }}>
                      {metrics.femaleCount.toLocaleString()}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', margin: '0' }}>
                      Female Profiles
                    </p>
                    <p style={{ fontSize: '12px', color: '#999', margin: '5px 0 0 0' }}>
                      {metrics.femalePercentage}% of total
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <h3>Quick Actions</h3>
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <a href="/profiles" className="btn btn-primary">
                    Browse Profiles
                  </a>
                  <a href="/search" className="btn btn-secondary">
                    Search Profiles
                  </a>
                  {user?.role === 'admin' && (
                    <a href="/admin" className="btn btn-secondary">
                      Admin Panel
                    </a>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="alert alert-danger">Failed to load dashboard</div>
          )}
        </MainContent>
      </div>
    </div>
  );
};

export default DashboardPage;
