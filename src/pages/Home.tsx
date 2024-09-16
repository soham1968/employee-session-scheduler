import React from 'react';
import AppNavbar from '../components/Navbar';
import './Home.css'; // Import custom CSS for styling

const Home: React.FC = () => {
  return (
    <div>
      <AppNavbar />
      <div className="cover-image-container">
        <div className="cover-image">
          <div className="overlay">
            <div className="text-container">
              <h1>Welcome to the Scheduling App</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
