import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SuccessMessage.css';

const SuccessMessageClinicalFInal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [registraionId, setRegistraionId] = useState<string | null>(null);
  const { clickId } = location.state || {};
  const searchNameFromBox = location.state?.searchNameFromBox || "";
  const searchflow = location.state?.searchflow || false;

   useEffect(() => {
  const regId = localStorage.getItem('registrationId');
  console.log(regId,"regId")
        if (regId) {
          setRegistraionId(regId);
        }
      }, []);

  return (
    <div className={searchflow ? 'screening-success-page' : 'container5'}>
          {searchflow ? (
    <main className="screening-success-card">
      <div className="screening-success-icon">✓</div>

      <h1>Clinical Evaluation has been Completed successfully!</h1>

      <p>
        Patient: {searchNameFromBox} (ID: {registraionId})
      </p>

      <div className="screening-success-actions">
        <button
          className="screening-next-btn"
          onClick={() =>
            navigate('/ClinicSearchPage', {
              state: { searchNameFromBox, searchflow },
            })
          }
        >
          Go to Breast Screening for {searchNameFromBox}
        </button>

        <button
          className="screening-home-btn"
          onClick={() => navigate('/responsive-cancer-institute')}
        >
          Go to Home
        </button>
      </div>
    </main>
  ) :(<main className="content">
        <img src='./Curable Icons/PNG/Group 261.png' alt="Success Icon" className="icon" /><br/>
        <h1>Clinical Evaluation has been Completed successfully!</h1>
        
        <button className="primary-button" onClick={() => navigate('/ClinicSearchPage')}>
          Begin Clinical Evaluation
        </button>
        <button className="secondary-button" onClick={() => navigate('/responsive-cancer-institute')}>
          Back To Home
        </button>
      </main>)}
    </div>
  );
};

export default SuccessMessageClinicalFInal;
