import { useEffect, useRef } from "react";
import { startLatticeWallpaper } from "../lib/latticeWallpaper";

export function LatticeAtmosphere() {
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>ref.current?startLatticeWallpaper(ref.current):undefined,[]);
  return <canvas ref={ref} className="lattice-atmosphere" data-testid="lattice-atmosphere" aria-hidden="true"/>;
}
