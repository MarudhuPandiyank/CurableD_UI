import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './ResponsiveCancerInstitute.css';
import { useNavigate } from 'react-router-dom';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Header1 from './Header1';
const ResponsiveCancerInstitute: React.FC = () => {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleNavigate = (page: string) => {
    if (page === 'Outreach Clinic') {
      navigate('/HomePage');
    } else if (page === 'Patient Registration') {
      navigate('/PatientRegistrationSearch');
    } else if(page === 'Screening') {
      navigate('/PatientSearchPage');
    }else if(page === 'Clinical Evaluation') {
      navigate('/ClinicSearchPage');
    }
  };

  // List of boxes and icons
  const boxes = [
    { title: 'Outreach Clinic', icon: 'Outreach Clinic.png' },
    { title: 'Patient Registration', icon: 'Patient Registration.png' },
    { title: 'Screening', icon: 'Screening.png' },
    { title: 'Clinical Evaluation', icon: 'Clinical Evaluation.png' },
    // { title: 'Referral to Hospital', icon: 'Referral to Hospital.png' },
    { title: 'Master Data Management', icon: 'Master Data Management.png' },
   
  ];

  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
    
      <Header1 />
    
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
                         <div style={{ color: 'black' }}>{box.title}</div> {/* Change text color to black */}

             
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ResponsiveCancerInstitute;