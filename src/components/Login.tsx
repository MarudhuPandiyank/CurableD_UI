// src/components/Login.tsx
import React, { useState } from 'react';
import '../index.css';
import './Login.css';
import LockIcon from '@mui/icons-material/Lock';
import MailIcon from '@mui/icons-material/Mail';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import config from '../config';

// redux
import { useDispatch } from 'react-redux';
import { setToken, setAuthorizedUser } from '../store/userSlice';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [userName, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // --- Auth POST response (from /authenticate)
  interface AuthResponse {
    id: string | null;
    userName: string;
    password: string;
    role: string | null;
    token: string;
    apiVersion: number;
    userId: string;
     roleId: string;
  }

  // --- Authorize GET response (from /authorizeUserRequest/<email>)
  // Use the full shape you showed earlier, so we can feed it straight into setAuthorizedUser
  interface AuthorizeApi {
    userId: number;
    userName: string;
    email: string;
    roleName: string;
    roleId: number;
    isRecordDeleted: boolean;
    gender: string;
    phoneNo: string;
    customMenuDTOs: Array<{
      menu: string;
      menuOrder: number;
      url: string;
      privileges: Array<'VIEW' | 'CREATE' | 'EDIT' | string>;
    }>;
    message: string | null;
    hospitalId: number;
    tenantName: string;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      // 1) login
      const auth = await axios.post<AuthResponse>(
        `${config.gatewayURL}/authenticate`,
        { userName, password }
      );

      const token = auth?.data?.token;
      if (!token) {
        setError('Invalid password! Retry or click forgot password');
        return;
      }

      // keep local storage (if your AuthGuard relies on it)
      localStorage.setItem('token', token);
      localStorage.setItem('userName', userName);
      // NOTE: storing plaintext password is unsafe; keep only if you absolutely need it.
      localStorage.setItem('password', password);

      // put token into Redux
      dispatch(setToken(token));

      // 2) authorize -> menus/privileges/tenant
      const { data: authorize } = await axios.get<AuthorizeApi>(
        `${config.appURL}/curable/authorizeUserRequest/${encodeURIComponent(userName)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // seed Redux (this also injects "Modify Patient Information")
      console.log(authorize,"authorize")
      dispatch(setAuthorizedUser(authorize));

      // mirror a few legacy values if you still read them elsewhere
      localStorage.setItem('hospitalId', String(authorize.hospitalId ?? ''));
      localStorage.setItem('tenantName', authorize.tenantName ?? '');
      localStorage.setItem('userId', String(authorize.userId ?? ''));
            localStorage.setItem('roleId', String(authorize.roleId ?? ''));


      // 3) go to home
      navigate('/responsive-cancer-institute');
    } catch (err) {
      console.error('Error during login or authorization:', err);
      setError('Invalid password! Retry or click forgot password');
    }
  };

  const handleForgotPassword = async () => {
    try {
      const resp = await axios.post(`${config.gatewayURL}/forgotPassword`, {
        userName,
        password: newPassword,
      });

      if (resp.data) {
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
    e.preventDefault();
    setIsForgotPassword(false);
    navigate('/');
  };

  return (
    <div className="login-container">
      <img src="/assets/screeninglogo.png" alt="Logo" className="logo" />
      <h1>Screening App</h1>
      <h2>{isForgotPassword ? 'Forgot Password' : 'Login'}</h2>

      <form className="login-form" onSubmit={handleSignIn}>
        <div className="input-group">
          <label htmlFor="email" className="input-label">Email ID</label>
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
            <label htmlFor="new-password" className="input-label">New Password</label>
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
            <label htmlFor="password" className="input-label">Password</label>
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
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </span>
            </div>
          </div>
        )}

        {isForgotPassword ? (
          <>
            <button type="button" onClick={handleForgotPassword} className="sign-in-button">
              Reset Password
            </button>
            <button type="button" onClick={handleCancel} className="sign-in-button cancel-button">
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
           {error && (
        <div style={{ marginTop: 20 }}>
          <p className="error-message">{error}</p>
        </div>
      )}

      </form>

   
      <footer className="footer-container-fixed">
        <div className="footer-content">
          <p className="footer-text">Powered By</p>
          <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="footer-logo" />
        </div>
      </footer>
    </div>
  );
};

export default Login;
