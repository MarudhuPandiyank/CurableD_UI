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
  const [formValues, setFormValues] = useState<Record<string, string>[]>([{}]);
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (prefillResponse.data) {
          const prefilledValues: Record<string, string> = {};
          prefillResponse.data.familyMetrics.params.forEach((param: FamilyMetricsParam) => {
            prefilledValues[param.testName] = param.selectedValues[0];
          });
          setFormValues([prefilledValues]);
        }

      } catch (error) {
        console.error('Error fetching family personal metrics:', error);
        setError('Failed to load family personal metrics.');
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
    setExpandedMemberIndex(null);
    setFormValues((prevValues) => [...prevValues, {}]);
    setExpandedMemberIndex(formValues.length);
  };

  const handleDeleteMember = (index: number) => {
    setFormValues((prevValues) => prevValues.filter((_, i) => i !== index));
    if (expandedMemberIndex === index) setExpandedMemberIndex(null);
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
      description: 'Family Personal Metrics',
      diseaseTestId: 1,
      familyMetrics: { params: updatedFormData.flat() },
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

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token is missing. Please log in again.');
        return;
      }

      await axios.post(`${config.appURL}/curable/candidatehistory`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Data submitted successfully!');
      navigate('/FamilyMedicalDetails');
    } catch (error) {
      console.error('Error submitting data:', error);
      setError('Failed to submit data.');
    }
  };

  const patientId = localStorage.getItem('patientId');
  const patientName = localStorage.getItem('patientName');
  const participant = localStorage.getItem('participant');
  const registraionId = localStorage.getItem('registraionId');

  if (!patientId || !patientName) {
    return <div className="error-message">Missing patient information. Please log in again.</div>;
  }

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedFormData = formValues.map((formValue) =>
      formData.map((field) => ({
        ...field,
        selectedValues: formValue[field.testName] ? [formValue[field.testName]] : [],
      }))
    );

    const payload = {
      description: 'Family Personal Metrics',
      diseaseTestId: 1,
      familyMetrics: { params: updatedFormData.flat() },
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

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token is missing. Please log in again.');
        return;
      }

      await axios.post(`${config.appURL}/curable/candidatehistory`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Data submitted successfully!');
      navigate('/SuccessMessagePRFinal');
    } catch (error) {
      console.error('Error submitting data:', error);
      setError('Failed to submit data.'); }
    };
    const handlePrevClick = () => {
      navigate('/MedicalomenHealthDetails');
    };
  return (
    <div >

      <Header1 />

      <div className="participant-container">
        <p>Participant: {participant}</p>
        <p>ID: {registraionId}</p>
      </div>
      <p style={{ color: 'darkblue', fontWeight: 'bold', }}>Family Personal Details</p>

      {error && <div className="error-message">{error}</div>}

      <form className="clinic-form" onSubmit={handleSubmit}>
        {/* <p>Family Personal Details</p> */}

        {formValues.map((_, formIndex) => (
          <div key={formIndex} className="family-member-row">
            {/* Collapsed View */}
            {expandedMemberIndex !== formIndex && (
              <div
                className="member-name"
                style={{
                  cursor: 'pointer',
                  padding: '10px',
                  backgroundColor: '#f4f4f4',
                  border: '1px solid #ccc',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onClick={() => setExpandedMemberIndex(formIndex)}
              >
                 {/* <span>Member {formIndex + 1} </span> */}
                <span>{formValues[formIndex][formData[0].testName]? formValues[formIndex][formData[0].testName]:"Member"}</span>
                
                <i onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteMember(formIndex);
                }} className="fa-solid fa-trash-can float-end"></i>
               
              </div>
            )}

            {/* Expanded View */}
            {expandedMemberIndex === formIndex && (
              <div className="family-member-form">
                <div
                  className="member-header"
                  style={{
                    cursor: 'pointer',
                    padding: '10px',
                    backgroundColor: '#e3e3e3',
                    border: '1px solid #ccc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onClick={() => setExpandedMemberIndex(null)}
                >
                  {/* <span>Member {formIndex + 1} (Click to collapse)</span> */}
                  <span>{formValues[formIndex][formData[0]?.testName]? formValues[formIndex][formData[0].testName]+" Click to collapse":"Member Click to collapse"}</span>
                    <i onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMember(formIndex);
                  }} className="fa-solid fa-trash-can float-end"></i>
                 
                </div>

                {formData.map((field, index) => (
                  <div key={index} className="form-group">
                    <label style={{ color: 'darkblue' }}>{field.testName}:</label>
                    {field.valueType === 'SingleSelect' ? (
                      <select
                        id={field.testName.toLowerCase().replace(' ', '-')}
                        name={field.testName.toLowerCase().replace(' ', '-')}
                        value={formValues[formIndex][field.testName] || ''}
                        onChange={(e) => handleFieldChange(formIndex, field.testName, e.target.value)}
                      >
                        <option value="" disabled>
                          Select {field.testName}
                        </option>
                        {field.values.map((value, idx) => (
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
                        value={formValues[formIndex][field.testName] || ''}
                        onChange={(e) => handleFieldChange(formIndex, field.testName, e.target.value)}
                        placeholder={`Enter ${field.testName}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
           
          </div>
        ))}
         <div className="button-container">
 <button type="button" className="Next-button" onClick={handleAddMember}>
            Add Member
          </button>    </div>
        <center className="buttons">
        <button type="submit" className="Next-button" onClick={handlePrevClick}>
            Prev
          </button>
          <button type="button" className="Finish-button" onClick={handleFinish}>
            Finish
          </button>
          <button type="submit" className="Next-button">
            Next
          </button>
        </center>
      </form>
      <footer className="footer-container">
        <div className="footer-content">
          <p className="footer-text">Powered By Curable</p>
          <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="footer-logo" />
        </div>
      </footer>
    </div>
  );
}

export default FamilyPersonalDetails;
