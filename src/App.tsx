import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PremiumLogin from './components/PremiumLogin';
import PremiumLayout from './components/PremiumLayout';
import PremiumDashboard from './components/PremiumDashboard';
import PremiumJournal from './components/PremiumJournal';
import PremiumIdeas from './components/PremiumIdeas';
import PremiumWorkouts from './components/PremiumWorkouts';
import PremiumMeals from './components/PremiumMeals';
import PremiumMoodWisdom from './components/PremiumMoodWisdom';
import PremiumCalendar from './components/PremiumCalendar';
import PremiumDataExport from './components/PremiumDataExport';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!isAuthenticated) {
    return <PremiumLogin />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <PremiumDashboard onPageChange={setCurrentPage} />;
      case 'journal':
        return <PremiumJournal />;
      case 'ideas':
        return <PremiumIdeas />;
      case 'calendar':
        return <PremiumCalendar />;
      case 'mood':
        return <PremiumMoodWisdom />;
      case 'workouts':
        return <PremiumWorkouts />;
      case 'meals':
        return <PremiumMeals />;
      case 'export':
        return <PremiumDataExport />;
      default:
        return <PremiumDashboard onPageChange={setCurrentPage} />;
    }
  };

  return (
    <PremiumLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </PremiumLayout>
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
