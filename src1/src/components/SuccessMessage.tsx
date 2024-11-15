import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SuccessMessage.css';

const SuccessMessage = () => {
  const navigate = useNavigate();

  return (
    <div className='container5'>
      <main className="content">
        <img src='./Curable Icons/PNG/Group 261.png' alt="Success Icon" className="icon" /><br/>
        <h1>New Outreach Clinic has been Created Successfully!</h1>
        <p className="clinic-id">Outreach Clinic ID: 1234567</p>
        <button className="primary-button" onClick={() => navigate('/create-outreach-clinic')}>
          Create New Outreach Clinic
        </button>
        <button className="secondary-button" onClick={() => navigate('/responsive-cancer-institute')}>
          Back To Home
        </button>
      </main>
    </div>
  );
};

export default SuccessMessage;
