import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './PatientSearchPage.css';
import Header from '../Header';

interface Patient {
  id: number;
  name: string;
  eligibleDiseases: {
    candidateId: number;
    stage: string;
    name: string;
    diseaseTestId: number;
  }[];
}

interface ApiResponse {
  // Define the structure of the response you expect from the API
  success: boolean;
  data: any; // Replace 'any' with the actual data type
}

const PatientSearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownData, setDropdownData] = useState<Patient['eligibleDiseases'] | null>(null); // State to hold the dropdown data
  const [selectedStage, setSelectedStage] = useState<string | null>(null); // State to hold the selected stage

  const handleSearch = async () => {
    const hospitalId = localStorage.getItem('hospitalId');
    const token = localStorage.getItem('token');
    if (!hospitalId || !token) {
      setError('Hospital ID or Token missing. Please log in again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<Patient[]>('http://13.234.4.214:8015/api/curable/getCandidatesList', {
        hospitalId: Number(hospitalId),
        search: searchQuery,
        stage: 1,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.length > 0) {
        const patientData = response.data.map((patient) => ({
          id: patient.id,
          name: patient.name,
          eligibleDiseases: patient.eligibleDiseases,
        }));
        setPatients(patientData);
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('Failed to fetch patients. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDropdownClick = (patient: Patient) => {
    setDropdownData(patient.eligibleDiseases); // Set the diseases data for the selected patient
  };

  const handleStageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStage(event.target.value); // Update the selected stage
  };

  const handleStart = async (patientName: string) => {
    if (!selectedStage) {
      setError('Please select a stage before starting.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token missing. Please log in again.');
      return;
    }

    try {
      const response = await axios.get<ApiResponse>(
        `http://13.234.4.214:8015/api/curable/getMetrics/${selectedStage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        console.log('Metrics retrieved:', response.data.data);
        // Add further handling of the response as needed
      } else {
        setError('Failed to retrieve metrics.');
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setError('Failed to fetch metrics. Please try again later.');
    }
  };

  return (
    <div className="container10">
      <Header />
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

      {loading && <p>Loading patients...</p>}
      {error && <p className="error">{error}</p>}

      <button className="next-button" onClick={handleSearch} aria-label="Proceed to search">
        Next
      </button>
      <div className="divider">OR</div>

      <div className="patient-list">
        <label className="select-label">Select Patient Name</label>
        {patients.length > 0 ? (
          patients.map((patient) => (
            <div className="patient-item" key={patient.id}>
              <div className="patient-box">
                <span>{patient.name}</span>
                <button
                  className="circle-dropdown-icon"
                  onClick={() => handleDropdownClick(patient)}
                  aria-label={`Dropdown for ${patient.name}`}
                >
                  <FontAwesomeIcon icon={faChevronDown} size="lg" style={{ color: 'white' }} />
                </button>

                {/* Conditionally render dropdown before Start button */}
                {dropdownData && (
                  <div className="dropdown">
                    <select
                      className="dropdown-select"
                      aria-label="Select stage"
                      value={selectedStage || ''}
                      onChange={handleStageChange}
                    >
                      <option value="">Select Stage</option>
                      {dropdownData.map((disease) => (
                        <option key={disease.diseaseTestId} value={disease.stage}>
                          {disease.stage}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  className="start-button"
                  onClick={() => handleStart(patient.name)}
                  aria-label={`Start consultation for ${patient.name}`}
                >
                  Start
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No patients found.</p>
        )}
      </div>
    </div>
  );
};

export default PatientSearchPage;
