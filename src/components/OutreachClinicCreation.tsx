import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OutreachClinicCreation.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUserCircle, faHome } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

type StateData = { name: string, id: number };
type DistrictData = { name: string, id: number };
type TalukData = { name: string, id: number };
type PanchayatData = { name: string };

const axiosInstance = axios.create({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

const OutreachClinicCreation: React.FC = () => {
    const navigate = useNavigate();

    const [clinicName, setClinicName] = useState('');
    const [pincode, setPincode] = useState('');
    const [state, setState] = useState('');
    const [district, setDistrict] = useState('');
    const [taluk, setTaluk] = useState('');
    const [panchayat, setPanchayat] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [states, setStates] = useState<StateData[]>([]);
    const [districts, setDistricts] = useState<DistrictData[]>([]);
    const [taluks, setTaluks] = useState<TalukData[]>([]);
    const [panchayats, setPanchayats] = useState<PanchayatData[]>([]);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingTaluks, setLoadingTaluks] = useState(false);
    const [loadingPanchayats, setLoadingPanchayats] = useState(false);

    // Fetch states from API
    useEffect(() => {
        const fetchStates = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found, redirecting to login.');
                navigate('/');
                return;
            }

            try {
                const response = await axiosInstance.get<StateData[]>('http://13.234.4.214:8015/api/curable/statemaster');
                setStates(response.data);
            } catch (error) {
                console.error('Error fetching states:', error);
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
            setLoadingDistricts(true);
            try {
                const response = await axiosInstance.get<DistrictData[]>(`http://13.234.4.214:8015/api/curable/districtmaster/statemaster/${selectedStateObj.id}`);
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
            try {
                const response = await axiosInstance.get<TalukData[]>(`http://13.234.4.214:8015/api/curable/taluqmaster/districtmaster/${selectedDistrictObj.id}`);
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
            setLoadingPanchayats(true);
            try {
                const response = await axiosInstance.get<PanchayatData[]>(`http://13.234.4.214:8015/api/curable/panchayatmaster/taluqmaster/${selectedTalukObj.id}`);
                setPanchayats(response.data);
            } catch (error) {
                console.error('Error fetching panchayats:', error);
                alert('Failed to fetch panchayats. Please try again.');
            }
            setLoadingPanchayats(false);
        }
    };

    // Handle form submission
    const handleNextClick = (e: React.FormEvent) => {
        e.preventDefault();

        if (!clinicName || !pincode || !state || !district || !taluk || !panchayat || !startDate || !endDate) {
            alert('Please fill out all required fields.');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            alert('End date cannot be before start date.');
            return;
        }

        navigate('/resource-planning');
    };

    return (
        <div className="container1">
            <header className="header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Back
                </button>
                <h1 className="title">Outreach Clinic</h1>
                <div className="header-right">
                    <FontAwesomeIcon icon={faHome} className="home-icon" onClick={() => navigate('/home')} />
                    <FontAwesomeIcon icon={faUserCircle} className="user-icon" />
                </div>
            </header>
            <form className="clinic-form" onSubmit={handleNextClick}>
                <label>
                    Outreach Clinic Name:*
                    <input
                        type="text"
                        placeholder="Enter Outreach Clinic Name"
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Pincode:*
                    <input
                        type="text"
                        placeholder="Enter Pincode"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        required
                    />
                </label>
                <label>
                    State Name:*
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
                    District Name:*
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
                    Taluk Name:*
                    <select value={taluk} onChange={(e) => handleTalukChange(e.target.value)} required disabled={!district || loadingTaluks}>
                        <option value="">Select Taluk</option>
                        {taluks.map((taluk) => (
                            <option key={taluk.id} value={taluk.name}>
                                {taluk.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Panchayat/Village Name:*
                    <select value={panchayat} onChange={(e) => setPanchayat(e.target.value)} required disabled={!taluk || loadingPanchayats}>
                        <option value="">Select Panchayat/Village</option>
                        {panchayats.map((panchayat, index) => (
                            <option key={index} value={panchayat.name}>
                                {panchayat.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Outreach Clinic Start Date:
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        
                    />
                </label>
                <label>
                    Outreach Clinic End Date:
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </label>
                <button type="submit" className="submit-button">
                    Next
                </button>
            </form>
        </div>
    );
};

export default OutreachClinicCreation;
