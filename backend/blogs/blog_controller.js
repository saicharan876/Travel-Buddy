const mongoose = require('mongoose');
const BlogModel = require('./blog_model.js');

async function createBlog(req, res) {
    try{
        const body = req.body;
        const newBlog = await BlogModel.create({
            title: body.title,
            destination: body.destination,
            content: body.content,
            author: body.author,
            image: body.image,
        });

        res.status(201).json({ blog: newBlog }).end("Blog created successfully");

    }
    catch (error) {
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
module.exports={createBlog, getAllBlogs};