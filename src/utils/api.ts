import axios from 'axios';

// Set the base URL for the API
// console.log("api.ts page");
// console.log('API base URL:', process.env.REACT_APP_API_URL || 'http://localhost:5000/api');
const api = axios.create({

  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api', // Adjusted port to match your server setup
});

// Define the API endpoints

// Fetch availability (if needed, currently not used in the provided code)
export const fetchAvailability = async () => {
  try {
    const response = await api.get('/availability');
    return response.data;
  } catch (error) {
    console.error('Error fetching availability:', error);
    throw error;
  }
};

// Save availability with employee email
export const saveAvailability = async (availability: AvailabilityState) => {
  const email = localStorage.getItem("employeeEmail"); // Retrieve the email from local storage
  console.log('Saving availability for email:', email);
  if (!email) {
    throw new Error("Employee email not found.");
  }

  try {
    const response = await api.post('/availability', { email, availability });
    return response.data;
  } catch (error) {
    console.error('Error saving availability:', error);
    throw error;
  }
};

// Login endpoint
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/login', { email, password });
    // Assuming successful login returns some token or user info
    if (response.data && response.data.email) {
      localStorage.setItem("employeeEmail", response.data.email); // Store email on successful login
    }
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Define types for API responses
interface DailyAvailability {
  available: boolean;
  start: string;
  end: string;
}

interface AvailabilityState {
  [day: string]: DailyAvailability;
}
