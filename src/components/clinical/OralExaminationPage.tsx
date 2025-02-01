import React, { useState } from 'react';
import './OralExaminationPage.css';
import Header from '../Header';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Header1 from '../Header1';
import { Calendar } from 'primereact/calendar';
import 'primereact/resources/themes/saga-blue/theme.css'; // Theme
import 'primereact/resources/primereact.min.css'; // Core CSS
import 'primeicons/primeicons.css'; // Icons
const OralExaminationPage: React.FC = () => {
  // States to store the form data
  const [oralScreeningDate, setOralScreeningDate] = useState<Date | null>(null);
  const [symptoms, setSymptoms] = useState<string>('');
  const [findings, setFindings] = useState<string>('');
  const [clinicalReferral, setClinicalReferral] = useState<string>('');

//   const handleBackClick = () => {
//     console.log('Back button clicked');
//   };

  const handleCompleteExamination = () => {
    // Logic to handle form submission or examination completion
    console.log('Oral Examination Completed');
    console.log({ oralScreeningDate, symptoms, findings, clinicalReferral });
    // You can submit the data to an API or further handle the form data here.
  };

  return (
    <div className="container2">
       <Header1 />

      <h2>Oral Examination - Sudha</h2>

      {/* Oral Screening Date Section */}
      <div className="form-section">
  <label htmlFor="oral-screening-date" className="form-label">
    Oral Screening Date:
  </label>
  <div className="input-with-icon">
    <Calendar
      value={oralScreeningDate}
      onChange={(e) => setOralScreeningDate(e.value as Date | null)}
      dateFormat="yy-mm-dd" // PrimeReact date format
      placeholder="yyyy-mm-dd"
      maxDate={new Date()}
      className="1date-picker-input"
      aria-label="Select oral screening date"
      required
      showIcon // This adds the calendar icon
    />
    <img
      src="./Curable Icons/PNG/Calendar.png"
      className="clinic-id-icon"
      alt="calendar icon"
      onClick={() => {
        const calendarInput = document.querySelector('.p-inputtext') as HTMLInputElement | null;
        calendarInput?.focus(); // Focus on the calendar input when the icon is clicked
      }}
    />
  </div>
</div>


      {/* Symptoms Section */}
      <div className="form-section">
        <label className="form-label">Symptoms:</label>
        <div className="radio-buttons">
          <button
            type="button"
            className={`radio-button ${symptoms === 'Yes' ? 'selected' : ''}`}
            onClick={() => setSymptoms('Yes')}
          >
            Yes
          </button>
          <button
            type="button"
            className={`radio-button ${symptoms === 'No' ? 'selected' : ''}`}
            onClick={() => setSymptoms('No')}
          >
            No
          </button>
        </div>
      </div>

      {/* Findings Section */}
      <div className="form-section">
        <label htmlFor="findings" className="form-label">
          Findings on Oral Exam:
        </label>
        <div className="input-container">
          <select
            id="findings"
            className="form-input"
            value={findings}
            onChange={(e) => setFindings(e.target.value)}
          >
            <option value="">Select</option>
            <option value="Normal">Normal</option>
            <option value="Abnormal">Abnormal</option>
          </select>
        </div>
      </div>

      {/* Clinical Referral Section */}
      <div className="form-section">
        <label className="form-label">Referral for Clinical Examination:</label>
        <div className="radio-buttons">
          <button
            type="button"
            className={`radio-button ${clinicalReferral === 'Yes' ? 'selected' : ''}`}
            onClick={() => setClinicalReferral('Yes')}
          >
            Yes
          </button>
          <button
            type="button"
            className={`radio-button ${clinicalReferral === 'No' ? 'selected' : ''}`}
            onClick={() => setClinicalReferral('No')}
          >
            No
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <center>
        <button className="submit-button1" onClick={handleCompleteExamination}>
          Complete Oral Examination
        </button>
      </center>
      <footer className="footer-container">
        <div className="footer-content">
          <p className="footer-text">Powered By Curable</p>
          <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="footer-logo" />
        </div>
      </footer>
    </div>
  );
};

export default OralExaminationPage;
