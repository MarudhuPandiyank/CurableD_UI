import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HomePage.css';
import Header from './Header';
import SuccessMessage from './SuccessMessage';
import ResourceAllocation from './ResourceAllocation';
import Header1 from './Header1';
import config from '../config'; 
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
  const { name, value } = e.target;
  const numberOnlyFields = [
    'noProgramCoordinators',
    'noCampcordinators',
    'noSocialWorkers',
    'noNurses',
    'noDoctors',
  ];

  if (numberOnlyFields.includes(name)) {
    if (!/^\d*$/.test(value)) return; 
  }

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
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
      const response = await axiosInstance.post<string>(`${config.appURL}/curable/newcamp`, requestData);
  
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
     /*not uswcontainer21*/
    <div className="container21">
       <Header1 />
      <h1 style={{ color: 'darkblue' }}>Resource Planning</h1>
<form className="clinic-form" onSubmit={handleSubmit}>
  <label><span style={{ color: "darkblue" }}>Program Co-ordinator:</span> </label>
  <input
    type="text"
    inputMode="numeric"
    placeholder="Enter No of Program Co-ordinators"
    name="noProgramCoordinators"
    value={formData.noProgramCoordinators}
    onChange={handleChange}
  />

  <label><span style={{ color: "darkblue" }}>Camp Co-ordinator:</span></label>
  <input
    type="text"
    inputMode="numeric"
    placeholder="Enter No of Camp Co-ordinators"
    name="noCampcordinators"
    value={formData.noCampcordinators}
    onChange={handleChange}
  />

  <label><span style={{ color: "darkblue" }}>Social Workers:</span></label>
  <input
    type="text"
    inputMode="numeric"
    placeholder="Enter No of Social Workers"
    name="noSocialWorkers"
    value={formData.noSocialWorkers}
    onChange={handleChange}
  />

  <label><span style={{ color: "darkblue" }}>Nurses:</span></label>
  <input
    type="text"
    inputMode="numeric"
    placeholder="Enter No of Nurses"
    name="noNurses"
    value={formData.noNurses}
    onChange={handleChange}
  />

  <label><span style={{ color: "darkblue" }}>Doctors:</span></label>
  <input
    type="text"
    inputMode="numeric"
    placeholder="Enter No of Doctors"
    name="noDoctors"
    value={formData.noDoctors}
    onChange={handleChange}
  />
   <center>
            <div className="buttons_resource">
            {/* <button type="submit" className="Finish-extrawidtgh-button">
             Prev
              </button> */}
              <button
                type="button"
                 className="Next-extrawidtgh-button"
                onClick={handleAllocateResources}>Allocate Resources</button>
              <button type="submit" className="Finish-extrawidtgh-button">
              Submit
              </button>
            </div>
          </center>
          <br/>
          
      
      </form>
      <footer className="footer-container-fixed">
        <div className="footer-content">
          <p className="footer-text">Powered By</p>
          <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="footer-logo" />
        </div>
      </footer>
    </div>
  );
};

export default ResourcePlanning;
