import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SuccessMessage.css';

const SuccessMessagePRFinal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clickId, hideNextEnrollment } = location.state || {};

  const [registraionId, setRegistraionId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('registraionId');
    if (id) {
      setRegistraionId(id);
    }
  }, []);

  return (
    <div className='container5'>
      <main className="content">
        <img src='./Curable Icons/PNG/Group 261.png' alt="Success Icon" className="icon" />
        
        <h1>Registration has been Completed successfully!</h1>

        {registraionId && (
          <p className="reg-id-text">Registration ID: <strong>{registraionId}</strong></p>
        )}

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

export default SuccessMessagePRFinal;
