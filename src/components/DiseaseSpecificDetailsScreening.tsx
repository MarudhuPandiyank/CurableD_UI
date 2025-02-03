import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from '../config';
import Header1 from "./Header1";
import Select, { MultiValue } from 'react-select';
import './Common.css';
interface Field {
  testName: string;
  subtestName: string;
  condition?: Condition[];
  valueType: string;
  values: string[];
  selectedValues?: string[];
}
interface ColourOption {
  value: string;
  label: string;
}
interface Condition {
  enabledField: string;
  triggerValue: string;
}

interface ApiResponse {
  id: number;
  testMetrics: {
    params: Field[];
  };
}

const App: React.FC = () => {
  const [selectedValues, setSelectedValues] = useState<{ [key: string]: string | string[] }>({});
  const [hiddenFields, setHiddenFields] = useState<string[]>([]);
  const [fieldData, setFieldData] = useState<Field[]>([]);
  
  const navigate = useNavigate();
  const diseaseTestIds = localStorage.getItem('diseaseTestIds');

  useEffect(() => {
    const fetchDiseaseTestMaster = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage

        const response = await axios.get<ApiResponse>(
          `${config.appURL}/curable/getMetricsById/${diseaseTestIds}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const filteredData = response.data.testMetrics.params;
        setFieldData(filteredData); // Set the fetched data to fieldData state

        // Optionally, you can set hiddenFields based on the conditions in filteredData
        const hidden = new Set<string>();
        filteredData.forEach((field) => {
          field.condition?.forEach((cond) => {
            hidden.add(cond.enabledField);
          });
        });
        setHiddenFields(Array.from(hidden));

      } catch (error) {
        console.error('Error fetching disease test master data:', error);
      }
    };

    if (diseaseTestIds) {
      fetchDiseaseTestMaster();
    }
  }, [diseaseTestIds]);


  const handleSelectChange = (testName: string, value: string | string[]) => {
    setSelectedValues({ ...selectedValues, [testName]: value});

    const fieldsToShow = new Set<string>(hiddenFields);

    fieldData.forEach((field) => {
      if (field.testName === testName) {
        field.condition?.forEach((cond) => {
          if (cond.triggerValue === value) {
            fieldsToShow.delete(cond.enabledField);
          } else {
            fieldsToShow.add(cond.enabledField);
          }
        });
      }
    });

    setHiddenFields(Array.from(fieldsToShow));
  };
  const candidateId = localStorage.getItem('candidateId');

  const handleFinish = async () => {
    const payload = {
      candidateId: Number(candidateId),
      diseaseTestMasterId: Number(diseaseTestIds),
      description: "Eligibility Metrics",
      diseaseTestId: 1,
      familyMedicalMetrics: null,
      familyMetrics: null,
      gender: "FEMALE", // You can dynamically adjust this if necessary
      genderValid: true,
      hospitalId: 1,
      id: null,
      medicalMetrics: null,
      name: "Eligibility Metrics",
      stage: localStorage.getItem('selectedStage'),
      eligibilityMetrics: null,
      type:1,
      testMetrics: {
        params: fieldData.map((field) => ({
          testName: field.testName,
          subtestName: field.subtestName,
          selectedValues: selectedValues[field.testName] ? [selectedValues[field.testName]] : [],
        })),
      },
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("Token is missing");
        return;
      }

      await axios.post(`${config.appURL}/curable/candidatehistory`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Data submitted successfully!');
      navigate('/SuccessMessageScreeningFInal');
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };
  const [titleName, setTitleName] = useState("Disease Specific Details");

  const patientId = localStorage.getItem('patientId');
  const patientName = localStorage.getItem('patientName');
  const pName= localStorage.getItem("patientName");
  const regId= localStorage.getItem("registrationId");


  useEffect(() => {
    const selectedStage = localStorage.getItem("selectedStage");
  
    if (selectedStage === "Breast screening Test") {
      setTitleName("Breast Screening");
    } else if (selectedStage === "Oral Screening Test") {
      setTitleName("Oral Screening");
    } else if (selectedStage === "Cervical Screening Test") {
      setTitleName("Cervical Screening");
    } else {
      setTitleName("Disease Specific Details");
    }
  }, []);
  


  return (
    <div className="container2">
      <Header1 />
      <div className="participant-info-container">
        <p className="participant-info-text"><strong>Participant:</strong> {pName}</p>
        <p className="participant-info-text"><strong>ID:</strong> {regId}</p>
      </div>
      <div className="clinic-details-form">
        <h1 style={{ color: 'darkblue' }}>{titleName}</h1>
        {fieldData.map((field) =>
          !hiddenFields.includes(field.testName) && (
            <div key={field.testName} className="form-group">
              <h3 className="form-group" style={{ fontSize: "15px" }}>{field.testName}</h3>
              {field.valueType === "SingleSelect" && (
                <select
                  value={selectedValues[field.testName] || ""}
                  onChange={(e) => handleSelectChange(field.testName, e.target.value)}
                >
                  <option value="" disabled>Select an option</option>
                  {field.values.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              )}
              {field.valueType === 'Multi Select' && (
                <Select
                  isMulti
                  name={field.testName}
                  options={field.values.map((value) => ({ value, label: value }))}
                  onChange={(option: MultiValue<ColourOption>) => handleSelectChange(field.testName, option.map(opt => opt.value))} // Updated this line
                 className="form-group"
                />
              )}
              {field.valueType === "Input" && (
                <input

                  type="text"
                  value={selectedValues[field.testName] || ""}
                  onChange={(e) => handleSelectChange(field.testName, e.target.value)}
                />
              )}
            </div>
          )
        )}

        {/* Add the Finish button */}
        <center className="buttons">
          <button className="Finish-button" onClick={handleFinish}>Finish</button>
        </center>
      </div>
    
    <footer className="footer-container">
        <div className="footer-content">
          <p className="footer-text">Powered By Curable</p>
          <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="footer-logo" />
        </div>
      </footer>
    </div>
    
  );
};

export default App;
