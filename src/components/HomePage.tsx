import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import './HomePage.css';
import Header1 from './Header1';
import { useSelector } from 'react-redux';
import { selectPrivilegeFlags } from '../store/userSlice';

import { canAll, can, Privilege } from '../store/userSlice';

const HomePage: React.FC = () => {
    const navigate = useNavigate();
        const { canView, canCreate, canEdit } = useSelector(
      selectPrivilegeFlags('Patient Registration') // or selectPrivilegeFlags('/preg')
    );
  
    const allowAllThree = useSelector(canAll('/Outrich Clinic', 'CREATE', 'VIEW', 'EDIT'));


    // const handleCreateClick = () => {
    //     navigate('/create-outreach-clinic');
    // };

    // const handleEditClick = () => {
    //     navigate('/outreach-clinic-info');
    // };
console.log('test');
    return (
        <div className="container1">
            <Header1/>
  <h1 style={{ color: 'darkblue', marginTop:'0%' }}>Outreach Clinic</h1>
          
            <main className="content">
                <div className="button-container">
                    <button className={`primary-button ${!allowAllThree ? 'disabled-button' : ''}`}
                     disabled={!allowAllThree }  onClick={() => navigate('/create-outreach-clinic')}>
                        Create New Outreach Clinic
                    </button>
                    <button className={`secondary-button ${!allowAllThree ? 'disabled-button' : ''}`}
                      onClick={() => navigate('/outreach-clinic-info')}>
                        Edit Existing Outreach Clinic
                    </button>
                </div>
            </main>

            {/* <center>
                <span className="curable-logo">Powered By</span>
                <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="curable-logo" />
            </center> */}
            <footer className="footer-container-fixed">
        <div className="footer-content">
          <p className="footer-text">Powered By</p>
          <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="footer-logo" />
        </div>
      </footer>
        </div>
    );
};

export default HomePage;