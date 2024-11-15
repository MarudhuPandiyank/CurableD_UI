import React, { useState } from 'react';
import './ResetPassword.css';
import LockIcon from '@mui/icons-material/Lock';
import MailIcon from '@mui/icons-material/Mail';

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState(''); // State for new password
  const [successMessage, setSuccessMessage] = useState(false); // State for success message

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    // Perform reset password logic here (e.g., API call)
    // On success, show the message
    setSuccessMessage(true);
  };

  return (
    <div className="reset-password-container">
      <img
        src="/assets/CI_70 years Logo.jpg" // Your logo file path here
        alt="Logo"
        className="logo"
      />
      <h1>Cancer Institute (WIA)</h1>
      <h2>Reset Password</h2>

      <form className="reset-password-form" onSubmit={handleReset}>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="new-password" className="input-label">
            New Password
          </label>
          <div className="input-wrapper">
            <LockIcon className="input-icon" />
            <input
              type="password"
              id="new-password"
              className="input-field"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)} // Update new password state
            />
          </div>
        </div>

        {/* Success message for re-login */}
        {successMessage && (
          <p className="reset-success-message">
            Kindly re-login upon successful reset of password!
          </p>
        )}

        <button type="submit" className="reset-password-button">
          Reset Password
        </button>
      </form>

      <div className="powered-container">
        <p className="powered-by">Powered By Curable</p>
        <img
          src="/assets/Curable logo - rectangle with black text.png" // Your curable logo file path here
          alt="Curable Logo"
          className="curable-logo"
        />
      </div>
    </div>
  );
};

export default ResetPassword;
