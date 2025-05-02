import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import chip from '../assets/cpu-chip.svg';                  // any SVG you like

export default function Hero(){
  const { scrollYProgress } = useScroll();
  const rotate = useTransform(scrollYProgress, [0,0.6],[0,360]);
  const scale  = useTransform(scrollYProgress, [0,0.5],[1,0.6]);

  return (
    <header className="hero">
      <motion.img src={chip} alt="Chip"
        style={{ rotate, scale }} className="chip" />
      <motion.h1 style={{ y: useTransform(scrollYProgress,[0,0.4],[0,-120]) }}>
         OS&nbsp;Adventure
      </motion.h1>
      <p className="tag">learn OS internals by playing</p>
    </header>
  );
}
