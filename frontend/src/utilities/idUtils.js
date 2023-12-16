// authUtils.js
const checkId = async (token) => {
    try {
      const response = await fetch('https://aivault-backend.onrender.com/get-id', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        return response.json(); // User is authenticated
      } else {
        return response.json(); // User is not authenticated
      }
    } catch (error) {
      return error; // Handle errors by returning false
    }
  };
  
  export default checkId;
  