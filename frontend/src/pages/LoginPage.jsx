// LoginPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/LoginPage.module.css';
import { useState } from 'react';

function LoginPage () {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event) => {
      event.preventDefault();
  
      try {
        const response = await fetch('https://aivault-backend.onrender.com/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });
  
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('jwtToken', data.token);
          navigate('/home/');
        } else {
          window.alert('User not found/Incorrect password');
        }
      } catch (error) {
        console.error('Error during login:', error.message);
      }
    };

    return (
        <div className={styles.loginContainer}>
            <form onSubmit={handleSubmit} className={styles.loginForm}>
                <div className={styles.logoContainer}>
                    <img src="aivault-high-resolution-logo-transparent.png" alt="Company Logo" />
                </div>
                    <input 
                    type="text" 
                    placeholder="Username" 
                    className={styles.inputLogin} 
                    onChange={(e) => setUsername(e.target.value)}
                    />
                    <input 
                    type="password" 
                    placeholder="Password" 
                    className={styles.inputLogin}
                    onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit" className={styles.buttonLogin}>Login</button>
            </form>
        </div>
    );
}

export default LoginPage;