import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, BookOpen, Lightbulb, Bell, Calendar, Heart, Feather, 
  Dumbbell, Camera, LogOut, Menu, X, Settings, User, 
  ChevronRight, Download, Sparkles, TrendingUp, Target
} from 'lucide-react';

interface PremiumLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const PremiumLayout: React.FC<PremiumLayoutProps> = ({ children, currentPage, onPageChange }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, gradient: 'from-blue-500 to-purple-600' },
    { id: 'journal', label: 'Journal', icon: BookOpen, gradient: 'from-emerald-500 to-teal-600' },
    { id: 'ideas', label: 'Ideas & Notes', icon: Lightbulb, gradient: 'from-amber-500 to-orange-600' },
    { id: 'goals', label: 'Goals', icon: Target, gradient: 'from-cyan-500 to-blue-600' },
    { id: 'calendar', label: 'Schedule', icon: Calendar, gradient: 'from-indigo-500 to-purple-600' },
    { id: 'mood', label: 'Mood & Wisdom', icon: Heart, gradient: 'from-red-500 to-rose-600' },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell, gradient: 'from-green-500 to-emerald-600' },
    { id: 'meals', label: 'Meals', icon: Camera, gradient: 'from-yellow-500 to-amber-600' },
    { id: 'export', label: 'Export Data', icon: Download, gradient: 'from-violet-500 to-purple-600' },
  ];

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
  };

  const currentMenuItem = menuItems.find(item => item.id === currentPage);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative z-50 lg:z-auto
        h-full lg:h-screen w-80 
        bg-gradient-to-b from-slate-800/50 to-slate-900/50 
        backdrop-blur-xl border-r border-white/10
        transform transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Stoic Wisdom</h1>
                  <p className="text-white/60 text-sm">Personal Growth Hub</p>
                </div>
              </div>
              <button 
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{user?.username}</p>
                <p className="text-white/60 text-sm">Welcome back!</p>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">
                Navigation
              </p>
              
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      className={`
                        w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200
                        ${isActive 
                          ? 'bg-white/10 border border-white/20 shadow-lg' 
                          : 'hover:bg-white/5 border border-transparent'
                        }
                      `}
                      onClick={() => {
                        onPageChange(item.id);
                        setSidebarOpen(false);
                      }}
                    >
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        ${isActive 
                          ? `bg-gradient-to-r ${item.gradient}` 
                          : 'bg-white/10'
                        }
                      `}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="flex-1 text-white font-medium text-left">
                        {item.label}
                      </span>
                      {isActive && (
                        <ChevronRight className="w-4 h-4 text-white/60" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10">
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors">
                <Settings className="w-5 h-5 text-white/60" />
                <span className="text-white/80">Settings</span>
              </button>
              
              <button
                className="w-full flex items-center gap-3 p-3 hover:bg-red-500/10 rounded-xl transition-colors group"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 text-white/60 group-hover:text-red-400" />
                <span className="text-white/80 group-hover:text-red-400">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-xl border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <button
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
            
            <div className="flex items-center gap-3">
              {currentMenuItem && (
                <>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${currentMenuItem.gradient} flex items-center justify-center`}>
                    <currentMenuItem.icon className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="text-lg font-semibold text-white">{currentMenuItem.label}</h1>
                </>
              )}
            </div>
            
            <div className="w-10"> {/* Spacer */}</div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PremiumLayout;