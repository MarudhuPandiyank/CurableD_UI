import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PatientSearchPage.css";
import Header from "../Header";
import Header1 from "../Header1";

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

  const navigate = useNavigate();

  const handleSearch = async () => {
    const hospitalId = localStorage.getItem("hospitalId");
    const token = localStorage.getItem("token");
    if (!hospitalId || !token) {
      setError("Hospital ID or Token missing. Please log in again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<Patient[]>(
        "http://13.234.4.214:8015/api/curable/getCandidatesList",
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
      const stages = patient.eligibleDiseases.map((disease) => disease.stage);
      const diseaseTestIds = patient.eligibleDiseases.map(
        (disease) => disease.diseaseTestId
      );

      setStageList(stages);

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

    if (selectedPatient?.eligibleDiseases) {
      const selectedDisease = selectedPatient.eligibleDiseases.find(
        (disease) => disease.stage === selectedStageValue
      );

      if (selectedDisease) {
        localStorage.setItem("diseaseTestIds", JSON.stringify(selectedDisease.diseaseTestId));
      }
    }
  };

  const handleNext = () => {
    if (!selectedStage) {
      setError("Please select a stage before proceeding.");
      return;
    }

    const patientName = selectedPatient?.name || "";
    localStorage.setItem("selectedStage", selectedStage);
    localStorage.setItem("patientName", patientName);

   // navigate("/DiseaseSpecificDetailsClinic");
    navigate("/DynamicScreen");
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
              className="next-button"
              onClick={handleNext}
              aria-label="Next"
            >
              Next
            </button>
          </div>
        </>
      )}

      {patients.length === 0 && !loading && <p>No patients found.</p>}
    </div>
  );
};

export default ClinicSearchPage;
