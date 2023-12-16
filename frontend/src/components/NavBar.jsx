import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { FaSearch } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { AiFillPicture } from 'react-icons/ai';
import {BsFillPersonFill} from 'react-icons/bs';
import {MdCategory} from 'react-icons/md';
import { FaLock } from "react-icons/fa";
import checkPremium from '../utilities/premiumUtils';


const NavBar = () => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [postDropdownOpen, setPostDropdownOpen] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [status, setStatus] = useState("Free");
    const [comments, setComments] = useState("test comment");
    const [category, setCategory] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [isSearchExpanded, setSearchExpanded] = useState(false);  
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef(null); // Ref for dropdown
    const profilePicRef = useRef(null); // Ref for profile picture
    const [promptText, setPromptText] = useState('');
    const [file, setFile] = useState(null);
    const [premiumUser, setPremiumUser] = useState(false);

    const searchInputRef = useRef(null);
    const categoryDropdownRef = useRef(null);
    const navigate = useNavigate();

    const checkPremiumStatus = async (token) => {
        const isPremium = await checkPremium(token);
        setPremiumUser(isPremium.premium);
    };

    const handlePost = async () => {
        const storedToken = localStorage.getItem('jwtToken');

        if (storedToken) {
            // we need a file, promptText, and category
            if (!file || !promptText || !category) {
                alert('Please fill out all fields');
                return;
            }

            // call the post endpoint
            const formData = new FormData();
            formData.append('promptText', promptText);
            formData.append('file', file);
            formData.append('aimodel', category);
            formData.append('status', status);
            formData.append('comments', comments)
            try {
                const response = await fetch('http://localhost:4000/post', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${storedToken}`,
                    },
                    body: formData,
                });

                if (response.ok) {
                    console.log('Post successful');
                    alert('Post success');
                    window.location.reload();
                    setPreviewImage(null);
                    setPromptText('');
                    setCategory(null);
                    setFile(null);
                }
                else{
                    console.log('Post failed');
                    alert('Error during post:', error.message);
                }
            }
            catch (error) {
                console.error('Error during post:', error.message);
            }
        }
    };


    const handleLogout = async (event) => {
        event.preventDefault();
        const storedToken = localStorage.getItem('jwtToken');

        if (storedToken) {
            // call the logout endpoint
            try {
                const response = await fetch('http://localhost:4000/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${storedToken}`,
                    },
                    
                });

                if (response.ok) {
                    console.log('Logout successful');
                    localStorage.removeItem('jwtToken');
                    alert('Logout success');
                    navigate('/');
                }
                else{
                    console.log('Logout failed');
                }
            }
            catch (error) {
                console.error('Error during logout:', error.message);
            }
        }
    };
    
    // Click outside to close dropdown logic
    useEffect(() => {
        checkPremiumStatus(localStorage.getItem('jwtToken'));
        const handleDocumentClick = (event) => {
            if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
                // Ignore clicks on the user dropdown
                return;
            }
    
            if (postPromptsRef.current && postPromptsRef.current.contains(event.target)) {
                // Ignore clicks on the post prompts dropdown
                return;
            }
    
            if (categoryDropdownRef.current && categoryDropdownRef.current.contains(event.target)) {
                // Ignore clicks on the category dropdown
                return;
            }
    
            setDropdownOpen(false);
            setPostDropdownOpen(false);
            setShowCategoryDropdown(false);
            checkPremiumStatus(localStorage.getItem('jwtToken'));
        };
    
        // Add the event listener
        document.addEventListener('mousedown', handleDocumentClick);
    
        // Clean up
        return () => {
            document.removeEventListener('mousedown', handleDocumentClick);
        };
    }, []); // Ensure that dependencies are correctly listed if any
    
    

    const postPromptsRef = useRef(null);

    const onFileChange = (e) => {
        e.preventDefault();
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const imageURL = URL.createObjectURL(selectedFile);
            setPreviewImage(imageURL);
            setFile(selectedFile); // Set the selected file to the state
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {  // Check if the key pressed was 'Enter' and ensure Shift isn't held down (useful for multi-line inputs)
            
            e.preventDefault();  // Prevent the default behavior (line break)
            navigate(`/home?search=${searchQuery}`);
        }
    };

    const menuItems = [
        {
            name: 'Profile',
            route: '/profile',
        },
        {
            name: 'Saved prompts',
            route: '/saved',
        },
        {
            name: 'Your prompts',
            route: '/created',
        },
        !premiumUser && {
            name: 'Upgrade',
            route: '/elite',
        },
        {
            name: 'Logout',
            route: '/logout',
        },
    ].filter(Boolean);

    const categories = [
        "DALL-E 2", "DALL-E 3", "Stable Diffusion", "Stable Diffusion XL", "Midjourney", "Runway AI", "Bing", "Jasper Art"
     ];

    return (
        <div className="bg-black-transparent backdrop-blur h-[44px] flex sticky top-0 z-50 items-center gap-x-4">
            <Link to="/home"> {/* Centered "MUSE" */}
                <p className="text-[36px] text-white font-bold cursor-pointer mx-4">
                    AIVault
                </p>
            </Link>
            <button
                aria-haspopup="true"
                aria-expanded={postDropdownOpen}
                onClick={() => setPostDropdownOpen(!postDropdownOpen)}
                className="bg-white text-accent font-bold rounded-[20px] px-4 h-[30px] transform transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">Post Prompts</button>
            {isSearchExpanded ? (
            <div className="absolute top-0 left-0 w-full flex items-center"> {/* Added 'absolute', 'top-0', 'left-0', and 'w-full' */}
                <input 
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => {setSearchQuery(e.target.value)}}
                    onKeyPress={(e) => {handleKeyPress(e)}}
                    placeholder="Search:" 
                    className="bg-secondary text-text-light placeholder:text-text-light w-full h-[44px] self-center pl-12 drop-shadow-lg font-bold focus:outline-none z-10"
                />
                <button 
                    className=" absolute right-12 text-text-light rounded-full w-[30px] h-[30px] flex items-center justify-center z-10" 
                    onClick={() => {setSearchExpanded(false); setSearchQuery(""); navigate(`/home?search=${searchQuery}`);}}
                >
                    ✕
                </button>
            </div>
        ) : (
            <div onClick={
                () => {
                    setSearchExpanded(true);
                    setTimeout(() => searchInputRef.current?.focus(), 0);
                }
            } className='flex flex-row absolute right-0 mr-[72px]'>
            <p 
                className="text-[20px] text-white font-bold self-center cursor-pointer"
            >
                Search
            </p>
            <FaSearch className="text-white text-[20px] mx-2 self-center cursor-pointer"/>
            </div>
        )}
        <div ref={dropdownRef} className="absolute right-0 mr-4">
    <button
        aria-haspopup="true"
        aria-expanded={isDropdownOpen}
        onClick={() => setDropdownOpen(!isDropdownOpen)}
        className='rounded-full bg-white w-[32px] h-[32px] flex items-center justify-center z-10 cursor-pointer'
    >
        <BsFillPersonFill className="text-accent text-[20px] self-center"/>
    </button>

    {isDropdownOpen && (
    <nav className="absolute top-[44px] right-0 w-[150px] bg-white rounded-lg shadow-lg z-10">
        <ul className="flex flex-col gap-y-2 rounded-lg">
            {menuItems.map(item => (
                <li key={item.name} className='bg-white hover:bg-tertiary'>
                    {item.name === 'Logout' ? (
                        <button onClick={handleLogout} className="flex flex-row items-center gap-x-2 w-full text-left">
                            <p className="text-accent p-2 text-[18px] font-bold">{item.name}</p>
                        </button>
                    ) : (
                        <Link to={item.route} className="flex flex-row items-center gap-x-2 w-full">
                            <p className="text-accent p-2 text-[18px] font-bold">{item.name}</p>
                        </Link>
                    )}
                </li>
            ))}
        </ul>
    </nav>
)}

