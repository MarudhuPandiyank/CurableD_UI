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

interface Condition {
  enabledField: string;
  triggerValue: string;
}

interface Field {
  testName: string;
  subtestName: string;
  condition?: Condition[];
  valueType: string;          // "SingleSelect" | "Multi Select" | "Input" | "Date" | "SingleSelectButton"
  values: string[];
  isMandatory?: boolean;
}

interface PrefillParam {
  testName: string;
  subtestName?: string;
  // backend usually sends selectedValues; keep optional fallbacks for safety
  selectedValues?: string[];
  value?: string;      // sometimes single value appears as 'value'
  values?: string[];   // sometimes same name as definition
}
interface PrefillResponse {
  testResult?: { params?: PrefillParam[] };
}

interface ApiResponse {
  id: number;
  testMetrics: { params: Field[] };
}

interface ColourOption {
  value: string;
  label: string;
}

const App: React.FC = () => {
  const [selectedValues, setSelectedValues] = useState<{ [key: string]: string | string[] }>({});
  const [hiddenFields, setHiddenFields] = useState<string[]>([]);
  const [fieldData, setFieldData] = useState<Field[]>([]);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [titleName, setTitleName] = useState('Disease Specific Details');
  const navigate = useNavigate();

  const diseaseTestIds = localStorage.getItem('diseaseTestIds');

  // ---------- visibility helpers ----------
  const isTriggered = (current: string | string[] | undefined, trigger: string) => {
    if (Array.isArray(current)) return current.includes(trigger);
    return current === trigger;
  };

  const buildGraph = (fields: Field[]) => {
    const parentToChildren = new Map<string, Array<{ child: string; trigger: string }>>();
    const allNames = new Set<string>();
    const childNames = new Set<string>();

    fields.forEach(f => {
      allNames.add(f.testName);
      (f.condition || []).forEach(c => {
        const arr = parentToChildren.get(f.testName) || [];
        arr.push({ child: c.enabledField, trigger: c.triggerValue });
        parentToChildren.set(f.testName, arr);
        childNames.add(c.enabledField);
      });
    });

    const roots: string[] = Array.from(allNames).filter(n => !childNames.has(n));
    return { parentToChildren, allNames, roots };
  };

  const computeHidden = (
    fields: Field[],
    selections: { [k: string]: string | string[] }
  ) => {
    const { parentToChildren, allNames, roots } = buildGraph(fields);

    const visible = new Set<string>(roots);
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
      }
    }

    return Array.from(allNames).filter(n => !visible.has(n));
  };
  // ----------------------------------------

  // ---------- fetch definitions then prefill ----------
  useEffect(() => {
    const fetchDefsAndPrefill = async () => {
      try {
        const token = localStorage.getItem('token');
        // 1) field definitions
        const response = await axios.get<ApiResponse>(
          `${config.appURL}/curable/getMetricsById/${diseaseTestIds}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const params = response.data?.testMetrics?.params || [];
        setFieldData(params);

        // 2) prefill (candidate history)
        try {
          const candidateId = localStorage.getItem('candidateId') || localStorage.getItem('patientId');
          const prefill = await axios.post<PrefillResponse>(
            `${config.appURL}/curable/candidatehistoryForPrefil`,
            {
              candidateId,
              type:7,
              diseaseTypeId: Number(diseaseTestIds), // adjust if your API expects diseaseTypeId instead
              // type: 7, // uncomment if your API requires a type code for this screen
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          console.log(prefill.data,"kka")

          const histParams = prefill.data?.testResult?.params || [];
          // Normalize into { testName: string | string[] } based on field.valueType
          const initial: { [k: string]: string | string[] } = {};
          params.forEach(f => {
            const hit = histParams.find(p => p.testName === f.testName);
            if (!hit) return;

            // collect candidates of values in order of preference
            const arr = (Array.isArray(hit.selectedValues) ? hit.selectedValues :
                        Array.isArray(hit.values) ? hit.values :
                        typeof hit.value === 'string' ? [hit.value] : []) as string[];

            if (f.valueType === 'Multi Select') {
              initial[f.testName] = arr || [];
            } else {
              initial[f.testName] = (arr && arr.length > 0) ? arr[0] : '';
            }
          });

          setSelectedValues(initial);
          // visibility should depend on prefilled selections
          setHiddenFields(computeHidden(params, initial));
        } catch (prefillErr) {
          // If no prefill available, just compute default visibility (roots only)
          setHiddenFields(computeHidden(params, {}));
          console.warn('Prefill not available / failed, continuing with empty selections.', prefillErr);
        }
      } catch (error) {
        console.error('Error fetching disease test master data:', error);
      }
    };

    if (diseaseTestIds) fetchDefsAndPrefill();
  }, [diseaseTestIds]);
  // ----------------------------------------------------

  // Change handler
  const handleSelectChange = (testName: string, value: string | string[]) => {
    const nextSelected = { ...selectedValues, [testName]: value };
    const nextHidden = computeHidden(fieldData, nextSelected);

    // Clear values for any fields that just became hidden
    const prevHiddenSet = new Set(hiddenFields);
    const nextHiddenSet = new Set(nextHidden);
    Object.keys(nextSelected).forEach(key => {
      if (!prevHiddenSet.has(key) && nextHiddenSet.has(key)) {
        delete nextSelected[key];
      }
    });

    setSelectedValues(nextSelected);
    setHiddenFields(nextHidden);

    if (formErrors.includes(testName)) {
      setFormErrors(errs => errs.filter(e => e !== testName));
    }
  };

  // “No” flow detection
  const isNoFlow = Object.entries(selectedValues).some(
    ([name, val]) => /clinical evaluation/i.test(name) && val === 'No'
  );

  // Validate only visible & mandatory
  const validateForFinish = () => {
    const missing = fieldData
      .filter(f => !hiddenFields.includes(f.testName) && f.isMandatory)
      .map(f => f.testName)
      .filter(name => {
        const v = selectedValues[name];
        return v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
      });

    setFormErrors(missing);
    return missing.length === 0;
  };

  // Build payload with completed flag
  const buildPayload = (completed: 0 | 1) => {
    const candidateId = Number(localStorage.getItem('candidateId'));
    return {
      candidateId,
      diseaseTestMasterId: Number(diseaseTestIds),
      description: 'Eligibility Metrics',
      diseaseTestId: 1,
      familyMedicalMetrics: null,
      familyMetrics: null,
      gender: 'FEMALE',
      genderValid: true,
      hospitalId: 1,
      id: null,
      medicalMetrics: null,
      name: 'Eligibility Metrics',
      stage: localStorage.getItem('selectedStage'),
      eligibilityMetrics: null,
      completed,
      type: 1,
      testMetrics: {
        params: fieldData.map(field => ({
          testName: field.testName,
          subtestName: field.subtestName,
          selectedValues: selectedValues[field.testName]
            ? Array.isArray(selectedValues[field.testName])
              ? (selectedValues[field.testName] as string[])
              : [selectedValues[field.testName] as string]
            : [],
        })),
      },
    };
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${config.appURL}/curable/candidatehistory`, buildPayload(0), {
        headers: { Authorization: `Bearer ${token}` },
      });
      // In “No” flow, proceed after Save; else stay or toast
      navigate('/SuccessMessageScreeningFInal');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Save failed. Please try again.');
    }
  };

  const handleFinish = async () => {
    if (!validateForFinish()) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${config.appURL}/curable/candidatehistory`, buildPayload(1), {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/SuccessMessageScreeningFInal');
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Submit failed. Please try again.');
    }
  };

  // Titles for 3 stages (robust)
  useEffect(() => {
    const raw = (localStorage.getItem('selectedStage') || '').toLowerCase().trim();
    if (raw === 'breast screening test') setTitleName('Breast Screening');
    else if (raw === 'oral screening test') setTitleName('Oral Screening');
    else if (raw === 'cervical screening test') setTitleName('Cervical Screening');
    else setTitleName('Disease Specific Details');
  }, []);

  // Finish disabled derived
  const finishDisabled =
    isNoFlow ||
    fieldData.some(f => {
      if (hiddenFields.includes(f.testName)) return false;
      if (!f.isMandatory) return false;
      const v = selectedValues[f.testName];
      return v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
    });

  const pName = localStorage.getItem('patientName');
  const regId = localStorage.getItem('registrationId');
  const patientAge = localStorage.getItem('patientAge');
  const patientgender = localStorage.getItem('patientgender');

  return (
    <div className="container2">
      <Header1 />
      <div className="participant-info-container">
        <p><strong>Participant: </strong>{pName} {patientAge}/{patientgender}</p>
        <p><strong>ID:</strong> {regId}</p>
      </div>

      <div className="clinic-details-form-newscreening">
        <h1 style={{ color: 'darkblue' }}>{titleName}</h1>

        {fieldData.map((field) => {
          if (hiddenFields.includes(field.testName)) return null;

          return (
            <div key={field.testName} className="form-group">
              <label style={{ fontSize: '15px' }}>
                {field.testName}{' '}
                {field.isMandatory && <span style={{ color: 'red' }}>*</span>}
              </label>

              {field.valueType === 'SingleSelect' && (
                <>
                  <select
                    value={(selectedValues[field.testName] as string) || ''}
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

              {field.valueType === 'Multi Select' && (
                <>
                  <Select
                    isMulti
                    options={field.values.map((val) => ({ value: val, label: val }))}
                    value={
                      Array.isArray(selectedValues[field.testName])
                        ? (selectedValues[field.testName] as string[]).map(v => ({ value: v, label: v }))
                        : []
                    }
                    onChange={(options: MultiValue<ColourOption>) =>
                      handleSelectChange(field.testName, (options || []).map(o => o.value))
                    }
                  />
                  {formErrors.includes(field.testName) && (
                    <span className="error-message">This field is required</span>
                  )}
                </>
              )}

              {field.valueType === 'Input' && (
                <>
                  <input
                    type="text"
                    value={(selectedValues[field.testName] as string) || ''}
                    onChange={(e) => handleSelectChange(field.testName, e.target.value)}
                  />
                  {formErrors.includes(field.testName) && (
                    <span className="error-message">This field is required</span>
                  )}
                </>
              )}

              {field.valueType === 'Date' && (
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

              {field.valueType === 'SingleSelectButton' && (
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
          <div className="buttons">
            <button className="Next-button" onClick={handleSave}>Save</button>
            <button className="Finish-button" onClick={handleFinish} disabled={finishDisabled}>
              Finish
            </button>
          </div>
        </center>
        <br />
      </div>

      <br /><br /><br />
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
