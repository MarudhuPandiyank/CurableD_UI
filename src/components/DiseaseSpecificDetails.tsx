import React, { useEffect, useState } from 'react';
import Header1 from './Header1';
import './HomePage.css';
import axios from 'axios';

// Define types for API response
interface FamilyMetricsParam {
  testName: string;
  subtestName: string;
  condition: string | null;
  valueType: string;
  values: string[];
  selectedValues: string[];
}

interface ApiResponse {
  familyMetrics: {
    params: FamilyMetricsParam[];
  };
}

function DiseaseSpecificDetails() {
  const [formData, setFormData] = useState<FamilyMetricsParam[]>([]); // State to store dynamic form fields
  const [error, setError] = useState<string | null>(null); // State to store error message
  const [formValues, setFormValues] = useState<Record<string, string>>({}); // State to store the form values dynamically

  useEffect(() => {
    const fetchDiseaseTestMaster = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
        if (!token) {
          setError('Token is missing. Please log in again.');
          return;
        }

        const response = await axios.get<ApiResponse>(`http://13.234.4.214:8015/api/curable/diseasetestmaster/27`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFormData(response.data.familyMetrics.params); // Store dynamic form fields based on the API response
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Submitted', formValues);
  };

  return (
    <div className="container2">
      <Header1 />
      <div className="participant-container">
        <p>Participant: Sudha, 36/F</p>
        <p>ID 123456890123456</p>
      </div>

      {error && <div className="error-message">{error}</div>} {/* Display error message if there's an issue */}

      <form className="clinic-form" onSubmit={handleSubmit}>
        <p>Disease Specific Details</p>

        {/* Dynamically render form fields based on the API response */}
        {formData.map((field, index) => (
          <div key={index} className="form-group">
            <label style={{ color: 'darkblue' }}>{field.testName}*:</label>

            {field.valueType === 'SingleSelect' ? (
              <select
                id={field.testName.toLowerCase().replace(' ', '-')}
                name={field.testName.toLowerCase().replace(' ', '-')}
                value={formValues[field.testName] || ''}
                onChange={(e) => handleInputChange(field.testName, e.target.value)}
              >
                <option value="" disabled>Select {field.testName}</option>
                {field.values.map((value: string, idx: number) => (
                  <option key={idx} value={value.toLowerCase()}>{value}</option>
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
        <p className="powered-by">Powered By Curable</p>
        <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="curable-logo" />
      </div>
    </div>
  );
}

export default DiseaseSpecificDetails;
