require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const multer = require('multer');
const schemas = require('../models/schema.cjs');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const sharp = require('sharp');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storeItems = new Map([
    [1, { priceInCents: 3000, name: "AI Elite" }],
]);

const secretKey = process.env.JWT_SECRET;
const profilePictureStorage = multer.memoryStorage();
const postImageStorage = multer();
const profilePictureUpload = multer({ storage: profilePictureStorage }).single('profilePicture');

function findCommentOrReply(comments, id) {
  for (let comment of comments) {
      if (comment._id.toString() === id) {
          return comment;
      }
      const foundReply = findCommentOrReply(comment.replies, id);
      if (foundReply) return foundReply;
  }
  return null;
}

router.get('/', (req, res) => {
  res.send('Hello World!');
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the username exists
    const user = await schemas.User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Create a JWT token and send it in the response
    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
    
    //store token in database
    const newToken = new schemas.Token({
      token,
      expiration: Date.now() + 3600000,
      userId: user._id
    });

    await newToken.save();

    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. Token not provided.' });
    }

    const decoded = jwt.verify(token, secretKey);
    const user = await schemas.User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    //delete token from database and add it to blacklist
    const storedToken = await schemas.Token.findOneAndDelete({
      token,
      expiration: { $gt: Date.now() },
      userId: decoded.userId,
    });

    if (!storedToken) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const newBlacklist = new schemas.Blacklist({
      token
    });

    await newBlacklist.save();

    res.json({ message: 'Logged out successfully' });

  } catch (error) {
    console.error('Error during logout:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
);

router.post("/create-checkout-session", async (req, res) => {
  try {
    const token = req.headers.authorization.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. Token not provided.' });
    }

    const decoded = jwt.verify(token, secretKey);
    const user = await schemas.User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map(item => {
        const storeItem = storeItems.get(item.id)
        return {
          price_data: {
            currency: "cad",
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.priceInCents,
          },
          quantity: item.quantity,
        }
      }),
      success_url: `http://localhost:5173/successpurchase`,
      cancel_url: `http://localhost:5173/home`,
    })
    res.json({ url: session.url });

  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/set-premium', async (req, res) => {

  const token = req.headers.authorization.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token not provided.' });
  }

  const decoded = jwt.verify(token, secretKey);
  const user = await schemas.User.findById(decoded.userId);
  if (!user) {
    return res.status(401).json({ error: 'Invalid user' });
  }

  try {
    user.premium = true;
    await user.save();
    res.json({ message: 'Premium set successfully' });
  } catch (error) {
    console.error('Error setting premium:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/get-id', async (req, res) => {
  const token = req.headers.authorization.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token not provided.' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const user = await schemas.User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }
    res.json({ userId: user._id });
  }
  catch (error) {
    console.error('Error during token verification:', error.message);
    res.status(403).json({ error: 'Invalid token.' });
  }
});

router.get('/get-premium', async (req, res) => {
  const token = req.headers.authorization.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token not provided.' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const user = await schemas.User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }
    res.json({ premium: user.premium });
  }
  catch (error) {
    console.error('Error during token verification:', error.message);
    res.status(403).json({ error: 'Invalid token.' });
  }
});

router.get('/get-bio', async (req, res) => {
  const token = req.headers.authorization.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token not provided.' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const user = await schemas.User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    if (!user.description) {
      return res.json({ bio: '' });
    }

    res.json({ bio: user.description });
  }
  catch (error) {
    console.error('Error during token verification:', error.message);
    res.status(403).json({ error: 'Invalid token.' });
  }
});

router.post('/update-bio', async (req, res) => {
  const token = req.headers.authorization.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token not provided.' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const user = await schemas.User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    // Update user's bio
    user.description = req.body.bio;

    // Save the changes to the database
    await user.save();

    // Optionally, you can send back the updated user object in the response
    res.json({ message: 'Bio updated successfully', user: user });
  } catch (error) {
    console.error('Error during token verification:', error.message);
    res.status(403).json({ error: 'Invalid token.' });
  }
});

