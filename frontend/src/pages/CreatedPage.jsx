import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import ContentCell from '../components/ContentCell';
import checkAuthenticated from '../utilities/authUtils';
import { useNavigate } from 'react-router-dom';
import checkProfilePicture from '../utilities/profilePictureUtils';
import checkImagePicture from '../utilities/imagePictureUtils';

function CreatedPage() {
  const token = localStorage.getItem('jwtToken');
  const [authenticated, setAuthenticated] = useState(null);
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null);
  const [imagePicture, setImagePicture] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      setIsLoading(true);
      // Check in the backend if the token is valid
      checkAuthenticationStatus(token);
      checkProfilePictureStatus(token);
      fetchImagesFromBackend(token).finally(() => {
        setIsLoading(false);
      }
      );
    } else {
      setAuthenticated(false);
      setIsLoading(false);
    }
  }, [token]);

  const checkAuthenticationStatus = async (token) => {
    const isAuthenticated = await checkAuthenticated(token);
    setAuthenticated(isAuthenticated);
  };

  const checkProfilePictureStatus = async (token) => {
    const profilePicture = await checkProfilePicture(token);
    const profilePictureURL = URL.createObjectURL(profilePicture);
    setProfilePicture(profilePictureURL);
  };

  const fetchImagesFromBackend = async (token) => {
    const response = await fetch('https://aivault-backend.onrender.com/get-my-images', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    setImages(data.images);
    
    //for each image, fetch the image picture
    const imagePictures = [];
    for (const image of data.images) {
      const imagePicture = await checkImagePicture(token, image._id);
      const imagePictureURL = URL.createObjectURL(imagePicture);
      // add the image picture to the array with the image id
      imagePictures.push({imageId: image._id, imagePicture: imagePictureURL});
    }

    setImagePicture(imagePictures);
  };


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
    // Authenticated state
    return (
      <div>
        <NavBar />
        <p className='text-accent text-5xl justify-center flex m-[48px] font-bold'>Your prompts</p>
        <div className='flex flex-wrap justify-center'>
        {images.length === 0 ? (
            <p className="text-center text-gray-500 mt-4">No images available.</p>
          ) : (
            images.map((image) => (
              <ContentCell
                key={image._id}
                image={imagePicture ? imagePicture.find((imagePicture) => imagePicture.imageId === image._id).imagePicture : null}
                profilePicture={profilePicture}
                likes={image.likes}
                aimodel={image.aimodel}
                imageID={image._id}
              />
            ))
          )}

        </div>
      </div>
    );
  }
  if (authenticated === false) {
    window.alert('You must be logged in to view this page.');
    navigate('/login');
    return null;
  }
}

export default CreatedPage;