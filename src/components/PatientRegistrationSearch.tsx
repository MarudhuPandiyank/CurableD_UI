// src/components/PatientRegistrationSearch.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import '../components/OutreachClinicInfo.css';
import Header1 from './Header1';
import config from '../config';
import './Common.css';

// 👇 NEW: read privilege flags from Redux
import { useSelector } from 'react-redux';
import { selectPrivilegeFlags } from '../store/userSlice';

import { canAll, can, Privilege } from '../store/userSlice';

interface Clinic {
  id: string;
  name: string;
  pincode: string;
  state: string;
  district: string;
  taluk: string;
  village: string;
  startDate: string;
  endDate: string;
  noCampcordinators?: number;
  noDoctors?: number;
  noNurses?: number;
  noProgramCoordinators?: number;
  noSocialWorkers?: number;
  displayStartDate: string;
  displayEndDate: string;
}

interface ClinicAPIResponse {
  campIdPrefix: string;
  campId: string;
  pincode: string;
  stateName: string;
  campName: string;
  districtName: string;
  talukName: string;
  panchayatName: string;
  startDate: string;
  endDate: string;
  noCampcordinators?: number;
  noDoctors?: number;
  noNurses?: number;
  noProgramCoordinators?: number;
  noSocialWorkers?: number;
  displayStartDate: string;
  displayEndDate: string;
}

