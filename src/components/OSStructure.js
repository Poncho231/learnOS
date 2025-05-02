import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Import AnimatePresence
import Section from './Section';

// Define the OS structure layers with titles, descriptions, and colors
const layers = [
    // Colors slightly adjusted for potentially better contrast/visual appeal
  {
    id: 'ui',
    title: 'User Interface / Applications',
    description: 'Interfaces (CLI, GUI, API) & user programs interacting with the OS.',
    color: '#22c55e' // Vibrant Green
  },
  {
    id: 'syscalls',
    title: 'System Calls',
    description: 'The gateway for applications to request kernel services securely.',
    color: '#3b82f6' // Vibrant Blue
  },
  {
    id: 'kernel',
    title: 'Kernel',
    description: 'The core: Manages CPU (scheduling), memory, devices, filesystems.',
    color: '#f97316' // Orange
  },
  {
    id: 'hardware',
    title: 'Hardware',
    description: 'Physical components: CPU, RAM, Disks, Network Cards, Peripherals.',
    color: '#6b7280' // Gray
  }
];

// Animation variants for the container and items
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Stagger animation of children
      delayChildren: 0.2,
    }
  }
};

const layerVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 12 }
  }
};


export default function OSStructure() {
  const [expanded, setExpanded] = useState(null);

  return (
    // Use the Section component for consistent entry animation
    <Section>
      <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>
        Operating System Structure
      </h2>
      <p style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)', color: 'var(--text-secondary)' }}>
        A layered view. Click a layer to learn more.
      </p>

      {/* Use motion.div as a container for staggering */}
      <motion.div
        className="relative w-full max-w-2xl mx-auto" // Increased max-width slightly
        style={{ minHeight: '350px' }} // Ensure enough space
        variants={containerVariants}
        initial="hidden"
        animate="visible" // Trigger the animation sequence
      >
        {layers.map((layer, idx) => (
          <motion.div
            key={layer.id}
            // Apply individual layer animation variant
            variants={layerVariants}
            // Layout animation helps smoothly transition size changes
            layout // Enable layout animation
            className="absolute left-0 w-full rounded-lg p-4 text-white shadow-md cursor-pointer overflow-hidden" // Added overflow-hidden
            style={{
                // Stack layers visually: lower layers are "below" higher ones
                top: `${idx * 75}px`, // Slightly more spacing
                backgroundColor: layer.color,
                zIndex: layers.length - idx // Higher layers get higher z-index
            }}
            whileHover={{
                scale: 1.03, // Slightly less aggressive hover scale
                boxShadow: '0 6px 15px rgba(0,0,0,0.2)', // Enhance shadow on hover
                zIndex: layers.length + 1 // Bring hovered item fully to front
            }}
            // No specific transition needed here, defaults or parent handles stagger
            onClick={() => setExpanded(expanded === layer.id ? null : layer.id)}
            // Animate the background color slightly on expand/collapse
             transition={{ duration: 0.3, type: 'spring', stiffness: 100 }}
          >
            <motion.h3 layout="position" className="text-lg font-semibold">{layer.title}</motion.h3>
            {/* Use AnimatePresence to animate the description in/out */}
            <AnimatePresence>
              {expanded === layer.id && (
                <motion.div
                  // Use layout animation for the content div as well
                  layout
                  className="mt-2 text-sm" // Slightly smaller text for description
                  style={{ color: 'rgba(255, 255, 255, 0.9)'}} // Ensure text is readable
                  initial={{ height: 0, opacity: 0, y: 10 }} // Start hidden and slightly below
                  animate={{ height: 'auto', opacity: 1, y: 0 }} // Animate to full height and opacity
                  exit={{ height: 0, opacity: 0, y: 10 }} // Animate out
                  transition={{ duration: 0.3, ease: "easeInOut" }} // Smooth easing
                >
                  <p>{layer.description}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}