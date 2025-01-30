import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ProfileScreen.css";
import './HomePage.css'; // Assuming you are keeping it for other styles
import config from '../config';  // Import the config file
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const userId = localStorage.getItem("userId");
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
        <input type="text" value={gender} onChange={(e) => setGender(e.target.value)} />

        <label>Alternate Mobile Number:</label>
        <input type="text" value={phoneNo} onChange={(e) => setPhoneNo(e.target.value)} />

        <label>Change Password:</label>
        <div className="password-field-wrapper">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <i className="fa fa-eye" onClick={handlePasswordVisibility}></i>
        </div>
        <center className="buttons">
        <button type="button" className="Finish-button" onClick={handleUpdate}>
          Update
        </button>
        </center>
      </form>
      <div className="profile-powered-container">
        <p className="profile-powered-by">Powered By </p>
        <img
          src="/assets/Curable logo - rectangle with black text.png"
          alt="Curable Logo"
          className="profile-curable-logo"
        />
      </div>
    </div>
  );
};

export default ProfilePage;
