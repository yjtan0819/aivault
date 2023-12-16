import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import getComments from '../utilities/getCommentUtils';
import postComment from '../utilities/postCommentUtils';
import Comment from './Comment';


function CommentSection({id}){
    const [curComments, setCurComments] = useState([]);
    const [commentInput, setCommentInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    
    useEffect(() => {
        console.log("Fetching comments for image:", id);
        const token = localStorage.getItem('jwtToken');
        if (token) {
            setIsLoading(true);
            getComments(token, id)
                .then(response => {
                    if (response.comments) {
                        setCurComments(response.comments);
                        setIsLoading(false);
                    } else {
                        // Handle case where there are no comments or an unexpected response
                        console.log("No comments found or invalid response");
                        setIsLoading(false);
                    }
                })
                .catch(error => {
                    console.error("Error fetching comments:", error);
                });
        } else {
            navigate('/login');
            setIsLoading(false);
        }
    }, []);
    

    const updateRepliesForComment = (commentId, newReply) => {
        setCurComments(currentComments =>
            currentComments.map(comment =>
                comment._id === commentId
                    ? { ...comment, replies: [...comment.replies, newReply] }
                    : comment
            )
        );
    };

    const handleCommentSubmit = async () => {
        const token = localStorage.getItem('jwtToken'); // Fetch token here
        console.log("Token: ", token); // Debug: Check the token value
        let curCommentInput = commentInput.trim();
        if (token && commentInput.trim()) {
            try {
                const tempId = Date.now().toString(); // Temporary unique identifier
                const optimisticComment = {
                    _id: tempId,
                    text: curCommentInput,
                    replies: [],
                };
                setCurComments(prevComments => [...prevComments, optimisticComment]);
                setCommentInput('');
                const newComment = await postComment(token, curCommentInput, id);
                if (newComment && !newComment.error) {
                    setCurComments(prevComments =>
                        prevComments.map(comment =>
                            comment._id === tempId ? { ...comment, ...newComment } : comment
                        )
                    );
                } else {
                    // Handle error
                    console.error("Error in posting comment:", newComment.error);
                    // Remove the optimistic comment
                    setCurComments(prevComments => prevComments.filter(comment => comment._id !== tempId));
                }
            } catch (error) {
                console.error("Error posting comment:", error);
            }
        } else {
            console.error("Token not found or comment is empty");
        }
    };

      const handleCommentChange = (e) => {
        console.log("New input value:", e.target.value); // Debugging line
        setCommentInput(e.target.value);
    };

    const handleCommentKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleCommentSubmit();
        }
    };

    if (isLoading) {
        // Show loading indicator
        return (
          <div className='flex justify-center items-center h-screen'>
            <svg className='animate-spin h-[100px] w-[100px] text-primary' viewBox='0 0 24 24'>
              
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
              ></path>
            </svg>
          </div>
        );
      }

    return (
        <div className='flex justify-center mt-4'>
            <div className='w-[1060px] m-[10px] rounded-[20px] bg-accent p-5'>
                <p className='text-background text-3xl mb-6 font-bold'>Comment section</p>
                
                {/* Input Section */}
                <div className="flex items-center mb-6 bg-background rounded-[20px] p-2 shadow-md">
                    <input
                        value={ commentInput }
                        onChange={ (e) => handleCommentChange(e) }
                        onKeyPress={ (e) => handleCommentKeyPress(e) }
                        className="flex-grow mr-4 p-2 focus:outline-none rounded-lg bg-background text-secondary focus:border-none"
                        placeholder="Type your comment here..."
                    />
                    <button
                        onClick={ handleCommentSubmit }
                     className="py-2 px-4 bg-background text-secondary focus:border-none rounded-[20px] font-bold hover:bg-[#CECECE] transition-colors duration-200">
                        Submit
                    </button>
                </div>

                <div className="mt-4 space-y-6">
                {
                    curComments.map(comment => (
                        <Comment 
                            comment={comment.text}
                            replies={comment.replies}
                            setReplies={(newReply) => updateRepliesForComment(comment._id, newReply)}
                            imageId={id}
                            commentId={comment._id}
                        />
                    ))
                }

                </div>
            </div>
        </div>
    )
}

export default CommentSection;