import React from 'react';

export const Layout = ({ children }) => {
  return (
    <div className="layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {children}
    </div>
  );
};

export const Header = ({ children }) => {
  return (
    <header style={{
      backgroundColor: '#fff',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 20px'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px' }}>
        {children}
      </div>
    </header>
  );
};

export const Sidebar = ({ children }) => {
  return (
    <aside style={{
      width: '250px',
      backgroundColor: '#f9f9f9',
      borderRight: '1px solid var(--border-color)',
      padding: '20px 0',
      minHeight: '100vh'
    }}>
      {children}
    </aside>
  );
};

export const MainContent = ({ children }) => {
  return (
    <main style={{
      flex: 1,
      padding: '30px 20px',
      backgroundColor: '#f9f9f9'
    }}>
      <div className="container">
        {children}
      </div>
    </main>
  );
};

export const Navigation = ({ items, isActive }) => {
  return (
    <nav>
      <ul style={{ listStyle: 'none' }}>
        {items.map((item) => (
          <li key={item.path} style={{ marginBottom: '5px' }}>
            <a
              href={item.path}
              style={{
                display: 'block',
                padding: '12px 20px',
                textDecoration: 'none',
                color: isActive(item.path) ? 'var(--primary-color)' : 'var(--text-secondary)',
                backgroundColor: isActive(item.path) ? 'rgba(0, 102, 204, 0.05)' : 'transparent',
                borderLeft: isActive(item.path) ? '3px solid var(--primary-color)' : '3px solid transparent',
                fontWeight: isActive(item.path) ? '600' : '500',
                transition: 'all 0.2s ease'
              }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
