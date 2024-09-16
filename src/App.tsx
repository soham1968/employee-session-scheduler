import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './components/Auth/Login';
import EmployeeLogin from './pages/EmployeeLogin';
import AdminLogin from './pages/AdminLogin';
import EmployeeRegister from './pages/EmployeeRegister'; // Ensure correct import
import Availability from './pages/Availability'; // Update paths as needed
import Admin from './pages/Admin';
import Confirmation from "./pages/Confirmation";
import ProtectedRoute from './components/ProtectedRoutes'; // Import ProtectedRoute

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/employee" element={<EmployeeLogin />} />
        <Route path="/login/employee/register" element={<EmployeeRegister />} /> {/* Ensure correct path */}
        <Route path="/login/admin" element={<AdminLogin />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/Confirmation" element={<Confirmation />} />

        {/* Protected Route for Availability page */}
        <Route
          path="/Availability"
          element={
            <ProtectedRoute>
              <Availability />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
