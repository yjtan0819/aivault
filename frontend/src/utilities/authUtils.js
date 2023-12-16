// authUtils.js
const checkAuthenticated = async (token) => {
    try {
      const response = await fetch('https://aivault-backend.onrender.com/verify', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        return true; // User is authenticated
      } else {
        return false; // User is not authenticated
      }
    } catch (error) {
      return false; // Handle errors by returning false
    }
  };
  
  export default checkAuthenticated;
  