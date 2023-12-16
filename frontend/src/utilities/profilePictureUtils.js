const checkProfilePicture = async (token) => {
    try {
      const response = await fetch('http://localhost:4000/get-profile-picture', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        return response.blob();
      } else {
        return response.json();
      }
    } catch (error) {
      return error; // Handle errors by returning false
    }
  };
  
  export default checkProfilePicture
  