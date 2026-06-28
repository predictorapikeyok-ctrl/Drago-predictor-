import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LoaderOverlayProps {
  isVisible: boolean;
  statusText?: string;
  customMessages?: string[];
  duration?: number; // Optional simulated duration to auto-expire or just display while active
}

const DEFAULT_MESSAGES = [
  'CONNECTING TO SECURE SEED-TCP...',
  'ESTABLISHING DRAGO VPN LINK...',
  'BYPASSING SERVER PROTOCOLS...',
  'DECRYPTING WINGO GAME SEED...',
  'SYNCHRONIZING PORTAL CLOCK...',
  'ESTABLISHING ENCRYPTED TUNNEL...',
  'SYSTEM SECURE - READY!'
];

export default function LoaderOverlay({ 
  isVisible, 
  statusText, 
  customMessages = DEFAULT_MESSAGES,
  duration 
}: LoaderOverlayProps) {
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    
    // Cycle through messages every 400ms to feel extremely active and fast-paced
    const interval = setInterval(() => {
      setCurrentMsgIndex((prev) => (prev + 1) % customMessages.length);
    }, 450);

    return () => clearInterval(interval);
  }, [isVisible, customMessages]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/75 backdrop-blur-xl select-none"
        >
          {/* Main animated orb/dot orbits container */}
          <div className="flex items-center justify-center gap-6 relative h-20 w-40">
            {/* Ambient Background Radial Glow behind the dots */}
            <div 
              className="absolute inset-0 blur-xl w-full h-full pointer-events-none" 
              style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)' }}
            />

            {/* Orbiting Dot 1: Yellow/Gold */}
            <motion.div
              animate={{
                x: [-16, 16, -16],
                scale: [1, 1.25, 1, 0.75, 1],
                zIndex: [10, 20, 10, 0, 10]
              }}
              transition={{
                duration: 1.1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-6 h-6 rounded-full bg-[#f59e0b] shadow-[0_0_20px_rgba(245,158,11,0.85)]"
            />

            {/* Orbiting Dot 2: Red/Orange */}
            <motion.div
              animate={{
                x: [16, -16, 16],
                scale: [1, 0.75, 1, 1.25, 1],
                zIndex: [10, 0, 10, 20, 10]
              }}
              transition={{
                duration: 1.1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-6 h-6 rounded-full bg-[#ef4444] shadow-[0_0_20px_rgba(239,68,68,0.85)]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
