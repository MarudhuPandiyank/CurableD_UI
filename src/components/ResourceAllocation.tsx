import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ResourceAllocation.css';
import Header from './Header';
import { useLocation, useNavigate } from 'react-router-dom';
import Select, { MultiValue, GroupBase } from 'react-select';
import Header1 from './Header1';
import config from '../config'; 
interface Admin {
  id: number;
  name: string;
}

interface HospitalStaffResponse {
  [key: string]: Admin[];
}

interface SelectOption {
  value: number;
  label: string;
}

const ResourceAllocation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { startDate, endDate, panchayatId, pincode, noCampcordinators, noDoctors, noNurses, noProgramCoordinators, noSocialWorkers,clinicName,clinicCode,id } = location.state || {};

  const [formData, setFormData] = useState({
    programCoordinators: [] as Admin[],
    campCoordinators: [] as Admin[],
    socialWorkers: [] as Admin[],
    nurses: [] as Admin[],
    doctors: [] as Admin[],
  });

  const [dropdownData, setDropdownData] = useState({
    programCoordinators: [] as Admin[],
    campCoordinators: [] as Admin[],
    socialWorkers: [] as Admin[],
    nurses: [] as Admin[],
    doctors: [] as Admin[],
  });

  const axiosInstance = axios.create({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  const hospitalId=localStorage.getItem('hospitalId');
  useEffect(() => {
    const fetchStaffDetails = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found, redirecting to login.');
        navigate('/');
        return;
      }

      try {
        const response = await axiosInstance.get<HospitalStaffResponse>(
          `${config.appURL}/curable/hospitalstaffdetails/${localStorage.getItem('hospitalId')}`
        );

        setDropdownData({
          programCoordinators: response.data['Program Coordinator'] || [],
          campCoordinators: response.data['Camp Coordinator'] || [],
          socialWorkers: response.data['Social Worker'] || [],
          nurses: response.data['Nurse'] || [],
          doctors: response.data['Doctor'] || [],
        });
      } catch (error) {
        console.error('Error fetching staff details:', error);
        alert('Failed to fetch staff details. Please try again.');
      }
    };

    fetchStaffDetails();
  }, [navigate]);

  useEffect(() => {
    const fetchStaffDetails = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found, redirecting to login.');
        navigate('/');
        return;
      }
      try {
        let response;
        if (id) {
          response = await axiosInstance.get(`${config.appURL}/curable/campstaffdetails/${id}`);
          console.log('Camp Staff Details:', response.data); // Debugging output
        }
      } catch (error) {
        console.error('Error fetching staff details:', error);
        alert('Failed to fetch staff details. Please try again.');
      }
    };
    fetchStaffDetails();
  }, [navigate, id]);
  

  const handleMultiSelectChange = (name: string) => (selectedOptions: MultiValue<SelectOption>) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: selectedOptions.map((option) => ({
        id: option.value,
        name: option.label,
      })),
    }));
  };

  const createSelectOptions = (data: Admin[]): SelectOption[] => {
    return data.map((item) => ({
      value: item.id,
      label: item.name,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    const { programCoordinators, campCoordinators, socialWorkers, nurses, doctors } = formData;
  
    // Allow submission if at least one field has data
    if (
      programCoordinators.length === 0 &&
      campCoordinators.length === 0 &&
      socialWorkers.length === 0 &&
      nurses.length === 0 &&
      doctors.length === 0
    ) {
      alert('Please select at least one field before submitting.');
      return;
    }
  
    const requestDataFinal = {
      campDTO: {
        startDate,
        endDate,
        panchayatMasterId: panchayatId,
        pincode,
        noCampcordinators,
        noDoctors,
        noNurses,
        noProgramcordinators: noProgramCoordinators,
        noSocialworkers: noSocialWorkers,
        name: clinicName || '',
        campIdPrefix: clinicCode || '',
        hospitalId,
        id: id || null,
      },
      campStaffs: [
        ...programCoordinators.map((coordinator) => ({
          role: 'Program Coordinator',
          name: coordinator.name,
          hospitalEmployeeId: coordinator.id,
        })),
        ...campCoordinators.map((coordinator) => ({
          role: 'Camp Coordinator',
          name: coordinator.name,
          hospitalEmployeeId: coordinator.id,
        })),
        ...socialWorkers.map((worker) => ({
          role: 'Social Worker',
          name: worker.name,
          hospitalEmployeeId: worker.id,
        })),
        ...nurses.map((nurse) => ({
          role: 'Nurse',
          name: nurse.name,
          hospitalEmployeeId: nurse.id,
        })),
        ...doctors.map((doctor) => ({
          role: 'Doctor',
          name: doctor.name,
          hospitalEmployeeId: doctor.id,
        })),
      ],
    };
  
    try {
      const response = await axiosInstance.post<string>(`${config.appURL}/curable/newcamp`, requestDataFinal);
  
      if (response.status === 200) {
        navigate('/success-messageEdit', { state: { clickId: response.data } });
      } else {
        alert('Failed to submit data.');
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Something went wrong, please try again later.');
    }
  };
  

  return (
    <div className="container2">
      <form className="clinic-form" onSubmit={handleSubmit}>
      <Header1 />
        
        <h1 style={{ color: 'darkblue' }}>Resource Allocation</h1>
        <div className="form-group">
          <label className="label">Program Co-ordinator:</label>
          <Select<SelectOption, true, GroupBase<SelectOption>>
            isMulti
            name="programCoordinators"
            value={formData.programCoordinators.map((coordinator) => ({
              value: coordinator.id,
              label: coordinator.name,
            }))}
            options={createSelectOptions(dropdownData.programCoordinators)}
            onChange={handleMultiSelectChange('programCoordinators')}
          />
        </div>

        <div className="form-group">
          <label className="label">Outreach Clinic Co-ordinator:</label>
          <Select<SelectOption, true, GroupBase<SelectOption>>
            isMulti
            name="campCoordinators"
            value={formData.campCoordinators.map((coordinator) => ({
              value: coordinator.id,
              label: coordinator.name,
            }))}
            options={createSelectOptions(dropdownData.campCoordinators)}
            onChange={handleMultiSelectChange('campCoordinators')}
          />
        </div>

        <div className="form-group">
          <label className="label">Social Workers:</label>
          <Select<SelectOption, true, GroupBase<SelectOption>>
            isMulti
            name="socialWorkers"
            value={formData.socialWorkers.map((worker) => ({
              value: worker.id,
              label: worker.name,
            }))}
            options={createSelectOptions(dropdownData.socialWorkers)}
            onChange={handleMultiSelectChange('socialWorkers')}
          />
        </div>

        <div className="form-group">
          <label className="label">Nurses:</label>
          <Select<SelectOption, true, GroupBase<SelectOption>>
            isMulti
            name="nurses"
            value={formData.nurses.map((nurse) => ({
              value: nurse.id,
              label: nurse.name,
            }))}
            options={createSelectOptions(dropdownData.nurses)}
            onChange={handleMultiSelectChange('nurses')}
          />
        </div>

        <div className="form-group">
          <label className="label">Doctors:</label>
          <Select<SelectOption, true, GroupBase<SelectOption>>
            isMulti
            name="doctors"
            value={formData.doctors.map((doctor) => ({
              value: doctor.id,
              label: doctor.name,
            }))}
            options={createSelectOptions(dropdownData.doctors)}
            onChange={handleMultiSelectChange('doctors')}
          />
        </div>

        <button
  className="submit-button"
  type="submit"
  disabled={
    formData.programCoordinators.length === 0 &&
    formData.campCoordinators.length === 0 &&
    formData.socialWorkers.length === 0 &&
    formData.nurses.length === 0 &&
    formData.doctors.length === 0
  }
>
  Submit
</button>

      </form>
      <footer className="footer-container">
        <div className="footer-content">
          <p className="footer-text">Powered By Curable</p>
          <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="footer-logo" />
        </div>
      </footer>
    </div>
  );
};

export default ResourceAllocation;
