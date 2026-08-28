import { useEffect } from "react";

type Aberration = readonly [number, number, number];

type LiquidGlassOptions = {
  borderRadius?: number;
  scale?: number;
  edgeWidth?: number;
  aberration?: Aberration;
  saturation?: number;
  fallbackFilter?: string;
};

type ResolvedOptions = Required<LiquidGlassOptions> & { width: number; height: number };

type FilterRefs = {
  svg: SVGSVGElement;
  filter: SVGFilterElement;
  image: SVGFEImageElement;
  channels: SVGElement[];
};

type LiquidGlassInstance = {
  active: boolean;
  destroy: () => void;
};

const SVG_NS = "http://www.w3.org/2000/svg";
const XLINK_NS = "http://www.w3.org/1999/xlink";
const SURFACE_SELECTOR = [
  ".site-header",
  ".chapter-rail",
  ".rail-item.is-active",
  ".liquid-panel",
  ".liquid-button",
  ".top-action"
].join(",");

const mapCache = new Map<string, string>();
let filterSequence = 0;

export const supportsOpticalGlass = typeof navigator !== "undefined"
  && /Chrom(?:e|ium)\//.test(navigator.userAgent)
  && typeof SVGFEImageElement !== "undefined";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Signed distance from a point to a centered rounded rectangle. */
function roundedRectDistance(x: number, y: number, width: number, height: number, radius: number) {
  const px = Math.abs(x - width / 2) - (width / 2 - radius);
  const py = Math.abs(y - height / 2) - (height / 2 - radius);
  return Math.hypot(Math.max(px, 0), Math.max(py, 0)) + Math.min(Math.max(px, py), 0) - radius;
}

/**
 * Builds a lens-normal field rather than a painted highlight. Neutral gray
 * leaves the center untouched; RGB offsets near the rounded edge bend the
 * sampled backdrop along the surface normal.
 */
function buildNormalMap(config: ResolvedOptions) {
  const padding = Math.max(18, Math.ceil(Math.abs(config.scale) * .52));
  const totalWidth = config.width + padding * 2;
  const totalHeight = config.height + padding * 2;
  const key = [config.width, config.height, config.borderRadius, config.scale, config.edgeWidth].join(":");
  const cached = mapCache.get(key);
  if (cached) return { uri: cached, padding };

  const canvas = document.createElement("canvas");
  canvas.width = totalWidth;
  canvas.height = totalHeight;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return { uri: "", padding };

  const pixels = context.createImageData(totalWidth, totalHeight);
  const data = pixels.data;
  const radius = clamp(config.borderRadius, 0, Math.min(config.width, config.height) / 2);

  for (let y = 0; y < totalHeight; y += 1) {
    for (let x = 0; x < totalWidth; x += 1) {
      const index = (y * totalWidth + x) * 4;
      const localX = x - padding;
      const localY = y - padding;
      const distance = roundedRectDistance(localX, localY, config.width, config.height, radius);

      let red = 128;
      let blue = 128;
      if (distance <= 0 && distance >= -config.edgeWidth) {
        const dx = roundedRectDistance(localX + .75, localY, config.width, config.height, radius)
          - roundedRectDistance(localX - .75, localY, config.width, config.height, radius);
        const dy = roundedRectDistance(localX, localY + .75, config.width, config.height, radius)
          - roundedRectDistance(localX, localY - .75, config.width, config.height, radius);
        const length = Math.hypot(dx, dy) || 1;
        const fresnel = 1 - smoothstep(0, config.edgeWidth, -distance);
        const profile = Math.pow(fresnel, 1.55);
        red = Math.round(clamp(128 + (dx / length) * 122 * profile, 0, 255));
        blue = Math.round(clamp(128 + (dy / length) * 122 * profile, 0, 255));
      }

      data[index] = red;
      data[index + 1] = 128;
      data[index + 2] = blue;
      data[index + 3] = 255;
    }
  }

  context.putImageData(pixels, 0, 0);
  const uri = canvas.toDataURL("image/png");
  if (mapCache.size >= 48) mapCache.delete(mapCache.keys().next().value as string);
  mapCache.set(key, uri);
  return { uri, padding };
}

