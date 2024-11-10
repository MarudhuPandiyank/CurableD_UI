import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';
import Dashboard from './components/Dashboard';
import ResponsiveCancerInstitute from './components/ResponsiveCancerInstitute';
import UserAccountInfo from './components/UserAccountInfo';
import AuthGuard from './components/AuthGuard';
import HomePage from './components/HomePage';
import OutreachClinicCreation from './components/OutreachClinicCreation';
import ResourcePlanning from './components/ResourcePlanning'; 
import SuccessMessage from './components/SuccessMessage'; 
import OutreachClinicInfo from './components/OutreachClinicInfo'; 

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/HomePage" element={<HomePage />} />
        <Route path="/create-outreach-clinic" element={<OutreachClinicCreation />} />
        <Route path="/resource-planning" element={<ResourcePlanning />} /> 
        <Route path="/success-message" element={<SuccessMessage />} />
        <Route path="/outreach-clinic-info" element={<OutreachClinicInfo />} />
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