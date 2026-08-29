import { useEffect, useRef } from "react";
import { mountLatticeScene } from "../lib/liquidGlass";

export function LatticeAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return mountLatticeScene(canvas);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="lattice-atmosphere"
      aria-hidden="true"
      data-testid="lattice-atmosphere"
    />
  );
}
