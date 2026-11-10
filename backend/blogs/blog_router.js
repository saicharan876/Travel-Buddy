const express = require('express');
const BlogModel = require('./blog_model.js');
const { createBlog, getAllBlogs } = require('./blog_controller.js');
const { Auth } = require('../middleware/auth_middleware');
const router = express.Router();


router.post('/createBlog', Auth, createBlog);
router.get('/', getAllBlogs);

module.exports = router;

