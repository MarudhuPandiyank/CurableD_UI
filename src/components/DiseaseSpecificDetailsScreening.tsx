import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header1 from './Header1';
import Select, { MultiValue } from 'react-select';
import config from '../config'; 

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
  const [multiParam, setMultiParam] = useState<readonly ColourOption[]>([{ value: '', label: 'Select values' }]);
  const [independentList, setIndependentList] = useState<string[]>([]); // Initialize independentList state

  useEffect(() => {
    const fetchDiseaseTestMaster = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage

        const response = await axios.get<ApiResponse>(
          `${config.appURL}/curable/getMetricsById/${diseaseTestIds}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

       // const filteredData =  [{"testName":"Cervical Screening","subtestName":"NONE","condition":[{"enabledField":"Screening HR-HPV DNA","triggerValue":"Done"}],"valueType":"SingleSelect","values":["Done","Not Done"],"selectedValues":[]},{"testName":"Screening HR-HPV DNA","subtestName":"HR-HPV DNA","condition":[{"enabledField":"Screening Report Date","triggerValue":"Yes"}],"valueType":"SingleSelect","values":["Yes","No"],"selectedValues":[]},{"testName":"Screening Report Date","subtestName":"Report Date","valueType":"Input","values":[],"selectedValues":[]}];
         const filteredData = response.data.testMetrics.params
        console.log('filteredData',filteredData);
        const mappedData: ColourOption[] = filteredData.map((drp) => ({
          value: drp.testName,  // Assuming 'color' is the relevant property in filteredData
          label: drp.testName,  // You can adjust this if needed
        }));
        
        setMultiParam(mappedData);
        setParamsObject({ params: filteredData }); // Store dynamic form fields based on the API response

        const listOfTestNames = filteredData.map(param => param.testName);
        const listOfEnabledFields = filteredData
          .filter(param => param.condition)
          .flatMap(param => param.condition!.map(cond => cond.enabledField));

        const initialIndependentList = listOfTestNames.filter(
          testName => !listOfEnabledFields.includes(testName)
        );

        setIndependentList(initialIndependentList); // Initialize independentList
        console.log('Disease Test Master Data:', response.data);
       
      } catch (error) {
        console.error('Error fetching disease test master data:', error);
      }
    };

    fetchDiseaseTestMaster();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Construct the body of the POST request to match the desired structure
    const updatedFormData = paramsObject.params.map((field) => {
      const selectedValue = formValues[field.testName] || []; // Use the selected value from formValues
      return {
        ...field,
        selectedValues: selectedValue, // Assign the selected value to selectedValues
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
      type: 1,
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
      navigate('/SuccessMessageScreeningFInal');
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
        <p>{param.testName}</p>
        {param.valueType === 'SingleSelect' && (
          <select
            onChange={e =>
              handleSelectionChange(param.testName, e.target.value) // Updated this line
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
            onChange={(option: MultiValue<ColourOption>) => handleSelectionChange(param.testName, option.map(opt => opt.value))} // Updated this line
            className="basic-multi-select"
          />
        )}
        {param.valueType === 'Input' && (
          <input type="text" placeholder="Enter value" />
        )}
      </div>
    );
  };
  
  const handleSelectionChange = (testName: string, selectedValue: string | string[]) => {
    setProcessingTestName(testName);
  
    const valueToSet = Array.isArray(selectedValue) ? selectedValue[0] : selectedValue;
    setProcessingValue(valueToSet);
  
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      [testName]: Array.isArray(selectedValue) ? selectedValue : [selectedValue],
    }));
  
    let updatedDependentList: Set<string> = new Set(dependentList); // Initialize Set for unique values
    let updatedIndependentList: Set<string> = new Set(independentList); // Initialize Set for unique values
  
    if (testNameWithEnabledFieldMap.has(testName)) {
      const newDependentList = testNameWithEnabledFieldMap.get(testName) || [];
      newDependentList.forEach(dependentField => {
        updatedDependentList.add(dependentField);
        updatedIndependentList.add(dependentField);
      });
    }
  
    const triggerValues = testNameTriggerValueMap.get(testName) || [];
    if (triggerValues.includes(valueToSet)) {
      setIsDependent((prevState) => ({
        ...prevState,
        [testName]: true,
      }));
    } else {
      const filteredDependentList = dependentList.filter(
        (item) => !Array.from(updatedDependentList).includes(item)
      );
      updatedDependentList = new Set(filteredDependentList); // Convert filtered list back to Set
      setDependentList(Array.from(updatedDependentList));
      setIsDependent((prevState) => ({
        ...prevState,
        [testName]: false,
      }));
    }
  
    setIndependentList(Array.from(updatedIndependentList)); // Convert Set to Array
    setDependentList(Array.from(updatedDependentList)); // Convert Set to Array
  };
  
  const getTestFieldsInline = () => {
    return independentList.map((testName) => {
      const param = paramsMap.get(testName);
      if (!param) return null;
  
      const dependentFields = (testNameWithEnabledFieldMap.get(testName) || [])
        .map((dependentTestName) => {
          const dependentParam = paramsMap.get(dependentTestName);
          if (!dependentParam) return null;
        // return renderField(dependentParam, dependentTestName);//not needed
        });
  
      return (
        <div key={testName} className="form-inline-group">
          {renderField(param, testName)}
          {isDependent[testName] && dependentFields}
        </div>
      );
    });
  };
  

  return (
    <div className="container2">
      <Header1 />
      <h1 style={{ color: 'darkblue' }}>Disease Specific Details</h1>
      <div className="participant-container">
        <p>Participant: {ptName}</p>
        <p>ID: {registrationId}</p>
      </div>
      <form className="clinic-form" onSubmit={handleSubmit}>
        {getTestFieldsInline()}
        <center className="buttons">
          <button type="submit" className="Finish-button">Finish</button>
        </center>
      </form>
      <div className="powered-container">
        <p className="powered-by">Powered By Curable</p>
        <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="curable-logo" />
      </div>
    </div>
  );
};

export default App;
