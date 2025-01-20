import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './PatientSearchPage.css';
import Header from '../Header';
import Header1 from '../Header1';

interface Patient {
  id: number;
  name: string;
  registraionId: string;
  age: number;
  gender: string;
  mobileNo: string;
  eligibleDiseases: {
    candidateId: number;
    stage: string;
    name: string;
    diseaseTestId: number;
  }[];
}

interface ApiResponse {
  success: boolean;
  data: any;
}

const ClinicSearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownData, setDropdownData] = useState<Patient['eligibleDiseases'] | null>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [stageList, setStageList] = useState<string[]>([]);

  const navigate = useNavigate();

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
      const response = await axios.post<Patient[]>(
        'http://13.234.4.214:8015/api/curable/getCandidatesList',
        {
          hospitalId: Number(hospitalId),
          search: searchQuery,
          stage: 2,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.length > 0) {
        const patientData = response.data.map((patient) => ({
          id: patient.id,
          name: patient.name,
          registraionId: patient.registraionId,
          age: patient.age,
          gender: patient.gender,
          mobileNo: patient.mobileNo,
          eligibleDiseases: patient.eligibleDiseases,
        }));
        setPatients(patientData);

        // Extract unique stages from eligibleDiseases
        const stages = response.data
          .flatMap((patient) => patient.eligibleDiseases.map((disease) => disease.stage))
          .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
        setStageList(stages);
        const diseaseTestIds = response.data
        .flatMap((patient) => patient.eligibleDiseases.map((disease) => disease.diseaseTestId))
        .filter((value, index, self) => self.indexOf(value) === index);
        // Set the first stage as the default selected stage
        const candidateIds = response.data
        .flatMap((patient) => patient.eligibleDiseases.map((disease) => disease.candidateId))
        .filter((value, index, self) => self.indexOf(value) === index);
        if (stages.length > 0) {
          setSelectedStage(stages[0]);
          localStorage.setItem("diseaseTestIds", JSON.stringify(diseaseTestIds[0]));

        }
        if(candidateIds.length>0){
          localStorage.setItem("candidateId", JSON.stringify(candidateIds[0]));
        }
       
        
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

  const handleStageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStage(event.target.value);
  };

  const handleNext = () => {
    if (!selectedStage) {
      setError('Please select a stage before proceeding.');
      return;
    }

    const patientName = localStorage.getItem('patientName') || '';
    localStorage.setItem('selectedStage', selectedStage);
    navigate('/DiseaseSpecificDetailsClinical');
  };

  return (
    <div className="container10">
      <Header1 />
      <div className="title">
        <p className="search-patient-title">Clinical</p>
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

      {/* Render Select Patient Name and Select Stage only after search */}
      {patients.length > 0 && (
        <>
          <div className="patient-list">
            <label className="select-label">Select Patient</label>
            {/* Display patient details as a list */}
            <div className="patient-list">
              {patients.map(patient => (
                <div key={patient.id} className="patient-item">
                  <div className="patient-box">
                    <div><strong>Name:</strong> {patient.name}</div>
                    <div><strong>ID:</strong> {patient.registraionId || 'N/A'}</div>
                    <div><strong>Age:</strong> {patient.age}</div>
                    <div><strong>Gender:</strong> {patient.gender}</div>
                    <div><strong>Mobile No:</strong> {patient.mobileNo}</div>
                    {/* Add more patient details here as needed */}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Select Stage and Next button */}
          <div className="stage-dropdown">
            <label className="select-label">Screening</label>
            <select
              value={selectedStage || ''}
              onChange={handleStageChange}
              aria-label="Select Stage"
            >
              <option value="">Select Stage</option>
              {stageList.map((stage, index) => (
                <option key={index} value={stage}>
                  {stage}
                </option>
              ))}
            </select>

            <button
              className="next-button"
              onClick={handleNext}
              aria-label="Next"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* If no patients are found */}
      {patients.length === 0 && !loading && <p>No patients found.</p>}
    </div>
  );
};

export default ClinicSearchPage;
