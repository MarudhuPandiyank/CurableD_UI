import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ProfileScreen.css";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useDispatch, useSelector } from 'react-redux';
import './HomePage.css'; // Assuming you are keeping it for other styles
import config from '../config';  // Import the config file
import Header1 from "./Header1";
interface ProfileData {
  gender: string;
  id: number;
  name: string;
  phoneNo: string;
  password: string;
  keycloakUserId:string;
}
const ProfilePage: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [phoneNo, setPhoneNo] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [keycloakUserId, setkeycloakUserId] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const userId = localStorage.getItem("userId");
  const dispatch = useDispatch();
  const roleName = useSelector((state: any) => state.user?.roleName || '');
  const reduxState = useSelector((state: any) => state);
  console.log('Redux full state:', reduxState);
  console.log('Redux roleName state:', roleName);
  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("No token found. Please log in again.");
        return;
      }

      try {
        const response = await axios.get<ProfileData>(
          `${config.appURL}/curable/hospitalemployee/${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          const { gender, name, phoneNo, password,keycloakUserId } = response.data;
          setName(name);
          setGender(gender);
          setPhoneNo(phoneNo);
          setPassword(password);
          setkeycloakUserId(keycloakUserId);
        }

        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError("Failed to fetch profile data. Please try again.");
      }
    };

    fetchProfileData();
  }, []);

  const handlePasswordVisibility = () => {
    const passwordField = document.querySelector<HTMLInputElement>(".password-field-wrapper input");
    const eyeIcon = document.querySelector<HTMLElement>(".password-field-wrapper i");

    if (passwordField && eyeIcon) {
      if (passwordField.type === "password") {
        passwordField.type = "text";
      
        eyeIcon.classList.remove("fa-eye");
        eyeIcon.classList.add("fa-eye-slash");
       
      } else {
        passwordField.type = "password";
        eyeIcon.classList.remove("fa-eye-slash");
        eyeIcon.classList.add("fa-eye");
       
      }
    }
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("No token found. Please log in again.");
      return;
    }

    const payload = {
      gender: gender.toUpperCase(),
      id: Number(userId),
      name,
      phoneNo,
      yearsExp: 0,
      password,
      keycloakUserId
    };

    try {
      const response = await axios.post(
        `${config.appURL}/curable/hospitalemployee`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        alert("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile. Please try again.");
    }
  };

  return (
    <>
    <div style={{marginTop:'0px',padding:'10px'}}>
    <Header1 />
    </div>
    
      <div className="profile-page-container">
      
      <div className="profile-header-container">
        <div className="profile-account-icon-wrapper">
          <div className="profile-account-icon">
            <i className="fa fa-user-circle"></i>
          </div>
          <div className="profile-edit-icon">
            
          </div>
        </div>
      </div>
      <form className="profile-form-container">
        <label>Username:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />

        <label>Gender:</label>
<div className="gender-button-group">
  {["MALE", "FEMALE", "OTHER"].map((option) => (
    <button
      key={option}
      type="button"
      className={`gender-button ${gender === option ? "active" : ""}`}
      onClick={() => setGender(option)}
    >
      {option.charAt(0) + option.slice(1).toLowerCase()}
    </button>
  ))}
</div>

        <label>Alternate Mobile Number:</label>
  <input type="text" value={phoneNo} onChange={(e) => setPhoneNo(e.target.value)} />

  <label>Role:</label>
  <input type="text" value={roleName} disabled style={{ background: '#f0f0f0' }} />

        <label>Change Password:</label>
        <div className="password-field-wrapper">
        <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {showPassword ? (
              <VisibilityOff className="eye-icon" onClick={() => setShowPassword(false)} />
            ) : (
              <Visibility className="eye-icon" onClick={() => setShowPassword(true)} />
            )}
        </div>
        <center className="buttons">
        <button  style={{marginBottom:"40px",borderRadius:'25px'}} type="button" className="Finish-Homebutton" onClick={handleUpdate}>
          Update
        </button>
        </center>
      </form>
     <footer className="footer-container-fixed">
        <div className="footer-content">
          <p className="footer-text">Powered By</p>
          <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="footer-logo" />
        </div>
      </footer>
    </div>
    </>
  
  );
};

export default ProfilePage;