const PatientRegistrationSearch: React.FC = () => {
  const navigate = useNavigate();

  // 🔐 privileges for this screen (by menu name or use '/preg')
  const { canView, canCreate, canEdit } = useSelector(
    selectPrivilegeFlags('Patient Registration') // or selectPrivilegeFlags('/preg')
  );

  const allowAllThree = useSelector(canAll('/preg', 'CREATE', 'VIEW', 'EDIT'));

  console.log(allowAllThree,"allowAllThree")
  
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [searchInput, setSearchInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [openNoClinicDialog, setOpenNoClinicDialog] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const handleSearch = async () => {
    // Guard: need VIEW privilege to search
    if (!canView) return;

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
       let roleId= localStorage.getItem('roleId');
            let hospitalId= localStorage.getItem('hospitalId');
      const response = await axios.post<ClinicAPIResponse[]>(
        `${config.appURL}/curable/activecamp`,
 { search: searchInput, userId: Number(userIds),roleId: Number(roleId) ,hospitalId: Number(hospitalId),stage:1},
         { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.length > 0) {
        const clinicsData = response.data.map((clinicData) => {
          const startDate = clinicData.startDate;
          const endDate = clinicData.endDate;
          localStorage.setItem('campId', clinicData.campId);
          localStorage.setItem('prefill', 'false');
          return {
            id: clinicData.campIdPrefix,
            name: clinicData.campName,
            pincode: clinicData.pincode,
            state: clinicData.stateName,
            district: clinicData.districtName,
            taluk: clinicData.talukName,
            village: clinicData.panchayatName,
            startDate,
            endDate,
            noCampcordinators: clinicData.noCampcordinators,
            noDoctors: clinicData.noDoctors,
            noNurses: clinicData.noNurses,
            noProgramCoordinators: clinicData.noProgramCoordinators,
            noSocialWorkers: clinicData.noSocialWorkers,
            displayStartDate: clinicData.displayStartDate,
            displayEndDate: clinicData.displayEndDate,
          };
        });

        setClinics(clinicsData);
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

  const handleEditClick = (clinic: Clinic) => {
    // Guard: you may also require canCreate AND/OR canView here depending on flow
    if (!canCreate) return;

    navigate('/NewScreeningEnrollment', {
      state: {
        startDate: clinic.startDate,
        endDate: clinic.endDate,
        panchayatId: 1,
        pincode: clinic.pincode,
        noCampcordinators: clinic.noCampcordinators,
        noDoctors: clinic.noDoctors,
        noNurses: clinic.noNurses,
        noProgramCoordinators: clinic.noProgramCoordinators,
        noSocialWorkers: clinic.noSocialWorkers,
      },
    });
  };

  const handleClinicSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    setSelectedClinicId(selectedId);
  };

  const filteredClinics = clinics.filter(
    (clinic) => !selectedClinicId || clinic.id === selectedClinicId
  );

  const hasDuplicateNames = clinics.some(
    (clinic, index, self) =>
      self.findIndex((c) => c.name === clinic.name) !== index
  );

  return (
    <div className="container2">
      <Header1 />
      <h1 style={{ color: 'darkblue', fontWeight: 'bold' }}>Patient Registration</h1>

      <main className="content">
        <div className="search-section_patitent">
          <div className="full-width-search-section">
            <div className="full-width-search-input-container">
              <input
                className="full-width-search-input"
                type="text"
                placeholder="Enter Clinic ID or Name"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />

              {/* VIEW → show Search button. If you prefer "disabled when no VIEW", replace block with one disabled button */}
             
                <button
                  className={`full-width-search-button ${!allowAllThree ? 'disabled-button' : ''}`}
                  onClick={handleSearch}
 disabled={!allowAllThree || loading}                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              
            </div>
          </div>
        </div>

        {message && <div className="message">{message}</div>}

        {/* Example: duplicate name resolver dropdown (kept commented as in your code) */}
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

        {filteredClinics.length > 0 && (
          <div className="clinic-details-container">
            {filteredClinics.map((clinic) => (
              <div className="clinic-details" key={clinic.id}>
                <p>
                  <strong>Outreach Clinic ID:</strong> <span>{clinic.id}</span>
                </p>
                <p>
                  <strong>Outreach Clinic Name:</strong> <span>{clinic.name}</span>
                </p>
                <p>
                  <strong>Pincode:</strong> <span>{clinic.pincode}</span>
                </p>
                <p>
                  <strong>State Name:</strong> <span>{clinic.state}</span>
                </p>
                <p>
                  <strong>District Name:</strong> <span>{clinic.district}</span>
                </p>
                <p>
                  <strong>Taluk Name:</strong> <span>{clinic.taluk}</span>
                </p>
                <p>
                  <strong>Panchayat/Village Name:</strong> <span>{clinic.village}</span>
                </p>
                <p>
                  <strong>Start Date:</strong> <span>{clinic.displayStartDate}</span>
                </p>
                <p>
                  <strong>End Date:</strong> <span>{clinic.displayEndDate}</span>
                </p>

                <div className="edit-button-container">
                  {/* CREATE → Start Registration */}
                  {canCreate && (
                    <button
                      className="edit-button"
                      onClick={() => handleEditClick(clinic)}
                    >
                      Start Registration
                    </button>
                  )}

                  {/* EDIT → Example edit button (uncomment if needed) */}
                  {/* {canEdit && (
                    <button
                      className="edit-button"
                      onClick={() => {/* your edit flow */ /*}}
                    >
                      Edit Registration
                    </button>
                  )} */}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Clinics Found Dialog */}
        <Dialog open={openNoClinicDialog} onClose={handleCloseNoClinicDialog}>
          <DialogTitle style={{ textAlign: 'center' }}>
            This Outreach Clinic does not exist
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" style={{ textAlign: 'center' }}>
              Do you want to create a new Outreach Clinic?
            </Typography>
          </DialogContent>
          <DialogActions style={{ justifyContent: 'center' }}>
            <Button
              onClick={handleCreateClinic}
              variant="contained"
              color="primary"
              style={{ backgroundColor: '#d774ad', color: 'white' }}
            >
              Yes
            </Button>
            <Button
              onClick={handleCloseNoClinicDialog}
              variant="outlined"
              style={{ color: '#d774ad', borderColor: '#d774ad' }}
            >
              No
            </Button>
          </DialogActions>
        </Dialog>
      </main>

      <br />
      <footer className="footer-container-fixed">
        <div className="footer-content">
          <p className="footer-text">Powered By</p>
          <img
            src="/assets/Curable logo - rectangle with black text.png"
            alt="Curable Logo"
            className="footer-logo"
          />
        </div>
      </footer>
    </div>
  );
};

export default PatientRegistrationSearch;
