"use client";
import React, { useEffect, useRef } from 'react';

// Helper for random agriculture-themed colors
const randomColors = (count: number) => {
  const palette = [
    "#22c55e", "#16a34a", "#4ade80", "#86efac",
    "#10b981", "#34d399", "#059669", "#047857",
    "#a3e635", "#84cc16", "#65a30d", "#14b8a6"
  ];
  return new Array(count)
    .fill(0)
    .map(() => palette[Math.floor(Math.random() * palette.length)]);
};

interface TubesBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  enableClickInteraction?: boolean;
}

export function TubesBackground({ 
  children, 
  className,
  enableClickInteraction = true 
}: TubesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let mounted = true;

    // Load threejs-components via script tag to avoid Turbopack ESM issues
    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = `
      import TubesCursor from 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js';
      
      const canvas = document.getElementById('tubes-canvas');
      if (canvas) {
        const app = TubesCursor(canvas, {
          tubes: {
            colors: ["#22c55e", "#16a34a", "#4ade80"],
            lights: {
              intensity: 200,
              colors: ["#22c55e", "#a3e635", "#10b981", "#34d399"]
            }
          }
        });
        window.__tubesApp = app;
      }
    `;
    document.head.appendChild(script);

    // Forward ALL mouse/pointer movements from the document to the canvas
    // so the tubes animation tracks the cursor even when content is on top
    const forwardMove = (e: PointerEvent | MouseEvent) => {
      const canvas = document.getElementById('tubes-canvas');
      if (!canvas) return;
      
      canvas.dispatchEvent(new PointerEvent('pointermove', {
        clientX: e.clientX,
        clientY: e.clientY,
        bubbles: false,
      }));
    };

    document.addEventListener('pointermove', forwardMove, { passive: true });

    return () => {
      mounted = false;
      document.removeEventListener('pointermove', forwardMove);
      try { document.head.removeChild(script); } catch {}
    };
  }, []);

  const handleClick = () => {
    if (!enableClickInteraction) return;
    
    const app = (window as any).__tubesApp;
    if (!app) return;

    const colors = randomColors(3);
    const lightsColors = randomColors(4);
    
    app.tubes.setColors(colors);
    app.tubes.setLightsColors(lightsColors);
  };

  return (
    <div 
      className={`relative w-full h-full min-h-screen overflow-hidden bg-black ${className || ''}`}
      onClick={handleClick}
    >
      <canvas 
        id="tubes-canvas"
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full block"
        style={{ touchAction: 'none' }}
      />
      
      {/* Content Overlay */}
      <div className="relative z-10 w-full h-full pointer-events-none">
        {children}
      </div>
    </div>
  );
}

export default TubesBackground;
