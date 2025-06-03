const express = require('express');
const BlogModel = require('./blog_model.js');
const { createBlog, getAllBlogs } = require('./blog_controller.js');
const router = express.Router();


router.post('/createBlog', createBlog);
router.get('/', getAllBlogs);

module.exports = router;

