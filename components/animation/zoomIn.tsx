import React from 'react';
import { motion } from 'framer-motion';

const ZoomIn = ({ children }:any) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1 }}
    >
      {children}
    </motion.div>
  );
};

export default ZoomIn;
