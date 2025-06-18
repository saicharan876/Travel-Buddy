const mongoose = require('mongoose');
const BlogModel = require('./blog_model.js');
const User = require('../user/user_model.js');

async function createBlog(req, res) {
  try {
    const { title, destination, content, author, image, author_Id } = req.body;

    
    const user = await User.findById(author_Id);

    if (!user) {
      return res.status(404).json({ message: 'Author not found' });
    }

    const newBlog = await BlogModel.create({
      title,
      destination,
      content,
      author,
      image,
      author_Id,
      author_profile_photo: user.profilePhoto || '' 
    });

    res.status(201).json({ blog: newBlog, message: "Blog created successfully" });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getAllBlogs(req, res) {
    try {
        const blogs = await BlogModel.find({});
        res.status(200).json({ blogs });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { createBlog, getAllBlogs };
