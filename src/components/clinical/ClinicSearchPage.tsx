import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PatientSearchPage.css";
import Header from "../Header";
import Header1 from "../Header1";
import config from '../../config'; 
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

const ClinicSearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [stageList, setStageList] = useState<string[]>([]);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [stageToId, setStageToId] = useState<Record<string, number>>({});

  const navigate = useNavigate();
      const { canView, canCreate, canEdit } = useSelector(
      selectPrivilegeFlags('Patient Registration') // or selectPrivilegeFlags('/preg')
    );
  
    const allowAllThree = useSelector(canAll('/clinical', 'CREATE', 'VIEW', 'EDIT'));


  const handleSearch = async () => {
    const hospitalId = localStorage.getItem("hospitalId");
    const token = localStorage.getItem("token");
    const roleId= localStorage.getItem('roleId');
    const userId= localStorage.getItem('userId');
    if (!hospitalId || !token) {
      setError("Hospital ID or Token missing. Please log in again.");
      return;
    }
    // require at least 3 characters to search
    setError(null);
    if (!searchQuery || searchQuery.trim().length < 3) {
      setError('please enter min 3 char');
      // don't mark as searchAttempted — API wasn't called
      return;
    }

    // mark that a real search is being attempted and start loading
    setSearchAttempted(true);
    setLoading(true);

    try {
      const response = await axios.post<Patient[]>(
        `${config.appURL}/curable/getCandidatesList`,
        {
          hospitalId: Number(hospitalId),
          search: searchQuery,
          stage: 2,
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

  // ⬇️ replace your handlePatientClick with this
const handlePatientClick = (patient: Patient) => {
  setSelectedPatient(patient);

  localStorage.setItem("candidateId", String(patient.id));
  localStorage.setItem("ptName", patient.name);
  localStorage.setItem("registrationId", patient.registraionId);

  if (patient.eligibleDiseases && Array.isArray(patient.eligibleDiseases)) {
    // Sort the objects by stage so pairing stays intact
    const sorted = [...patient.eligibleDiseases].sort((a, b) =>
      a.stage.localeCompare(b.stage)
    );

    const stages = sorted.map(d => d.stage);
    const map: Record<string, number> = {};
    sorted.forEach(d => { map[d.stage] = d.diseaseTestId; });

    setStageList(stages);
    setStageToId(map);

    if (stages.length > 0) {
      const firstStage = stages[0];
      setSelectedStage(firstStage);
      // store the matching diseaseTestId for the default (first) stage
      localStorage.setItem("diseaseTestIds", String(map[firstStage]));
    } else {
      setSelectedStage(null);
    }
  } else {
    setStageList([]);
    setStageToId({});
    setSelectedStage(null);
  }
};


  // ⬇️ replace your handleStageChange with this
const handleStageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  const selectedStageValue = event.target.value;
  setSelectedStage(selectedStageValue);

  const id = stageToId[selectedStageValue];
  if (id !== undefined) {
    localStorage.setItem("diseaseTestIds", String(id));
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
    localStorage.setItem("patientName", patientName);
    localStorage.setItem("patientgender", patientgender);
    localStorage.setItem("patientAge", patientAge);



   // navigate("/DiseaseSpecificDetailsClinic");
    navigate("/DynamicScreen");
  };

  return (
    <div className="container10">
       <Header1 />
      <div className="title">
         
        <h1 style={{ color: 'darkblue' }}>Clinical Evaluation</h1>
      </div>
      <div className="search-section">
        <input
          id="search"
          type="text"
          className="search-input"
 placeholder="Search by Patient name/id/mobile"
           value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search patient"
           onKeyDown={(e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      handleSearch(); // trigger search
    }
  }}
        />
        <button
          className="search-button"
          onClick={handleSearch}
          aria-label="Search"
        >
          Search
        </button>
      </div>

    {error && <p className="error center-message">{error}</p>}

{!loading && searchAttempted && patients.length === 0 && (
  <p className="no-data-message">No patient found</p>
)}
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
            <label className="select-label">Clinical</label>
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
              className={`next-button ${!allowAllThree ? 'disabled-button' : ''}`}

              disabled={!allowAllThree }
              onClick={handleNext}
              aria-label="Next"
            >
              Next
            </button>
            <br/>
          </div>
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

export default ClinicSearchPage;