router.get('/get-username', async (req, res) => {
  const token = req.headers.authorization.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token not provided.' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const user = await schemas.User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }
    res.json({ username: user.username });
  }
  catch (error) {
    console.error('Error during token verification:', error.message);
    res.status(403).json({ error: 'Invalid token.' });
  }
});

router.post('/update-profile-picture', profilePictureUpload, async (req, res) => {
  try {
    const token = req.headers.authorization.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. Token not provided.' });
    }

    const decoded = jwt.verify(token, secretKey);
    const user = await schemas.User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    const profilePictureBuffer = req.file.buffer;

    // Use sharp to convert the image buffer to the desired format
    const resizedProfilePictureBuffer = await sharp(profilePictureBuffer)
      .png() // Adjust the format as needed
      .toBuffer();

    user.profilePicture = resizedProfilePictureBuffer;

    // Save the user to the database
    await user.save();

    res.json({ message: 'Profile picture updated successfully' });
  } catch (error) {
    console.error('Error updating profile picture:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/get-profile-picture', async (req, res) => {
  const token = req.headers.authorization.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token not provided.' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const user = await schemas.User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    const profilePictureBuffer = user.profilePicture;

    // Use sharp to convert the image buffer to the desired format
    const resizedProfilePictureBuffer = await sharp(profilePictureBuffer)
      .toFormat('png') // Adjust the format as needed
      .toBuffer();

    // Set the appropriate content type for the response
    res.setHeader('Content-Type', 'image/jpeg'); // Adjust content type based on your image type

    // Send the resized profile picture buffer as the response
    res.send(resizedProfilePictureBuffer);
    
    
  } catch (error) {
    console.error('Error during token verification:', error.message);
    res.status(403).json({ error: 'Invalid token.' });
  }
});

router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. Token not provided.' });
    }

    const decoded = jwt.verify(token, secretKey);

    const storedToken = await schemas.Token.findOne({
      token,
      expiration: { $gt: Date.now() },
      userId: decoded.userId,
    });

    const tokenBlacklisted = await schemas.Blacklist.findOne({ token });

    if (tokenBlacklisted || !storedToken) {
      return res.status(403).json({ error: 'Invalid token.' });
    }

    res.status(200).json({ message: 'Token is valid.' });
  } catch (error) {
    console.error('Error during token verification:', error.message);
    res.status(403).json({ error: 'Invalid token.' });
  }
});

