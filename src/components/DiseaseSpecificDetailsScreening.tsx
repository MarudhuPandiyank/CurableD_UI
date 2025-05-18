import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header1 from './Header1';
import Select, { MultiValue } from 'react-select';
import { Calendar } from 'primereact/calendar';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import config from '../config';
import './Common.css';
import './disease.css';

interface Field {
  testName: string;
  subtestName: string;
  condition?: Condition[];
  valueType: string;
  values: string[];
}

interface ColourOption {
  value: string;
  label: string;
}

interface Condition {
  enabledField: string;
  triggerValue: string;
}

interface ApiResponse {
  id: number;
  testMetrics: {
    params: Field[];
  };
}

const App: React.FC = () => {
  const [selectedValues, setSelectedValues] = useState<{ [key: string]: string | string[] }>({});
  const [hiddenFields, setHiddenFields] = useState<string[]>([]);
  const [fieldData, setFieldData] = useState<Field[]>([]);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [dob, setDob] = useState<Date | null>(null);

  const navigate = useNavigate();
  const diseaseTestIds = localStorage.getItem('diseaseTestIds');

  useEffect(() => {
    const fetchDiseaseTestMaster = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get<ApiResponse>(
          `${config.appURL}/curable/getMetricsById/${diseaseTestIds}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const filteredData = response.data.testMetrics.params;
        setFieldData(filteredData);

        const hidden = new Set<string>();
        filteredData.forEach((field) => {
          field.condition?.forEach((cond) => hidden.add(cond.enabledField));
        });
        setHiddenFields(Array.from(hidden));
      } catch (error) {
        console.error('Error fetching disease test master data:', error);
      }
    };

    if (diseaseTestIds) fetchDiseaseTestMaster();
  }, [diseaseTestIds]);

  const handleSelectChange = (testName: string, value: string | string[]) => {
    setSelectedValues((prev) => ({ ...prev, [testName]: value }));

    const fieldsToShow = new Set<string>(hiddenFields);
    fieldData.forEach((field) => {
      if (field.testName === testName) {
        field.condition?.forEach((cond) => {
          if (cond.triggerValue === value) {
            fieldsToShow.delete(cond.enabledField);
          } else {
            fieldsToShow.add(cond.enabledField);
          }
        });
      }
    });
    setHiddenFields(Array.from(fieldsToShow));
  };

  const handleFinish = async () => {
    const requiredFields = fieldData
      .filter((field) => !hiddenFields.includes(field.testName))
      .map((field) => field.testName);

    const missingFields = requiredFields.filter((key) => {
      const val = selectedValues[key];
      return (
        val === undefined || val === '' || (Array.isArray(val) && val.length === 0)
      );
    });

    if (missingFields.length > 0) {
      setFormErrors(missingFields);
      return;
    }

    setFormErrors([]);

    const candidateId = localStorage.getItem('candidateId');
    const payload = {
      candidateId: Number(candidateId),
      diseaseTestMasterId: Number(diseaseTestIds),
      description: "Eligibility Metrics",
      diseaseTestId: 1,
      familyMedicalMetrics: null,
      familyMetrics: null,
      gender: "FEMALE",
      genderValid: true,
      hospitalId: 1,
      id: null,
      medicalMetrics: null,
      name: "Eligibility Metrics",
      stage: localStorage.getItem('selectedStage'),
      eligibilityMetrics: null,
      type: 1,
      testMetrics: {
        params: fieldData.map((field) => ({
          testName: field.testName,
          subtestName: field.subtestName,
          selectedValues: selectedValues[field.testName]
            ? Array.isArray(selectedValues[field.testName])
              ? selectedValues[field.testName]
              : [selectedValues[field.testName]]
            : [],
        })),
      },
    };

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${config.appURL}/curable/candidatehistory`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/SuccessMessageScreeningFInal');
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  const [titleName, setTitleName] = useState("Disease Specific Details");

  useEffect(() => {
    const stage = localStorage.getItem("selectedStage");
    if (stage === "Breast screening Test") setTitleName("Breast Screening");
    else if (stage === "Oral Screening Test") setTitleName("Oral Screening");
    else if (stage === "Cervical Screening Test") setTitleName("Cervical Screening");
  }, []);

  const pName = localStorage.getItem("patientName");
  const regId = localStorage.getItem("registrationId");
  const patientAge = localStorage.getItem("patientAge");
  const patientgender = localStorage.getItem("patientgender");

  return (
    <div className="container2">
      <Header1 />
      <div className="participant-info-container">
        <p><strong>Participant: </strong>{pName} {patientAge}/{patientgender}</p>
        <p><strong>ID:</strong> {regId}</p>
      </div>
      <br/>

      <div className="clinic-details-form-newscreening">
        <h1 style={{ color: 'darkblue' }}>{titleName}</h1>

        {fieldData.map((field) => {
          if (hiddenFields.includes(field.testName)) return null;
          console.log("Rendering field:", field); // ✅ Console will work

          return (
            <div key={field.testName} className="form-group">
              <label style={{ fontSize: '15px' }}>{field.testName}</label>

              {field.valueType === "SingleSelect" && (
                <>
                  <select
                    value={selectedValues[field.testName] || ""}
                    onChange={(e) => handleSelectChange(field.testName, e.target.value)}
                  >
                    <option value="" disabled>Select an option</option>
                    {field.values.map((val) => (
                      <option key={val} value={val}>{val}</option>
                    ))}
                  </select>
                  {formErrors.includes(field.testName) && (
                    <span className="error-message">This field is required</span>
                  )}
                </>
              )}

              {field.valueType === "Multi Select" && (
                <>
                  <Select
                    isMulti
                    options={field.values.map((val) => ({ value: val, label: val }))}
                    onChange={(options: MultiValue<ColourOption>) =>
                      handleSelectChange(field.testName, options.map(o => o.value))
                    }
                  />
                  {formErrors.includes(field.testName) && (
                    <span className="error-message">This field is required</span>
                  )}
                </>
              )}

              {field.valueType === "Input" && (
                <>
                  <input
                    type="text"
                    value={selectedValues[field.testName] || ""}
                    onChange={(e) => handleSelectChange(field.testName, e.target.value)}
                  />
                  {formErrors.includes(field.testName) && (
                    <span className="error-message">This field is required</span>
                  )}
                </>
              )}

              {field.valueType === "Date" && (
                <>
                  <Calendar
                    value={selectedValues[field.testName]
                      ? new Date(selectedValues[field.testName] as string)
                      : dob}
                    onChange={(e) => {
                      const date = e.value as Date;
                      setDob(date);
                      handleSelectChange(field.testName, date.toISOString().split('T')[0]);
                    }}
                    dateFormat="yy-mm-dd"
                    placeholder="yyyy-mm-dd"
                    maxDate={new Date()}
                  />
                  {formErrors.includes(field.testName) && (
                    <span className="error-message">This field is required</span>
                  )}
                </>
              )}

              {field.valueType === "SingleSelectButton" && (
                <>
                  <div className="gender-group">
                    {field.values.map((val) => (
                      <button
                        key={val}
                        type="button"
                        className={`gender-btn ${selectedValues[field.testName] === val ? 'active' : ''}`}
                        onClick={() => handleSelectChange(field.testName, val)}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  {formErrors.includes(field.testName) && (
                    <span className="error-message">This field is required</span>
                  )}
                </>
              )}
            </div>
          );
        })}

        <center>
          <button className="Finish-button" onClick={handleFinish}>Finish</button>
        </center>
        <br/>
      </div>

      <footer className="footer-container-fixed">
        <div className="footer-content">
          <p className="footer-text">Powered By</p>
          <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="footer-logo" />
        </div>
      </footer>
    </div>
  );
};

export default App;
