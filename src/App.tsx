import React, { useEffect } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';
import ResponsiveCancerInstitute from './components/ResponsiveCancerInstitute';
import UserAccountInfo from './components/UserAccountInfo';
import AuthGuard from './components/AuthGuard';
import HomePage from './components/HomePage';
import OutreachClinicCreation from './components/OutreachClinicCreation';
import CreateNewUser from './components/CreateNewUser';
import ResourcePlanning from './components/ResourcePlanning'; 
import SuccessMessage from './components/SuccessMessage'; 
import OutreachClinicInfo from './components/OutreachClinicInfo'; 
import EditOutreachClinic from './components/EditOutreachClinic';
import ResourceAllocation from './components/ResourceAllocation';
import DiseaseSpecificDetails from './components/DiseaseSpecificDetails';
import NewScreeningEnrollment from './components/NewScreeningEnrollment';
import MedicalomenHealthDetails from './components/MedicalomenHealthDetails';
import ParticipantDetails from './components/ParticipantDetails';
import TenantDetails from './components/TenantDetails';
import PatientSearchPage from './components/clinical/PatientSearchPage';
import ExaminationScreen from './components/clinical/ExaminationScreen';
import OralExaminationPage from './components/clinical/OralExaminationPage';
import DiseaseSpecificDetailsClinic from './components/DiseaseSpecificDetailsScreening';
import FamilyPersonalDetails from './components/FamilyPersonalDetails';
import FamilyMedicalDetails from './components/FamilyMedicalDetails';
import ClinicSearchPage from './components/clinical/ClinicSearchPage';
import ClinicalDetails from './components/ClinicalDetails';
import DiseaseSpecificDetailsClinical from './components/DiseaseSpecificDetailsClinical';
import PatientRegistrationSearch from './components/PatientRegistrationSearch';
import ProfileScreen from './components/ProfileScreen';
import SuccessMessagePatient from './components/SuccessMessagePatient';
import SuccessMessagePRFinal from './components/SuccessMessagePRFinal';
import SuccessMessageScreeningFInal from './components/SuccessMessageScreeningFInal';
import SuccessMessageClinicalFInal from './components/SuccessMessageClinicalFInal';
import DynamicScreen from './components/DynamicScreen';
import SuccessMessageEdit from './components/SuccessMessageEdit';
import DiseaseSpecificDetailsScreening from './components/DiseaseSpecificDetailsScreening';
import PatientEdit from './components/PatientEdit';
import refreshToken from './components/refreshToken';
import ScrollToTop from './ScrollToTop';
import Reports from "./components/Reports";
import UserManagement from "./components/UserManagement";



const App: React.FC = () => {
  useEffect(() => {
    refreshToken();

    const interval = setInterval(() => {
      refreshToken();
    }, 119 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <AuthGuard>
              <Routes>
                <Route path="/HomePage" element={<HomePage />} />
                <Route path="/create-outreach-clinic" element={<OutreachClinicCreation />} />
                <Route path="/resource-planning" element={<ResourcePlanning />} /> 
                <Route path="/success-message" element={<SuccessMessage />} />
                <Route path="/success-messageEdit" element={<SuccessMessageEdit />} />
                <Route path="/outreach-clinic-info" element={<OutreachClinicInfo />} />
                <Route path="/EditOutreachClinic" element={<EditOutreachClinic />} />
                <Route path="/resource-allocation" element={<ResourceAllocation />} />
                <Route path="/DiseaseSpecificDetails" element={<DiseaseSpecificDetails />} />
                <Route path="/NewScreeningEnrollment" element={<NewScreeningEnrollment />} />
                <Route path="/MedicalomenHealthDetails" element={<MedicalomenHealthDetails />} />
                <Route path="/ParticipantDetails" element={<ParticipantDetails />} />
                <Route path="/ClinicalDetails" element={<ClinicalDetails />} />
                <Route path="/TenantDetails" element={<TenantDetails />} />
                <Route path="/PatientSearchPage" element={<PatientSearchPage />} />
                <Route path="/ExaminationScreen" element={<ExaminationScreen />} />
                <Route path="/OralExaminationPage" element={<OralExaminationPage />} />
                <Route path="/DiseaseSpecificDetailsScreening" element={<DiseaseSpecificDetailsScreening />} />
                <Route path="/FamilyPersonalDetails" element={<FamilyPersonalDetails />} />
                <Route path="/FamilyMedicalDetails" element={<FamilyMedicalDetails />} />
                <Route path="/responsive-cancer-institute" element={<ResponsiveCancerInstitute />} />
                <Route path="/account-info" element={<UserAccountInfo />} />
                <Route path="/ClinicSearchPage" element={<ClinicSearchPage />} />
                <Route path="/DiseaseSpecificDetailsClinical" element={<DiseaseSpecificDetailsClinical />} />
                <Route path="/PatientRegistrationSearch" element={<PatientRegistrationSearch />} />
                <Route path="/ProfileScreen" element={<ProfileScreen />} />
                <Route path="/SuccessMessagePatient" element={<SuccessMessagePatient />} />
                <Route path="/SuccessMessagePRFinal" element={<SuccessMessagePRFinal />} />
                <Route path="/SuccessMessageScreeningFInal" element={<SuccessMessageScreeningFInal />} />
                <Route path="/SuccessMessageClinicalFInal" element={<SuccessMessageClinicalFInal />} />
                <Route path="/DynamicScreen" element={<DynamicScreen />} />
                <Route path="/PatientEdit" element={<PatientEdit />} />
                <Route path="/reports" element={<Reports />} />
                 <Route path="/userManagement" element={<UserManagement />} />
                <Route path="/create-new-user" element={<CreateNewUser />} />


                
              </Routes>
            </AuthGuard>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
