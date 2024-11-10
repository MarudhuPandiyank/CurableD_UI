import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../components/OutreachClinicInfo.css';

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

  const handleSearch = async () => {
    if (!searchInput) {
      alert('Please enter a clinic ID or Name.');
      return;
    }

    setLoading(true);

    // Retrieve token from storage or a secure location
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authorization token not found. Please log in again.');
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
        alert('No clinics found.');
        setClinics([]);
      }
    } catch (error) {
      console.error('Error fetching clinic data:', error);
      alert('Failed to fetch clinic details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleEditClick = (clinic: Clinic) => {
    navigate('/EditOutreachClinic', { state: clinic }); // Passing clinic data to EditOutreachClinic
  };

  return (
    <div className="container2">
      <header className="header">
        <button className="back-button" onClick={handleBackClick}>Back</button>
        <h1>Outreach Clinic Information</h1>
      </header>
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

        {/* Render clinic details dynamically based on response array size */}
        {clinics.length > 0 && (
          <div className="clinic-details-container">
            {clinics.map((clinic) => (
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

        {clinics.length > 0 && (
          <button className="create-button" onClick={() => navigate('/create-outreach-clinic')}>
            Create New Outreach Clinic
          </button>
        )}
      </main>
    </div>
  );
};

export default OutreachClinicInfo;
