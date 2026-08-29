import { useEffect } from "react";

/*
 * WebGL2 liquid-glass renderer adapted from Charles Yin's Liquid Glass Studio.
 * The original four-pass renderer and shader model are MIT licensed:
 * https://github.com/iyinchao/liquid-glass-studio
 *
 * This version keeps the same SDF -> Gaussian blur -> Snell refraction ->
 * RGB dispersion -> Fresnel/glare pipeline, but scopes each canvas to a UI
 * surface and uses RGBA8 framebuffers for wider Android GPU compatibility.
 */

const SURFACE_SELECTOR = [
  ".liquid-panel",
  ".hero-module",
  ".rail-item.is-active",
  ".editorial-table",
  ".site-header",
  ".chapter-rail",
  ".mobile-rail-toggle",
  ".liquid-button",
  ".top-action",
  ".segmented",
  ".derivation-controls",
  ".search-panel",
  ".section-header",
  ".content-section > .prose",
  ".feature-figure",
  ".formula-card",
  ".derivation",
  ".reading-callout",
  ".concept-check",
  ".unit-switch-panel",
  ".split-explanation",
  ".inverse-lab",
  ".knowledge-map",
  ".chapter-summary",
  ".exercise-card",
  ".completion-panel",
  ".source-note"
].join(",");

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = (a_position + 1.0) * 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const BACKGROUND_SHADER = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform vec2 u_resolution;
uniform vec2 u_origin;
uniform vec2 u_viewport;
uniform float u_dpr;
uniform float u_theme;
uniform float u_time;

void main() {
  vec2 cssPixel = gl_FragCoord.xy / u_dpr;
  vec2 cssSize = u_resolution / u_dpr;
  vec2 globalPixel = vec2(cssPixel.x + u_origin.x, u_origin.y + cssSize.y - cssPixel.y);

  float spacing = clamp(min(u_viewport.x, u_viewport.y) / 8.6, 58.0, 82.0);
  float t = u_time;
  vec2 wave = vec2(
    sin(globalPixel.y * 0.008 + t * 0.26) * 6.0,
    cos(globalPixel.x * 0.007 - t * 0.22) * 6.0
  );
  vec2 lattice = (globalPixel + wave) / spacing;
  vec2 cell = floor(lattice);
  vec2 latticePoint = (fract(lattice) - 0.5) * spacing;
  float distanceToPoint = length(latticePoint);
  float ionicParity = mod(cell.x + cell.y, 2.0);
  float pulse = 0.92 + 0.08 * sin(t * 0.48 + cell.x * 0.61 + cell.y * 0.43);
  float ionRadius = mix(2.0, 3.7, ionicParity) * pulse;
  float ion = 1.0 - smoothstep(ionRadius, ionRadius + 1.25, distanceToPoint);
  float halo = 1.0 - smoothstep(ionRadius + 1.0, ionRadius + mix(4.0, 7.0, ionicParity), distanceToPoint);

  float horizontalBond = 1.0 - smoothstep(0.28, 0.82, abs(latticePoint.y));
  float verticalBond = 1.0 - smoothstep(0.28, 0.82, abs(latticePoint.x));
  float bond = max(horizontalBond, verticalBond);
  float bondFade = smoothstep(ionRadius + 2.0, spacing * 0.42, distanceToPoint);
  bond *= bondFade;

  vec3 darkBase = vec3(0.006, 0.006, 0.007);
  vec3 lightBase = vec3(0.972, 0.974, 0.978);
  vec3 base = mix(darkBase, lightBase, u_theme);
  vec3 latticeColor = mix(vec3(0.86), vec3(0.08), u_theme);
  float ionStrength = mix(0.62, 0.88, ionicParity);
  base = mix(base, latticeColor, bond * mix(0.095, 0.075, u_theme));
  base = mix(base, latticeColor, halo * mix(0.035, 0.026, u_theme));
  base = mix(base, latticeColor, ion * ionStrength);

  float radial = 1.0 - smoothstep(0.0, length(u_viewport) * 0.72, length(globalPixel - u_viewport * vec2(0.50, 0.42)));
  base += mix(vec3(0.012), vec3(-0.018), u_theme) * radial;
  fragColor = vec4(base, 1.0);
}`;

const BLUR_SHADER = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform vec2 u_direction;

void main() {
  vec2 texel = u_direction / u_resolution;
  vec4 color = texture(u_texture, v_uv) * 0.227027;
  color += texture(u_texture, v_uv + texel * 1.384615) * 0.316216;
  color += texture(u_texture, v_uv - texel * 1.384615) * 0.316216;
  color += texture(u_texture, v_uv + texel * 3.230769) * 0.070270;
  color += texture(u_texture, v_uv - texel * 3.230769) * 0.070270;
  fragColor = color;
}`;

