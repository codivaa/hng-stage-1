import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Header, MainContent, Navigation } from '../components/Layout';
import * as profileService from '../services/profiles';

const ProfileDetailPage = () => {
  // Profile detail page reads the route id and loads one profile from the API.
  const { id } = useParams();
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile(id);
      setProfile(data);
    } catch (err) {
      setError('Failed to load profile');
      console.error('Profile error:', err);
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
          <h1 style={{ margin: 0 }}>Profile Details</h1>
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
          ) : profile ? (
            <>
              <div style={{ marginBottom: '20px' }}>
                <a href="/profiles" className="btn btn-secondary" style={{ fontSize: '14px' }}>
                  ← Back to Profiles
                </a>
              </div>

              <div className="card">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
                  {/* Basic Info */}
                  <div>
                    <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>
                      {profile.name}
                    </h3>

                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '5px' }}>
                        Gender
                      </p>
                      <p style={{ fontSize: '16px', fontWeight: '500', textTransform: 'capitalize' }}>
                        {profile.gender}
                      </p>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '5px' }}>
                        Gender Probability
                      </p>
                      <p style={{ fontSize: '16px', fontWeight: '500' }}>
                        {(profile.gender_probability * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  {/* Age Info */}
                  <div>
                    <h4 style={{ marginBottom: '15px', color: 'var(--text-secondary)' }}>Age Information</h4>

                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '5px' }}>
                        Age
                      </p>
                      <p style={{ fontSize: '16px', fontWeight: '500' }}>
                        {profile.age} years
                      </p>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '5px' }}>
                        Age Group
                      </p>
                      <p style={{ fontSize: '16px', fontWeight: '500' }}>
                        {profile.age_group}
                      </p>
                    </div>
                  </div>

                  {/* Country Info */}
                  <div>
                    <h4 style={{ marginBottom: '15px', color: 'var(--text-secondary)' }}>Country Information</h4>

                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '5px' }}>
                        Country ID
                      </p>
                      <p style={{ fontSize: '16px', fontWeight: '500' }}>
                        {profile.country_id}
                      </p>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '5px' }}>
                        Country Probability
                      </p>
                      <p style={{ fontSize: '16px', fontWeight: '500' }}>
                        {(profile.country_probability * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div>
                    <h4 style={{ marginBottom: '15px', color: 'var(--text-secondary)' }}>Metadata</h4>

                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '5px' }}>
                        Profile ID
                      </p>
                      <p style={{ fontSize: '14px', fontWeight: '500', wordBreak: 'break-all' }}>
                        {profile.id}
                      </p>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '5px' }}>
                        Created At
                      </p>
                      <p style={{ fontSize: '14px', fontWeight: '500' }}>
                        {new Date(profile.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '30px' }}>
                <div className="card" style={{ textAlign: 'center' }}>
                  <h4 style={{ color: 'var(--primary-color)', margin: '0 0 10px 0' }}>
                    Confidence Score
                  </h4>
                  <p style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                    {((
                      (profile.gender_probability + profile.country_probability) / 2
                    ) * 100).toFixed(1)}%
                  </p>
                </div>

                <div className="card" style={{ textAlign: 'center' }}>
                  <h4 style={{ color: 'var(--primary-color)', margin: '0 0 10px 0' }}>
                    Data Quality
                  </h4>
                  <p style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                    {profile.gender_probability > 0.8 && profile.country_probability > 0.8 ? 'High' : 'Medium'}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="alert alert-danger">Profile not found</div>
          )}
        </MainContent>
      </div>
    </div>
  );
};

export default ProfileDetailPage;
