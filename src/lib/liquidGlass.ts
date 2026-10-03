import { useEffect } from "react";
import { startGlassSystem } from "./glassEngine";

export function useLiquidGlassSystem() {
  useEffect(() => startGlassSystem(), []);
}
