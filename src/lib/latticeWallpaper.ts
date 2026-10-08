import { diamondCell, hcpCell, type Atom, type Cell } from "./crystalCells";

type Ink = { line: string; pale: string; strong: string; cream: string; blue: string; lilac: string };

/** Flat editorial crystal illustration. The atom/bond topology remains physical;
 * translucent planes, contours and stipple are decorative. */
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
  const wash = (x: number, y: number, r: number, color: string) => {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, color); gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };
  const contour = (cx: number, cy: number, rx: number, ry: number, ink: Ink, phase: number) => {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(phase * .12);
    for (let ring = 0; ring < 5; ring++) {
      ctx.beginPath();
      ctx.ellipse(0, 0, rx * (1 + ring * .13), ry * (1 + ring * .19), -.35, .12, Math.PI * 1.74);
      ctx.strokeStyle = ring % 2 ? ink.pale : ink.line;
      ctx.lineWidth = ring === 0 ? 1.1 : .7; ctx.stroke();
    }
    ctx.restore();
  };
  const crystal = (cell: Cell, cx: number, cy: number, size: number, yaw: number, tilt: number, ink: Ink, diamond: boolean) => {
    const project = (atom: Atom) => {
      const x = atom.x * Math.cos(yaw) + atom.z * Math.sin(yaw);
      const z = -atom.x * Math.sin(yaw) + atom.z * Math.cos(yaw);
      return { x: cx + x * size, y: cy + (atom.y * Math.cos(tilt) - z * Math.sin(tilt)) * size, z, tone: atom.tone };
    };
    const points = cell.atoms.map(project);
    // Coloured paper shape behind the accurate crystal line drawing.
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-.18);
    ctx.fillStyle = ink.pale; ctx.beginPath();
    ctx.moveTo(-size * .65, -size * .8);
    ctx.bezierCurveTo(size * .23, -size * 1.16, size * .83, -size * .57, size * .79, size * .17);
    ctx.bezierCurveTo(size * .69, size * .98, -size * .62, size * .95, -size * .83, size * .19);
    ctx.closePath(); ctx.fill(); ctx.restore();
    const drawBonds = (pairs: [number, number][], isFrame: boolean) => {
      ctx.beginPath();
      for (const [a, b] of pairs) { ctx.moveTo(points[a].x, points[a].y); ctx.lineTo(points[b].x, points[b].y); }
      ctx.strokeStyle = isFrame ? ink.pale : ink.line;
      ctx.lineWidth = isFrame ? .95 : 1.45; ctx.stroke();
    };
    drawBonds(cell.frame, true); drawBonds(cell.bonds, false);
    points.sort((a, b) => a.z - b.z).forEach((point, index) => {
      const r = (diamond ? 4.8 : 5.4) + Math.max(-.8, point.z * .6);
      ctx.beginPath(); ctx.arc(point.x, point.y, r + 3.8, 0, Math.PI * 2);
      ctx.fillStyle = ink.cream; ctx.fill();
      ctx.beginPath(); ctx.arc(point.x, point.y, r, 0, Math.PI * 2);
      ctx.fillStyle = point.tone ? ink.lilac : (index % 3 === 0 ? ink.strong : ink.blue);
      ctx.fill(); ctx.strokeStyle = ink.line; ctx.lineWidth = .9; ctx.stroke();
      // One flat cutout, not a spherical reflection.
      ctx.beginPath(); ctx.arc(point.x - r * .25, point.y - r * .25, .9, 0, Math.PI * 2);
      ctx.fillStyle = ink.cream; ctx.fill();
    });
    ctx.beginPath(); ctx.arc(cx, cy, size * (diamond ? .88 : 1.12), -.42, 2.54);
    ctx.strokeStyle = ink.pale; ctx.lineWidth = 1; ctx.stroke();
  };
  const stipple = (cx: number, cy: number, spread: number, ink: Ink, phase: number) => {
    ctx.fillStyle = ink.line;
    for (let row = -7; row <= 7; row++) for (let col = -7; col <= 7; col++) {
      const distance = Math.hypot(row, col);
      if (distance > 7.5 || (row * 7 + col * 11) % 6 === 0) continue;
      const x = cx + (col + row * .28) * spread + Math.sin(row * .8 + phase) * 2;
      const y = cy + row * spread * .68;
      ctx.globalAlpha = Math.max(.04, .25 - distance * .023);
      ctx.beginPath(); ctx.arc(x, y, distance < 3 ? 1.3 : .8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  };
  const bands = (ink: Ink, time: number) => {
    const baseline = height * .63;
    // Broad cut-paper swells add illustrated colour, not faux depth or spheres.
    for (let layer = 2; layer >= 0; layer--) {
      const offset = layer * 30;
      ctx.beginPath();
      ctx.moveTo(-20, baseline + offset - 48);
      for (let x = 0; x <= width + 16; x += 12) {
        const y = baseline + offset + Math.sin(x * .006 + time * .12 + layer * .38) * (18 + layer * 5);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width + 20, height + 20);
      ctx.lineTo(-20, height + 20);
      ctx.closePath();
      const light = document.documentElement.dataset.theme === "light";
      ctx.fillStyle = light
        ? ["rgba(164,185,210,.075)", "rgba(194,177,201,.075)", "rgba(193,207,195,.085)"][layer]
        : ["rgba(87,117,150,.11)", "rgba(123,98,133,.10)", "rgba(84,124,115,.10)"][layer];
      ctx.fill();
    }
    for (let line = 0; line < 5; line++) {
      ctx.beginPath();
      for (let x = 0; x <= width + 8; x += 8) {
        const y = baseline + line * 13 + Math.sin(x * .006 + time * .16 + line * .32) * (15 + line * 3);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.lineWidth = line === 1 ? 1.25 : .75;
      ctx.strokeStyle = line === 1 ? ink.line : ink.pale; ctx.stroke();
    }
  };
  const draw = (timestamp: number) => {
    frame = 0; if (document.hidden) return;
    if (!motion.matches && timestamp - last < 33) { frame = requestAnimationFrame(draw); return; }
    last = timestamp;
    const light = document.documentElement.dataset.theme === "light";
    const mobile = width < 700, t = motion.matches ? 0 : timestamp / 1000;
    const ink: Ink = light
      ? { line: "rgba(78,105,133,.46)", pale: "rgba(115,143,165,.21)", strong: "#718fa9", cream: "#f4f0e7", blue: "#a8c0ce", lilac: "#c9bacf" }
      : { line: "rgba(172,197,217,.48)", pale: "rgba(154,184,208,.19)", strong: "#91afc6", cream: "#263341", blue: "#7294ad", lilac: "#a99dbb" };
    ctx.fillStyle = light ? "#edf0f0" : "#121923"; ctx.fillRect(0, 0, width, height);
    wash(width * .07, height * .13, Math.max(width * .55, height * .45), light ? "rgba(174,196,213,.63)" : "rgba(71,101,132,.38)");
    wash(width * .95, height * .78, Math.max(width * .48, height * .55), light ? "rgba(215,196,186,.53)" : "rgba(126,103,126,.29)");
    wash(width * .55, height * .97, Math.max(width * .5, height * .3), light ? "rgba(200,210,191,.31)" : "rgba(88,112,103,.20)");
    wash(width * .94, height * .12, Math.max(width * .32, height * .31), light ? "rgba(194,188,212,.36)" : "rgba(119,103,142,.25)");
    wash(width * .04, height * .82, Math.max(width * .35, height * .31), light ? "rgba(177,204,192,.35)" : "rgba(79,122,111,.24)");
    bands(ink, t);
    contour(width * (mobile ? .12 : .08), height * .30, mobile ? 105 : 190, mobile ? 150 : 205, ink, t * .025);
    contour(width * (mobile ? .92 : .91), height * .72, mobile ? 90 : 155, mobile ? 115 : 180, ink, -t * .02);
    stipple(width * (mobile ? .01 : .13), height * .86, mobile ? 12 : 18, ink, t * .1);
    stipple(width * (mobile ? .95 : .89), height * .12, mobile ? 9 : 14, ink, -t * .08);
    const size = mobile ? Math.min(200, width * .53) : Math.min(330, Math.max(225, width * .22));
    crystal(cells[0], width * (mobile ? .06 : .09), height * .30, size, .58 + t * .038, -.30, ink, true);
    crystal(cells[1], width * (mobile ? .95 : .93), height * .73, size * .72, -.34 - t * .032, .30, ink, false);
    const quiet = ctx.createLinearGradient(0, 0, width, 0);
    const base = light ? "237,240,240" : "18,25,35";
    quiet.addColorStop(0, `rgba(${base},0)`);
    quiet.addColorStop(.34, `rgba(${base},.20)`);
    quiet.addColorStop(.5, `rgba(${base},.45)`);
    quiet.addColorStop(.66, `rgba(${base},.20)`);
    quiet.addColorStop(1, `rgba(${base},0)`);
    ctx.fillStyle = quiet; ctx.fillRect(0, 0, width, height);
    canvas.dataset.wallpaperVersion = "crystal-illustration-8";
    canvas.dataset.crystalCells = "diamond,hcp";
    canvas.dataset.wallpaperFrame = String(++revision);
    if (!motion.matches) frame = requestAnimationFrame(draw);
  };
  const refresh = () => { cancelAnimationFrame(frame); resize(); last = -Infinity; frame = requestAnimationFrame(draw); };
  const observer = new MutationObserver(refresh);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  addEventListener("resize", refresh, { passive: true });
  document.addEventListener("visibilitychange", refresh);
  motion.addEventListener("change", refresh); refresh();
  return () => {
    cancelAnimationFrame(frame); observer.disconnect();
    removeEventListener("resize", refresh);
    document.removeEventListener("visibilitychange", refresh);
    motion.removeEventListener("change", refresh);
  };
}
