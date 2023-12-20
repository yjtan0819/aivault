import React from 'react';
import styles from '../css/Elite.module.css'; // Adjust the path as needed
import { useState, useEffect } from 'react';
import checkAuthenticated from '../utilities/authUtils';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {

  const token = localStorage.getItem('jwtToken');
  const [authenticated, setAuthenticated] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      checkAuthenticationStatus(token);
    } else {
      setAuthenticated(false);
    }
  }
  , []);

  const checkAuthenticationStatus = async (token) => {
    const isAuthenticated = await checkAuthenticated(token);
    setAuthenticated(isAuthenticated);
  };

  const handleCheckout = async (event) => {
    event.preventDefault();
    
    try {
      const response = await fetch("https://aivault-backend.onrender.com/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: [
            { id: 1, quantity: 1 },
          ],
        }),
      });
  
      if (response.ok) {
  
        const { url } = await response.json();
        window.location = url;
      } else {
        console.error("response", response);
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      // Handle the error appropriately, e.g., show an error message to the user
    }
  };

  if (authenticated) {
  
    return (
      <div className={styles.checkoutContainer}>
          <div className={styles.itemBox}>
              <img src="aivault-high-resolution-logo-transparent.png" alt="Item" className={styles.itemImage}/>
              <p className={styles.itemName}>AI Elite</p>
              <p className={styles.itemPrice}>$30.00</p>
          </div>
          <div className={styles.checkoutButtonBox}>
              <button id='checkoutButton' className={styles.checkoutButton} onClick={handleCheckout}>Proceed to checkout</button>
          </div>
      </div>
    );
  } else if (authenticated === false) {
    window.alert('You must be logged in to view this page.');
    navigate('/login');
    return null;
  }
}

export default CheckoutPage;
