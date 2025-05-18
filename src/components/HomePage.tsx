import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import './HomePage.css';
import Header1 from './Header1';
const HomePage: React.FC = () => {
    const navigate = useNavigate();

    // const handleCreateClick = () => {
    //     navigate('/create-outreach-clinic');
    // };

    // const handleEditClick = () => {
    //     navigate('/outreach-clinic-info');
    // };
console.log('test');
    return (
        <div className="container1">
            <Header1/><br/>
  <h1 style={{ color: 'darkblue' }}>Outreach Clinic</h1>
          
            <main className="content">
                <div className="button-container">
                    <button className="primary-button" onClick={() => navigate('/create-outreach-clinic')}>
                        Create New Outreach Clinic
                    </button>
                    <button className="secondary-button" onClick={() => navigate('/outreach-clinic-info')}>
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