import React, { useState } from 'react';
import axios from 'axios';
import Header1 from './Header1';
import './HomePage.css';
import './NewScreeningEnrollment.css';

import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from 'react-router-dom';

const NewScreeningEnrollment: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [gender, setGender] = useState<string>('');
  const [dob, setDob] = useState<Date | null>(null);
  const [address, setAddress] = useState('');
  const [streetId, setStreetId] = useState('');
  const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false); // State for Save button
  const [showModal, setShowModal] = useState(false);
  const [tag, setTag] = useState<string>('');
  const handleGenderChange = (value: string) => setGender(value);

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (/^\d*$/.test(input)) setMobile(input); // Only numeric input
  };

  // Enable Save button when Address and Street ID are filled
  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAddress(e.target.value);
    setIsSaveButtonEnabled(e.target.value.trim() !== '' && streetId.trim() !== '');
  };

  const handleStreetIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStreetId(e.target.value);
    setIsSaveButtonEnabled(address.trim() !== '' && e.target.value.trim() !== '');
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const campId = localStorage.getItem('campId');

    if (!token) {
      alert('No token found. Please log in again.');
      return;
    }

    const payload = {
      address,
      campId: parseInt(campId || '0', 10), // Convert campId to number
      streetId: parseInt(streetId, 10) || 0, // Convert to number
      reason, // Include reason directly in the payload
    };

    try {
      const response = await axios.post('http://13.234.4.214:8015/api/curable/saveCandidate', payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        navigate('/SuccessMessagePatient');
      }
    } catch (error) {
      console.error('Error saving candidate:', error);
      alert('Failed to save candidate. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const campId = localStorage.getItem('campId');
    const hospitalId = localStorage.getItem('hospitalId');

    if (!token) {
      alert('No token found. Please log in again.');
      return;
    }

    if (!hospitalId) {
      alert('No hospital ID found. Please ensure hospitalId is set in local storage.');
      return;
    }

    const payload = {
      name,
      mobileNo: mobile,
      gender: gender.toUpperCase(),
      dob: dob ? dob.toISOString().split('T')[0] : null,
      address,
      streetId: parseInt(streetId, 10) || 0,
      hospitalId: parseInt(hospitalId, 10),
      campId,
    };

    try {
      const response = await axios.post('http://13.234.4.214:8015/api/curable/candidate', payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data as { id: number; name: string, registraionId: string, age: number, gender: string };

      if (response.status === 200) {
        localStorage.setItem('patientId', data.id.toString());
        localStorage.setItem('patientName', data.name);
        localStorage.setItem('registraionId', data.registraionId);
        const participantValue = `${data.name} ${data.age}/${data.gender}`;
        localStorage.setItem('participant', participantValue);
        navigate('/DiseaseSpecificDetails');
      }
    } catch (error) {
      console.error('Error during enrollment:', error);
      alert('Failed to enroll. Please try again.');
    }
  };

  const openModal = () => {
    setShowModal(true);
  };

  // Function to close modal
  const closeModal = () => {
    setShowModal(false);
  };
  const [reason, setReason] = useState<string>('');
  const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = e.target;

    setReason((prevReason) => {
      if (checked) {
        // Add the option to the reason if it's checked
        return prevReason ? `${prevReason}, ${value}` : value;
      } else {
        // Remove the option from the reason if it's unchecked
        return prevReason
          .split(', ')
          .filter((option) => option !== value)
          .join(', ');
      }
    });
  };


  return (
    <div>
      <div className="container2">
        <Header1 />
        <form className="clinic-form" onSubmit={handleSubmit}>
          <h1 style={{ color: 'darkblue' }}>New Screening Enrollment</h1>

          <div className="form-group">
            <label style={{ color: 'darkblue' }}>Name*:</label>
            <input
              type="text"
              placeholder="Enter Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label style={{ color: 'darkblue' }}>Mobile Number*:</label>
            <input
              type="text"
              placeholder="Enter Mobile Number"
              value={mobile}
              onChange={handleMobileChange}
              maxLength={10}
              required
            />
          </div>

          <div className="form-group">
            <label style={{ color: 'darkblue' }}>Gender*:</label>
            <div className="gender-group">
              {['Male', 'Female', 'Other'].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`gender-btn ${gender === value ? 'active' : ''}`}
                  onClick={() => handleGenderChange(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
    
         <label>
         <label style={{ color: 'darkblue' }}>Date of Birth*:</label>
                         <span style={{ color: 'darkred', fontWeight: 'bold' }}>*</span>
                         <div className="input-with-icon">
         
                         <DatePicker
                          selected={dob}
                          onChange={(date: Date | null) => setDob(date)}
                            // onSelect={() => (document.activeElement as HTMLElement)?.blur()}  // Hide DatePicker popup on date select
                            // onClickOutside={() => (document.activeElement as HTMLElement)?.blur()}  // Hide DatePicker popup when clicked outside
                             dateFormat="yyyy-MM-dd"
                              placeholderText="yyyy-MM-dd"
                             required
                             wrapperClassName='DatePicker'
                             minDate={new Date()}
                         />
                             <img src="./assets/Calendar.png" className="clinic-id-icon" alt="calendar icon" />
                         </div>
                     </label>
          <label style={{ color: 'darkblue' }}>Date of Birth*:</label>
          
          {/* <div className="input-with-icon">
            <DatePicker
              selected={dob}
              onChange={(date: Date | null) => setDob(date)}
              dateFormat="yyyy-MM-dd"
              placeholderText="yyyy-MM-dd"
              maxDate={new Date()}
              required
            />
            <img

              src=" /assets/Calendar.png"
              className="clinic-id-icon"
              alt="calendar icon"
            />
          </div> */}


          {/* <div className="form-group">
            <label style={{ color: 'darkblue' }}>Date of Birth*:</label>
            <DatePicker
                selected={dob}
                onChange={(date: Date | null) => setDob(date)}
                dateFormat="yyyy-MM-dd"
                placeholderText="yyyy-MM-dd"
                maxDate={new Date()}
                required
              />
          </div> */}

          <div className="form-group">
            <label style={{ color: 'darkblue' }}>Address:</label>
            <textarea
              placeholder="Enter Address"
              value={address}
              onChange={handleAddressChange}
            />
          </div>

          <div className="form-group">
            <label style={{ color: 'darkblue' }}>Street ID:</label>
            <input
              type="text"
              placeholder="Enter Street ID"
              value={streetId}
              onChange={handleStreetIdChange}
            />
          </div>
          {showModal && (
            <div className="modal">
              <div className="modal-content">
                <h2>How would you like to tag this participant?</h2>

                <div className="form-group">
                  <select
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                  >
                    <option value="Pre_register">Pre_register</option>
                    <option value="Options">Options</option>
                  </select>
                </div>

                {tag === "Options" && (
                  <div>
                    <div>
                      <input type="checkbox" />
                      <p style={{ marginTop: '-26px' }}> Refused </p>
                    </div>
                    <div>
                      <input type="checkbox" />
                      <p style={{ marginTop: '-26px' }}> Loor Locked</p>
                    </div>
                    <div>
                      <input type="checkbox" />
                      <p style={{ marginTop: '-26px' }}> Work Daily Worker</p>
                    </div>
                    <div>
                      <input type="checkbox" />
                      <p style={{ marginTop: '-26px' }}> Work Out Of Station</p>
                    </div>
                    <div>
                      <input type="checkbox" />
                      <p style={{ marginTop: '-26px' }}> Out Of Station - Short Visit</p>
                    </div>
                    <div>
                      <input type="checkbox" />
                      <p style={{ marginTop: '-26px' }}> Already Screened</p>
                    </div>
                    <div>
                      <input type="checkbox" />
                      <p style={{ marginTop: '-26px' }}> Settled OutStation</p>
                    </div>
                    <div>
                      <input type="checkbox" />
                      <p style={{ marginTop: '-26px' }}> Medical Reasons</p>
                    </div>
                    
                  </div>
                  // <div className="checkbox-group">
                  //   <div className="checkbox-item">
                  //     <input
                  //       type="checkbox"
                  //       id="LoorLocked"
                  //       value="Loor Locked"
                  //       onChange={handleReasonChange}
                  //     />
                  //     <label htmlFor="LoorLocked">Loor Locked</label>
                  //   </div>
                  //   <div className="checkbox-item">
                  //     <input
                  //       type="checkbox"
                  //       id="Refused"
                  //       value="Refused"
                  //       onChange={handleReasonChange}
                  //     />
                  //     <label htmlFor="Refused">Refused</label>
                  //   </div>
                  // </div>
                )}

                <div className="modal-buttons">
                  <button className="Finish-button"
                    type="button"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                  <button className="Next-button"
                    type="button"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}




          <center>
            <div className="buttons">
              <button
                type="button"
                className="Finish-button"
                onClick={openModal}

              >
                Save
              </button>
              <button type="submit" className="Next-button">
                Enroll
              </button>
            </div>
          </center>
        </form>
        <div className="powered-container">
          <p className="powered-by">Powered By Curable</p>
          <img
            src="/assets/Curable logo - rectangle with black text.png"
            alt="Curable Logo"
            className="curable-logo"
          />
        </div>
      </div>
    </div>
  );
};

export default NewScreeningEnrollment;
