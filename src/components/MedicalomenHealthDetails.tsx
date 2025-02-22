import React, { useEffect, useState } from 'react';
import Header from './Header';
import './HomePage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header1 from './Header1';
import config from '../config'; 


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
  const [selectedHistory, setSelectedHistory] = useState<string>('');
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
  const handleSubmit = async (event: React.FormEvent ,navigateTo: string) => {
    event.preventDefault();
    const patientId = localStorage.getItem('patientId');
    const payload = {
      abnormalBleedingVaginum: selectedBleedingIssues,
      ageAtFirstChild: parseInt(ageAtFirstChild) || 0,
      ageAtLastChild: parseInt(ageAtLastChild) || 0,
      ageAtMarriage: parseInt(ageAtMarriage) || 0,
      ageAtMenarche: parseInt(ageAtMenarche) || 0,
      allergy,
      bloodPressure,
      candidateId: patientId, // Replace with the actual candidate ID
      cervicalBreastScrening: selectedToggle2 === 'yes',
      currentlyPregant: selectedToggle1 === 'yes',
      height: parseInt(height) || 0,
      historyOfSurgery: selectedToggle === 'yes',
     
      medicalhistory: selectedHistory,
      methodOfContraceptionUsed: selectedContraception,
      noOfBreastFedMonths: selectedBreastFedMonths,
      otherComplaints,
      pulseRate,
      spo2: parseInt(spo2) || 0,
      totalPregnancies: parseInt(totalPregnancies) || 0,
      weight: parseInt(weight) || 0,//double
      whenWasLastMentrution: selectedLastMenstruation
    };
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${config.appURL}/curable/createMedicalHistory`,
        payload,{
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Response:', response.data);
      navigate(navigateTo);
      //navigate('/FamilyPersonalDetails');
     
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Failed to submit data.');
    }
  };

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
          setSelectedHistory(data.medicalhistory);
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

  const participant = localStorage.getItem('participant');
  const gender=participant?.split('/')[1];
  const registraionId = localStorage.getItem('registraionId');
  return (
    <div className="container2">
       <Header1 />
       <h1 style={{ color: 'darkblue', fontWeight: 'bold', }}>Medical Details</h1>

      <div className="participant-container">
        <p>Participant: {participant}</p>
        <p>ID: {registraionId}</p>
      </div>

      <form className="clinic-form" onSubmit={(e) => handleSubmit(e, '/FamilyPersonalDetails')}>
        {/* Medical Details Section */}
        <fieldset>
          {/* <legend>Medical Details</legend> */}
          <label>Medical History:</label>
          <select value={selectedHistory} onChange={(e) => setSelectedHistory(e.target.value)}>
            <option value="">Select Medical History</option>
            <option value="History1">Nil</option>
            <option value="History2">Diabetes</option>
            <option value="History3">Hypertension</option>
            <option value="History4">Asthma</option>
            <option value="History5">Tuberculosis</option>
            <option value="History6">Stroke/Myocardial Infarction</option>
            <option value="History7">Settled Thyroid</option>
            <option value="History8">Cancer</option>
            <option value="History9">Epilepsy</option>
            <option value="History10">Others</option>
          </select>

          <div className="form-group">
  <label>Blood Pressure:</label>
  <input
    type="number"
    placeholder="Enter Blood Pressure"
    value={bloodPressure}
    onChange={(e) => {
      // Allow only numeric input, or you can extend the logic to allow special characters like '/' or '-'
      const value = e.target.value.replace(/[^0-9-]/g, '');
      setBloodPressure(value);
    }}
  />

  <label>Pulse Rate:</label>
  <input
    type="number"
    placeholder="Enter Pulse Rate"
    value={pulseRate}
    onChange={(e) => {
      // Allow only numeric input
      const value = e.target.value.replace(/[^0-9]/g, '');
      setPulseRate(value);
    }}
  />

  <label>Weight (Kgs):</label>
  <input
    type="number"
    placeholder="Enter Weight (Kgs)"
    value={weight}
    onChange={(e) => {
      // Allow only numeric input for weight
      const value = e.target.value.replace(/[^0-9.]/g, ''); // Allow numbers and decimal points
      setWeight(value);
    }}
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
      // Allow only numeric input for height
      const value = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
      setHeight(value);
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

        {/* Women's Health Section */}
        {(gender === 'FEMALE' || gender === 'OTHER') && (<fieldset>
          <legend>Women's Health</legend>
          <label>Age at Menarche:</label>
          <input
            type="text"
            placeholder="Enter Age of Menarche"
            value={ageAtMenarche}
            onChange={(e) => setAgeAtMenarche(e.target.value)}
          />

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

          <label>Abnormal Bleeding/Vaginal Issues:</label>
          <select
            value={selectedBleedingIssues}
            onChange={(e) => setSelectedBleedingIssues(e.target.value)}
          >
            <option value="">Select</option>
            <option value="Issue1">None</option>
            <option value="Issue2">Post Menoposal Bleeding</option>
            <option value="Issue3">Post Coital Bleeding</option>
            <option value="Issue4">Inter Menstrual Bleeding</option>
            <option value="Issue4">DUB</option>
            <option value="Issue5">Others</option>
          </select>

          <label>Age at Marriage:</label>
          <input
            type="number"
            placeholder="Enter Age at Marriage"
            value={ageAtMarriage}
            onChange={(e) => setAgeAtMarriage(e.target.value)}
          />

          <label>Total Pregnancies:</label>
          <input
            type="number"
            placeholder="Enter Total Pregnancies"
            value={totalPregnancies}
            onChange={(e) => setTotalPregnancies(e.target.value)}
          />

<div className="form-group">
  <label>Age at First Child:</label>
  <input
    type="number"
    placeholder="Enter Age at First Child"
    value={ageAtFirstChild}
    onChange={(e) => {
      // Allow only numeric input for age
      const value = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
      setAgeAtFirstChild(value);
    }}
  />
</div>

<div className="form-group">
  <label>Age at Last Child:</label>
  <input
    type="number"
    placeholder="Enter Age of Last Child"
    value={ageAtLastChild}
    onChange={(e) => {
      // Allow only numeric input for age
      const value = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
      setAgeAtLastChild(value);
    }}
  />
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
            <option value="Contraception3">Pil</option>
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
       
      </form>
      <footer className="footer-container">
        <div className="footer-content">
          <p className="footer-text">Powered By Curable</p>
          <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="footer-logo" />
        </div>
      </footer>
    </div>
  );
};

export default MedicalomenHealthDetails;
