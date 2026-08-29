import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BoardPage from './pages/BoardPage';
import TimelinePage from './pages/TimelinePage';
import ProjectsPage from './pages/ProjectsPage';
import NotesPage from './pages/NotesPage';
import SettingsPage from './pages/SettingsPage';

// Middleware
import PrivateRoute from './components/PrivateRoute';

function App() {
  const { isAuthenticated, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={<PrivateRoute element={<DashboardPage />} />}
        />
        <Route
          path="/board/:projectId"
          element={<PrivateRoute element={<BoardPage />} />}
        />
        <Route
          path="/timeline/:projectId"
          element={<PrivateRoute element={<TimelinePage />} />}
        />
        <Route
          path="/projects"
          element={<PrivateRoute element={<ProjectsPage />} />}
        />
        <Route
          path="/notes"
          element={<PrivateRoute element={<NotesPage />} />}
        />
        <Route
          path="/settings"
          element={<PrivateRoute element={<SettingsPage />} />}
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
