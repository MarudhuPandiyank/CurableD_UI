import React, { useEffect, useState } from 'react';
import Header1 from './Header1';
import './HomePage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../config';

interface FamilyMedicalParam {
  testName: string;
  subtestName: string;
  valueType: string;
  values: string[];
  selectedValues: string[];
}

interface ApiResponse {
  testMetrics: {
    params: FamilyMedicalParam[];
  };
}

interface PrefillApiResponse {
  familyMetrics: {
    params: FamilyMedicalParam[];
  };
}

const FamilyMedicalDetails: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FamilyMedicalParam[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchFamilyMedicalMetrics = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Token is missing. Please log in again.');
          return;
        }

        const response = await axios.get<ApiResponse>(`${config.appURL}/curable/getMetrics/FAMILY_MEDICAL`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setFormData(response.data.testMetrics.params);
      } catch (error) {
        console.error('Error fetching family medical metrics data:', error);
        setError('Failed to load family medical metrics. Please try again.');
      }
    };

    fetchFamilyMedicalMetrics();
  }, []);

  const handleFieldChange = (index: number, testName: string, value: string) => {
    if (testName.toLowerCase().includes('age at diagnosis')) {
    const numericValue = parseInt(value, 10);
    if (!/^\d*$/.test(value) || numericValue < 1 || numericValue > 100) {
      return;
    }
  }
    const updatedFormValues = [...formValues];
    updatedFormValues[index] = {
      ...updatedFormValues[index],
      [testName]: value,
    };
    setFormValues(updatedFormValues);
  };

  const handleAddMember = () => {
    if (formValues.length > 0) {
      const lastMember = formValues[formValues.length - 1];
      const hasData = Object.values(lastMember).some(value => value && value.trim() !== '');
      if (!hasData) {
        alert('Please fill at least one field before adding another member.');
        return;
      }
    }
    setFormValues((prev) => [...prev, {}]);
    setExpandedIndex(formValues.length);
  };

  const handleToggleExpand = (index: number) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  const handleDeleteMember = (index: number) => {
    const updated = formValues.filter((_, i) => i !== index);
    setFormValues(updated);
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedFormData = formValues.map((formValue) =>
      formData.map((field) => ({
        ...field,
        selectedValues: formValue[field.testName] ? [formValue[field.testName]] : [],
      }))
    );

    const payload = {
      description: 'Family Medical Metrics',
      diseaseTestId: 1,
      familyMedicalMetrics: { params: updatedFormData.flat() },
      familyMetrics: null, 
      eligibilityMetrics: null,
      gender: 'FEMALE',
      genderValid: true,
      hospitalId: 1,
      id: 28,
      medicalMetrics: null,
      name: 'Family Medical Metrics',
      stage: 'FAMILY_MEDICAL',
      testMetrics: null,
      type: 1,
      candidateId: Number(localStorage.getItem('patientId')),
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token is missing. Please log in again.');
        return;
      }

      await axios.post(`${config.appURL}/curable/candidatehistory`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate('/SuccessMessagePRFinal');
    } catch (error) {
      console.error('Error submitting data:', error);
      setError('Failed to submit data. Please try again.');
    }
  };

  const handlePrevClick = () => {
    navigate('/FamilyPersonalDetails');
  };

  const participant = localStorage.getItem('participant');
  const registrationId = localStorage.getItem('registraionId');

  return (
    <div className="container2">
      <Header1 />
      <div className="participant-container">
        <p className="participant-info-text"><strong>Participant: </strong>{participant}</p>
        <p className="participant-info-text"><strong>ID:</strong> {registrationId}</p>
      </div>

      <h1 style={{ color: 'darkblue', fontWeight: 'bold' }}>Family Medical Details</h1>
      <span style={{ marginBottom: '10px' }}>Provide the details if any of the family members has cancer history</span>
      {error && <div className="error-message">{error}</div>}

      <form className="clinic-form" onSubmit={handleSubmit}>
        {formValues.map((formValue, formIndex) => (
          <div
            key={formIndex}
            className="family-member-form"
            style={{ marginBottom: formIndex === formValues.length - 1 ? '30px' : '15px' }}
          >
            <p
              onClick={() => handleToggleExpand(formIndex)}
              style={{
                cursor: 'pointer',
                padding: '10px',
                backgroundColor: '#e3e3e3',
                border: '1px solid #ccc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {formValue['Relation '] || `Relation ${formIndex + 1}`}
              <i
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteMember(formIndex);
                }}
                className="fa-solid fa-trash-can float-end"
              ></i>
            </p>
            {expandedIndex === formIndex && (
              <div className="form-fields">
                {formData.map((field, index) => {
                  const trimmedName = field.testName.trim();
                  const value = formValue[trimmedName] || '';

                  return (
                    <div key={index} className="form-group">
                      <label style={{ color: 'darkblue' }}>{field.testName}:</label>
                      {field.valueType === 'SingleSelect' ? (
                        <select
                          value={value}
                          onChange={(e) => handleFieldChange(formIndex, trimmedName, e.target.value)}
                        >
                          <option value="" disabled>Select {field.testName}</option>
                          {field.values.map((val, i) => (
                            <option key={i} value={val.trim()}>{val.trim()}</option>
                          ))}
                        </select>
                      ) : field.valueType === 'Button' ? (
                        <div className="gender-group">
                          {field.values.map((val, i) => (
                            <button
                              key={i}
                              type="button"
                              className={`gender-btn ${value === val.trim() ? 'active' : ''}`}
                              onClick={() => handleFieldChange(formIndex, trimmedName, val.trim())}
                            >
                              {val.trim()}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleFieldChange(formIndex, trimmedName, e.target.value)}
                          placeholder={`Enter ${field.testName}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        <div className="button-container">
           <button type="button" className="Next-button_familydetails" onClick={handleAddMember}>Add Member</button>
        </div>

        <center className="buttons">
          <button type="button" className="Next-button" onClick={handlePrevClick}>Prev</button>
          <button type="submit" className="Finish-button">Finish</button>
        </center>
        <br/>
        <br/>
      </form>

      <footer className="footer-container-fixed">
        <div className="footer-content">
          <p className="footer-text">Powered By</p>
          <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="footer-logo" />
        </div>
      </footer>
    </div>
  );
};

export default FamilyMedicalDetails;