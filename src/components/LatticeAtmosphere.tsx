import { useEffect, useRef } from "react";

/** A (001) projection of an alternating ionic lattice, displaced by a transverse wave. */
export function LatticeAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let raf = 0;
    let lastFrame = -Infinity;
    let dark = document.documentElement.dataset.theme === "dark";

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = (time: number) => {
      if (time - lastFrame < 32 && !reducedMotion.matches) {
        raf = requestAnimationFrame(render);
        return;
      }
      lastFrame = time;
      ctx.clearRect(0, 0, width, height);
      const space = Math.max(52, Math.min(76, width / 8));
      const cols = Math.ceil(width / space) + 2;
      const rows = Math.ceil(height / space) + 2;
      const phase = reducedMotion.matches ? 0 : time * 0.00035;
      const ink = dark ? "226,232,239" : "32,45,60";
      const nodes: { x: number; y: number; strength: number; ion: number }[][] = [];

      for (let row = 0; row < rows; row++) {
        const line = [];
        for (let col = 0; col < cols; col++) {
          const baseX = (col - 1) * space;
          const baseY = (row - 1) * space;
          // A small transverse displacement makes the lattice's acoustic mode legible.
          const displacement = 7 * Math.sin(baseX * 0.010 - phase + row * 0.15);
          const x = baseX + 0.10 * baseY;
          const y = baseY + displacement;
          const edge = Math.abs(x - width / 2) / Math.max(width / 2, 1);
          const strength = Math.min(1, 0.28 + 0.65 * edge);
          line.push({ x, y, strength, ion: (row + col) % 2 });
        }
        nodes.push(line);
      }

      ctx.lineWidth = 0.8;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const node = nodes[row][col];
          ctx.strokeStyle = `rgba(${ink},${(dark ? 0.078 : 0.09) * node.strength})`;
          if (col + 1 < cols) {
            const next = nodes[row][col + 1];
            ctx.beginPath(); ctx.moveTo(node.x, node.y); ctx.lineTo(next.x, next.y); ctx.stroke();
          }
          if (row + 1 < rows) {
            const next = nodes[row + 1][col];
            ctx.beginPath(); ctx.moveTo(node.x, node.y); ctx.lineTo(next.x, next.y); ctx.stroke();
          }
        }
      }

      for (const line of nodes) for (const node of line) {
        const radius = node.ion ? 2.1 : 3.1;
        const alpha = (node.ion ? 0.31 : 0.47) * node.strength;
        ctx.fillStyle = `rgba(${ink},${alpha * 0.18})`;
        ctx.beginPath(); ctx.arc(node.x, node.y, radius * 2.6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(${ink},${alpha})`;
        ctx.beginPath(); ctx.arc(node.x, node.y, radius, 0, Math.PI * 2); ctx.fill();
      }

      if (!reducedMotion.matches) raf = requestAnimationFrame(render);
    };

    const refresh = () => { cancelAnimationFrame(raf); resize(); raf = requestAnimationFrame(render); };
    const themeObserver = new MutationObserver(() => {
      dark = document.documentElement.dataset.theme === "dark";
      refresh();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    window.addEventListener("resize", refresh);
    reducedMotion.addEventListener("change", refresh);
    refresh();

    return () => {
      cancelAnimationFrame(raf);
      themeObserver.disconnect();
      window.removeEventListener("resize", refresh);
      reducedMotion.removeEventListener("change", refresh);
    };
  }, []);

  return <canvas ref={canvasRef} className="lattice-atmosphere" aria-hidden="true" data-testid="lattice-atmosphere" />;
}
