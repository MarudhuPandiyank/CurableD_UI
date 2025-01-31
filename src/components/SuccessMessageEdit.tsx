import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SuccessMessage.css';

const SuccessMessageEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clickId } = location.state || {};
  return (
    <div className='container5'>
      <main className="content">
        <img src='./Curable Icons/PNG/Group 261.png' alt="Success Icon" className="icon" /><br/>
        <h1>New Outreach Clinic has been Updated Successfully!</h1>
        <p className="clinic-id">Outreach Clinic ID: {clickId}</p>
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

export default SuccessMessageEdit;
