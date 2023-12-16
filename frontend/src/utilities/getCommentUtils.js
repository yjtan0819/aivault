const getComments = async (token, imageID) => {
    try {
        const response = await fetch(`https://aivault-backend.onrender.com/get-comments/${imageID}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.ok) {
            const data = await response.json();
            console.log(data);
            return data;
        }
        else {
            const errorData = await response.json();
            throw new Error(errorData.error);
        }
    }
    catch (error) {
        return { error: error.message };
    }
}

export default getComments;