const MAIN_SHADER = `#version 300 es
precision highp float;
#define PI 3.14159265359
in vec2 v_uv;
out vec4 fragColor;
uniform sampler2D u_bg;
uniform sampler2D u_blurredBg;
uniform vec2 u_resolution;
uniform float u_dpr;
uniform float u_radius;
uniform float u_refThickness;
uniform float u_refFactor;
uniform float u_refStrength;
uniform float u_dispersion;
uniform float u_fresnel;
uniform float u_glare;
uniform float u_glareAngle;
uniform float u_theme;
uniform float u_press;

float safeAsin(float value) {
  return asin(clamp(value, -1.0, 1.0));
}

float roundedRectSDF(vec2 point, vec2 halfSize, float radius) {
  vec2 q = abs(point) - halfSize + radius;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - radius;
}

float glassSDF(vec2 cssPoint) {
  vec2 cssSize = u_resolution / u_dpr;
  vec2 halfSize = cssSize * 0.5 * u_press - vec2(1.0);
  float radius = min(u_radius, min(halfSize.x, halfSize.y));
  return roundedRectSDF(cssPoint - cssSize * 0.5, halfSize, radius);
}

vec2 surfaceNormal(vec2 cssPoint) {
  float epsilon = 0.65;
  float dx = glassSDF(cssPoint + vec2(epsilon, 0.0)) - glassSDF(cssPoint - vec2(epsilon, 0.0));
  float dy = glassSDF(cssPoint + vec2(0.0, epsilon)) - glassSDF(cssPoint - vec2(0.0, epsilon));
  return normalize(vec2(dx, dy) + vec2(0.00001));
}

vec4 dispersedSample(vec2 offset, float edgeBlur) {
  vec2 rOffset = offset * (1.0 - 0.02 * u_dispersion);
  vec2 bOffset = offset * (1.0 + 0.02 * u_dispersion);
  vec4 sharp;
  sharp.r = texture(u_bg, v_uv + rOffset).r;
  sharp.g = texture(u_bg, v_uv + offset).g;
  sharp.b = texture(u_bg, v_uv + bOffset).b;
  sharp.a = 1.0;
  vec4 blurred;
  blurred.r = texture(u_blurredBg, v_uv + rOffset).r;
  blurred.g = texture(u_blurredBg, v_uv + offset).g;
  blurred.b = texture(u_blurredBg, v_uv + bOffset).b;
  blurred.a = 1.0;
  return mix(sharp, blurred, edgeBlur);
}

void main() {
  vec2 cssPoint = gl_FragCoord.xy / u_dpr;
  vec2 cssSize = u_resolution / u_dpr;
  float distance = glassSDF(cssPoint);
  if (distance > 0.5) {
    fragColor = vec4(0.0);
    return;
  }

  float depth = max(-distance, 0.0);
  float ratio = clamp(1.0 - depth / u_refThickness, 0.0, 1.0);
  float thetaI = safeAsin(ratio * ratio);
  float thetaT = safeAsin(sin(thetaI) / u_refFactor);
  float edgeFactor = depth < u_refThickness ? max(0.0, -tan(thetaT - thetaI)) : 0.0;
  vec2 normal = surfaceNormal(cssPoint);
  vec2 offset = -normal * edgeFactor * u_refStrength / cssSize;
  vec2 sampleMargin = max(min(v_uv, 1.0 - v_uv) - 2.0 / u_resolution, vec2(0.0));
  offset = clamp(offset, -sampleMargin, sampleMargin);
  float edgeBlur = smoothstep(0.0, u_refThickness * 0.85, depth);
  vec4 refracted = dispersedSample(offset, mix(0.12, 0.72, edgeBlur));

  vec3 tint = mix(vec3(0.030), vec3(0.985), u_theme);
  refracted.rgb = mix(refracted.rgb, tint, 0.06);

  float fresnel = pow(clamp(1.08 - depth / max(7.0, u_refThickness * 0.78), 0.0, 1.0), 5.0);
  float rimChromatic = clamp(0.5 + 0.5 * normal.x, 0.0, 1.0);
  vec3 darkCoolRim = vec3(0.50, 0.70, 1.00);
  vec3 darkWarmRim = vec3(1.00, 0.78, 0.46);
  vec3 darkRim = mix(darkCoolRim, darkWarmRim, rimChromatic);
  vec3 fresnelTint = mix(darkRim, vec3(1.0), u_theme);
  refracted.rgb = mix(refracted.rgb, fresnelTint, fresnel * u_fresnel * mix(0.68, 0.30, u_theme));

  float normalAngle = atan(normal.y, normal.x);
  float facing = 0.5 + 0.5 * cos(normalAngle - u_glareAngle);
  float opposite = 0.5 + 0.5 * cos(normalAngle - u_glareAngle - PI);
  float directional = pow(max(facing, opposite * 0.28), 4.0);
  float glareMask = smoothstep(u_refThickness * 0.9, 0.0, depth);
  vec3 glareColor = mix(darkRim, vec3(1.0), u_theme);
  refracted.rgb = mix(refracted.rgb, glareColor, directional * glareMask * u_glare);

  float edgeAlpha = smoothstep(0.5, -1.25, distance);
  fragColor = vec4(refracted.rgb, edgeAlpha);
}`;

