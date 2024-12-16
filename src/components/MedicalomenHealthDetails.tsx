import React, { useState } from 'react';
import Header from './Header';
import './HomePage.css';

const MedicalomenHealthDetails: React.FC = () => {
  const [selectedHistory, setSelectedHistory] = useState<string>('');
  const [selectedLastMenstruation, setSelectedLastMenstruation] = useState<string>('');
  const [selectedBleedingIssues, setSelectedBleedingIssues] = useState<string>('');
  const [selectedContraception, setSelectedContraception] = useState<string>('');
  const [selectedBreastFedMonths, setSelectedBreastFedMonths] = useState<string>('');
  const [selectedToggle, setSelectedToggle] = useState<string | null>(null);
  const [selectedToggle1, setSelectedToggle1] = useState<string | null>(null);
  const [selectedToggle2, setSelectedToggle2] = useState<string | null>(null);

  // const [isPregnant, setIsPregnant] = useState<string>('');
  // const [hasSurgery, setHasSurgery] = useState<string>('');
  // const [hasBreastCervixScreening, setHasBreastCervixScreening] = useState<string>('');
  const toggleOption = (option: string) => {
    setSelectedToggle(option);
  };
  const toggleOption1 = (option: string) => {
    setSelectedToggle1(option);
  };
  const toggleOption2 = (option: string) => {
    setSelectedToggle2(option);
  };
  return (
    <div className="container2">
      <Header/>

      <div className="participant-container">
        <p>Participant: Sudha, 36/F</p>
        <p>ID 123456890123456</p>
      </div>

      <form className="clinic-form">
        {/* Medical Details Section */}
        <fieldset>
          <legend>Medical Details</legend>
          <label>Medical History:</label>
          <select value={selectedHistory} onChange={(e) => setSelectedHistory(e.target.value)}>
            <option value="">Select Medical History</option>
            {/* Add actual options here */}
            <option value="History1">History 1</option>
            <option value="History2">History 2</option>
          </select>

          <label>Blood Pressure:</label>
          <input type="text" placeholder="Enter Blood Pressure" />

          <label>Pulse Rate:</label>
          <input type="text" placeholder="Enter Pulse Rate" />

          <label>Weight (Kgs):</label>
          <input type="text" placeholder="Enter Weight (Kgs)" />

          <label>Previous History of Surgery:</label>
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

          <label>Height (cms):</label>
          <input type="text" placeholder="Enter Height (cms)" />

          <label>SpO2:</label>
          <input type="text" placeholder="Enter SpO2" />

          <label>Allergy:</label>
          <input type="text" placeholder="Enter Allergy" />

          <label>Other Complaints:</label>
          <input type="text" placeholder="Enter Other Complaints" />
        </fieldset>

        {/* Women's Health Section */}
        <fieldset>
          <legend>Women's Health</legend>
          <label>Age at Menarche:</label>
          <input type="text" placeholder="Enter Age of Menarche" />

          <label>When was Last Menstruation:</label>
          <select value={selectedLastMenstruation} onChange={(e) => setSelectedLastMenstruation(e.target.value)}>
            <option value="">Select</option>
            {/* Add actual options here */}
            <option value="LastMenstruation1">Option 1</option>
            <option value="LastMenstruation2">Option 2</option>
          </select>

          <label>Abnormal Bleeding/Vaginal Issues:</label>
          <select value={selectedBleedingIssues} onChange={(e) => setSelectedBleedingIssues(e.target.value)}>
            <option value="">Select</option>
            {/* Add actual options here */}
            <option value="Issue1">Issue 1</option>
            <option value="Issue2">Issue 2</option>
          </select>

          <label>Age at Marriage:</label>
          <input type="text" placeholder="Enter Age at Marriage" />

          <label>Total Pregnancies:</label>
          <input type="text" placeholder="Enter Total Pregnancies" />

          <label>Age at First Child:</label>
          <input type="text" placeholder="Enter Age at First Child" />

          <label>Age at Last Child:</label>
          <input type="text" placeholder="Enter Age of Last Child" />

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
          <select value={selectedContraception} onChange={(e) => setSelectedContraception(e.target.value)}>
            <option value="">Select</option>
            {/* Add actual options here */}
            <option value="Contraception1">Contraception 1</option>
            <option value="Contraception2">Contraception 2</option>
          </select>

          <label>Breast Fed (How Many Months?):</label>
          <select value={selectedBreastFedMonths} onChange={(e) => setSelectedBreastFedMonths(e.target.value)}>
            <option value="">Select</option>
            {/* Add actual options here */}
            <option value="Month1">1 Month</option>
            <option value="Month2">2 Months</option>
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
        </fieldset>

        {/* Form Actions */}
        <center className="form-actions">
          <button type="button" className="submit-button1">Finish</button>
          <button type="submit" className="allocate-button">Next</button>
        </center>
      </form>
    </div>
  );
};

export default MedicalomenHealthDetails;
