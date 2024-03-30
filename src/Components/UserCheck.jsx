import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import background from './imagee.jpg';
import Navigation from './Navigation';
import Footer from './Footer';
import LiveService from './LiveService';

const UserCheck = () => {
  const [isMember, setIsMember] = useState(false);
  const navigate = useNavigate();

  // Function to check membership status
  const checkMembership = () => {
    const isMember = localStorage.getItem('isMember');
    return isMember === 'false';
  };

  useEffect(() => {
    // Call the checkMembership function to determine if the user is a member
    const isMemberFromLocalStorage = checkMembership();
    setIsMember(isMemberFromLocalStorage);
  }, []);

  const handleCheck = () => {
    // Update membership status to true
    setIsMember(true);
    // Store membership status in local storage
    localStorage.setItem('isMember', 'true');
  };

  useEffect(() => {
    // Redirect based on membership status
    if (isMember) {
      navigate('/LiveService'); // Redirect to LiveStream component
    } else {
      navigate(-1); // Redirect to the home page
    }
  }, [isMember, navigate]);

  return (
    <div style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
        <Navigation />
      {!isMember ? (
        <div className="height center">
          <h1>Are you a member of the unit?</h1>
          <button className='linkText btn btn-success' onClick={handleCheck}>Yes</button>
          <br />
          <button className='linkText btn btn-warning' onClick={() => navigate('/')}>No</button>
        </div>
      ) : (
        <div>
          <h1>Welcome to the main app!</h1>
          {/* Render the main app components here */}
          <LiveService />
        </div>
      )}
      <Footer />
    </div>
  );
};

export default UserCheck;
