const updateBio = async (token, bio) => {
    try {
      const response = await fetch('https://aivault-backend.onrender.com/update-bio', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bio: bio,
        }),
      });
  
      if (response.ok) {
        return response.json();
      } else {
        // If the response status is not okay, throw an error
        throw new Error(`Failed to update bio. Status: ${response.status}`);
      }
    } catch (error) {
      // Log the error for debugging purposes
      console.error(error);
  
      // You can handle different types of errors here and return accordingly
      return { error: 'An error occurred while updating the bio.' };
    }
  };
  
  export default updateBio;
  