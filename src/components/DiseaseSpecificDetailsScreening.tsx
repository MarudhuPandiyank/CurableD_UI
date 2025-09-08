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
  const [dob, setDob] = useState<Date | null>(null); // unchanged

  const navigate = useNavigate();
  const diseaseTestIds = localStorage.getItem('diseaseTestIds');

  // ---------- visibility helpers (updated: dependency-walk) ----------
  const isTriggered = (current: string | string[] | undefined, trigger: string) => {
    if (Array.isArray(current)) return current.includes(trigger);
    return current === trigger;
  };

  /**
   * Build dependency graph:
   * parent -> [{ child, triggerValue }]
   * Also compute root fields (those that are not enabled by anyone).
   */
  const buildGraph = (fields: Field[]) => {
    const parentToChildren = new Map<string, Array<{ child: string; trigger: string }>>();
    const allNames = new Set<string>();
    const childNames = new Set<string>();

    fields.forEach(f => {
      allNames.add(f.testName);
      if (f.condition) {
        f.condition.forEach(c => {
          const arr = parentToChildren.get(f.testName) || [];
          arr.push({ child: c.enabledField, trigger: c.triggerValue });
          parentToChildren.set(f.testName, arr);
          childNames.add(c.enabledField);
        });
      }
    });

    const roots: string[] = Array.from(allNames).filter(n => !childNames.has(n));
    return { parentToChildren, allNames, roots };
  };

  /**
   * Compute which fields should be hidden by walking from roots and
   * only revealing children when their parent value matches trigger.
   * Any subtree under a non-matching/hidden parent stays hidden.
   */
  const computeHidden = (
    fields: Field[],
    selections: { [k: string]: string | string[] }
  ) => {
    const { parentToChildren, allNames, roots } = buildGraph(fields);

    const visible = new Set<string>(roots); // roots are always visible
    const queue: string[] = [...roots];

    while (queue.length) {
      const parent = queue.shift() as string;
      const children = parentToChildren.get(parent) || [];
      for (const { child, trigger } of children) {
        if (isTriggered(selections[parent], trigger)) {
          if (!visible.has(child)) {
            visible.add(child);
            queue.push(child);
          }
        }
        // If not triggered, child stays hidden (and its subtree too).
      }
    }

    const hidden: string[] = Array.from(allNames).filter(n => !visible.has(n));
    return hidden;
  };
  // -------------------------------------------------------------------

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

        // Initialize visibility with empty selections
        setHiddenFields(computeHidden(filteredData, {}));
      } catch (error) {
        console.error('Error fetching disease test master data:', error);
      }
    };

    if (diseaseTestIds) fetchDiseaseTestMaster();
  }, [diseaseTestIds]);

  // Recompute visibility on every selection change
  const handleSelectChange = (testName: string, value: string | string[]) => {
    const nextSelected = { ...selectedValues, [testName]: value };
    const nextHidden = computeHidden(fieldData, nextSelected);

    // Clear values of any fields that just became hidden (including deep descendants)
    const prevHiddenSet = new Set(hiddenFields);
    const nextHiddenSet = new Set(nextHidden);
    Object.keys(nextSelected).forEach(key => {
      if (!prevHiddenSet.has(key) && nextHiddenSet.has(key)) {
        delete nextSelected[key];
      }
    });

    setSelectedValues(nextSelected);
    setHiddenFields(nextHidden);
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
          console.log("Rendering field:", field);

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
                  <div style={{ width: '100%' }}>
                    <Calendar
                      value={
                        selectedValues[field.testName]
                          ? new Date(selectedValues[field.testName] as string)
                          : null
                      }
                      onChange={(e) => {
                        if (e.value) {
                          const date = e.value as Date;
                          const localDate = new Date(
                            date.getTime() - date.getTimezoneOffset() * 60000
                          ).toISOString().split('T')[0];
                          handleSelectChange(field.testName, localDate);
                        }
                      }}
                      dateFormat="yy-mm-dd"
                      placeholder="yyyy-mm-dd"
                      maxDate={new Date()}
                    />
                  </div>
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
      <br/><br/><br/>
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
