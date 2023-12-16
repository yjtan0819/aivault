const postComment = async (token, commentText, imageId) => {
    try {
        const response = await fetch(`http://localhost:4000/post-comment/${imageId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ commentText }), // Correctly structure the request body
        });
        if (response.ok) {
            const data = await response.json();
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

export default postComment;