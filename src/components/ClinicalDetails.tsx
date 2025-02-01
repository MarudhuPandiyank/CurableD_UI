import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header1 from './Header1';
import config from '../config'; 
const ClinicalDetails: React.FC = () => {
  const [houseType, setHouseType] = useState<string>('');
  const [selectedToggle1, setSelectedToggle1] = useState<string | null>(null);
  const [education, setEducation] = useState<string>('');
  const [occupation, setOccupation] = useState<string>('');
  const [fatherName, setFatherName] = useState<string>('');
  const [spouseName, setSpouseName] = useState<string>('');
  const [altMobile, setAltMobile] = useState<string>('');
  const [income, setIncome] = useState<string>('');
  const [aadhaar, setAadhaar] = useState<string>('');
  const [voterId, setVoterId] = useState<string>('');
  const [rationCard, setRationCard] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const toggleOption = (setOption: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setOption(value);
  };

  const toggleOption1 = (option: string) => {
    setSelectedToggle1(option);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tobaccoUser = selectedToggle1 === 'yes';

    const formData = {
      fatherName,
      spouseName,
      alternateMobileNo: altMobile,
      monthlyIncome: parseFloat(income) || 0,
      houseType,
      occupation,
      education,
      aadhar: aadhaar,
      rationCard,
      voterId,
      tobaccoUser,
      id: localStorage.getItem('patientId') || '',
    };

    const token = localStorage.getItem('token');

    if (!token) {
      console.error('Token not found');
      alert('Session expired. Please log in again.');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${config.appURL}/curable/candidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Success:', data);
        navigate('/responsive-cancer-institute'); // Navigate on success
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData);
        alert(`Error: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while submitting the form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const patientId = localStorage.getItem('patientId');
  const patientName = localStorage.getItem('patientName');

  return (
    <div className="container2">
      <Header1 />
      <div className="participant-container">
        <p>Participant: {patientId}</p>
        <p>ID: {patientName}</p>
      </div>
      <form className="clinic-form" onSubmit={handleFormSubmit}>
        
        <h1 style={{ color: 'darkblue' }}>General Details</h1>
        <div className="form-group">
          <label htmlFor="father-name">Father Name:</label>
          <input
            type="text"
            id="father-name"
            name="father-name"
            value={fatherName}
            onChange={(e) => setFatherName(e.target.value)}
            placeholder="Enter Father Name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="spouse-name">Spouse Name:</label>
          <input
            type="text"
            id="spouse-name"
            name="spouse-name"
            value={spouseName}
            onChange={(e) => setSpouseName(e.target.value)}
            placeholder="Enter Spouse Name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="alt-mobile">Alt Mobile No:</label>
          <input
            type="text"
            id="alt-mobile"
            name="alt-mobile"
            value={altMobile}
            onChange={(e) => setAltMobile(e.target.value)}
            placeholder="Enter Alt Mobile No"
          />
        </div>
        <div className="form-group">
          <label htmlFor="income">Monthly Income:</label>
          <input
            type="text"
            id="income"
            name="income"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="Enter Monthly Income"
          />
        </div>
        <div className="form-group">
          <label>Type of House:</label>
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-btn ${houseType === 'Owned' ? 'owned-active' : ''}`}
              onClick={() => toggleOption(setHouseType, 'Owned')}
            >
              Owned
            </button>
            <button
              type="button"
              className={`toggle-btn ${houseType === 'Rental' ? 'rental-active' : ''}`}
              onClick={() => toggleOption(setHouseType, 'Rental')}
            >
              Rental
            </button>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="education">Education:</label>
          <select id="education" name="education" value={education} onChange={(e) => setEducation(e.target.value)}>
            <option value="" disabled>
              Select Education
            </option>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="graduate">Graduate</option>
            <option value="postgraduate">Postgraduate</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="occupation">Occupation:</label>
          <select id="occupation" name="occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)}>
            <option value="" disabled>
              Select Occupation
            </option>
            <option value="farmer">Farmer</option>
            <option value="worker">Worker</option>
            <option value="professional">Professional</option>
            <option value="other">Other</option>
          </select>
        </div>
        <h2>ID Proof</h2>
        <div className="form-group">
          <label htmlFor="aadhaar">Aadhaar Number:</label>
          <input
            type="text"
            id="aadhaar"
            name="aadhaar"
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value)}
            placeholder="Enter Aadhaar Number"
          />
        </div>
        <div className="form-group">
          <label htmlFor="voter-id">Voter ID:</label>
          <input
            type="text"
            id="voter-id"
            name="voter-id"
            value={voterId}
            onChange={(e) => setVoterId(e.target.value)}
            placeholder="Enter Voter ID"
          />
        </div>
        <div className="form-group">
          <label htmlFor="ration-card">Ration Card:</label>
          <input
            type="text"
            id="ration-card"
            name="ration-card"
            value={rationCard}
            onChange={(e) => setRationCard(e.target.value)}
            placeholder="Enter Ration Card"
          />
        </div>
        <h1>Social Habits</h1>
        <div className="form-group">
          <label>Tobacco/Alcohol Habits:</label>
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
        </div>
        <div className="buttons">
          <button type="button" className="submit-button1" onClick={handleFormSubmit} disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Finish'}
          </button>
          <button type="submit" className="allocate-button" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Next'}
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

export default ClinicalDetails;
