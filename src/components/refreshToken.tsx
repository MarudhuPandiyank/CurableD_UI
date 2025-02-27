import axios from 'axios';
import config from '../config';

interface AuthResponse {
  token: string;
  // Add other properties if necessary
}

const refreshToken = async (): Promise<void> => {
  const userName = localStorage.getItem('userName');
  const password = localStorage.getItem('password');

  if (userName && password) {
    try {
      const response = await axios.post<AuthResponse>(`${config.gatewayURL}/authenticate`, {
        userName,
        password,
      });

      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log('Token refreshed successfully');
      } else {
        console.error('Unable to refresh token');
      }
    } catch (error) {
      console.error('Error during token refresh:', error);
    }
  } else {
    console.error('No user credentials found');
  }
};

export default refreshToken;
