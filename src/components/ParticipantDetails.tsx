import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header1 from './Header1';
import './ParticipantDetails.css';
import axios from 'axios';
import config from '../config';
import './NewScreeningEnrollment.css';
import './Common.css';

interface Habit {
  habit: string;
  habitType: string;
  frequency: string;
  quit: string;
  howLong: string;
  isOpen: boolean;
}

interface FamilyMetricsParam {
  testName: string;
  subtestName: string;
  condition: string | null;
  valueType: string;
  values: string[];
  selectedValues: string[];
}

interface PrefillApiResponse {
  id: string | null;
  registraionId: string | null;
  campId: string | null;
  optionalId: string | null;
  name: string | null;
  gender: string | null;
  age: number | null;
  maritalStatus: string | null;
  spouseName: string;
  mobileNo: string | null;
  aadhar: string;
  address: string | null;
  email: string | null;
  tobaccoUser: boolean;
  parentCandidateId: string | null;
  surveyStatus: string | null;
  consentDate: string | null;
  consentSign: string | null;
  dob: string | null;
  streetId: string | null;
  fatherName: string;
  alternateMobileNo: string;
  occupation: string;
  monthlyIncome: number;
  houseType: string;
  voterId: string;
  education: string;
  rationCard: string;
  hospitalId: string | null;
  reason: string | null;
  eligibleDiseases: string | null;
  candidateHabitDTOs: {
    candidateId: number;
    id: number;
    habits: string;
    type: string;
    duration: number;
    frequency: string;
    quit: boolean;
    howLong: string;
  }[];
}

