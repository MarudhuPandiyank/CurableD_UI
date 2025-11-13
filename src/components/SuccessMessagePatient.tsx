import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SuccessMessage.css';

const SuccessMessagePatient = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clickId, hideNextEnrollment } = location.state || {};
  return (
    <div className='container5'>
      <main className="content">
        <img src='./Curable Icons/PNG/Group 261.png' alt="Success Icon" className="icon" /><br/>
        <h1>Patient has been Tagged Successfully!</h1>
           <p className="reg-id-text">Patient Registration ID: <strong>{clickId && clickId.registraionId}</strong></p>

        
        {!hideNextEnrollment && (
          <button className="primary-button" onClick={() => navigate('/NewScreeningEnrollment')}>
            Begin Next Enrollment
          </button>
        )}
        <button className="secondary-button" onClick={() => navigate('/responsive-cancer-institute')}>
          Back To Home
        </button>
      </main>
    </div>
  );
}; 

export default SuccessMessagePatient;
