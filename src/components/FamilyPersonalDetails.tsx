import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FamilyPersonalDetails.css';
import { useNavigate } from 'react-router-dom';
import Header1 from './Header1';
import config from '../config';

interface FamilyMetricsParam {
  testName: string;
  subtestName: string;
  condition: string | null;
  valueType: string;
  values: string[];
  selectedValues: string[];
}

interface ApiResponse {
  familyMetrics: {
    params: FamilyMetricsParam[];
  };
}

interface PrefillApiResponse_Flat {
  familyMetrics: {
    params: FamilyMetricsParam[];
  } | null;
}

// We keep the types above minimal and use `any` in the prefill parsing to accept both shapes.

function FamilyPersonalDetails() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FamilyMetricsParam[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>[]>([]);
  const [expandedMemberIndex, setExpandedMemberIndex] = useState<number | null>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFamilyPersonalMetrics = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Token is missing. Please log in again.');
          return;
        }

        // 1) Metrics definition (field list) – flat { params: [...] }
        const response = await axios.get<ApiResponse>(`${config.appURL}/curable/getMetrics/FAMILY_PERSONAL`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData(response.data.familyMetrics.params);

        // 2) Prefill – may be grouped array OR flat object
        const prefillResponse = await axios.post<PrefillApiResponse_Flat | any>(
          `${config.appURL}/curable/candidatehistoryForPrefil`,
          {
            candidateId: localStorage.getItem('patientId'),
            type: 4,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Helper: turn a params[] into a simple record keyed by testName
        const paramsToRecord = (params: any[]) => {
          const rec: Record<string, string> = {};
          params?.forEach((p: any) => {
            const key = (p?.testName ?? '').trim();
            const val = (p?.selectedValues?.[0] ?? '').trim();
            if (key) rec[key] = val;
          });
          return rec;
        };

        const fm: any = prefillResponse?.data?.familyMetrics;

        if (fm != null) {
          // CASE 1: GROUPED (array) -> one member per group
          if (Array.isArray(fm)) {
            const values = fm.map((g: any) => {
              const rec = paramsToRecord(g?.params ?? []);
              // preserve group-level metadata so we can send it back on submit
              if (g?.id !== undefined) rec.__groupId = g.id;
              if (g?.repeat !== undefined) rec.__repeat = g.repeat;
              if (g?.repeatlabel !== undefined) rec.__repeatlabel = g.repeatlabel;
              return rec;
            });
            setFormValues(values.length ? values : []);
            setExpandedMemberIndex(values.length ? 0 : null);
          }
          // CASE 2: FLAT ({ params: [...] }) -> chunk by field count from definition
          else if (Array.isArray(fm.params)) {
            const all = fm.params;
            const fieldsPerMember = response.data.familyMetrics.params.length;
            const members: Record<string, string>[] = [];
            for (let i = 0; i < all.length; i += fieldsPerMember) {
              members.push(paramsToRecord(all.slice(i, i + fieldsPerMember)));
            }
            setFormValues(members.length ? members : []);
            setExpandedMemberIndex(members.length ? 0 : null);
          } else {
            // Unknown – start empty
            setFormValues([]);
            setExpandedMemberIndex(null);
          }
        } else {
          // No prefill
          setFormValues([]);
          setExpandedMemberIndex(0);
        }

      } catch (error) {
        console.error('Error fetching family personal metrics:', error);
        setError('Failed to load family personal metrics.');
      }
    };

    fetchFamilyPersonalMetrics();
  }, []);

  const handleFieldChange = (index: number, testName: string, value: string) => {
    const trimmedName = testName.trim();

    if (trimmedName.toLowerCase().includes('monthlyincome')) {
      if (value === '' || /^\d{1,6}$/.test(value)) {
        const parsed = parseInt(value, 10);
        if (!isNaN(parsed) && parsed > 999999) return;
        if (/^0\d+/.test(value)) return; // prevent leading zeros
      } else {
        return;
      }
    }
    const updatedFormValues = [...formValues];
    updatedFormValues[index] = {
      ...updatedFormValues[index],
      [trimmedName]: value,
    };
    setFormValues(updatedFormValues);
  };

  const handleAddMember = () => {
    if (formValues.length === 0) {
      setFormValues([{}]);
      setExpandedMemberIndex(0);
      return;
    }

    const lastMember = formValues[formValues.length - 1];
    const hasData = Object.values(lastMember).some(value => (value ?? '').toString().trim() !== '');

    if (!hasData) {
      alert('Please fill at least one field before adding another member.');
      return;
    }

    setFormValues(prev => [...prev, {}]);
    setExpandedMemberIndex(formValues.length);
  };

  const handleDeleteMember = (index: number) => {
    setFormValues(prev => prev.filter((_, i) => i !== index));
    if (expandedMemberIndex === index) setExpandedMemberIndex(null);
  };

  // ✅ FIXED: build payload with ALL fields defined in formData, and skip empty members
  const buildPayload = () => {
    const norm = (s: string) => (s ?? '').trim();

    // keep members that have at least one non-empty field
    const nonEmptyMembers = (formValues || []).filter(m =>
      Object.values(m || {}).some(v => norm(String(v)) !== '')
    );

    const groups = nonEmptyMembers.map(member => {
      const params = formData.map(def => {
        const key = norm(def.testName);
        const val = norm(String(member[key] ?? ''));
        return {
          ...def,
          testName: def.testName,
          subtestName: def.subtestName,
          valueType: def.valueType,
          values: def.values,
          selectedValues: val ? [val] : [],
        };
      });
      // include preserved group-level metadata if present
      const groupId = (member as any)?.__groupId ?? null;
      const groupRepeat = (member as any)?.__repeat ?? null;
      const groupRepeatLabel = (member as any)?.__repeatlabel ?? null;

      const groupObj: any = {
        params,
        repeat: groupRepeat,
        repeatlabel: groupRepeatLabel,
      };
      if (groupId !== null && groupId !== undefined) groupObj.id = groupId;
      return groupObj;
    });

    return {
      description: 'Family Personal Metrics',
      diseaseTestId: 1,
      familyMetrics: groups,
      familyMedicalMetrics: null,
      eligibilityMetrics: null,
      gender: 'FEMALE',
      genderValid: true,
      hospitalId: 1,
      id: 27,
      medicalMetrics: null,
      name: 'Family Personal Metrics',
      stage: 'FAMILY_PERSONAL',
      testMetrics: null,
      type: 1,
      candidateId: Number(localStorage.getItem('patientId')),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submitPayload();
    if (ok) navigate('/FamilyMedicalDetails');
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submitPayload();
    if (ok) navigate('/SuccessMessagePRFinal');
  };

  // Prev should submit the same payload and then navigate back to MedicalomenHealthDetails
  const handlePrevClick = async (e?: React.MouseEvent) => {
    // if called from a button click event, prevent default behavior if present
    if (e && typeof (e.preventDefault) === 'function') e.preventDefault();
    const ok = await submitPayload();
    if (ok) navigate('/MedicalomenHealthDetails');
  };

  // Shared submit helper used by Prev, Next and Finish
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
      console.log('Data submitted successfully!');
      return true;
    } catch (error) {
      console.error('Submit Error:', error);
      setError('Failed to submit data.');
      return false;
    }
  };

  const patientId = localStorage.getItem('patientId');
  const patientName = localStorage.getItem('patientName');
  const participant = localStorage.getItem('participant');
  const registraionId = localStorage.getItem('registraionId');

  if (!patientId || !patientName) {
    return <div className="error-message">Missing patient information. Please log in again.</div>;
  }

  return (
    <div className="container3">
      <Header1 />
      <div className="participant-container">
        <p className="participant-info-text">
          <strong>Participant: </strong> {participant}
        </p>
        <p className="participant-info-text">
          <strong>ID:</strong> {registraionId}
        </p>
      </div>

      <h1 style={{ color: 'darkblue', fontWeight: 'bold' }}>Family Personal Details</h1>
      {error && <div className="error-message">{error}</div>}

      <form className="clinic-form" onSubmit={handleSubmit}>
        {formValues.length > 0 &&
          formValues.map((_, formIndex) => (
            <div key={formIndex} className="family-member-row">
              {expandedMemberIndex !== formIndex ? (
                <div
                  className="member-name"
                  onClick={() => setExpandedMemberIndex(formIndex)}
                  style={{
                    cursor: 'pointer',
                    padding: '10px',
                    backgroundColor: '#f4f4f4',
                    border: '1px solid #ccc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: formIndex === formValues.length - 1 ? '20px' : '0px',
                  }}
                >
                  <span>{formValues[formIndex][formData[0]?.testName.trim()] || 'Member'}</span>
                  <i
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMember(formIndex);
                    }}
                    className="fa-solid fa-trash-can float-end"
                  ></i>
                </div>
              ) : (
                <div className="family-member-form">
                  <div
                    className="member-header"
                    onClick={() => setExpandedMemberIndex(null)}
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
                    <span>
                      {formValues[formIndex][formData[0]?.testName.trim()] || 'Member'} (Click to collapse)
                    </span>
                    <i
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMember(formIndex);
                      }}
                      className="fa-solid fa-trash-can float-end"
                    ></i>
                  </div>

                  {formData.map((field, index) => {
                    const trimmedName = field.testName.trim();
                    const value = formValues[formIndex][trimmedName] || '';
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
                              <option key={i} value={val.trim()}>
                                {val.trim()}
                              </option>
                            ))}
                          </select>
                        ) : field.valueType === 'Button' ? (
                          <div className="gender-group">
                            {field.values.map((val, i) => {
                              const trimmedVal = val.trim();
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
                        ) : trimmedName.toLowerCase() === 'age' ? (
                          <input
                            type="number"
                            min={1}
                            max={99}
                            value={value}
                            placeholder="Enter Age"
                            onChange={(e) => {
                              let v = e.target.value;
                              if (
                                v === '' ||
                                (/^\d{1,2}$/.test(v) && Number(v) >= 1 && Number(v) <= 99)
                              ) {
                                handleFieldChange(formIndex, trimmedName, v);
                              }
                            }}
                          />
                        ) : trimmedName.toLowerCase().includes('monthlyincome') ? (
                          <input
                            type="text"
                            inputMode="numeric"
                            value={value}
                            placeholder="Enter Monthly Income"
                            onChange={(e) => handleFieldChange(formIndex, trimmedName, e.target.value)}
                          />
                        ) : (
                          <input
                            type="text"
                            value={value}
                            placeholder={`Enter ${field.testName}`}
                            onChange={(e) => handleFieldChange(formIndex, trimmedName, e.target.value)}
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
          <button type="button" className="Next-button_familydetails" onClick={handleAddMember}>
            Add Member
          </button>
        </div>

        <center className="buttons">
          <button type="button" className="Finish-button" onClick={handlePrevClick}>
            Prev
          </button>
          <button type="button" className="Next-button" onClick={handleFinish}>
            Finish
          </button>
          <button type="submit" className="Finish-button">
            Next
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
}

export default FamilyPersonalDetails;
