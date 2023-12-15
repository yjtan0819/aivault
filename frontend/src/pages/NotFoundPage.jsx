import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../css/LandingPage.module.css';

const NotFoundPage = () => {
  return (
    <div className={styles.landingContainer}>
      <div className={styles.headerContent}>
        <Link to="/home">
          <img src="aivault-high-resolution-logo-transparent.png" alt="Company Logo" className={styles.logo} />
        </Link>
        <div className={styles.buttonsLanding}>
          <div>
            <p className={styles.errorMessage}>
              Oops! This page is not available. You seem lost!
            </p>
            <p className={styles.errorMessage}>
              Click the image above to return to the home page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
