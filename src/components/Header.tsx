import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUserCircle, faHome } from '@fortawesome/free-solid-svg-icons';
import './HomePage.css';
const Header: React.FC = () => {
    const navigate = useNavigate();

    const handleHomeClick = () => {
        navigate('/responsive-cancer-institute'); 
    };

    return (
        <div>
            <header className="header1">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Back
                </button>
                <div className="right">
                    <FontAwesomeIcon icon={faHome} className="home-icon" onClick={handleHomeClick} />
                    <FontAwesomeIcon icon={faUserCircle} className="user-icon" />
                </div>
            </header>
        </div>
    );
};

export default Header;