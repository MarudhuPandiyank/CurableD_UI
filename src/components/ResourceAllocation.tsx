import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ResourceAllocation.css';
import Header from './Header';
import { useNavigate } from 'react-router-dom';
import Select, { MultiValue, GroupBase } from 'react-select';

interface Admin {
  name: string;
}

interface HospitalStaffResponse {
  admin: Admin[];
}

// Define Option type
interface SelectOption {
  value: string;
  label: string;
}

const ResourceAllocation: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    programCoordinators: [],
    campCoordinators: [],
    socialWorkers: [],
    nurses: [],
    doctors: [],
  });

  const [programCoordinators, setProgramCoordinators] = useState<Admin[]>([]);

  const axiosInstance = axios.create({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  useEffect(() => {
    const fetchProgramCoordinators = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found, redirecting to login.');
        navigate('/');
        return;
      }

      try {
        const response = await axiosInstance.get<HospitalStaffResponse>(
          'http://13.234.4.214:8015/api/curable/hospitalstaffdetails/{hospitalId}'
        );

        setProgramCoordinators(response.data.admin);
      } catch (error) {
        console.error('Error fetching coordinators:', error);
        alert('Failed to fetch coordinators. Please try again.');
      }
    };

    fetchProgramCoordinators();
  }, [navigate]);

  const handleMultiSelectChange = (name: string) => (selectedOptions: MultiValue<SelectOption>) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: selectedOptions.map((option) => option.value),
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { programCoordinators, campCoordinators, socialWorkers, nurses, doctors } = formData;
    if (!programCoordinators.length || !campCoordinators.length || !socialWorkers.length || !nurses.length || !doctors.length) {
      alert('Please fill out all required fields.');
      return;
    }

    // Submit the form data (you could send it to an API here)
    navigate('/success-message');
  };

  const createSelectOptions = (data: string[]): SelectOption[] => {
    return data.map((item) => ({
      value: item,
      label: item,
    }));
  };

  return (
    <div className="container2">
      <form className="clinic-form" onSubmit={handleSubmit}>
        <Header />
        <p className="title1" style={{ color: 'darkblue', fontWeight: 'bold' }}>
          Resource Allocation
        </p>

        <div className="form-group">
          <label className="label">Program Co-ordinator:</label>
          <Select<SelectOption, true, GroupBase<SelectOption>>
            isMulti
            name="programCoordinators"
            value={formData.programCoordinators.map((coordinator) => ({
              value: coordinator,
              label: coordinator,
            }))}
            options={createSelectOptions(programCoordinators.map((coordinator) => coordinator.name))}
            onChange={handleMultiSelectChange('programCoordinators')}
          />
        </div>

        {/* Repeat the multi-selects for other fields like campCoordinators, socialWorkers, etc. */}

        <div className="form-group">
          <label className="label">Outreach Clinic Co-ordinator:</label>
          <Select<SelectOption, true, GroupBase<SelectOption>>
            isMulti
            name="campCoordinators"
            value={formData.campCoordinators.map((coordinator) => ({
              value: coordinator,
              label: coordinator,
            }))}
            options={createSelectOptions(['Harish', 'Asha', 'Naveen'])}
            onChange={handleMultiSelectChange('campCoordinators')}
          />
        </div>

        <div className="form-group">
          <label className="label">Social Workers:</label>
          <Select<SelectOption, true, GroupBase<SelectOption>>
            isMulti
            name="socialWorkers"
            value={formData.socialWorkers.map((worker) => ({
              value: worker,
              label: worker,
            }))}
            options={createSelectOptions(['Mani, Ranjani', 'Gopi, Sakthi', 'Ravi, Divya'])}
            onChange={handleMultiSelectChange('socialWorkers')}
          />
        </div>

        <div className="form-group">
          <label className="label">Nurses:</label>
          <Select<SelectOption, true, GroupBase<SelectOption>>
            isMulti
            name="nurses"
            value={formData.nurses.map((nurse) => ({
              value: nurse,
              label: nurse,
            }))}
            options={createSelectOptions(['Sasi, Chitra', 'Aarti, Meera', 'Ravi, Kumari'])}
            onChange={handleMultiSelectChange('nurses')}
          />
        </div>

        <div className="form-group">
          <label className="label">Doctors:</label>
          <Select<SelectOption, true, GroupBase<SelectOption>>
            isMulti
            name="doctors"
            value={formData.doctors.map((doctor) => ({
              value: doctor,
              label: doctor,
            }))}
            options={createSelectOptions(['Dr Karthik, Dr Sunder', 'Dr Aravind, Dr Meena', 'Dr Suresh, Dr Priya'])}
            onChange={handleMultiSelectChange('doctors')}
          />
        </div>

        <button
          className="submit-button"
          type="submit"
          disabled={
            !formData.programCoordinators.length ||
            !formData.campCoordinators.length ||
            !formData.socialWorkers.length ||
            !formData.nurses.length ||
            !formData.doctors.length
          }
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ResourceAllocation;
