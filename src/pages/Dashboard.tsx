import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h1 className="text-gradient" style={{ marginBottom: '1.5rem' }}>Dashboard</h1>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <p>Welcome to Resume AI. Your average ATS score is looking good!</p>
        <p className="text-muted" style={{ marginTop: '1rem' }}>We will add recent activity and stats here soon.</p>
      </div>
    </div>
  );
};

export default Dashboard;
