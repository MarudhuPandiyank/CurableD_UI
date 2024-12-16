import React, { useState } from 'react';
import Header1 from './Header1';
import './HomePage.css';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const NewScreeningEnrollment: React.FC = () => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [gender, setGender] = useState<string>('');
  const [dob, setDob] = useState<Date | null>(null); // Updated to store a Date object
  const [address, setAddress] = useState('');
  const [streetId, setStreetId] = useState('');

  const handleGenderChange = (value: string) => {
    setGender(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      name,
      mobile,
      gender,
      dob: dob ? dob.toISOString().split('T')[0] : null, // Convert Date object to ISO string
      address,
      streetId,
    });
  };

  return (
    <div>
      
      <div className="container2">
        <Header1 />
        <form className="clinic-form" onSubmit={handleSubmit}>
          <h1 style={{ color: 'darkblue' }}>New Screening Enrollment</h1>

          <div className="form-group">
            <label  style={{ color: 'darkblue' }}>Name*:</label>
            <input
              type="text"
              id="name"
              name="name"
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
              id="mobile"
              name="mobile"
              placeholder="Enter Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label style={{ color: 'darkblue' }}>Gender*:</label>
            <div className="gender-group">
              <button
                type="button"
                className={`gender-btn ${gender === 'Male' ? 'active' : ''}`}
                onClick={() => handleGenderChange('Male')}
              >
                Male
              </button>
              <button
                type="button"
                className={`gender-btn ${gender === 'Female' ? 'active' : ''}`}
                onClick={() => handleGenderChange('Female')}
              >
                Female
              </button>
              <button
                type="button"
                className={`gender-btn ${gender === 'Other' ? 'active' : ''}`}
                onClick={() => handleGenderChange('Other')}
              >
                Other
              </button>
            </div>
          </div>
          <label>
                <span style={{ color: 'darkblue' }}>Date Of Birth*:</span>
                <div className="input-with-icon">

                <DatePicker
                    selected={dob}
                    onChange={(date: Date | null) => setDob(date)}  // Update start date
                    onSelect={() => (document.activeElement as HTMLElement)?.blur()}  // Hide DatePicker popup on date select
                    onClickOutside={() => (document.activeElement as HTMLElement)?.blur()}  // Hide DatePicker popup when clicked outside
                    dateFormat="yyyy-MM-dd"
                    placeholderText="yyyy-MM-dd"
                    required
                    wrapperClassName='DatePicker'
                    minDate={new Date()}
                />
                    <img src="./Curable Icons/PNG/Calendar.png" className="clinic-id-icon" alt="calendar icon" />
                </div>
            </label>

          <div className="form-group">
            <label style={{ color: 'darkblue' }}>Address:</label>
            <textarea
              id="address"
              name="address"
              placeholder="Enter Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label style={{ color: 'darkblue' }}>Street ID:</label>
            <input
              type="text"
              id="street-id"
              name="street-id"
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
        <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="curable-logo" />
      </div>
      </div>
    </div>
  );
};

export default NewScreeningEnrollment;
