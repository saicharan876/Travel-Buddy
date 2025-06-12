import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Trips from './pages/Trips';
import Home from './pages/Home';
import Blogs from './pages/Blogs';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TripDetail from './pages/TripDetail';

function FlipPage({ children }) {
  return (
      <motion.div
      initial={{ x: "100vw", opacity: 1 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "-100vw", opacity: 1 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      style={{
        minHeight: "100vh",
        willChange: "transform",
        background: "transparent"
      }}
    >
      {children}
    </motion.div>
  );
}

function App() {
  const location = useLocation();
  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<FlipPage><Home /></FlipPage>} />
          <Route path="/blogs" element={<FlipPage><Blogs /></FlipPage>} />
          <Route path="/trips" element={<FlipPage><Trips /></FlipPage>} />
          <Route path="/trip/:id" element={<FlipPage><TripDetail /></FlipPage>} />
          <Route path="/login" element={<FlipPage><Login /></FlipPage>} />
          <Route path="/signup" element={<FlipPage><Signup /></FlipPage>} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