const ParticipantDetails: React.FC = () => {
  const [houseType, setHouseType] = useState<string>('');
  const [selectedToggle1, setSelectedToggle1] = useState<string | null>(null);
  const [education, setEducation] = useState<string>('');
  const [occupation, setOccupation] = useState<string>('');
  const [fatherName, setFatherName] = useState<string>('');
  const [spouseName, setSpouseName] = useState<string>('');
  const [altMobile, setAltMobile] = useState<string>('');
  const [income, setIncome] = useState<string>('');
  const [aadhaar, setAadhaar] = useState<string>('');              // Aadhaar value
  const [voterId, setVoterId] = useState<string>('');
  const [rationCard, setRationCard] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [tag, setTag] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [habitType, setHabitType] = useState<string>('');
  const [frequency, setFrequency] = useState<string>('');
  const [quit, setQuit] = useState<string>('');
  const [howLong, setHowLong] = useState<string>('');
  const [habitTypes, setHabitTypes] = useState<string[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<string>('');
  const [selectedHabitType, setSelectedHabitType] = useState<string>('');
  const [hasTobaccoHabit, setHasTobaccoHabit] = useState('No');
  const [hasQuit, setHasQuit] = useState('');
  const [altMobileError, setAltMobileError] = useState('');        // Alternate mobile inline error
  const [aadhaarError, setAadhaarError] = useState('');            // Aadhaar inline error
  const [habits, setHabits] = useState<Habit[]>([
    { habit: '', habitType: '', frequency: '', quit: '', howLong: '', isOpen: true },
  ]);

  const navigate = useNavigate();

  const toggleOption = (setOption: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setOption(value);
  };

  const toggleOption1 = (option: string) => {
    setSelectedToggle1(option);
  };

  const fetchPrefillData = async () => {
    try {
      const token = localStorage.getItem('token');
      const patientId = localStorage.getItem('patientId');

      if (!token || !patientId) {
        console.error('Token or Patient ID not found');
        alert('Session expired. Please log in again.');
        return;
      }

      const response = await axios.post<PrefillApiResponse>(
        `${config.appURL}/curable/candidatehistoryForPrefil`,
        { candidateId: patientId, type: 2 },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        const data = response.data;

        setHouseType(data.houseType || '');
        setEducation(data.education || '');
        setOccupation(data.occupation || '');
        setFatherName(data.fatherName || '');
        setSpouseName(data.spouseName || '');
        setAltMobile(data.alternateMobileNo || '');
setIncome(data.monthlyIncome === 0 ? '' : (data.monthlyIncome?.toString() || ''));
        setAadhaar(data.aadhar || '');
        setVoterId(data.voterId || '');
        setRationCard(data.rationCard || '');

        if (data.candidateHabitDTOs && data.candidateHabitDTOs.length > 0) {
          setHasTobaccoHabit('Yes');

          const mappedHabits: Habit[] = data.candidateHabitDTOs.map((habit, idx) => ({
            habit: habit.habits || '',
            habitType: habit.type || '',
            frequency: habit.frequency || '',
            quit: habit.quit ? 'Yes' : 'No',
            howLong: habit.howLong?.toString() || '',
            isOpen: idx === 0,
          }));

          setHabits(mappedHabits);

          const firstHabit = data.candidateHabitDTOs[0];
          setDuration(firstHabit.duration?.toString() || '');
          setHowLong(firstHabit.howLong?.toString() || '');
          setHasQuit(firstHabit.quit ? 'Yes' : 'No');

          for (const habit of mappedHabits) {
            if (habit.habit) {
              await fetchHabitTypes(habit.habit);
            }
          }
        } else {
          setHasTobaccoHabit('No');
          setHabits([{ habit: '', habitType: '', frequency: '', quit: '', howLong: '', isOpen: true }]);
        }

        console.log('Prefill Data:', data);
      } else {
        console.error('Error:', response.statusText);
        alert(`Error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while fetching prefill data.');
    }
  };

  useEffect(() => {
    fetchPrefillData();
  }, []);

  // ---- Inline validators (do not change other logic) ----
  const validateAltMobileInline = (val: string) => {
    if (val.length === 0) {
      setAltMobileError('');
    } else if (val.length !== 10) {
      setAltMobileError('Alternate Mobile No must be exactly 10 digits.');
    } else {
      setAltMobileError('');
    }
  };

  const validateAadhaarInline = (val: string) => {
    if (val.length === 0) {
      setAadhaarError('');
    } else if (val.length !== 12) {
      setAadhaarError('Aadhaar Number must be exactly 12 digits.');
    } else {
      setAadhaarError('');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent, navigateTo: string) => {
    e.preventDefault();

    const tobaccoUser = selectedToggle1 === 'yes';

    // Block submit if invalid alt mobile
    if (altMobile && altMobile.length !== 10) {
      setAltMobileError('Alternate Mobile No must be exactly 10 digits.');
      return;
    } else {
      setAltMobileError('');
    }

    // Block submit if invalid aadhaar
    if (aadhaar && aadhaar.length !== 12) {
      setAadhaarError('Aadhaar Number must be exactly 12 digits.');
      return;
    } else {
      setAadhaarError('');
    }

    console.log(habits, 'habits');
   const candidateHabitDTOs = habits.map((habit) => ({
  candidateId: localStorage.getItem('patientId'),
  duration: tobaccoUser ? (duration ? parseFloat(duration) : null) : null,  // Set to null if duration is empty
  frequency: habit.frequency || null,  // Set to null if frequency is empty
  habits: habit.habit || null,  // Set to null if habit is empty
  howLong: habit.howLong ? parseFloat(habit.howLong) : null,  // Set to null if howLong is empty
  quit: habit.quit === 'Yes' ? true : false,  // This can remain as is
  type: habit.habitType || null,  // Set to null if habitType is empty
}));


    const formData = {
      fatherName,
      spouseName,
      alternateMobileNo: altMobile,
      monthlyIncome:income? parseFloat(income) :null,
      houseType,
      occupation,
      education,
      aadhar: aadhaar,
      rationCard,
      voterId,
      tobaccoUser,
      duration: tobaccoUser ? parseFloat(duration) || 0 : null,
      id: localStorage.getItem('patientId') || '',
      candidateHabitDTOs,
      type: 3,
      screenId: 3,
    };

    const token = localStorage.getItem('token');

    if (!token) {
      console.error('Token not found');
      alert('Session expired. Please log in again.');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${config.appURL}/curable/candidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Success:', data);
        navigate(navigateTo);
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData);
        alert(`Error: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while submitting the form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const patientId = localStorage.getItem('patientId');
  const patientName = localStorage.getItem('patientName');

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const [error, setError] = useState('');

  const deleteHabit = (index: number) => {
    alert('Are you sure?');
    if (habits.length !== 1) {
      habits.splice(index, 1);
      setHabits([...habits]);
    } else {
      alert('Last index not delete');
    }
  };

  const handleInputChange = (index: number, field: string, value: string) => {
    const updatedHabits = [...habits];
    updatedHabits[index] = { ...updatedHabits[index], [field]: value };
    setHabits(updatedHabits);
  };

  const fetchHabitTypes = async (habit: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token not found');
        alert('Session expired. Please log in again.');
        return;
      }

      const response = await axios.get<string[]>(
        `${config.appURL}/curable/getHabitTypes/${habit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setHabitTypes(response.data);
        if (habit === 'Snuff') {
          setHabitTypes(['Snuff']);
        }
        if (habit === 'Others') {
          setHabitTypes(['Others']);
        }
      } else {
        console.error('Error:', response.statusText);
        alert(`Error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while fetching habit types. Please try again.');
    }
  };

  const handleHabitChange = (index: number, habit: string) => {
    const updatedHabits = [...habits];
    updatedHabits[index].habit = habit;
    fetchHabitTypes(habit);
    setHabits(updatedHabits);
  };

  useEffect(() => {
    console.log('Tobacco Habit changed to:', hasTobaccoHabit);
  }, [hasTobaccoHabit]);

  const addHabit = () => {
    const lastHabit = habits[habits.length - 1];
    const hasData = lastHabit.habit || lastHabit.habitType || lastHabit.frequency || lastHabit.quit;

    if (!hasData) {
      alert('Please fill at least one field before adding another habit.');
      return;
    }

    const updated = habits.map((h) => ({ ...h, isOpen: false }));

    setHabits([
      ...updated,
      { habit: '', habitType: '', frequency: '', quit: '', howLong: '', isOpen: true },
    ]);
  };

  const participant = localStorage.getItem('participant');
  const registraionId = localStorage.getItem('registraionId');

  const toggleCollapse = (index: number) => {
    const updatedHabits = [...habits];
    if (updatedHabits[index]) {
      updatedHabits[index].isOpen = !updatedHabits[index].isOpen;
    }
    setHabits(updatedHabits);
  };

  const handlePrevClick = () => {
    navigate('/DiseaseSpecificDetails');
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container2">
      <Header1 />

      <div className="participant-container">
        <p className="participant-info-text">
          <strong>Participant: </strong> {participant}
        </p>
        <p className="participant-info-text">
          <strong>ID:</strong> {registraionId}
        </p>
      </div>

      <h1 style={{ color: 'darkblue', fontWeight: 'bold' }}>General Details</h1>

      <div className="clinic-form" onSubmit={(e) => handleFormSubmit(e, '/MedicalomenHealthDetails')}>
        <div className="form-group">
          <label htmlFor="father-name">Father Name:</label>
          <input
            type="text"
            id="father-name"
            name="father-name"
            value={fatherName}
            onChange={(e) => setFatherName(e.target.value)}
            placeholder="Enter Father Name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="spouse-name">Spouse Name:</label>
          <input
            type="text"
            id="spouse-name"
            name="spouse-name"
            value={spouseName}
            onChange={(e) => setSpouseName(e.target.value)}
            placeholder="Enter Spouse Name"
          />
        </div>

        {/* Alternate Mobile — EXACTLY 10, inline error while typing */}
        <div className="form-group">
          <label htmlFor="alt-mobile">Alternate Mobile No:</label>
          <input
            type="text"
            inputMode="numeric"
            id="alt-mobile"
            name="alt-mobile"
            value={altMobile}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 10) {
                setAltMobile(value);
                validateAltMobileInline(value);
              }
            }}
            onBlur={(e) => validateAltMobileInline(e.target.value)}
            placeholder="Enter Alternate Mobile No"
            maxLength={10}
          />
          {altMobileError && <p style={{ color: 'red' }}>{altMobileError}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="income">Monthly Income:</label>
          <input
            type="text"
            id="income"
            name="income"
            inputMode="numeric"
            pattern="[0-9]*"
            value={income}
            onChange={(e) => {
              const value = e.target.value.replace(/^0+/, '').replace(/\D/g, '');
              const numericValue = parseInt(value, 10);
              if (!isNaN(numericValue) && numericValue <= 999999) {
                setIncome(value);
              } else if (value === '') {
                setIncome('');
              }
            }}
            placeholder="Enter Monthly Income"
            maxLength={6}
          />
        </div>

        <div className="form-group">
          <label>Type of House:</label>
          <div className="toggle-group">
            <button
              type="button"
              className={`gender-btn ${houseType === 'Owned' ? 'owned-active' : ''}`}
              onClick={() => toggleOption(setHouseType, 'Owned')}
            >
              Owned
            </button>
            <button
              type="button"
              className={`gender-btn ${houseType === 'Rental' ? 'rental-active' : ''}`}
              onClick={() => toggleOption(setHouseType, 'Rental')}
            >
              Rental
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="education">Education:</label>
          <select id="education" name="education" value={education} onChange={(e) => setEducation(e.target.value)}>
            <option value="" disabled>
              Select Education
            </option>
            <option value="NIL">NIL</option>
            <option value="primary">Primary</option>
            <option value="secondary">Middle school</option>
            <option value="graduate">High school</option>
            <option value="postgraduate">College</option>
            <option value="other">Others</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="occupation">Occupation:</label>
          <select id="occupation" name="occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)}>
            <option value="" disabled>
              Select Occupation
            </option>
            <option value="farmer">House wife</option>
            <option value="Laborer-skilled">Laborer-skilled</option>
            <option value="Laborer-Unskilled">Laborer-Unskilled</option>
            <option value="Teaching/Office">Teaching/Office jobs</option>
            <option value="Professional">Professional</option>
            <option value="Business">Business</option>
            <option value="Not-working">Not working</option>
            <option value="other">Others</option>
          </select>
        </div>

        <h2>ID Proof</h2>

        {/* Aadhaar — EXACTLY 12, inline error while typing */}
        <div className="form-group">
          <label htmlFor="aadhaar">Aadhaar Number:</label>
          <input
            type="text"
            id="aadhaar"
            name="aadhaar"
            inputMode="numeric"
            pattern="\d*"
            value={aadhaar}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 12); // only digits, max 12
              setAadhaar(value);
              validateAadhaarInline(value);
            }}
            onBlur={(e) => validateAadhaarInline(e.target.value)}
            placeholder="Enter Aadhaar Number"
            maxLength={12}
          />
          {aadhaarError && <p style={{ color: 'red' }}>{aadhaarError}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="voter-id">Voter ID:</label>
          <input
            type="text"
            id="voter-id"
            name="voter-id"
            value={voterId}
            onChange={(e) => {
              const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
              setVoterId(value);
            }}
            placeholder="Enter Voter ID"
            maxLength={12}
          />
        </div>

        <div className="form-group">
          <label htmlFor="ration-card">Ration Card:</label>
          <input
            type="text"
            id="ration-card"
            name="ration-card"
            value={rationCard}
            onChange={(e) => {
              const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15);
              setRationCard(value);
            }}
            placeholder="Enter Ration Card"
            maxLength={15}
          />
        </div>

        <div>
          <h2 style={{ marginBottom: '1px' }}>Social Habits</h2>
          <div className="social-habits-row">
            <label className="label-text">Tobacco/Alcohol Habits:</label>
            <div className="toggle-group">
              <button
                type="button"
                className={`gender-btn ${hasTobaccoHabit === 'Yes' ? 'yes-active' : ''}`}
                onClick={() => setHasTobaccoHabit('Yes')}
              >
                Yes
              </button>
              <button
                type="button"
                className={`gender-btn ${hasTobaccoHabit === 'No' ? 'no-active' : ''}`}
                onClick={() => setHasTobaccoHabit('No')}
              >
                No
              </button>
            </div>
          </div>

          {hasTobaccoHabit === 'Yes' && (
            <div className="habit-box">
              {habits.map((habit, index) => (
                <div key={index} style={{ marginBottom: '1rem' }}>
                  <div onClick={() => toggleCollapse(index)} className="habits">
                    <span>{habit.habit || 'Select Habit'}</span>
                    <i onClick={() => deleteHabit(index)} className="fa-solid fa-trash-can"></i>
                  </div>

                  {habit.isOpen && (
                    <div>
                      <div>
                        <label>
                          Habits:
                          <select value={habit.habit} onChange={(e) => handleHabitChange(index, e.target.value)}>
                            <option value="">Select Habit</option>
                            <option value="Tobacco">Tobacco</option>
                            <option value="Smoking">Smoking</option>
                            <option value="Alcohol">Alcohol</option>
                            <option value="Snuff">Snuff</option>
                            <option value="Others">Others</option>
                          </select>
                        </label>
                      </div>

                      <div>
                        <label>
                          Habit Type:
                          <select
                            value={habit.habitType}
                            onChange={(e) => handleInputChange(index, 'habitType', e.target.value)}
                          >
                            <option value="">Select Habit Type</option>
                            {habitTypes.map((habitType, i) => (
                              <option key={i} value={habitType}>
                                {habitType}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <div>
                        <label>
                          Frequency/Day:
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[1-9][0-9]*"
                            value={habit.frequency}
                            placeholder="Enter Frequency"
                            onChange={(e) => {
                              const val = e.target.value;
                              if (/^[1-9][0-9]*$/.test(val) || val === '') {
                                handleInputChange(index, 'frequency', val);
                              }
                            }}
                          />
                        </label>
                      </div>

                      <div className="social-habits-row">
                        <label className="label-text">Quit, Yes/No:</label>
                        <div className="toggle-group">
                          <button
                            type="button"
                            className={`gender-btn ${hasQuit === 'Yes' ? 'yes-active' : ''}`}
                            onClick={() => setHasQuit('Yes')}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            className={`gender-btn ${hasQuit === 'No' ? 'no-active' : ''}`}
                            onClick={() => setHasQuit('No')}
                          >
                            No
                          </button>
                        </div>
                      </div>

                      {hasQuit === 'Yes' && (
                        <div>
                          <label>
                            How Long? (Yrs):
                            <input
                              type="text"
                              value={habit.howLong}
                              onChange={(e) => handleInputChange(index, 'howLong', e.target.value)}
                            />
                          </label>
                        </div>
                      )}

                      <hr />
                    </div>
                  )}
                </div>
              ))}

              <div className="button-container-addhabit">
                <button className="Next-button" onClick={addHabit}>
                  Add Habit
                </button>
              </div>
            </div>
          )}
        </div>

        {showModal && (
          <div className="custom-modal">
            <div className="custom-modal-content">
              <p style={{ textAlign: 'center', color: 'darkblue', fontWeight: 'bold' }}>
                Non mandatory fields are not provided. Are you sure you want to finish registration?
              </p>

              <div className="modal-buttons">
                <button className="Finish-button" type="button" onClick={(e) => handleFormSubmit(e, '/SuccessMessagePRFinal')}>
                  Yes
                </button>
                <button className="Next-button" type="button" onClick={closeModal}>
                  No
                </button>
              </div>
            </div>
          </div>
        )}

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>

      <div className="buttons">
        <button type="button" className="Finish-button" onClick={handlePrevClick}>
          Prev
        </button>
        <button type="button" className="Next-button" onClick={openModal}>
          Finish
        </button>
        <button
          type="submit"
          className="Finish-button"
          onClick={(e) => handleFormSubmit(e, '/MedicalomenHealthDetails')}
          disabled={isLoading}
        >
          {'Next'}
        </button>
      </div>

      <footer className="footer-container">
        <div className="footer-content">
          <p className="footer-text">Powered By</p>
          <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="footer-logo" />
        </div>
      </footer>
    </div>
  );
};

export default ParticipantDetails;
