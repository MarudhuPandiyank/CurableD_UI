import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header1 from './Header1';
import './HomePage.css';
import './NewScreeningEnrollment.css';
import config from '../config';  // Import the config file
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'primereact/calendar';
import 'primereact/resources/themes/saga-blue/theme.css'; // Theme
import 'primereact/resources/primereact.min.css'; // Core CSS
import 'primeicons/primeicons.css'; // Icons
import './Common.css';

interface PrefillApiResponse {
  id: number;
  registraionId: string;
  campId: number;
  optionalId: any;
  name: string;
  gender: string;
  age: number;
  maritalStatus: any;
  spouseName: string;
  mobileNo: string;
  aadhar: string;
  address: string;
  email: any;
  tobaccoUser: boolean;
  parentCandidateId: any;
  surveyStatus: any;
  consentDate: any;
  consentSign: any;
  dob: string;
  streetId: number;
  fatherName: string;
  alternateMobileNo: string;
  occupation: string;
  monthlyIncome: number;
  houseType: string;
  voterId: string;
  education: string;
  rationCard: string;
  hospitalId: number;
  reason: any;
  eligibleDiseases: any;
  candidateHabitDTOs: any;
}

const NewScreeningEnrollment: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [gender, setGender] = useState<string>('');
  const [dob, setDob] = useState<Date | null>(null);
  const [address, setAddress] = useState('');
  const [streetId, setStreetId] = useState('');
  const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false); // State for Save button
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    const prefillData = async () => {
      const token = localStorage.getItem('token');
      const patientId = localStorage.getItem('patientId');

      if (!token || !patientId) {
        alert('Token or patient ID not found. Please log in again.');
        return;
      }

      try {
        const response = await axios.post<PrefillApiResponse>(
          `${config.appURL}/curable/candidatehistoryForPrefil`,
          { candidateId: patientId, type: 6 },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 200) {
          const data = response.data;
          setName(data.name);
          setMobile(data.mobileNo);
          setGender(data.gender);
          setDob(new Date(data.dob));
          setAddress(data.address);
          setStreetId(data.streetId.toString());
        }
      } catch (error) {
        console.error('Error fetching prefill data:', error);
        alert('Failed to fetch prefill data. Please try again.');
      }
    };

    prefillData();
  }, []);

  const handleGenderChange = (value: string) => setGender(value);

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (/^\d*$/.test(input)) setMobile(input); // Only numeric input
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAddress(e.target.value);
    setIsSaveButtonEnabled(e.target.value.trim() !== '' && streetId.trim() !== '');
  };

  const handleStreetIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStreetId(e.target.value);
    setIsSaveButtonEnabled(address.trim() !== '' && e.target.value.trim() !== '');
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const campId = localStorage.getItem('campId');

    if (!token) {
      alert('No token found. Please log in again.');
      return;
    }

    const payload = {
      address,
      campId: parseInt(campId || '0', 10), // Convert campId to number
      streetId: parseInt(streetId, 10) || 0, // Convert to number
      reason, // Include reason directly in the payload
    };

    try {
      const response = await axios.post(`${config.appURL}/curable/saveCandidate`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        navigate('/SuccessMessagePatient');
      }
    } catch (error) {
      console.error('Error saving candidate:', error);
      alert('Failed to save candidate. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const campId = localStorage.getItem('campId');
    const hospitalId = localStorage.getItem('hospitalId');

    if (!token) {
      alert('No token found. Please log in again.');
      return;
    }

    if (!hospitalId) {
      alert('No hospital ID found. Please ensure hospitalId is set in local storage.');
      return;
    }

    const payload = {
      name,
      mobileNo: mobile,
      gender: gender.toUpperCase(),
      dob: dob ? dob.toISOString().split('T')[0] : null,
      address,
      streetId: parseInt(streetId, 10) || 0,
      hospitalId: parseInt(hospitalId, 10),
      campId,
    };

    try {
      const response = await axios.post(`${config.appURL}/curable/candidate`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data as { id: number; name: string; registraionId: string; age: number; gender: string };

      if (response.status === 200) {
        localStorage.setItem('patientId', data.id.toString());
        localStorage.setItem('patientName', data.name);
        localStorage.setItem('registraionId', data.registraionId);
        const participantValue = `${data.name} ${data.age}/${data.gender}`;
        localStorage.setItem('participant', participantValue);
        navigate('/DiseaseSpecificDetails');
      }
    } catch (error) {
      console.error('Error during enrollment:', error);
      alert('Failed to enroll. Please try again.');
    }
  };

  const openModal = () => {
    if (!address.trim()) {
      alert('Address cannot be empty. Enter the address and click on Save');
      return; // Prevent the save action
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = e.target;

    setReason((prevReason) => {
      if (checked) {
        // Add the option to the reason if it's checked
        return prevReason ? `${prevReason}, ${value}` : value;
      } else {
        // Remove the option from the reason if it's unchecked
        return prevReason
          .split(', ')
          .filter((option) => option !== value)
          .join(', ');
      }
    });
  };

  return (
    <div>
      <div className="container2">
        <Header1 />
        <form className="clinic-details-form" onSubmit={handleSubmit}>
          <h1 className="new-screening-title">New Screening Enrollment</h1>

          <div className="form-group">
            <label style={{ color: 'black' }}>Name*:</label>
            <input
              type="text"
              placeholder="Enter Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
  <label style={{ color: 'black' }}>Mobile Number*:</label>
  <input
    type="number" // Use text to apply maxLength
    inputMode="numeric" // Numeric keyboard on mobile
    pattern="[0-9]*" // Ensure only numeric input
    placeholder="Enter Mobile Number"
    value={mobile}
    onChange={(e) => {
      const value = e.target.value.replace(/\D/g, ''); // Allow only numeric input
      if (value.length <= 10) {
        setMobile(value); // Update state only if length is <= 10
      }
    }}
    required
  />
</div>


          <div className="form-group">
            <label style={{ color: 'black' }}>Gender*:</label>
            <div className="gender-group">
              {['Male', 'Female', 'Other'].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`gender-btn ${gender === value ? 'active' : ''}`}
                  onClick={() => handleGenderChange(value)}
                >
                  {value}
                  
                </button>
                
              ))}
              
            </div>
          </div>
    
          <label>
  <label style={{ color: 'black' }}>Date of Birth*:</label>
  <span style={{ color: 'darkred', fontWeight: 'bold' }}></span>
  <div className="input-with-icon">
    <Calendar
      value={dob}
      onChange={(e) => setDob(e.value as Date | null)} // Update the dob state
      dateFormat="yy-mm-dd" // PrimeReact date format
      placeholder="yyyy-mm-dd"
      required
      maxDate={new Date()} // Set the minimum date to today
     
    />
    <img src="./assets/Calendar.png" className="clinic-id-icon" alt="calendar icon" />
  </div>
</label>

         
        

          <div className="form-group">
            <label style={{ color: 'black' }}>Address:</label>
            <textarea
              placeholder="Enter Address"
              value={address}
              onChange={handleAddressChange}
            />
          </div>

          <div className="form-group">
            <label style={{ color: 'black' }}>Street ID:</label>
            <input
              type="number"
              placeholder="Enter Street ID"
              value={streetId}
              onChange={handleStreetIdChange}
            />
          </div>
          {showModal && (
  <div className="custom-modal">
    <div className="custom-modal-content">
      <h2 className="custom-modal-title">How would you like to tag this participant?</h2>

      <div className="custom-form-group">
        <select 
          className="custom-select" 
          value={reason} 
          onChange={(e) => setReason(e.target.value)}
        >
          <option value="">Select Reason</option>
          <option value="Refused">Refused</option>
          <option value="Door Locked">Door Locked</option>
          <option value="Work Daily Worker">Work Daily Worker</option>
          <option value="Work Out Of Station">Work Out Of Station</option>
          <option value="Out Of Station - Short Visit">Out Of Station - Short Visit</option>
          <option value="Already Screened">Already Screened</option>
          <option value="Settled OutStation">Settled OutStation</option>
          <option value="Medical Reasons">Medical Reasons</option>
        </select>
      </div>

      <div className="custom-modal-buttons">
        <button 
          className="Next-button" 
          type="button" 
          onClick={closeModal}
        >
          Close
        </button>
        <button 
          className="custom-modal-button custom-save-button" 
          type="button" 
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}





          <center>
            <div className="buttons">
            <button type="submit" className="Finish-button">
               Prev
              </button>
              <button
                type="button"
                className="Next-button"
                onClick={openModal}

              >
                Save
              </button>
              <button type="submit" className="Finish-button">
                Enroll
              </button>
            </div>
          </center>
        </form>
        <footer className="footer-container">
        <div className="footer-content">
          <p className="footer-text">Powered By Curable</p>
          <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="footer-logo" />
        </div>
      </footer>
      </div>
    </div>
  );
};

export default NewScreeningEnrollment;
