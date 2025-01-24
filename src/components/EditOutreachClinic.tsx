import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faUserCircle, faEdit, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './EditOutreachClinic.css';
import { Calendar } from 'primereact/calendar';
import 'primereact/resources/themes/saga-blue/theme.css'; // Theme
import 'primereact/resources/primereact.min.css'; // Core CSS
import 'primeicons/primeicons.css'; // Icons
const EditOutreachClinic: React.FC = () => {
  const location = useLocation();
  const clinic = location.state;  // Getting the passed clinic data

  // Ensure that the date values are valid Date objects
  const [startDate, setStartDate] = useState<Date | null>(
    clinic.startDate ? new Date(clinic.startDate) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    clinic.endDate ? new Date(clinic.endDate) : null
  );

  // Check if the dates are valid before rendering
  const isValidDate = (date: Date | null) => {
    return date && !isNaN(date.getTime());
  };

  useEffect(() => {
    if (startDate && !isValidDate(startDate)) {
      setStartDate(null);
    }
    if (endDate && !isValidDate(endDate)) {
      setEndDate(null);
    }
  }, [startDate, endDate]);

  const handleSave = async () => {
    // Handle the form submission logic here
    console.log('Updated clinic data:', {
      ...clinic,
      startDate,
      endDate
    });
  };

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
          <span className="value">{clinic.id}</span>
        </div>
        <div className="form-group">
          <label className="label">Outreach Clinic Name:</label>
          <input
            type="text"
            value={clinic.name}
            onChange={(e) => clinic.name = e.target.value}  // Modify clinic name dynamically
            className="input"
          />
        </div>
        <div className="form-group">
          <label className="label">Pincode:</label>
          <input
            type="text"
            value={clinic.pincode}
            onChange={(e) => clinic.pincode = e.target.value}
            className="input"
          />
        </div>
        <div className="form-group">
          <label className="label">State Name:</label>
          <input
            type="text"
            value={clinic.state}
            onChange={(e) => clinic.state = e.target.value}
            className="input"
          />
        </div>
        <div className="form-group">
          <label className="label">District Name:</label>
          <input
            type="text"
            value={clinic.district}
            onChange={(e) => clinic.district = e.target.value}
            className="input"
          />
        </div>
        <div className="form-group">
          <label className="label">Taluk Name:</label>
          <input
            type="text"
            value={clinic.taluk}
            onChange={(e) => clinic.taluk = e.target.value}
            className="input"
          />
        </div>
        <div className="form-group">
          <label className="label">Panchayat/Village Name:</label>
          <input
            type="text"
            value={clinic.village}
            onChange={(e) => clinic.village = e.target.value}
            className="input"
          />
        </div>
        <div className="form-group">
  <label className="label">Camp Start Date:</label>
  <div className="input-with-icon">
    <Calendar
      value={startDate}
      onChange={(e) => setStartDate(e.value as Date | null)}  // Update startDate state
      placeholder="Select Camp Start Date"
      className="date-picker-input"
      showIcon
      minDate={new Date()} // Optional: Ensure start date is not in the past
    />
    <FontAwesomeIcon icon={faCalendarAlt} className="date-icon" />
  </div>
</div>

<div className="form-group">
  <label className="label">Camp End Date:</label>
  <div className="input-with-icon">
    <Calendar
      value={endDate}
      onChange={(e) => setEndDate(e.value as Date | null)}  // Update endDate state
      placeholder="Select Camp End Date"
      className="date-picker-input"
      showIcon
      minDate={new Date()} // Optional: Ensure end date is not in the past
    />
    <FontAwesomeIcon icon={faCalendarAlt} className="date-icon" />
  </div>
</div>

      </div>

      <button className="submit-button" onClick={handleSave}>Save Changes</button>
    </div>
  );
};

export default EditOutreachClinic;