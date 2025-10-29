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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  

  const diseaseTestIds = localStorage.getItem('diseaseTestIds');

  // ---------- visibility helpers ----------
  const isTriggered = (current: string | string[] | undefined, trigger: string) => {
    if (!trigger) return false;
    const t = trigger.trim();
    if (Array.isArray(current)) return current.map(c => (typeof c === 'string' ? c.trim() : c)).includes(t);
    return (typeof current === 'string' ? current.trim() : current) === t;
  };

  
  const buildGraph = (fields: Field[]) => {
    const parentToChildren = new Map<string, Array<{ child: string; trigger: string }>>();
    const allNames = new Set<string>();
    const childNames = new Set<string>();

    fields.forEach(f => {
      const parentName = (f.testName || '').trim();
      allNames.add(parentName);
      (f.condition || []).forEach(c => {
        const childName = (c.enabledField || '').trim();
        const arr = parentToChildren.get(parentName) || [];
        arr.push({ child: childName, trigger: (c.triggerValue || '').trim() });
        parentToChildren.set(parentName, arr);
        childNames.add(childName);
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

  const visible = new Set<string>(roots.map(r => r.trim()));
  const queue: string[] = roots.map(r => r.trim());

    while (queue.length) {
      const parent = (queue.shift() as string).trim();
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

    return Array.from(allNames).filter(n => !visible.has(n.trim()));
  };
  // ----------------------------------------

  // ---------- fetch definitions then prefill ----------

   useEffect(() => {
      setTimeout(() => {
            setIsLoading(false);
    
      }, 700);
      
      },[])
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
            const key = (f.testName || '').trim();
            const hit = histParams.find(p => (p.testName || '').trim() === key);
            if (!hit) return;

            // collect candidates of values in order of preference
            const arr = (Array.isArray(hit.selectedValues) ? hit.selectedValues :
                        Array.isArray(hit.values) ? hit.values :
                        typeof hit.value === 'string' ? [hit.value] : []) as string[];

            if (f.valueType === 'Multi Select') {
              initial[key] = arr || [];
            } else {
              initial[key] = (arr && arr.length > 0) ? arr[0] : '';
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
    if(testName==="Breast Examination"){
      setIsLoading(true);
      setTimeout(() => {
            setIsLoading(false);
      },200)
    }
  const key = (testName || '').trim();
  const nextSelected = { ...selectedValues, [key]: value };
  const nextHidden = computeHidden(fieldData, nextSelected);

    // Clear values for any fields that just became hidden
    const prevHiddenSet = new Set(hiddenFields);
    const nextHiddenSet = new Set(nextHidden);
    Object.keys(nextSelected).forEach(k => {
      if (!prevHiddenSet.has(k) && nextHiddenSet.has(k)) {
        delete nextSelected[k];
      }
    });

    setSelectedValues(nextSelected);
    setHiddenFields(nextHidden);

    if (formErrors.includes(key)) {
      setFormErrors(errs => errs.filter(e => e !== key));
    }
  };

  // “No” flow detection
  const isNoFlow = Object.entries(selectedValues).some(
    ([name, val]) => /clinical evaluation/i.test(name) && val === 'No'
  );

  // Validate only visible & mandatory
  const validateForFinish = () => {
    const missing = fieldData
      .filter(f => !hiddenFields.includes((f.testName || '').trim()) && f.isMandatory)
      .map(f => (f.testName || '').trim())
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
        params: fieldData.map(field => {
          const key = (field.testName || '').trim();
          return {
            testName: field.testName,
            subtestName: field.subtestName,
            selectedValues: selectedValues[key]
              ? Array.isArray(selectedValues[key])
                ? (selectedValues[key] as string[])
                : [selectedValues[key] as string]
              : [],
          };
        }),
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

    if (raw === 'breast screening') setTitleName('Breast Screening');
    else if (raw === 'oral screening') setTitleName('Oral Screening');
    else if (raw === 'cervical screening') setTitleName('Cervical Screening');
    // if the selected stage contains the word 'symptoms' (case-insensitive), treat it as Symptoms based referral screening
    else if (raw.includes('symptoms')) setTitleName('Symptoms based referral screening');
    else setTitleName('Disease Specific Details');
  }, []);

  // Finish disabled derived
  const isCervicalStage =
    (localStorage.getItem('selectedStage') || '').toLowerCase().trim() === 'cervical screening';

  const cervicalNotNowFields = ['HR-HPV DNA', 'Cytology', 'Visual Test'];

  const isCervicalNotNow =
    isCervicalStage &&
    cervicalNotNowFields.some((name) => (selectedValues[name] as string) === 'Not now');
  const finishDisabled =
    isNoFlow || isCervicalNotNow || 
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

  // dd-mm-yyyy or yyyy-mm-dd -> Date
const parseToDate = (s?: string) => {
  if (!s) return null;
  const m1 = /^(\d{2})-(\d{2})-(\d{4})$/;      // dd-mm-yyyy
  const m2 = /^(\d{4})-(\d{2})-(\d{2})$/;      // yyyy-mm-dd (old saved)
  let d: Date | null = null;

  if (m1.test(s)) {
    const [, dd, mm, yyyy] = s.match(m1)!;
    d = new Date(+yyyy, +mm - 1, +dd);
  } else if (m2.test(s)) {
    const [, yyyy, mm, dd] = s.match(m2)!;
    d = new Date(+yyyy, +mm - 1, +dd);
  }
  return d && !isNaN(d.getTime()) ? d : null;
};


  return (
    <div className="container2">
      <Header1 />
      <div className="participant-info-container">
        <p><strong>Participant: </strong>{pName} {patientAge}/{patientgender}</p>
        <p><strong>ID:</strong> {regId}</p>
      </div>

      <div className="clinic-details-form-newscreening">
        <h1 style={{ color: 'darkblue',marginTop:'15px' }}>{titleName}</h1>

         {isLoading?
        <div
  className={`loader-overlay ${isLoading ? 'show' : ''}`}
  aria-busy={isLoading}
  aria-live="polite"
>
  <div className="loader-spinner" />
  <p className="loader-text">Loading clinical metrics…</p>
</div>
        :
        <>

        {fieldData.map((field) => {
          const key = (field.testName || '').trim();
          if (hiddenFields.includes(key)) return null;

          return (
            <div key={field.testName} className="form-group">
              <label style={{ fontSize: '15px' }}>
                {field.testName}{' '}
                {field.isMandatory && <span style={{ color: 'red' }}>*</span>}
              </label>

              {field.valueType === 'SingleSelect' && (
                <>
                  <select
                    value={(selectedValues[key] as string) || ''}
                    onChange={(e) => handleSelectChange(field.testName, e.target.value)}
                  >
                    <option value="" disabled>Select an option</option>
                    {field.values.map((val) => (
                      <option key={val} value={val}>{val}</option>
                    ))}
                  </select>
                  {formErrors.includes(key) && (
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
                      Array.isArray(selectedValues[key])
                        ? (selectedValues[key] as string[]).map(v => ({ value: v, label: v }))
                        : []
                    }
                    onChange={(options: MultiValue<ColourOption>) =>
                      handleSelectChange(field.testName, (options || []).map(o => o.value))
                    }
                  />
                  {formErrors.includes(key) && (
                    <span className="error-message">This field is required</span>
                  )}
                </>
              )}

              {field.valueType === 'Input' && (
                <>
                  <input
                    type="text"
                    value={(selectedValues[key] as string) || ''}
                    onChange={(e) => handleSelectChange(field.testName, e.target.value)}
                  />
                  {formErrors.includes(key) && (
                    <span className="error-message">This field is required</span>
                  )}
                </>
              )}

              {field.valueType === 'Date' && (
                <>
                  <div style={{ width: '100%' }}>
                    <Calendar
                      value={parseToDate(selectedValues[key] as string)}
                      onChange={(e) => {
                        const date = e.value as Date | null;
                        if (date) {
                          // store as dd-mm-yyyy
                          const dd = String(date.getDate()).padStart(2, '0');
                          const mm = String(date.getMonth() + 1).padStart(2, '0');
                          const yyyy = date.getFullYear();
                          handleSelectChange(field.testName, `${dd}-${mm}-${yyyy}`);
                        } else {
                          handleSelectChange(field.testName, '');
                        }
                      }}
                      dateFormat="dd-mm-yy"
                      placeholder="dd-mm-yyyy"
                      maxDate={new Date()}
                    />
                  </div>
                  {formErrors.includes(key) && (
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
                        className={`gender-btn ${selectedValues[key] === val ? 'active' : ''}`}
                        onClick={() => handleSelectChange(field.testName, val)}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  {formErrors.includes(key) && (
                    <span className="error-message">This field is required</span>
                  )}
                </>
              )}
            </div>
          );
        })}
        </>}

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

      <br /><br /><br /><br/>
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
