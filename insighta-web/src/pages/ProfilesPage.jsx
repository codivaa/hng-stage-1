import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Header, MainContent, Navigation } from '../components/Layout';
import * as profileService from '../services/profiles';

const ProfilesPage = () => {
  // Profiles page loads paginated profile data and applies filter controls.
  const { user, logout } = useContext(AuthContext);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    gender: '',
    age_group: '',
    country_id: '',
    page: 1,
    limit: 10
  });

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1
  });

  useEffect(() => {
    fetchProfiles();
  }, [filters]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await profileService.getProfiles(filters);
      setProfiles(response.data);
      setPagination({
        total: response.total,
        totalPages: response.total_pages,
        currentPage: response.page
      });
    } catch (err) {
      setError('Failed to load profiles');
      console.error('Profiles error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filter changes
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
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
          <h1 style={{ margin: 0 }}>Profiles</h1>
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

          {/* Filters */}
          <div className="card" style={{ marginBottom: '30px' }}>
            <h3 style={{ marginTop: 0 }}>Filters</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                  Gender
                </label>
                <select
                  value={filters.gender}
                  onChange={(e) => handleFilterChange('gender', e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                  Age Group
                </label>
                <select
                  value={filters.age_group}
                  onChange={(e) => handleFilterChange('age_group', e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">All Ages</option>
                  <option value="< 20">Under 20</option>
                  <option value="20-30">20-30</option>
                  <option value="30-40">30-40</option>
                  <option value="40-50">40-50</option>
                  <option value="> 50">Over 50</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                  Country
                </label>
                <input
                  type="text"
                  placeholder="e.g., NG, US, CN"
                  value={filters.country_id}
                  onChange={(e) => handleFilterChange('country_id', e.target.value.toUpperCase())}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                  Results Per Page
                </label>
                <select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                  style={{ width: '100%' }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex-center" style={{ height: '400px' }}>
              <div className="loading"></div>
            </div>
          ) : profiles.length > 0 ? (
            <>
              <div style={{ marginBottom: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                Showing {((pagination.currentPage - 1) * filters.limit) + 1} - {Math.min(pagination.currentPage * filters.limit, pagination.total)} of {pagination.total} profiles
              </div>

              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: '#f9f9f9' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Gender</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Age</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Country</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((profile) => (
                    <tr key={profile.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{profile.name}</td>
                      <td style={{ padding: '12px', fontSize: '14px', textTransform: 'capitalize' }}>
                        {profile.gender}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{profile.age}</td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{profile.country_name || profile.country_id}</td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>
                        <a
                          href={`/profile/${profile.id}`}
                          className="btn btn-primary"
                          style={{ fontSize: '12px', padding: '4px 8px' }}
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '20px' }}>
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px' }}
                >
                  Previous
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).slice(
                  Math.max(0, pagination.currentPage - 3),
                  Math.min(pagination.totalPages, pagination.currentPage + 2)
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={page === pagination.currentPage ? 'btn btn-primary' : 'btn btn-secondary'}
                    style={{ fontSize: '12px', minWidth: '32px' }}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px' }}
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No profiles found</p>
            </div>
          )}
        </MainContent>
      </div>
    </div>
  );
};

export default ProfilesPage;
