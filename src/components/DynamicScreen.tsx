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
import { useSelector } from 'react-redux';
import { selectPrivilegeFlags, canAll } from '../store/userSlice';
import Loader from "./common/Loader";


interface Condition {
  enabledField: string;
  triggerValue: string;
}

type ValueType = 'SingleSelect' | 'Multi Select' | 'Input' | 'Date' | 'SingleSelectButton';

interface Field {
  testName: string;
  subtestName: string;
  condition?: Condition[];
  valueType: ValueType;
  values: string[];
  isMandatory?: boolean;
}

interface PrefillParam {
  testName: string;
  subtestName?: string;
  selectedValues?: string[];
  value?: string;
  values?: string[];
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
  const navigate = useNavigate();

  // privileges (unchanged BAU inputs)
  const { canView, canCreate, canEdit } = useSelector(selectPrivilegeFlags('Patient Registration'));
  const allowAllThree = useSelector(canAll('/clinical', 'CREATE', 'VIEW', 'EDIT'));

  // ids & state
  const diseaseTestIds = localStorage.getItem('diseaseTestIds');
  const [fieldData, setFieldData] = useState<Field[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<string, string | string[]>>({});
  const [hiddenFields, setHiddenFields] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [titleName, setTitleName] = useState('Clinical Evaluation');
// top of component state
const [isLoading, setIsLoading] = useState<boolean>(true);

  // ---------- visibility helpers ----------
  const isTriggered = (current: string | string[] | undefined, trigger: string) => {
    if (Array.isArray(current)) return current.includes(trigger);
    return current === trigger;
  };

  useEffect(() => {
    setTimeout(() => {
          setIsLoading(false);
  
    }, 500);
    
    },[])
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

  const computeHidden = (fields: Field[], selections: Record<string, string | string[]>) => {
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
        if (!token || !diseaseTestIds) return;

        // 1) Field definitions
        const res = await axios.get<ApiResponse>(
          `${config.appURL}/curable/getMetricsById/${diseaseTestIds}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const all = res.data?.testMetrics?.params || [];
        // BAU: filter example kept from your first snippet (exclude "Referred for")
        const params = all.filter((f) => f.testName !== 'Referred for');
        setFieldData(params);

        // 2) Prefill
        try {
          const candidateId = localStorage.getItem('candidateId') || localStorage.getItem('patientId');
          const prefill = await axios.post<PrefillResponse>(
            `${config.appURL}/curable/candidatehistoryForPrefil`,
            {
              candidateId,
              type: 7,                       // keep as you noted for this screen
              diseaseTypeId: Number(diseaseTestIds),
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const histParams = prefill.data?.testResult?.params || [];
          const initial: Record<string, string | string[]> = {};

          params.forEach(f => {
            const hit = histParams.find(p => p.testName === f.testName);
            if (!hit) return;

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
          setHiddenFields(computeHidden(params, initial));
        } catch (prefillErr) {
          // If prefill fails/empty, compute roots only
          setHiddenFields(computeHidden(params, {}));
          console.warn('Prefill not available; proceeding empty.', prefillErr);
        }
      } catch (e) {
        console.error('Error fetching disease test master data:', e);
      }
    };

    fetchDefsAndPrefill();
  }, [diseaseTestIds]);
  // ----------------------------------------------------

  // Titles
  useEffect(() => {
    const raw = (localStorage.getItem('selectedStage') || '').toLowerCase().trim();
    if (raw.includes('breast')) setTitleName('Breast Clinical Evaluation');
    else if (raw.includes('oral')) setTitleName('Oral Clinical Evaluation');
    else if (raw.includes('cervical')) setTitleName('Cervical Clinical Evaluation');
    else setTitleName('Clinical Evaluation');
  }, []);

  // Change handlers
  const handleSelectChange = (testName: string, value: string | string[]) => {
     if(testName==="Oral Clinical Evaluation"){
      setIsLoading(true);
      setTimeout(() => {
            setIsLoading(false);
      },200)
    }
    const nextSelected = { ...selectedValues, [testName]: value };
    const nextHidden = computeHidden(fieldData, nextSelected);

    // Clear values that just became hidden
    const prevHiddenSet = new Set(hiddenFields);
    const nextHiddenSet = new Set(nextHidden);
    Object.keys(nextSelected).forEach(key => {
      if (!prevHiddenSet.has(key) && nextHiddenSet.has(key)) delete nextSelected[key];
    });

    setSelectedValues(nextSelected);
    setHiddenFields(nextHidden);

    // clear error as soon as user touches it
    if (formErrors.includes(testName)) {
      setFormErrors(errs => errs.filter(e => e !== testName));
    }
  };

  const handleInputChange = (testName: string, v: string) => {
    handleSelectChange(testName, v);
  };

  // Validation for Finish (only visible & mandatory)
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

  // Finish disabled derived
  const finishDisabled =
    fieldData.some(f => {
      if (hiddenFields.includes(f.testName)) return false;
      if (!f.isMandatory) return false;
      const v = selectedValues[f.testName];
      return v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
    });

  // Payload
  const buildPayload = (completed: 0 | 1) => {
    const candidateId = Number(localStorage.getItem('candidateId'));
    const stage = localStorage.getItem('selectedStage');
    return {
      candidateId,
      diseaseTestMasterId: Number(diseaseTestIds),
      description: 'Test Metrics',
      diseaseTestId: 1,
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
      familyMedicalMetrics: null,
      familyMetrics: null,
      genderValid: true,
      hospitalId: 1,
      id: null,
      medicalMetrics: null,
      name: 'Test Metrics',
      stage,
      type: 3,               // keep your original type for Clinical Evaluation
      completed,             // <- 0 for Save, 1 for Finish
    };
  };

  const postCandidateHistory = async (payload: any) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Missing token');
    await axios.post(`${config.appURL}/curable/candidatehistory`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      await postCandidateHistory(buildPayload(0));
      navigate('/SuccessMessageClinicalFInal');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Save failed. Please try again.');
    }
  };

  const handleFinish = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForFinish()) return;
    try {
      await postCandidateHistory(buildPayload(1));
      navigate('/SuccessMessageClinicalFInal');
    } catch (error) {
      console.error('Submit failed:', error);
      alert('Submit failed. Please try again.');
    }
  };

  // UI bits
  const pName = localStorage.getItem('ptName') || localStorage.getItem('patientName');
  const regId = localStorage.getItem('registrationId');
  const patientAge = localStorage.getItem('patientAge');
  const patientgender = localStorage.getItem('patientgender');

  const parseToDate = (s?: string) => {
  if (!s) return null;
  // dd-mm-yyyy → Date
  const m1 = /^(\d{2})-(\d{2})-(\d{4})$/;
  const m2 = /^(\d{4})-(\d{2})-(\d{2})$/; // fallback for old ISO values
  let d: Date | null = null;

  if (m1.test(s)) {
    const [, dd, mm, yyyy] = s.match(m1)!;
    d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  } else if (m2.test(s)) {
    const [, yyyy, mm, dd] = s.match(m2)!;
    d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  return isNaN(d as any) ? null : d;
};


  return (
    <div className="container2">
      <Header1 />

      <div className="participant-info-container">
        <p className="participant-info-text"><strong>Participant: </strong>{pName} {patientAge}/{patientgender}</p>
        <p className="participant-info-text"><strong>ID:</strong> {regId}</p>
      </div>
      <br/>

      <h1 style={{ color: 'darkblue' }}>{titleName}</h1>
      

      <form className="clinic-form" onSubmit={(e) => e.preventDefault()}>
        {isLoading?
             <Loader isLoading={isLoading} />

        :
        <>
        {fieldData.map((field) => {
          if (hiddenFields.includes(field.testName)) return null;

          return (
            <div key={field.testName} className="form-group">
              <label style={{ color: 'black' }}>
                {field.testName}
                {field.isMandatory && <span style={{ color: 'red' }}> *</span>}
              </label>

              {/* SingleSelect */}
              {field.valueType === 'SingleSelect' && (
                <>
                  <select
                    value={(selectedValues[field.testName] as string) || ''}
                    onChange={(e) => handleSelectChange(field.testName, e.target.value)}
                  >
                    <option value="" disabled>Select a value</option>
                    {field.values.map(value => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                  {formErrors.includes(field.testName) && (
                    <span className="error-message">This field is required</span>
                  )}
                </>
              )}

              {/* Multi Select */}
              {field.valueType === 'Multi Select' && (
                <>
                  <Select
                    isMulti
                    name={field.testName}
                    options={field.values.map((v) => ({ value: v, label: v }))}
                    value={
                      Array.isArray(selectedValues[field.testName])
                        ? (selectedValues[field.testName] as string[]).map(v => ({ value: v, label: v }))
                        : []
                    }
                    onChange={(option: MultiValue<ColourOption>) =>
                      handleSelectChange(field.testName, (option || []).map(opt => opt.value))
                    }
                    className="form-group"
                  />
                  {formErrors.includes(field.testName) && (
                    <span className="error-message">This field is required</span>
                  )}
                </>
              )}

              {/* Input */}
              {field.valueType === 'Input' && (
                <>
                  <input
                    type="text"
                    placeholder="Enter value"
                    value={(selectedValues[field.testName] as string) || ''}
                    onChange={(e) => handleInputChange(field.testName, e.target.value)}
                  />
                  {formErrors.includes(field.testName) && (
                    <span className="error-message">This field is required</span>
                  )}
                </>
              )}

              {/* Date */}
             {field.valueType === 'Date' && (
  <>
    <div className="input-with-icon">
      <Calendar
        value={parseToDate(selectedValues[field.testName] as string)}
        onChange={(e) => {
          const date = e.value as Date | null;
          if (date) {
            // dd-mm-yyyy
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
      <img src="./assets/Calendar.png" className="clinic-id-icon" alt="calendar icon" />
    </div>
    {formErrors.includes(field.testName) && (
      <span className="error-message">This field is required</span>
    )}
  </>
)}


              {/* SingleSelectButton */}
              {field.valueType === 'SingleSelectButton' && (
                <>
                  <div className="gender-group">
                    {field.values.map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={`gender-btn ${selectedValues[field.testName] === value ? 'active' : ''}`}
                        onClick={() => handleSelectChange(field.testName, value)}
                      >
                        {value}
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
        </>

      }
        <center className="buttons">
          <button
            type="button"
            className="Next-button"
            onClick={handleSave}
            // disabled={!allowAllThree}
          >
            Save
          </button>

          <button
            type="button"
            className={`Finish-button ${finishDisabled || !allowAllThree ? 'disabled-button' : ''}`}
            onClick={handleFinish}
            disabled={finishDisabled || !allowAllThree}
          >
            Finish
          </button>
        </center>
      </form>

      <footer className="footer-container">
        <div className="footer-content">
          <p className="footer-text">Powered By</p>
          <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="footer-logo" />
        </div>
      </footer>
    </div>
  );
};

export default App;
