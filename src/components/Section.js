import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function Section({ children, delay=0 }){
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:'-80px 0px' });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity:0, y:60 }}
      animate={inView ? { opacity:1, y:0 } : {}}
      transition={{ duration:.6, delay }}
      style={{ scrollMarginTop:'90px' }}
    >
      {children}
    </motion.section>
  );
}
