import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, UserCircle, BookOpen, Target, FileText, Settings } from 'lucide-react';
import { useProfileStore } from '../store/useDataStore';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const atsScores = useProfileStore(state => state.atsScores) || [];
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/profile', label: 'Master Profile', icon: UserCircle },
    { path: '/journal', label: 'Learning Journal', icon: BookOpen },
    { path: '/job-match', label: 'Job Match', icon: Target },
    { path: '/builder', label: 'Resume Builder', icon: FileText },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const averageScore = atsScores.length > 0 
    ? Math.round(atsScores.reduce((a, b) => a + b, 0) / atsScores.length)
    : 0;

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">
            <FileText size={24} color="var(--primary)" />
          </div>
          <h2 className="logo-text text-gradient">Resume AI</h2>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={20} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      
      <div className="sidebar-footer">
        <div className="ats-score-widget">
          <span className="widget-label">Average ATS Score</span>
          <div className="score-value text-gradient">{averageScore > 0 ? `${averageScore}/100` : '--/100'}</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
