import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function BlogDetails() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:3000/api/blogs/${id}`)
      .then(res => setBlog(res.data.blog))
      .catch(err => console.error(err));
  }, [id]);

  if (!blog) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {blog.image && <img src={blog.image} alt={blog.title} className="w-full h-64 object-cover rounded mb-4" />}
      <h1 className="text-3xl font-bold mb-2">{blog.title}</h1>
      <p className="text-sm text-gray-600 mb-2">Destination: {blog.destination}</p>
      <p className="text-sm text-gray-500 mb-4">By {blog.author} | {new Date(blog.createdAt).toLocaleString()}</p>
      <p className="text-lg text-gray-800 whitespace-pre-line">{blog.content}</p>
    </div>
  );
}