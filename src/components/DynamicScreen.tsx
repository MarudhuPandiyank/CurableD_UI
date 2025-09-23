import React, { useEffect, useMemo, useState } from 'react';
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

interface ApiResponse {
  id: number;
  testMetrics: { params: Field[] };
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

interface ColourOption {
  value: string;
  label: string;
}

const App: React.FC = () => {
  const navigate = useNavigate();

  // privileges (kept, no BAU change)
  const { canView, canCreate, canEdit } = useSelector(
    selectPrivilegeFlags('Patient Registration')
  );
  const allowAllThree = useSelector(canAll('/management', 'CREATE', 'VIEW', 'EDIT'));

  // ids from LS
  const diseaseTestIds = localStorage.getItem('diseaseTestIds') || '';
  const candidateId = Number(localStorage.getItem('candidateId') || localStorage.getItem('patientId') || 0);

  // definitions + selection state
  const [fields, setFields] = useState<Field[]>([]);
  const [selected, setSelected] = useState<Record<string, string | string[]>>({});
  const [hidden, setHidden] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [multiParam, setMultiParam] = useState<readonly ColourOption[]>([]);
  const [titleName, setTitleName] = useState('Clinical Evaluation');

  // small helpers
  const normalizeArray = (v: unknown): string[] =>
    Array.isArray(v) ? (v as string[]).filter(Boolean) : typeof v === 'string' ? [v] : [];

  const isTriggered = (current: string | string[] | undefined, trigger: string) => {
    if (Array.isArray(current)) return current.includes(trigger);
    return current === trigger;
  };

  // Build dependency graph once we have fields
  const graph = useMemo(() => {
    const parentToChildren = new Map<
      string,
      Array<{ child: string; trigger: string }>
    >();
    const all = new Set<string>();
    const children = new Set<string>();

    fields.forEach(f => {
      all.add(f.testName);
      (f.condition || []).forEach(c => {
        const arr = parentToChildren.get(f.testName) || [];
        arr.push({ child: c.enabledField, trigger: c.triggerValue });
        parentToChildren.set(f.testName, arr);
        children.add(c.enabledField);
      });
    });

    const roots = Array.from(all).filter(n => !children.has(n));
    return { parentToChildren, roots, all };
  }, [fields]);

  // Compute hidden fields from selections
  const computeHidden = (selections: Record<string, string | string[]>) => {
    const { parentToChildren, roots, all } = graph;
    if (fields.length === 0) return [];

    const visible = new Set<string>(roots);
    const q = [...roots];

    while (q.length) {
      const p = q.shift() as string;
      const kids = parentToChildren.get(p) || [];
      for (const { child, trigger } of kids) {
        if (isTriggered(selections[p], trigger)) {
          if (!visible.has(child)) {
            visible.add(child);
            q.push(child);
          }
        }
      }
    }
    return Array.from(all).filter(n => !visible.has(n));
  };

  // Fetch definitions + prefill
  useEffect(() => {
    const run = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        // 1) definitions
        const def = await axios.get<ApiResponse>(
          `${config.appURL}/curable/getMetricsById/${diseaseTestIds}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const params = (def.data?.testMetrics?.params || []).filter(
          (f) => f.testName !== 'Referred for'
        );
        setFields(params);

        // for your multiParam usage (unchanged BAU)
        setMultiParam(
          params.map(d => ({ value: d.testName, label: d.testName }))
        );

        // 2) prefill (safe if none)
        try {
          const pre = await axios.post<PrefillResponse>(
            `${config.appURL}/curable/candidatehistoryForPrefil`,
            {
              candidateId,
              type: 7,               // keep/update if your API expects this screen type
              diseaseTypeId: Number(diseaseTestIds) // or diseaseTestMasterId, per backend
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const hist = pre.data?.testResult?.params || [];
          // Build initial selected map respecting valueType
          const initial: Record<string, string | string[]> = {};
          params.forEach(f => {
            const hit = hist.find(h => h.testName === f.testName);
            if (!hit) return;
            const arr = normalizeArray(
              hit.selectedValues ?? hit.values ?? hit.value
            );
            if (f.valueType === 'Multi Select') {
              initial[f.testName] = arr;
            } else {
              initial[f.testName] = arr[0] || '';
            }
          });

          setSelected(initial);
          setHidden(computeHidden(initial));
        } catch {
          // No prefill — show only roots
          setHidden(computeHidden({}));
        }
      } catch (e) {
        console.error('Failed to load definitions/prefill', e);
      }
    };

    if (diseaseTestIds) run();
  }, [diseaseTestIds]); // eslint-disable-line react-hooks/exhaustive-deps

  // Title mapping (kept)
  useEffect(() => {
    const raw = (localStorage.getItem('selectedStage') || '').toLowerCase().trim();
    if (raw === 'breast screening test') setTitleName('Breast Screening');
    else if (raw === 'oral screening test') setTitleName('Oral Screening');
    else if (raw === 'cervical screening test') setTitleName('Cervical Screening');
    else setTitleName('Clinical Evaluation');
  }, []);

  // Change handler (updates visibility; clears values that became hidden)
  const onValueChange = (testName: string, value: string | string[]) => {
    const next = { ...selected, [testName]: value };
    const nextHidden = computeHidden(next);

    // clear selections for any field that just became hidden
    const prevHidden = new Set(hidden);
    const nowHidden = new Set(nextHidden);
    Object.keys(next).forEach(k => {
      if (!prevHidden.has(k) && nowHidden.has(k)) {
        delete next[k];
      }
    });

    setSelected(next);
    setHidden(nextHidden);
    if (formErrors.includes(testName)) {
      setFormErrors(errs => errs.filter(e => e !== testName));
    }
  };

  // “No” early-exit flow (if you have such a control)
  const isNoFlow = Object.entries(selected).some(
    ([name, val]) => /clinical evaluation/i.test(name) && val === 'No'
  );

  // Validation only for visible, mandatory fields
  const validateForFinish = () => {
    const missing = fields
      .filter(f => !hidden.includes(f.testName) && f.isMandatory)
      .map(f => f.testName)
      .filter(name => {
        const v = selected[name];
        return v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
      });

    setFormErrors(missing);
    return missing.length === 0;
  };

  // payload builder (completed: 0 = Save, 1 = Finish)
  const buildPayload = (completed: 0 | 1) => {
    return {
      candidateId,
      diseaseTestMasterId: Number(diseaseTestIds),
      description: 'Test Metrics',
      diseaseTestId: 1,
      testMetrics: {
        params: fields.map(f => ({
          testName: f.testName,
          subtestName: f.subtestName,
          selectedValues: selected[f.testName]
            ? Array.isArray(selected[f.testName])
              ? (selected[f.testName] as string[])
              : [selected[f.testName] as string]
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
      stage: localStorage.getItem('selectedStage'),
      type: 3,
      completed
    };
  };

  // Save (no validation)
  const handleSave = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    try {
      const token = localStorage.getItem('token') || '';
      await axios.post(`${config.appURL}/curable/candidatehistory`, buildPayload(0), {
        headers: { Authorization: `Bearer ${token}` },
      });
      // If your flow wants to move forward on Save (like your ref code), navigate:
      navigate('/SuccessMessageClinicalFInal');
      // alert('Saved');
    } catch (error) {
      console.error('Save failed', error);
      alert('Save failed. Please try again.');
    }
  };

  // Finish (requires validation)
  const handleFinish = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (isNoFlow) return; // (kept as your guard)
    if (!validateForFinish()) return;

    try {
      const token = localStorage.getItem('token') || '';
      await axios.post(`${config.appURL}/curable/candidatehistory`, buildPayload(1), {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/SuccessMessageClinicalFInal');
    } catch (error) {
      console.error('Submit failed', error);
      alert('Submit failed. Please try again.');
    }
  };

  const finishDisabled =
    !allowAllThree || // respect your privilege gate
    isNoFlow ||
    fields.some(f => {
      if (hidden.includes(f.testName)) return false;
      if (!f.isMandatory) return false;
      const v = selected[f.testName];
      return v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
    });

  // LS bits for header
  const ptName = localStorage.getItem('ptName') || localStorage.getItem('patientName');
  const registrationId = localStorage.getItem('registrationId');
  const patientAge = localStorage.getItem('patientAge');
  const patientgender = localStorage.getItem('patientgender');

  return (
    <div className="container2">
      <Header1 />

      <div className="participant-info-container">
        <p className="participant-info-text">
          <strong>Participant: </strong>{ptName} {patientAge}/{patientgender}
        </p>
        <p className="participant-info-text"><strong>ID: </strong>{registrationId}</p>
      </div>

      <div className="clinic-details-form-newscreening">
        <h1 style={{ color: 'darkblue' }}>{titleName}</h1>

        {fields.map((field) => {
          if (hidden.includes(field.testName)) return null;

          return (
            <div key={field.testName} className="form-group">
              <label style={{ fontSize: '15px' }}>
                {field.testName}{' '}
                {field.isMandatory && <span style={{ color: 'red' }}>*</span>}
              </label>

              {/* SingleSelect */}
              {field.valueType === 'SingleSelect' && (
                <>
                  <select
                    value={(selected[field.testName] as string) || ''}
                    onChange={(e) => onValueChange(field.testName, e.target.value)}
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

              {/* Multi Select */}
              {field.valueType === 'Multi Select' && (
                <>
                  <Select
                    isMulti
                    options={field.values.map((val) => ({ value: val, label: val }))}
                    value={
                      Array.isArray(selected[field.testName])
                        ? (selected[field.testName] as string[]).map(v => ({ value: v, label: v }))
                        : []
                    }
                    onChange={(options: MultiValue<ColourOption>) =>
                      onValueChange(field.testName, (options || []).map(o => o.value))
                    }
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
                    value={(selected[field.testName] as string) || ''}
                    onChange={(e) => onValueChange(field.testName, e.target.value)}
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
                      value={
                        selected[field.testName]
                          ? new Date(selected[field.testName] as string)
                          : null
                      }
                      onChange={(e) => {
                        if (e.value) {
                          const date = e.value as Date;
                          // format yyyy-mm-dd in local
                          const localDate = new Date(
                            date.getTime() - date.getTimezoneOffset() * 60000
                          ).toISOString().split('T')[0];
                          onValueChange(field.testName, localDate);
                        }
                      }}
                      dateFormat="yy-mm-dd"
                      placeholder="yyyy-mm-dd"
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
                    {field.values.map((val) => (
                      <button
                        key={val}
                        type="button"
                        className={`gender-btn ${selected[field.testName] === val ? 'active' : ''}`}
                        onClick={() => onValueChange(field.testName, val)}
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
            {/* Save does not validate */}
            <button className="Next-button" onClick={handleSave}>Save</button>

            {/* Finish validates; stays disabled until all visible mandatory fields are set */}
            <button
              className={`Finish-button ${finishDisabled ? 'disabled-button' : ''}`}
              onClick={handleFinish}
              disabled={finishDisabled}
            >
              Finish
            </button>
          </div>
        </center>
        <br />
      </div>

      <footer className="footer-container-fixed">
        <div className="footer-content">
          <p className="footer-text">Powered By</p>
          <img
            src="/assets/Curable logo - rectangle with black text.png"
            alt="Curable Logo"
            className="footer-logo"
          />
        </div>
      </footer>
    </div>
  );
};

export default App;
