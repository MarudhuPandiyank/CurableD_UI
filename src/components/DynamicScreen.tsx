import React, { useState, useEffect } from 'react';
import Select, { MultiValue } from 'react-select';
import axios from 'axios';

interface SelectOption {
  value: string;
  label: string;
}

interface Condition {
  enabledField: string;
  triggerValue: string;
}

interface Field {
  testName: string;
  subtestName?: string;
  valueType: string;
  values: string[];
  conditions?: Condition[];
  selectedValues: [];
}

interface ApiResponse {
  testMetrics: {
    params: Field[];
  };
}

const DynamicScreen: React.FC = () => {
  const [formData, setFormData] = useState<Field[]>([]);
  const [selectedValues, setSelectedValues] = useState<{ [key: string]: string | MultiValue<SelectOption> }>({});
  const [error, setError] = useState<string | null>(null);

  // Example JSON data (you will replace this with the actual API response)
  const jsonData: Field[] = [
    
    {
      testName: 'Colposcopy',
      subtestName: 'NONE',
      valueType: 'SingleSelect',
      values: ['Satisfactory', 'Unsatisfactory'],
      conditions: [
        {
          enabledField: 'Image',
          triggerValue: 'Satisfactory',
        },{
          enabledField: 'Cervical Clinical Examination',
          triggerValue: 'Satisfactory',
        },
      ],
      selectedValues: [],
    },{
      testName: 'Cervical Clinical Examination',
      subtestName: 'NONE',
      valueType: 'SingleSelect',
      values: ['Yes', 'No'],
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
        'CIN II',
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
      testName: 'Colpo Guided Biopsy Image',
      subtestName: 'Image',
      valueType: 'MultiSelect',
      values: [
        'Normal',
        'Squamous metaplasia',
        'Inflammatory',
        'CIN I',
        'CIN II',
        'CIN III',
        'Ca in situ',
        'Glandular dysplasia',
        'Squamous cell carcinoma',
        'Adenocarcinoma',
        'Inconclusive',
      ],
      selectedValues: [],
    },
  ];

  useEffect(() => {
    // Assuming you're fetching this data from an API or another source
    setFormData(jsonData);
  }, []);

  const handleChange = (fieldName: string, value: string | MultiValue<SelectOption>) => {
    setSelectedValues((prevState) => ({
      ...prevState,
      [fieldName]: value,
    }));
  };

  return (
    <form>
      {formData.map((field) => {
        if (field.valueType === 'SingleSelect') {
          return (
            <div key={field.testName}>
              <label>{field.testName}:</label>
              <select
                value={selectedValues[field.testName] as string || ''}
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
              {field.conditions?.map((condition) => (
                selectedValues[field.testName] === condition.triggerValue && (
                  <div key={condition.enabledField}>
                    <label>{condition.enabledField}:</label>
                    <Select
                      isMulti
                      name={condition.enabledField}
                      value={selectedValues[condition.enabledField] as MultiValue<SelectOption> || []}
                      options={
                        jsonData
                          .find((data) => data.testName === condition.enabledField)
                          ?.values.map((value) => ({
                            value,
                            label: value,
                          })) || [] // Default to empty array if no options found
                      }
                      onChange={(selectedOptions) =>
                        handleChange(condition.enabledField, selectedOptions)
                      }
                      getOptionLabel={(e) => e.label} // Optional: customize label display
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
                value={selectedValues[field.testName] as string || ''}
                onChange={(e) => handleChange(field.testName, e.target.value)}
              />
            </div>
          );
        }
        return null;
      })}
    </form>
  );
};

export default DynamicScreen;