type ProgramInfo = {
  program: WebGLProgram;
  uniforms: Map<string, WebGLUniformLocation | null>;
};

type Target = {
  framebuffer: WebGLFramebuffer;
  texture: WebGLTexture;
};

type RenderState = {
  width: number;
  height: number;
  dpr: number;
  radius: number;
  originX: number;
  originY: number;
  viewportWidth: number;
  viewportHeight: number;
  time: number;
  light: boolean;
  glareAngle: number;
  press: number;
};

function compileProgram(gl: WebGL2RenderingContext, fragment: string): ProgramInfo {
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) throw new Error("Unable to create WebGL shader");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader) || "Unknown shader compilation error";
      gl.deleteShader(shader);
      throw new Error(message);
    }
    return shader;
  };

  const vertex = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
  const pixel = compile(gl.FRAGMENT_SHADER, fragment);
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create WebGL program");
  gl.attachShader(program, vertex);
  gl.attachShader(program, pixel);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(pixel);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) || "Unknown WebGL link error";
    gl.deleteProgram(program);
    throw new Error(message);
  }
  return { program, uniforms: new Map() };
}

function uniform(gl: WebGL2RenderingContext, info: ProgramInfo, name: string) {
  if (!info.uniforms.has(name)) info.uniforms.set(name, gl.getUniformLocation(info.program, name));
  return info.uniforms.get(name) ?? null;
}

function createTarget(gl: WebGL2RenderingContext, width: number, height: number): Target {
  const framebuffer = gl.createFramebuffer();
  const texture = gl.createTexture();
  if (!framebuffer || !texture) throw new Error("Unable to create WebGL framebuffer");
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    throw new Error("WebGL framebuffer is incomplete");
  }
  return { framebuffer, texture };
}

class StudioGlassRenderer {
  private gl: WebGL2RenderingContext;
  private vao: WebGLVertexArrayObject;
  private buffer: WebGLBuffer;
  private background: ProgramInfo;
  private blur: ProgramInfo;
  private main: ProgramInfo;
  private targets: Target[] = [];
  private width = 1;
  private height = 1;

