import React, { useEffect, useState } from 'react';
import Header1 from './Header1';
import './HomePage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../config';

// ----- Types -----
interface FamilyMedicalParam {
  testName: string;
  subtestName: string;
  valueType: 'Input' | 'SingleSelect' | 'Button' | string;
  values: string[];
  selectedValues: string[];
}

interface MetricsResponse {
  testMetrics: { params: FamilyMedicalParam[] };
}

interface FamilyMemberGroup {
  params: FamilyMedicalParam[];
  repeat: string | null;
  repeatlabel: string | null;
}

type FamilyMedicalMetricsFlat = { params: FamilyMedicalParam[] };
type FamilyMedicalMetricsGrouped = FamilyMemberGroup[];

interface PrefillApiResponse {
  // NEW grouped array OR OLD flat object OR null
  familyMedicalMetrics: FamilyMedicalMetricsGrouped | FamilyMedicalMetricsFlat | null;
}

// ----- Type guards -----
const isGrouped = (x: unknown): x is FamilyMedicalMetricsGrouped =>
  Array.isArray(x) && x.every(g => g && typeof g === 'object' && Array.isArray((g as any).params));

const isFlat = (x: unknown): x is FamilyMedicalMetricsFlat =>
  !!x && typeof x === 'object' && Array.isArray((x as any).params);

// helper to convert an array of params into a { testName: selectedValue } map
const makeMemberMapFromParams = (paramsArray: FamilyMedicalParam[]) => {
  const memberValues: Record<string, string> = {};
  for (const p of paramsArray) {
    const key = (p.testName || '').trim();
    const val = (p.selectedValues?.[0] || '').trim();
    if (key) memberValues[key] = val;
  }
  return memberValues;
};

