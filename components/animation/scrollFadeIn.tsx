import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ScrollFadeIn = ({ children }:any) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1.33 1"]
  });

  const opacity = useTransform(scrollYProgress, [1, 0], [0, 1]);
  const translateY = useTransform(scrollYProgress, [1, 0], [20, 0]);

  return (
    <motion.div ref={ref} style={{ opacity, translateY }}>
      {children}
    </motion.div>
  );
};

export default ScrollFadeIn;
