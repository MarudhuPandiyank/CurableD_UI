import React, { useState, useEffect } from 'react';
import Select, { MultiValue } from 'react-select';
import './HomePage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface SelectOption {
  value: string;
  label: string;
}

interface Condition {
  enabledField: string;
  triggerValue: string;
}

interface FamilyMetricsParam {
  testName: string;
  subtestName?: string;
  valueType: string;
  values: string[];
  condition?: Condition[];
  selectedValues: (string | SelectOption | SelectOption[])[];
}

interface ApiResponse {
  testMetrics: {
    params: FamilyMetricsParam[];
  };
}

const DynamicScreen: React.FC = () => {
  const [formData, setFormData] = useState<FamilyMetricsParam[]>([]);
  const [selectedValues, setSelectedValues] = useState<{ [key: string]: string | MultiValue<SelectOption> }>({});
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDiseaseTestMaster = async () => {
      try {
        const token = localStorage.getItem('token');
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

        setFormData(response.data.testMetrics.params);
        console.log('Disease Test Master Data:', response.data);
      } catch (error) {
        console.error('Error fetching disease test master data:', error);
        setError('Failed to load disease test data. Please try again.');
      }
    };

    fetchDiseaseTestMaster();
  }, []);

  const handleChange = (fieldName: string, value: string | MultiValue<SelectOption>) => {
    setSelectedValues((prevState) => ({
      ...prevState,
      [fieldName]: value,
    }));

    // Update the selected values in formData
    setFormData((prevFormData) =>
      prevFormData.map((field) =>
        field.testName === fieldName
          ? {
              ...field,
              selectedValues: Array.isArray(value)
                ? value.map((v) => (typeof v === 'object' ? v.value : v))
                : [value],
            }
          : field
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      params: formData.map((field) => ({
        testName: field.testName,
        subtestName: field.subtestName,
        selectedValues: field.selectedValues,
      })),
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
      navigate('/SuccessMessageScreeningFInal');
    } catch (error) {
      console.error('Error submitting data:', error);
      setError('Failed to submit data. Please try again.');
    }
  };

  return (
    <div className="container2">
      <p>Disease Specific Details</p>
      <div className="participant-container">
        <p>Participant: {localStorage.getItem('ptName')}</p>
        <p>ID: {localStorage.getItem('registrationId')}</p>
      </div>

      <form className="clinic-form" onSubmit={handleSubmit}>
        {formData.map((field) => {
          if (field.valueType === 'SingleSelect') {
            return (
              <div key={field.testName}>
                <label>{field.testName}:</label>
                <select
                  value={(selectedValues[field.testName] as string) || ''}
                  onChange={(e) => handleChange(field.testName, e.target.value)}
                >
                  <option value="">Select</option>
                  {field.values.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>

                {/* Render dynamic fields based on conditions */}
                {field.condition?.map((condition) => (
                  selectedValues[field.testName] === condition.triggerValue && (
                    <div key={condition.enabledField}>
                      <label>{condition.enabledField}:</label>
                      <Select
                        isMulti
                        name={condition.enabledField}
                        value={(selectedValues[condition.enabledField] as MultiValue<SelectOption>) || []}
                        options={
                          formData
                            .find((data) => data.testName === condition.enabledField)
                            ?.values.map((value) => ({
                              value,
                              label: value,
                            })) || []
                        }
                        onChange={(selectedOptions) =>
                          handleChange(condition.enabledField, selectedOptions)
                        }
                        placeholder="Select conditions"
                      />
                    </div>
                  )
                ))}
              </div>
            );
          }
          if (field.valueType === 'Input') {
            return (
              <div key={field.testName}>
                <label>{field.testName}:</label>
                <input
                  type="text"
                  value={(selectedValues[field.testName] as string) || ''}
                  onChange={(e) => handleChange(field.testName, e.target.value)}
                />
              </div>
            );
          }
          return null;
        })}
        <center className="buttons">
          <button type="submit" className="Finish-button">
            Finish
          </button>
        </center>
      </form>
      <div className="powered-container">
        <p className="powered-by">Powered By Curable</p>
        <img
          src="/assets/Curable logo - rectangle with black text.png"
          alt="Curable Logo"
          className="curable-logo"
        />
      </div>
    </div>
  );
};

export default DynamicScreen;
