import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './UserAccountInfo.css'; // Make sure to create this CSS file

const UserAccountInfo: React.FC = () => {
    const togglePasswordVisibility = () => {
        const passwordInput = document.getElementById('change-password') as HTMLInputElement;
        const eyeIcon = document.querySelector('.eye-icon') as HTMLElement;
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.classList.remove('fa-eye');
            eyeIcon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            eyeIcon.classList.remove('fa-eye-slash');
            eyeIcon.classList.add('fa-eye');
        }
    };

    return (
        <div>
            {/* Header Section with Icons */}
            <div className="header">
                <span className="icon fas fa-user-circle"></span>
                <span className="icon-edit fas fa-pencil-alt"></span>
            </div>

            {/* Form Container */}
            <div className="form-container form-spacing">
                <h3 className="text-center">Account Information</h3>
                <form>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">Username</label>
                        <input type="text" className="form-control" id="username" placeholder="Enter your username" required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="gender" className="form-label">Gender</label>
                        <select className="form-select" id="gender" required>
                            <option value="" disabled selected>Select your gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="alt-mobile" className="form-label">Alternate Mobile Number</label>
                        <input type="tel" className="form-control" id="alt-mobile" placeholder="Enter alternate mobile number" required />
                    </div>
                    <div className="mb-3 password-container">
                        <label htmlFor="change-password" className="form-label">Change Password</label>
                        <input type="password" className="form-control" id="change-password" placeholder="Enter new password" required />
                        <i className="eye-icon fas fa-eye" onClick={togglePasswordVisibility}></i>
                    </div>
                    <div className="text-center">
                        <button type="submit" className="btn btn-primary">Update</button>
                    </div>
                </form>
            </div>
            <footer className="footer-container">
        <div className="footer-content">
          <p className="footer-text">Powered By Curable</p>
          <img src="/assets/Curable logo - rectangle with black text.png" alt="Curable Logo" className="footer-logo" />
        </div>
      </footer>
        </div>
    );
};

export default UserAccountInfo;
