import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FamilyPersonalDetails.css';
import { useNavigate } from 'react-router-dom';
import Header1 from './Header1';
import config from '../config';

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

interface PrefillApiResponse {
  familyMetrics: {
    params: FamilyMetricsParam[];
  };
}

function FamilyPersonalDetails() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FamilyMetricsParam[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>[]>([]);
  const [expandedMemberIndex, setExpandedMemberIndex] = useState<number | null>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFamilyPersonalMetrics = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Token is missing. Please log in again.');
          return;
        }

        const response = await axios.get<ApiResponse>(`${config.appURL}/curable/getMetrics/FAMILY_PERSONAL`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData(response.data.familyMetrics.params);

        const prefillResponse = await axios.post<PrefillApiResponse>(`${config.appURL}/curable/candidatehistoryForPrefil`, {
          candidateId: localStorage.getItem('patientId'),
          type: 4
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (prefillResponse.data) {
          const params = prefillResponse.data.familyMetrics.params;
          const fieldsPerMember = response.data.familyMetrics.params.length;
          const prefilledFormValues: Record<string, string>[] = [];

          for (let i = 0; i < params.length; i += fieldsPerMember) {
            const chunk = params.slice(i, i + fieldsPerMember);
            const memberValues: Record<string, string> = {};
            chunk.forEach((param) => {
              memberValues[param.testName.trim()] = param.selectedValues[0]?.trim() || '';
            });
            prefilledFormValues.push(memberValues);
          }

          setFormValues(prefilledFormValues);
        }

      } catch (error) {
        console.error('Error fetching family personal metrics:', error);
        setError('Failed to load family personal metrics.');
      }
    };

    fetchFamilyPersonalMetrics();
  }, []);

 const handleFieldChange = (index: number, testName: string, value: string) => {
    const trimmedName = testName.trim();

    if (trimmedName.toLowerCase().includes('monthlyincome')) {
      if (value === '' || /^\d{1,6}$/.test(value)) {
        const parsed = parseInt(value, 10);
        if (!isNaN(parsed) && parsed > 999999) return;
        if (/^0\d+/.test(value)) return; // prevent leading zeros
      } else {
        return;
      }
    }
    const updatedFormValues = [...formValues];
    updatedFormValues[index] = {
      ...updatedFormValues[index],
      [trimmedName]: value,
    };
    setFormValues(updatedFormValues);
  };

  const handleAddMember = () => {
    if (formValues.length === 0) {
      setFormValues([{}]);
      setExpandedMemberIndex(0);
      return;
    }

    const lastMember = formValues[formValues.length - 1];
    const hasData = Object.values(lastMember).some(value => value.trim() !== "");

    if (!hasData) {
      alert("Please fill at least one field before adding another member.");
      return;
    }

    setFormValues((prev) => [...prev, {}]);
    setExpandedMemberIndex(formValues.length);
  };

  const handleDeleteMember = (index: number) => {
    setFormValues((prev) => prev.filter((_, i) => i !== index));
    if (expandedMemberIndex === index) setExpandedMemberIndex(null);
  };

  const buildPayload = () => {
    return {
      description: 'Family Personal Metrics',
      diseaseTestId: 1,
      familyMetrics: {
        params: formValues.map((formValue) =>
          formData.map((field) => ({
            ...field,
            selectedValues: formValue[field.testName.trim()] ? [formValue[field.testName.trim()]] : [],
          }))
        ).flat(),
      },
      familyMedicalMetrics: null,
      eligibilityMetrics: null,
      gender: 'FEMALE',
      genderValid: true,
      hospitalId: 1,
      id: 27,
      medicalMetrics: null,
      name: 'Family Personal Metrics',
      stage: 'FAMILY_PERSONAL',
      testMetrics: null,
      type: 1,
      candidateId: Number(localStorage.getItem('patientId')),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token is missing. Please log in again.');
        return;
      }
      await axios.post(`${config.appURL}/curable/candidatehistory`, buildPayload(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Data submitted successfully!');
      navigate('/FamilyMedicalDetails');
    } catch (error) {
      console.error('Submit Error:', error);
      setError('Failed to submit data.');
    }
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token is missing. Please log in again.');
        return;
      }
      await axios.post(`${config.appURL}/curable/candidatehistory`, buildPayload(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Data submitted successfully!');
      navigate('/SuccessMessagePRFinal');
    } catch (error) {
      console.error('Finish Error:', error);
      setError('Failed to submit data.');
    }
  };

  const handlePrevClick = () => {
    navigate('/MedicalomenHealthDetails');
  };

  const patientId = localStorage.getItem('patientId');
  const patientName = localStorage.getItem('patientName');
  const participant = localStorage.getItem('participant');
  const registraionId = localStorage.getItem('registraionId');

  if (!patientId || !patientName) {
    return <div className="error-message">Missing patient information. Please log in again.</div>;
  }

  return (
    <div className="container3">
      <Header1 />
      <div className="participant-container">
        <p className="participant-info-text"><strong>Participant: </strong> {participant}</p>
        <p className="participant-info-text"><strong>ID:</strong> {registraionId}</p>
      </div>

      <h1 style={{ color: 'darkblue', fontWeight: 'bold' }}>Family Personal Details</h1>
      {error && <div className="error-message">{error}</div>}

      <form className="clinic-form" onSubmit={handleSubmit}>
        {formValues.length > 0 && formValues.map((_, formIndex) => (
          <div key={formIndex} className="family-member-row">
            {expandedMemberIndex !== formIndex ? (
              <div
                className="member-name"
                onClick={() => setExpandedMemberIndex(formIndex)}
                style={{
                  cursor: 'pointer',
                  padding: '10px',
                  backgroundColor: '#f4f4f4',
                  border: '1px solid #ccc',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                marginBottom: formIndex === formValues.length - 1 ? '20px' : '0px',

                }}
              >
                <span>{formValues[formIndex][formData[0]?.testName.trim()] || 'Member'}</span>
                <i onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteMember(formIndex);
                }} className="fa-solid fa-trash-can float-end"></i>
              </div>
            ) : (
              <div className="family-member-form">
                <div
                  className="member-header"
                  onClick={() => setExpandedMemberIndex(null)}
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
                  <span>{formValues[formIndex][formData[0]?.testName.trim()] || 'Member'} (Click to collapse)</span>
                  <i onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMember(formIndex);
                  }} className="fa-solid fa-trash-can float-end"></i>
                </div>

                {formData.map((field, index) => {
                  const trimmedName = field.testName.trim();
                  const value = formValues[formIndex][trimmedName] || '';
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
                          {field.values.map((val, i) => {
                            const trimmedVal = val.trim();
                            return (
                              <button
                                key={i}
                                type="button"
                                className={`gender-btn ${value === trimmedVal ? 'active' : ''}`}
                                onClick={() => handleFieldChange(formIndex, trimmedName, trimmedVal)}
                              >
                                {trimmedVal}
                              </button>
                            );
                          })}
                        </div>
                      ) : trimmedName.toLowerCase().includes('monthlyincome') ? (
                        <input
                          type="text"
                          inputMode="numeric"
                          value={value}
                          placeholder="Enter Monthly Income"
                          onChange={(e) => handleFieldChange(formIndex, trimmedName, e.target.value)}
                        />
                      ) : (
                        <input
                          type="text"
                          value={value}
                          placeholder={`Enter ${field.testName}`}
                          onChange={(e) => handleFieldChange(formIndex, trimmedName, e.target.value)}
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
          <button type="submit" className="Finish-button" onClick={handlePrevClick}>Prev</button>
          <button type="button" className="Next-button" onClick={handleFinish}>Finish</button>
          <button type="submit" className="Finish-button">Next</button>
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
}

export default FamilyPersonalDetails;
