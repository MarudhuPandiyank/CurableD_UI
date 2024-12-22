import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUserCircle, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import './ResponsiveCancerInstitute.css';

const Header: React.FC = () => {
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const userName = localStorage.getItem('userName');
  const navigate = useNavigate();
    
    return (
        <div>
            <header className="header d-flex justify-content-between align-items-center p-3">
        <span
          className="menu-icon fas fa-bars"
          onClick={() => setIsLeftSidebarOpen(true)}
          aria-label="Open Left Sidebar"
        ></span>
        <span className="title text-center flex-grow-1" style={{ fontSize: '20px', color: '#003366' }}>
          <img src="./Curable Icons/PNG/Earth.png" style={{ height: '30px', width: '30px' }} alt="Earth Icon" />
          Tenant Name
        </span>
        <span
          className="account-icon fas fa-user-circle"
          onClick={() => setIsRightSidebarOpen(true)}
          aria-label="Account Settings"
        ></span>
      </header>

      {/* Left Sidebar */}
      <div className={`sidebar left ${isLeftSidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-header d-flex align-items-center">
          <button className="close-btn" onClick={() => setIsLeftSidebarOpen(false)}><FontAwesomeIcon icon={faChevronLeft}/>Back</button>
          <h6 className="" >Menu</h6>
        </div>
        <div className="sidebar-content p-3">
          <button className="sidebar-btn"><img 
              src="./Curable Icons/PNG/Home Angle.png" 
              alt="Logo" 
              style={{ width: '20px', height: '20px', marginRight: '8px' }}
            /> Reports</button>
          <button className="sidebar-btn"><img 
              src="./HomeScreenIcons/PNG/Outreach Clinic.png" 
              alt="Logo" 
              style={{ width: '20px', height: '20px', marginRight: '8px' }}
            /> Outreach Clinic</button>
          <button className="sidebar-btn"><img 
              src="./HomeScreenIcons/PNG/Survey.png" 
              alt="Logo" 
              style={{ width: '20px', height: '20px', marginRight: '8px' }}
            /> Survey</button>
          <button className="sidebar-btn"><img 
              src="./HomeScreenIcons/PNG/Patient Registration.png" 
              alt="Logo" 
              style={{ width: '20px', height: '20px', marginRight: '8px' }}
            /> Patient Registration</button>
          <button className="sidebar-btn"><img 
              src="./HomeScreenIcons/PNG/Screening.png" 
              alt="Logo" 
              style={{ width: '20px', height: '20px', marginRight: '8px' }}
            /> Screening</button>
          <button className="sidebar-btn"><img 
              src="./HomeScreenIcons/PNG/Referral To Hospital.png" 
              alt="Logo" 
              style={{ width: '20px', height: '20px', marginRight: '8px' }}
            /> Referral To Hospital</button>
          <button className="sidebar-btn">
            <img 
              src="./HomeScreenIcons/PNG/Master Data Management.png" 
              alt="Logo" 
              style={{ width: '20px', height: '20px', marginRight: '8px' }}
            />
            Master Data Management
          </button>

        </div>
      </div>

      {/* Right Sidebar */}
      <div className={`sidebar right ${isRightSidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-header d-flex align-items-center">
          <button className="close-btn" onClick={() => setIsRightSidebarOpen(false)} ><FontAwesomeIcon icon={faChevronLeft}/>Back</button>
          <h6 className="">{userName}</h6>
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