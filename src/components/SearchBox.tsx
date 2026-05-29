import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import './SearchBox.css';

interface CandidateAPIResponse {
  id: number;
  registrationId?: string | number;
  registraionId?: string | number;
  name?: string;
  gender?: string;
  age?: number | string;
  spouseName?: string | null;
  mobileNo?: string | number;
  dob?: string | null;
  fatherName?: string | null;
  campId?: string | number;
  hospitalId?: string | number;
  lastVistCompletedDate?: string | null;
  reason?: string | null;
  enrolled?: string | number |null;
  revisitStatus?: number | string; // Assuming this field exists based on usage
}
interface SearchBoxProps {
  onSearchActiveChange?: (active: boolean) => void;
}


interface Candidate {
  id: number;
  registrationId: string;
  name: string;
  gender: string;
  age: number;
  spouseName: string | null;
  mobileNo: string;
  dob: string | null;
  fatherName: string | null;
  campId?: string | number;
  hospitalId?: string | number;
  lastVistCompletedDate?: string | null;
  reason?: string | null;
  revisitStatus: number; // Assuming this field exists based on usage
  enrolled?: string | number |null;

}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '';

  const d = new Date(dateStr);

  if (isNaN(d.getTime())) return String(dateStr);

  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const SearchBox: React.FC<SearchBoxProps> = ({ onSearchActiveChange }) => {
    const [searchInput, setSearchInput] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [openNoCandidateDialog, setOpenNoCandidateDialog] = useState(false);
  const [touched, setTouched] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
     onSearchActiveChange?.(value.trim().length > 0);
    setSearchInput(value);
    setTouched(true);
    setCandidates([]);
    setMessage('');
    setOpenNoCandidateDialog(false);

    if (value.length > 0 && value.length < 3) {
      setMessage('Please enter at least 3 characters');
      return;
    }

    if (value.length >= 3) {
      handleSearch(value);
    }
  };

  const handleSearch = async (input: string) => {
    if (!input || input.trim().length < 3) {
      setMessage('Please enter a minimum of 3 characters.');
      return;
    }

    setLoading(true);
    setMessage('');
    localStorage.removeItem('campId');

    const token = localStorage.getItem('token');
    const hospitalId = localStorage.getItem('hospitalId');
    const roleId = localStorage.getItem('roleId');
    const userId = localStorage.getItem('userId');

    if (!token) {
      setMessage('Authorization token not found. Please log in again.');
      setLoading(false);
      return;
    }

    if (!hospitalId) {
      setMessage('No hospital ID found. Please ensure hospitalId is set in local storage.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post<CandidateAPIResponse[]>(
        `${config.appURL}/curable/getCandidatesList`,
        {
          hospitalId: parseInt(hospitalId, 10),
          search: input,
          stage: 3,
          roleId: Number(roleId),
          userId: Number(userId),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.length > 0) {
        const candidatesData: Candidate[] = response.data.map((c) => ({
          id: c.id,
          registrationId: (c.registrationId ?? c.registraionId ?? '').toString(),
          name: (c.name ?? '').toString(),
          gender: (c.gender ?? '-').toString(),
          age: Number(c.age ?? 0),
          spouseName: c.spouseName ?? null,
          mobileNo: (c.mobileNo ?? '').toString(),
          dob: c.dob ?? null,
          fatherName: c.fatherName ?? null,
          campId: c.campId ?? undefined,
          hospitalId: c.hospitalId,
          lastVistCompletedDate: c.lastVistCompletedDate ?? null,
          reason: c.reason ?? null,
          revisitStatus : c.revisitStatus !== undefined ? Number(c.revisitStatus) : 0,
        }));

        setCandidates(candidatesData);
        setOpenNoCandidateDialog(false);
      } else {
        setCandidates([]);
        setOpenNoCandidateDialog(true);
      }
    } catch (error) {
      console.error('Error fetching candidate data:', error);
      setMessage('Failed to fetch candidate details. Please try again.');
      setCandidates([]);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  return (
    <div className="searchbox-container">
      <div className="searchbox-input-wrapper">
        <span className="searchbox-icon">🔍</span>

        <input
          className={`searchbox-input${message ? ' ' : ''}`}
          type="text"
          placeholder="Search by name, mobile, ID..."
          value={searchInput}
          onChange={handleChange}
        />
      </div>
<br/>
      {message && touched && <div className="searchbox-error">{message}</div>}

      {loading && <div className="searchbox-loading">Loading...</div>}

      {candidates.length > 0 && (
        <>
          <div className="searchbox-found-title">
            Found {candidates.length} patient{candidates.length > 1 ? 's' : ''}
          </div>

          {candidates.map((c) => (
            <div className="searchbox-result-box" key={c.id}>
              <div className="searchbox-patient">
                <div className="searchbox-patient-name">
                  {c.name}, {c.age}yrs/ {c.gender.charAt(0).toUpperCase() + c.gender.slice(1).toLowerCase()}
                </div>

                <div className="searchbox-patient-reg">
                  Registration Id: {c.registrationId}
                </div>
                <br/>

                <div className="searchbox-patient-spouse">
                   Mobile No: {c.mobileNo}
                </div>

                {c.spouseName && (
                  <div className="searchbox-patient-spouse">
                     Spouse Name: {c.spouseName}
                  </div>
                )}

                {c.fatherName && (
                  <div className="searchbox-patient-father">
                   Father Name: {c.fatherName}
                  </div>
                )}

                {c.lastVistCompletedDate && (
                  <div style={{marginLeft: '4px'}} className="searchbox-patient-lastvisit">
                     <i className="fas fa-calendar-alt"></i> &nbsp;Last visit: {formatDate(c.lastVistCompletedDate)}
                  </div>
                )}

                {c.reason && c.reason.toLowerCase().includes('pending') && (
                  <div className="searchbox-pending-box">
                    Pending: {c.reason}
                  </div>
                )}
                <br/>

               <button
  onClick={() => {
    const revisitDate = c.lastVistCompletedDate;
    const revisitId = c.revisitStatus?c.revisitStatus:0;
    const reason = c.reason?.toLowerCase() || '';
    const enrolled= c.enrolled;

    // Condition 1:
    // revisitDate not null and revisitId > 0
    console.log(reason.includes('screening'),revisitDate === null , revisitId === 0,
    reason.includes('screening') && revisitDate === null && revisitId === 0,
    "revisitId")

    if(reason.includes('screening') && revisitDate === null && revisitId === 0 ){
      
       navigate('/PatientSearchPage', {
        state: {
          searchName: c.name,
          searchflow: true,
          registrationId: c.registrationId,
        },
      });

    }
    else if(reason.includes('clinic') && revisitDate === null && revisitId === 0 ){

       navigate('/ClinicSearchPage', {
        state: {
          searchName: c.name,
          searchflow: true,
          registrationId: c.registrationId,
        },
      });

    }
else if (revisitDate !== null && revisitId === 1  ) {

      navigate('/PatientEdit', {
        state: {
          candidateId: c.id,
          registrationId: c.registrationId,
          searchflow: true,
          searchName: c.name,
        },
      });
    }

    else if (revisitDate !== null && revisitId === 2  ) {
        // if (true) {
 let path = '/PatientEdit';
 if (reason.includes('screening')) {
    path = '/PatientSearchPage';
  } else if (reason.includes('clinic')) {
    path = '/ClinicSearchPage';
  }


      navigate(path, {
        state: {
          candidateId: c.id,
          registrationId: c.registrationId,
          searchflow: true,
          searchName: c.name,
        },
      });
    }

        else if ((revisitDate === null && revisitId === 0) && (enrolled !== null || enrolled !== false)  ) {
        // if (true) {
 let path = '/PatientEdit';

      navigate(path, {
        state: {
          candidateId: c.id,
          registrationId: c.registrationId,
          searchflow: true,
          searchName: c.name,
        },
      });
    }

     else if ((revisitDate === null && revisitId === 0) && (enrolled !== null || enrolled === true)  ) {
        // if (true) {
 let path = '/PatientEdit';
 if (reason.includes('screening')) {
    path = '/PatientSearchPage';
  } else if (reason.includes('clinic')) {
    path = '/ClinicSearchPage';
  }


      navigate(path, {
        state: {
          candidateId: c.id,
          registrationId: c.registrationId,
          searchflow: true,
          searchName: c.name,
        },
      });
    }




    // Default fallback
    else {
      navigate('/PatientSearchPage', {
        state: {
          searchName: c.name,
          searchflow: true,
          registrationId: c.registrationId,
        },
      });
    }
  }}
  className="searchbox-next-btn"
>
  Next
</button>
              </div>
            </div>
          ))}
        </>
      )}

      {openNoCandidateDialog && (
        <div className="searchbox-no-result">
          <div className="searchbox-no-result-icon">👤</div>
          <div className="searchbox-no-result-title">No patient found</div>
          <div className="searchbox-no-result-desc">
            Try different search term or create new patient
          </div>

          <button
            className="searchbox-create-btn"
            onClick={() => navigate('/PatientRegistrationSearch')}
          >
             Create New Patient
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBox;