// HomePage.js
import React from 'react';
import NavBar from '../components/NavBar';
import CommentSection from '../components/CommentSection';
import { useState, useEffect } from 'react';
import checkAuthenticated from '../utilities/authUtils';
import checkImagePicture from '../utilities/imagePictureUtils';
import getPrompt from '../utilities/promptUtils';
import { useNavigate } from 'react-router-dom';

function ContentPage() {
  const token = localStorage.getItem('jwtToken');
  const [authenticated, setAuthenticated] = useState(null);
  const [imagePicture, setImagePicture] = useState(null);
  const [prompt, setPrompt] = useState(null);
  const [imageId, setImageId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  

  useEffect(() => {

    if (token) {
      setIsLoading(true);
      // Check in the backend if the token is valid
      const imageId = getIdFromURL();
      checkAuthenticationStatus(token)
      setImageId(getIdFromURL())
      fetchImageAndPrompt(imageId);
      
    } else {
      setAuthenticated(false);
      setIsLoading(false);
    }
  }, [token]);

  const checkAuthenticationStatus = async (token) => {
    const isAuthenticated = await checkAuthenticated(token);
    setAuthenticated(isAuthenticated);
  };

  const fetchImageAndPrompt = async (imageId) => {
    try {
      const imagePicture = await checkImagePicture(token, imageId);
      setImagePicture(URL.createObjectURL(imagePicture));

      const promptData = await getPrompt(token, imageId);
      setPrompt(promptData.prompt);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIdFromURL = () => {
    const url = window.location.href;
    const id = url.split('/').pop();;
    return id;
  }

  checkImagePicture(token, getIdFromURL()).then((imagePicture) => {
    const imagePictureURL = URL.createObjectURL(imagePicture);
    setImagePicture(imagePictureURL);
  }
  );

  getPrompt(token, getIdFromURL()).then((prompt) => {
    setPrompt(prompt.prompt);
  }
  );

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

  if (authenticated){
    return (
      <div>
          <NavBar />
          <div className='flex items-center justify-center mt-10'>
            <img 
              src = {imagePicture}
              className='w-[1060px] h-[600px] rounded-[20px] object-cover'
            />
          </div>
          <p className='text-accent text-2xl justify-center flex m-[48px] font-bold'>{prompt}</p>
          <CommentSection id={imageId}/>
      </div>
    );
  }
  else if (authenticated === false) {
    window.alert('You must be logged in to view this page.');
    navigate('/login');
    return null;
  }
}

export default ContentPage;
