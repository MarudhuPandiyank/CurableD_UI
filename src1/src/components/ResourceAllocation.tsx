import React, { useState } from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faChevronLeft, faUserCircle, faEdit } from '@fortawesome/free-solid-svg-icons';
import './ResourceAllocation.css';
import Header from './Header';
import { useNavigate } from 'react-router-dom';

const ResourceAllocation: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    programCoordinators: '',
    campCoordinators: '',
    socialWorkers: '',
    nurses: '',
    doctors: '',
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // const { programCoordinators, campCoordinators, socialWorkers, nurses, doctors } = formData;

    // if (!programCoordinators || !campCoordinators || !socialWorkers || !nurses || !doctors) {
    //   alert('Please fill out all required fields.');
    //   return;
    // }

    navigate('/success-message');
  };
  return (
    <div className="container2">
      {/* <header className="header">
        <a href="#" className="back-link">
          <FontAwesomeIcon icon={faChevronLeft} /> Back
        </a>
        <div className="icons">
          <FontAwesomeIcon icon={faEdit} className="icon" />
          <FontAwesomeIcon icon={faUserCircle} className="icon" />
        </div>
      </header> */}
      <form className="clinic-form" onSubmit={handleSubmit}>
      <Header/>
      <p className="title1" style={{ color: 'darkblue', fontWeight: 'bold', }}>Resource Allocation</p>

      {/* <div className="form"> */}
        <div className="form-group">
          <label className="label">Program Co-ordinator:</label>
          <select className="select-input" value={formData.programCoordinators}>
            <option>Sudha</option>
            <option>Sudha</option>
            <option>Sudha</option>
          </select>
        </div>
        <div className="form-group">
          <label className="label">Outreach Clinic Co-ordinator:</label>
          <select className="select-input" value={formData.campCoordinators}>
            <option>Harish</option>
            <option>Harish</option>
            <option>Harish</option>
          </select>
        </div>
        <div className="form-group">
          <label className="label">Social Workers:</label>
          <select className="select-input"  value={formData.socialWorkers}>
            <option>Mani, Ranjani</option>
            <option>Mani, Ranjani</option>
            <option>Mani, Ranjani</option>
          </select>
        </div>
        <div className="form-group">
          <label className="label">Nurses:</label>
          <select className="select-input" value={formData.nurses}>
            <option>Sasi, Chitra</option>
            <option>Sasi, Chitra</option>
            <option>Sasi, Chitra</option>
          </select>
        </div>
        <div className="form-group">
          <label className="label">Doctors:</label>
          <select className="select-input" value={formData.doctors}>
            <option>Dr Karthik, Dr Sunder</option>
            <option>Dr Karthik, Dr Sunder</option>
            <option>Dr Karthik, Dr Sunder</option>
          </select>
        </div>
      {/* </div> */}

      <button className="submit-button">Submit</button>
      </form>
    </div>
  );
};

export default ResourceAllocation;
