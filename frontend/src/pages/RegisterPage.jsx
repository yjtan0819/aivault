import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/RegisterPage.module.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const isPasswordMatch = password === confirmPassword && password !== '' && confirmPassword !== '';
  const isFormFilled = username !== '' && password !== '' && confirmPassword !== '';

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isPasswordMatch && isFormFilled) {
      try {
        const response = await fetch('http://localhost:4000/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('jwtToken', data.token);
          window.alert('Registration successful!');
          navigate('/home');
        } else {
          const errorData = await response.json();
          console.log('Registration failed:', errorData.error);
          window.alert(`Registration failed: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Error during registration:', error.message);
      }
    } else {
      window.alert('Form is incomplete or passwords do not match');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      setUsername(value);
    } else if (name === 'password') {
      setPassword(value);
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <form onSubmit={handleSubmit} className={styles.registerForm}>
        <div className={styles.logoContainerRegister}>
          <img src="aivault-high-resolution-logo-transparent.png" alt="Company Logo" />
        </div>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={username}
          onChange={handleInputChange}
          className={styles.inputRegister}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={handleInputChange}
          className={styles.inputRegister}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={handleInputChange}
          className={styles.inputRegister}
        />
        <button type="submit" disabled={!isFormFilled} className={styles.buttonRegister}>
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;