</div>
{postDropdownOpen && (
    <div
        ref={postPromptsRef}
     className="absolute top-[44px] left-0 bg-white rounded-lg shadow-lg z-10 flex flex-col w-full pb-10">
         <div>
         <div className='shadow-lg mt-10 mb-5 flex w-[520px] justify-between relative bg-primary rounded-[20px] p-1 mx-auto'>
    <div 
        onClick={() => {setStatus("Free")}} 
        className={`cursor-pointer ml-[50px] font-bold text-xl px-10 py-2 ${status === "Premium" ? 'text-text-dark' : 'text-text-light'} z-10`}
    >
        <p className='text-[20px]'>Free</p>
    </div>
    <div 
        onClick={() => {setStatus("Premium")}} 
        className={`cursor-pointer mr-[50px] font-bold text-xl px-10 py-2 ${status === "Free" ? 'text-text-dark' : 'text-text-light'} z-10`}
    >
        <div className='flex flex-row'>
        <p className='text-[20px]'>Premium</p>
        {
            premiumUser?
            null:
            <FaLock className={`text-[20px] absolute right-0 mr-8 mt-1 ${status === "Free" ? 'text-text-dark' : 'text-text-light'}`}/>
        }
        </div>
    </div>
    <div 
        className={`absolute top-0 left-0 transition-transform duration-300 ease-in-out ${status === "Free" ? 'transform translate-x-0' : 'transform translate-x-[100%]'} w-[50%] h-full bg-accent rounded-[20px] z-0]`}
    />
</div>
</div>
<div className='flex flex-wrap'>
    <div className='flex-1 lg:w-1/4 flex items-center flex-col px-2 m-5'>
        <p className='text-accent text-2xl whitespace-nowrap font-bold truncate mb-2'>
            1. Upload your AI image
        </p>
        <label className="transition-colors duration-200 shadow-lg w-[180px] h-[120px] bg-secondary hover:bg-accent rounded-[20px] flex items-center justify-center cursor-pointer" title='Upload background picture'>
                { 
                    previewImage 
                    ? <img src={previewImage} alt="Uploaded Preview" className="w-full h-full object-cover rounded-[20px]" />
                    : <AiFillPicture size={60} className="text-background" /> 
                }
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={onFileChange}
                    style={{ display: 'none' }}
                />
        </label>
    </div>

    <div className='flex-1 flex items-center flex-col px-2 m-5'>
        <p className='text-accent text-2xl whitespace-nowrap truncate font-bold mb-2'>
            2. Enter the prompt you used
        </p>
        <textarea className='shadow-lg w-[520px] h-[120px] bg-secondary text-white placeholder-white rounded-[20px] p-4' placeholder='Write the prompt here...' onChange={(e) => setPromptText(e.target.value)}></textarea>
    </div>

    <div className='flex-1 flex items-center flex-col px-2 m-5'>
        <p className='text-accent text-2xl whitespace-nowrap truncate font-bold mb-2'>
            3. Pick the AI you used
        </p>
        <div 
            style={{position: 'relative'}} 
            className='transition-colors duration-200 shadow-lg h-[120px] w-[260px] items-center rounded-[20px] justify-center bg-secondary hover:bg-accent flex-row flex cursor-pointer'
            title='What type of idea is it?' 
            onClick={(e) => {
                e.stopPropagation(); // Prevent event bubbling up
                setShowCategoryDropdown(!showCategoryDropdown);
            }}
        >
            {category ? <span className="text-background text-2xl font-bold">{category}</span> : <MdCategory size={60} className='text-background' />}
            {showCategoryDropdown && (
                <div ref={categoryDropdownRef} className='absolute w-[260px] top-full mt-2 bg-white rounded shadow'>
                    {categories.map(category => (
                        <div 
                            key={category} 
                            className='p-2 hover:bg-primary' 
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent event bubbling up
                                setCategory(category);
                                setShowCategoryDropdown(false);
                            }}
                        >
                            {category}
                        </div>
                    ))}
                </div>
            )}
            
        </div>
        </div>
        <div className='flex-1 lg:w-1/4 flex items-center flex-col gap-y-5 px-2 mt-[85px]'>
                <button 
                disabled={!premiumUser && status === "Premium"}
                className={`shadow-lg w-[160px] h-[80px] ${(!premiumUser && status === "Premium")? "bg-text-dark": "bg-secondary hover:bg-accent cursor-pointer"}   transition-colors duration-200 rounded-[40px] flex items-center justify-center`} title={!premiumUser && status === "Premium"? 'You must upgrade to Crispium to post premium content':'Post the prompt'} onClick={() => {setPostDropdownOpen(false); handlePost();}}>
                   <p  className='text-2xl text-white font-bold'>Post</p>
                </button>
            </div>
        </div>
    </div>
)}
        </div>
        
    );
}

export default NavBar;