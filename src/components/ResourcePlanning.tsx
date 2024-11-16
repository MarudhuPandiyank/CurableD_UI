import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HomePage.css';
import Header from './Header';

const ResourcePlanning: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { startDate, endDate, panchayatMasterId } = location.state || {};

  const [formData, setFormData] = useState({
    programCoordinators: '',
    campCoordinators: '',
    socialWorkers: '',
    nurses: '',
    doctors: '',
  });

  const [reviewData, setReviewData] = useState({
    panchayatMasterId: panchayatMasterId || 0, 
    outreachClinicStartDate: startDate || '',
    outreachClinicEndDate: endDate || '',
    noCampCoordinators: 0,
    noDoctors: 0,
    noNurses: 0,
    noProgramCoordinators: 0,
    noSocialWorkers: 0,
    pincode: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { programCoordinators, campCoordinators, socialWorkers, nurses, doctors } = formData;

    if (!programCoordinators || !campCoordinators || !socialWorkers || !nurses || !doctors) {
      alert('Please fill out all required fields.');
      return;
    }

    const requestData = {
      campDTO: {
        startDate: reviewData.outreachClinicStartDate,
        endDate: reviewData.outreachClinicEndDate,
        panchayatMasterId: reviewData.panchayatMasterId,
        pincode: reviewData.pincode,
        noCampcordinators: campCoordinators,
        noDoctors: doctors,
        noNurses: nurses,
        noProgramcordinators: programCoordinators,
        noSocialworkers: socialWorkers,
      },
      campStaffs: []  // Assuming you have a way to add staff info here if needed
    };

    setLoading(true);  // Start loading

    const axiosInstance = axios.create({
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    try {
      const response = await axiosInstance.post('http://13.234.4.214:8015/api/newcamp', requestData);
      
      if (response.status === 200) {
        navigate('/success-message', { state: { message: 'Resource planning submitted successfully!' } });
      } else {
       // alert('Failed to submit data: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong, please try again later.');
    } finally {
      setLoading(false);  // Stop loading
    }
  };

  return (
    <div className="container2">
      <Header />
      <p className='title1' style={{ color: 'darkblue', fontWeight: 'bold', marginTop: "15px" }}>Resource Planning</p>
      <form className="clinic-form" onSubmit={handleSubmit}>
        <label><span style={{ color: "darkblue" }}>Program Co-ordinator:</span> </label>
        <input
          type="number"
          placeholder="Enter No of Program Co-ordinators"
          name="programCoordinators"
          value={formData.programCoordinators}
          onChange={handleChange}
          required
        />

        <label> <span style={{ color: "darkblue" }}>Camp Co-ordinator:</span></label>
        <input
          type="number"
          placeholder="Enter No of Camp Co-ordinators"
          name="campCoordinators"
          value={formData.campCoordinators}
          onChange={handleChange}
          required
        />

        <label><span style={{ color: "darkblue" }}>Social Workers:</span></label>
        <input
          type="number"
          placeholder="Enter No of Social Workers"
          name="socialWorkers"
          value={formData.socialWorkers}
          onChange={handleChange}
          required
        />

        <label><span style={{ color: "darkblue" }}>Nurses:</span></label>
        <input
          type="number"
          placeholder="Enter No of Nurses"
          name="nurses"
          value={formData.nurses}
          onChange={handleChange}
          required
        />

        <label><span style={{ color: "darkblue" }}>Doctors:</span></label>
        <input
          type="number"
          placeholder="Enter No of Doctors"
          name="doctors"
          value={formData.doctors}
          onChange={handleChange}
          required
        />
        <center>
          <button type="button" className="allocate-button" onClick={() => navigate('/resource-allocation')}>Allocate Resources</button>
          <button type="submit" className="submit-button1" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </center>
      </form>
    </div>
  );
};

export default ResourcePlanning;
