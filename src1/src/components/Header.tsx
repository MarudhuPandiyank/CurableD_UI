import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUserCircle, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
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
                <FontAwesomeIcon icon={faChevronLeft} style={{marginRight:"2px"}} /> <span style={{marginLeft:"8px"}}>Back</span>
                </button>
                <div className="right">
                    <img 
                        src="./Curable Icons/PNG/Home Angle.png"
                        alt="Home Icon" 
                        className="home-icon" 
                        onClick={handleHomeClick} 
                    />
                    <FontAwesomeIcon icon={faUserCircle} className="user-icon" onClick={() => setIsRightSidebarOpen(true)} />
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

export default Header;
