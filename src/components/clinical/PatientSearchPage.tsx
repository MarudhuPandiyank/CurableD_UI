import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faChevronDown } from '@fortawesome/free-solid-svg-icons'; // Account and dropdown icon
import './PatientSearchPage.css';
// import "../HomePage.css"
import Header from '../Header';
const PatientSearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleBackClick = () => {
    console.log('Back button clicked');
  };

  const handleSearch = () => {
    console.log('Search button clicked with query:', searchQuery);
  };

  const handleStart = (patientName: string) => {
    console.log(`${patientName} Start button clicked`);
  };

  const handleDropdownClick = (patientName: string) => {
    console.log(`Dropdown for ${patientName} clicked`);
  };

  return (
    <div className="container10">
     <Header/>
      <div className="title">
        <p className="search-patient-title">Search Patient</p>
      </div>
      <div className="search-section">
        <input
          id="search"
          type="text"
          className="search-input"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search patient"
        />
        <button
          className="search-button"
          onClick={handleSearch}
          aria-label="Search"
        >
          Search
        </button>
      </div>
      <button className="next-button" onClick={handleSearch} aria-label="Proceed to search">
        Next
      </button>
      <div className="divider">OR</div>
      <div className="patient-list">
        <label className="select-label">Select Patient Name</label>
        <div className="patient-item">
          <div className="patient-box">
            <span>John Doe</span>
            <button
              className="circle-dropdown-icon"
              onClick={() => handleDropdownClick('John Doe')}
              aria-label="Dropdown for John Doe"
            >
              <FontAwesomeIcon icon={faChevronDown} size="lg" style={{ color: 'white' }} />
            </button>
            <button
              className="start-button"
              onClick={() => handleStart('John Doe')}
              aria-label="Start consultation for John Doe"
            >
              Start
            </button>
          </div>
        </div>
        <div className="patient-item">
          <div className="patient-box">
            <span>Jane Smith</span>
            <button
              className="circle-dropdown-icon"
              onClick={() => handleDropdownClick('Jane Smith')}
              aria-label="Dropdown for Jane Smith"
            >
              <FontAwesomeIcon icon={faChevronDown} size="lg" style={{ color: 'white' }} />
            </button>
            <button
              className="start-button"
              onClick={() => handleStart('Jane Smith')}
              aria-label="Start consultation for Jane Smith"
            >
              Start
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSearchPage;