function createSvgFilter(id: string): FilterRefs {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.style.cssText = "position:fixed;width:0;height:0;overflow:hidden;pointer-events:none";

  const defs = document.createElementNS(SVG_NS, "defs");
  const filter = document.createElementNS(SVG_NS, "filter");
  filter.id = id;
  filter.setAttribute("color-interpolation-filters", "sRGB");

  const image = document.createElementNS(SVG_NS, "feImage");
  image.setAttribute("result", "normalMap");
  image.setAttribute("preserveAspectRatio", "none");
  filter.append(image);

  const matrices = [
    "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
    "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
    "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
  ];
  const channels: SVGElement[] = [];

  matrices.forEach((matrix, index) => {
    const displacement = document.createElementNS(SVG_NS, "feDisplacementMap");
    displacement.setAttribute("in", "SourceGraphic");
    displacement.setAttribute("in2", "normalMap");
    displacement.setAttribute("xChannelSelector", "R");
    displacement.setAttribute("yChannelSelector", "B");
    displacement.setAttribute("result", `displaced-${index}`);
    filter.append(displacement);
    channels.push(displacement);

    const color = document.createElementNS(SVG_NS, "feColorMatrix");
    color.setAttribute("in", `displaced-${index}`);
    color.setAttribute("type", "matrix");
    color.setAttribute("values", matrix);
    color.setAttribute("result", `channel-${index}`);
    filter.append(color);
  });

  const redGreen = document.createElementNS(SVG_NS, "feBlend");
  redGreen.setAttribute("in", "channel-0");
  redGreen.setAttribute("in2", "channel-1");
  redGreen.setAttribute("mode", "screen");
  redGreen.setAttribute("result", "red-green");
  filter.append(redGreen);

  const output = document.createElementNS(SVG_NS, "feBlend");
  output.setAttribute("in", "red-green");
  output.setAttribute("in2", "channel-2");
  output.setAttribute("mode", "screen");
  filter.append(output);

  defs.append(filter);
  svg.append(defs);
  return { svg, filter, image, channels };
}

function resolveOptions(element: HTMLElement, options: LiquidGlassOptions): ResolvedOptions {
  const rect = element.getBoundingClientRect();
  const computedRadius = Number.parseFloat(getComputedStyle(element).borderRadius) || 18;
  return {
    width: Math.max(1, Math.round(rect.width)),
    height: Math.max(1, Math.round(rect.height)),
    borderRadius: options.borderRadius ?? computedRadius,
    scale: options.scale ?? -64,
    edgeWidth: options.edgeWidth ?? clamp(Math.min(rect.width, rect.height) * .22, 8, 24),
    aberration: options.aberration ?? [0, 4, 9],
    saturation: options.saturation ?? 1.18,
    fallbackFilter: options.fallbackFilter ?? "blur(22px) saturate(132%)"
  };
}

function configureFilter(config: ResolvedOptions, refs: FilterRefs) {
  const { uri, padding } = buildNormalMap(config);
  const xPadding = Math.ceil(padding / config.width * 100);
  const yPadding = Math.ceil(padding / config.height * 100);
  refs.filter.setAttribute("x", `-${xPadding}%`);
  refs.filter.setAttribute("y", `-${yPadding}%`);
  refs.filter.setAttribute("width", `${100 + xPadding * 2}%`);
  refs.filter.setAttribute("height", `${100 + yPadding * 2}%`);
  refs.image.setAttribute("href", uri);
  refs.image.setAttributeNS(XLINK_NS, "href", uri);
  refs.channels.forEach((channel, index) => channel.setAttribute("scale", String(config.scale + config.aberration[index])));
}

