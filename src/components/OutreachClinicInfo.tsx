import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/OutreachClinicInfo.css';

// Define the type for the clinic data
interface Clinic {
    id: string;
    name: string;
    pincode: string;
    state: string;
    district: string;
    taluk: string;
    village: string;
}

const OutreachClinicInfo: React.FC = () => {
    const navigate = useNavigate();

    // State to manage the selected clinic
    const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
    
    // State to manage search input
    const [searchInput, setSearchInput] = useState<string>('');

    // Mock data for clinics (In real use, this would be an API call)
    const [clinics] = useState<Clinic[]>([
        { id: '1234567', name: 'Ennore 27th April', pincode: '600041', state: 'Tamil Nadu', district: 'Kanchipuram', taluk: 'Kanchipuram', village: 'Kanchipuram' },
        { id: '2345679', name: 'Example Clinic', pincode: '600042', state: 'Tamil Nadu', district: 'Chennai', taluk: 'Chennai', village: 'Chennai' },
    ]);

    // Handle clinic search by ID/Name
    const handleSearch = () => {
        if (!searchInput) {
            alert('Please enter a clinic ID or Name.');
            return;
        }

        // Simulate API call (you would replace this with a real API call)
        const clinic = clinics.find(c => c.id === searchInput || c.name.toLowerCase().includes(searchInput.toLowerCase()));

        if (clinic) {
            setSelectedClinic(clinic);  // Set clinic data if found
        } else {
            alert('Clinic not found.');
            setSelectedClinic(null);  // Clear selection if not found
        }
    };

    const handleBackClick = () => {
        navigate(-1); // Go back to the previous page
    };

    const handleEditClick = () => {
        console.log('Edit button clicked');
    };

    return (
        <div className="container2">
            <header className="header">
                <button className="back-button" onClick={handleBackClick}>Back</button>
                <h1>Outreach Clinic Information</h1>
            </header>
            <main className="content">
                <div className="search-container">
                    <label>Search:</label>
                    <div className="search-input-container">
                        <input
                            type="text"
                            placeholder="Enter Clinic ID or Name"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        <button className="search-button" onClick={handleSearch}>Search</button>
                    </div>
                </div>
                {selectedClinic && (
                    <div className="clinic-details">
                        <p><strong>Outreach Clinic ID:</strong> <span>{selectedClinic.id}</span></p>
                        <p><strong>Outreach Clinic Name:</strong> <span>{selectedClinic.name}</span></p>
                        <p><strong>Pincode:</strong> <span>{selectedClinic.pincode}</span></p>
                        <p><strong>State Name:</strong> <span>{selectedClinic.state}</span></p>
                        <p><strong>District Name:</strong> <span>{selectedClinic.district}</span></p>
                        <p><strong>Taluk Name:</strong> <span>{selectedClinic.taluk}</span></p>
                        <p><strong>Panchayat/Village Name:</strong> <span>{selectedClinic.village}</span></p>
    
                        <div className="edit-button-container">
                            <button className="edit-button" onClick={handleEditClick}>Edit</button>
                        </div>
    
                        {/* Create New Outreach Clinic button, conditionally rendered */}
                        <button className="create-button" onClick={() => navigate('/create-outreach-clinic')}>Create New Outreach Clinic</button>
                    </div>
                )}
            </main>
        </div>
    );
    
};

export default OutreachClinicInfo;