router.post('/register', profilePictureUpload, async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Check if the username already exists
      const existingUser = await schemas.User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
  
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // Create a new user
      const newUser = new schemas.User({
        username,
        password: hashedPassword,
        premium: false,
      });

      //grab image from public folder
      const defaultProfilePicturePath = path.join(__dirname, '../../images/defaultProfilePicture.png');
      const defaultPictureBuffer = await sharp(defaultProfilePicturePath).resize(200, 200).png().toBuffer();
      newUser.profilePicture = defaultPictureBuffer;
  
      // Save the user to the database
      await newUser.save();
  
      // Create a JWT token and send it in the response
      const token = jwt.sign({ userId: newUser._id }, secretKey, { expiresIn: '1h' });

      //store token in database
      const newToken = new schemas.Token({
        token,
        expiration: Date.now() + 3600000,
        userId: newUser._id
      });

      await newToken.save();

      res.json({ token });
    } catch (error) {
      console.error('Error registering user:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

router.post('/post', postImageStorage.single('file'), async (req, res) => {

  const token = req.headers.authorization.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token not provided.' });
  }

  const decoded = jwt.verify(token, secretKey);
  const user = await schemas.User.findById(decoded.userId);
  if (!user) {
    return res.status(401).json({ error: 'Invalid user' });
  }

  try {
      const file = req.file; // Corrected property name
      const aimodel = req.body.aimodel;
      const status = req.body.status;
      const promptText = req.body.promptText;

      const fileBuffer = await sharp(file.buffer).png().toBuffer();

      // Create a new image
      const newImage = new schemas.Image({
          userId: user._id,
          image: fileBuffer,
          prompt: promptText,
          aimodel: aimodel,
          type: status,
          likes: 0,
          comments: []
      });

      // Save the image to the database
      await newImage.save();

      res.json({ message: 'Image uploaded successfully' });
  } catch (error) {
      console.error('Error uploading image:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/get-my-images', async (req, res) => {
  const token = req.headers.authorization.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token not provided.' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const user = await schemas.User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    //there might be multiple images with the same user id
    // we want to get all of them
    const images = await schemas.Image.find({ userId: user._id });
    res.json({ images });
  } catch (error) {
    console.error('Error getting images:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/get-prompt/:imageID', async (req, res) => {
  const token = req.headers.authorization.replace('Bearer ', '');
  const imageID = req.params.imageID;
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token not provided.' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const user = await schemas.User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }
    const image = await schemas.Image.findById(imageID);
    
    if (!image) {
      return res.status(401).json({ error: 'Invalid image' });
    }

    const prompt = image.prompt;
    res.json({ prompt });
  } catch (error) {
    console.error('Error during token verification:', error.message);
    res.status(403).json({ error: 'Invalid token.' });
  }
}
);

router.get('/get-image-picture/:imageID', async (req, res) => {
  const token = req.headers.authorization.replace('Bearer ', '');
  const imageID = req.params.imageID;
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token not provided.' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const user = await schemas.User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }
    const image = await schemas.Image.findById(imageID);
    
    if (!image) {
      return res.status(401).json({ error: 'Invalid image' });
    }

    const imageBuffer = image.image;
    
    // Use sharp to convert the image buffer to the desired format
    const resizedImageBuffer = await sharp(imageBuffer)
      .toFormat('png') // Adjust the format as needed
      .toBuffer();

    // Set the appropriate content type for the response
    res.setHeader('Content-Type', 'image/jpeg'); // Adjust content type based on your image type
    // Send the resized profile picture buffer as the response
    res.send(resizedImageBuffer);
  } catch (error) {
    console.error('Error during token verification:', error.message);
    res.status(403).json({ error: 'Invalid token.' });
  }
});

router.get('/get-profile-picture-user/:userID', async (req, res) => {
  const token = req.headers.authorization.replace('Bearer ', '');
  const userID = req.params.userID;
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token not provided.' });
  }

  try {
    const user = await schemas.User.findById(userID);
    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    const profilePictureBuffer = user.profilePicture;

    // Use sharp to convert the image buffer to the desired format
    const resizedProfilePictureBuffer = await sharp(profilePictureBuffer)
      .toFormat('png') // Adjust the format as needed
      .toBuffer();

    // Set the appropriate content type for the response
    res.setHeader('Content-Type', 'image/jpeg'); // Adjust content type based on your image type
    // Send the resized profile picture buffer as the response
    res.send(resizedProfilePictureBuffer);
  } catch (error) {
    console.error('Error during token verification:', error.message);
    res.status(403).json({ error: 'Invalid token.' });
  }
});

router.post('/like-image/:imageID', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  try {
    if (!token) {
      return res.status(401).json({ error: 'Access denied. Token not provided.' });
    }

    const decoded = jwt.verify(token, secretKey);
    const user = await schemas.User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    const imageID = req.params.imageID;
    const image = await schemas.Image.findById(imageID);

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Check if user already liked the image
    const likedImageRelationship = await schemas.LikedImageRelationship.findOne({
      user: user._id,
      image: imageID
    });

    if (likedImageRelationship) {
      // Decrease like count
      image.likes = Math.max(0, image.likes - 1);
      await image.save();
      await likedImageRelationship.deleteOne(); // Use deleteOne instead of delete
      // return false to indicate that the image is no longer liked
      return res.json({ message: 'Image unliked successfully', numberLikes: image.likes });
    } else {
      // Increase like count
      image.likes += 1;
      const likedImageRelationshipSchema = new schemas.LikedImageRelationship({
        user: user._id,
        image: imageID
      });
      await image.save();
      await likedImageRelationshipSchema.save();
      return res.json({ message: 'Image liked successfully', numberLikes: image.likes });
    }
  } catch (error) {
    console.error('Error during token verification:', error.message);
    if (error.name === 'JsonWebTokenError') {
      res.status(403).json({ error: 'Invalid token.' });
    } else {
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
});

router.get('/get-user-like-image/:imageID', async (req, res) => {

  const token = req.headers.authorization?.replace('Bearer ', '');

  try {

    if (!token) {
      return res.status(401).json({ error: 'Access denied. Token not provided.' });
    }

    const decoded = jwt.verify(token, secretKey);
    const user = await schemas.User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    const imageID = req.params.imageID;
    const image = await schemas.Image.findById(imageID);

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Check if user already liked the image
    const likedImageRelationship = await schemas.LikedImageRelationship.findOne({
      user: user._id,
      image: imageID
    });

    if (likedImageRelationship) {
      return res.json({ liked: true });
    } else {
      return res.json({ liked: false });
    }
  } catch (error) {
    console.error('Error during token verification:', error.message);
    if (error.name === 'JsonWebTokenError') {
      res.status(403).json({ error: 'Invalid token.' });
    } else {
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
});

router.post('/bookmark-image/:imageID', async (req, res) => {

  const token = req.headers.authorization?.replace('Bearer ', '');

  try {

    if (!token) {
      return res.status(401).json({ error: 'Access denied. Token not provided.' });
    }

    const decoded = jwt.verify(token, secretKey);
    const user = await schemas.User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    const imageID = req.params.imageID;
    const image = await schemas.Image.findById(imageID);

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Check if user already bookmarked the image
    const bookmarkedImageRelationship = await schemas.BookmarkedImageRelationship.findOne({
      user: user._id,
      image: imageID
    });

    if (bookmarkedImageRelationship) {
      await bookmarkedImageRelationship.deleteOne(); // Use deleteOne instead of delete
      return res.json({ message: 'Image unbookmarked successfully' });
    }

    const bookmarkedImageRelationshipSchema = new schemas.BookmarkedImageRelationship({
      user: user._id,
      image: imageID
    });

    await bookmarkedImageRelationshipSchema.save();
    return res.json({ message: 'Image bookmarked successfully' });
  } catch (error) {
    console.error('Error during token verification:', error.message);
    if (error.name === 'JsonWebTokenError') {
      res.status(403).json({ error: 'Invalid token.' });
    } else {
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
});

router.get('/get-user-bookmark-image/:imageID', async (req, res) => {

  const token = req.headers.authorization?.replace('Bearer ', '');
  try {

    if (!token) {
      return res.status(401).json({ error: 'Access denied. Token not provided.' });
    }

    const decoded = jwt.verify(token, secretKey);
    const user = await schemas.User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    const imageID = req.params.imageID;
    const image = await schemas.Image.findById(imageID);

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Check if user already bookmarked the image
    const bookmarkedImageRelationship = await schemas.BookmarkedImageRelationship.findOne({
      user: user._id,
      image: imageID
    });

    if (bookmarkedImageRelationship) {
      return res.json({ bookmarked: true });
    } else {
      return res.json({ bookmarked: false });
    }
  } catch (error) {
    console.error('Error during token verification:', error.message);
    if (error.name === 'JsonWebTokenError') {
      res.status(403).json({ error: 'Invalid token.' });
    } else {
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
});

router.get('/get-all-images', async (req, res) => {
  const token = req.headers.authorization.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token not provided.' });
  }

  try {// check if user is premium
    const decoded = jwt.verify(token, secretKey);
    const user = await schemas.User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    if (!user.premium) {
      // only return public images
      const images = await schemas.Image.find({ type: 'Free' });
      res.json({ images });
    }
    else {
      // return all images
      const images = await schemas.Image.find();
      res.json({ images });
    }
  } catch (error) {
    console.error('Error getting images:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/get-bookmarked-images', async (req, res) => {

  const token = req.headers.authorization?.replace('Bearer ', '');

  try {

    if (!token) {
      return res.status(401).json({ error: 'Access denied. Token not provided.' });
    }

    const decoded = jwt.verify(token, secretKey);
    const user = await schemas.User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    //there might be multiple images with the same user id
    // we want to get all of them
    const bookmarkedImages = await schemas.BookmarkedImageRelationship.find({ user: user._id });
    // keep only the image ids

    const imageIds = bookmarkedImages.map(bookmarkedImage => bookmarkedImage.image);

    // get the images with the ids
    const images = await schemas.Image.find({ _id: { $in: imageIds } });
    res.json({ images });
  } catch (error) {
    console.error('Error getting images:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/get-comments/:imageID', async (req, res) => {
  const token = req.headers.authorization.replace('Bearer ', '');
  const imageID = req.params.imageID;
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token not provided.' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const user = await schemas.User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }
    const image = await schemas.Image.findById(imageID);
    
    if (!image) {
      return res.status(401).json({ error: 'Invalid image' });
    }

    const comments = image.comments;
    res.json({ comments });
  } catch (error) {
    console.error('Error during token verification:', error.message);
    res.status(403).json({ error: 'Invalid token.' });
  }
}
);

router.post('/post-comment/:imageID', async (req, res) => {
  const token = req.headers.authorization.replace('Bearer ', '');
  const imageID = req.params.imageID;

  try {
      if (!token) {
          return res.status(401).json({ error: 'Access denied. Token not provided.' });
      }

      const decoded = jwt.verify(token, secretKey);
      const user = await schemas.User.findById(decoded.userId);

      if (!user) {
          return res.status(401).json({ error: 'Invalid user' });
      }

      const commentText = req.body.commentText;

      const image = await schemas.Image.findById(imageID);
      if (!image) {
          return res.status(404).json({ error: 'Image not found' });
      }

      const date = new Date();
      const newComment = {
          _id: uuidv4(),
          text: commentText,
          postedBy: user._id,
          postedAt: date.toString(),
          replies: []
      };

      image.comments.push(newComment);
      await image.save();

      res.json({ message: 'Comment posted successfully', comments: image.comments });
  } catch (error) {
      console.error('Error posting comment:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/post-reply/:imageId/:commentId', async (req, res) => {
  const token = req.headers.authorization.replace('Bearer ', '');
  const imageId = req.params.imageId;
  const commentId = req.params.commentId;
  const replyText = req.body.replyText;

  try {
      if (!token) {
          return res.status(401).json({ error: 'Access denied. Token not provided.' });
      }

      const decoded = jwt.verify(token, secretKey);
      const user = await schemas.User.findById(decoded.userId);

      if (!user) {
          return res.status(401).json({ error: 'Invalid user' });
      }

      const image = await schemas.Image.findById(imageId);
      if (!image) {
          return res.status(404).json({ error: 'Image not found' });
      }

      const target = findCommentOrReply(image.comments, req.params.commentId);
      if (!target) {
          return res.status(404).json({ error: 'Comment not found' });
      }
      const date = new Date();

      const reply = {
        _id: uuidv4(),
        text: req.body.replyText,
        postedBy: user._id,
        postedAt: date.toString(),
        replies: []
    };

    target.replies.push(reply);
    image.markModified('comments');
    await image.save();

    res.json({ message: 'Reply posted successfully', comments: image.comments });
  } catch (error) {
      console.error('Error posting reply:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;