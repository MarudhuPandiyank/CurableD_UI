import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header1 from './Header1';
import './HomePage.css';
import axios from 'axios';
import config from '../config'; 
// Define types for API response
interface FamilyMetricsParam {
  testName: string;
  subtestName: string;
  condition: string | null;
  valueType: string;
  values: string[];
  selectedValues: string[]; // Add selectedValues to the structure
}

interface ApiResponse {
  testMetrics: {
    params: FamilyMetricsParam[];
  };
}

function DiseaseSpecificDetailsClinic() {
  const [formData, setFormData] = useState<FamilyMetricsParam[]>([]); // State to store dynamic form fields
  const [error, setError] = useState<string | null>(null); // State to store error message
  const [formValues, setFormValues] = useState<Record<string, string>>({}); // State to store the form values dynamically

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDiseaseTestMaster = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
        const selectedStage = localStorage.getItem('selectedStage');
        if (!token) {
          setError('Token is missing. Please log in again.');
          return;
        }

        const response = await axios.get<ApiResponse>(`${config.appURL}/curable/getMetrics/${selectedStage}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFormData(response.data.testMetrics.params); // Store dynamic form fields based on the API response
        console.log('Disease Test Master Data:', response.data);
      } catch (error) {
        console.error('Error fetching disease test master data:', error);
        setError('Failed to load disease test data. Please try again.');
      }
    };

    fetchDiseaseTestMaster();
  }, []);

  const handleInputChange = (testName: string, value: string) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [testName]: value,
    }));
  };

  const handleSelectChange = (testName: string, value: string) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [testName]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Construct the body of the POST request to match the desired structure
    const updatedFormData = formData.map((field) => {
      const selectedValue = formValues[field.testName] ? [formValues[field.testName]] : [];
      return {
        ...field,
        selectedValues: selectedValue, // Assign the selected value to selectedValues
      };
    });

    const payload = {
      description: "Eligibility Metrics",
      diseaseTestId: 1,
      eligibilityMetrics: {
        params: updatedFormData,
      },
      familyMedicalMetrics: null,
      familyMetrics: null,
      gender: "FEMALE", // You can dynamically adjust this if necessary
      genderValid: true,
      hospitalId: 1,
      id: 27,
      medicalMetrics: null,
      name: "Eligibility Metrics",
      stage: localStorage.getItem('selectedStage'),
      testMetrics: null,
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token is missing. Please log in again.');
        return;
      }

      await axios.post(`${config.appURL}/curable/candidatehistory`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Data submitted successfully!');
      navigate('/ParticipantDetails');
    } catch (error) {
      console.error('Error submitting data:', error);
      setError('Failed to submit data. Please try again.');
    }
  };

  const patientId = localStorage.getItem('patientId');
  const patientName = localStorage.getItem('patientName');

  return (
    <div className="container2">
      <Header1 />
      <div className="participant-container">
        <p className="participant-info-text"><strong>Participant: </strong> {patientId}</p>
      <p className="participant-info-text"><strong>ID:</strong> {patientName}</p>
      

      </div>

      {error && <div className="error-message">{error}</div>} {/* Display error message if there's an issue */}

      <form className="clinic-form" onSubmit={handleSubmit}>
        <p>Disease Specific Details</p>

        {/* Dynamically render form fields based on the API response */}
        {formData.map((field, index) => (
          <div key={index} className="form-group">
            <label style={{ color: 'darkblue' }}>{field.testName}:</label>

            {field.valueType === 'SingleSelect' ? (
              <select
                id={field.testName.toLowerCase().replace(' ', '-')}
                name={field.testName.toLowerCase().replace(' ', '-')}
                value={formValues[field.testName] || ''}
                onChange={(e) => handleSelectChange(field.testName, e.target.value)}
              >
                <option value="" disabled>Select {field.testName}</option>
                {field.values.map((value: string, idx: number) => (
                  <option key={idx} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                id={field.testName.toLowerCase().replace(' ', '-')}
                name={field.testName.toLowerCase().replace(' ', '-')}
                value={formValues[field.testName] || ''}
                onChange={(e) => handleInputChange(field.testName, e.target.value)}
                placeholder={`Enter ${field.testName}`}
              />
            )}
          </div>
        ))}

        <center className="buttons">
          <button type="button" className="Finish-button">Finish</button>
          <button type="submit" className="Next-button">Next</button>
        </center>
      </form>

      <div className="powered-container">
        <p className="powered-by">Powered By </p>
        <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="curable-logo" />
      </div>
    </div>
  );
}

export default DiseaseSpecificDetailsClinic;
