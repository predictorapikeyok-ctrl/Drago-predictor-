import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import CyberGrid from './components/CyberGrid';
import WelcomeScreen from './components/WelcomeScreen';
import FingerprintLockScreen from './components/FingerprintLockScreen';
import AccessKeyScreen from './components/AccessKeyScreen';
import PredictorScreen from './components/PredictorScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'accessKey' | 'predictor'>('welcome');
  const [isEstimatorLive, setIsEstimatorLive] = useState(false);
  const [activeLiveGame, setActiveLiveGame] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(true);

  const isRedLiveTheme = isEstimatorLive && activeLiveGame === 'eightytwolottery';
  const isJalwaLiveTheme = isEstimatorLive && activeLiveGame === 'jalwagame';
  const isTirangaLiveTheme = isEstimatorLive && activeLiveGame === 'tiranga';
  const isFiftyOneLiveTheme = isEstimatorLive && activeLiveGame === 'fiftyonegame';
  const isJaiClubLiveTheme = isEstimatorLive && activeLiveGame === 'jaiclub';
  const isGoaLiveTheme = isEstimatorLive && activeLiveGame === 'goagame';
  const isNinetyOneLiveTheme = isEstimatorLive && activeLiveGame === 'ninetyoneclub';
  const isBdgLiveTheme = isEstimatorLive && activeLiveGame === 'bdgwin';

  return (
    <div className={`relative min-h-screen ${
      isEstimatorLive 
        ? isRedLiveTheme || isNinetyOneLiveTheme
          ? "bg-gradient-to-b from-[#2c0505] via-[#0c0101] to-black" 
          : isBdgLiveTheme
            ? "bg-gradient-to-b from-[#251403] via-[#0b0601] to-black"
            : isJalwaLiveTheme
            ? "bg-gradient-to-b from-[#061A33] via-[#020A16] to-black"
            : isTirangaLiveTheme
              ? "bg-gradient-to-b from-[#0d162d] via-[#040816] to-black"
              : isFiftyOneLiveTheme
                ? "bg-gradient-to-b from-[#201505] via-[#0a0601] to-black"
                : isJaiClubLiveTheme
                  ? "bg-gradient-to-b from-[#2a053b] via-[#0b0110] to-black"
                  : isGoaLiveTheme
                    ? "bg-gradient-to-b from-[#05112e] via-[#010410] to-black"
                    : "bg-gradient-to-b from-[#07240c] via-[#020c04] to-black" 
        : "bg-[#02020a]"
    } overflow-x-hidden text-white flex flex-col`}>
      {/* Dynamic green/red/navy ambient light overlays across the entire screen when Estimator is Live */}
      {isEstimatorLive && (
        <>
          {isRedLiveTheme || isNinetyOneLiveTheme ? (
            <>
              <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[600px] rounded-full bg-[#ef4444]/35 blur-[120px] pointer-events-none z-0 scale-110 animate-pulse" style={{ animationDuration: '5s' }} />
              <div className="absolute top-[20%] left-[-15%] w-[450px] h-[450px] rounded-full bg-[#ef4444]/25 blur-[100px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '8s' }} />
              <div className="absolute bottom-[5%] right-[-15%] w-[500px] h-[500px] rounded-full bg-[#7f1d1d]/45 blur-[110px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '10s' }} />
              {/* Subtle gradient banner backdrop */}
              <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-[#ef4444]/18 to-transparent pointer-events-none z-0" />
            </>
          ) : isJalwaLiveTheme ? (
            <>
              <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[600px] rounded-full bg-[#61DACC]/35 blur-[120px] pointer-events-none z-0 scale-110 animate-pulse" style={{ animationDuration: '5s' }} />
              <div className="absolute top-[20%] left-[-15%] w-[450px] h-[450px] rounded-full bg-[#0d9488]/25 blur-[100px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '8s' }} />
              <div className="absolute bottom-[5%] right-[-15%] w-[500px] h-[500px] rounded-full bg-[#0f766e]/45 blur-[110px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '10s' }} />
              {/* Subtle gradient banner backdrop */}
              <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-[#61DACC]/18 to-transparent pointer-events-none z-0" />
            </>
          ) : isTirangaLiveTheme ? (
            <>
              <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[600px] rounded-full bg-[#6495ED]/35 blur-[120px] pointer-events-none z-0 scale-110 animate-pulse" style={{ animationDuration: '5s' }} />
              <div className="absolute top-[20%] left-[-15%] w-[450px] h-[450px] rounded-full bg-[#3b82f6]/25 blur-[100px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '8s' }} />
              <div className="absolute bottom-[5%] right-[-15%] w-[500px] h-[500px] rounded-full bg-[#1e3a8a]/45 blur-[110px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '10s' }} />
              {/* Subtle gradient banner backdrop */}
              <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-[#6495ED]/18 to-transparent pointer-events-none z-0" />
            </>
          ) : isFiftyOneLiveTheme ? (
            <>
              <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[600px] rounded-full bg-[#f59e0b]/35 blur-[120px] pointer-events-none z-0 scale-110 animate-pulse" style={{ animationDuration: '5s' }} />
              <div className="absolute top-[20%] left-[-15%] w-[450px] h-[450px] rounded-full bg-[#d97706]/25 blur-[100px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '8s' }} />
              <div className="absolute bottom-[5%] right-[-15%] w-[500px] h-[500px] rounded-full bg-[#78350f]/45 blur-[110px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '10s' }} />
              {/* Subtle gradient banner backdrop */}
              <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-[#f59e0b]/18 to-transparent pointer-events-none z-0" />
            </>
          ) : isJaiClubLiveTheme ? (
            <>
              <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[600px] rounded-full bg-[#d946ef]/35 blur-[120px] pointer-events-none z-0 scale-110 animate-pulse" style={{ animationDuration: '5s' }} />
              <div className="absolute top-[20%] left-[-15%] w-[450px] h-[450px] rounded-full bg-[#a855f7]/25 blur-[100px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '8s' }} />
              <div className="absolute bottom-[5%] right-[-15%] w-[500px] h-[500px] rounded-full bg-[#581c87]/45 blur-[110px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '10s' }} />
              {/* Subtle gradient banner backdrop */}
              <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-[#d946ef]/18 to-transparent pointer-events-none z-0" />
            </>
          ) : isGoaLiveTheme ? (
            <>
              <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[600px] rounded-full bg-[#6495ED]/35 blur-[120px] pointer-events-none z-0 scale-110 animate-pulse" style={{ animationDuration: '5s' }} />
              <div className="absolute top-[20%] left-[-15%] w-[450px] h-[450px] rounded-full bg-[#3b82f6]/25 blur-[100px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '8s' }} />
              <div className="absolute bottom-[5%] right-[-15%] w-[500px] h-[500px] rounded-full bg-[#1e3a8a]/45 blur-[110px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '10s' }} />
              {/* Subtle gradient banner backdrop */}
              <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-[#6495ED]/18 to-transparent pointer-events-none z-0" />
            </>
          ) : isBdgLiveTheme ? (
            <>
              <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[600px] rounded-full bg-[#F0D597]/35 blur-[120px] pointer-events-none z-0 scale-110 animate-pulse" style={{ animationDuration: '5s' }} />
              <div className="absolute top-[20%] left-[-15%] w-[450px] h-[450px] rounded-full bg-[#d4af37]/25 blur-[100px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '8s' }} />
              <div className="absolute bottom-[5%] right-[-15%] w-[500px] h-[500px] rounded-full bg-[#451a03]/45 blur-[110px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '10s' }} />
              {/* Subtle gradient banner backdrop */}
              <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-[#F0D597]/18 to-transparent pointer-events-none z-0" />
            </>
          ) : (
            <>
              <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[600px] rounded-full bg-[#21F102]/35 blur-[120px] pointer-events-none z-0 scale-110 animate-pulse" style={{ animationDuration: '5s' }} />
              <div className="absolute top-[20%] left-[-15%] w-[450px] h-[450px] rounded-full bg-[#21F102]/25 blur-[100px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '8s' }} />
              <div className="absolute bottom-[5%] right-[-15%] w-[500px] h-[500px] rounded-full bg-[#075000]/45 blur-[110px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '10s' }} />
              {/* Subtle gradient banner backdrop */}
              <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-[#21F102]/18 to-transparent pointer-events-none z-0" />
            </>
          )}
        </>
      )}

      {/* Cyber animated playground background on all screens except when estimator is live */}
      {!isEstimatorLive && <CyberGrid />}

      {/* Screen container with transition animations */}
      <div className="relative z-10 flex-1 flex flex-col w-full h-full">
        <AnimatePresence mode="wait">
          {currentScreen === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="flex-1 flex flex-col w-full"
            >
              <WelcomeScreen onStart={() => {
                setCurrentScreen('accessKey');
              }} />
            </motion.div>
          )}



          {currentScreen === 'accessKey' && (
            <motion.div
              key="accessKey"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex-1 flex flex-col w-full items-center justify-center"
            >
              <AccessKeyScreen 
                onVerifySuccess={() => setCurrentScreen('predictor')} 
                onBack={() => setCurrentScreen('welcome')} 
              />
            </motion.div>
          )}

          {currentScreen === 'predictor' && (
            <motion.div
              key="predictor"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="flex-1 flex flex-col w-full"
            >
              <PredictorScreen 
                onBack={() => {
                  setIsEstimatorLive(false);
                  setActiveLiveGame(null);
                  setCurrentScreen('accessKey');
                }} 
                onServerStateChange={(started, gameId) => {
                  setIsEstimatorLive(started);
                  if (started && gameId) {
                    setActiveLiveGame(gameId);
                  } else if (!started) {
                    setActiveLiveGame(null);
                  }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cinematic sliding double gates as fingerprint lock screen overlay */}
      <AnimatePresence>
        {isLocked && (
          <FingerprintLockScreen onUnlock={() => setIsLocked(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
