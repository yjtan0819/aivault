const updateProfilePicture = async (token, profilePicture) => {
    try {
      const response = await fetch('http://localhost:4000/update-profile-picture', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: profilePicture,
      });
      
      if (response.ok) {
        return response.json();
      } else {
        return response.json();
      }
    } catch (error) {
      return error; // Handle errors by returning false
    }
  };
  
  export default updateProfilePicture;
  