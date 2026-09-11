import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Play, Pause, X } from 'lucide-react';
import { MediaItem } from '../types';

interface SlideshowProps {
  items: MediaItem[];
  initialIndex: number;
  onClose: () => void;
}

export function Slideshow({ items, initialIndex, onClose }: SlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;

    const currentItem = items[currentIndex];
    // Don't auto-advance on videos, let the onEnded handler do it
    if (currentItem?.type === 'video') return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4000); // 4-second transition

    return () => clearInterval(timer);
  }, [isPlaying, currentIndex, items]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === ' ') setIsPlaying(p => !p);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % items.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);

  const currentItem = items[currentIndex];
  if (!currentItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
      {/* Header Controls */}
      <div className="absolute top-0 inset-x-0 p-4 md:p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/60 to-transparent">
        <div className="text-white/90 text-sm font-medium tracking-wide">
          {currentIndex + 1} / {items.length}
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={onClose}
            className="p-2.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Close Slideshow"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Playback Controls (Bottom Bar) */}
      <div className="absolute bottom-6 inset-x-0 flex justify-center z-50 px-4 pointer-events-none">
        <div className="flex items-center gap-4 bg-black/50 backdrop-blur-lg p-3 rounded-full border border-white/10 pointer-events-auto">
          <button
            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
            className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={28} />
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
            className="p-4 text-stone-900 bg-white hover:bg-stone-200 rounded-full transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
            aria-label={isPlaying ? "Pause Slideshow" : "Play Slideshow"}
          >
            {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current" />}
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
            className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Next Slide"
          >
            <ChevronRight size={28} />
          </button>
        </div>
      </div>

      {/* Media Content */}
      <div className="relative w-full h-full max-w-7xl max-h-[100dvh] flex items-center justify-center overflow-hidden px-0 md:px-24 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.95 }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.05 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full flex items-center justify-center"
          >
            {currentItem.type === 'image' ? (
              <img
                src={currentItem.url}
                alt={currentItem.name}
                className="max-w-full max-h-full object-contain md:rounded-lg shadow-2xl"
              />
            ) : (
              <video
                src={currentItem.url}
                controls
                autoPlay
                className="max-w-full max-h-full object-contain md:rounded-lg shadow-2xl"
                onPlay={() => setIsPlaying(false)}
                onEnded={() => {
                  setIsPlaying(true);
                  nextSlide();
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Mobile Swipe Areas */}
      <div className="absolute inset-y-0 left-0 w-1/4 z-40 md:hidden" onClick={prevSlide} />
      <div className="absolute inset-y-0 right-0 w-1/4 z-40 md:hidden" onClick={nextSlide} />
    </div>
  );
}
