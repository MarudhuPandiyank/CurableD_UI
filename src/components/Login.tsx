import React, { useState } from 'react';
import './Login.css';
import LockIcon from '@mui/icons-material/Lock';
import MailIcon from '@mui/icons-material/Mail';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  interface AuthResponse {
    id: string | null;
    userName: string;
    password: string;
    role: string | null;
    token: string;
    apiVersion: number;
  }

  interface AuthResponseData {
    hospitalId: string;
    tenantName:string;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission

    try {
      const response = await axios.post<AuthResponse>(
        'http://13.234.4.214:8015/token/authenticate',
        { userName, password }
      );

      if (response && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userName', userName);

        const authResponse = await axios.get<AuthResponseData>(
          `http://13.234.4.214:8015/api/curable/authorizeUserRequest/${userName}`,
          {
            headers: { Authorization: `Bearer ${response.data.token}` },
          }
        );

        if (authResponse && authResponse.data) {
          const hospitalId = authResponse.data.hospitalId;
          const tenantName = authResponse.data.tenantName;
          localStorage.setItem('hospitalId', hospitalId);
          localStorage.setItem('tenantName', tenantName);
          navigate('/responsive-cancer-institute');
        } else {
          alert('User is not authorized');
        }
      } else {
        alert('Invalid email or password');
      }
    } catch (error) {
      console.error('Error during login or authorization:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleForgotPassword = async () => {
    try {
      const response = await axios.post(
        'http://13.234.4.214:8015/token/forgotPassword',
        {
          userName,
          password: newPassword,
        }
      );

      if (response.data) {
        alert('Password reset successful. Please log in with your new password.');
        setIsForgotPassword(false);
      } else {
        alert('Password reset failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during password reset:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent default form behavior
    setIsForgotPassword(false);
    navigate('/');
  };

  return (
    <div className="login-container">
      <img src="/assets/CI_70 years Logo.jpg" alt="Logo" className="logo" />
      <h1>Cancer Institute (WIA)</h1>
      <h2>{isForgotPassword ? 'Forgot Password' : 'Login'}</h2>

      <form className="login-form" onSubmit={handleSignIn}>
        <div className="input-group">
          <label htmlFor="email" className="input-label">
            Email ID
          </label>
          <div className="input-wrapper">
            <MailIcon className="input-icon" />
            <input
              type="text"
              id="email"
              className="input-field"
              value={userName}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {isForgotPassword ? (
          <div className="input-group">
            <label htmlFor="new-password" className="input-label">
              New Password
            </label>
            <div className="input-wrapper">
              <LockIcon className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="new-password"
                className="input-field"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <span
                className="password-toggle-icon"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </span>
            </div>
          </div>
        ) : (
          <div className="input-group">
            <label htmlFor="password" className="input-label">
              Password
            </label>
            <div className="input-wrapper">
              <LockIcon className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="password-toggle-icon"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </span>
            </div>
          </div>
        )}

        {isForgotPassword ? (
          <>
            <button type="button" onClick={handleForgotPassword} className="sign-in-button">
              Reset Password
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="sign-in-button cancel-button"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <a href="#" className="forgot-password" onClick={() => setIsForgotPassword(true)}>
              Forgot Password
            </a>
            <button type="submit" className="sign-in-button">
              Sign In
            </button>
          </>
        )}
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

export default Login;
