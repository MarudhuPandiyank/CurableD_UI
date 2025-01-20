import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ResourceAllocation.css';
import Header from './Header';
import { useLocation, useNavigate } from 'react-router-dom';
import Select, { MultiValue, GroupBase } from 'react-select';
import Header1 from './Header1';

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
  const { startDate, endDate, panchayatId, pincode, noCampcordinators, noDoctors, noNurses, noProgramCoordinators, noSocialWorkers } = location.state || {};

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
          `http://13.234.4.214:8015/api/curable/hospitalstaffdetails/${localStorage.getItem('hospitalId')}`
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
    if (!programCoordinators.length || !campCoordinators.length || !socialWorkers.length || !nurses.length || !doctors.length) {
      alert('Please fill out all required fields.');
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
      },
      campStaffs: [
        ...programCoordinators.map((coordinator) => ({
          role: 'Program Coordinator',
          name: coordinator.name,
          id: coordinator.id,
        })),
        ...campCoordinators.map((coordinator) => ({
          role: 'Camp Coordinator',
          name: coordinator.name,
          id: coordinator.id,
        })),
        ...socialWorkers.map((worker) => ({
          role: 'Social Worker',
          name: worker.name,
          id: worker.id,
        })),
        ...nurses.map((nurse) => ({
          role: 'Nurse',
          name: nurse.name,
          id: nurse.id,
        })),
        ...doctors.map((doctor) => ({
          role: 'Doctor',
          name: doctor.name,
          id: doctor.id,
        })),
      ],
    };

    try {
      const response = await axiosInstance.post<string>('http://13.234.4.214:8015/api/curable/newcamp', requestDataFinal);

      if (response.status === 200) {
        navigate('/success-message', { state: { clickId: response.data } });
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
        <p className="title1" style={{ color: 'darkblue', fontWeight: 'bold' }}>Resource Allocation</p>

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
