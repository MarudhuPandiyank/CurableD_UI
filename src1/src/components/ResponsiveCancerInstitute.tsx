import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './ResponsiveCancerInstitute.css';
import { useNavigate } from 'react-router-dom';

const ResponsiveCancerInstitute: React.FC = () => {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleNavigate = (page: string) => {
    if (page === 'Outreach Clinic') {
      window.location.href = '/HomePage';
    } else if (page === 'Survey') {
      navigate('/survey');
    }
  };

  // List of boxes and icons
  const boxes = [
    { title: 'Outreach Clinic', icon: 'Outreach Clinic.png' },
    { title: 'Survey', icon: 'Survey.png' },
    { title: 'Patient Registration', icon: 'Patient Registration.png' },
    { title: 'Screening', icon: 'Screening.png' },
    { title: 'Clinical Evaluation', icon: 'Clinical Evaluation.png' },
    { title: 'Referral to Hospital', icon: 'Referral to Hospital.png' }
  ];

  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
      {/* Header */}
      <header className="header d-flex justify-content-between align-items-center p-3">
        <span
          className="menu-icon fas fa-bars"
          onClick={() => setIsLeftSidebarOpen(true)}
          aria-label="Open Left Sidebar"
        ></span>
        <span className="title text-center flex-grow-1" style={{ fontSize: '20px', color: '#003366' , height:"12px"}}>
        <img src="./Curable Icons/PNG/Earth.png"  style={{height:"300", width:"30px"}} />
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
        <button className="close-btn" onClick={() => setIsLeftSidebarOpen(false)}>← Back</button>
        <div className="sidebar-content p-3">
          <h3>Username1234</h3>
          <button className="sidebar-btn"><i className="fas fa-home"></i> Home</button>
          <button className="sidebar-btn"><i className="fas fa-user-edit"></i> Edit Profile</button>
          <button className="sidebar-logout" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Log Out
          </button>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className={`sidebar right ${isRightSidebarOpen ? 'active' : ''}`}>
      <button className="close-btn" onClick={() => setIsRightSidebarOpen(false)}>← Back</button>
        <div className="sidebar-content10 p-3">
          <h3>Options</h3>
          <button className="sidebar-btn"><i className="fas fa-clinic-medical"></i> Outreach Clinic</button>
          <button className="sidebar-btn"><i className="fas fa-poll"></i> Survey</button>
          <button className="sidebar-btn"><i className="fas fa-user-plus"></i> Patient Registration</button>
          <button className="sidebar-btn"><i className="fas fa-stethoscope"></i> Screening</button>
          <button className="sidebar-btn"><i className="fas fa-hospital"></i> Referral To Hospital</button>
          <button className="sidebar-btn"><i className="fas fa-database"></i> Master Data Management</button>
        </div>
      </div>

      {/* Main Content with Boxes */}
      <main className="container4-fluid mt-4">
        <div className="container4-box d-flex flex-wrap justify-content-center">
          {boxes.map((box, index) => (
            <div
              key={index}
              className="box"
              onClick={() => handleNavigate(box.title)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={`/HomeScreenIcons/PNG/${box.icon}`}
                alt={box.title}
                style={{ width: '50px', height: '50px', marginBottom: '10px' }}
              />
              {box.title}
              <img src="./Curable Icons/PNG/Info Circle.png" className="info-icon" style={{height:"200", width:"25px"}} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ResponsiveCancerInstitute;