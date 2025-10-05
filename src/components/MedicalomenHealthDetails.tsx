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
  undergoneCervicalBreastScrening: string;
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
      const [selectedBreastCrevixMonths, setSelectedBreastCrevixMonths] = useState<string>('');
  const [selectedToggle2, setSelectedToggle2] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
const [id, setId] = useState<number | null | undefined>(null);

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
const first = parseInt(ageAtFirstChild || '0');
const last = parseInt(ageAtLastChild || '0');

// Enforce reset when pregnancy changes
if (totalPreg === 0) {
  if (first || last) {
    setErrorFirstChild("Age at First Child must be empty when pregnancies are 0");
    setErrorLastChild("Age at Last Child must be empty when pregnancies are 0");
    hasError = true;
  } else {
    setErrorFirstChild('');
    setErrorLastChild('');
  }
} else if (totalPreg === 1) {
  if (!first) {
    setErrorFirstChild("Age at First Child is required");
    hasError = true;
  } else if (first >= age) {
    setErrorFirstChild("Age at First Child must be less than participant's age");
    hasError = true;
  } else {
    setErrorFirstChild('');
  }

  if (last) {
    setErrorLastChild("Age at Last Child should not be filled when pregnancies are 1");
    hasError = true;
  } else {
    setErrorLastChild('');
  }
} else {
  if (!first) {
    setErrorFirstChild("Age at First Child is required");
    hasError = true;
  } else if (first >= age) {
    setErrorFirstChild("Age at First Child must be less than participant's age");
    hasError = true;
  } else {
    setErrorFirstChild('');
  }

  if (!last) {
    setErrorLastChild("Age at Last Child is required");
    hasError = true;
  } else if (last >= age) {
    setErrorLastChild("Age at Last Child must be less than participant's age and greater than Age at First Child");
    hasError = true;
  } else if (last <= first) {
    setErrorLastChild("Age at Last Child must be greater than Age at First Child");
    hasError = true;
  } else {
    setErrorLastChild('');
  }
}
  if (hasError) {
    alert("Please correct validation errors before proceeding.");
    return;
  }

  console.log(selectedContraception,selectedHistory,"selectedHistory")

