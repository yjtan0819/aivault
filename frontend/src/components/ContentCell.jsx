import { useState, useEffect } from 'react';
import {BsFillPersonFill} from 'react-icons/bs';
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa";
import { FaBookmark } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import checkLikeImage from '../utilities/likeImageUtils';
import checkBookmarkImage from '../utilities/bookmarkImageUtils';


const ContentCell = ({image, profilePicture, likes, aimodel, imageID}) => {

    const [isHovered, setIsHovered] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('jwtToken');
    const [numberOfLikes, setNumberOfLikes] = useState(likes);
    
    useEffect(() => {
        const fetchData = async () => {
        try {
            const like = await checkLikeImage(token, imageID);
            const bookmarked = await checkBookmarkImage(token, imageID);
            setIsLiked(like.liked);
            setIsBookmarked(bookmarked.bookmarked);
        } catch (error) {
            console.error('Error:', error.message);
        }
        };
    
        fetchData();
    }, [token, imageID]);
        

    const handleLikeClick = async () => {
        try {
            const response = await fetch(`http://localhost:4000/like-image/${imageID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                // Update the like count from the response
                const data = await response.json();
                setNumberOfLikes(data.numberLikes);
                
                const like = await checkLikeImage(token, imageID);
                setIsLiked(like.liked);
                
            } else {
                // Handle error
                console.error('Failed to update like count');
            }
        } catch (error) {
            console.error('Error updating like count:', error);
        }
    };

    const handleBookmarkClick = async () => {
        try {
            const response = await fetch(`http://localhost:4000/bookmark-image/${imageID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const bookmark = await checkBookmarkImage(token, imageID);
                setIsBookmarked(bookmark.bookmarked);
                
            } else {
                // Handle error
                console.error('Failed to update bookmark count');
            }
        } catch (error) {
            console.error('Error updating bookmark count:', error);
        }
    }

    return (
        // <Link to={`/content`}>
        <div className="flex flex-col items-center">
    <button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        type="button"
        className={`group relative shadow-lg flex w-[580px] h-[440px] mt-5 mx-5 mb-2 rounded-[20px] justify-center cursor-pointer brightness-105 ${image ? '' : 'bg-primary'}`}
        style={image ? { 
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(${image})`,
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
        } : {}}
    >

            {/* <Link to={`/other/${idea.createdBy}`}> */}
            <div 
                onClick={
                    (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        navigate("/profile")
                        // navigate(`/other/${idea.createdBy}`);
                    } 
                }
                className={`${profilePicture ? '' : 'bg-background'} w-[72px] h-[72px] rounded-[20px] absolute right-0 top-0 m-6 z-10 flex items-center justify-center`}
                style={profilePicture ? { backgroundImage: `url(${profilePicture})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            >
                {profilePicture ? null : <BsFillPersonFill className="text-[40px] text-foreground" />}
            </div>
            {/* </Link> */}
            
            <div className='flex flex-col absolute left-0 top-0'>
                <div className='bg-white-transparent w-[72px] h-[144px] rounded-[20px] m-6 flex flex-col gap-y-3 items-center justify-center'>
                    <div className='flex flex-col items-center justify-center'>
                        {
                            isLiked?
                            <FaHeart onClick={
                                (e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handleLikeClick();
                                }
                            } className='text-[32px] text-accent'/>
                            :
                            <FaRegHeart onClick={
                                (e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handleLikeClick();
                                }
                            
                            } className='text-[32px] text-accent'/>
                        }
                        <p className='text-[24px] text-text-dark font-bold'>
                            {
                                numberOfLikes
                            }
                        </p>
                    </div>
                    <div className='flex flex-col items-center justify-center'>
                        {
                            isBookmarked?
                            <FaBookmark onClick={
                                (e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handleBookmarkClick();
                                }
                            } className='text-[32px] text-accent'/>
                            :
                            <FaRegBookmark onClick={
                                (e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handleBookmarkClick();
                                }
                            } className='text-[32px] text-accent'/>
                        }
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-end absolute right-0 bottom-0">
                <div className="bg-background w-[96px] h-[0px] rounded-[20px] mb-6 mr-6 transition-all duration-300 ease-in-out group-hover:w-[96px] group-hover:h-[60px]">

                    
                    {!isHovered?
                    
                    null

                    :
                    <div className="flex flex-col items-center justify-center pt-1">
                        <p className="text-[12px] font-semibold text-text-dark">AI model:</p>
                        <p className="text-[12px] font-bold text-text-dark leading-none mt-1">{aimodel}</p>
                        
                        
                    </div>
                    }
                </div>
            </div>
        </button>
        </div>
        // </Link>
    )
}

export default ContentCell;