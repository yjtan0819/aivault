import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import ContentPage from './pages/ContentPage';
import NotFoundPage from './pages/NotFoundPage';
import CreatedPage from './pages/CreatedPage';
import SavedPage from './pages/SavedPage';
import ProfilePage from './pages/ProfilePage';
import SuccessPurchasePage from './pages/SuccessPurchasePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/content/:id" element={<ContentPage />} />
        <Route path="/created" element={<CreatedPage/>} />
        <Route path="/saved" element={<SavedPage/>} />
        <Route path="/profile" element={<ProfilePage/>} />
        <Route path="/successpurchase" element={<SuccessPurchasePage/>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}


export default App;
