import React from 'react';
import { motion } from 'framer-motion';

const FadeUp = ({ children }:any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 3, y: 0 }}
      transition={{ duration: 1 }}
    >
      {children}
    </motion.div>
  );
};

export default FadeUp;
