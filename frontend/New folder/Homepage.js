import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/api/blogs')
      .then(res => setBlogs(res.data.blogs))
      .catch(err => console.error(err));
  }, []);

  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Travel Buddy</h1>
        <div className="space-x-4">
          {!isLoggedIn && <Link to="/login"><button className="px-4 py-2 border">Login</button></Link>}
          {!isLoggedIn && <Link to="/signup"><button className="px-4 py-2 border">Signup</button></Link>}
          {isLoggedIn && <Link to="/create"><button className="px-4 py-2 bg-blue-500 text-white">Post Blog</button></Link>}
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map(blog => (
          <Link to={`/blog/${blog._id}`} key={blog._id}>
            <div className="bg-white p-4 rounded shadow hover:shadow-lg">
              {blog.image && <img src={blog.image} alt={blog.title} className="w-full h-48 object-cover mb-2 rounded" />}
              <h2 className="text-xl font-bold">{blog.title}</h2>
              <p className="text-sm italic text-gray-600">Destination: {blog.destination}</p>
              <p className="text-gray-700 line-clamp-3">{blog.content}</p>
              <p className="text-sm text-gray-500">By {blog.author}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}