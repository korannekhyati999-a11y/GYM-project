import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import MarketingPage from './pages/MarketingPage';
import TrainerDashboard from './pages/TrainerDashboard';
import ClientDashboard from './pages/ClientDashboard';
import MobileApp from './pages/MobileApp';
import AdminPanel from './pages/AdminPanel';
import LoginPage from './pages/LoginPage';
import MobileShell from './pages/MobileShell';

// Detect Capacitor native runtime (injected by the native WebView bridge)
const isNative = typeof window !== 'undefined' && !!(window.Capacitor?.isNativePlatform?.());

function App() {
  // When running inside the Android/iOS app, only the mobile shell is shown.
  // The full web router is skipped so the native app never shows the marketing site.
  if (isNative) {
    return (
      <AuthProvider>
        <MobileShell />
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<MarketingPage />} />
          </Route>
          <Route path="/login"   element={<LoginPage />} />
          <Route path="/trainer" element={<TrainerDashboard />} />
          <Route path="/client"  element={<ClientDashboard />} />
          <Route path="/app"     element={<MobileApp />} />
          <Route path="/admin"   element={<AdminPanel />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