const FamilyMedicalDetails: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FamilyMedicalParam[]>([]);
  const [error, setError] = useState<string | null>(null);
  // each array element = one family member (map of fieldName -> value)
  const [formValues, setFormValues] = useState<Record<string, string>[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchFamilyMedicalMetrics = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Token is missing. Please log in again.');
          return;
        }

        // 1) Load master field definitions
         const hospitalId = localStorage.getItem('hospitalId');
        const response = await axios.get<MetricsResponse>(
          `${config.appURL}/curable/getMetrics/FAMILY_MEDICAL/${hospitalId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const masterParams = response.data?.testMetrics?.params || [];
        setFormData(masterParams);

        // 2) Prefill (type: 5) — support new grouped or old flat shapes
        const prefillResponse = await axios.post<PrefillApiResponse>(
          `${config.appURL}/curable/candidatehistoryForPrefil`,
          {
            candidateId: localStorage.getItem('patientId'),
            type: 5,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const fmRaw = prefillResponse.data?.familyMedicalMetrics;
        let prefilledMembers: Record<string, string>[] = [];

        if (isGrouped(fmRaw)) {
          prefilledMembers = fmRaw
            .map(group => {
              const m = mapParamsToMemberValuesSafe(group?.params);
              // preserve metadata if present so we can send it back later
              if (group && (group as any).id !== undefined) (m as any).__groupId = (group as any).id;
              if (group && (group as any).repeat !== undefined) (m as any).__repeat = (group as any).repeat;
              if (group && (group as any).repeatlabel !== undefined) (m as any).__repeatlabel = (group as any).repeatlabel;
              return m;
            })
            .filter(m => Object.keys(m).length > 0);
        } else if (isFlat(fmRaw)) {
          if (masterParams.length > 0) {
            const fieldsPerMember = masterParams.length;
            for (let i = 0; i < fmRaw.params.length; i += fieldsPerMember) {
              const chunk = fmRaw.params.slice(i, i + fieldsPerMember);
              prefilledMembers.push(makeMemberMapFromParams(chunk));
            }
          }
        } // else null/unknown -> empty

        if (prefilledMembers.length) {
          setFormValues(prefilledMembers);
          setExpandedIndex(0);
        } else {
          setFormValues([]);
          setExpandedIndex(null);
        }
      } catch (err) {
        console.error('Error fetching family medical metrics data:', err);
        setError('Failed to load family medical metrics. Please try again.');
      }
    };

    fetchFamilyMedicalMetrics();
  }, []);

  // safe wrapper in case params is undefined/null
  const mapParamsToMemberValuesSafe = (params?: FamilyMedicalParam[]) =>
    makeMemberMapFromParams(params ?? []);

  const handleFieldChange = (index: number, rawName: string, value: string) => {
    const testName = (rawName || '').trim();

    // example numeric guard for fields containing "Age at Diagnosis"
    if (testName.toLowerCase().includes('age at diagnosis')) {
      if (!/^\d*$/.test(value)) return;
      const n = value === '' ? NaN : parseInt(value, 10);
      if (!isNaN(n) && (n < 1 || n > 100)) return;
    }

    setFormValues(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [testName]: value };
      return updated;
    });
  };

  const handleAddMember = () => {
    if (formValues.length > 0) {
      const last = formValues[formValues.length - 1];
      const hasData = Object.values(last).some(v => (v ?? '').toString().trim() !== '');
      if (!hasData) {
        alert('Please fill at least one field before adding another member.');
        return;
      }
    }
    setFormValues(prev => [...prev, {}]);
    setExpandedIndex(formValues.length);
  };

  const handleToggleExpand = (index: number) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  const handleDeleteMember = (index: number) => {
    setFormValues(prev => prev.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
  };

  // Build grouped array the backend expects
  const buildPayload = () => {
    const groups: FamilyMemberGroup[] = formValues.map(member => {
      const paramsForMember = formData.map(field => {
        const key = (field.testName || '').trim();
        const v = (member[key] ?? '').toString().trim();
        return { ...field, selectedValues: v ? [v] : [] };
      });
      // attach preserved metadata when available
      const groupId = (member as any)?.__groupId ?? null;
      const groupRepeat = (member as any)?.__repeat ?? null;
      const groupRepeatLabel = (member as any)?.__repeatlabel ?? null;

      const groupObj: any = { params: paramsForMember, repeat: groupRepeat, repeatlabel: groupRepeatLabel };
      if (groupId !== null && groupId !== undefined) groupObj.id = groupId;
      return groupObj as FamilyMemberGroup;
    });

    return {
      description: 'Family Medical Metrics',
      diseaseTestId: 1,
      familyMedicalMetrics: groups, // NEW grouped array shape
      familyMetrics: null,
      eligibilityMetrics: null,
      gender: 'FEMALE',
      genderValid: true,
      hospitalId: 1,
      id: 28,
      medicalMetrics: null,
      name: 'Family Medical Metrics',
      stage: 'FAMILY_MEDICAL',
      testMetrics: null,
      type: 1,
      candidateId: Number(localStorage.getItem('patientId')),
    };
  };

  // Shared submit helper used by Prev and form submission
  const submitPayload = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token is missing. Please log in again.');
        return false;
      }

      await axios.post(`${config.appURL}/curable/candidatehistory`, buildPayload(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      return true;
    } catch (err) {
      console.error('Error submitting data:', err);
      setError('Failed to submit data. Please try again.');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submitPayload();
    if (ok) navigate('/SuccessMessagePRFinal');
  };

  const handlePrevClick = async () => {
    const ok = await submitPayload();
    if (ok) navigate('/FamilyPersonalDetails');
  };

  const participant = localStorage.getItem('participant');
  const registrationId = localStorage.getItem('registraionId');
  const firstFieldKey = (formData?.[0]?.testName || '').trim() || 'Relation';

  return (
    <div className="container2">
      <Header1 />
      <div className="participant-container">
        <p className="participant-info-text"><strong>Participant: </strong>{participant}</p>
        <p className="participant-info-text"><strong>ID:</strong> {registrationId}</p>
      </div>

      <h1 style={{ color: 'darkblue', fontWeight: 'bold' }}>Family Medical Details</h1>
      <span style={{ marginBottom: '10px' }}>
        Provide the details if any of the family members has cancer history
      </span>
      {error && <div className="error-message">{error}</div>}

      <form className="clinic-form" onSubmit={handleSubmit}>
        {formValues.map((formValue, formIndex) => (
          <div
            key={formIndex}
            className="family-member-form"
            style={{ marginBottom: formIndex === formValues.length - 1 ? '30px' : '15px' }}
          >
            <p
              onClick={() => handleToggleExpand(formIndex)}
              style={{
                cursor: 'pointer',
                padding: '10px',
                backgroundColor: '#e3e3e3',
                border: '1px solid #ccc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {formValue[firstFieldKey] || `${firstFieldKey} ${formIndex + 1}`}
              <i
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteMember(formIndex);
                }}
                className="fa-solid fa-trash-can float-end"
              ></i>
            </p>

            {expandedIndex === formIndex && (
              <div className="form-fields">
                {formData.map((field, index) => {
                  const trimmedName = (field.testName || '').trim();
                  const value = formValue[trimmedName] || '';

                  return (
                    <div key={index} className="form-group">
                      <label style={{ color: 'darkblue' }}>{field.testName}:</label>

                      {field.valueType === 'SingleSelect' ? (
                        <select
                          value={value}
                          onChange={(e) => handleFieldChange(formIndex, trimmedName, e.target.value)}
                        >
                          <option value="" disabled>
                            Select {field.testName}
                          </option>
                          {field.values.map((val, i) => (
                            <option key={i} value={(val || '').trim()}>
                              {(val || '').trim()}
                            </option>
                          ))}
                        </select>
                      ) : field.valueType === 'Button' ? (
                        <div className="gender-group">
                          {field.values.map((val, i) => {
                            const trimmedVal = (val || '').trim();
                            return (
                              <button
                                key={i}
                                type="button"
                                className={`gender-btn ${value === trimmedVal ? 'active' : ''}`}
                                onClick={() => handleFieldChange(formIndex, trimmedName, trimmedVal)}
                              >
                                {trimmedVal}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleFieldChange(formIndex, trimmedName, e.target.value)}
                          placeholder={`Enter ${field.testName}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        <div className="button-container">
          <button
            type="button"
            className="Next-button_familydetails"
            onClick={handleAddMember}
          >
            Add Member
          </button>
        </div>

        <center className="buttons">
          <button type="button" className="Next-button" onClick={handlePrevClick}>
            Prev
          </button>
          <button type="submit" className="Finish-button">
            Finish
          </button>
        </center>
        <br />
        <br />
      </form>

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

export default FamilyMedicalDetails;
