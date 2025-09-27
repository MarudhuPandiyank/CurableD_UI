// src/components/Header1.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectMenus, selectTenantName, selectUserName, logout } from '../store/userSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faUserEdit } from '@fortawesome/free-solid-svg-icons';
import './ResponsiveCancerInstitute.css';
import { toRoute } from '../utils/routeMap';

interface HeaderProps {
  showwidth?: boolean;
}

const Header1: React.FC<HeaderProps> = ({ showwidth = false }) => {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  const tenantName = useSelector(selectTenantName);
  const userName = useSelector(selectUserName);
  const menus = useSelector(selectMenus);
  console.log(selectMenus,"selectMenus")

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleNavigation = (url: string) => {
    setIsLeftSidebarOpen(false);
    setIsRightSidebarOpen(false);
    navigate(toRoute(url));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(logout());
    navigate('/');
  };

  return (
    <div>
      <header className={`header d-flex justify-content-between align-items-center ${showwidth ? 'p-3' : ''}`}>
        <span
          className="menu-icon fas fa-bars"
          onClick={() => { setIsLeftSidebarOpen(true); setIsRightSidebarOpen(false); }}
          aria-label="Open Left Sidebar"
          style={{ color: '#003366', cursor: 'pointer', marginTop: -12 }}
        />
        <span className="title text-center flex-grow-1" style={{ fontSize: 20, color: '#003366' }}>
          <img src="./Curable Icons/PNG/Earth.png" style={{ height: 30, width: 30, marginTop: -7 }} alt="Earth" />
          {tenantName}
        </span>
        <span
          className="account-icon fas fa-user-circle"
          onClick={() => { setIsLeftSidebarOpen(false); setIsRightSidebarOpen(true); }}
          aria-label="Account Settings"
          style={{ color: '#003366', cursor: 'pointer', marginTop: -12 }}
        />
      </header>

      {/* Left Sidebar — dynamic menu from Redux */}
      <div className={`sidebar left ${isLeftSidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-header d-flex align-items-center">
          <button className="close-btn" onClick={() => setIsLeftSidebarOpen(false)}>
            <FontAwesomeIcon icon={faChevronLeft} /> Back
          </button>
          <h6>Menu</h6>
        </div>
        <div className="sidebar-content p-3">
          {menus.map((m) => {
            const isModify = (m?.menu?.trim().toLowerCase() === 'modify patient information');
            return (
              <button key={m.menu} className="sidebar-btn" onClick={() => handleNavigation(m.url)}>
                {isModify ? (
                  <FontAwesomeIcon
                    icon={faUserEdit}
                    style={{ width: 20, height: 20, marginRight: 8, color: '#a9cff6ff' }}
                  />
                ) : (
                  <img
                    src={`./HomeScreenIcons/PNG/${m.menu}.png`}
                    onError={(e: any) => { e.currentTarget.style.visibility = 'hidden'; }}
                    alt={`${m.menu} Icon`}
                    style={{ width: 20, height: 20, marginRight: 4 }}
                  />
                )}
                {isModify ? 'Patient Edit' : m.menu}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Sidebar — account */}
      <div className={`sidebar right ${isRightSidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-header d-flex align-items-center">
          <button className="close-btn" onClick={() => setIsRightSidebarOpen(false)}>
            <FontAwesomeIcon icon={faChevronLeft} /> Back
          </button>
          <h6>{userName}</h6>
        </div>
        <div className="sidebar-content p-3">
          <button className="sidebar-btn" onClick={() => handleNavigation('/responsive-cancer-institute')}>
            <i className="fas fa-home" /> Home
          </button>
          <button className="sidebar-btn" onClick={() => handleNavigation('/ProfileScreen')}>
            <i className="fas fa-user-edit" /> Edit Profile
          </button>
          <button className="sidebar-logout" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt" /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header1;
