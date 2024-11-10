import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import Header from './Header';

const ResourcePlanning: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    programCoordinators: '',
    campCoordinators: '',
    socialWorkers: '',
    nurses: '',
    doctors: '',
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { programCoordinators, campCoordinators, socialWorkers, nurses, doctors } = formData;

    if (!programCoordinators || !campCoordinators || !socialWorkers || !nurses || !doctors) {
      alert('Please fill out all required fields.');
      return;
    }

    navigate('/success-message');
  };

  return (
    <div className="container1">
      <Header/><br></br>
      <p className='title1' style={{ color: 'darkblue', fontWeight: 'bold', }}>ResourcePlanning</p>
      <form className="clinic-form" onSubmit={handleSubmit}>
        <label><span style={{color : "darkblue"}}>Program Co-ordinator:</span> </label>
        <input
          type="text"
          placeholder="Enter No of Program Co-ordinators"
          name="programCoordinators"
          value={formData.programCoordinators}
          onChange={handleChange}
          required
        />

        <label> <span style={{color : "darkblue"}}>Camp Co-ordinator:</span></label>
        <input
          type="text"
          placeholder="Enter No of Camp Co-ordinators"
          name="campCoordinators"
          value={formData.campCoordinators}
          onChange={handleChange}
          required
        />

        <label><span style={{color : "darkblue"}}>Social Workers:</span></label>
        <input
          type="text"
          placeholder="Enter No of Social Workers"
          name="socialWorkers"
          value={formData.socialWorkers}
          onChange={handleChange}
          required
        />

        <label><span style={{color : "darkblue"}}>Nurses:</span></label>
        <input
          type="text"
          placeholder="Enter No of Nurses"
          name="nurses"
          value={formData.nurses}
          onChange={handleChange}
          required
        />

        <label><span style={{color : "darkblue"}}>Doctors:</span></label>
        <input
          type="text"
          placeholder="Enter No of Doctors"
          name="doctors"
          value={formData.doctors}
          onChange={handleChange}
          required
        />
        <center>
          <button type="button" className="allocate-button">Allocate Resources</button>
          <button type="submit" className="submit-button1">Submit</button>
        </center>
      </form>
    </div>
  );
};

export default ResourcePlanning;