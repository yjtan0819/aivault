

const postReply = async (token, imageId, commentId, replyText) => {
    try {
        const response = await fetch(`https://aivault-backend.onrender.com/post-reply/${imageId}/${commentId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ replyText }),
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

export default postReply;