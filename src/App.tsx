import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PremiumLayout from './components/PremiumLayout';
import PremiumLogin from './components/PremiumLogin';
import PremiumDashboard from './components/PremiumDashboard';
import PremiumJournal from './components/PremiumJournal';
import PremiumIdeas from './components/PremiumIdeas';
import PremiumWorkouts from './components/PremiumWorkouts';
import PremiumMeals from './components/PremiumMeals';
import PremiumMoodWisdom from './components/PremiumMoodWisdom';
import PremiumCalendar from './components/PremiumCalendar';
import PremiumDataExport from './components/PremiumDataExport';
import PremiumGoals from './components/PremiumGoals';
import PremiumBooks from './components/PremiumBooks';
import PremiumBodyMetrics from './components/PremiumBodyMetrics';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Show login page if not authenticated
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
      case 'goals':
        return <PremiumGoals />;
      case 'books':
        return <PremiumBooks />;
      case 'bodymetrics':
        return <PremiumBodyMetrics />;
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
