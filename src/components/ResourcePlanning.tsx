import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HomePage.css';
import Header from './Header';
import SuccessMessage from './SuccessMessage';
import ResourceAllocation from './ResourceAllocation';

const ResourcePlanning: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { startDate, endDate, panchayatId,pincode, clinicName, clinicCode } = location.state || {};
  const [clickId, setClickId] = useState('');

  const [formData, setFormData] = useState({
    noProgramCoordinators: '',
    noCampcordinators: '',
    noSocialWorkers: '',
    noNurses: '',
    noDoctors: '',
  });
  const hospitalId = localStorage.getItem('hospitalId');

  const [reviewData, setReviewData] = useState({
   
    panchayatMasterId: panchayatId || 0, 
    outreachClinicStartDate: startDate || '',
    outreachClinicEndDate: endDate || null,
    noCampCoordinators: 0,
    noDoctors: 0,
    noNurses: 0,
    noProgramCoordinators: 0,
    noSocialWorkers: 0,
    pincode: pincode || ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const { noProgramCoordinators, noCampcordinators, noSocialWorkers, noNurses, noDoctors } = formData;
  const requestData = {
    campDTO: {
      name: clinicName || '',
      campIdPrefix: clinicCode || '',
      hospitalId,
      startDate: reviewData.outreachClinicStartDate,
      endDate: reviewData.outreachClinicEndDate,
      panchayatMasterId: reviewData.panchayatMasterId,
      pincode: reviewData.pincode,
      noCampcordinators: noCampcordinators,
      noDoctors: noDoctors,
      noNurses: noNurses,
      noProgramcordinators: noProgramCoordinators,
      noSocialworkers: noSocialWorkers,
    },
    campStaffs: [],
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
  
    // if (!noProgramCoordinators || !noCampcordinators || !noSocialWorkers || !noNurses || !noDoctors) {
    //   alert('Please fill out all required fields.');
    //   return;
    // }
  

  
    setLoading(true); // Start loading
  
    const axiosInstance = axios.create({
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  
    try {
      const response = await axiosInstance.post<string>('http://13.234.4.214:8015/api/curable/newcamp', requestData);
  
      if (response.status === 200) {
        navigate('/success-message', {
          state: { clickId: response.data }, // Directly pass the response data
        });
      } else {
        alert('Failed to submit data.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong, please try again later.');
    } finally {
      setLoading(false); // Stop loading
    }
  };
  
  const handleAllocateResources = () => {

    navigate('/resource-allocation', { state: { startDate,endDate,panchayatId,pincode,noCampcordinators,noDoctors,noNurses,noProgramCoordinators,noSocialWorkers,clinicName,clinicCode} });
  };
  return (
    <div className="container2">
      <Header />
      <p className='title1' style={{ color: 'darkblue', fontWeight: 'bold',marginTop:'10px'  }}>Resource Planning</p>
      <form className="clinic-form" onSubmit={handleSubmit}>
        <label><span style={{ color: "darkblue" }}>Program Co-ordinator:</span> </label>
        <input
          type="number"
          placeholder="Enter No of Program Co-ordinators"
          name="noProgramCoordinators"
          value={formData.noProgramCoordinators}
          onChange={handleChange}
          //required
        />

        <label> <span style={{ color: "darkblue" }}>Camp Co-ordinator:</span></label>
        <input
          type="number"
          placeholder="Enter No of Camp Co-ordinators"
          name="noCampcordinators"
          value={formData.noCampcordinators}
          onChange={handleChange}
          //required
        />

        <label><span style={{ color: "darkblue" }}>Social Workers:</span></label>
        <input
          type="number"
          placeholder="Enter No of Social Workers"
          name="noSocialWorkers"
          value={formData.noSocialWorkers}
          onChange={handleChange}
          //required
        />

        <label><span style={{ color: "darkblue" }}>Nurses:</span></label>
        <input
          type="number"
          placeholder="Enter No of Nurses"
          name="noNurses"
          value={formData.noNurses}
          onChange={handleChange}
          //required
        />

        <label><span style={{ color: "darkblue" }}>Doctors:</span></label>
        <input
          type="number"
          placeholder="Enter No of Doctors"
          name="noDoctors"
          value={formData.noDoctors}
          onChange={handleChange}
          //required
        />
        <center>
          <button type="button" className="allocate-button" onClick={handleAllocateResources}>Allocate Resources</button>
          <button type="submit" className="submit-button1" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </center>
      </form>
    </div>
  );
};

export default ResourcePlanning;
