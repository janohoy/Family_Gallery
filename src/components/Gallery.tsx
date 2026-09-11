import { useEffect, useRef } from 'react';
import { MediaItem } from '../types';
import { Play, Check } from 'lucide-react';

interface GalleryProps {
  items: MediaItem[];
  onItemClick: (index: number) => void;
  isSelectMode: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSetSelect: (id: string, selected: boolean) => void;
}

export function Gallery({ items, onItemClick, isSelectMode, selectedIds, onToggleSelect, onSetSelect }: GalleryProps) {
  const isDragging = useRef(false);
  const dragMode = useRef<'select' | 'deselect'>('select');

  useEffect(() => {
    const handlePointerUp = () => {
      isDragging.current = false;
    };
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, []);

  return (
    <div 
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[250px]"
      style={{ touchAction: isSelectMode ? 'none' : 'auto' }}
    >
      {items.map((item, index) => {
        const isSelected = selectedIds.includes(item.id);
        
        return (
          <button
            key={item.id}
            onPointerDown={(e) => {
              if (isSelectMode) {
                // Ensure touch interactions don't scroll while selecting
                if (e.pointerType === 'mouse' || e.pointerType === 'touch') {
                  e.currentTarget.releasePointerCapture(e.pointerId);
                }
                isDragging.current = true;
                dragMode.current = isSelected ? 'deselect' : 'select';
                onSetSelect(item.id, dragMode.current === 'select');
              }
            }}
            onPointerEnter={() => {
              if (isSelectMode && isDragging.current) {
                onSetSelect(item.id, dragMode.current === 'select');
              }
            }}
            onClick={() => {
              if (!isSelectMode) {
                onItemClick(index);
              }
            }}
            className={`relative group overflow-hidden rounded-2xl shadow-sm transition-all hover:shadow-md border block w-full h-full ${
              isSelected && isSelectMode 
                ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2' 
                : 'bg-stone-200 border-stone-200/50'
            }`}
          >
            {isSelectMode && (
              <div className="absolute top-3 right-3 z-20">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-blue-500 border-blue-500' : 'bg-black/20 border-white/80'
                }`}>
                  {isSelected && <Check size={14} className="text-white" />}
                </div>
              </div>
            )}
            
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full relative">
                <video
                  src={item.url}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  muted
                  playsInline
                  loop
                />
                {!isSelectMode && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors">
                    <div className="bg-white/90 rounded-full p-3 backdrop-blur-sm shadow-sm transition-transform group-hover:scale-110">
                      <Play className="w-6 h-6 text-stone-900 fill-current ml-0.5" />
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
              <div className="p-4 pt-8">
                <p className="text-white text-sm font-medium truncate text-left">{item.name}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
