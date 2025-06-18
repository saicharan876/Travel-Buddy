const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    destination:{
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    author_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    author_profile_photo: {
        type: String,
        required: false,
    },
});


const BlogModel = mongoose.model('Blog', blogSchema);
module.exports = BlogModel;
