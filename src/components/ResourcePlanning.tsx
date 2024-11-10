import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResourcePlanning.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUserCircle, faHome } from '@fortawesome/free-solid-svg-icons';



const ResourcePlanning: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    programCoordinators: '',
    campCoordinators: '',
    socialWorkers: '',
    nurses: '',
    doctors: '',
  });
  const handleHomeClick = () => {
    navigate('/home');  // Assuming '/home' is the route to the homepage
};
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
    <div className="container4">
      <header className="header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Back
                </button>
                <h1 className="title">Outreach Clinic</h1>
                <div className="header-right">
                    <FontAwesomeIcon icon={faHome} className="home-icon" onClick={handleHomeClick} />
                    <FontAwesomeIcon icon={faUserCircle} className="user-icon" />
                </div>
            </header>
      <form className="resource-form" onSubmit={handleSubmit}>
        <label>Program Co-ordinator:</label>
        <input
          type="text"
          placeholder="Enter No of Program Co-ordinators"
          name="programCoordinators"
          value={formData.programCoordinators}
          onChange={handleChange}
          required
        />

        <label>Camp Co-ordinator:</label>
        <input
          type="text"
          placeholder="Enter No of Camp Co-ordinators"
          name="campCoordinators"
          value={formData.campCoordinators}
          onChange={handleChange}
          required
        />

        <label>Social Workers:</label>
        <input
          type="text"
          placeholder="Enter No of Social Workers"
          name="socialWorkers"
          value={formData.socialWorkers}
          onChange={handleChange}
          required
        />

        <label>Nurses:</label>
        <input
          type="text"
          placeholder="Enter No of Nurses"
          name="nurses"
          value={formData.nurses}
          onChange={handleChange}
          required
        />

        <label>Doctors:</label>
        <input
          type="text"
          placeholder="Enter No of Doctors"
          name="doctors"
          value={formData.doctors}
          onChange={handleChange}
          required
        />

        <button type="button" className="allocate-button">Allocate Resources</button>
        <button type="submit" className="submit-button">Submit</button>
      </form>
    </div>
  );
};

export default ResourcePlanning;
