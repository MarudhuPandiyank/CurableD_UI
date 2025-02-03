import React, { useEffect, useState } from 'react';
import Header1 from './Header1';
import './HomePage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../config'; 
import './NewScreeningEnrollment.css';
import './Common.css';

interface FamilyMetricsParam {
  testName: string;
  subtestName: string;
  condition: string | null;
  valueType: string;
  values: string[];
  selectedValues: string[];
}

interface ApiResponse {
  eligibilityMetrics: {
    params: FamilyMetricsParam[];
  };
}

function DiseaseSpecificDetails() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<FamilyMetricsParam[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const participantValue = localStorage.getItem('participant');
  const gender = participantValue?.split('/')[1];

  useEffect(() => {
    const fetchDiseaseTestMaster = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Token is missing. Please log in again.');
          return;
        }

        const response = await axios.get<ApiResponse>(`${config.appURL}/curable/getMetricsByGender/ELIGIBILE/${gender}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFormData(response.data.eligibilityMetrics.params);
        console.log('Disease Test Master Data:', response.data);
      } catch (error) {
        console.error('Error fetching disease test master data:', error);
        setError('Failed to load disease test data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDiseaseTestMaster();
  }, [gender]);

  const handleInputChange = (testName: string, value: string) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [testName]: value,
    }));
  };

  const openModal = () => {
    if (Object.keys(formValues).length < formData.length) {
      setValidationError('Please fill in all mandatory fields.');
    } else {
      setValidationError(null);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSelectChange = (testName: string, value: string) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [testName]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent, navigateTo: string) => {
    e.preventDefault();

    const updatedFormData = formData.map((field) => {
      const selectedValue = formValues[field.testName] ? [formValues[field.testName]] : [];
      return {
        ...field,
        selectedValues: selectedValue,
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
      gender: "FEMALE",
      genderValid: true,
      hospitalId: 1,
      id: 27,
      medicalMetrics: null,
      name: "Eligibility Metrics",
      stage: "ELIGIBILE",
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

      await axios.post(`${config.appURL}/curable/candidatehistory`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Data submitted successfully!');
      navigate(navigateTo);
    } catch (error) {
      console.error('Error submitting data:', error);
      setError('Failed to submit data. Please try again.');
    }
  };

  const patientId = localStorage.getItem('patientId');
  const registraionId = localStorage.getItem('registraionId');

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container21">
      <Header1 />
     
      <div className="participant-container">
      <p className="participant-info-text"><strong>Participant:</strong> {participantValue}</p>
      <p className="participant-info-text"><strong>ID:</strong> {registraionId}</p>
      
      </div>
      <h1 style={{ color: 'darkblue' }}>Disease Specific Details</h1>
      {error && <div className="error-message">{error}</div>}
      {validationError && <div className="validation-error" style={{ color: 'red' }}>{validationError}</div>}

      <form className="clinic-form" onSubmit={(e) => handleSubmit(e, '/ParticipantDetails')}>
        {formData.map((field, index) => (
          <div key={index} className="form-item">
            <label style={{ color: 'darkblue' }}>{field.testName}*:</label>
            {field.valueType === 'SingleSelect' ? (
              <select
                id={field.testName.toLowerCase().replace(' ', '-')}
                name={field.testName.toLowerCase().replace(' ', '-')}
                value={formValues[field.testName] || ''}
                required
                onChange={(e) => handleSelectChange(field.testName, e.target.value)}
              >
                <option value="" disabled>Select {field.testName}</option>
                {field.values.map((value: string, idx: number) => (
                  <option key={idx} value={value}>{value}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                id={field.testName.toLowerCase().replace(' ', '-')}
                name={field.testName.toLowerCase().replace(' ', '-')}
                value={formValues[field.testName] || ''}
                required
                onChange={(e) => handleInputChange(field.testName, e.target.value)}
                placeholder={`Enter ${field.testName}`}
              />
            )}
          </div>
        ))}

        {showModal && (
          <div className="custom-modal">
            <div className="custom-modal-content">
              <h1 style={{ marginTop: '130px', textAlign: 'center', color: 'darkblue' }}>
                Non-mandatory fields are not provided. Are you sure you want to finish registration?
              </h1>
              <div className="modal-buttons">
                <button className="Finish-button" type="button" onClick={(e) => handleSubmit(e, '/SuccessMessagePRFinal')}>Yes</button>
                <button className="Next-button" type="button" onClick={closeModal}>No</button>
              </div>
            </div>
          </div>
        )}

        <center className="buttons">
        <button type="button" className="Finish-button" onClick={openModal}>Prev</button>
          <button type="button" className="Next-button" onClick={openModal}>Finish</button>
          <button type="submit" className="Finish-button" onClick={(e) => {
            if (Object.keys(formValues).length < formData.length) {
              setValidationError('Please fill in all mandatory fields.');
              e.preventDefault();
            } else {
              setValidationError(null);
            }
          }}>Next</button>
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

export default DiseaseSpecificDetails;
