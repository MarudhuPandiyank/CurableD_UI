import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import '../components/OutreachClinicInfo.css';  // Same CSS file
import Header1 from './Header1';
import config from '../config';  // Import the config file

interface Candidate {
  id: number;  // Standardized to number
  registrationId: string;
  name: string;
  gender: string;
  age: number;
  spouseName?: string | null;
  mobileNo: string;
  dob?: string | null;
  fatherName?: string | null;
  hospitalId: number;
}

interface CandidateAPIResponse {
  id: number;
  registrationId: string;
  name: string;
  gender: string;
  age: number;
  spouseName?: string | null;
  mobileNo: string;
  dob?: string | null;
  fatherName?: string | null;
  hospitalId: number;
}

const PatientEdit: React.FC = () => {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchInput, setSearchInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number>(0);
  const [openNoCandidateDialog, setOpenNoCandidateDialog] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const handleSearch = async () => {
    if (!searchInput) {
      setMessage('Please enter a search term.');
      return;
    }

    setLoading(true);
    setMessage('');

    const token = localStorage.getItem('token');
    const hospitalId = localStorage.getItem('hospitalId');
    if (!token) {
      setMessage('Authorization token not found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      if (!hospitalId) {
        alert('No hospital ID found. Please ensure hospitalId is set in local storage.');
        return;
      }
      const response = await axios.post<CandidateAPIResponse[]>(
        `${config.appURL}/curable/getCandidatesList`,
        { hospitalId: parseInt(hospitalId, 10), search: searchInput, stage: 3 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.length > 0) {
        const candidatesData = response.data.map((candidateData) => ({
          id: candidateData.id,
          registrationId: candidateData.registrationId,
          name: candidateData.name,
          gender: candidateData.gender,
          age: candidateData.age,
          spouseName: candidateData.spouseName,
          mobileNo: candidateData.mobileNo,
          dob: candidateData.dob,
          fatherName: candidateData.fatherName,
          hospitalId: candidateData.hospitalId,
        }));

        setCandidates(candidatesData);
                {console.log(candidatesData,"candidates")}

      } else {
        setOpenNoCandidateDialog(true);
      }
    } catch (error) {
      console.error('Error fetching candidate data:', error);
      setMessage('Failed to fetch candidate details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNoCandidateDialog = () => {
    setOpenNoCandidateDialog(false);
  };

  const handleEditClick = (candidateId: number) => {
    localStorage.setItem('prefill', 'true');
    localStorage.setItem('patientId', candidateId.toString());
    navigate('/NewScreeningEnrollment');
  };

  return (
    <div className="container2">
      <Header1 />
      <h1 style={{ color: 'darkblue', fontWeight: 'bold', }}>Search Patient</h1>

      <main className="content">
        <div className="search-container">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Enter ID/Mobile No"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();       
                  handleSearch();           
                }
              }}
            />
            <button className="search-button" onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {message && <div className="message">{message}</div>}

        {candidates.length > 0 && (
          <div className="clinic-details-container">
            {candidates.map((candidate) => (
              <div className="clinic-details" key={candidate.id}>
                <p><strong>Individual Name:</strong> <span>{candidate.name}</span></p>
                {/* <p><strong>Date of Birth:</strong> <span>{candidate.dob?.split("-").reverse().join("-")}</span></p> */}
                <p><strong>Age:</strong> <span>{candidate.age}</span></p>
                <p><strong>Gender:</strong> <span>{candidate.gender}</span></p>
                <p><strong>Spouse Name:</strong> <span>{candidate.spouseName}</span></p>
                <p><strong>Father Name:</strong> <span>{candidate.fatherName}</span></p>
                <p><strong>Mobile No:</strong> <span>{candidate.mobileNo}</span></p>
                <div className="edit-button-container">
                  <button
                    className="edit-button"
                    onClick={() => handleEditClick(candidate.id)}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Candidates Found Dialog */}
        <Dialog open={openNoCandidateDialog} onClose={handleCloseNoCandidateDialog}>
          <DialogTitle style={{ textAlign: 'center' }}>No candidates found</DialogTitle>
          <DialogContent>
            <Typography variant="body1" style={{ textAlign: 'center' }}>
              No candidates match your search. Please try a different search term.
            </Typography>
          </DialogContent>
          <DialogActions style={{ justifyContent: 'center' }}>
            <Button onClick={handleCloseNoCandidateDialog} variant="outlined" style={{ color: '#d774ad', borderColor: '#e91e63' }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </main>
      <br/>
      <footer className="footer-container-fixed">
        <div className="footer-content">
          <p className="footer-text">Powered By</p>
          <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="footer-logo" />
        </div>
      </footer>
    </div>
  );
};

export default PatientEdit;
