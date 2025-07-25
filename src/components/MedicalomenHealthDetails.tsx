import React, { useEffect, useState } from 'react';
import Header from './Header';
import './HomePage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header1 from './Header1';
import config from '../config'; 
import Select from 'react-select';



interface PrefillApiResponse {
  id: number;
  candidateId: number;
  medicalhistory: string;
  bloodPressure: string;
  pulseRate: string;
  weight: number;
  historyOfSurgery: boolean;
  height: number;
  spo2: number;
  allergy: string;
  otherComplaints: string;
  ageAtMenarche: number;
  whenWasLastMentrution: string;
  abnormalBleedingVaginum: string;
  ageAtMarriage: number;
  totalPregnancies: number;
  ageAtFirstChild: number;
  ageAtLastChild: number;
  currentlyPregant: boolean;
  methodOfContraceptionUsed: string;
  noOfBreastFedMonths: string;
  cervicalBreastScrening: boolean;
}
const MedicalomenHealthDetails: React.FC = () => {
  const [selectedHistory, setSelectedHistory] = useState<string[]>([]);
  const [bloodPressure, setBloodPressure] = useState<string>('');
  const [pulseRate, setPulseRate] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [selectedToggle, setSelectedToggle] = useState<string | null>(null);
  const [height, setHeight] = useState<string>('');
  const [spo2, setSpo2] = useState<string>('');
  const [allergy, setAllergy] = useState<string>('');
  const [otherComplaints, setOtherComplaints] = useState<string>('');
  const [ageAtMenarche, setAgeAtMenarche] = useState<string>('');
  const [selectedLastMenstruation, setSelectedLastMenstruation] = useState<string>('');
  const [selectedBleedingIssues, setSelectedBleedingIssues] = useState<string>('');
  const [ageAtMarriage, setAgeAtMarriage] = useState<string>('');
  const [totalPregnancies, setTotalPregnancies] = useState<string>('');
  const [ageAtFirstChild, setAgeAtFirstChild] = useState<string>('');
  const [ageAtLastChild, setAgeAtLastChild] = useState<string>('');
  const [selectedToggle1, setSelectedToggle1] = useState<string | null>(null);
  const [selectedContraception, setSelectedContraception] = useState<string>('');
  const [selectedBreastFedMonths, setSelectedBreastFedMonths] = useState<string>('');
  const [selectedToggle2, setSelectedToggle2] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMenarche, setErrorMenarche] = useState('');
const [errorFirstChild, setErrorFirstChild] = useState('');
const [errorLastChild, setErrorLastChild] = useState('');
 const [errorMarriage, setErrorMarriage] = useState('');
 const [errorTotalPregnancies, setErrorTotalPregnancies] = useState('');



  const medicalHistoryOptions = [
    { value: 'History1', label: 'Nil' },
    { value: 'History2', label: 'Diabetes' },
    { value: 'History3', label: 'Hypertension' },
    { value: 'History4', label: 'Asthma' },
    { value: 'History5', label: 'Tuberculosis' },
    { value: 'History6', label: 'Stroke/Myocardial Infarction' },
    { value: 'History7', label: 'Settled Thyroid' },
    { value: 'History8', label: 'Cancer' },
    { value: 'History9', label: 'Epilepsy' },
    { value: 'History10', label: 'Others' }
  ];
  
const navigate = useNavigate();
  const toggleOption = (option: string) => {
    setSelectedToggle(option);
  };
  const toggleOption1 = (option: string) => {
    setSelectedToggle1(option);
  };
  const toggleOption2 = (option: string) => {
    setSelectedToggle2(option);
  };
  // Function to open modal
  const openModal = () => {
    setShowModal(true);
  };
  const handlePrevClick = () => {
    navigate('/ParticipantDetails');
  };
  // Function to close modal
  const closeModal = () => {
    setShowModal(false);
  };
