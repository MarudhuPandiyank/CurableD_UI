import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header1 from './Header1';
import './HomePage.css';
import axios from 'axios';
import './DiseaseSpecificDetailsClinic.css';
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
  id: number;
  testMetrics: {
    params: FamilyMetricsParam[];
  };
}

function DiseaseSpecificDetailsClinic() {
  const [formData, setFormData] = useState<FamilyMetricsParam[]>([]); // State to store dynamic form fields
  const [error, setError] = useState<string | null>(null); // State to store error message
  const [formValues, setFormValues] = useState<Record<string, string>>({}); // State to store the form values dynamically
  const [showModal, setShowModal] = useState(false); // Modal visibility
  const [unfilledFields, setUnfilledFields] = useState<string[]>([]); // Non-mandatory fields that are not filled
const [tag, setTag] = useState<string>('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDiseaseTestMaster = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
        const selectedStage = localStorage.getItem('selectedStage');
        const diseaseTestIds = localStorage.getItem('diseaseTestIds');

        if (!token) {
          setError('Token is missing. Please log in again.');
          return;
        }

        const response = await axios.get<ApiResponse>(
          `http://13.234.4.214:8015/api/curable/getMetricsById/${diseaseTestIds}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        localStorage.setItem('diseaseTestMasterId', response.data.id.toString());

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

  const handleFinishClick = () => {
    // Check for unfilled fields
    const unfilled = formData
      .filter((field) => !formValues[field.testName]) // Find fields with no value
      .map((field) => field.testName);

    setUnfilledFields(unfilled);

    if (unfilled.length > 0) {
      setShowModal(true); // Show modal if there are unfilled fields
    } else {
      // No unfilled fields, proceed with registration
      handleConfirmFinish();
    }
  };

  const handleConfirmFinish = () => {
    setShowModal(false);
    console.log('Proceeding with registration...');
    navigate('/ParticipantDetails');
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

    const diseaseTestMasterId = localStorage.getItem('diseaseTestMasterId');
    const candidateId = localStorage.getItem('candidateId');
    const payload = {
      diseaseTestMasterId: Number(diseaseTestMasterId),
      candidateId: Number(candidateId),
      description: 'Eligibility Metrics',
      diseaseTestId: 1,
      testMetrics: {
        params: updatedFormData,
      },
      familyMedicalMetrics: null,
      familyMetrics: null,
      gender: 'FEMALE', // Adjust dynamically if necessary
      genderValid: true,
      hospitalId: 1,
      id: 27,
      medicalMetrics: null,
      name: 'Eligibility Metrics',
      stage: localStorage.getItem('selectedStage'),
      type: 1,
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
        <p>Participant: {patientId}</p>
        <p>ID: {patientName}</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form className="clinic-form" onSubmit={handleSubmit}>
        <p>Disease Specific Details</p>

        {formData.map((field, index) => (
          <div key={index} className="form-group">
            <label style={{ color: 'darkblue' }}>{field.testName}*:</label>

            {field.valueType === 'SingleSelect' ? (
              <select
                id={field.testName.toLowerCase().replace(' ', '-')}
                name={field.testName.toLowerCase().replace(' ', '-')}
                value={formValues[field.testName] || ''}
                onChange={(e) => handleSelectChange(field.testName, e.target.value)}
              >
                <option value="" disabled>
                  Select {field.testName}
                </option>
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
          <button type="button" className="Finish-button" onClick={handleFinishClick}>
            Finish
          </button>
          <button type="submit" className="Next-button">
            Next
          </button>
        </center>
      </form>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>              The following non-mandatory details are not filled. Are you sure you want to finish registration?
            </h2>
          

          

            <div className="modal-buttons">
              <button className="Finish-button">Close</button>
              <button className="Next-button" onClick={handleSubmit}>Save</button>
            </div>
          </div>
        </div>
      )}


      <div className="powered-container">
        <p className="powered-by">Powered By Curable</p>
        <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="curable-logo" />
      </div>
    </div>
  );
}

export default DiseaseSpecificDetailsClinic;
