import React, { useState } from 'react';
import './Login.css';
import LockIcon from '@mui/icons-material/Lock';
import MailIcon from '@mui/icons-material/Mail';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login: React.FC = () => {
  const navigate = useNavigate(); // Hook for programmatic navigation
  const [userName, setEmail] = useState('');
  const [password, setPassword] = useState('');
  interface AuthResponse {
    id: string | null;
    userName: string;
    password: string;
    role: string | null;
    token: string;
    apiVersion: number;
  }
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    try {
      // Make the API call with typed response
      const response = await axios.post<AuthResponse>('http://13.234.4.214:8015/token/authenticate', { userName, password });
  
      if (response && response.data.token) {
        // Store the token in local storage
        localStorage.setItem('token', response.data.token);
  
        console.log('Login successful, calling authorizeUserRequest...');
  
        // Make the second API call using the token
        const authResponse = await axios.get(`http://13.234.4.214:8015/api/curable/authorizeUserRequest/${userName}`, {
        
          headers: {
            Authorization: `Bearer ${response.data.token}`,
          },
        });
  
        if (authResponse) {
          console.log('User authorized, navigating to dashboard...');
          navigate('/responsive-cancer-institute');
        } else {
          console.log('User authorization failed');
          alert('User is not authorized');
        }
      } else {
        console.log('Invalid email or password');
        alert('Invalid email or password');
      }
    } catch (error) {
      console.error('Error during login or authorization:', error);
      alert('An error occurred. Please try again.');
    }
  };
  
  
  // const handleLogout = () => {
  //   localStorage.removeItem('token');
  //   navigate('/login');
  // };
  return (
    <div className="login-container">
      <img
        src="/assets/CI_70 years Logo.jpg" // Your logo file path here
        alt="Logo"
        className="logo"
      />
      <h1>Cancer Institute (WIA)</h1>
      <h2>Login</h2>

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

        <div className="input-group">
          <label htmlFor="password" className="input-label">
            Password
          </label>
          <div className="input-wrapper">
            <LockIcon className="input-icon" />
            <input
              type="password"
              id="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <a href="#" className="forgot-password">
          <Link to="/reset-password">Forgot Password</Link>
        </a>

        <button type="submit" className="sign-in-button">
          Sign In
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

export default Login;
