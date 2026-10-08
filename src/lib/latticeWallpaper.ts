import { diamondCell, hcpCell, type Atom, type Cell } from "./crystalCells";

type Ink = { frame: string; bond: string; node: string; alternate: string; wave: string };

/** Flat crystalline wallpaper: physically connected diamond/HCP cells, a
 * periodic lattice, and a travelling transverse displacement. No bloom. */
export function startLatticeWallpaper(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return () => {};
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const cells = [diamondCell(), hcpCell()];
  let width = 0, height = 0, frame = 0, last = -Infinity, revision = 0;

  const resize = () => {
    width = innerWidth; height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const planes = (light: boolean, t: number) => {
    const drift = Math.sin(t * .13) * Math.min(12, width * .02);
    const fills = light
      ? ["rgba(91,136,166,.10)", "rgba(78,130,162,.13)", "rgba(172,193,200,.12)"]
      : ["rgba(54,91,130,.28)", "rgba(52,103,139,.23)", "rgba(134,169,184,.12)"];
    const edge = light ? "rgba(73,111,140,.13)" : "rgba(164,202,220,.19)";
    const polygon = (points: [number, number][], fill: string) => {
      ctx.beginPath();
      points.forEach(([x, y], i) => i ? ctx.lineTo(x * width, y * height) : ctx.moveTo(x * width, y * height));
      ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
      ctx.lineWidth = .8; ctx.strokeStyle = edge; ctx.stroke();
    };
    const d = drift / Math.max(1, width);
    // Broad cleavage planes sit at the sides. The centre stays quiet for copy.
    polygon([[-.12,-.10],[.17+d,-.10],[.29+d,.21],[.12,.54],[-.12,.74]], fills[0]);
    polygon([[-.13,.41],[.13+d,.22],[.30,.44],[.07,.81],[-.13,.90]], fills[1]);
    polygon([[.85,-.11],[1.15,-.10],[1.13,.65],[.92-d,.48],[.77,.13]], fills[2]);
    polygon([[.92-d,.38],[1.14,.55],[1.09,1.12],[.76,1.12],[.72,.82]], fills[0]);
  };

  const lattice = (light: boolean, t: number) => {
    const step = width < 700 ? 64 : 78;
    const cols = width < 700 ? 3 : 5;
    const rows = Math.ceil(height / step) + 2;
    ctx.lineWidth = .8;
    ctx.strokeStyle = light ? "rgba(49,101,135,.17)" : "rgba(159,203,225,.24)";
    ctx.fillStyle = light ? "rgba(51,107,143,.34)" : "rgba(168,207,226,.48)";
    for (const side of [-1, 1]) for (let row = -1; row < rows; row++) {
      const direction = side < 0 ? 1 : -1;
      const anchor = side < 0 ? -step : width + step;
      const y = row * step;
      for (let col = 0; col < cols; col++) {
        const x = anchor + direction * (col * step + (row & 1) * step * .5);
        const wave = Math.sin(col * .65 + row * .31 - t * .34) * 3;
        ctx.globalAlpha = Math.max(.08, 1 - col * .24);
        if (col < cols - 1) {
          ctx.beginPath(); ctx.moveTo(x, y + wave);
          ctx.lineTo(x + direction * step, y + Math.sin((col + 1) * .65 + row * .31 - t * .34) * 3);
          ctx.stroke();
        }
        if (row < rows - 1) {
          ctx.beginPath(); ctx.moveTo(x, y + wave);
          const nextRowOffset = ((row + 1) & 1) - (row & 1);
          ctx.lineTo(x + direction * nextRowOffset * step * .5,
            y + step + Math.sin(col * .65 + (row + 1) * .31 - t * .34) * 3);
          ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(x, y + wave, col ? 1.8 : 2.5, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  };

  const phonon = (ink: Ink, t: number) => {
    const mobile = width < 700;
    for (let track = 0; track < 3; track++) {
      const baseline = height * .80 + track * (mobile ? 11 : 17);
      ctx.beginPath();
      for (let x = 0; x <= width + 5; x += 5) {
        const y = baseline + Math.sin(x * (mobile ? .017 : .010) - t * .28 + track * .43) * (mobile ? 9 : 15);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = ink.wave; ctx.globalAlpha = track === 0 ? .7 : .38;
      ctx.lineWidth = track === 0 ? 1.2 : .8; ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  const crystal = (cell: Cell, cx: number, cy: number, size: number, yaw: number, tilt: number, ink: Ink) => {
    const project = (atom: Atom) => {
      const x = atom.x * Math.cos(yaw) + atom.z * Math.sin(yaw);
      const z = -atom.x * Math.sin(yaw) + atom.z * Math.cos(yaw);
      return { x: cx + x * size, y: cy + (atom.y * Math.cos(tilt) - z * Math.sin(tilt)) * size, z, tone: atom.tone };
    };
    const points = cell.atoms.map(project);
    for (const [pairs, stroke, lineWidth] of [[cell.frame, ink.frame, .8], [cell.bonds, ink.bond, 1.25]] as const) {
      ctx.beginPath();
      for (const [a, b] of pairs) { ctx.moveTo(points[a].x, points[a].y); ctx.lineTo(points[b].x, points[b].y); }
      ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke();
    }
    points.sort((a, b) => a.z - b.z).forEach(point => {
      ctx.beginPath(); ctx.arc(point.x, point.y, 2.9 + Math.max(-.4, point.z * .35), 0, Math.PI * 2);
      ctx.fillStyle = point.tone ? ink.alternate : ink.node; ctx.fill();
    });
  };

  const draw = (timestamp: number) => {
    frame = 0; if (document.hidden) return;
    if (!motion.matches && timestamp - last < 33) { frame = requestAnimationFrame(draw); return; }
    last = timestamp;
    const light = document.documentElement.dataset.theme === "light";
    const mobile = width < 700, t = motion.matches ? 0 : timestamp / 1000;
    const ink: Ink = light
      ? { frame:"rgba(65,115,145,.25)", bond:"rgba(49,101,137,.49)", node:"#719bb4", alternate:"#bdaea0", wave:"rgba(48,102,137,.53)" }
      : { frame:"rgba(150,191,214,.29)", bond:"rgba(157,205,230,.66)", node:"#aacbdc", alternate:"#a8b8bb", wave:"rgba(165,207,227,.69)" };
    const background = ctx.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, light ? "#e5edf2" : "#172b3e");
    background.addColorStop(.46, light ? "#f0f3f5" : "#101c2b");
    background.addColorStop(1, light ? "#e8eef1" : "#1a2d3e");
    ctx.fillStyle = background; ctx.fillRect(0, 0, width, height);
    planes(light, t); lattice(light, t); phonon(ink, t);
    const size = mobile ? Math.min(142, width * .36) : Math.min(250, Math.max(170, width * .17));
    crystal(cells[0], width * (mobile ? -.04 : .075), height * .31, size, .57 + t * .032, -.27, ink);
    crystal(cells[1], width * (mobile ? 1.05 : .94), height * .67, size * .76, -.31 - t * .028, .29, ink);
    canvas.dataset.wallpaperVersion = "crystal-planes-11";
    canvas.dataset.crystalCells = "diamond,hcp";
    canvas.dataset.wallpaperLoaded = "true";
    canvas.dataset.wallpaperFrame = String(++revision);
    if (!motion.matches) frame = requestAnimationFrame(draw);
  };
  const refresh = () => { cancelAnimationFrame(frame); resize(); last = -Infinity; frame = requestAnimationFrame(draw); };
  const observer = new MutationObserver(refresh);
  observer.observe(document.documentElement, { attributes:true, attributeFilter:["data-theme"] });
  addEventListener("resize", refresh, { passive:true });
  document.addEventListener("visibilitychange", refresh);
  motion.addEventListener("change", refresh); refresh();
  return () => {
    cancelAnimationFrame(frame); observer.disconnect();
    removeEventListener("resize", refresh);
    document.removeEventListener("visibilitychange", refresh);
    motion.removeEventListener("change", refresh);
  };
}
