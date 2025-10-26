import React, { useState } from 'react';
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
  Target, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'ideas', label: 'Ideas & Notes', icon: Lightbulb },
    { id: 'reminders', label: 'Reminders', icon: Bell },
    { id: 'calendar', label: 'Schedule', icon: Calendar },
    { id: 'mood', label: 'Mood & Wisdom', icon: Heart },
    { id: 'poetry', label: 'Poetry', icon: Feather },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'meals', label: 'Meals', icon: Camera },
    { id: 'goals', label: 'Daily Goals', icon: Target },
  ];

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
  };

  return (
    <div className="d-flex" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="position-fixed w-100 h-100 bg-dark opacity-50 d-md-none"
          style={{ zIndex: 1040 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`bg-primary text-white position-fixed position-md-sticky d-flex flex-column ${sidebarOpen ? 'd-flex' : 'd-none d-md-flex'}`} 
           style={{ width: '250px', top: 0, left: 0, zIndex: 1050, height: '100vh' }}>
        <div className="p-3 flex-grow-1 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">🧘 Journal</h4>
            <button 
              className="btn btn-link text-white d-md-none p-0"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="text-sm mb-4">
            Welcome, {user?.username}!
          </div>

          <nav className="flex-grow-1" style={{ overflowY: 'auto' }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`btn w-100 text-start mb-2 d-flex align-items-center ${
                    currentPage === item.id ? 'btn-light text-primary' : 'btn-outline-light'
                  }`}
                  onClick={() => {
                    onPageChange(item.id);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon size={18} className="me-2" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-3">
            <button
              className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center"
              onClick={handleLogout}
            >
              <LogOut size={18} className="me-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column" style={{ height: '100vh', overflow: 'hidden' }}>
        {/* Top Bar - Reorganized for mobile */}
        <div className="bg-white border-bottom p-3 d-flex align-items-center justify-content-between">
          {/* Left side - App icon/title */}
          <div className="d-flex align-items-center">
            <span className="h4 mb-0 me-3 d-md-none">🧘</span>
            <h1 className="h4 mb-0 text-capitalize d-none d-md-block">
              {menuItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
            </h1>
            <h1 className="h5 mb-0 text-capitalize d-md-none">
              {menuItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
            </h1>
          </div>
          
          {/* Right side - Burger menu */}
          <button
            className="btn btn-outline-primary d-md-none"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Page Content - Scrollable */}
        <div className="flex-grow-1 p-3 p-md-4" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;