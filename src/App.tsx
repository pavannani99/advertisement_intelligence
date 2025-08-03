import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SessionProvider } from './contexts/SessionContext';
import { UIProvider } from './contexts/UIContext';
import AppShell from './components/AppShell';
import LandingPage from './pages/LandingPage';
import CampaignDashboard from './pages/CampaignDashboard';
import AdResultsPage from './pages/AdResultsPage';

function App() {
  return (
    <UIProvider>
      <SessionProvider>
        <Router>
          <AppShell>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<CampaignDashboard />} />
              <Route path="/results/:campaignId" element={<AdResultsPage />} />
            </Routes>
          </AppShell>
        </Router>
      </SessionProvider>
    </UIProvider>
  );
}

export default App;
