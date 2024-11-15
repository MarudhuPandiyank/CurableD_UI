import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import './HomePage.css';
const HomePage: React.FC = () => {
    const navigate = useNavigate();

    // const handleCreateClick = () => {
    //     navigate('/create-outreach-clinic');
    // };

    // const handleEditClick = () => {
    //     navigate('/outreach-clinic-info');
    // };

    return (
        <div className="container1">
            <Header/><br/>
            <p style={{ color: 'darkblue', fontWeight: 'bold', }}>Outreach Clinic</p>
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

            <center>
                <span className="curable-logo">Powered By</span>
                <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="curable-logo" />
            </center>
        </div>
    );
};

export default HomePage;