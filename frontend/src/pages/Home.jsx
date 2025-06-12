import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

// --- UPDATED: New list of remote image URLs ---
const slideshowImages = [
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2940&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2940&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?q=80&w=2940&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1548957175-84f0f9af659e?q=80&w=2082&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1464207687429-7505649dae38?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1444210971048-6130cf0c46cf?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
];


// The rest of your component logic works without any changes.
export default function Home() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === slideshowImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 2500); 

    return () => clearInterval(timer);
  }, []);

  const handleLinkClick = (e) => {
    e.preventDefault();
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      navigate('/trips');
    }, 1000);
  };

  return (
    <div className="home-container">
      <div className="slideshow">
        {slideshowImages.map((image, index) => (
          <div
            key={index}
            className={`background-slide ${index === currentImageIndex ? 'visible' : ''}`}
            style={{ backgroundImage: `url(${image})` }}
          ></div>
        ))}
      </div>

      <div className="hero-text">
        <h1>Find Your Next Adventure</h1>
        <p>Connect with travel buddies around the world</p>
        <Link to="/trips" className="hero-cta-btn" onClick={handleLinkClick}>
          <span>Explore Trips</span>
          <i
            className={`fa-solid fa-paper-plane aeroplane-icon ${isAnimating ? 'fly' : ''}`}
            onAnimationEnd={() => setIsAnimating(false)}
          />
        </Link>
      </div>
    </div>
  );
}