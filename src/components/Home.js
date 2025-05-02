import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Home.css'; // We'll create specific styles for this new home

// Define navigation sections
const sections = [
  {
    title: "OS Structure",
    path: "/structure",
    description: "Explore the layers and core components.",
    icon: "layers", // Placeholder icon name
    color: "#3b82f6" // Blue
  },
  {
    title: "Processes",
    path: "/processes",
    description: "Understand programs in execution and their states.",
    icon: "gears", // Placeholder icon name
    color: "#10b981" // Green
  },
  {
    title: "CPU Scheduling",
    path: "/scheduling",
    description: "Learn how the CPU manages multiple tasks.",
    icon: "clock", // Placeholder icon name
    color: "#f97316" // Orange
  },
  {
    title: "Deadlocks",
    path: "/deadlocks",
    description: "Investigate resource conflicts and solutions.",
    icon: "lock", // Placeholder icon name
    color: "#ef4444" // Red
  },
    // Add more sections here if needed
];

// Animation variants for the container and items
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3, // Wait slightly after page transition
      staggerChildren: 0.15,
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};


function Home() {
  return (
    <div className="home-navigator">
        {/* Title removed as Hero component handles the main title now */}
        {/* Optional: Add a subtitle specific to this section */}
        <h2 className="navigator-subtitle">Choose Your Topic</h2>

        <motion.div
            className="navigator-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {sections.map((section) => (
            <motion.div key={section.path} variants={itemVariants}>
              {/* Use Link to wrap the card for navigation */}
              <Link to={section.path} className="navigator-card-link">
                <motion.div
                  className="navigator-card"
                  style={{ '--card-bg-color': section.color }} // Pass color via CSS variable
                  whileHover={{
                      y: -8, // Lift card on hover
                      scale: 1.04,
                      boxShadow: '0 10px 25px rgba(0,0,0,0.2)' // Enhanced shadow
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  {/* Basic Icon Placeholder - Replace with actual SVG icons later if possible */}
                  <div className="card-icon-placeholder" aria-hidden="true">
                      {/* Simple representations */}
                      {section.icon === 'layers' && <div className="icon-layers"><div></div><div></div><div></div></div>}
                      {section.icon === 'gears' && <div className="icon-gears">⚙️⚙️</div>}
                      {section.icon === 'clock' && <div className="icon-clock">🕒</div>}
                      {section.icon === 'lock' && <div className="icon-lock">🔒</div>}
                  </div>
                  <h3>{section.title}</h3>
                  <p>{section.description}</p>
                </motion.div>
              </Link>
            </motion.div>
            ))}
        </motion.div>
    </div>
  );
}

export default Home;