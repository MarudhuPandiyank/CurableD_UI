import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUserCircle, faHome } from '@fortawesome/free-solid-svg-icons';
import './HomePage.css';
import './ResponsiveCancerInstitute.css';

const Header: React.FC = () => {
    const navigate = useNavigate();

    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

    const handleHomeClick = () => {
        navigate('/responsive-cancer-institute'); 
    };

    return (
        <div>
            <header className="header1">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Back
                </button>
                <div className="right">
                    <FontAwesomeIcon icon={faHome} className="home-icon" onClick={handleHomeClick} />
                    <FontAwesomeIcon icon={faUserCircle} className="user-icon"onClick={() => setIsRightSidebarOpen(true)}/>
                </div>
            </header>
            <div className={`sidebar right ${isRightSidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-content p-3">
        <button className="close-btn" onClick={() => setIsRightSidebarOpen(false)}>← Back</button>
          <h3>Options</h3>
          <button className="sidebar-btn"><i className="fas fa-clinic-medical"></i> Outreach Clinic</button>
          <button className="sidebar-btn"><i className="fas fa-poll"></i> Survey</button>
          <button className="sidebar-btn"><i className="fas fa-user-plus"></i> Patient Registration</button>
          <button className="sidebar-btn"><i className="fas fa-stethoscope"></i> Screening</button>
          <button className="sidebar-btn"><i className="fas fa-hospital"></i> Referral To Hospital</button>
          <button className="sidebar-btn"><i className="fas fa-database"></i> Master Data Management</button>
        </div>
      </div>
        </div>
    );
};

export default Header;