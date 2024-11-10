import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faUserCircle, faEdit } from '@fortawesome/free-solid-svg-icons';
import './ResourceAllocation.css';

const ResourceAllocation: React.FC = () => {
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

      <h1 className="title">Resource Allocation</h1>

      <div className="form">
        <div className="form-group">
          <label className="label">Program Co-ordinator:</label>
          <select className="select-input" defaultValue="Sudha">
            <option>Sudha</option>
          </select>
        </div>
        <div className="form-group">
          <label className="label">Outreach Clinic Co-ordinator:</label>
          <select className="select-input" defaultValue="Harish">
            <option>Harish</option>
          </select>
        </div>
        <div className="form-group">
          <label className="label">Social Workers:</label>
          <select className="select-input" defaultValue="Mani, Ranjani">
            <option>Mani, Ranjani</option>
          </select>
        </div>
        <div className="form-group">
          <label className="label">Nurses:</label>
          <select className="select-input" defaultValue="Sasi, Chitra">
            <option>Sasi, Chitra</option>
          </select>
        </div>
        <div className="form-group">
          <label className="label">Doctors:</label>
          <select className="select-input" defaultValue="Dr Karthik, Dr Sunder">
            <option>Dr Karthik, Dr Sunder</option>
          </select>
        </div>
      </div>

      <button className="submit-button">Submit</button>
    </div>
  );
};

export default ResourceAllocation;
