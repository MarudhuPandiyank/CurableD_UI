import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header1 from './Header1';
import Select, { MultiValue } from 'react-select';
import { Calendar } from 'primereact/calendar';
import 'primereact/resources/themes/saga-blue/theme.css'; // Import the theme
import 'primereact/resources/primereact.min.css'; // Import PrimeReact CSS
import 'primeicons/primeicons.css'; // Import PrimeIcons
import config from '../config'; 
import './Common.css';

interface Condition {
  enabledField: string;
  triggerValue: string;
}
interface ColourOption {
  value: string;
  label: string;
}
interface Param {
  testName: string;
  subtestName?: string;
  valueType: string;
  values: string[];
  selectedValues: string[];
  condition?: Condition[];
}

interface ApiResponse {
  id: number;
  testMetrics: {
    params: Param[];
  };
}

const App: React.FC = () => {
  const navigate = useNavigate();
  const diseaseTestIds = localStorage.getItem('diseaseTestIds');
  const [paramsObject, setParamsObject] = useState<{ params: Param[] }>({ params: [] });
  const [processingTestName, setProcessingTestName] = useState('');
  const [processingValue, setProcessingValue] = useState('');
  const [dependentList, setDependentList] = useState<string[]>([]);
  const [isDependent, setIsDependent] = useState<Record<string, boolean>>({});
  const [formValues, setFormValues] = useState<Record<string, string[]>>({});
  const [multiParam, setMultiParam] = useState<readonly ColourOption[]>([
    { value: '', label: 'Select values' }
  ]);

  useEffect(() => {
    const fetchDiseaseTestMaster = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get<ApiResponse>(
          `${config.appURL}/curable/getMetricsById/${diseaseTestIds}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const filteredData = response.data.testMetrics.params.filter(
          (field: Param) => field.testName !== 'Referred for'
        );
        console.log('filteredData', filteredData);
        const mappedData: ColourOption[] = filteredData.map((drp) => ({
          value: drp.testName,
          label: drp.testName,
        }));

        setMultiParam(mappedData);
        setParamsObject({ params: filteredData });

        console.log('Disease Test Master Data:', response.data);
      } catch (error) {
        console.error('Error fetching disease test master data:', error);
      }
    };

    fetchDiseaseTestMaster();
  }, []);

  const listOfTestNames = paramsObject.params.map(param => param.testName);
  const listOfEnabledFields = paramsObject.params
    .filter(param => param.condition)
    .flatMap(param => param.condition!.map(cond => cond.enabledField));
  const independentList = listOfTestNames.filter(
    testName => !listOfEnabledFields.includes(testName)
  );

  const paramsMap = new Map<string, Param>();
  paramsObject.params.forEach(param => paramsMap.set(param.testName, param));
  const testNameWithEnabledFieldMap = new Map<string, string[]>();
  paramsObject.params.forEach(param => {
    if (param.condition) {
      param.condition.forEach(cond => {
        if (!testNameWithEnabledFieldMap.has(param.testName)) {
          testNameWithEnabledFieldMap.set(param.testName, []);
        }
        testNameWithEnabledFieldMap.get(param.testName)!.push(cond.enabledField);
      });
    }
  });
  const testNameTriggerValueMap = new Map<string, string[]>();
  paramsObject.params.forEach(param => {
    if (param.condition) {
      param.condition.forEach(cond => {
        if (!testNameTriggerValueMap.has(param.testName)) {
          testNameTriggerValueMap.set(param.testName, []);
        }
        testNameTriggerValueMap.get(param.testName)!.push(cond.triggerValue);
      });
    }
  });

  const handleSelectionChange = (testName: string, selectedValue: string | string[]) => {
    setProcessingTestName(testName);
    const valueToSet = Array.isArray(selectedValue) ? selectedValue[0] : selectedValue;
    setProcessingValue(valueToSet);
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      [testName]: Array.isArray(selectedValue) ? selectedValue : [selectedValue],
    }));

    let updatedDependentList: string[] = [];
    if (testNameWithEnabledFieldMap.has(testName)) {
      updatedDependentList = testNameWithEnabledFieldMap.get(testName) || [];
      const mergedDependentList = Array.from(new Set([...dependentList, ...updatedDependentList]));
      setDependentList(mergedDependentList);
    }

    const triggerValues = testNameTriggerValueMap.get(testName) || [];
    if (triggerValues.includes(valueToSet)) {
      setIsDependent((prevState) => ({
        ...prevState,
        [testName]: true,
      }));
    } else {
      const filteredDependentList = dependentList.filter(
        (item) => !updatedDependentList.includes(item) || item === testName
      );
      setDependentList(filteredDependentList);
      setIsDependent((prevState) => ({
        ...prevState,
        [testName]: false,
      }));
    }
  };

  const handleInputChange = (testName: string, value: string) => {
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      [testName]: [value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFormData = paramsObject.params.map((field) => {
      const selectedValue = formValues[field.testName] || [];
      return {
        ...field,
        selectedValues: selectedValue,
      };
    });
    const candidateId = localStorage.getItem('candidateId');
    const payload = {
      candidateId: Number(candidateId),
      diseaseTestMasterId: Number(diseaseTestIds),
      description: "Test Metrics",
      diseaseTestId: 1,
      testMetrics: {
        params: updatedFormData,
      },
      familyMedicalMetrics: null,
      familyMetrics: null,
      genderValid: true,
      hospitalId: 1,
      id: null,
      medicalMetrics: null,
      name: "Test Metrics",
      stage: localStorage.getItem('selectedStage'),
      type: 3,
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      await axios.post(`${config.appURL}/curable/candidatehistory`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Data submitted successfully!');
      navigate('/SuccessMessageClinicalFInal');
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  const patientId = localStorage.getItem('patientId');
  const patientName = localStorage.getItem('patientName');
  const registrationId = localStorage.getItem('registrationId');
  const ptName = localStorage.getItem('ptName');

  const renderField = (param: Param, key: string) => {
    return (
      <div key={key} className="form-group">
        <label style={{ color: 'black' }}>{param.testName}*:</label>
        <span style={{ color: 'darkred', fontWeight: 'bold' }}></span>
        <div className="input-with-icon">
          {param.valueType === 'SingleSelect' && (
            <select
              onChange={e =>
                handleSelectionChange(param.testName, e.target.value)
              }
              defaultValue=""
            >
              <option value="" disabled>
                Select a value
              </option>
              {param.values.map(value => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          )}
          {param.valueType === 'Multi Select' && (
            <Select
              isMulti
              name={param.testName}
              options={param.values.map((value) => ({ value, label: value }))}
              onChange={(option: MultiValue<ColourOption>) => handleSelectionChange(param.testName, option.map(opt => opt.value))}
              className="form-group"
            />
          )}
          {param.valueType === 'Input' && (
            <input
              type="text"
              placeholder="Enter value"
              value={formValues[param.testName] ? formValues[param.testName][0] : ''}
              onChange={(e) => handleInputChange(param.testName, e.target.value)}
            />
          )}
      
          {param.valueType === 'Date' && (
            <div className="input-with-icon">
                            <Calendar
                value={(formValues[param.testName] && new Date(formValues[param.testName][0])) || null}
                onChange={(e) => {
                  const date = e.value;
                  if (date) {
                    handleSelectionChange(param.testName, date.toISOString().split('T')[0]);
                  }
                }}
                dateFormat="yy-mm-dd"
                placeholder="yyyy-mm-dd"
                required
                maxDate={new Date()}
              />
              <img src="./assets/Calendar.png" className="clinic-id-icon" alt="calendar icon" />
            </div>
          )}
          {param.valueType === 'SingleSelectButton' && (
        <div className="gender-group">
          {param.values.map((value) => (
            <button
              key={value}
              type="button"
              className={`gender-btn ${formValues[param.testName] && formValues[param.testName][0] === value ? 'active' : ''}`}
              onClick={() => handleSelectionChange(param.testName, value)}
            >
              {value}
            </button>
          ))}
        </div>
      )}
        </div>
      </div>
    );
  };

  const getTestFieldsInline = () => {
    return independentList.map((testName) => {
      const param = paramsMap.get(testName);
      if (!param) return null;

      const dependentFields = (testNameWithEnabledFieldMap.get(testName) || [])
        .map((dependentTestName) => {
          const dependentParam = paramsMap.get(dependentTestName);
          if (!dependentParam) return null;
          return renderField(dependentParam, dependentTestName);
        });

      return (
        <div key={testName} className="form-inline-group">
          {renderField(param, testName)}
          {isDependent[testName] && dependentFields}
        </div>
      );
    });
  };

  const patientAge = localStorage.getItem('patientAge');
  const patientgender = localStorage.getItem('patientgender');

  return (
    <div className="container2">
      <Header1 />

      <div className="participant-info-container">
        <p className="participant-info-text"><strong>Participant: </strong>{ptName}{" "}{patientAge}{"/"}{patientgender}</p>
        <p className="participant-info-text"><strong>ID:</strong>{registrationId}</p>
        
      </div>
      <h1 style={{ color: 'darkblue' }}>Clinical Evaluation</h1>
      <form className="clinic-form" onSubmit={handleSubmit}>
        {getTestFieldsInline()}
        <center className="buttons">
          <button type="submit" className="Finish-button">Finish</button>
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

export default App;
