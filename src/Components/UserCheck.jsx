import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import background from './imagee.jpg'; // Assuming the image filename is 'image.jpg'
import Navigation from './Navigation';
import Footer from './Footer';
import LiveService from './LiveService';

const UserCheck = () => {
  const [isMember, setIsMember] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isMemberFromLocalStorage = localStorage.getItem('isMember') === 'true';
    setIsMember(isMemberFromLocalStorage);

    if (isMember) {
      navigate('/LiveService');
    } else {
      navigate(-1);
    }
  }, [isMember, navigate]);

  const handleCheck = () => {
    setIsMember(true);
    localStorage.setItem('isMember', 'true');
  };

  return (
    <div style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
      <Navigation />
      {isMember ? (
        <>
          <h1>Welcome to the main app!</h1>
          <LiveService />
        </>
      ) : (
        <div className="height center">
          <h1>Are you a member of the unit?</h1>
          <button className='linkText btn btn-success' onClick={handleCheck}>Yes</button>
          <br />
          <button className='linkText btn btn-warning' onClick={() => navigate('/')}>No</button>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default UserCheck;
