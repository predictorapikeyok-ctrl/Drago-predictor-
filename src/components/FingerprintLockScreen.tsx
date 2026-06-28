import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fingerprint, AlertCircle, ShieldAlert } from 'lucide-react';
import { 
  playClickSound, 
  playFingerprintScanning, 
  stopFingerprintScanning, 
  playFingerprintSuccess, 
  playFingerprintDenied 
} from '../lib/audio';

interface FingerprintLockScreenProps {
  onUnlock: () => void;
}

export default function FingerprintLockScreen({ onUnlock }: FingerprintLockScreenProps) {
  const [showModal, setShowModal] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  const progressIntervalRef = useRef<any>(null);
  const soundEnabled = true; // Enabled by default to matches client requirements

  // Cleanup scanning interval and sound on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      stopFingerprintScanning();
    };
  }, []);

  const handleStartScan = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (showModal) return; // Must dismiss modal first
    if (isUnlocked) return; // Ignore if already unlocked
    
    setIsScanning(true);
    setErrorMessage(null);
    setScanProgress(0);
    
    // Play sci-fi scanning laser loop & clicks
    playFingerprintScanning(soundEnabled);

    // Increment scan progress over ~2 seconds
    const duration = 2000; // 2 seconds
    const intervalTime = 40; // 25 fps
    const step = (intervalTime / duration) * 100;

    progressIntervalRef.current = setInterval(() => {
      setScanProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(progressIntervalRef.current);
          handleScanSuccess();
          return 100;
        }
        return next;
      });
    }, intervalTime);
  };

  const handleEndScan = () => {
    if (!isScanning) return;
    
    clearInterval(progressIntervalRef.current);
    setIsScanning(false);
    stopFingerprintScanning();

    if (scanProgress < 100) {
      // Incomplete scan: trigger error state
      playFingerprintDenied(soundEnabled);
      setErrorMessage("Scan Incomplete! Hold fingerprint until 100% verified.");
      setScanProgress(0);
    }
  };

  const handleScanSuccess = () => {
    setIsScanning(false);
    stopFingerprintScanning();
    playFingerprintSuccess(soundEnabled);
    setIsUnlocked(true);
    
    // Delay transition slightly for a satisfying confirmation feel to watch the gates slide open
    setTimeout(() => {
      onUnlock();
    }, 1250);
  };

  return (
    <div className="fixed inset-0 bg-transparent z-50 flex flex-col items-center justify-center overflow-hidden font-iceland select-none">
      
      {/* Cinematic sliding double vault gates that meet in the middle and split apart */}
      {/* LEFT GATE PANEL */}
      <motion.div
        animate={isUnlocked ? { x: '-100%' } : { x: '0%' }}
        transition={{ duration: 1.1, ease: [0.77, 0, 0.175, 1] }}
        className="absolute top-0 bottom-0 left-0 w-[50.5%] bg-black overflow-hidden z-20 pointer-events-none"
      >
        {/* Glow edge on the right of Left gate */}
        <div className="absolute top-0 bottom-0 right-0 w-[1.5px] bg-[#22d3ee] shadow-[0_0_12px_#22d3ee,0_0_25px_#06b6d4]" />
      </motion.div>

      {/* RIGHT GATE PANEL */}
      <motion.div
        animate={isUnlocked ? { x: '100%' } : { x: '0%' }}
        transition={{ duration: 1.1, ease: [0.77, 0, 0.175, 1] }}
        className="absolute top-0 bottom-0 right-0 w-[50.5%] bg-black overflow-hidden z-20 pointer-events-none"
      >
        {/* Glow edge on the left of Right gate */}
        <div className="absolute top-0 bottom-0 left-0 w-[1.5px] bg-[#22d3ee] shadow-[0_0_12px_#22d3ee,0_0_25px_#06b6d4]" />
      </motion.div>

      {/* Main interactive biometric scanning module - fades and scales elegantly upon unlocking */}
      <motion.div 
        animate={isUnlocked ? { opacity: 0, scale: 1.12, y: -25, filter: 'blur(4px)', pointerEvents: 'none' } : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-30 flex flex-col items-center justify-center p-8 w-full max-w-md"
      >
        
        {/* Holographic Glowing Scanner Circles */}
        <div className="relative flex items-center justify-center w-[300px] h-[300px] min-[375px]:w-[340px] min-[375px]:h-[340px] sm:w-[380px] sm:h-[380px] mb-10 transition-all duration-300">
          
          {/* External Outer Radar Ripple Rings */}
          <div className={`absolute inset-0 border border-cyan-500/10 rounded-full transition-all duration-700 ${isScanning ? 'scale-110 border-cyan-500/20 opacity-100 animate-ping' : 'scale-100 opacity-40'}`} />
          <div className="absolute inset-[5.5%] border border-cyan-500/15 rounded-full" />
          <div className="absolute inset-[11.1%] border border-cyan-500/20 rounded-full" />
          
          {/* Inner Scan border rings */}
          <div className="absolute inset-[16.6%] border-2 border-slate-800 rounded-full flex items-center justify-center overflow-hidden bg-[#020612]/75 backdrop-blur-md">
            {/* Glowing verified feedback */}
            {scanProgress === 100 && (
              <div className="absolute inset-0 bg-cyan-500/20 animate-pulse pointer-events-none" />
            )}
          </div>

          {/* Interactive Core Fingerprint Button Area */}
          <button
            onMouseDown={handleStartScan}
            onMouseUp={handleEndScan}
            onMouseLeave={handleEndScan}
            onTouchStart={handleStartScan}
            onTouchEnd={handleEndScan}
            className={`absolute inset-[22.2%] rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 focus:outline-none z-10 ${
              isScanning 
                ? 'bg-cyan-950/40 border border-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-98' 
                : 'bg-[#030d22]/90 border border-cyan-500/30 hover:border-cyan-400/70 hover:scale-102 hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.15)] active:scale-95'
            }`}
            style={{ touchAction: 'none' }}
          >
            {/* Visual Fingerprint vectors */}
            <div className="relative">
              <Fingerprint className={`w-26 h-26 min-[375px]:w-32 min-[375px]:h-32 sm:w-36 sm:h-36 stroke-[1.25] transition-all duration-300 ${
                isScanning 
                  ? 'text-cyan-300 drop-shadow-[0_0_10px_cyan] scale-102' 
                  : scanProgress === 100 
                    ? 'text-cyan-400 drop-shadow-[0_0_12px_cyan]' 
                    : 'text-cyan-900 opacity-65'
              }`} />
            </div>

            {/* Scanning Percentage Progress value inside button */}
            {isScanning && (
              <span className="absolute bottom-4 sm:bottom-6 text-base sm:text-lg font-mono tracking-widest text-cyan-300 font-bold drop-shadow-[0_0_5px_cyan]">
                {Math.floor(scanProgress)}%
              </span>
            )}
          </button>

          {/* Biometric Scanning Line Overlay - Goes up-down on top of the fingerprint button */}
          {isScanning && (
            <div className="absolute inset-[16.6%] rounded-full overflow-hidden pointer-events-none z-20">
              <div className="absolute left-0 right-0 h-[3px] bg-cyan-400 shadow-[0_0_15px_#22d3ee,0_0_25px_#06b6d4] pointer-events-none animate-scan-up-down" />
            </div>
          )}

          {/* Dynamic Arc Progress Ring surrounding the fingerprint circle */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none transform origin-center z-10" viewBox="0 0 100 100">
            <circle
              className="text-slate-800"
              strokeWidth="2"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <circle
              className="text-cyan-400 transition-all duration-75"
              strokeWidth="3.5"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={2 * Math.PI * 40 * (1 - scanProgress / 100)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
              style={{
                filter: isScanning ? 'drop-shadow(0 0 4px #22d3ee)' : 'none'
              }}
            />
          </svg>
        </div>

        {/* Dynamic Instructional labels below scanner */}
        <AnimatePresence mode="wait">
          {errorMessage ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-center px-4 w-full h-12"
            >
              <p className="text-red-400 text-lg md:text-xl font-medium tracking-wider uppercase drop-shadow-[0_0_6px_rgba(239,68,68,0.4)]">
                {errorMessage}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="guide"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-center px-4 w-full min-h-[5rem] flex flex-col justify-center items-center"
            >
              <p className={`text-2xl sm:text-3xl font-extrabold tracking-[0.22em] uppercase transition-all duration-300 bg-gradient-to-r ${
                isScanning 
                  ? 'from-cyan-300 via-emerald-300 to-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.7)] animate-pulse' 
                  : 'from-cyan-400 via-blue-500 to-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]'
              } bg-clip-text text-transparent select-none`}>
                {isScanning ? 'Verifying...' : 'Hold to unlock'}
              </p>
              

            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Immersive Panel Locked Alert Modal Overlay as shown in Screenshot 1 */}
      <AnimatePresence>
        {showModal && (
          <div className="absolute inset-0 z-40 bg-[#000000]/70 flex items-center justify-center p-6 backdrop-blur-md">
            
            {/* Modal Body Card styling with diagonal chamfered cut corners - Shrunk to extremely compact max-w-[290px] */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20, stiffness: 220 }}
              className="relative w-full max-w-[290px] p-[2px] bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 shadow-[0_0_50px_rgba(6,182,212,0.4),0_20px_60px_rgba(0,0,0,0.95)]"
              style={{
                clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)',
              }}
            >
              <div
                className="bg-[#030917] text-center p-6 flex flex-col items-center justify-center w-full h-full"
                style={{
                  clipPath: 'polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)',
                }}
              >
                {/* Warning exclamation Icon Header */}
                <div className="flex justify-center mb-4">
                  <div className="relative w-14 h-14 rounded-full bg-[#1da1f2]/10 border border-[#22d3ee]/30 flex items-center justify-center animate-pulse">
                    <div className="absolute inset-1 rounded-full bg-cyan-500/5" />
                    <AlertCircle className="w-7 h-7 text-cyan-400 drop-shadow-[0_0_8px_#22d3ee]" />
                  </div>
                </div>

                {/* Title Header */}
                <h2 className="text-2xl font-bold text-white tracking-[0.1em] uppercase mb-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  Panel Locked!
                </h2>

                {/* Paragraph Content description from the exact screenshot */}
                <p className="text-[#a5b4fc]/85 text-sm leading-relaxed tracking-wider font-sans mb-6">
                  Hello user, panel is currently locked. Please scan your fingerprint to unlock it!
                </p>

                {/* "Alright" Confirmation trigger Button */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound(soundEnabled);
                    setShowModal(false);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-sans font-semibold tracking-widest text-sm rounded-full shadow-[0_4px_15px_rgba(37,99,235,0.4)] hover:shadow-[0_4px_22px_rgba(6,182,212,0.55)] cursor-pointer active:scale-95 transition-all duration-200"
                >
                  Alright
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
