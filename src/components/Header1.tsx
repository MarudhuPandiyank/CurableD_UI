import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import './ResponsiveCancerInstitute.css';

const Header: React.FC = () => {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const userName = localStorage.getItem('userName') || 'Guest';
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    setIsLeftSidebarOpen(false); // Close sidebar when navigating
    setIsRightSidebarOpen(false); // Close right sidebar when navigating
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the token
    navigate('/'); // Redirect to login page
  };

  return (
    <div>
      <header className="header d-flex justify-content-between align-items-center p-3">
        <span
          className="menu-icon fas fa-bars"
          onClick={() => setIsLeftSidebarOpen(true)}
          aria-label="Open Left Sidebar"
          style={{ color: '#003366' }} // Blue color for the menu icon
        ></span>
        <span className="title text-center flex-grow-1" style={{ fontSize: '20px', color: '#003366' }}>
          <img src="./Curable Icons/PNG/Earth.png" style={{ height: '30px', width: '30px' }} alt="Earth Icon" />
          Tenant Name
        </span>
        <span
          className="account-icon fas fa-user-circle"
          onClick={() => setIsRightSidebarOpen(true)}
          aria-label="Account Settings"
          style={{ color: '#003366' }} // Blue color for the user icon
        ></span>
      </header>

      {/* Left Sidebar */}
      <div className={`sidebar left ${isLeftSidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-header d-flex align-items-center">
          <button className="close-btn" onClick={() => setIsLeftSidebarOpen(false)}>
            <FontAwesomeIcon icon={faChevronLeft} /> Back
          </button>
          <h6>Menu</h6>
        </div>
        <div className="sidebar-content p-3">
          <button className="sidebar-btn" onClick={() => handleNavigation('/HomePage')}>
            <img
              src="./HomeScreenIcons/PNG/Outreach Clinic.png"
              alt="Outreach Clinic Icon"
              style={{ width: '20px', height: '20px', marginRight: '8px' }}
            />
            Outreach Clinic
          </button>
          <button className="sidebar-btn" onClick={() => handleNavigation('/NewScreeningEnrollment')}>
            <img
              src="./HomeScreenIcons/PNG/Patient Registration.png"
              alt="Patient Registration Icon"
              style={{ width: '20px', height: '20px', marginRight: '8px' }}
            />
            Patient Registration
          </button>
          <button className="sidebar-btn" onClick={() => handleNavigation('/PatientSearchPage')}>
            <img
              src="./HomeScreenIcons/PNG/Screening.png"
              alt="Screening Icon"
              style={{ width: '20px', height: '20px', marginRight: '8px' }}
            />
            Screening
          </button>
          <button className="sidebar-btn">
            <img
              src="./HomeScreenIcons/PNG/Survey.png"
              alt="Survey Icon"
              style={{ width: '20px', height: '20px', marginRight: '8px' }}
            />
            Survey
          </button>
          <button className="sidebar-btn">
            <img
              src="./HomeScreenIcons/PNG/Referral To Hospital.png"
              alt="Referral to Hospital Icon"
              style={{ width: '20px', height: '20px', marginRight: '8px' }}
            />
            Referral To Hospital
          </button>
          <button className="sidebar-btn">
            <img
              src="./HomeScreenIcons/PNG/Master Data Management.png"
              alt="Master Data Management Icon"
              style={{ width: '20px', height: '20px', marginRight: '8px' }}
            />
            Master Data Management
          </button>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className={`sidebar right ${isRightSidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-header d-flex align-items-center">
          <button className="close-btn" onClick={() => setIsRightSidebarOpen(false)}>
            <FontAwesomeIcon icon={faChevronLeft} /> Back
          </button>
          <h6>{userName}</h6>
        </div>
        <div className="sidebar-content p-3">
          <button className="sidebar-btn" onClick={() => handleNavigation('/responsive-cancer-institute')}>
            <i className="fas fa-home"></i> Home
          </button>
          <button className="sidebar-btn" onClick={() => handleNavigation('/ProfileScreen')}>
            <i className="fas fa-user-edit"></i> Edit Profile
          </button>
          <button className="sidebar-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
