import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PatientSearchPage.css";
import Header from "../Header";
import Header1 from "../Header1";
import config from "../../config";
import { useSelector } from 'react-redux';
import { selectPrivilegeFlags } from '../../store/userSlice';

import { canAll, can, Privilege } from '../../store/userSlice';


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
  }[] | null;
}

const PatientSearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [stageList, setStageList] = useState<string[]>([]);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [searchSubmitted, setSearchSubmitted] = useState(false);


  const navigate = useNavigate();
      const { canView, canCreate, canEdit } = useSelector(
      selectPrivilegeFlags('Patient Registration') // or selectPrivilegeFlags('/preg')
    );
  
    const allowAllThree = useSelector(canAll('/screening', 'CREATE', 'VIEW', 'EDIT'));


  const handleSearch = async () => {
    setSearchSubmitted(true); 
    const hospitalId = localStorage.getItem("hospitalId");
     const roleId= localStorage.getItem('roleId');
    const token = localStorage.getItem("token");
     const userId= localStorage.getItem('userId');
    if (!hospitalId || !token) {
      setError("Hospital ID or Token missing. Please log in again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<Patient[]>(
        `${config.appURL}/curable/getCandidatesList`,
        {
          hospitalId: Number(hospitalId),
          search: searchQuery,
          stage: 1,
          roleId: Number(roleId),
          userId: Number(userId),
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
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      setError("Failed to fetch patients. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);

    localStorage.setItem("candidateId", patient.id.toString());
    localStorage.setItem("ptName", patient.name.toString());
    localStorage.setItem("registrationId", patient.registraionId);

    if (patient.eligibleDiseases && Array.isArray(patient.eligibleDiseases)) {

      let stages = patient.eligibleDiseases.map((disease) => {
        let stage = disease.stage.trim().toLowerCase();
        let words = stage.split(' ');
        if (words.length > 0) {
          words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
        }
        words = words.map(word => {
          if (word === 'screening') return 'Screening';
          if (word === 'test') return ''; 
          return word;
        });
        // join words, remove any empty segments and normalize whitespace
        let formatted = words.filter(w => w && w.trim() !== '').join(' ').replace(/\s+/g, ' ').trim();
        console.log(formatted, "sdksdk");
        return formatted;
      });
      const diseaseTestIds = patient.eligibleDiseases.map(
        (disease) => disease.diseaseTestId
      );

      setStageList(stages);
      console.log(diseaseTestIds,"diseaseTestIds")

      if (stages.length > 0) {
        setSelectedStage(stages[0]);
        localStorage.setItem("diseaseTestIds", JSON.stringify(diseaseTestIds[0]));
      } else {
        setSelectedStage(null);
      }
    } else {
      setStageList([]);
      setSelectedStage(null);
    }
  };
const handleStageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  const selectedStageValue = event.target.value;
  setSelectedStage(selectedStageValue);

  console.log(selectedPatient,selectedStageValue,"selectedPatient")

  if (selectedPatient?.eligibleDiseases) {
    const selectedStageNorm = selectedStageValue.trim().toLowerCase();
    const selectedDisease = selectedPatient.eligibleDiseases.find((disease) => {
      if (!disease.stage) return false;
      const diseaseStageNorm = disease.stage.trim().toLowerCase();
      return (
        diseaseStageNorm === selectedStageNorm ||
        diseaseStageNorm.startsWith(selectedStageNorm) ||
        diseaseStageNorm.includes(selectedStageNorm) ||
        selectedStageNorm.includes(diseaseStageNorm)
      );
    });

console.log(selectedDisease,"selectedDisease")
    if (selectedDisease) {
      localStorage.setItem(
        "diseaseTestIds",
        JSON.stringify(selectedDisease.diseaseTestId)
      );
    }
  }
};

  const handleNext = () => {
    if (!selectedStage) {
      setError("Please select a stage before proceeding.");
      return;
    }

    const patientName = selectedPatient?.name || "";
    const patientgender=selectedPatient?.gender||"";
    const patientAge = selectedPatient?.age != null ? selectedPatient.age.toString() : "";


    localStorage.setItem("selectedStage", selectedStage);
    localStorage.setItem("patientgender", patientgender);
    localStorage.setItem("patientName", patientName);
    localStorage.setItem("patientAge", patientAge);
    console.log(patientAge,selectedPatient,"patientAge")
    

    navigate("/DiseaseSpecificDetailsScreening");
  };

  return (
    <div className="container10">
       <Header1 />
     

        <div className="title">
          
        <h1 style={{ color: 'darkblue' }}>Screening</h1>
      </div>
  <div className="search-section_common">
        <input
                  className="search-input"

           id="search"
          type="text"
          placeholder="Search by Patient name/id/mobile"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search patient"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();       
              handleSearch();           
            }
          }}      />
        <button
           className={`search-button_common ${!allowAllThree ? 'disabled-button' : ''}`}
                  onClick={handleSearch}
 disabled={!allowAllThree || loading}                >
                  {loading ? 'Searching...' : 'Search'}
        
        </button>
      </div>

      <div className="search-container">

      
      </div>





{!loading && searchSubmitted && patients.length === 0 && (
  <p className="no-data-message">No patient found</p>
)}


      {loading && <p>Loading patients...</p>}
      {error && <p className="error">{error}</p>}

      {patients.length > 0 && (
        <>
          <div className="patient-list">
            <label className="select-label">Select Patient</label>
            <div>
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className={`patient-item ${
                    selectedPatient?.id === patient.id ? "selected" : ""
                  }`}
                  onClick={() => handlePatientClick(patient)}
                >
                  <div className="patient-box">
                    <div>
                      <strong>Name:</strong> {patient.name}
                    </div>
                    <div>
                      <strong>ID:</strong> {patient.registraionId || "N/A"}
                    </div>
                    <div>
                      <strong>Age:</strong> {patient.age || "N/A"}
                    </div>
                    <div>
                      <strong>Gender:</strong> {patient.gender || "N/A"}
                    </div>
                    <div>
                      <strong>Mobile No:</strong> {patient.mobileNo || "N/A"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="stage-dropdown">
            <label className="select-label">Screening</label>
            <select
              value={selectedStage || ""}
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
              disabled={!allowAllThree } 
              onClick={handleNext}
              aria-label="Next"
              className={`next-button ${!allowAllThree ? 'disabled-button' : ''}`}
            >
              Next
            </button>
          </div>
          <br/>
        </>
      )}
      {/* {patients.length === 0 && !loading && <p>No patients found.</p>} */}
      <footer className="footer-container-fixed">
        <div className="footer-content">
          <p className="footer-text">Powered By</p>
          <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="footer-logo" />
        </div>
      </footer>
    </div>
  );
};

export default PatientSearchPage;
