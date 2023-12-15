import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import checkAuthenticated from '../utilities/authUtils';
import checkUsername from '../utilities/usernameUtils';
import checkProfilePicture from '../utilities/profilePictureUtils';
import updateProfilePicture from '../utilities/updateProfilePictureUtils';
import checkBio from '../utilities/bioUtils';
import updateBio from '../utilities/updateBioUtils';
import { useNavigate } from 'react-router-dom';
import ContentCell from '../components/ContentCell';
import {BsFillPersonFill} from 'react-icons/bs';

function ProfilePage() {
  const [token, setToken] = useState(localStorage.getItem('jwtToken'));
  const [authenticated, setAuthenticated] = useState(null);
  const [username, setUsername] = useState(null);
  const [bio, setBio] = useState(null);
  const [pendingBio, setPendingBio] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const isCurrentUser = true;
  const cells = [1, 2, 3, 4, 5, 6, 7, 8];
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      checkAuthenticationStatus(token);
      checkUsernameStatus(token);
      checkProfilePictureStatus(token);
      checkBioStatus(token);
    } else {
      setAuthenticated(false);
    }
  }, []);

  const checkBioStatus = async (token) => {
    const bio = await checkBio(token);
    setBio(bio.bio);
    setPendingBio(bio.bio);
  }

  const checkAuthenticationStatus = async (token) => {
    const isAuthenticated = await checkAuthenticated(token);
    setAuthenticated(isAuthenticated);
  };

  const checkUsernameStatus = async (token) => {
    const username = await checkUsername(token);
    setUsername(username.username);
  };

  const checkProfilePictureStatus = async (token) => {
    const profilePicture = await checkProfilePicture(token);
    const profilePictureURL = URL.createObjectURL(profilePicture);
    setProfilePicture(profilePictureURL);
  };

  const handleBioChange = (event) => {
    //send the bio to the backend after the user has stopped typing for 3 seconds
    const updatedBio = event.target.value;
    setPendingBio(updatedBio);
  
    setTimeout(() => {
      // Update the bio only if there are pending changes
      if (updatedBio !== bio) {
        setBio(updatedBio);
        updateBio(token, updatedBio);
      }
    }, 1000);
  };
  

  const handleProfilePictureChange = (event) => {
    event.preventDefault();

    const file = event.target.files[0];

    if (file.type && file.type.indexOf('image') === -1) {
      window.alert('File is not an image.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      window.alert('File is too big.');
      return;
    }

    setProfilePicture(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('profilePicture', file);
    updateProfilePicture(token, formData);

    window.alert('Profile picture updated.');
  };

  if (authenticated === false) {
    window.alert('You must be logged in to view this page.');
    navigate('/login');
    return null;
  }

  if (authenticated) {
    return (
      <div>
        <NavBar />
        <p className='text-accent text-5xl justify-center flex m-[48px] font-bold'>{`${username}`}'s Profile</p>
        <div className="text-center my-8">
          {
            profilePicture === null ?
              <BsFillPersonFill size={250} className="mx-auto border rounded-full p-2" />
              : <img src={profilePicture} alt="Profile Image" className="rounded-full w-64 h-64 mx-auto" />
          }
          
          {
            isCurrentUser
              ? <div className="mt-4">
              <button
                onClick={() => document.getElementById('fileInput').click()}
                className="bg-primary text-white font-bold rounded-[20px] px-4 h-[30px] transform transition-all hover:scale-105 active:scale-95 focus:outline-none "
              >
                Click here to change profile picture
              </button>
              <input
                id="fileInput"
                type="file"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
            </div>
              : null
          }

          <p className="mt-10 text-2xl font-bold text-text-dark">Bio</p>
          {
            isCurrentUser
              ? <textarea className="mt-4 w-1/2 mx-auto p-4 rounded-lg bg-background text-text-dark" value={pendingBio} onChange={
   
                handleBioChange
                }
               placeholder="Write a bio here..." />
              : <p className="mt-4 w-1/2 mx-auto p-4 rounded-lg bg-background text-text-dark">{pendingBio}</p>
          }
           {
          !isCurrentUser?
          <>
          <p className="mt-[100px] text-2xl font-bold text-text-dark">Posted Content</p>
          <div className='flex flex-wrap justify-center'>
          {cells.map((cell) => (
            <ContentCell key={cell} />
          ))}
        </div>
        </>
        :
        null
        }
        </div>
       
      </div>
    );
  }
}

export default ProfilePage;
