import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import axios from 'axios';
import Header from './Header';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { newDate } from 'react-datepicker/dist/date_utils';
import ResourcePlanning from './ResourcePlanning';
import Header1 from './Header1';
import config from '../config';
import { Calendar } from 'primereact/calendar';
import 'primereact/resources/themes/saga-blue/theme.css'; // Theme
import 'primereact/resources/primereact.min.css'; // Core CSS
import 'primeicons/primeicons.css'; // Iconsimport "react-datepicker/dist/react-datepicker.css"; 
const axiosInstance = axios.create({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

interface StateData {
    code: string;
    id: number;
    name: string;
}

interface DistrictData {
    code: string;
    id: number;
    name: string;
}

interface TalukData {
    code: string;
    id: number;
    name: string;
}

interface PanchayatData {
    code: string;
    id: number;
    name: string;
}

const OutreachClinicCreation: React.FC = () => {
    const navigate = useNavigate();

    const [clinicName, setClinicName] = useState('');
    const [pincode, setPincode] = useState('');
    const [state, setState] = useState('');
    const [district, setDistrict] = useState('');
    const [taluk, setTaluk] = useState('');
    const [panchayat, setPanchayat] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null);  // Use Date | null
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [states, setStates] = useState<StateData[]>([]);
    const [districts, setDistricts] = useState<DistrictData[]>([]);
    const [taluks, setTaluks] = useState<TalukData[]>([]);
    const [panchayats, setPanchayats] = useState<PanchayatData[]>([]);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingTaluks, setLoadingTaluks] = useState(false);
    const [loadingPanchayats, setLoadingPanchayats] = useState(false);
    const [stateCode, setStateCode] = useState('');
    const [districtCode, setDistrictCode] = useState('');
    const [talukCode, setTalukCode] = useState('');
    const [panchayatCode, setPanchayatCode] = useState('');
    const [panchayatId, setPanchayatId] = useState(0);
    const [clinicCode, setClinicCode] = useState('');
    const [clinicNameError, setClinicNameError] = useState('');
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [pendingNextState, setPendingNextState] = useState<any>(null);
    const token = localStorage.getItem('token');
    useEffect(() => {
        const fetchStates = async () => {

            if (!token) {
                console.error('No token found, redirecting to login.');
                navigate('/');
                return;
            }

            try {
                const response = await axios.get<StateData[]>(`${config.appURL}/curable/statemaster`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setStates(response.data); // Response typed as `StateData[]`
            } catch (error) {

                alert('Failed to fetch states. Please try again.');
            }
        };

        fetchStates();
    }, [navigate]);



    // Handle state change and fetch districts
    const handleStateChange = async (selectedState: string) => {
        setState(selectedState);
        setDistrict('');
        setTaluk('');
        setPanchayat('');

        const selectedStateObj = states.find(s => s.name === selectedState);
        if (selectedStateObj) {
            setStateCode(selectedStateObj.code);
            setLoadingDistricts(true);

            try {
                const response = await axios.get<StateData[]>(
                    `${config.appURL}/curable/districtmaster/statemaster/${selectedStateObj.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setDistricts(response.data);
            } catch (error) {
                console.error('Error fetching districts:', error);
                alert('Failed to fetch districts. Please try again.');
            }
            setLoadingDistricts(false);
        }
    };


    // Handle district change and fetch taluks
    const handleDistrictChange = async (selectedDistrict: string) => {
        setDistrict(selectedDistrict);
        setTaluk('');
        setPanchayat('');

        const selectedDistrictObj = districts.find(d => d.name === selectedDistrict);
        if (selectedDistrictObj) {
            setLoadingTaluks(true);
            setDistrictCode(selectedDistrictObj.code);

            try {
                const response = await axios.get<TalukData[]>(
                    `${config.appURL}/curable/taluqmaster/districtmaster/${selectedDistrictObj.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setTaluks(response.data);
            } catch (error) {
                console.error('Error fetching taluks:', error);
                alert('Failed to fetch taluks. Please try again.');
            }
            setLoadingTaluks(false);
        }
    };


    // Handle taluk change and fetch panchayats
    const handleTalukChange = async (selectedTaluk: string) => {
        setTaluk(selectedTaluk);
        setPanchayat('');

        const selectedTalukObj = taluks.find(t => t.name === selectedTaluk);
        if (selectedTalukObj) {
            setTalukCode(selectedTalukObj.code);
            setLoadingPanchayats(true);

            try {
                const response = await axios.get<PanchayatData[]>(
                    `${config.appURL}/curable/panchayatmaster/taluqmaster/${selectedTalukObj.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setPanchayats(response.data);
            } catch (error) {
                console.error('Error fetching panchayats:', error);
                alert('Failed to fetch panchayats. Please try again.');
            }
            setLoadingPanchayats(false);
        }
    };

    const handlePanchayatChange = (selectedPanchayat: string) => {
        setPanchayat(selectedPanchayat);
        const selectedPanchayats = panchayats.find(t => t.name === selectedPanchayat);
        if (selectedPanchayats) {
            setPanchayatCode(selectedPanchayats.code);
            setPanchayatId(selectedPanchayats.id);
            // Do NOT auto-prefill clinicCode; user may enter it manually if desired.
            setClinicCode(`${districtCode}${talukCode}${selectedPanchayats.code}`);
        }
        console.log(`Selected Panchayat: ${selectedPanchayat}`);
    };


    // Handle form submission
    const handleClinicNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setClinicName(value);
        if (value.trim().length > 0 && value.trim().length < 3) {
            setClinicNameError('Outreach Clinic Name must be at least 3 characters.');
        } else {
            setClinicNameError('');
        }
    };

    const handleNextClick = async (e: React.FormEvent) => {
        e.preventDefault();


        if (!clinicName || !pincode || !state || !district || !taluk || !panchayat || !startDate || !clinicCode) {
            alert('Please fill out all required fields, including Outreach Clinic ID.');
            return;
        }
        if (clinicName.trim().length < 3) {
            setClinicNameError('Outreach Clinic Name must be at least 3 characters.');
            alert('Outreach Clinic Name must be at least 3 characters.');
            return;
        }

        // Validate that the end date is not before the start date
        if (endDate != null && new Date(startDate) > new Date(endDate)) {
            alert('End date cannot be before start date.');
            return;
        }

        // ClinicCode is now mandatory and must be exactly 7 digits
        if (!/^\d{7}$/.test(clinicCode)) {
            alert('Outreach Clinic System ID must be exactly 7 digits.');
            return;
        }

        // Check for duplicate Clinic ID before proceeding
        const hospitalId = localStorage.getItem('hospitalId');
        if (!hospitalId) {
            alert('No hospital ID found. Please ensure hospitalId is set in local storage.');
            return;
        }
        try {
            const resp = await axios.get(
                `${config.appURL}/curable/isDuplicateClinic/hospitalId/${hospitalId}/outreachClinicId/${clinicCode}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log(resp.data, "duplicate check response");
            if (resp.data === true || resp.data === 'true') {
                // Show modal, store navigation state for later
                setPendingNextState({ startDate, endDate, panchayatId, pincode, clinicName, clinicCode });
                setShowDuplicateModal(true);
                return;
            }
        } catch (err) {
            alert('Error checking for duplicate Clinic ID.');
            return;
        }
        // Not duplicate, proceed
        navigate('/resource-planning', {
            state: { startDate, endDate, panchayatId, pincode, clinicName, clinicCode }
        });
    };

    const handleDuplicateModalYes = () => {
        setShowDuplicateModal(false);
        if (pendingNextState) {
            navigate('/resource-planning', { state: pendingNextState });
            setPendingNextState(null);
        }
    };

    const handleDuplicateModalNo = () => {
        setShowDuplicateModal(false);
        setPendingNextState(null);
    };
    return (
        <div className="container2">
            <form className="clinic-form" onSubmit={handleNextClick}>
                <Header1 />
                <h1 style={{ color: 'darkblue' }}>Outreach Clinic Creation</h1>
                <label>
                    <span style={{ color: "black" }}>  Outreach Clinic Name*:</span> <span style={{ color: 'darkred', fontWeight: 'bold', }}></span>
                    <input
                        type="text"
                        placeholder="Enter Outreach Clinic Name"
                        value={clinicName}
                        onChange={handleClinicNameChange}
                        required
                    />
                    {clinicNameError && <p className="errors_message">{clinicNameError}</p>}
                </label>
                <label>
                    <span style={{ color: "black" }}>Pincode*:</span><span style={{ color: 'darkred', fontWeight: 'bold', }}></span>
                    <input
    type="text"
    inputMode="numeric" 
    placeholder="Enter Pincode"
    value={pincode}
    onChange={(e) => {
      const value = e.target.value;
      if (/^\d{0,6}$/.test(value)) {
        setPincode(value);
      }
    }}
    required
  />
                </label>
                <label>
                    <span style={{ color: "black" }}>State Name*:</span><span style={{ color: 'darkred', fontWeight: 'bold', }}></span>
                    <select value={state} onChange={(e) => handleStateChange(e.target.value)} required>
                        <option value="">Select State</option>
                        {states.map((state) => (
                            <option key={state.id} value={state.name}>
                                {state.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    <span style={{ color: "black" }}>District Name*:</span><span style={{ color: 'darkred', fontWeight: 'bold', }}></span>
                    <select value={district} onChange={(e) => handleDistrictChange(e.target.value)} required disabled={!state || loadingDistricts}>
                        <option value="">Select District</option>
                        {districts.map((district) => (
                            <option key={district.id} value={district.name}>
                                {district.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    <span style={{ color: "black" }}>Taluk/Block Name*:</span><span style={{ color: 'darkred', fontWeight: 'bold', }}></span>
                    <select value={taluk} onChange={(e) => handleTalukChange(e.target.value)} required disabled={!district || loadingTaluks}>
                        <option value="">Select Taluk</option>
                        {taluks.map((taluk) => (
                            <option key={taluk.id} value={taluk.name}>
                                {taluk.name}
                            </option>
                        ))}
                    </select>
                </label>
                {/* <label>
                    <span style={{color : "darkblue"}}>Panchayat/Village Name:</span><span style={{ color: 'darkred', fontWeight: 'bold', }}>*</span>
                    <select value={panchayat} onChange={(e) => setPanchayat(e.target.value)} required disabled={!taluk || loadingPanchayats}>
                        <option value="">Select Panchayat/Village</option>
                        {panchayats.map((panchayat, index) => (
                            <option key={index} value={panchayat.name}>
                                {panchayat.name}
                            </option>
                        ))}
                    </select>
                </label> */}
                <label htmlFor="panchayat-select">
                    <span style={{ color: 'black' }}>Panchayat/Village Name*:</span>
                    <span style={{ color: 'darkred', fontWeight: 'bold' }}></span>
                    <select
                        id="panchayat-select"
                        value={panchayat}
                        onChange={(e) => handlePanchayatChange(e.target.value)}
                        required
                        disabled={!taluk || loadingPanchayats}
                    >
                        {loadingPanchayats ? (
                            <option value="">Loading Panchayats...</option>
                        ) : (
                            <>
                                <option value="">Select Panchayat/Village</option>
                                {panchayats.map((panchayat, index) => (
                                    <option key={index} value={panchayat.name}>
                                        {panchayat.name}
                                    </option>
                                ))}
                            </>
                        )}
                    </select>
                </label>



                <label>
                    <span style={{ color: 'black' }}>Outreach Clinic Start Date*:</span>
                    <span style={{ color: 'darkred', fontWeight: 'bold' }}></span>
                    <div className="input-with-icon">
                        <Calendar
                            value={startDate}
                            onChange={(e) => setStartDate(e.value as Date | null)}
                          //  showIcon
                            minDate={startDate || new Date()}
                            dateFormat="dd/mm/yy" 
                            placeholder="Select Start Date"
                        />
                        {/* <DatePicker
                    selected={startDate}
                    onChange={(date: Date | null) => setStartDate(date)}  // Update start date
                    onSelect={() => (document.activeElement as HTMLElement)?.blur()}  // Hide DatePicker popup on date select
                    onClickOutside={() => (document.activeElement as HTMLElement)?.blur()}  // Hide DatePicker popup when clicked outside
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select Start Date"
                    required
                    wrapperClassName='DatePicker'
                    minDate={new Date()}
                /> */}
                        <img src="./assets/Calendar.png" className="clinic-id-icon" alt="calendar icon" />
                    </div>
                </label>

                <label>
                    <span style={{ color: 'black' }}>Outreach Clinic End Date:</span>
                    <span style={{ color: 'darkred', fontWeight: 'bold' }}></span>
                    <div className="input-with-icon">
                        {/* <DatePicker
                    selected={endDate}
                    onChange={(date: Date | null) => setEndDate(date)}  // Update end date
                    onSelect={() => (document.activeElement as HTMLElement)?.blur()}  // Hide DatePicker popup on date select
                    onClickOutside={() => (document.activeElement as HTMLElement)?.blur()}  // Hide DatePicker popup when clicked outside
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select End Date"
                    required
                    wrapperClassName='DatePicker'
                    minDate={startDate || new Date()}
                /> */}
                        <Calendar
                            value={endDate}
                            onChange={(e) => setEndDate(e.value as Date | null)}
                           // showIcon
                            minDate={startDate || new Date()}
                            placeholder="Select End Date"
                            dateFormat="dd/mm/yy" 
                        />
                        <img src="./assets/Calendar.png" className="clinic-id-icon" alt="calendar icon" />
                    </div>
                </label>



                {/* <label>
                    <span style={{ color: 'darkblue' }}>Outreach Clinic ID:</span>
                    <span style={{ color: 'darkred', fontWeight: 'bold' }}>*</span>
                    <div className="input-with-icon">
                        <input type="text" placeholder="Show 7 digit System ID" />
                        <img src="./Curable Icons/PNG/Group 1269.png" className="clinic-id-icon" />
                    </div>
                </label> */}

                <label>
                    <span style={{ color: 'black' }}>Outreach Clinic ID:</span>
                    <span style={{ color: 'darkred', fontWeight: 'bold' }}></span>
                    <div className="input-with-icon">
                                             <input
    type="text"
    inputMode="numeric" 
    placeholder="Optional: enter 7 digit System ID"
    value={clinicCode}
    onChange={(e) => {
        const value = e.target.value;
        // allow up to 7 digits while typing; no auto-fill
        if (/^\d{0,7}$/.test(value)) {
            setClinicCode(value);
        }
    }}
    // clinicCode is optional; validation done on submit
/>

                        <img
                            src="./Curable Icons/PNG/Group 1269.png"
                            className="clinic-id-icon"
                            alt="Clinic ID Icon"
                        />
                    </div>
                </label>
                <center><button type="submit" className="submit-button1">
                    Next
                </button></center>
            </form>
        
            <div className="footer-container">
                <div className="footer-content">
                    <p className="footer-text">Powered By</p>
                    <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="footer-logo" />
                </div>
            </div>
            {/* Duplicate Clinic ID Modal */}
            {showDuplicateModal && (
                <div className="custom-modal">
                    <div className="custom-modal-outreach">
                        <h2 className="custom-modal-title-duplicate">Are you sure you want to use a duplicate Clinic ID?</h2>
                                                <div className="custom-modal-buttons">
                                                        <button 
                                                            className="custom-modal-button-duplicate custom-Yes-button"
                                                            type="button" 
                                                            onClick={handleDuplicateModalYes}
                                                        >
                                                            Yes
                                                        </button>
                                                        <button 
                                                             
                                                             className="custom-modal-button custom-save-button"
                                                            type="button" 
                                                           
                                                            onClick={handleDuplicateModalNo}
                                                        >
                                                            No
                                                        </button>
                                                </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OutreachClinicCreation;