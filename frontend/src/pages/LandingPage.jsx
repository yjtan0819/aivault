import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../css/LandingPage.module.css';

const LandingPage = () => {
  return (
    <div className={styles.landingContainer}>
      <div className={styles.headerContent}>
        <img src="aivault-high-resolution-logo-transparent.png" alt="Company Logo" className={styles.logo}/>
        <div className={styles.buttonsLanding}>
          <Link to="/login">
            <button className={styles.loginButton}>Login</button>
          </Link>
          <Link to="/register">
            <button className={styles.registerButton}>Register</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
