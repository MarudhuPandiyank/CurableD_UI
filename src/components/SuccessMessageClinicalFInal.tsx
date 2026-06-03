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
  const titleName = location.state?.titleName || "";

  
    const diseaseEligibilityDTO = location.state?.diseaseEligibilityDTO || null;
const nextStage = diseaseEligibilityDTO?.stage || 'Breast Screening';

const hasDiseaseDTO =
  diseaseEligibilityDTO &&
  Object.keys(diseaseEligibilityDTO).length > 0;

const diseaseTestIds= diseaseEligibilityDTO?.diseaseTestId || [];
const candidateTestId = diseaseEligibilityDTO?.candidateTestId || 'Breast Screening';


const handleNextScreening = () => {
  if (diseaseEligibilityDTO?.name === 'SCREENING') {
    navigate('/DiseaseSpecificDetailsScreening', {
      state: {
       searchName:searchNameFromBox,
        searchflow,
        diseaseEligibilityDTO,
        diseaseTestIds,
        candidateTestId,
        finalsearch: true, // Indicate this is coming from the final success screen
      },
    });
  } else if (diseaseEligibilityDTO?.name === 'CLINICAL') {
    navigate('/DynamicScreen', {
      state: {
        searchName:searchNameFromBox,
        searchflow,
        diseaseEligibilityDTO,
        diseaseTestIds,
        candidateTestId,
        finalsearch: true, // Indicate this is coming from the final success screen

      },
    });
  }
};


   useEffect(() => {
  const regId = localStorage.getItem('registrationId');
  console.log(regId,"regId")
        if (regId) {
          setRegistraionId(regId);
        }
      }, []);

    const displayNextStage = nextStage.replace(/\s*test\s*$/i, '');

  return (
    <div  className={ 'screening-success-page'}>
          {
          searchflow  && hasDiseaseDTO ? (
    <main className="content">
        <img src='./Curable Icons/PNG/Group 261.png' alt="Success Icon" className="icon" /><br/>

     <h1>{titleName} Completed Successfully!</h1>

      <p>
        Patient: {searchNameFromBox} (ID: {registraionId})
      </p>

      <div className="screening-success-actions">
         <button
  className="screening-next-btn"
  onClick={handleNextScreening}
>
  Go to {displayNextStage} for {searchNameFromBox}
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
