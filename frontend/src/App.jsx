// App.js - REMOVE any Router/BrowserRouter here
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Trips from './pages/Trips';
import Home from './pages/Home';
import Blogs from './pages/Blogs';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TripDetail from './pages/TripDetail';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/trip/:id" element={<TripDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </>
  );
}

export default App;
