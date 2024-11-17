// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
// import '../components/OutreachClinicInfo.css';
// import Header from './Header';

// interface Clinic {
//   id: string;
//   name: string;
//   pincode: string;
//   state: string;
//   district: string;
//   taluk: string;
//   village: string;
// }

// interface ClinicAPIResponse {
//   campIdPrefix: string;
//   campId: string;
//   pincode: string;
//   stateName: string;
//   campName: string;
//   districtName: string;
//   talukName: string;
//   panchayatName: string;
// }

// const OutreachClinicInfo: React.FC = () => {
//   const navigate = useNavigate();

//   const [clinics, setClinics] = useState<Clinic[]>([]);
//   const [searchInput, setSearchInput] = useState<string>('');
//   const [loading, setLoading] = useState<boolean>(false);
//   const [selectedClinicId, setSelectedClinicId] = useState<string>('');
//   const [openNoClinicDialog, setOpenNoClinicDialog] = useState<boolean>(false);

//   const handleSearch = async () => {
//     if (!searchInput) {
//       alert('Please enter a clinic ID or Name.');
//       return;
//     }

//     setLoading(true);

//     const token = localStorage.getItem('token');
//     if (!token) {
//       alert('Authorization token not found. Please log in again.');
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await axios.post<ClinicAPIResponse[]>('http://13.234.4.214:8015/api/curable/activecamp', {
//         search: searchInput,
//         userId: 1
//       }, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (response.data.length > 0) {
//         const clinicsData = response.data.map((clinicData) => ({
//           id: clinicData.campIdPrefix + clinicData.campId,
//           name: clinicData.campName,
//           pincode: clinicData.pincode,
//           state: clinicData.stateName,
//           district: clinicData.districtName,
//           taluk: clinicData.talukName,
//           village: clinicData.panchayatName,
//         }));

//         setClinics(clinicsData);
//       } else {
//         // Show pop-up when no clinics are found
//         setOpenNoClinicDialog(true);
//       }
//     } catch (error) {
//       console.error('Error fetching clinic data:', error);
//       alert('Failed to fetch clinic details. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreateClinic = () => {
//     setOpenNoClinicDialog(false);
//     navigate('/create-outreach-clinic');
//   };

//   const handleCloseNoClinicDialog = () => {
//     setOpenNoClinicDialog(false);
//   };

//   const handleEditClick = (clinic: Clinic) => {
//     navigate('/EditOutreachClinic', { state: clinic });
//   };

//   const handleClinicSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     const selectedId = event.target.value;
//     setSelectedClinicId(selectedId);
//   };

//   const filteredClinics = clinics.filter(
//     (clinic) => !selectedClinicId || clinic.id === selectedClinicId
//   );

//   const hasDuplicateNames = clinics.some(
//     (clinic, index, self) =>
//       self.findIndex((c) => c.name === clinic.name) !== index
//   );

//   return (
//     <div className="container2">
//       <Header />
//       <main className="content">
//         <div className="search-container">
//           <label>Search:</label>
//           <div className="search-input-container">
//             <input
//               type="text"
//               placeholder="Enter Clinic ID or Name"
//               value={searchInput}
//               onChange={(e) => setSearchInput(e.target.value)}
//             />
//             <button className="search-button" onClick={handleSearch} disabled={loading}>
//               {loading ? 'Searching...' : 'Search'}
//             </button>
//           </div>
//         </div>

//         {hasDuplicateNames && (
//           <div className="clinic-select-container">
//             <label>Select Clinic ID:</label>
//             <select onChange={handleClinicSelect} value={selectedClinicId}>
//               <option value="">All</option>
//               {clinics.map((clinic) => (
//                 <option key={clinic.id} value={clinic.id}>
//                   {clinic.id} - {clinic.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         )}

//         {filteredClinics.length > 0 && (
//           <div className="clinic-details-container">
//             {filteredClinics.map((clinic) => (
//               <div className="clinic-details" key={clinic.id}>
//                 <p><strong>Outreach Clinic ID:</strong> <span>{clinic.id}</span></p>
//                 <p><strong>Outreach Clinic Name:</strong> <span>{clinic.name}</span></p>
//                 <p><strong>Pincode:</strong> <span>{clinic.pincode}</span></p>
//                 <p><strong>State Name:</strong> <span>{clinic.state}</span></p>
//                 <p><strong>District Name:</strong> <span>{clinic.district}</span></p>
//                 <p><strong>Taluk Name:</strong> <span>{clinic.taluk}</span></p>
//                 <p><strong>Panchayat/Village Name:</strong> <span>{clinic.village}</span></p>

//                 <div className="edit-button-container">
//                   <button className="edit-button" onClick={() => handleEditClick(clinic)}>Edit</button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* {clinics.length > 0 && (
//           <button className="create-button" onClick={() => navigate('/create-outreach-clinic')}>
//             Create New Outreach Clinic
//           </button>
//         )} */}

//         {/* No Clinics Found Dialog */}
//         <Dialog open={openNoClinicDialog} onClose={handleCloseNoClinicDialog}>
//           <DialogTitle style={{ textAlign: 'center' }}>This Outreach Clinic does not exist</DialogTitle>
//           <DialogContent>
//             <Typography variant="body1" style={{ textAlign: 'center' }}>
//               Do you want to create a new Outreach Clinic?
//             </Typography>
//           </DialogContent>
//           <DialogActions style={{ justifyContent: 'center' }}>
//             <Button onClick={handleCreateClinic} variant="contained" color="primary" style={{ backgroundColor: '#d05a97', color: 'white' }}>
//               Yes
//             </Button>
//             <Button onClick={handleCloseNoClinicDialog} variant="outlined" style={{ color: '#d05a97', borderColor: '#d05a97' }}>
//               No
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </main>
//     </div>
//   );
// };

// export default OutreachClinicInfo;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import '../components/OutreachClinicInfo.css';
import Header from './Header';

interface Clinic {
  id: string;
  name: string;
  pincode: string;
  state: string;
  district: string;
  taluk: string;
  village: string;
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
}

const OutreachClinicInfo: React.FC = () => {
  const navigate = useNavigate();

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [searchInput, setSearchInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [openNoClinicDialog, setOpenNoClinicDialog] = useState<boolean>(false);
  const [message, setMessage] = useState<string>(''); // New message state

  const handleSearch = async () => {
    if (!searchInput) {
      setMessage('Please enter a clinic ID or Name.');
      return;
    }

    setLoading(true);
    setMessage(''); // Clear any previous message

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Authorization token not found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post<ClinicAPIResponse[]>('http://13.234.4.214:8015/api/curable/activecamp', {
        search: searchInput,
        userId: 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.length > 0) {
        const clinicsData = response.data.map((clinicData) => ({
          id: clinicData.campIdPrefix + clinicData.campId,
          name: clinicData.campName,
          pincode: clinicData.pincode,
          state: clinicData.stateName,
          district: clinicData.districtName,
          taluk: clinicData.talukName,
          village: clinicData.panchayatName,
        }));

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
    navigate('/resource-allocation', { state: clinic });
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
      <Header />
      <main className="content">
        <div className="search-container">
          <label>Search:</label>
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Enter Clinic ID or Name"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button className="search-button" onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {message && <div className="message">{message}</div>}

        {hasDuplicateNames && (
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
        )}

        {filteredClinics.length > 0 && (
          <div className="clinic-details-container">
            {filteredClinics.map((clinic) => (
              <div className="clinic-details" key={clinic.id}>
                <p><strong>Outreach Clinic ID:</strong> <span>{clinic.id}</span></p>
                <p><strong>Outreach Clinic Name:</strong> <span>{clinic.name}</span></p>
                <p><strong>Pincode:</strong> <span>{clinic.pincode}</span></p>
                <p><strong>State Name:</strong> <span>{clinic.state}</span></p>
                <p><strong>District Name:</strong> <span>{clinic.district}</span></p>
                <p><strong>Taluk Name:</strong> <span>{clinic.taluk}</span></p>
                <p><strong>Panchayat/Village Name:</strong> <span>{clinic.village}</span></p>

                <div className="edit-button-container">
                  <button className="edit-button" onClick={() => handleEditClick(clinic)}>Edit</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Clinics Found Dialog */}
        <Dialog open={openNoClinicDialog} onClose={handleCloseNoClinicDialog}>
          <DialogTitle style={{ textAlign: 'center' }}>This Outreach Clinic does not exist</DialogTitle>
          <DialogContent>
            <Typography variant="body1" style={{ textAlign: 'center' }}>
              Do you want to create a new Outreach Clinic?
            </Typography>
          </DialogContent>
          <DialogActions style={{ justifyContent: 'center' }}>
            <Button onClick={handleCreateClinic} variant="contained" color="primary" style={{ backgroundColor: '#e91e63', color: 'white' }}>
              Yes
            </Button>
            <Button onClick={handleCloseNoClinicDialog} variant="outlined" style={{ color: '#e91e63', borderColor: '#e91e63' }}>
              No
            </Button>
          </DialogActions>
        </Dialog>
      </main>
    </div>
  );
};

export default OutreachClinicInfo;
