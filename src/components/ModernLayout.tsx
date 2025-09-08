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
    <div className="d-flex min-vh-100" style={{ backgroundColor: '#f8fafc' }}>
      
      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="position-fixed w-100 h-100 d-md-none"
          style={{ 
            zIndex: 1040, 
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`h-100 ${sidebarOpen ? 'd-block position-fixed' : 'd-none d-md-block position-relative'}`} 
           style={{ 
             width: '280px', 
             top: sidebarOpen ? 0 : 'auto', 
             left: sidebarOpen ? 0 : 'auto', 
             zIndex: sidebarOpen ? 1050 : 'auto',
             backgroundColor: '#ffffff',
             boxShadow: '0 0 40px rgba(0,0,0,0.1)',
             minHeight: '100vh'
           }}>
        
        <div className="h-100 d-flex flex-column">
          {/* Sidebar Header */}
          <div className="p-4 border-bottom">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center">
                <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                     style={{ 
                       width: '40px', 
                       height: '40px', 
                       background: 'linear-gradient(135deg, #667eea, #764ba2)' 
                     }}>
                  <span className="text-white fw-bold">J</span>
                </div>
                <div>
                  <h6 className="mb-0 fw-bold text-dark">Journal</h6>
                  <small className="text-muted">Personal Growth</small>
                </div>
              </div>
              <button 
                className="btn btn-link text-muted d-md-none p-0"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            {/* User info */}
            <div className="d-flex align-items-center p-3 rounded-3" 
                 style={{ backgroundColor: '#f1f5f9' }}>
              <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                   style={{ 
                     width: '36px', 
                     height: '36px', 
                     backgroundColor: '#667eea' 
                   }}>
                <User size={18} className="text-white" />
              </div>
              <div className="flex-grow-1">
                <div className="fw-medium text-dark">{user?.username}</div>
                <small className="text-muted">Welcome back!</small>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-grow-1 p-3">
            <div className="mb-3">
              <small className="text-muted text-uppercase fw-bold px-3" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                MAIN MENU
              </small>
            </div>
            
            <nav>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    className={`btn w-100 text-start mb-2 d-flex align-items-center position-relative ${
                      isActive ? 'text-white' : 'text-dark'
                    }`}
                    style={{
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      background: isActive 
                        ? `linear-gradient(135deg, ${item.color}, ${item.color}dd)` 
                        : 'transparent',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => {
                      onPageChange(item.id);
                      setSidebarOpen(false);
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }
                    }}
                  >
                    <Icon size={20} className="me-3" />
                    <span className="flex-grow-1 fw-medium">{item.label}</span>
                    {isActive && <ChevronRight size={16} />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-top">
            <button
              className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center rounded-3"
              onClick={handleLogout}
              style={{ 
                border: '1px solid #fee2e2',
                color: '#dc2626',
                padding: '12px'
              }}
            >
              <LogOut size={18} className="me-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Top Bar */}
        <div className="bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between"
             style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div className="d-flex align-items-center">
            <button
              className="btn btn-light d-md-none me-3 rounded-3"
              onClick={() => setSidebarOpen(true)}
              style={{ padding: '8px 12px' }}
            >
              <Menu size={20} />
            </button>
            
            <div>
              <h4 className="mb-0 fw-bold text-dark d-flex align-items-center">
                {currentMenuItem && (
                  <>
                    <div className="rounded-2 d-flex align-items-center justify-content-center me-3"
                         style={{ 
                           width: '32px', 
                           height: '32px', 
                           backgroundColor: `${currentMenuItem.color}20`,
                         }}>
                      <currentMenuItem.icon size={18} style={{ color: currentMenuItem.color }} />
                    </div>
                    {currentMenuItem.label}
                  </>
                )}
              </h4>
              <small className="text-muted">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </small>
            </div>
          </div>

          <div className="d-flex align-items-center">
            <button 
              className="btn btn-light rounded-3 me-2" 
              onClick={toggleTheme}
              style={{ padding: '8px 12px' }}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="btn btn-light rounded-3 me-2" style={{ padding: '8px 12px' }}>
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-grow-1 p-4" style={{ backgroundColor: '#f8fafc' }}>
          <div className="container-fluid">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernLayout;