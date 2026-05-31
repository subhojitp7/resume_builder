import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="app-header glass-panel">
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search job descriptions, logs..." 
          className="search-input"
        />
      </div>
      
      <div className="header-actions">
        <button className="icon-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        
        <div className="user-profile">
          <div className="avatar">
            <User size={20} />
          </div>
          <span className="user-name">User</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
