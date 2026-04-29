import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Header, MainContent, Navigation } from '../components/Layout';
import * as profileService from '../services/profiles';

const SearchPage = () => {
  const { user, logout } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1
  });

  const handleSearch = async (e, newPage = 1) => {
    if (e) e.preventDefault();

    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await profileService.searchProfiles(searchQuery, newPage, limit);
      setResults(response.data);
      setPagination({
        total: response.total,
        totalPages: response.total_pages,
        currentPage: response.page
      });
      setSearched(true);
      setPage(newPage);
    } catch (err) {
      setError('Failed to search profiles');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    handleSearch(null, newPage);
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
          <h1 style={{ margin: 0 }}>Search Profiles</h1>
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

          {/* Search Form */}
          <div className="card" style={{ marginBottom: '30px' }}>
            <h3 style={{ marginTop: 0 }}>Find Profiles</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
              Try keywords like: "male", "female", "young", "old", "senior", "Nigeria", "China", etc.
            </p>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Search profiles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, minHeight: '40px' }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ minWidth: '120px' }}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>

          {/* Results */}
          {searched && !loading && results.length > 0 ? (
            <>
              <div style={{ marginBottom: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                Found {pagination.total} profile{pagination.total !== 1 ? 's' : ''} matching "{searchQuery}"
              </div>

              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '20px'
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
                  {results.map((profile) => (
                    <tr key={profile.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{profile.name}</td>
                      <td style={{ padding: '12px', fontSize: '14px', textTransform: 'capitalize' }}>
                        {profile.gender}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{profile.age}</td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{profile.country_id}</td>
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
              {pagination.totalPages > 1 && (
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
                  ).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={pageNum === pagination.currentPage ? 'btn btn-primary' : 'btn btn-secondary'}
                      style={{ fontSize: '12px', minWidth: '32px' }}
                    >
                      {pageNum}
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
              )}
            </>
          ) : searched && !loading ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
                No profiles found matching "{searchQuery}"
              </p>
            </div>
          ) : searched && loading ? (
            <div className="flex-center" style={{ height: '400px' }}>
              <div className="loading"></div>
            </div>
          ) : (
            <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
                Enter a search query to find profiles
              </p>
            </div>
          )}
        </MainContent>
      </div>
    </div>
  );
};

export default SearchPage;
