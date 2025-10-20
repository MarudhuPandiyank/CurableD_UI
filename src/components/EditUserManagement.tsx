import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import '../components/OutreachClinicInfo.css';
import Header from './Header';
import Header1 from './Header1';
import config from '../config';  // Import the config file
import { useSelector } from 'react-redux';
import { selectPrivilegeFlags } from '../store/userSlice';

import { canAll, can, Privilege } from '../store/userSlice';


interface User {
  userId: number;
  userName: string;
  email: string;
  roleName: string;
  roleId: number;
  isRecordDeleted: boolean;
  gender: string | null;
  phoneNo: string | null;
  customMenuDTOs: any;
  message: string | null;
  hospitalId?: number | null;
  tenantName?: string | null;
  keycloakUserId?: string | null;
}

const EditUserManagement: React.FC = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [searchInput, setSearchInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [openNoClinicDialog, setOpenNoClinicDialog] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
    const { canView, canCreate, canEdit } = useSelector(
      selectPrivilegeFlags('Patient Registration') // or selectPrivilegeFlags('/preg')
    );
  
    const allowAllThree = useSelector(canAll('/Outrich Clinic', 'CREATE', 'VIEW', 'EDIT'));
  

  const handleSearch = async () => {
    // if (!searchInput) {
    //   setMessage('Please enter a clinic ID or Name.');
    //   return;
    // }

    setLoading(true);
    setMessage('');

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Authorization token not found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const userIds = localStorage.getItem('userId');
      const roleId = localStorage.getItem('roleId');
      const hospitalId = localStorage.getItem('hospitalId');

      const response = await axios.post<User[]>(
        `${config.appURL}/curable/getUsers`,
        { search: searchInput, hospitalId: Number(hospitalId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.length > 0) {
        setUsers(response.data);
      } else {
        setOpenNoClinicDialog(true);
      }
    } catch (error) {
      console.error('Error fetching clinic data:', error);
      setMessage('Failed to fetch clinic details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClinic = () => {
    setOpenNoClinicDialog(false);
    navigate('/create-outreach-clinic');
  };

  const handleCloseNoClinicDialog = () => {
    setOpenNoClinicDialog(false);
  };

  const handleEditClick = async (user: User) => {
    // When editing, call prefill API (type:2) then navigate to create-new-user with prefill data.
    const token = localStorage.getItem('token');
    let prefill: any = null;
    try {
      if (token) {
        const resp = await axios.post(`${config.appURL}/curable1/candidatehistoryForPrefil`,
          { candidateId: String(user.userId), type: 2 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Prefill response for user', user.userId, resp?.data);
        prefill = resp?.data ?? null;
      }
    } catch (err) {
      // ignore error and continue to navigate to create-new-user with the user object
      console.error('Prefill API failed for user edit:', err);
      prefill = null;
    }

    navigate('/create-new-user', { state: { user, prefill } });
  };

  const handleClinicSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    setSelectedClinicId(selectedId);
  };

  const filteredUsers = users.filter(
    (u) => !searchInput || `${u.userName}`.toLowerCase().includes(searchInput.toLowerCase()) || `${u.email}`.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <div className="container2">
      <Header1 />
 <div className="title">
         
        <h1 style={{ color: 'darkblue' }}> Edit User Management:</h1>
      </div>
      <div className="search-section">
        <input
          id="search"
          type="text"
          className="search-input"
              placeholder="Search by name or email"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();       
                  handleSearch();           
                }
              }}
        />
        <button
          className="search-button"
          onClick={handleSearch}
          aria-label="Search"
          disabled={loading}
        >
           {loading ? 'Searching...' : 'Search'}
        </button>
      </div>



      <main className="content">
        <div className="search-container">
         
        </div>

        {message && <div className="message">{message}</div>}

        {/* {hasDuplicateNames && (
          <div className="clinic-select-container">
            <label>Select Clinic ID:</label>
            <select onChange={handleClinicSelect} value={selectedClinicId}>
              <option value="">All</option>
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.id} - {clinic.name}
                </option>
              ))}
            </select>
          </div>
        )} */}

        {filteredUsers.length > 0 && (
          <div className="clinic-details-container">
            {filteredUsers.map((user) => (
              <div className="clinic-details" key={user.userId}>
                <p>
                  <strong>User Name:</strong> <span>{user.userName}</span>
                </p>
                <p>
                  <strong>Email:</strong> <span>{user.email}</span>
                </p>
                <p>
                  <strong>Role:</strong> <span>{user.roleName}</span>
                </p>
                <p>
                  <strong>Status:</strong> <span>{user.isRecordDeleted ? 'Inactive' : 'Active'}</span>
                </p>
                <div className="edit-button-container">
                  <button
                    className={`edit-button ${!allowAllThree ? 'disabled-button' : ''}`}
                    disabled={!allowAllThree}
                    onClick={() => handleEditClick(user)}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

       
        <br/>
      </main>
      <footer className="footer-container-fixed">
        <div className="footer-content">
          <p className="footer-text">Powered By</p>
          <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="footer-logo" />
        </div>
      </footer>
    </div>
  );
};

export default EditUserManagement;
