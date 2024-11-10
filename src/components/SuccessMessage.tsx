import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SuccessMessage.css'
const SuccessMessage = () => {
  const navigate = useNavigate();

  return (
    <div className='container5'>
        <main className="content">
        <h1>New OutReach Clinic Has Been Created Successfully!</h1>
        <p>Outreach clinic ID:******</p>
        <button className="primary-button" onClick={() => navigate('/create-outreach-clinic')}>
                    Create New Outreach Clinic
                </button>
                <button className="secondary-button" onClick={() => navigate('/')}>
                    Back To Home
                </button>
            </main>
      
      
      
    </div>
  );
};

export default SuccessMessage;