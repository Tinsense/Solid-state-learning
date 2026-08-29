import { useEffect, useRef } from "react";

// BACKGROUND_VERSION: smaller-lattice-bigger-atoms-v5-2026-08-29
// Design goal: only a few lattice motifs, very large, rotation centers just outside viewport.

type Vec3 = [number, number, number];
type AtomKind = "Fe" | "Na" | "Cl" | "TM" | "O";

type Atom = {
  p: Vec3;
  kind: AtomKind;
  phase: number;
};

type Bond = {
  a: Vec3;
  b: Vec3;
  alpha: number;
};

type SceneBlock = {
  atoms: Atom[];
  bonds: Bond[];
  offsetX: number;
  offsetY: number;
  baseScale: number;
  rotX: number;
  rotY: number;
  speed: number;
};

const TAU = Math.PI * 2;

function rotateX([x, y, z]: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [x, y * c - z * s, y * s + z * c];
}

function rotateY([x, y, z]: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [x * c + z * s, y, -x * s + z * c];
}

function rotateZ([x, y, z]: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [x * c - y * s, x * s + y * c, z];
}

function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function makeNaFeCl4Block(): SceneBlock {
  const atoms: Atom[] = [];
  const bonds: Bond[] = [];
  let phase = 0;

  // Four FeCl4 tetrahedra only.
  const centers: Vec3[] = [
    [-0.92, -0.92, -0.72],
    [0.92, -0.92, 0.72],
    [-0.92, 0.92, 0.72],
    [0.92, 0.92, -0.72],
  ];

  const tetra: Vec3[] = [
    [0.58, 0.58, 0.58],
    [-0.58, -0.58, 0.58],
    [-0.58, 0.58, -0.58],
    [0.58, -0.58, -0.58],
  ];

  for (const fe of centers) {
    atoms.push({ p: fe, kind: "Fe", phase: phase++ * 0.39 });
    for (const d of tetra) {
      const cl = add(fe, d);
      atoms.push({ p: cl, kind: "Cl", phase: phase++ * 0.27 });
      bonds.push({ a: fe, b: cl, alpha: 0.78 });
    }
  }

  // Only three Na points: composition cue without clutter.
  const naSites: Vec3[] = [
    [0, 0, 0],
    [-1.72, 0.12, 0],
    [1.72, -0.12, 0],
  ];
  for (const p of naSites) atoms.push({ p, kind: "Na", phase: phase++ * 0.31 });

  return {
    atoms,
    bonds,
    // Center is only slightly outside the left edge.
    offsetX: -0.40,
    offsetY: 0.10,
    // Deliberately huge: only a partial crystal should be visible.
    baseScale: 2.04,
    rotX: -0.46,
    rotY: 0.84,
    speed: 0.00016,
  };
}

function makeO3Block(): SceneBlock {
  const atoms: Atom[] = [];
  const bonds: Bond[] = [];
  let phase = 0;

  // Four TM coordination motifs total: two in upper slab, two in lower slab.
  // This makes the layered character obvious without filling the whole right side.
  const tmSites: Vec3[] = [
    [-0.92, -0.48, -0.95],
    [0.92, 0.48, -0.95],
    [-0.62, 0.48, 0.95],
    [1.22, -0.48, 0.95],
  ];

  for (const tm of tmSites) {
    atoms.push({ p: tm, kind: "TM", phase: phase++ * 0.25 });

    // Four O around each TM, sparse octahedral suggestion rather than a dense full shell.
    const oxy: Vec3[] = [
      [tm[0] + 0.42, tm[1] + 0.28, tm[2] + 0.52],
      [tm[0] - 0.42, tm[1] - 0.28, tm[2] + 0.52],
      [tm[0] + 0.42, tm[1] - 0.28, tm[2] - 0.52],
      [tm[0] - 0.42, tm[1] + 0.28, tm[2] - 0.52],
    ];
    for (const o of oxy) {
      atoms.push({ p: o, kind: "O", phase: phase++ * 0.27 });
      bonds.push({ a: tm, b: o, alpha: 0.54 });
    }
  }

  // Sparse Na interlayer row.
  const naSites: Vec3[] = [
    [-0.90, 0, 0],
    [0.25, 0, 0],
    [1.35, 0, 0],
  ];
  for (const p of naSites) atoms.push({ p, kind: "Na", phase: phase++ * 0.33 });

  return {
    atoms,
    bonds,
    // Center only slightly outside the right edge.
    offsetX: 0.46,
    offsetY: -0.12,
    baseScale: 2.115,
    rotX: -0.34,
    rotY: -0.80,
    speed: -0.00013,
  };
}

