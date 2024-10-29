import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';
import Dashboard from './components/Dashboard';
import ResponsiveCancerInstitute from './components/ResponsiveCancerInstitute';
import UserAccountInfo from './components/UserAccountInfo';
import AuthGuard from './components/AuthGuard';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          }
        />
        <Route
          path="/responsive-cancer-institute"
          element={
            <AuthGuard>
              <ResponsiveCancerInstitute />
            </AuthGuard>
          }
        />
        <Route
          path="/account-info"
          element={
            <AuthGuard>
              <UserAccountInfo />
            </AuthGuard>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;


/*
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';
import Dashboard from './components/Dashboard';
import ResponsiveCancerInstitute from './components/ResponsiveCancerInstitute'; // Import the new component
import UserAccountInfo from './components/UserAccountInfo';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/responsive-cancer-institute" element={<ResponsiveCancerInstitute />} />{ New Route }
       <Route path="/account-info" element={<UserAccountInfo />} />
      </Routes>
    </Router>
  );
};

export default App;*/