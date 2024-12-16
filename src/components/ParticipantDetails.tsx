import React, { useState } from 'react';
import Header1 from './Header1';

const ParticipantDetails: React.FC = () => {
  const [houseType, setHouseType] = useState<string>('');
  const [selectedToggle1, setSelectedToggle1] = useState<string | null>(null);

  const toggleOption = (setOption: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setOption(value);
  };

  const toggleOption1 = (option: string) => {
    setSelectedToggle1(option);
  };

  return (
    <div className="container2">
      <Header1 />
      <div className="participant-container">
        <p>Participant: Sudha, 36/F</p>
        <p>ID 123456890123456</p>
      </div>
      <form className="clinic-form">
        <h2>General Details</h2>
        <div className="form-group">
          <label htmlFor="father-name">Father Name:</label>
          <input type="text" id="father-name" name="father-name" placeholder="Enter Father Name" />
        </div>
        <div className="form-group">
          <label htmlFor="spouse-name">Spouse Name:</label>
          <input type="text" id="spouse-name" name="spouse-name" placeholder="Enter Spouse Name" />
        </div>
        <div className="form-group">
          <label htmlFor="alt-mobile">Alt Mobile No:</label>
          <input type="text" id="alt-mobile" name="alt-mobile" placeholder="Enter Alt Mobile No" />
        </div>
        <div className="form-group">
          <label htmlFor="income">Monthly Income:</label>
          <input type="text" id="income" name="income" placeholder="Enter Monthly Income" />
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
          <select id="education" name="education">
            <option value="" disabled selected>Select Education</option>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="graduate">Graduate</option>
            <option value="postgraduate">Postgraduate</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="occupation">Occupation:</label>
          <select id="occupation" name="occupation">
            <option value="" disabled selected>Select Occupation</option>
            <option value="farmer">Farmer</option>
            <option value="worker">Worker</option>
            <option value="professional">Professional</option>
            <option value="other">Other</option>
          </select>
        </div>
        <h2>ID Proof</h2>
        <div className="form-group">
          <label htmlFor="aadhaar">Aadhaar Number:</label>
          <input type="text" id="aadhaar" name="aadhaar" placeholder="Enter Aadhaar Number" />
        </div>
        <div className="form-group">
          <label htmlFor="voter-id">Voter ID:</label>
          <input type="text" id="voter-id" name="voter-id" placeholder="Enter Voter ID" />
        </div>
        <div className="form-group">
          <label htmlFor="ration-card">Ration Card:</label>
          <input type="text" id="ration-card" name="ration-card" placeholder="Enter Ration Card" />
        </div>
        <h2>Social Habits</h2>
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
          <button type="button" className="submit-button1">Finish</button>
          <button type="submit" className="allocate-button">Next</button>
        </div>
      </form>
      <div className="powered-container">
        <p className="powered-by">Powered By Curable</p>
        <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="curable-logo" />
      </div>
    </div>
  );
};

export default ParticipantDetails;
