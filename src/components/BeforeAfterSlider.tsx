import { useState, useRef, useCallback } from "react";
import { MoveHorizontal } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
}

const BeforeAfterSlider = ({ beforeSrc, afterSrc, beforeLabel = "Antes", afterLabel = "Depois" }: BeforeAfterSliderProps) => {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const move = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100));
    setPosition(pct);
  }, []);

  const onMouseDown = () => { isDragging.current = true; };
  const onMouseMove = (e: React.MouseEvent) => { if (isDragging.current) move(e.clientX); };
  const onMouseUp = () => { isDragging.current = false; };

  const onTouchMove = (e: React.TouchEvent) => {
    move(e.touches[0].clientX);
  };

  return (
    <div
      ref={containerRef}
      className="ba-slider relative w-full aspect-[16/9] cursor-col-resize select-none shadow-2xl"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove}
    >
      {/* After (background) */}
      <img src={afterSrc} alt={afterLabel} className="absolute inset-0 w-full h-full object-cover" draggable={false} />

      {/* Before (clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
        <img src={beforeSrc} alt={beforeLabel} className="absolute inset-0 w-full h-full object-cover" style={{ minWidth: `${10000 / position}%`, left: 0 }} draggable={false} />
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded" style={{ opacity: position > 15 ? 1 : 0, transition: 'opacity 0.2s' }}>
        {beforeLabel}
      </div>
      <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur text-primary-foreground text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded" style={{ opacity: position < 85 ? 1 : 0, transition: 'opacity 0.2s' }}>
        {afterLabel}
      </div>

      {/* Divider */}
      <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" style={{ left: `${position}%` }}>
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-2xl flex items-center justify-center animate-glow-pulse border-2 border-primary">
          <MoveHorizontal className="w-5 h-5 text-primary" />
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
