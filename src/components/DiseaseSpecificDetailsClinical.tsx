import React, { useState } from 'react';
import Header1 from './Header1';
import './HomePage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Select, { MultiValue } from 'react-select';
import config from '../config'; 

// Define types for API response
interface Condition {
  enabledField: string;
  triggerValue: string;
}

interface FamilyMetricsParam {
  testName: string;
  subtestName: string;
  conditions?: Condition[];
  valueType: string;
  values: string[];
  selectedValues: string[];
}

interface SelectOption {
  value: string;
  label: string;
}

const DiseaseSpecificDetails: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | MultiValue<SelectOption>>>({});
  const [formData, setFormData] = useState<FamilyMetricsParam[]>([
    {
      testName: 'Cervical Clinical Examination',
      subtestName: 'NONE',
      valueType: 'SingleSelect',
      values: ['Yes', 'No'],
      selectedValues: [],
    },
    {
      testName: 'Colposcopy',
      subtestName: 'NONE',
      valueType: 'SingleSelect',
      values: ['Satisfactory', 'Unsatisfactory'],
      conditions: [
        {
          enabledField: 'Image',
          triggerValue: 'Satisfactory',
        },
      ],
      selectedValues: [],
    },
    {
      testName: 'Image',
      subtestName: 'Image',
      valueType: 'MultiSelect',
      values: [
        'Normal',
        'Squamous metaplasia',
        'Inflammatory',
        'CIN I',
        'CINII',
        'CIN III',
        'Ca in situ',
        'Invasive cancer',
        'Others',
      ],
      selectedValues: [],
    },
    {
      testName: 'Colpo Guided Biopsy',
      subtestName: 'NONE',
      valueType: 'SingleSelect',
      values: ['Yes', 'No'],
      conditions: [
        {
          enabledField: 'Colpo Guided Biopsy Image',
          triggerValue: 'Yes',
        },
      ],
      selectedValues: [],
    },
    {
      testName: 'Colpo Guided Biopsy',
      subtestName: 'Report Date',
      valueType: 'Input',
      values: [],
      selectedValues: [],
    },
    {
      testName: 'Colpo Guided Biopsy Image',
      subtestName: 'Image',
      valueType: 'MultiSelect',
      values: [
        'Normal',
        'Squamous metaplasia',
        'Inflammatory',
        'CIN I',
        'CINII',
        'CIN III',
        'Ca in situ',
        'Glandular dysplasia',
        'Squamous cell carcinoma',
        'Adenocarcinoma',
        'Inconclusive',
      ],
      selectedValues: [],
    },
    {
      testName: 'Colpo Guided Biopsy Treatment Plan',
      subtestName: 'Colpo Guided Biopsy',
      valueType: 'SingleSelect',
      values: [
        'Observation & Follow up',
        'Cone Biopsy',
        'Hysterectomy',
        'Cryotherapy',
        'Leep',
        'Cancer management',
        'Thermocoagulation',
        'Others',
      ],
      selectedValues: [],
    },
  ]);

  const handleInputChange = (testName: string, value: string) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [testName]: value,
    }));
  };

  const handleMultiSelectChange = (
    testName: string,
    selected: MultiValue<SelectOption> | null
  ) => {
    if (selected !== null) {
      setFormValues((prevValues) => ({
        ...prevValues,
        [testName]: selected,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedFormData = formData.map((field) => {
      const selectedValue = formValues[field.testName];
      return {
        ...field,
        selectedValues:
          field.valueType === 'MultiSelect' && selectedValue
            ? (selectedValue as MultiValue<SelectOption>).map((option) => option.value)
            : field.valueType === 'SingleSelect' || field.valueType === 'Input'
            ? [selectedValue as string]
            : [],
      };
    });

    // ... (rest of handleSubmit function remains the same)
  };

  return (
    <div className="container2">
      <Header1 />
      <div className="participant-container">
        <p className="participant-info-text"><strong>Participant:</strong> {localStorage.getItem('ptName')}</p>
      <p className="participant-info-text"><strong>ID:</strong> {localStorage.getItem('registrationId')}</p>
            </div>

      {error && <div className="error-message">{error}</div>}

      <form className="clinic-form" onSubmit={handleSubmit}>
        <p>Disease Specific Details</p>

        {formData.map((field, index) => (
          <div key={index} className="form-group">
            <label style={{ color: 'darkblue' }}>{field.testName}:</label>

            {field.valueType === 'SingleSelect' ? (
              <select
                value={formValues[field.testName] as string || ''}
                onChange={(e) => handleInputChange(field.testName, e.target.value)}
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
            ) : field.valueType === 'MultiSelect' ? (
              <Select
                isMulti
                name={field.testName}
                options={field.values.map((value) => ({ value, label: value }))}
                value={formValues[field.testName] as MultiValue<SelectOption> || []}
                onChange={(selectedOptions) =>
                  handleMultiSelectChange(field.testName, selectedOptions)
                }
              />
            ) : (
              <input
                type="text"
                value={formValues[field.testName] as string || ''}
                onChange={(e) => handleInputChange(field.testName, e.target.value)}
                placeholder={`Enter ${field.testName}`}
              />
            )}

            {field.conditions?.map((condition) =>
              formValues[field.testName] === condition.triggerValue ? (
                <div key={condition.enabledField}>
                  <label>{condition.enabledField}:</label>
                  <select
                    value={formValues[condition.enabledField] as string || ''}
                    onChange={(e) => handleInputChange(condition.enabledField, e.target.value)}
                  >
                    <option value="" disabled>
                      Select {condition.enabledField}
                    </option>
                    {formData
                      .find((data) => data.testName === condition.enabledField)
                      ?.values.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                  </select>
                </div>
              ) : null
            )}
          </div>
        ))}

        <center className="buttons">
          <button type="submit" className="Finish-button">
            Finish
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
};

export default DiseaseSpecificDetails;