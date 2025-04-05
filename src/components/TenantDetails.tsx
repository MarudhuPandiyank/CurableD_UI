import React, { useState } from 'react';
import Header1 from './Header1';

const TenantDetails: React.FC = () => {
  const [habitType, setHabitType] = useState<string>('');
  const [habitDuration, setHabitDuration] = useState<string>('');
  const [habitFrequency, setHabitFrequency] = useState<string>('');
  const [habitQuit, setHabitQuit] = useState<string>('');
  const [selectedToggle, setSelectedToggle] = useState<string | null>(null);

  const toggleOption = (option: string) => {
    setSelectedToggle(option);
  };

  return (
    <div className="container2">
      <Header1/>

      <div className="participant-container">
        <h1>Tenant Name</h1>
        <p><strong>Participant:</strong> Sudha, 36/F</p>
        <p><strong>ID:</strong> 123456890123456</p>
      </div>

      <form className="clinic-form">
        <fieldset className="general-details">
          <legend>General Details</legend>
          <label>Father Name:</label>
          <input type="text" placeholder="Enter Father Name" />
          
          <label>Spouse Name:</label>
          <input type="text" placeholder="Enter Spouse Name" />
          
          <label>Alt Mobile No:</label>
          <input type="text" placeholder="Enter Alt Mobile No" />
          
          <label>Monthly Income:</label>
          <input type="text" placeholder="Enter Monthly Income" />
          
          <label>Type of House:</label>
          <select>
            <option>Owned</option>
            <option>Rental</option>
          </select>
          
          <label>Education:</label>
          <select>
            <option>Select Education</option>
          </select>
          
          <label>Occupation:</label>
          <select>
            <option>Select Occupation</option>
          </select>
          
          <label>ID Proof:</label>
          <input type="text" placeholder="Enter Aadhar Number" />
          
          <label>Voter ID:</label>
          <input type="text" placeholder="Enter Voter ID" />
          
          <label>Ration Card:</label>
          <input type="text" placeholder="Enter Ration Card" />
        </fieldset>

        <fieldset className="social-habits-container">
          <legend>Social Habits</legend>
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-btn ${selectedToggle === 'yes' ? 'yes-active' : ''}`}
              onClick={() => toggleOption('yes')}
            >
              Yes
            </button>
            <button
              type="button"
              className={`toggle-btn ${selectedToggle === 'no' ? 'no-active' : ''}`}
              onClick={() => toggleOption('no')}
            >
              No
            </button>
          </div>

          <div className="habit-box">
            <label>Habits:</label>
            <select
              value={habitType}
              onChange={(e) => setHabitType(e.target.value)}
            >
              <option>Select Habit Type</option>
            </select>

            <label>Duration (Yrs):</label>
            <input
              type="text"
              placeholder="Enter Duration (Yrs)"
              value={habitDuration}
              onChange={(e) => setHabitDuration(e.target.value)}
            />

            <label>Frequency/Day:</label>
            <input
              type="text"
              placeholder="Enter Frequency (Day)"
              value={habitFrequency}
              onChange={(e) => setHabitFrequency(e.target.value)}
            />

            <label>Quit (Yes/No):</label>
            <select
              value={habitQuit}
              onChange={(e) => setHabitQuit(e.target.value)}
            >
              <option>Yes</option>
              <option>No</option>
            </select>

            <button type="button" className="add-habit-btn">
              Add Habit
            </button>
          </div>
        </fieldset>
{/* <br></br> */}
        <center className="buttons">
          <button type="button" className="Finish-button">
            Finish
          </button>
          <button type="submit" className="Next-button">
            Next
          </button>
        </center>
      </form>
      <div className="powered-container">
        <p className="powered-by">Powered By Curable</p>
        <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="curable-logo" />
      </div>
    </div>
  );
};

export default TenantDetails;
