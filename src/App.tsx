import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-600 font-medium">Cargando...</p>
      </div>
    );
  }

  if (user) {
    return <DashboardPage />;
  }

  return authView === 'login' ? (
    <LoginPage onSwitchToRegister={() => setAuthView('register')} />
  ) : (
    <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
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