import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUserCircle, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import './ResponsiveCancerInstitute.css';

const Header: React.FC = () => {
    const navigate = useNavigate();

    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
   const userName = localStorage.getItem('userName');
    const handleHomeClick = () => {
        navigate('/responsive-cancer-institute'); 
    };
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
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
            {/* Right Sidebar */}
            <div className={`sidebar right ${isRightSidebarOpen ? 'active' : ''}`}>
                <div className="sidebar-header d-flex align-items-center">
                <button className="close-btn" onClick={() => setIsRightSidebarOpen(false)} ><FontAwesomeIcon icon={faChevronLeft}/>Back</button>
                <h6>{userName}</h6>
                </div>
                <div className="sidebar-content p-3">
                {/* <h3></h3> */}
                <button className="sidebar-btn"><i className="fas fa-home"></i> Home</button>
                <button className="sidebar-btn"><i className="fas fa-user-edit"></i> Edit Profile</button>
                {/* <button className="sidebar-logout" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i> Log Out
                </button> */}
                </div>
            </div>
        </div>
    );
};

export default Header;