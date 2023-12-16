import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BsArrowReturnRight } from "react-icons/bs";
import {BsFillPersonFill} from 'react-icons/bs';
import postReply from '../utilities/postReplyUtils';




const Comment = ({comment, replies, setReplies, imageId, commentId }) => {
    const [currentReply, setCurrentReply] = useState('');
    const [showReplyInput, setShowReplyInput] = useState(false);

const handleReplyChange = (e) => {
    setCurrentReply(e.target.value);
};

const toggleReplyInput = () => {
    setShowReplyInput(!showReplyInput);
};

const handleReplyClick = () => {
    if (showReplyInput) {
        handleReplySubmit();
    } else {
        setShowReplyInput(true);
    }
};

const handleReplyKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleReplySubmit();
    }
};

const handleReplySubmit = async () => {
    const token = localStorage.getItem('jwtToken');
    let currentReplyTrimmed = currentReply.trim();

    if (token && currentReplyTrimmed) {
        try {
            // Optimistic reply
            const optimisticReply = {
                _id: Date.now().toString(), // Temporary ID
                text: currentReplyTrimmed,
                replies: [] // Assuming replies can have their own replies
            };

            setReplies(prevReplies => [...prevReplies, optimisticReply]);
            setCurrentReply('');

            const newReply = await postReply(token, imageId, commentId, currentReplyTrimmed);

            if (newReply && !newReply.error) {
                // Replace optimistic reply with actual reply from server
                setReplies(prevReplies => prevReplies.map(reply => 
                    reply._id === optimisticReply._id ? { ...reply, ...newReply } : reply
                ));
            } else {
                console.error("Error in posting reply:", newReply.error);
                // Optionally remove the optimistic reply if there's an error
                setReplies(prevReplies => prevReplies.filter(reply => reply._id !== optimisticReply._id));
            }
        } catch (error) {
            console.error("Error posting reply:", error);
        }
    } else {
        console.error("Token not found or reply is empty");
    }
};

    return (
        <div className="mt-2">
            <div className="flex items-start space-x-4 bg-secondary p-2 rounded-[20px] shadow-md">
                <button onClick={ toggleReplyInput} className="p-2 bg-transparent rounded-lg text-text-light hover:bg-primary transition-colors duration-200">
                        <BsArrowReturnRight className="text-[24px] text-background"/>
                    </button>
                <div className="flex-1 mt-2 items-center justify-center gap-x-4 text-background font-semibold">
                    <div className="text-background font-semibold">
                    {comment}
                </div>

                {showReplyInput && (
                    <div className="mt-2 flex items-center">
                        <input
                            value={currentReply}
                            onChange={ handleReplyChange }
                            onKeyPress={(e) => {
                                handleReplyKeyPress(e);
                            }}
                            className="flex-grow p-2 rounded-lg bg-background text-accent focus:outline-none"
                            placeholder="Type your reply..."
                        />
                        <button
                        onClick={ handleReplySubmit} 
                        className="ml-4 py-2 px-4 font-bold bg-transparent rounded-[20px] bg-white text-secondary hover:bg-[#CECECE] transition-colors duration-200">
                            Submit
                        </button>
                    </div>
        )}
                </div>
            </div>
            {
                replies?.map(reply => (
                    <div key={reply._id} className="mt-4 ml-12">
                        <Comment 
                            comment={reply.text}
                            replies={reply.replies}
                            setReplies={newReplies => {
                                const updatedReplies = replies.map(r => 
                                    r._id === reply._id ? { ...r, replies: newReplies } : r
                                );
                                setReplies(updatedReplies);
                            }}
                            imageId={imageId}
                            commentId={reply._id}
                        />
                    </div>
                ))
            }
        </div>
    );
}

export default Comment;