import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faUserCircle, faEdit, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './EditOutreachClinic.css';

const EditOutreachClinic: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  return (
    <div className="container">
      <header className="header">
        <a href="#" className="back-link">
          <FontAwesomeIcon icon={faChevronLeft} /> Back
        </a>
        <div className="icons">
          <FontAwesomeIcon icon={faEdit} className="icon" />
          <FontAwesomeIcon icon={faUserCircle} className="icon" />
        </div>
      </header>

      <h1 className="title">Edit Outreach Clinic Information</h1>

      <div className="form">
        <div className="form-group">
          <label className="label">Outreach Clinic ID:</label>
          <span className="value">1234567</span>
        </div>
        <div className="form-group">
          <label className="label">Outreach Clinic Name:</label>
          <span className="value">Ennore 27th April</span>
        </div>
        <div className="form-group">
          <label className="label">Pincode:</label>
          <span className="value">600041</span>
        </div>
        <div className="form-group">
          <label className="label">State Name:</label>
          <span className="value">Tamil Nadu</span>
        </div>
        <div className="form-group">
          <label className="label">District Name:</label>
          <span className="value">Kanchipuram</span>
        </div>
        <div className="form-group">
          <label className="label">Taluk Name:</label>
          <span className="value">Kanchipuram</span>
        </div>
        <div className="form-group">
          <label className="label">Panchayat/Village Name:</label>
          <span className="value">Kanchipuram</span>
        </div>
        <div className="form-group">
          <label className="label">Camp Start Date:</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            placeholderText="Select Camp Start Date"
            className="date-picker-input"
          />
          <FontAwesomeIcon icon={faCalendarAlt} className="date-icon" />
        </div>
        <div className="form-group">
          <label className="label">Camp End Date:</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            placeholderText="Select Camp End Date"
            className="date-picker-input"
          />
          <FontAwesomeIcon icon={faCalendarAlt} className="date-icon" />
        </div>
      </div>

      <button className="submit-button">Next</button>
    </div>
  );
};

export default EditOutreachClinic;
