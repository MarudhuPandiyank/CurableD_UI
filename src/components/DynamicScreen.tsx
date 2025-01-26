import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header1 from './Header1';
import Select from 'react-select';

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

  const [paramsObject, setParamsObject] = useState<{ params: Param[] }>({ params: [] });
  const [processingTestName, setProcessingTestName] = useState('');
  const [processingValue, setProcessingValue] = useState('');
  const [dependentList, setDependentList] = useState<string[]>([]);
  const [isDependent, setIsDependent] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string[]>>({}); // Store selected values for each test
  const [multiParam, setMultiParam] = useState<readonly ColourOption[]>([
    { value: '', label: 'Select values' } // Default option
  ]);
  // let multiParam: readonly ColourOption[]=[
  //   { value: 'ocean', label: 'Ocean'},
  // ];
  //  const colourOptions: readonly ColourOption[] = [
  //   { value: 'ocean', label: 'Ocean'},
  //   { value: 'blue', label: 'Blue' },
  //   { value: 'purple', label: 'Purple'},
  //   { value: 'red', label: 'Red' },
  //   { value: 'orange', label: 'Orange' },
  //   { value: 'yellow', label: 'Yellow' },
  //   { value: 'green', label: 'Green'},
  //   { value: 'forest', label: 'Forest'},
  //   { value: 'slate', label: 'Slate'},
  //   { value: 'silver', label: 'Silver'},
  // ];
  useEffect(() => {
    const fetchDiseaseTestMaster = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
        const diseaseTestIds = localStorage.getItem('diseaseTestIds');

        const response = await axios.get<ApiResponse>(
          `http://13.234.4.214:8015/api/curable/getMetricsById/${diseaseTestIds}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const filteredData = response.data.testMetrics.params.filter(
          (field: Param) => field.testName !== 'Referred for'
        );
        console.log('filteredData',filteredData);
        const mappedData: ColourOption[]  = filteredData.map((drp) => ({
          value: drp.testName,  // Assuming 'color' is the relevant property in filteredData
          label: drp.testName,  // You can adjust this if needed
        }));
        
        setMultiParam(mappedData);
        setParamsObject({ params: filteredData }); // Store dynamic form fields based on the API response

        console.log('Disease Test Master Data:', response.data);
        // if(response.data){
        //   response.data['testMetrics']['params'].map
        // }
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

    // If selectedValue is an array, take the first value or join them into a string
    const valueToSet = Array.isArray(selectedValue) ? selectedValue[0] : selectedValue;

    // Set the value
    setProcessingValue(valueToSet);

    // Update formValues with the selected value
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      [testName]: Array.isArray(selectedValue) ? selectedValue : [selectedValue], // Ensure selectedValue is always an array
    }));

    let updatedDependentList: string[] = [];
    if (testNameWithEnabledFieldMap.has(testName)) {
      updatedDependentList = testNameWithEnabledFieldMap.get(testName) || [];
      const mergedDependentList = Array.from(new Set([...dependentList, ...updatedDependentList]));
      setDependentList(mergedDependentList);
    }

    const triggerValues = testNameTriggerValueMap.get(testName) || [];
    if (triggerValues.includes(valueToSet)) {
      setIsDependent(true);
    } else {
      const filteredDependentList = dependentList.filter(
        (item) => !updatedDependentList.includes(item)
      );
      setDependentList(filteredDependentList);
      setIsDependent(true);
    }
  };


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

    const payload = {
      description: "Eligibility Metrics",
      diseaseTestId: 1,
      eligibilityMetrics: {
        params: updatedFormData,
      },
      familyMedicalMetrics: null,
      familyMetrics: null,
      gender: "FEMALE", // You can dynamically adjust this if necessary
      genderValid: true,
      hospitalId: 1,
      id: 27,
      medicalMetrics: null,
      name: "Eligibility Metrics",
      stage: localStorage.getItem('selectedStage'),
      testMetrics: null,
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) {

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

    }
  };


  const patientId = localStorage.getItem('patientId');
  const patientName = localStorage.getItem('patientName');
  const registrationId = localStorage.getItem('registrationId');
  const ptName = localStorage.getItem('ptName');
  return (
    <div className="container2">
      <Header1 />

      <h1 style={{ color: 'darkblue' }}>Clinical</h1>
      <div className="participant-container">
        <p>Participant: {ptName}</p>
        <p>ID: {registrationId}</p>
      </div>
      <form className="clinic-form" onSubmit={handleSubmit}>
        {independentList.map(testName => {
          const param = paramsMap.get(testName);
          return (
            param && (
              <div key={testName} className="form-group">
                <p>{param.testName}</p>
                {param.valueType === 'SingleSelect' && (
                  <select
                    onChange={e =>
                      handleSelectionChange(testName, e.target.value)
                    }
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select a value
                    </option>
                    {param.values.map(value => (
                      <option key={value} value={value} className="form-group">
                        {value}
                      </option>
                    ))}
                  </select>
                )}
                {param.valueType === 'Multi Select' && (
                  <select multiple defaultValue={[]}>
                    <option value="" disabled>
                      Select values
                    </option>
                    {param.values.map(value => (
                      <option key={value} value={value} className="form-group">
                        {value}
                      </option>
                    ))}
                  </select>
                )}
                {param.valueType === 'Input' && (
                  <input type="text" placeholder="Enter value" />
                )}
              </div>
            )
          );
        })}
        {isDependent &&
          dependentList.map(testName => {
            const param = paramsMap.get(testName);
            return (
              param && (
                <div key={testName} className="form-group">
                  <h3>{param.testName}</h3>
                  {param.valueType === 'SingleSelect' && (
                    <select
                      onChange={e =>
                        handleSelectionChange(testName, e.target.value)
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
                    
                    // <select multiple value={selectedValues} onChange={handleMulSelectionChange} defaultValue={[]}>
                    //   <option value="" disabled>
                    //     Select values
                    //   </option>
                    //   {param.values.map(value => (
                    //     <option key={value} value={value}  className="form-group">
                    //       {value}
                    //     </option>
                    //   ))}
                    // </select>
                    <Select
                     
                      isMulti
                      name="colors"
                      
                      // options={param.values}
                      options={multiParam}
                      className="basic-multi-select"
                      // classNamePrefix="select"
                    />
                  )}
                  {param.valueType === 'Input' && (
                    <input type="text" placeholder="Enter value" className="form-group" />
                  )}
                </div>
              )
            );

          })}
        <center className="buttons">
          <button type="button" className="Finish-button">Finish</button>
          <button type="submit" className="Next-button">Next</button>
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
