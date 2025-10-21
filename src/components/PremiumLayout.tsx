import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, BookOpen, Lightbulb, Calendar, Heart, 
  Dumbbell, Camera, LogOut, Menu, X, Settings, User, 
  ChevronRight, Download, Sparkles, Target, ChevronLeft, Book
} from 'lucide-react';

interface PremiumLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const PremiumLayout: React.FC<PremiumLayoutProps> = ({ children, currentPage, onPageChange }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, gradient: 'from-blue-500 to-purple-600' },
    { id: 'journal', label: 'Journal', icon: BookOpen, gradient: 'from-emerald-500 to-teal-600' },
    { id: 'ideas', label: 'Ideas & Notes', icon: Lightbulb, gradient: 'from-amber-500 to-orange-600' },
    { id: 'books', label: 'Books', icon: Book, gradient: 'from-rose-500 to-pink-600' },
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
        h-full lg:h-screen 
        bg-gradient-to-b from-slate-800/50 to-slate-900/50 
        backdrop-blur-xl border-r border-white/10
        transform transition-all duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-80'}
        w-80
      `}>
        
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`p-6 border-b border-white/10 ${sidebarCollapsed ? 'lg:p-3' : ''}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                {!sidebarCollapsed && (
                  <div>
                    <h1 className="text-xl font-bold text-white">Eudaimon</h1>
                    <p className="text-white/60 text-sm">Personal Growth Hub</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  className="hidden lg:block p-2 hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  <ChevronLeft className={`w-5 h-5 text-white/60 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
                </button>
                <button 
                  className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>
            </div>
            
            {/* User Profile */}
            {!sidebarCollapsed && (
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
            )}
            {sidebarCollapsed && (
              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className={`flex-1 overflow-y-auto ${sidebarCollapsed ? 'lg:p-3' : 'p-6'}`}>
            <div className="mb-6">
              {!sidebarCollapsed && (
                <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">
                  Navigation
                </p>
              )}
              
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      className={`
                        w-full flex items-center rounded-xl transition-all duration-200 group relative
                        ${sidebarCollapsed ? 'justify-center p-2' : 'gap-4 p-3'}
                        ${isActive 
                          ? 'bg-white/10 border border-white/20 shadow-lg' 
                          : 'hover:bg-white/5 border border-transparent'
                        }
                      `}
                      onClick={() => {
                        onPageChange(item.id);
                        setSidebarOpen(false);
                      }}
                      title={sidebarCollapsed ? item.label : undefined}
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
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 text-white font-medium text-left">
                            {item.label}
                          </span>
                          {isActive && (
                            <ChevronRight className="w-4 h-4 text-white/60" />
                          )}
                        </>
                      )}
                      
                      {/* Tooltip for collapsed state */}
                      {sidebarCollapsed && (
                        <div className="absolute left-full ml-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          {item.label}
                        </div>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Footer */}
          <div className={`border-t border-white/10 ${sidebarCollapsed ? 'lg:p-3' : 'p-6'}`}>
            <div className="space-y-3">
              <button 
                className={`
                  w-full flex items-center rounded-xl transition-colors group relative
                  ${sidebarCollapsed ? 'justify-center p-2' : 'gap-3 p-3'} 
                  hover:bg-white/5
                `}
                title={sidebarCollapsed ? "Settings" : undefined}
                onClick={() => setShowSettings(true)}
              >
                <Settings className="w-5 h-5 text-white/60" />
                {!sidebarCollapsed && <span className="text-white/80">Settings</span>}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    Settings
                  </div>
                )}
              </button>
              
              <button
                className={`
                  w-full flex items-center rounded-xl transition-colors group relative
                  ${sidebarCollapsed ? 'justify-center p-2' : 'gap-3 p-3'} 
                  hover:bg-red-500/10
                `}
                onClick={handleLogout}
                title={sidebarCollapsed ? "Sign Out" : undefined}
              >
                <LogOut className="w-5 h-5 text-white/60 group-hover:text-red-400" />
                {!sidebarCollapsed && <span className="text-white/80 group-hover:text-red-400">Sign Out</span>}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    Sign Out
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-xl border-b border-white/10 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <button
              className="p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-95"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
            
            <div className="flex items-center gap-2 sm:gap-3">
              {currentMenuItem && (
                <>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-gradient-to-r ${currentMenuItem.gradient} flex items-center justify-center`}>
                    <currentMenuItem.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <h1 className="text-base sm:text-lg font-semibold text-white truncate max-w-[150px] sm:max-w-none">{currentMenuItem.label}</h1>
                </>
              )}
            </div>
            
            <div className="w-9 sm:w-10"> {/* Spacer */}</div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Settings</h2>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Account Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Account</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/80">Username</span>
                    <span className="text-white font-medium">{user?.username}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/80">Email</span>
                    <span className="text-white font-medium">{user?.email}</span>
                  </div>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Preferences</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/80">Dark Mode</span>
                    <div className="w-12 h-6 bg-purple-500 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/80">Notifications</span>
                    <div className="w-12 h-6 bg-white/20 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/80">Sidebar Collapsed</span>
                    <div className={`w-12 h-6 rounded-full relative transition-colors ${sidebarCollapsed ? 'bg-purple-500' : 'bg-white/20'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${sidebarCollapsed ? 'right-0.5' : 'left-0.5'}`}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* App Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">About</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/80">Version</span>
                    <span className="text-white font-medium">1.0.0</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/80">Database</span>
                    <span className="text-emerald-400 font-medium">Connected</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-2 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSidebarCollapsed(!sidebarCollapsed);
                }}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg transition-colors"
              >
                Toggle Sidebar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumLayout;