import React, { useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { Rocket } from "lucide-react";

// --- STYLED COMPONENTS ---
const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000; /* Deep Space Black */
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const Smoke = styled(motion.div)`
  position: absolute;
  bottom: -50px;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
  filter: blur(20px);
  border-radius: 50%;
  opacity: 0.6;
`;

const LaunchText = styled(motion.h2)`
  color: #fff;
  margin-top: 60px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 1.5rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  background: linear-gradient(90deg, #fff, #3ea6ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

export default function RocketSplash({ onComplete }) {
  
  // Automatically finish animation after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3500); // 3.5 seconds total duration
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <Overlay
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
    >
      {/* 🚀 THE ROCKET */}
      <motion.div
        initial={{ y: 200, scale: 0.8 }}
        animate={{ 
          y: -1500, // Fly UP off the screen
          scale: 0.5, // Get smaller as it flies away
        }} 
        transition={{ 
          duration: 2.5, 
          ease: "easeIn", 
          delay: 0.5 
        }}
        style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        {/* Rocket Icon */}
        <Rocket 
          size={100} 
          color="#3ea6ff" 
          fill="#1e1e1e" 
          strokeWidth={1.5}
        />
        
        {/* Fire Tail Animation */}
        <motion.div 
           style={{ 
             width: 12, 
             height: 80, 
             background: 'linear-gradient(to bottom, #f1c40f, #e74c3c, transparent)', 
             borderRadius: 20,
             marginTop: -5,
             filter: 'blur(2px)'
           }}
           animate={{ 
             scaleY: [1, 1.5, 1], 
             opacity: [0.8, 1, 0.8] 
           }}
           transition={{ 
             repeat: Infinity, 
             duration: 0.1 
           }}
        />
      </motion.div>

      {/* ☁️ SMOKE EFFECT AT BOTTOM */}
      <Smoke 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.8, 0], scale: [0.5, 3, 5] }}
        transition={{ duration: 2, delay: 0.5 }}
      />
      
      {/* Text Animation */}
      <LaunchText
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.2 }}
      >
        Launching TravelRent...
      </LaunchText>
    </Overlay>
  );
}