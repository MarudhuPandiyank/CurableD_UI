import React, { useEffect, useState } from 'react'; 
import Header1 from './Header1';
import './HomePage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../config';

interface FamilyMedicalParam {
  testName: string;
  subtestName: string;
  condition: string | null;
  valueType: string;
  values: string[];
  selectedValues: string[];
}

interface ApiResponse {
  testMetrics: {
    params: FamilyMedicalParam[];
  };
}

const FamilyMedicalDetails: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FamilyMedicalParam[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>[]>([{}]);
  const [expandedIndex, setExpandedIndex] = useState<number>(0); // State to track expanded member

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
        console.log('Family Medical Metrics Data:', response.data);
      } catch (error) {
        console.error('Error fetching family medical metrics data:', error);
        setError('Failed to load family medical metrics. Please try again.');
      }
    };

    fetchFamilyMedicalMetrics();
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
    setFormValues((prevValues) => [...prevValues, {}]);
    setExpandedIndex(formValues.length); // Set the new member as expanded
  };

  const handleToggleExpand = (index: number) => {
    setExpandedIndex(index); // Toggle the expanded state
  };

  const handleDeleteMember = (index: number) => {
    const updatedFormValues = formValues.filter((_, i) => i !== index);
    setFormValues(updatedFormValues);

    if (expandedIndex === index) {
      setExpandedIndex(0); // Collapse if the deleted member was expanded
    }
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
      familyMetrics: null,
      familyMedicalMetrics: { params: updatedFormData.flat() },
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

      console.log('Data submitted successfully!');
      navigate('/SuccessMessagePRFinal');
    } catch (error) {
      console.error('Error submitting data:', error);
      setError('Failed to submit data. Please try again.');
    }
  };

  const patientId = localStorage.getItem('patientId');
  const patientName = localStorage.getItem('patientName');
  const participant = localStorage.getItem('participant');
  const registrationId = localStorage.getItem('registrationId');
  if (!patientId || !patientName) {
    return <div className="error-message">Missing patient information. Please log in again.</div>;
  }

  return (
    <div className="container2">
      <Header1 />
      <p style={{ color: 'darkblue', fontWeight: 'bold' }}>Family Medical Details</p>
      <div className="participant-container">
        <p>Participant: {participant}</p>
        <p>ID: {registrationId}</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form className="clinic-form" onSubmit={handleSubmit}>
        {formValues.map((formValue, formIndex) => (
          <div key={formIndex} className="family-member-form">
            <p onClick={() => handleToggleExpand(formIndex)} style={{
                    cursor: 'pointer',
                    padding: '10px',
                    backgroundColor: '#e3e3e3',
                    border: '1px solid #ccc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
             {formValue.relationName || `Relation ${formIndex + 1}`}
              <i onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMember(formIndex);
                  }} className="fa-solid fa-trash-can float-end"></i>
            
            </p>
            {expandedIndex === formIndex && (
              <div className="form-fields">
                {formData.map((field, index) => (
                  <div key={index} className="form-group">
                    <label style={{ color: 'darkblue' }}>{field.testName}:</label>

                    {field.valueType === 'SingleSelect' ? (
                      <select
                        id={field.testName.toLowerCase().replace(' ', '-')}
                        name={field.testName.toLowerCase().replace(' ', '-')}
                        value={formValue[field.testName] || ''}
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
                        value={formValue[field.testName] || ''}
                        onChange={(e) => handleFieldChange(formIndex, field.testName, e.target.value)}
                        placeholder={`Enter ${field.testName}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            <button type="button" className="Next-button" onClick={handleAddMember}>
            Add Member
          </button>
          </div>
        ))}

        <center className="buttons">
          
          <button type="submit" className="Next-button">
            Finish
          </button>
        </center>
      </form>
      

      <div className="powered-container">
        <p className="powered-by">Powered By Curable</p>
        <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="curable-logo" />
      </div>
    </div>
  );
};

export default FamilyMedicalDetails;
