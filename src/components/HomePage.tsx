import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUserCircle, faHome } from '@fortawesome/free-solid-svg-icons';
import './HomePage.css';

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    const handleCreateClick = () => {
        navigate('/create-outreach-clinic');
    };

    const handleEditClick = () => {
        navigate('/outreach-clinic-info');
    };

    const handleHomeClick = () => {
        navigate('/home');  // Assuming '/home' is the route to the homepage
    };

    return (
        <div className="container">
            <header className="header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Back
                </button>
                <h1 className="title">Outreach Clinic</h1>
                <div className="header-right">
                    <FontAwesomeIcon icon={faHome} className="home-icon" onClick={handleHomeClick} />
                    <FontAwesomeIcon icon={faUserCircle} className="user-icon" />
                </div>
            </header>
            <main className="content">
                <button className="primary-button" onClick={handleCreateClick}>
                    Create New Outreach Clinic
                </button>
                <button className="secondary-button" onClick={handleEditClick}>
                    Edit Existing Outreach Clinic
                </button>
            </main>
            <footer className="footer">
                <span className="curable-logo">Powered By <strong>Curable</strong></span>
            </footer>
        </div>
    );
};

export default HomePage;
