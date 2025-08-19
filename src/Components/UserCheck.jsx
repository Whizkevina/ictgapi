import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import background from './imagee.jpg';
import Navigation from './Navigation';
import Footer from './Footer';
import Card from './Card';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

const UserCheck = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState('initial'); // 'initial' or 'tagInput'
  const [tagId, setTagId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already confirmed as a member and has a tag ID, redirect to live service
    const memberStatus = localStorage.getItem('isMember');
    const storedTagId = localStorage.getItem('tagId');

    if (memberStatus === 'true' && storedTagId) {
      navigate('/LiveService', { replace: true });
    } else {
      // Clear potentially inconsistent storage from previous versions
      localStorage.removeItem('isMember');
      localStorage.removeItem('tagId');
      setIsLoading(false);
    }
  }, [navigate]);

  const handleYesClick = () => {
    setStep('tagInput');
  };

  const handleNoClick = () => {
    navigate('/');
  };

  const handleVerification = () => {
    // Regex to validate FTICTxxxx format (case-insensitive)
    const tagIdPattern = /^FTICT\d{4}$/i;

    if (tagIdPattern.test(tagId)) {
      // On successful validation, save status and redirect
      localStorage.setItem('isMember', 'true');
      localStorage.setItem('tagId', tagId);
      navigate('/LiveService');
    } else {
      // On failure, notify user and redirect
      alert('Invalid Tag ID. You must be a member of the ICT Group to proceed.');
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div 
        className="page-container relative bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${background})` }}
      >
        <div className="background-overlay"></div>
        <Navigation />
        <div className="content-center">
          <Card variant="default" className="p-8 max-w-md mx-auto text-center">
            <LoadingSpinner text="Checking membership status..." />
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div 
      className="page-container relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="background-overlay"></div>
      <Navigation />
      <div className="content-center">
        <div className="max-w-2xl mx-auto px-6">
          <Card variant="default" className="p-8 text-center animate-fade-in">
            {step === 'initial' ? (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-800 mb-4">
                    Are you a member of the ICTG Unit?
                  </h1>
                  <p className="text-lg text-gray-600">
                    Please confirm your membership to continue.
                  </p>
                </div>
                <div className="space-y-4">
                  <Button 
                    variant="success"
                    size="lg"
                    className="w-full max-w-xs"
                    onClick={handleYesClick}
                  >
                    Yes, I am a member
                  </Button>
                  <Button 
                    variant="secondary"
                    size="lg"
                    className="w-full max-w-xs"
                    onClick={handleNoClick}
                  >
                    No, take me back
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-800 mb-4">
                    Verify Your Membership
                  </h1>
                  <p className="text-lg text-gray-600">
                    Please enter your ICTG Tag ID to proceed.
                  </p>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={tagId}
                    onChange={(e) => setTagId(e.target.value)}
                    placeholder="e.g., FTICT1234"
                    className="w-full max-w-xs px-4 py-3 text-center border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Button 
                    variant="primary"
                    size="lg"
                    className="w-full max-w-xs"
                    onClick={handleVerification}
                  >
                    Verify & Enter
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserCheck;
