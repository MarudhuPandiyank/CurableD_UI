import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header1 from './Header1';
import './ParticipantDetails.css';
import axios from 'axios';
interface Habit {
  habit: string;
  habitType: string;
  frequency: string;
  quit: string;
  isOpen: boolean;
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
  const [aadhaar, setAadhaar] = useState<string>('');
  const [voterId, setVoterId] = useState<string>('');
  const [rationCard, setRationCard] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [tag, setTag] = useState<string>(''); // State for the selected tag
  const [duration, setDuration] = useState<string>(''); // State for duration
  const [habitType, setHabitType] = useState<string>(''); // State for habit type
  const [frequency, setFrequency] = useState<string>(''); // State for frequency per day
  const [quit, setQuit] = useState<string>(''); // State for quit status
  const [howLong, setHowLong] = useState<string>(''); // State for how long quit
  const [habitTypes, setHabitTypes] = useState<string[]>([]);  // Store fetched habit types
  const [selectedHabit, setSelectedHabit] = useState<string>('');  // Store selected habit
  const [selectedHabitType, setSelectedHabitType] = useState<string>(''); // Store selected habit type



  const navigate = useNavigate();

  const toggleOption = (setOption: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setOption(value);
  };

  const toggleOption1 = (option: string) => {
    setSelectedToggle1(option);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tobaccoUser = selectedToggle1 === 'yes';

    // Format the candidateHabitDTOs with the habit details
    const candidateHabitDTOs = habits.map(habit => ({
      candidateId: localStorage.getItem('patientId'),  // Assuming candidateId is 0, replace with actual logic if necessary
      duration: tobaccoUser ? parseFloat(duration) || 0 : 0,  // Duration only if tobaccoUser is true
      frequency: habit.frequency,
      habits: habit.habit,
      howLong: parseFloat(howLong) || 0,  // Assuming howLong is a number
      quit: habit.quit === "yes",  // Assuming 'quit' is a string, handle accordingly
      type: habit.habitType,
    }));

    const formData = {
      fatherName,
      spouseName,
      alternateMobileNo: altMobile,
      monthlyIncome: parseFloat(income) || 0,
      houseType,
      occupation,
      education,
      aadhar: aadhaar,
      rationCard,
      voterId,
      tobaccoUser,
      duration: tobaccoUser ? parseFloat(duration) || 0 : null, // Include duration if tobaccoUser is 'yes'
      id: localStorage.getItem('patientId') || '',
      candidateHabitDTOs,  // Include the new habit details array here
    };

    const token = localStorage.getItem('token');

    if (!token) {
      console.error('Token not found');
      alert('Session expired. Please log in again.');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('http://13.234.4.214:8015/api/curable/candidate', {
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
        navigate('/MedicalomenHealthDetails');
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

  // Function to open modal
  const openModal = () => {
    setShowModal(true);
  };

  // Function to close modal
  const closeModal = () => {
    setShowModal(false);
  };
  const [hasTobaccoHabit, setHasTobaccoHabit] = useState("No");
  // State to manage the list of habits
  const [habits, setHabits] = useState<Habit[]>([
    { habit: "", habitType: "", frequency: "", quit: "", isOpen: true }, // Default `isOpen: true`
  ]);
  const [error, setError] = useState("");
  // Add a new habit set
  const addHabit = () => {
    setHabits([
      ...habits,
      { habit: "", habitType: "", frequency: "", quit: "", isOpen: true }, // Default `isOpen: true`
    ]);
  };
  // Handle input change
  const handleInputChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedHabits = [...habits];
    updatedHabits[index] = { ...updatedHabits[index], [field]: value };
    setHabits(updatedHabits);
  };
  // Handle form submission with validation
  const handleSubmit = () => {
    if (hasTobaccoHabit === "Yes") {
      // Simple validation: Ensure no empty fields
      for (let habit of habits) {
        if (!habit.habit || !habit.habitType || !habit.frequency || !habit.quit) {
          setError("Please fill in all fields for each habit.");
          return;
        }
      }
    }
    setError(""); // Clear error message if all fields are valid
    console.log("Submitted Habits:", habits);
    console.log("Has Tobacco Habit:", hasTobaccoHabit);

    // Optionally reset the form
    setHabits([{ habit: "", habitType: "", frequency: "", quit: "", isOpen: true }]);
    setHasTobaccoHabit("No");
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
        `http://13.234.4.214:8015/api/curable/getHabitTypes/${habit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setHabitTypes(response.data); // Now TypeScript knows that response.data is a string[] (array of strings)
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
    // Update the habit for the selected index
    const updatedHabits = [...habits];
    updatedHabits[index].habit = habit;

    // Fetch habit types based on the selected habit
    fetchHabitTypes(habit);

    // Update the habits state with the new selected habit
    setHabits(updatedHabits);
  };



  const participant = localStorage.getItem('participant');
  const registraionId = localStorage.getItem('registraionId');

  const toggleCollapse = (index: number) => {
    const updatedHabits = [...habits];
    updatedHabits[index].isOpen = !updatedHabits[index].isOpen;  // Toggle the collapse state
    setHabits(updatedHabits);  // Update the state to reflect changes
  };

  const deleteHabit = (index: number) => {
    const updatedHabits = habits.filter((_, i) => i !== index);
    setHabits(updatedHabits);
  };

  return (
    <div className="container2">
      <Header1 />
      <div className="participant-container">
        <p>Participant: {participant}</p>
        <p>ID: {registraionId}</p>
      </div>
      <div className="clinic-form" onSubmit={handleFormSubmit}>
        <h2>General Details</h2>
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
        <div className="form-group">
          <label htmlFor="alt-mobile">Alt Mobile No:</label>
          <input
            type="text"
            id="alt-mobile"
            name="alt-mobile"
            value={altMobile}
            onChange={(e) => setAltMobile(e.target.value)}
            placeholder="Enter Alt Mobile No"
          />
        </div>
        <div className="form-group">
          <label htmlFor="income">Monthly Income:</label>
          <input
            type="text"
            id="income"
            name="income"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="Enter Monthly Income"
          />
        </div>
        <div className="form-group">
          <label>Type of House:</label>
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-btn ${houseType === 'Owned' ? 'owned-active' : ''}`}
              onClick={() => toggleOption(setHouseType, 'Owned')}
            >
              Owned
            </button>
            <button
              type="button"
              className={`toggle-btn ${houseType === 'Rental' ? 'rental-active' : ''}`}
              onClick={() => toggleOption(setHouseType, 'Rental')}
            >
              Rental
            </button>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="education">Education:</label>
          <select id="education" name="education" value={education} onChange={(e) => setEducation(e.target.value)}>
            <option value="" disabled>Select Education</option>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="graduate">Graduate</option>
            <option value="postgraduate">Postgraduate</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="occupation">Occupation:</label>
          <select id="occupation" name="occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)}>
            <option value="" disabled>Select Occupation</option>
            <option value="farmer">Farmer</option>
            <option value="worker">Worker</option>
            <option value="professional">Professional</option>
            <option value="other">Other</option>
          </select>
        </div>
        <h2>ID Proof</h2>
        <div className="form-group">
          <label htmlFor="aadhaar">Aadhaar Number:</label>
          <input
            type="text"
            id="aadhaar"
            name="aadhaar"
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value)}
            placeholder="Enter Aadhaar Number"
          />
        </div>
        <div className="form-group">
          <label htmlFor="voter-id">Voter ID:</label>
          <input
            type="text"
            id="voter-id"
            name="voter-id"
            value={voterId}
            onChange={(e) => setVoterId(e.target.value)}
            placeholder="Enter Voter ID"
          />
        </div>
        <div className="form-group">
          <label htmlFor="ration-card">Ration Card:</label>
          <input
            type="text"
            id="ration-card"
            name="ration-card"
            value={rationCard}
            onChange={(e) => setRationCard(e.target.value)}
            placeholder="Enter Ration Card"
          />
        </div>
        <div>
          <h3>Social Habits</h3>
          <div>
            <label>
              Tobacco/Alcohol Habits:
              <select
                value={hasTobaccoHabit}
                onChange={(e) => setHasTobaccoHabit(e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </label>
          </div>

          {/* Show habits form only if Tobacco Habit is Yes */}
          {hasTobaccoHabit === "Yes" && (
            <>
              {habits.map((habit, index) => (
                <div key={index} style={{ marginBottom: "1rem" }}>
                  <button onClick={() => toggleCollapse(index)}>
                    {habit.isOpen ? "Collapse" : "Expand"}
                  </button>

                  {habit.isOpen && (
                    <div>
                      <div>
                        <label>
                          Habits:
                          <select
                            value={habit.habit}
                            onChange={(e) => handleInputChange(index, "habit", e.target.value)}
                          >
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
                            onChange={(e) => handleInputChange(index, "habitType", e.target.value)}
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
                            type="number"
                            value={habit.frequency}
                            onChange={(e) => handleInputChange(index, "frequency", e.target.value)}
                          />
                        </label>
                      </div>

                      <div>
                        <label>
                          Quit:
                          <input
                            type="text"
                            value={habit.quit}
                            onChange={(e) => handleInputChange(index, "quit", e.target.value)}
                          />
                        </label>
                      </div>

                      <hr />
                    </div>
                  )}
                </div>
              ))}
              <button className="submit-button1" onClick={addHabit}>Add Habit</button>
            </>
          )}


          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
        <div className="buttons">
          <button type="button" className="submit-button1" onClick={handleFormSubmit} disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Finish'}
          </button>
          <button type="submit" className="allocate-button" onClick={handleFormSubmit} disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Next'}
          </button>
        </div>
      </div>
      <div className="powered-container">
        <p className="powered-by">Powered By Curable</p>
        <img src="/assets/logo.png" alt="Logo" className="logo" />
      </div>
    </div>
  );
};

export default ParticipantDetails;
