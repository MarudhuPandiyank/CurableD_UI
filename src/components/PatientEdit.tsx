import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import '../components/OutreachClinicInfo.css';  // Same CSS file
import Header1 from './Header1';
import config from '../config';  // Import the config file
import { useSelector } from 'react-redux';
import { selectPrivilegeFlags } from '../store/userSlice';

import { canAll, can, Privilege } from '../store/userSlice';


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
  campId?: number;
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
  campId?: number;
  hospitalId: number;
}

const PatientEdit: React.FC = () => {
  const navigate = useNavigate();
      const { canView, canCreate, canEdit } = useSelector(
      selectPrivilegeFlags('Patient Registration') // or selectPrivilegeFlags('/preg')
    );
  
    const allowAllThree = useSelector(canAll('/screening', 'CREATE', 'VIEW', 'EDIT'));


  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchInput, setSearchInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number>(0);
  const [openNoCandidateDialog, setOpenNoCandidateDialog] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const handleSearch = async () => {
    // if (!searchInput) {
    //   setMessage('Please enter a search term.');
    //   return;
    // }

    setLoading(true);
    setMessage('');
          localStorage.removeItem('campId');


    const token = localStorage.getItem('token');
    const hospitalId = localStorage.getItem('hospitalId');
     const roleId= localStorage.getItem('roleId');
    const userId= localStorage.getItem('userId');
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
 { hospitalId: parseInt(hospitalId, 10), search: searchInput, stage: 3,roleId: Number(roleId) ,userId :Number(userId) },
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
            campId: candidateData.campId,
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

  const handleEditClick = (candidateId: number, candidateObj?: Candidate | any) => {
    // mark that we should prefill and store the patientId
    localStorage.setItem('prefill', 'true');
    localStorage.setItem('patientId', candidateId.toString());
    // if the candidate object contains campId, persist it for the enrollment form
    if (candidateObj && candidateObj.campId !== undefined && candidateObj.campId !== null) {
      localStorage.setItem('campId', String(candidateObj.campId));
    }
    console.log(  candidateObj,   String(candidateObj.campId),"sdskd"
)

    console.log(candidateObj,"candidateObj")
    localStorage.removeItem("touchedspo2");
localStorage.removeItem("agevalue");
localStorage.removeItem("ageatmarriage");
localStorage.removeItem("totalpreg");
localStorage.removeItem("firstchild");
localStorage.removeItem("latschild");
localStorage.removeItem("heightval");
localStorage.removeItem("weightval");

    navigate('/NewScreeningEnrollment', { state: { candidateId: candidateId, edit: true, registrationId: candidateObj?.registrationId, registraionId: candidateObj?.registrationId } });
  };

  return (
    <div className="container2">
      <Header1 />


      
        <div className="title">
          
        <h1 style={{ color: 'darkblue' }}>Modify Patient Information</h1>
      </div>
  <div className="search-section_common">
        <input
                  className="search-input"

           type="text"
 placeholder="Search by Patient name/id/mobile"
               value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();       
                  handleSearch();           
                }
              }} />
        <button
           className={`search-button_common ${!allowAllThree ? 'disabled-button' : ''}`}
onClick={handleSearch} disabled={loading}>                  {loading ? 'Searching...' : 'Search'}
        
        </button>
      </div>


      <main className="content">
        <div className="search-container">
         
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
                  <button  disabled={!allowAllThree }
                    className={`edit-button ${!allowAllThree ? 'disabled-button' : ''}`}
                    onClick={() => handleEditClick(candidate.id,candidate)}
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