const payload = {
  id,
  abnormalBleedingVaginum: selectedBleedingIssues,
  ageAtFirstChild: ageAtFirstChild ? parseInt(ageAtFirstChild) : null,
  ageAtLastChild: ageAtLastChild ? parseInt(ageAtLastChild) : null,
  ageAtMarriage: ageAtMarriage ? parseInt(ageAtMarriage) : null,
  ageAtMenarche: ageAtMenarche ? parseInt(ageAtMenarche) : null,
  allergy,
  bloodPressure,
  candidateId: patientId,
  undergoneCervicalBreastScrening: selectedBreastCrevixMonths,
  currentlyPregant: selectedToggle1 === 'yes',
  height: height ? parseInt(height) : "",
  historyOfSurgery: selectedToggle === 'yes',
  medicalhistory: selectedHistory.join(','),
  methodOfContraceptionUsed: selectedContraception,
  noOfBreastFedMonths: selectedBreastFedMonths,
  otherComplaints,
  pulseRate,
  spo2: spo2 ? parseInt(spo2) : null,
  totalPregnancies:totalPreg ? totalPreg : null,
  weight: weight ? parseInt(weight) :null,
  whenWasLastMentrution: selectedLastMenstruation,
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
  const pregCount = parseInt(totalPregnancies || '0');

  if (pregCount === 0) {
    setAgeAtFirstChild('');
    setAgeAtLastChild('');
  } else if (pregCount === 1) {
    setAgeAtLastChild(''); // only last child needs clearing
  }
}, [totalPregnancies]);

  

  useEffect(() => {
    const fetchPrefillData = async () => {
      const touchedspo2 = localStorage.getItem("touchedspo2")==="true"?true:false;
      const agevalue = localStorage.getItem("agevalue")==="true"?true:false;
            const ageatmarriage = localStorage.getItem("ageatmarriage")==="true"?true:false;
      const totalpreg = localStorage.getItem("totalpreg")==="true"?true:false;
      console.log(touchedspo2,"totalpreg")
      const firstchild = localStorage.getItem("firstchild")==="true"?true:false;
      const latschild = localStorage.getItem("latschild")==="true"?true:false;

      const weightval= localStorage.getItem("weightval")==="true"?true:false;
            const heightval= localStorage.getItem("heightval")==="true"?true:false;




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
setWeight(weightval?data.weight?.toString():data.weight === 0 ? '' : (data.weight?.toString() || ''));
          setSelectedToggle(data.historyOfSurgery ? 'yes' : 'no');
setHeight(heightval?data.height?.toString()
  :data.height === 0 ? '' : (data.height?.toString() || ''));
          setSpo2(touchedspo2?data.spo2.toString():data.spo2 === 0 ? '' : (data.spo2?.toString() || ''));
          setAllergy(data.allergy);
          setOtherComplaints(data.otherComplaints);
          setId(data.id);
setAgeAtMenarche(agevalue?data.ageAtMenarche.toString():
  data.ageAtMenarche && data.ageAtMenarche !== 0
    ? data.ageAtMenarche.toString()
    : ""
);
          setSelectedLastMenstruation(data.whenWasLastMentrution);
          setSelectedBleedingIssues(data.abnormalBleedingVaginum);
setAgeAtMarriage(ageatmarriage?data.ageAtMarriage.toString():
  data.ageAtMarriage && data.ageAtMarriage !== 0
    ? data.ageAtMarriage.toString()
    : ""
);
setTotalPregnancies(totalpreg?data.totalPregnancies.toString():
  data.totalPregnancies && data.totalPregnancies !== 0
    ? data.totalPregnancies.toString()
    : ""
);
          setAgeAtFirstChild(firstchild?
            data.ageAtFirstChild.toString(): data.ageAtFirstChild && data.ageAtFirstChild !== 0
    ? data.ageAtFirstChild.toString()
    : "");
          setAgeAtLastChild(latschild?data.ageAtLastChild.toString():
        data.ageAtLastChild && data.ageAtLastChild !== 0
    ? data.ageAtLastChild.toString()
    : "");
          setSelectedToggle1(data.currentlyPregant ? 'yes' : 'no');
          setSelectedContraception(data.methodOfContraceptionUsed);
          setSelectedBreastFedMonths(data.noOfBreastFedMonths);
          // setSelectedToggle2(data.cervicalBreastScrening ? 'yes' : 'no');
          setSelectedBreastCrevixMonths(data.undergoneCervicalBreastScrening);

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
  value={medicalHistoryOptions.filter(option => selectedHistory.includes(option.label))}
  onChange={(selectedOptions) => {
    const values = selectedOptions.map((opt) => opt.label); // use label instead of value
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
    if(e.target.value==="0"){
              localStorage.setItem("weightval", "true")
              }
              else{
              localStorage.setItem("weightval", "false")
  
              }

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
    if(e.target.value==="0"){
              localStorage.setItem("heightval", "true")
              }
              else{
              localStorage.setItem("heightval", "false")
  
              }
  }}
/>

  
</div>

          <label>SpO2:</label>
          <input
            type="text"
            placeholder="Enter SpO2"
            value={spo2}
            onChange={(e) =>
            {
               setSpo2(e.target.value)
               if(e.target.value==="0"){
              localStorage.setItem("touchedspo2", "true")
              }
              else{
              localStorage.setItem("touchedspo2", "false")
  
              }

            }
              }
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
    if(e.target.value==="0"){
              localStorage.setItem("agevalue", "true")
              }
              else{
              localStorage.setItem("agevalue", "false")
  
              }
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
            <option value="Less than 12 months ago">Less than 12 months ago</option>
            <option value="More than 12 months ago">More than 12 months ago</option>
            <option value="Surgical menopause">Surgical menopause</option>
          </select>

          <label>Abnormal Bleeding Per Vaginum:</label>
          <select
            value={selectedBleedingIssues}
            onChange={(e) => setSelectedBleedingIssues(e.target.value)}
          >
            <option value="">Select</option>
            <option value="None">None</option>
            <option value="Post Menoposal Bleeding">Post Menoposal Bleeding</option>
            <option value="Post Coital Bleeding">Post Coital Bleeding</option>
            <option value="Inter Menstrual Bleeding">Inter Menstrual Bleeding</option>
            <option value="DUB">DUB</option>
            <option value="Others">Others</option>
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
            if(e.target.value==="0"){
              localStorage.setItem("ageatmarriage", "true")
              }
              else{
              localStorage.setItem("ageatmarriage", "false")
  
              }
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
     if(e.target.value==="0"){
              localStorage.setItem("totalpreg", "true")
              }
              else{
              localStorage.setItem("totalpreg", "false")
  
              }
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
  disabled={parseInt(totalPregnancies || '0') === 0}
  onChange={(e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAgeAtFirstChild(value);

     if(e.target.value==="0"){
              localStorage.setItem("firstchild", "true")
              }
              else{
              localStorage.setItem("firstchild", "false")
  
              }
    const preg = parseInt(totalPregnancies || '0', 10);
    const v = value === '' ? NaN : parseInt(value, 10);

    if (value === '') {
      setErrorFirstChild('');
    } else if (preg === 0) {
      setErrorFirstChild("Age at First Child must be empty when pregnancies are 0");
    } else if (!Number.isNaN(v) && v >= age) {
      setErrorFirstChild("Age at First Child must be less than participant's age");
    } else {
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
  disabled={parseInt(totalPregnancies || '0') <= 1}
  onChange={(e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAgeAtLastChild(value);
    if(e.target.value==="0"){
              localStorage.setItem("latschild", "true")
              }
              else{
              localStorage.setItem("latschild", "false")
  
              }

    const preg = parseInt(totalPregnancies || '0', 10);
    const first = parseInt(ageAtFirstChild || '0', 10);
    const v = value === '' ? NaN : parseInt(value, 10);

    if (value === '') {
      setErrorLastChild('');
    } else if (preg <= 1) {
      setErrorLastChild("Age at Last Child should not be filled when pregnancies are 1");
    } else if (!Number.isNaN(v) && v >= age) {
      setErrorLastChild("Age at Last Child must be less than participant's age and greater than Age at First Child");
    } else if (!Number.isNaN(v) && !Number.isNaN(first) && v <= first) {
      setErrorLastChild("Age at Last Child must be greater than Age at First Child");
    } else {
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
                        <option value="Nil">Nil</option>
                        <option value="Condom">Condom</option>
                        <option value="Pill">Pill</option>
                        <option value="IUCD">IUCD</option>
                        <option value="Tubectomy">Tubectomy</option>
                        <option value="Others">Others</option>
          </select>

          <label>Breast Fed (How Many Months?):</label>
          <select
            value={selectedBreastFedMonths}
            onChange={(e) => setSelectedBreastFedMonths(e.target.value)}
          >
            <option value="">Select</option>
            <option value="Nil">Nil</option>
            <option value="< 6 Months">&lt; 6 Months</option>
            <option value="6-12 Months">6-12 Months</option>
            <option value="> 12 Months">&gt; 12 Months</option>
            <option value="Others">Others</option>
          </select>

          <label>Have You Ever Undergone Breast/Cervix Screening?</label>
          {/* <div className="toggle-group">
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
          </div> */}
            <select
            value={selectedBreastCrevixMonths}
            onChange={(e) => setSelectedBreastCrevixMonths(e.target.value)}
          >
            <option value="">Select</option>
            <option value="Yes, for Breast Screening only">Yes, for Breast Screening only</option>
            <option value="Yes, for Cervical Screening only">Yes, for Cervical Screening only</option>
            <option value="Yes, for Both Breast and Cervical Screening">Yes, for Both Breast and Cervical Screening</option>
            <option value="No, I have not undergone either">No, I have not undergone either</option>
          </select>
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
