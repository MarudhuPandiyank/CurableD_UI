import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ProfileScreen.css"; // Assuming the same CSS file
import './HomePage.css';

interface ProfileData {
  gender: string;
  id: number;
  name: string;
  phoneNo: string;
  password: string;
}

const ProfilePage: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [phoneNo, setPhoneNo] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("No token found. Please log in again.");
        return;
      }

      try {
        const response = await axios.get<ProfileData>(
          "http://13.234.4.214:8015/api/curable/hospitalemployee/1",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          const { gender, name, phoneNo, password } = response.data;
          setName(name);
          setGender(gender);
          setPhoneNo(phoneNo);
          setPassword(password);
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
    const passwordField = document.querySelector<HTMLInputElement>(".password-wrapper input");
    const eyeIcon = document.querySelector<HTMLElement>(".password-wrapper i");

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
      id: 1,
      name,
      phoneNo,
      yearsExp: 0,
      password,
    };

    try {
      const response = await axios.post(
        "http://13.234.4.214:8015/api/curable/hospitalemployee",
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
    <div className="page-container">
      <div className="profile-header">
        <div className="account-icon1-wrapper">
          <div className="account-icon1">
            <i className="fa fa-user-circle"></i>
          </div>
          <div className="edit-icon">
            <i className="fa fa-pencil"></i>
          </div>
        </div>
      </div>
      <form className="profile-form">
        <label>Username:</label>
        <input type="text" value={name } onChange={(e) => setName(e.target.value)} />

        <label>Gender:</label>
        <input type="text" value={gender} onChange={(e) => setGender(e.target.value)} />

        <label>Alternate Mobile Number:</label>
        <input type="text" value={phoneNo } onChange={(e) => setPhoneNo(e.target.value)} />

        <label>Change Password:</label>
        <div className="password-wrapper">
          <input type="password" value={password } onChange={(e) => setPassword(e.target.value)} />
          <i className="fa fa-eye" onClick={handlePasswordVisibility}></i>
        </div>

        <button type="button" className="update-button" onClick={handleUpdate}>
          Update
        </button>
      </form>
      <div className="powered-container">
          <p className="powered-by">Powered By Curable</p>
          <img
            src="/assets/Curable logo - rectangle with black text.png"
            alt="Curable Logo"
            className="curable-logo"
          />
        </div>
    </div>
  );
};

export default ProfilePage;