function surfaceOptions(element: HTMLElement): LiquidGlassOptions {
  if (element.classList.contains("site-header")) {
    return { scale: -46, edgeWidth: 16, aberration: [0, 3, 6], saturation: 1.16 };
  }
  if (element.classList.contains("chapter-rail")) {
    return { scale: -38, edgeWidth: 21, aberration: [0, 2, 4], saturation: 1.12 };
  }
  if (element.classList.contains("rail-item")) {
    return { scale: -48, edgeWidth: 11, aberration: [0, 2, 5], saturation: 1.14 };
  }
  if (element.classList.contains("search-panel")) {
    return { scale: -58, edgeWidth: 20, aberration: [0, 4, 8], saturation: 1.18 };
  }
  if (element.classList.contains("liquid-panel")) {
    return { scale: -54, edgeWidth: 14, aberration: [0, 3, 7], saturation: 1.16 };
  }
  return { scale: -70, edgeWidth: 10, aberration: [0, 5, 11], saturation: 1.2 };
}

function createLiquidGlass(element: HTMLElement, options: LiquidGlassOptions): LiquidGlassInstance {
  const previous = element.style.backdropFilter;
  const previousWebkit = element.style.getPropertyValue("-webkit-backdrop-filter");
  let resizeFrame = 0;
  let observer: ResizeObserver | undefined;

  if (!supportsOpticalGlass) {
    const fallback = options.fallbackFilter ?? "blur(22px) saturate(132%)";
    element.style.backdropFilter = fallback;
    element.style.setProperty("-webkit-backdrop-filter", fallback);
    element.dataset.liquidGlass = "frosted";
    return {
      active: false,
      destroy: () => {
        element.style.backdropFilter = previous;
        element.style.setProperty("-webkit-backdrop-filter", previousWebkit);
        delete element.dataset.liquidGlass;
      }
    };
  }

  const id = `optical-glass-${++filterSequence}`;
  const refs = createSvgFilter(id);
  document.body.append(refs.svg);

  const apply = () => {
    const config = resolveOptions(element, options);
    if (config.width <= 1 || config.height <= 1) return;
    configureFilter(config, refs);
    const filterValue = `url(#${id}) saturate(${config.saturation})`;
    element.style.backdropFilter = filterValue;
    element.style.setProperty("-webkit-backdrop-filter", filterValue);
    element.dataset.liquidGlass = "refractive";
  };

  apply();
  observer = new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(apply);
  });
  observer.observe(element);

  return {
    active: true,
    destroy: () => {
      observer?.disconnect();
      cancelAnimationFrame(resizeFrame);
      refs.svg.remove();
      element.style.backdropFilter = previous;
      element.style.setProperty("-webkit-backdrop-filter", previousWebkit);
      delete element.dataset.liquidGlass;
    }
  };
}

/** Mounts optical glass on persistent and conditionally rendered controls. */
export function useLiquidGlassSystem() {
  useEffect(() => {
    const instances = new Map<HTMLElement, LiquidGlassInstance>();
    let scanFrame = 0;

    const scan = () => {
      document.querySelectorAll<HTMLElement>(SURFACE_SELECTOR).forEach((element) => {
        if (!instances.has(element)) instances.set(element, createLiquidGlass(element, surfaceOptions(element)));
      });
      instances.forEach((instance, element) => {
        if (!element.isConnected || !element.matches(SURFACE_SELECTOR)) {
          instance.destroy();
          instances.delete(element);
        }
      });
      document.documentElement.dataset.glassEngine = supportsOpticalGlass ? "optical" : "frosted";
    };

    const scheduleScan = () => {
      cancelAnimationFrame(scanFrame);
      scanFrame = requestAnimationFrame(scan);
    };

    scan();
    const mutations = new MutationObserver(scheduleScan);
    mutations.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });

    return () => {
      mutations.disconnect();
      cancelAnimationFrame(scanFrame);
      instances.forEach((instance) => instance.destroy());
      instances.clear();
      delete document.documentElement.dataset.glassEngine;
    };
  }, []);
}
