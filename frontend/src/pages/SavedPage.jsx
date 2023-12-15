// HomePage.js
import React from 'react';
import NavBar from '../components/NavBar';
import ContentCell from '../components/ContentCell';
import checkAuthenticated from '../utilities/authUtils';
import checkImagePicture from '../utilities/imagePictureUtils';
import checkCustomProfilePicture from '../utilities/customProfilePictureUtils';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SavedPage() {
  const token = localStorage.getItem('jwtToken');
  const [authenticated, setAuthenticated] = useState(null);
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [imagePicture, setImagePicture] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    if (token) {
      setIsLoading(true);
      // Check in the backend if the token is valid
      checkAuthenticationStatus(token);
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


  const fetchImagesFromBackend = async (token) => {
    const response = await fetch('http://localhost:4000/get-bookmarked-images', {
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
      // add the profile picture to the array with the image id
      const profilePicture = await checkCustomProfilePicture(token, image.userId);
      const imagePictureURL = URL.createObjectURL(imagePicture);
      const profilePictureURL = URL.createObjectURL(profilePicture);
      
    
      // add the image picture to the array with the image id
      imagePictures.push({imageId: image._id, imagePicture: imagePictureURL, profilePicture: profilePictureURL, userId: image.userId});
    }
    setImagePicture(imagePictures);
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

    return (
      <div>
        <NavBar />
        <p className='text-accent text-5xl justify-center flex m-[48px] font-bold'>Saved prompts</p>
        <div className='flex flex-wrap justify-center'>
        {images.length === 0 ? (
            <p className="text-center text-gray-500 mt-4">No images available.</p>
          ) : (
            images.map((image) => (
              <ContentCell
                key={image._id}
                image={
                  imagePicture
                    ? imagePicture.find((imagePicture) => imagePicture.imageId === image._id)?.imagePicture
                    : null
                }
                profilePicture={
                  imagePicture
                    ? imagePicture.find((imagePicture) => imagePicture.imageId === image._id)?.profilePicture
                    : null
                }
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
  else if (authenticated === false) {
    window.alert('You must be logged in to view this page.');
    navigate('/login');
    return null;
  }
}

export default SavedPage;
