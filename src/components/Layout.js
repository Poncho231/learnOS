// src/components/Layout.js
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Nav from './Nav';
import Hero from './Hero';
import Footer from './Footer';

// Slide-up entry only
const pageTransition = {
  type: 'spring',
  stiffness: 120,
  damping: 25
};

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="App">
      <Nav />
      {isHome && <Hero />}

      <motion.main
        key={location.pathname}
        className="content"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={pageTransition}
      >
        <Outlet />
      </motion.main>

      <Footer />
    </div>
  );
}
