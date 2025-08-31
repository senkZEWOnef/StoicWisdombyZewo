import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ModernLogin from './components/ModernLogin';
import ModernLayout from './components/ModernLayout';
import ModernDashboard from './components/ModernDashboard';
import Journal from './components/Journal';
import Ideas from './components/Ideas';
import Reminders from './components/Reminders';
import Calendar from './components/Calendar';
import MoodWisdom from './components/MoodWisdom';
import Poetry from './components/Poetry';
import EnhancedWorkouts from './components/EnhancedWorkouts';
import Meals from './components/Meals';
import DataExport from './components/DataExport';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!isAuthenticated) {
    return <ModernLogin />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <ModernDashboard onPageChange={setCurrentPage} />;
      case 'journal':
        return <Journal />;
      case 'ideas':
        return <Ideas />;
      case 'reminders':
        return <Reminders />;
      case 'calendar':
        return <Calendar />;
      case 'mood':
        return <MoodWisdom />;
      case 'poetry':
        return <Poetry />;
      case 'workouts':
        return <EnhancedWorkouts />;
      case 'meals':
        return <Meals />;
      case 'export':
        return <DataExport />;
      default:
        return <ModernDashboard />;
    }
  };

  return (
    <ModernLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </ModernLayout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