  constructor(private canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: "high-performance"
    });
    if (!gl) throw new Error("WebGL2 is unavailable");
    this.gl = gl;
    this.background = compileProgram(gl, BACKGROUND_SHADER);
    this.blur = compileProgram(gl, BLUR_SHADER);
    this.main = compileProgram(gl, MAIN_SHADER);
    const vao = gl.createVertexArray();
    const buffer = gl.createBuffer();
    if (!vao || !buffer) throw new Error("Unable to create WebGL geometry");
    this.vao = vao;
    this.buffer = buffer;
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    [this.background, this.blur, this.main].forEach((info) => {
      const location = gl.getAttribLocation(info.program, "a_position");
      gl.useProgram(info.program);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    });
    gl.bindVertexArray(null);
  }

  private destroyTargets() {
    this.targets.forEach(({ framebuffer, texture }) => {
      this.gl.deleteFramebuffer(framebuffer);
      this.gl.deleteTexture(texture);
    });
    this.targets = [];
  }

  resize(width: number, height: number) {
    if (width === this.width && height === this.height && this.targets.length === 3) return;
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.destroyTargets();
    this.targets = Array.from({ length: 3 }, () => createTarget(this.gl, this.width, this.height));
  }

  private begin(info: ProgramInfo, target: Target | null) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, target?.framebuffer ?? null);
    gl.viewport(0, 0, this.width, this.height);
    gl.useProgram(info.program);
    gl.bindVertexArray(this.vao);
  }

  private bindTexture(info: ProgramInfo, name: string, texture: WebGLTexture, unit: number) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uniform(gl, info, name), unit);
  }

  private resolution(info: ProgramInfo) {
    this.gl.uniform2f(uniform(this.gl, info, "u_resolution"), this.width, this.height);
  }

  render(state: RenderState) {
    const gl = this.gl;
    const [backgroundTarget, verticalTarget, horizontalTarget] = this.targets;
    if (!backgroundTarget || !verticalTarget || !horizontalTarget) return;

    this.begin(this.background, backgroundTarget);
    this.resolution(this.background);
    gl.uniform2f(uniform(gl, this.background, "u_origin"), state.originX, state.originY);
    gl.uniform2f(uniform(gl, this.background, "u_viewport"), state.viewportWidth, state.viewportHeight);
    gl.uniform1f(uniform(gl, this.background, "u_dpr"), state.dpr);
    gl.uniform1f(uniform(gl, this.background, "u_theme"), state.light ? 1 : 0);
    gl.uniform1f(uniform(gl, this.background, "u_time"), state.time);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    this.begin(this.blur, verticalTarget);
    this.resolution(this.blur);
    this.bindTexture(this.blur, "u_texture", backgroundTarget.texture, 0);
    gl.uniform2f(uniform(gl, this.blur, "u_direction"), 0, 1);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    this.begin(this.blur, horizontalTarget);
    this.resolution(this.blur);
    this.bindTexture(this.blur, "u_texture", verticalTarget.texture, 0);
    gl.uniform2f(uniform(gl, this.blur, "u_direction"), 1, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    this.begin(this.main, null);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    this.resolution(this.main);
    this.bindTexture(this.main, "u_bg", backgroundTarget.texture, 0);
    this.bindTexture(this.main, "u_blurredBg", horizontalTarget.texture, 1);
    gl.uniform1f(uniform(gl, this.main, "u_dpr"), state.dpr);
    gl.uniform1f(uniform(gl, this.main, "u_radius"), state.radius);
    const darkGlass = !state.light;
    const refThickness = darkGlass
      ? Math.max(16, Math.min(28, state.height * 0.30))
      : Math.max(10, Math.min(20, state.height * 0.24));
    const refStrength = darkGlass
      ? Math.max(30, Math.min(62, state.height * 0.68))
      : Math.max(20, Math.min(44, state.height * 0.58));

    gl.uniform1f(uniform(gl, this.main, "u_refThickness"), refThickness);
    gl.uniform1f(uniform(gl, this.main, "u_refFactor"), darkGlass ? 1.46 : 1.4);
    gl.uniform1f(uniform(gl, this.main, "u_refStrength"), refStrength);
    gl.uniform1f(uniform(gl, this.main, "u_dispersion"), darkGlass ? 0.62 : 0.0);
    gl.uniform1f(uniform(gl, this.main, "u_fresnel"), darkGlass ? 0.86 : 0.10);
    gl.uniform1f(uniform(gl, this.main, "u_glare"), darkGlass ? 0.52 : 0.035);
gl.uniform1f(uniform(gl, this.main, "u_glareAngle"), state.glareAngle);
    gl.uniform1f(uniform(gl, this.main, "u_theme"), state.light ? 1 : 0);
    gl.uniform1f(uniform(gl, this.main, "u_press"), state.press);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  dispose() {
    const gl = this.gl;
    this.destroyTargets();
    [this.background, this.blur, this.main].forEach(({ program }) => gl.deleteProgram(program));
    gl.deleteBuffer(this.buffer);
    gl.deleteVertexArray(this.vao);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}

type SurfaceInstance = { destroy: () => void };

let supportCache: boolean | undefined;
export function supportsStudioGlass() {
  if (supportCache !== undefined) return supportCache;
  try {
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2");
    supportCache = Boolean(gl);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    supportCache = false;
  }
  return supportCache;
}

export function mountLatticeScene(canvas: HTMLCanvasElement) {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  let lastPaint = -Infinity;
  let stopped = false;

  if (!supportsStudioGlass()) {
    canvas.dataset.sceneEngine = "css-fallback";
    return () => { delete canvas.dataset.sceneEngine; };
  }

  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance"
  });
  if (!gl) {
    canvas.dataset.sceneEngine = "css-fallback";
    return () => { delete canvas.dataset.sceneEngine; };
  }

  const scene = compileProgram(gl, BACKGROUND_SHADER);
  const vao = gl.createVertexArray();
  const buffer = gl.createBuffer();
  if (!vao || !buffer) {
    canvas.dataset.sceneEngine = "css-fallback";
    return () => { delete canvas.dataset.sceneEngine; };
  }

  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const location = gl.getAttribLocation(scene.program, "a_position");
  gl.useProgram(scene.program);
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
  canvas.dataset.sceneEngine = "webgl2-shared-scene";

  const render = (timestamp: number) => {
    frame = 0;
    if (stopped) return;
    if (!motion.matches && timestamp - lastPaint < 40) {
      frame = requestAnimationFrame(render);
      return;
    }
    lastPaint = timestamp;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    const width = Math.max(1, Math.round(window.innerWidth * dpr));
    const height = Math.max(1, Math.round(window.innerHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    gl.viewport(0, 0, width, height);
    gl.useProgram(scene.program);
    gl.bindVertexArray(vao);
    gl.uniform2f(uniform(gl, scene, "u_resolution"), width, height);
    gl.uniform2f(uniform(gl, scene, "u_origin"), 0, 0);
    gl.uniform2f(uniform(gl, scene, "u_viewport"), window.innerWidth, window.innerHeight);
    gl.uniform1f(uniform(gl, scene, "u_dpr"), dpr);
    gl.uniform1f(uniform(gl, scene, "u_theme"), document.documentElement.dataset.theme === "light" ? 1 : 0);
    gl.uniform1f(uniform(gl, scene, "u_time"), motion.matches ? 0 : timestamp / 1000);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);

    if (!motion.matches) frame = requestAnimationFrame(render);
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };
  const theme = new MutationObserver(schedule);
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  window.addEventListener("resize", schedule, { passive: true });
  motion.addEventListener("change", schedule);
  schedule();

  return () => {
    stopped = true;
    cancelAnimationFrame(frame);
    theme.disconnect();
    window.removeEventListener("resize", schedule);
    motion.removeEventListener("change", schedule);
    gl.deleteProgram(scene.program);
    gl.deleteBuffer(buffer);
    gl.deleteVertexArray(vao);
    delete canvas.dataset.sceneEngine;
  };
}

function createSurface(element: HTMLElement): SurfaceInstance {
  const canvas = document.createElement("canvas");
  canvas.className = "studio-glass-canvas";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.display = "none";
  element.prepend(canvas);
  element.dataset.liquidGlass = "frosted";

  let renderer: StudioGlassRenderer | null = null;
  let frame = 0;
  let visible = false;
  let glareAngle = Math.PI * 0.25;
  let press = 1;
  let lastPaint = -Infinity;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const render = (timestamp: number) => {
    frame = 0;
    if (!visible || !renderer) return;
    if (!motion.matches && timestamp - lastPaint < 40) {
      frame = requestAnimationFrame(render);
      return;
    }
    lastPaint = timestamp;
    const rect = element.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    const maxDpr = rect.width * rect.height > 280_000 ? 1 : 1.35;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    const radius = Number.parseFloat(getComputedStyle(element).borderRadius) || 18;
    renderer.resize(width, height);
    renderer.render({
      width: rect.width,
      height: rect.height,
      dpr,
      radius,
      originX: rect.left,
      originY: rect.top,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      time: motion.matches ? 0 : timestamp / 1000,
      light: document.documentElement.dataset.theme === "light",
      glareAngle,
      press
    });
    if (!motion.matches) frame = requestAnimationFrame(render);
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };

  const activate = () => {
    if (renderer || !supportsStudioGlass()) return;
    try {
      renderer = new StudioGlassRenderer(canvas);
      canvas.style.removeProperty("display");
      element.dataset.liquidGlass = "webgl2-studio";
      element.dataset.sceneSource = "shared-lattice-field";
      schedule();
    } catch (error) {
      console.warn("Liquid Glass Studio WebGL2 fallback:", error);
      renderer = null;
      canvas.style.display = "none";
      element.dataset.liquidGlass = "frosted";
    }
  };

  const deactivate = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    renderer?.dispose();
    renderer = null;
    canvas.style.display = "none";
    canvas.width = 1;
    canvas.height = 1;
    element.dataset.liquidGlass = "frosted";
    delete element.dataset.sceneSource;
  };

  const intersection = new IntersectionObserver((entries) => {
    visible = Boolean(entries[0]?.isIntersecting);
    if (visible) activate();
    else deactivate();
  }, { rootMargin: "80px" });
  intersection.observe(element);

  const resize = new ResizeObserver(schedule);
  resize.observe(element);
  const theme = new MutationObserver(schedule);
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  motion.addEventListener("change", schedule);

  const onPointerMove = (event: PointerEvent) => {
    const rect = element.getBoundingClientRect();
    glareAngle = Math.atan2(rect.height * 0.5 - (event.clientY - rect.top), event.clientX - rect.left - rect.width * 0.5);
    schedule();
  };
  const onPointerDown = () => { press = 0.985; schedule(); };
  const onPointerUp = () => { press = 1; schedule(); };
  const onContextLost = (event: Event) => {
    event.preventDefault();
    cancelAnimationFrame(frame);
    frame = 0;
    renderer = null;
    canvas.style.display = "none";
    element.dataset.liquidGlass = "frosted";
    delete element.dataset.sceneSource;
  };
  element.addEventListener("pointermove", onPointerMove, { passive: true });
  element.addEventListener("pointerdown", onPointerDown, { passive: true });
  element.addEventListener("pointerup", onPointerUp, { passive: true });
  element.addEventListener("pointercancel", onPointerUp, { passive: true });
  canvas.addEventListener("webglcontextlost", onContextLost);
  window.addEventListener("scroll", schedule, { passive: true });

  return {
    destroy: () => {
      intersection.disconnect();
      resize.disconnect();
      theme.disconnect();
      motion.removeEventListener("change", schedule);
      cancelAnimationFrame(frame);
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerdown", onPointerDown);
      element.removeEventListener("pointerup", onPointerUp);
      element.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      window.removeEventListener("scroll", schedule);
      renderer?.dispose();
      canvas.remove();
      delete element.dataset.liquidGlass;
      delete element.dataset.sceneSource;
    }
  };
}

export function useLiquidGlassSystem() {
  useEffect(() => {
    const instances = new Map<HTMLElement, SurfaceInstance>();
    let scanFrame = 0;

    const scan = () => {
      document.querySelectorAll<HTMLElement>(SURFACE_SELECTOR).forEach((element) => {
        if (!instances.has(element)) instances.set(element, createSurface(element));
      });
      instances.forEach((instance, element) => {
        if (!element.isConnected || !element.matches(SURFACE_SELECTOR)) {
          instance.destroy();
          instances.delete(element);
        }
      });
      document.documentElement.dataset.glassEngine = supportsStudioGlass() ? "webgl2-studio" : "frosted";
    };

    const scheduleScan = () => {
      cancelAnimationFrame(scanFrame);
      scanFrame = requestAnimationFrame(scan);
    };

    scan();
    const mutations = new MutationObserver(scheduleScan);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      cancelAnimationFrame(scanFrame);
      instances.forEach((instance) => instance.destroy());
      instances.clear();
      delete document.documentElement.dataset.glassEngine;
    };
  }, []);
}

