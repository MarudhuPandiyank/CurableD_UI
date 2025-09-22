import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SuccessMessage.css';

const SuccessMessageScreeningFInal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clickId } = location.state || {};
    const [registraionId, setRegistraionId] = useState<string | null>(null);

     useEffect(() => {
  const regId = localStorage.getItem('registrationId');
  console.log(regId,"regId")
        if (regId) {
          setRegistraionId(regId);
        }
      }, []);
  
  return (
    <div className='container5'>
      <main className="content">
        <img src='./Curable Icons/PNG/Group 261.png' alt="Success Icon" className="icon" /><br/>
        <h1>Screening has been Completed successfully!</h1>

        {registraionId && (
          <p className="reg-id-text">Registration ID: <strong>{registraionId}</strong></p>
        )}
        
        <button className="primary-button" onClick={() => navigate('/PatientSearchPage')}>
          Begin Screening
        </button>
        <button className="secondary-button" onClick={() => navigate('/responsive-cancer-institute')}>
          Back To Home
        </button>
      </main>
    </div>
  );
};

export default SuccessMessageScreeningFInal;
