const checkBookmarkImage = async (token, imageID) => {
    try {
      const response = await fetch(`http://localhost:4000/get-user-bookmark-image/${imageID}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        return data; // Return the response JSON data
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error); // Throw an error with the error message
      }
    } catch (error) {
      return { error: error.message }; // Return an object with the error message
    }
  };
  
  export default checkBookmarkImage;
  