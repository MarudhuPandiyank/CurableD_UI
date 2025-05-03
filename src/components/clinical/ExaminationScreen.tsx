import React, { useState } from 'react';
import './ExaminationScreen.css';
import Header from '../Header';
import Header1 from '../Header1';

const patients = [
  {
    id: '1234567891234567',
    name: 'Sudha',
    dob: '04/01/1970',
    age: 39,
    gender: 'Female',
    spouse: 'Harish',
    father: 'Chandru',
    mobile: '9876543210',
    consent: 'Received',
  },
  {
    id: '2345678912345678',
    name: 'Ravi',
    dob: '12/06/1985',
    age: 38,
    gender: 'Male',
    spouse: 'Anjali',
    father: 'Manohar',
    mobile: '9123456780',
    consent: 'Received',
  },
];

const ExaminationScreen: React.FC = () => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);

  const handlePatientSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPatientId(event.target.value);
  };

  const handleExamSelect = (exam: string) => {
    setSelectedExam(exam);
  };

  const handleBeginExam = () => {
    if (selectedExam) {
      alert(`Beginning ${selectedExam} Examination`);
    } else {
      alert('Please select an examination to begin.');
    }
  };

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId);

  return (
    <div className="container2">
       <Header1 />

      {/* Patient ID Dropdown */}
      <div className="patient-info">
        <label htmlFor="patient-id" className="info-label">Patient ID:</label>
        <select
          id="patient-id"
          className="patient-select"
          value={selectedPatientId || ''}
          onChange={handlePatientSelect}
        >
          <option value="" disabled>
            Select Patient ID
          </option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.id}
            </option>
          ))}
        </select>
        <p className="note">Patient ID will be taken when admin chooses the Patient</p>
      </div>

      {/* Patient Details */}
      {selectedPatient && (
        <div className="details">
          <p>Name of the Individual: <span>{selectedPatient.name}</span></p>
          <p>Date of birth: <span>{selectedPatient.dob}</span></p>
          <p>Age(Yrs): <span>{selectedPatient.age}</span></p>
          <p>Gender: <span>{selectedPatient.gender}</span></p>
          <p>Spouse’s Name: <span>{selectedPatient.spouse}</span></p>
          <p>Father’s Name: <span>{selectedPatient.father}</span></p>
          <p>Mobile No: <span>{selectedPatient.mobile}</span></p>
          <p><b>Informed Consent:</b> <span>{selectedPatient.consent}</span></p>
        </div>
      )}

      {/* Examination Section */}
      <div className="examinations">
        <h3>Examinations Selected</h3>
        <div className="exam-item">
          <span>Oral Examination</span>
          <span className="status not-selected">
            Not Selected <span className="dot"></span>
          </span>
        </div>
        <div className="exam-item">
          <span>Breast Examination</span>
          <span className="status yet-to-be-done">
            Yet to be Done <span className="dot"></span>
          </span>
        </div>
        <div className="exam-item">
          <span>Cervix Examination</span>
          <span className="status done">
            Done <span className="dot"></span>
          </span>
        </div>
      </div>
      {/* Exam Buttons */}
      <div className="select-exam">
        <label>Select Examination:</label>
        <div className="exam-buttons">
          <button
            className={`exam-button ${selectedExam === 'Oral' ? 'selected' : ''}`}
            onClick={() => handleExamSelect('Oral')}
          >
            Oral
          </button>
          <button
            className={`exam-button ${selectedExam === 'Breast' ? 'selected' : ''}`}
            onClick={() => handleExamSelect('Breast')}
          >
            Breast
          </button>
          <button
            className={`exam-button ${selectedExam === 'Cervix' ? 'selected' : ''}`}
            onClick={() => handleExamSelect('Cervix')}
          >
            Cervix
          </button>
        </div>
      </div>

      {/* Begin Exam Button */}
      <center>
        <button className="submit-button1" onClick={handleBeginExam}>
          Begin Examination
        </button>
      </center>
      <footer className="footer-container">
        <div className="footer-content">
          <p className="footer-text">Powered By</p>
          <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="footer-logo" />
        </div>
      </footer>
    </div>
  );
};

export default ExaminationScreen;
