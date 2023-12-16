// schema.cjs
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
    // your user schema definition
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    premium: {
        type: Boolean,
        required: true,
    },
    profilePicture: {
        type: Buffer,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
});

const commentSchema = new mongoose.Schema({
    _id: { type: String, default: uuidv4 },
    text: String,
    postedBy: mongoose.Schema.Types.ObjectId,
    postedAt: String,
    replies: [this] // or [commentSchema] if defined separately
  });

const imageSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    image: {
        type: Buffer,
        required: true,
    },
    prompt: {
        type: String,
        required: true,
    },
    aimodel: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    likes: {
        type: Number,
        required: true,
    },
    comments:{
        type: [commentSchema],
        required: false,
    }
});

const bookmarkedImageRelationshipSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image',
        required: true,
    }
});

const likedImageRelationshipSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image',
        required: true,
    }
});

const jwtTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    expiration: {
        type: Date,
        required: true
    },
    userId: {
        type: String,
        required: true,
    }
});

const blacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    }
});

const User = mongoose.model('User', userSchema, 'Users');
const Token = mongoose.model('Token', jwtTokenSchema, 'Tokens');
const Image = mongoose.model('Image', imageSchema, 'Images');
const Comment = mongoose.model('Comment', commentSchema, 'Comments');
const Blacklist = mongoose.model('Blacklist', blacklistSchema, 'Blacklists');
const BookmarkedImageRelationship = mongoose.model('BookmarkedImageRelationship', bookmarkedImageRelationshipSchema, 'BookmarkedImageRelationships');
const LikedImageRelationship = mongoose.model('LikedImageRelationship', likedImageRelationshipSchema, 'LikedImageRelationships');

module.exports = {
    User,
    Token,
    Image,
    Comment,
    Blacklist,
    BookmarkedImageRelationship,
    LikedImageRelationship,
};
