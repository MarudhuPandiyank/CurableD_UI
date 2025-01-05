import React, { useEffect, useState } from 'react';
import Header1 from './Header1';
import './HomePage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
  familyMetrics: {
    params: FamilyMetricsParam[];
  };
}

function FamilyPersonalDetails() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FamilyMetricsParam[]>([]); // State to store dynamic form fields
  const [error, setError] = useState<string | null>(null); // State to store error message
  const [formValues, setFormValues] = useState<Record<string, string>[]>([{ }]); // Initialize with one form entry

  useEffect(() => {
    const fetchFamilyPersonalMetrics = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
        if (!token) {
          setError('Token is missing. Please log in again.');
          return;
        }

        const response = await axios.get<ApiResponse>(`http://13.234.4.214:8015/api/curable/getMetrics/FAMILY_PERSONAL`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFormData(response.data.familyMetrics.params); // Store dynamic form fields based on the API response
        console.log('Family Personal Metrics Data:', response.data);
      } catch (error) {
        console.error('Error fetching family personal metrics data:', error);
        setError('Failed to load family personal metrics. Please try again.');
      }
    };

    fetchFamilyPersonalMetrics();
  }, []);

  const handleFieldChange = (index: number, testName: string, value: string) => {
    const updatedFormValues = [...formValues];
    updatedFormValues[index] = {
      ...updatedFormValues[index],
      [testName]: value,
    };
    setFormValues(updatedFormValues);
  };

  const handleAddMember = () => {
    setFormValues((prevValues) => [...prevValues, {}]); // Add a new form to the formValues state
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Construct the body of the POST request to match the desired structure
    const updatedFormData = formValues.map((formValue, index) => {
      const updatedFields = formData.map((field) => {
        const selectedValue = formValue[field.testName] ? [formValue[field.testName]] : [];
        return {
          ...field,
          selectedValues: selectedValue, // Assign the selected value to selectedValues
        };
      });
      return updatedFields;
    });

    const payload = {
      description: "Family Personal Metrics",
      diseaseTestId: 1,
      familyMetrics: {
        params: updatedFormData.flat(), // Flatten the array to send all the form data
      },
      familyMedicalMetrics: null,
      eligibilityMetrics: null,
      gender: "FEMALE", // You can dynamically adjust this if necessary
      genderValid: true,
      hospitalId: 1,
      id: 27,
      medicalMetrics: null,
      name: "Family Personal Metrics",
      stage: "FAMILY_PERSONAL",
      testMetrics: null,
      type: 1,
      candidateId: Number(patientId),
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token is missing. Please log in again.');
        return;
      }

      await axios.post('http://13.234.4.214:8015/api/curable/candidatehistory', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Data submitted successfully!');
      navigate('/FamilyMedicalDetails');
    } catch (error) {
      console.error('Error submitting data:', error);
      setError('Failed to submit data. Please try again.');
    }
  };

  const patientId = localStorage.getItem('patientId');
  const patientName = localStorage.getItem('patientName');

  if (!patientId || !patientName) {
    return <div className="error-message">Missing patient information. Please log in again.</div>;
  }

  return (
    <div className="container2">
      <Header1 />
      <div className="participant-container">
        <p>Participant: {patientId}</p>
        <p>ID: {patientName}</p>
      </div>

      {error && <div className="error-message">{error}</div>} {/* Display error message if there's an issue */}

      <form className="clinic-form" onSubmit={handleSubmit}>
        <p>Family Personal Details</p>

        {/* Dynamically render form fields for each member */}
        {formValues.map((formValue, formIndex) => (
          <div key={formIndex} className="family-member-form">
            <p>Member {formIndex + 1}</p>
            {formData.map((field, index) => (
              <div key={index} className="form-group">
                <label style={{ color: 'darkblue' }}>{field.testName}*:</label>

                {field.valueType === 'SingleSelect' ? (
                  <select
                    id={field.testName.toLowerCase().replace(' ', '-')}
                    name={field.testName.toLowerCase().replace(' ', '-')}
                    value={formValue[field.testName] || ''}
                    onChange={(e) => handleFieldChange(formIndex, field.testName, e.target.value)}
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
                    value={formValue[field.testName] || ''}
                    onChange={(e) => handleFieldChange(formIndex, field.testName, e.target.value)}
                    placeholder={`Enter ${field.testName}`}
                  />
                )}
              </div>
            ))}
          </div>
        ))}

        <center className="buttons">
          <button type="button" className="Next-button" onClick={handleAddMember}>
            Add Member
          </button>
          <button type="button" className="Finish-button">
            Finish
          </button>
          <button type="submit" className="Next-button">
            Next
          </button>
        </center>
      </form>

      <div className="powered-container">
        <p className="powered-by">Powered By Curable</p>
        <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="curable-logo" />
      </div>
    </div>
  );
}

export default FamilyPersonalDetails;