const handleSubmit = async (event: React.FormEvent, navigateTo: string) => {
  event.preventDefault();
  const patientId = localStorage.getItem('patientId');
  let hasError = false;

  // Age value from localStorage
  const age = parseInt(localStorage.getItem('participantage') || '0', 10);

  // Age at Menarche
  if (ageAtMenarche && parseInt(ageAtMenarche) > age) {
    setErrorMenarche("Age at Menarche cannot be greater than participant's age.");
    hasError = true;
  } else {
    setErrorMenarche('');
  }

  // Age at Marriage
  if (ageAtMarriage && parseInt(ageAtMarriage) > age) {
    setErrorMarriage("Age at Marriage must be less than participant's age");
    hasError = true;
  } else {
    setErrorMarriage('');
  }

  const totalPreg = parseInt(totalPregnancies || '0');
  // if (totalPreg > age) {
  //   setErrorTotalPregnancies("Total Pregnancies cannot exceed participant's age");
  //   hasError = true;
  // } else {
  //   setErrorTotalPregnancies('');
  // }

  // Combined validation for First/Last Child if Pregnancies > 0
  if (totalPreg > 1) {
    const first = parseInt(ageAtFirstChild || '0');
    if (!ageAtFirstChild || first === 0) {
      setErrorFirstChild("Age at First Child is required for pregnancies");
      hasError = true;
    } 
    // else if (first > age) {
    //   setErrorFirstChild("Age at First Child cannot be greater than participant's age");
    //   hasError = true;
    // } 
    
     else if (first > totalPreg) {
            setErrorFirstChild("Age at First Child cannot be greater than Total Pregnancies");
          }
    else {
      setErrorFirstChild('');
    }

    const last = parseInt(ageAtLastChild || '0');
    if (!ageAtLastChild || last === 0) {
      setErrorLastChild("Age at Last Child is required for pregnancies");
      hasError = true;
    } 
    // else if (last > age) {
    //   setErrorLastChild("Age at Last Child must be less than participant's age");
    //   hasError = true;
    // } 
    else if (last < first) {
     setErrorLastChild('Age at Last Child must be Greater than  First Child');
           hasError = true;

      } 
    
    else {
      setErrorLastChild('');
    }
  } else {
    setErrorFirstChild('');
    setErrorLastChild('');
  }

  if (hasError) {
    alert("Please correct validation errors before proceeding.");
    return;
  }

  const payload = {
    abnormalBleedingVaginum: selectedBleedingIssues,
    ageAtFirstChild: parseInt(ageAtFirstChild) || 0,
    ageAtLastChild: parseInt(ageAtLastChild) || 0,
    ageAtMarriage: parseInt(ageAtMarriage) || 0,
    ageAtMenarche: parseInt(ageAtMenarche) || 0,
    allergy,
    bloodPressure,
    candidateId: patientId,
    cervicalBreastScrening: selectedToggle2 === 'yes',
    currentlyPregant: selectedToggle1 === 'yes',
    height: parseInt(height) || 0,
    historyOfSurgery: selectedToggle === 'yes',
    medicalhistory: selectedHistory.join(','),
    methodOfContraceptionUsed: selectedContraception,
    noOfBreastFedMonths: selectedBreastFedMonths,
    otherComplaints,
    pulseRate,
    spo2: parseInt(spo2) || 0,
    totalPregnancies: totalPreg,
    weight: parseInt(weight) || 0,
    whenWasLastMentrution: selectedLastMenstruation
  };

  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${config.appURL}/curable/createMedicalHistory`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log('Response:', response.data);
    navigate(navigateTo);
  } catch (error) {
    console.error('Error submitting data:', error);
    alert('Failed to submit data.');
  }
};



  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  

  useEffect(() => {
    const fetchPrefillData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Token is missing. Please log in again.');
          return;
        }

        const prefillResponse = await axios.post<PrefillApiResponse>(`${config.appURL}/curable/candidatehistoryForPrefil`, {
          candidateId: localStorage.getItem('patientId'),
          type: 3
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (prefillResponse.data) {
          const data = prefillResponse.data;
         // setSelectedHistory(data.medicalhistory);
         console.log(data,"ksdkds")
         if (Array.isArray(data.medicalhistory)) {
          setSelectedHistory(data.medicalhistory);
        } else if (typeof data.medicalhistory === 'string') {
          setSelectedHistory(data.medicalhistory ? data.medicalhistory.split(',') : []);
        } else {
          setSelectedHistory([]);
        }
          setBloodPressure(data.bloodPressure);
          setPulseRate(data.pulseRate);
          setWeight(data.weight.toString());
          setSelectedToggle(data.historyOfSurgery ? 'yes' : 'no');
          setHeight(data.height.toString());
          setSpo2(data.spo2.toString());
          setAllergy(data.allergy);
          setOtherComplaints(data.otherComplaints);
          setAgeAtMenarche(data.ageAtMenarche.toString());
          setSelectedLastMenstruation(data.whenWasLastMentrution);
          setSelectedBleedingIssues(data.abnormalBleedingVaginum);
          setAgeAtMarriage(data.ageAtMarriage.toString());
          setTotalPregnancies(data.totalPregnancies.toString());
          setAgeAtFirstChild(data.ageAtFirstChild.toString());
          setAgeAtLastChild(data.ageAtLastChild.toString());
          setSelectedToggle1(data.currentlyPregant ? 'yes' : 'no');
          setSelectedContraception(data.methodOfContraceptionUsed);
          setSelectedBreastFedMonths(data.noOfBreastFedMonths);
          setSelectedToggle2(data.cervicalBreastScrening ? 'yes' : 'no');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrefillData();
  }, []);

  const participant = localStorage.getItem('participant')|| '';
  console.log(participant,"skkksa")

  const gender=participant?.split('/')[1];
   const ageString = participant.split(' ')[1]?.split('/')[0] || '0';
   const setages=localStorage.getItem('participantage')|| '';
const age = parseInt(setages, 10);

console.log(age,participant,ageString,"skkksa")

  const registraionId = localStorage.getItem('registraionId');
  return (
    <div className="container2">
       <Header1 />
      

      <div className="participant-container">
        <p className="participant-info-text"><strong>Participant: </strong> {participant}</p>
      <p className="participant-info-text"><strong>ID:</strong> {registraionId}</p>
            </div>
      <h1 style={{ color: 'darkblue', fontWeight: 'bold', }}>Medical Details</h1>
      <form className="clinic-form" onSubmit={(e) => handleSubmit(e, '/FamilyPersonalDetails')}>
        {/* Medical Details Section */}
        <fieldset>
          {/* <legend>Medical Details</legend> */}
          <label>Medical History:</label>
          <Select
        isMulti
        options={medicalHistoryOptions}
        value={medicalHistoryOptions.filter(option => selectedHistory.includes(option.value))}
        onChange={(selectedOptions) => {
          const values = selectedOptions.map((opt) => opt.value);
          setSelectedHistory(values);
        }}
        placeholder="Select Medical History"
      />

          <div className="form-group">
  <label>Blood Pressure:</label>
 <input
  type="text"
  inputMode="numeric" 
  placeholder="Enter Blood Pressure"
  value={bloodPressure}
  onChange={(e) => {
    // Allow only numbers, slash (/), and dash (-)
    const value = e.target.value.replace(/[^0-9/-]/g, '');
    setBloodPressure(value);
  }}
/>


  <label>Pulse Rate:</label>
  <input
  type="text"
  inputMode="numeric" 
  placeholder="Enter Pulse Rate"
  value={pulseRate}
  onChange={(e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Allow only digits
    setPulseRate(value);
  }}
  maxLength={3} // Optional: restrict to 3 digits like 120
/>


  <label>Weight (Kgs):</label>
 <input
  type="text"
  inputMode="decimal" 
  placeholder="Enter Weight (Kgs)"
  value={weight}
 onChange={(e) => {
    let value = e.target.value;

    if (/^\d*\.?\d{0,2}$/.test(value)) {
      const numericValue = parseFloat(value);
      if (!value || isNaN(numericValue) || numericValue <= 1000) {
        setWeight(value);
      }
    }
  }}
  maxLength={6} 
/>

</div>


          <label>Previous History of Surgery:</label>
          <div className="toggle-group">
            <button
              type="button"
               className={`gender-btn ${selectedToggle === 'yes' ? 'yes-active' : ''}`}
              onClick={() => toggleOption('yes')}
            >
              Yes
            </button>
            <button
              type="button"
               className={`gender-btn ${selectedToggle === 'no' ? 'no-active' : ''}`}
              onClick={() => toggleOption('no')}
            >
              No
            </button>
          </div>

          <div className="form-group">
  <label>Height (cms):</label>
  <input
  type="number"
  placeholder="Enter Height (cms)"
  value={height}
  onChange={(e) => {
    const value = e.target.value;

    const numericValue = parseInt(value, 10);

    if (!value || (Number.isInteger(numericValue) && numericValue >= 1 && numericValue <= 300)) {
      setHeight(value);
    }
  }}
/>

  
</div>

          <label>SpO2:</label>
          <input
            type="text"
            placeholder="Enter SpO2"
            value={spo2}
            onChange={(e) => setSpo2(e.target.value)}
          />

          <label>Allergy:</label>
          <input
            type="text"
            placeholder="Enter Allergy"
            value={allergy}
            onChange={(e) => setAllergy(e.target.value)}
          />

          <label>Other Complaints:</label>
          <input
            type="text"
            placeholder="Enter Other Complaints"
            value={otherComplaints}
            onChange={(e) => setOtherComplaints(e.target.value)}
          />
        </fieldset>
<br/>
        {/* Women's Health Section */}
        {(gender === 'FEMALE' || gender === 'OTHER') && (<fieldset>
          <h1 style={{ color: 'darkblue', fontWeight: 'bold', }}>Women's Health</h1>
          <label>Age at Menarche:</label>
        <input
  type="text"
  inputMode="numeric"
  placeholder="Enter Age at Menarche"
  value={ageAtMenarche}
  onChange={(e) => {
    const val = e.target.value;
    const num = parseInt(val || '0');
    if (/^(|[1-9][0-9]?)$/.test(val)) {
      setAgeAtMenarche(val);
      setErrorMenarche(num > age ? "Age at Menarche cannot be greater than participant's age." : '');
    }
  }}
/>
{errorMenarche && <span className="error-message">{errorMenarche}</span>}


          <label>When was Last Menstruation:</label>
          <select
            value={selectedLastMenstruation}
            onChange={(e) => setSelectedLastMenstruation(e.target.value)}
          >
            <option value="">Select</option>
            <option value="LastMenstruation1">Less than 12 months ago</option>
            <option value="LastMenstruation2">More than 12 months ago</option>
            <option value="LastMenstruation3">Surgical menopause</option>
          </select>

          <label>Abnormal Bleeding Per Vaginum:</label>
          <select
            value={selectedBleedingIssues}
            onChange={(e) => setSelectedBleedingIssues(e.target.value)}
          >
            <option value="">Select</option>
            <option value="Issue1">None</option>
            <option value="Issue2">Post Menoposal Bleeding</option>
            <option value="Issue3">Post Coital Bleeding</option>
            <option value="Issue4">Inter Menstrual Bleeding</option>
            <option value="Issue5">DUB</option>
            <option value="Issue6">Others</option>
          </select>

          <label>Age at Marriage:</label>
        <input
        type="text"
        inputMode="numeric"
        placeholder="Enter Age at Marriage"
        value={ageAtMarriage}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, '');
          if (val.length <= 2) {
            setAgeAtMarriage(val);
            const ageVal = parseInt(val || '0');
            if (ageVal > age) {
              setErrorMarriage('Age at Marriage must be less than participant age');
            } else {
              setErrorMarriage('');
            }
          }
        }}
        maxLength={2}
      />
      {errorMarriage && <span className="error-message">{errorMarriage}</span>}


      <label>Total Pregnancies:</label>
<input
  type="text"
  inputMode="numeric"
  value={totalPregnancies}
  onChange={(e) => {
    const val = e.target.value;
    if (/^(|0|[1-9][0-9]*)$/.test(val)) {
      setTotalPregnancies(val);
      const num = parseInt(val || '0');
      // if (num > age) {
      //   setErrorTotalPregnancies("Total Pregnancies cannot exceed participant's age");
      // } else {
      //   setErrorTotalPregnancies('');
      // }
    }
  }}
/>
{errorTotalPregnancies && <span className="error-message">{errorTotalPregnancies}</span>}


<div className="form-group">
  <label>Age at First Child:</label>
    <input
        type="text"
        inputMode="numeric"
        placeholder="Enter Age at First Child"
        value={ageAtFirstChild}
        maxLength={2}
        onChange={(e) => {
          const value = e.target.value.replace(/[^0-9]/g, '');
          setAgeAtFirstChild(value);
          const ageVal = parseInt(value || '0');
          const marriage = parseInt(ageAtMarriage || '0');
            const totalPregval = parseInt(totalPregnancies || '0');

          // if (ageVal > age ) {
          //   setErrorFirstChild("Age at First Child cannot be greater than participant's age");
          // } 
           if (ageVal > totalPregval) {
            setErrorFirstChild("Age at First Child cannot be greater than Total Pregnancies");
          } 
          else {
            setErrorFirstChild('');
          }
        }}
      />
      {errorFirstChild && <span className="error-message">{errorFirstChild}</span>}

</div>

<div className="form-group">
  <label>Age at Last Child:</label>
<input
        type="text"
        inputMode="numeric"
        placeholder="Enter Age of Last Child"
        value={ageAtLastChild}
        maxLength={2}
disabled={parseInt(totalPregnancies) === 0 || parseInt(totalPregnancies) === 1}
        onChange={(e) => {
          const value = e.target.value.replace(/[^0-9]/g, '');
          setAgeAtLastChild(value);
          const lastAge = parseInt(value || '0');
          const firstAge = parseInt(ageAtFirstChild || '0');
          //  if (lastAge > age) {
          //   setErrorLastChild('Age at Last Child must be less than participant age');
          // } 
            if (lastAge < firstAge) {
            setErrorLastChild('Age at Last Child must be Greater than  First Child');
          } 
          
          else {
            setErrorLastChild('');
          }
        }}
      />
{errorLastChild && <span className="error-message">{errorLastChild}</span>}

</div>

          <label>Are You Currently Pregnant?</label>
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-btn ${selectedToggle1 === 'yes' ? 'yes-active' : ''}`}
              onClick={() => toggleOption1('yes')}
            >
              Yes
            </button>
            <button
              type="button"
              className={`toggle-btn ${selectedToggle1 === 'no' ? 'no-active' : ''}`}
              onClick={() => toggleOption1('no')}
            >
              No
            </button>
          </div>

          <label>Method of Contraception Used:</label>
          <select
            value={selectedContraception} 
            onChange={(e) => setSelectedContraception(e.target.value)}
          >
            <option value="">Select</option>
                        <option value="Contraception1">Nil</option>
                        <option value="Contraception2">Condom</option>
                        <option value="Contraception3">Pill</option>
                        <option value="Contraception6">Icud</option>
                        <option value="Contraception4">Tubectomy</option>
                        <option value="Contraception5">Others</option>
          </select>

          <label>Breast Fed (How Many Months?):</label>
          <select
            value={selectedBreastFedMonths}
            onChange={(e) => setSelectedBreastFedMonths(e.target.value)}
          >
            <option value="">Select</option>
            <option value="Month1">Nil</option>
            <option value="Month2">&lt; 6 Months</option>
            <option value="Month3">6-12 Months</option>
            <option value="Month4">&gt; 12 Months</option>
            <option value="Month5">Others</option>
          </select>

          <label>Have You Ever Undergone Breast/Cervix Screening?</label>
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-btn ${selectedToggle2 === 'yes' ? 'yes-active' : ''}`}
              onClick={() => toggleOption2('yes')}
            >
              Yes
            </button>
            <button
              type="button"
              className={`toggle-btn ${selectedToggle2 === 'no' ? 'no-active' : ''}`}
              onClick={() => toggleOption2('no')}
            >
              No
            </button>
          </div>
        </fieldset>)}
        
        {showModal && (
          <div className="custom-modal">
    <div className="custom-modal-content">
                <h1 style={{ marginTop: '130px', textAlign: 'center', color: 'darkblue' }}>Non mandatory fields are not provided Are you sure you want to finish registration?</h1>
                

                <div className="form-group">
               
  </div>

                <div className="modal-buttons">
                  <button className="Finish-button"
                    type="button"
                    onClick={(e) => handleSubmit(e, '/SuccessMessagePRFinal')}
                  >
                    Yes
                  </button>
                  <button className="Next-button"
                    type="button"
                    onClick={closeModal}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
        <div className="buttons">
        <button type="button" className="Finish-button" onClick={handlePrevClick} >Prev</button>

          <button type="button" className="Next-button" onClick={openModal}>
            Finish
          </button>
          <button type="submit" className="Finish-button">
            Next
          </button>
          </div>
          <br/> <br/>

       
      </form>
      <footer className="footer-container-fixed">
        <div className="footer-content">
          <p className="footer-text">Powered By</p>
          <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="footer-logo" />
        </div>
      </footer>
    </div>
  );
};

export default MedicalomenHealthDetails;
