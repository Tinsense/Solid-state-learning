import { useEffect, useRef } from "react";
import { mountCrystalScene } from "../lib/liquidGlass";

export function CrystalAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return mountCrystalScene(canvas);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="crystal-atmosphere"
      aria-hidden="true"
      data-testid="crystal-atmosphere"
    />
  );
}
