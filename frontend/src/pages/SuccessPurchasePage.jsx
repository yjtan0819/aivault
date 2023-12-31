import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../css/LandingPage.module.css';
import { useState, useEffect } from 'react';
import checkAuthenticated from '../utilities/authUtils';
import { useNavigate } from 'react-router-dom';

const SuccessPurchasePage = () => {
  const token = localStorage.getItem('jwtToken');
  const [authenticated, setAuthenticated] = useState(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    if (token) {
      // Check in the backend if the token is valid
      setIsLoading(true);
      checkAuthenticationStatus(token);
      setUserPremum(token);

    } else {
      setAuthenticated(false);
      setIsLoading(false);
    }
  }, [token]);

  const checkAuthenticationStatus = async (token) => {
    const isAuthenticated = await checkAuthenticated(token);
    setAuthenticated(isAuthenticated);
    setIsLoading(false);
  }

  const setUserPremum = async (token) => {
    const response = await fetch('https://aivault-backend.onrender.com/set-premium', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log(data);
  }

  if (isLoading) {
    // Show loading indicator
    return (
      <div className='flex justify-center items-center h-screen'>
        <svg className='animate-spin h-[100px] w-[100px] text-primary' viewBox='0 0 24 24'>
          
          <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
          ></path>
        </svg>
      </div>
    );
  }

  if (authenticated) {
    window.alert('You have successfully purchased premium!');
    navigate('/home');
    return null;
  } else if (authenticated === false) {
    window.alert('You must be logged in to view this page.');
    navigate('/login');
    return null;
  }
}
export default SuccessPurchasePage;