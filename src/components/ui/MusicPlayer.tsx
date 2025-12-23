"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiMusic, FiX } from "react-icons/fi";

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [volume, setVolume] = useState(0.5);

  // Set initial volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowControls(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.error("Audio play failed:", err);
        });
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src="/media/FIFA Arab Cup Qatar 2025™ Official Song – Zamani  الأغنية الرسمية لكأس العرب قطر 2025 – زماني.mp3"
        loop
        preload="metadata"
      />

      {/* Floating player button - bottom right */}
      <div ref={containerRef} className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Expanded controls */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className="absolute bottom-16 right-0 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 shadow-xl min-w-[200px]"
              >
                {/* Close button */}
                <button
                  onClick={() => setShowControls(false)}
                  className="absolute top-2 right-2 p-1 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 mb-3 pr-6">
                  <FiMusic className="w-4 h-4 text-primary-500" />
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    AFCON Anthem
                  </span>
                </div>
                
                {/* Volume slider */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-1 text-[var(--muted)] hover:text-primary-500 transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <FiVolumeX className="w-4 h-4" />
                    ) : (
                      <FiVolume2 className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="flex-1 h-1 bg-[var(--muted-bg)] rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-3
                      [&::-webkit-slider-thumb]:h-3
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-primary-500
                      [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main play/pause button */}
          <div className="flex gap-2">
            {/* Settings button (only show when playing) */}
            {isPlaying && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={toggleControls}
                className="w-10 h-10 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--muted)] hover:text-primary-500 hover:border-primary-500 transition-all"
              >
                <FiVolume2 className="w-4 h-4" />
              </motion.button>
            )}

            {/* Play/Pause button */}
            <motion.button
              onClick={togglePlay}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`
                w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all relative
                ${isPlaying 
                  ? "bg-primary-500 text-black" 
                  : "bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] hover:border-primary-500"
                }
              `}
            >
              {isPlaying ? (
                <FiPause className="w-5 h-5" />
              ) : (
                <FiPlay className="w-5 h-5 ml-0.5" />
              )}

              {/* Animated pulse when playing */}
              {isPlaying && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary-500"
                  animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </>
  );
}