function atomRadius(kind: AtomKind) {
  switch (kind) {
    case "Fe": return 13.2;
    case "TM": return 12.6;
    case "Na": return 9.8;
    case "Cl": return 8.4;
    case "O": return 7.6;
  }
}

function atomOpacity(kind: AtomKind, dark: boolean) {
  if (dark) {
    switch (kind) {
      case "Fe": return 0.96;
      case "TM": return 0.93;
      case "Na": return 0.72;
      case "Cl": return 0.52;
      case "O": return 0.44;
    }
  }
  switch (kind) {
    case "Fe": return 0.88;
    case "TM": return 0.84;
    case "Na": return 0.60;
    case "Cl": return 0.42;
    case "O": return 0.35;
  }
}

export function LatticeAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const blocks = [makeNaFeCl4Block(), makeO3Block()];

    let raf = 0;
    let width = 1;
    let height = 1;
    let dpr = 1;
    let dark = document.documentElement.dataset.theme === "dark";

    const themeObserver = new MutationObserver(() => {
      dark = document.documentElement.dataset.theme === "dark";
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const project = (p: Vec3, block: SceneBlock, t: number) => {
      const auto = t * block.speed;
      let q = rotateY(p, block.rotY + auto);
      q = rotateX(q, block.rotX + Math.sin(t * 0.00018) * 0.028);
      q = rotateZ(q, Math.sin(t * 0.0001) * 0.018);

      const short = Math.min(width, height);
      // Much larger than previous versions.
      const sceneScale = short * 0.145 * block.baseScale;
      const camera = 13.0;
      const perspective = camera / (camera - q[2] * 0.34);

      return {
        x: width * (0.5 + block.offsetX) + q[0] * sceneScale * perspective,
        y: height * (0.5 + block.offsetY) + q[1] * sceneScale * perspective,
        z: q[2],
        perspective,
      };
    };

    const drawBlock = (block: SceneBlock, t: number) => {
      const bondColor = dark ? "244,244,240" : "17,17,17";
      ctx.lineCap = "round";

      for (const bond of block.bonds) {
        const a = project(bond.a, block, t);
        const b = project(bond.b, block, t);
        ctx.strokeStyle = `rgba(${bondColor},${dark ? bond.alpha * 0.34 : bond.alpha * 0.29})`;
        ctx.lineWidth = 1.45 * ((a.perspective + b.perspective) * 0.5);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      const atomColor = dark ? "248,248,244" : "16,16,16";
      const rendered = block.atoms
        .map((atom) => ({ atom, p: project(atom.p, block, t) }))
        .sort((a, b) => a.p.z - b.p.z);

      for (const { atom, p } of rendered) {
        const pulse = 1 + Math.sin(t * 0.00125 + atom.phase) * 0.02;
        const r = atomRadius(atom.kind) * p.perspective * pulse;
        const alpha = atomOpacity(atom.kind, dark);

        ctx.fillStyle = `rgba(${atomColor},${alpha * 0.10})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 2.0, 0, TAU);
        ctx.fill();

        ctx.fillStyle = `rgba(${atomColor},${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, TAU);
        ctx.fill();
      }
    };

    const render = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      for (const block of blocks) drawBlock(block, t);
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
    };
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
