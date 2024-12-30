import React, { useState } from 'react';
import axios from 'axios';
import Header1 from './Header1';
import './HomePage.css';
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

  const handleGenderChange = (value: string) => setGender(value);

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (/^\d*$/.test(input)) setMobile(input); // Only numeric input
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Retrieve token and hospitalId from localStorage
    const token = localStorage.getItem('token');
    const hospitalId = localStorage.getItem('hospitalId'); // Read hospitalId from localStorage

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
      streetId: parseInt(streetId, 10) || 0, // Convert to number
      hospitalId: parseInt(hospitalId, 10), // Add hospitalId to payload
    };

    try {
      const response = await axios.post('http://13.234.4.214:8015/api/curable/candidate', payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data as { id: number; name: string };

      if (response.status === 200) {
        // Store patientId and patientName in localStorage
        localStorage.setItem('patientId', data.id.toString());
      
        localStorage.setItem('patientName', data.name);

        // Navigate to the DiseaseSpecificDetails page
        navigate('/DiseaseSpecificDetails');
      }
    } catch (error) {
      console.error('Error during enrollment:', error);
      alert('Failed to enroll. Please try again.');
    }
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

          <div className="form-group">
            <label style={{ color: 'darkblue' }}>Date of Birth*:</label>
            <div className="input-with-icon">
              <DatePicker
                selected={dob}
                onChange={(date: Date | null) => setDob(date)}
                dateFormat="yyyy-MM-dd"
                placeholderText="yyyy-MM-dd"
                maxDate={new Date()}
                required
              />
              <img
                src="/assets/Curable Icons/PNG/Calendar.png"
                className="clinic-id-icon"
                alt="calendar icon"
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ color: 'darkblue' }}>Address:</label>
            <textarea
              placeholder="Enter Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label style={{ color: 'darkblue' }}>Street ID:</label>
            <input
              type="text"
              placeholder="Enter Street ID"
              value={streetId}
              onChange={(e) => setStreetId(e.target.value)}
            />
          </div>

          <center>
            <div className="buttons">
              <button type="button" className="Finish-button">Save</button>
              <button type="submit" className="Next-button">Enroll</button>
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
