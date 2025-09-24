import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import SearchPage from './components/SearchPage';
import CalendarPage from './components/CalendarPage';
import PollsPage from './components/PollsPage';
import UserSettings from './components/UserSettings';
import WorkspaceSettings from './components/WorkspaceSettings';
import AnalyticsPage from './components/AnalyticsPage';
import WorkflowPage from './components/WorkflowPage';
import HelpPage from './components/HelpPage';
import PasswordRecovery from './components/PasswordRecovery';
import IntegrationsPage from './components/IntegrationsPage';
import HelpCategoryPage from './components/HelpCategoryPage';
import ContactPage from './components/ContactPage';
import { ChatProvider } from './contexts/ChatContext';

function App() {
  return (
      <ChatProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/password-recovery" element={<PasswordRecovery />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/polls" element={<PollsPage />} />
              <Route path="/settings" element={<UserSettings />} />
              <Route path="/workspace" element={<WorkspaceSettings />} />
              <Route path="/integrations" element={<IntegrationsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/workflow" element={<WorkflowPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/help/:category" element={<HelpCategoryPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Routes>
          </div>
        </Router>
      </ChatProvider>
  );
}

export default App;