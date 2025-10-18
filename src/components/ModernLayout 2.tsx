import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  BookOpen, 
  Lightbulb, 
  Bell, 
  Calendar, 
  Heart, 
  Feather, 
  Dumbbell, 
  Camera, 
  LogOut,
  Menu,
  X,
  Settings,
  User,
  ChevronRight,
  Download,
  Moon,
  Sun
} from 'lucide-react';

interface ModernLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const ModernLayout: React.FC<ModernLayoutProps> = ({ children, currentPage, onPageChange }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDarkMode = savedTheme ? savedTheme === 'dark' : prefersDark;
    
    setIsDarkMode(shouldUseDarkMode);
    document.documentElement.setAttribute('data-theme', shouldUseDarkMode ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    const theme = newTheme ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: '#667eea' },
    { id: 'journal', label: 'Journal', icon: BookOpen, color: '#f093fb' },
    { id: 'ideas', label: 'Ideas & Notes', icon: Lightbulb, color: '#4facfe' },
    { id: 'reminders', label: 'Reminders', icon: Bell, color: '#43e97b' },
    { id: 'calendar', label: 'Schedule', icon: Calendar, color: '#fa709a' },
    { id: 'mood', label: 'Mood & Wisdom', icon: Heart, color: '#ff6b6b' },
    { id: 'poetry', label: 'Poetry', icon: Feather, color: '#a8edea' },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell, color: '#ffeaa7' },
    { id: 'meals', label: 'Meals', icon: Camera, color: '#fd79a8' },
    { id: 'export', label: 'Export Data', icon: Download, color: '#74b9ff' },
  ];

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
  };

  const currentMenuItem = menuItems.find(item => item.id === currentPage);

  return (
    <div className="modern-layout">
      
      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`modern-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        
        <div className="sidebar-content">
          {/* Sidebar Header */}
          <div className="sidebar-header">
            <div className="brand-section">
              <div className="brand-icon">
                <span>S</span>
              </div>
              <div className="brand-text">
                <h3>Stoic Wisdom</h3>
                <p>Personal Growth</p>
              </div>
              <button 
                className="close-sidebar"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            {/* User info */}
            <div className="user-info">
              <div className="user-avatar">
                <User size={20} />
              </div>
              <div className="user-details">
                <div className="user-name">{user?.username}</div>
                <div className="user-status">Welcome back!</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="sidebar-nav">
            <div className="nav-section-title">
              MAIN MENU
            </div>
            
            <nav className="nav-items">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    style={{ '--item-color': item.color } as React.CSSProperties}
                    onClick={() => {
                      onPageChange(item.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon size={20} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                    {isActive && <ChevronRight size={16} className="nav-arrow" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="sidebar-footer">
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={20} />
        </button>

        {/* Page Content */}
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModernLayout;