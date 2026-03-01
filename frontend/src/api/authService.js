// src/api/authService.js
import axiosInstance from './axiosInstance';

/**
 * @file API service for authentication and user profile related calls.
 * @description Contains methods for user login and fetching user profile.
 * Note: These routes (/auth/login, /auth/profile) need to be implemented
 * in your backend's authentication module.
 */

const authService = {
  /**
   * Authenticates a user with username and password.
   * @param {string} username - The user's username.
   * @param {string} password - The user's password.
   * @returns {Promise<Object>} The response data from the login endpoint (e.g., token, user info).
   */
  login: async (username, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { username, password });
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },

  /**
   * Fetches the profile of the currently authenticated user.
   * @returns {Promise<Object>} The user's profile data.
   */
  getUserProfile: async () => {
    try {
      const response = await axiosInstance.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  /**
   * Changes the password for the current user.
   * @param {Object} passwordData - Object containing userId, currentPassword, and newPassword
   * @param {string|number} passwordData.userId - The user's ID
   * @param {string} passwordData.currentPassword - The user's current password
   * @param {string} passwordData.newPassword - The new password
   * @returns {Promise<Object>} The response data from the change password endpoint
   */
  changePassword: async (passwordData) => {
    try {
      console.log('Changing password with data:', { 
        userId: passwordData.userId,
        username: passwordData.username,
        hasCurrentPassword: !!passwordData.currentPassword,
        hasNewPassword: !!passwordData.newPassword
      });
      
      // First, verify the current password by attempting a login
      // This ensures the current password is correct before changing
      if (passwordData.username) {
        try {
          // Verify current password by attempting login
          const verifyResponse = await axiosInstance.post('/auth/login', {
            username: passwordData.username,
            password: passwordData.currentPassword
          });
          
          if (!verifyResponse.data || !verifyResponse.data.token) {
            throw new Error('Current password verification failed');
          }
        } catch (verifyError) {
          if (verifyError.response?.status === 400) {
            const error = new Error('Current password is incorrect');
            error.response = { status: 401, data: { message: 'Current password is incorrect' } };
            throw error;
          }
          throw verifyError;
        }
      }
      
      // If current password is verified, update the password
      const response = await axiosInstance.put(`/users/users/${passwordData.userId}`, {
        password: passwordData.newPassword
      });
      
      console.log('Password change response:', response.data);
      return { success: true, message: 'Password changed successfully', data: response.data };
    } catch (error) {
      console.error('Error changing password:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      throw error;
    }
  },
};

export default authService;
