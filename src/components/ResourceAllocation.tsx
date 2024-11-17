import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ResourceAllocation.css';
import Header from './Header';
import { useLocation, useNavigate } from 'react-router-dom';
import Select, { MultiValue, GroupBase } from 'react-select';
import ResourcePlanning from './ResourcePlanning';

interface Admin {
  name: string;
  id: number;
}

interface HospitalStaffResponse {
  admin: Admin[];
}

// Define Option type
interface SelectOption {
  value: string | number;
  label: string;
}

const ResourceAllocation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { startDate, endDate, panchayatId, pincode, noCampcordinators, noDoctors, noNurses, noProgramCoordinators, noSocialWorkers } = location.state || {};

  const [formData, setFormData] = useState({
    programCoordinators: [] as Admin[],  // Storing full Admin objects
    campCoordinators: [] as Admin[],  // Storing full Admin objects
    socialWorkers: [] as Admin[],  // Storing full Admin objects
    nurses: [] as Admin[],  // Storing full Admin objects
    doctors: [] as Admin[],  // Storing full Admin objects
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
        const response = await axiosInstance.get<HospitalStaffResponse>(`http://13.234.4.214:8015/api/curable/hospitalstaffdetails/${localStorage.getItem('hospitalId')}`);

        setProgramCoordinators(response.data.admin.map((admin) => ({
          id: admin.id,
          name: admin.name,
        })));
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
      [name]: selectedOptions.map((option) => ({
        id: option.value,  // Assuming 'value' is the 'id' of the coordinator
        name: option.label,  // Assuming 'label' is the name of the coordinator
      })),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { programCoordinators, campCoordinators, socialWorkers, nurses, doctors } = formData;
    if (!programCoordinators.length || !campCoordinators.length || !socialWorkers.length || !nurses.length || !doctors.length) {
      alert('Please fill out all required fields.');
      return;
    }

    // Create an array of selected program coordinators for the campStaffs
    const selectedProgramCoordinators = programCoordinators.map((coordinator) => ({
      role: 'Program Coordinator',
      name: coordinator.name,
      id: coordinator.id,
    }));

    // Prepare the request payload
    const requestDataFinal = {
      campDTO: {
        startDate: startDate,
        endDate: endDate,
        panchayatMasterId: panchayatId,
        pincode: pincode,
        noCampcordinators: noCampcordinators,
        noDoctors: noDoctors,
        noNurses: noNurses,
        noProgramcordinators: noProgramCoordinators,
        noSocialworkers: noSocialWorkers,
      },
      campStaffs: [
        ...selectedProgramCoordinators,  // Add selected program coordinators to the campStaffs
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
        navigate('/success-message', {
          state: { clickId: response.data },  // Directly pass the response data
        });
      } else {
        alert('Failed to submit data.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong, please try again later.');
    }
  };

  const createSelectOptions = (data: Admin[]): SelectOption[] => {
    return data.map((item) => ({
      value: item.id,  // Use 'id' as the value
      label: item.name,  // Use 'name' as the label
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
              value: coordinator.id,
              label: coordinator.name,
            }))}
            options={createSelectOptions(programCoordinators)}
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
            options={createSelectOptions([{ id: 1, name: 'Harish' }, { id: 2, name: 'Asha' }, { id: 3, name: 'Naveen' }])}
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
            options={createSelectOptions([{ id: 1, name: 'Mani, Ranjani' }, { id: 2, name: 'Gopi, Sakthi' }, { id: 3, name: 'Ravi, Divya' }])}
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
            options={createSelectOptions([{ id: 1, name: 'Sasi, Chitra' }, { id: 2, name: 'Aarti, Meera' }, { id: 3, name: 'Ravi, Kumari' }])}
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
            options={createSelectOptions([{ id: 1, name: 'Dr Karthik, Dr Sunder' }, { id: 2, name: 'Dr Aravind, Dr Meena' }, { id: 3, name: 'Dr Suresh, Dr Priya' }])}
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
