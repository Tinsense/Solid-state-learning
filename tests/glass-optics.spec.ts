import { test, expect } from "@playwright/test";

test("卡片和按钮整面连续折射，圆角外保持透明", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".studio-glass-shared-canvas")).toHaveAttribute("data-optics-version", "crystal-glass-15");
  const result = await page.evaluate(() => {
    const live = document.querySelector<HTMLCanvasElement>(".studio-glass-shared-canvas")!.getContext("webgl2")!;
    const current = live.getParameter(live.CURRENT_PROGRAM) as WebGLProgram;
    const sources = live.getAttachedShaders(current)!.map(shader => ({
      type: live.getShaderParameter(shader, live.SHADER_TYPE) as number,
      source: live.getShaderSource(shader)!
    }));
    const canvas = document.createElement("canvas");
    canvas.width = 240; canvas.height = 220;
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: true, preserveDrawingBuffer: true })!;
    const program = gl.createProgram()!;
    for (const { type, source } of sources) {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader)!);
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program); gl.useProgram(program);
    const buffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const attribute = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(attribute); gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
    const texture = gl.createTexture()!; gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // Red encodes horizontal position, green vertical position. The returned
    // colour directly reveals which part of the scene the lens sampled.
    const pixels = new Uint8Array(240 * 220 * 4);
    for (let y=0;y<220;y++) for (let x=0;x<240;x++) {
      const index = (y * 240 + x) * 4;
      pixels[index] = Math.round(x / 239 * 255);
      pixels[index+1] = Math.round(y / 219 * 255);
      pixels[index+2] = 100; pixels[index+3] = 255;
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 240, 220, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    gl.generateMipmap(gl.TEXTURE_2D);
    const uniform = (name: string) => gl.getUniformLocation(program, name);
    gl.uniform2f(uniform("u_viewport"), 240, 220);
    gl.uniform1f(uniform("u_dpr"), 1); gl.uniform1i(uniform("u_count"), 1);
    gl.uniform4fv(uniform("u_rects[0]"), [40,40,160,140]);
    gl.uniform1f(uniform("u_radii[0]"), 30);
    gl.uniform4fv(uniform("u_optics[0]"), [12,8,1.4,1]);
    gl.uniform3fv(uniform("u_frost[0]"), [3,1,1]);
    gl.uniform1f(uniform("u_flags[0]"), 0);
    gl.uniform2f(uniform("u_pointer"), 120,110);
    gl.uniform1f(uniform("u_hasBackground"), 1);
    gl.uniform1f(uniform("u_theme"), 1);
    gl.uniform1i(uniform("u_background"), 0);
    gl.viewport(0,0,240,220);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    const sample = (x: number, y: number) => {
      const value = new Uint8Array(4);
      gl.readPixels(x,219-y,1,1,gl.RGBA,gl.UNSIGNED_BYTE,value);
      const alpha=value[3]/255;
      return { dx:alpha ? value[0]/255/alpha-(x+.5)/240 : 0,
        dy:alpha ? value[1]/255/alpha-(219-y+.5)/220 : 0, alpha };
    };
    const samples = {left:sample(41,110),right:sample(198,110),
      top:sample(120,41),bottom:sample(120,178),
      topLeft:sample(49,49),bottomRight:sample(190,170),
      centre:sample(120,110),outsideCorner:sample(42,42)};
    // Wider shoulders join a non-flat central lens without an alpha seam.
    gl.uniform4fv(uniform("u_optics[0]"), [26,22,1.4,1]);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    const shoulder = Array.from({length:24},(_,i)=>sample(42+i,110));
    gl.uniform1f(uniform("u_flags[0]"),3);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    const fullCentre=sample(120,110);
    gl.uniform1f(uniform("u_flags[0]"),0);
    // A high-frequency texture verifies the *rendered* rim is diffused,
    // rather than merely checking that the DOM has backdrop-filter set.
    for(let y=0;y<220;y++)for(let x=0;x<240;x++){
      const index=(y*240+x)*4;
      const grey=Math.round(128+110*Math.cos(x*Math.PI/4));
      pixels[index]=pixels[index+1]=pixels[index+2]=grey;
    }
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,240,220,0,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
    gl.generateMipmap(gl.TEXTURE_2D);
    const contrast=(blur:number)=>{
      gl.uniform3fv(uniform("u_frost[0]"),[blur,1,1]);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
      const grey=Array.from({length:60},(_,i)=>{
        const value=new Uint8Array(4);
        gl.readPixels(80+i,176,1,1,gl.RGBA,gl.UNSIGNED_BYTE,value);
        return value[3]?value[0]/value[3]:0;
      });
      return Math.max(...grey)-Math.min(...grey);
    };
    return {...samples,shoulder,fullCentre,clearContrast:contrast(0),frostedContrast:contrast(8)};
  });
  expect(result.left.dx).toBeLessThan(-.02);
  expect(result.right.dx).toBeGreaterThan(.02);
  expect(result.top.dy).toBeGreaterThan(.02);
  expect(result.bottom.dy).toBeLessThan(-.02);
  expect(result.topLeft.dx).toBeLessThan(-.01);
  expect(result.topLeft.dy).toBeGreaterThan(.01);
  expect(result.bottomRight.dx).toBeGreaterThan(.01);
  expect(result.bottomRight.dy).toBeLessThan(-.01);
  expect(result.centre.alpha).toBeGreaterThan(.8);
  expect(result.centre.dx).toBeGreaterThan(.003);
  expect(result.fullCentre.alpha).toBeGreaterThan(.8);
  expect(result.fullCentre.dx).toBeGreaterThan(.003);
  expect(result.outsideCorner.alpha).toBe(0);
  expect(result.shoulder.every(value=>value.alpha>.8)).toBe(true);
  expect(Math.max(...result.shoulder.slice(1).map((value,i)=>Math.abs(value.dx-result.shoulder[i].dx)))).toBeLessThan(.035);
  expect(result.frostedContrast).toBeLessThan(result.clearContrast*.45);
});

test("小控件全表面折射，同时保持统一的散射参数和不透明文字",async({page})=>{
  await page.goto("/");
  await expect(page.locator(".studio-glass-shared-canvas")).toHaveAttribute("data-optics-version","crystal-glass-15");
  for(const theme of ["light","dark"]){
    await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
    await page.waitForTimeout(120);
    const values=await page.evaluate(()=>{
      const gl=document.querySelector<HTMLCanvasElement>(".studio-glass-shared-canvas")!.getContext("webgl2")!;
      const p=gl.getParameter(gl.CURRENT_PROGRAM),count=gl.getUniform(p,gl.getUniformLocation(p,"u_count"));
      const button=document.querySelector<HTMLElement>(".chapter-menu-trigger")!;
      const rect=button.getBoundingClientRect();
      let match=-1;
      for(let i=0;i<count;i++){
        const shaderRect=gl.getUniform(p,gl.getUniformLocation(p,`u_rects[${i}]`));
        if(Math.abs(shaderRect[0]-rect.left)<.1&&Math.abs(shaderRect[1]-rect.top)<.1)match=i;
      }
      if(match<0)throw new Error("Header lens not rendered");
      return {frost:Array.from(gl.getUniform(p,gl.getUniformLocation(p,`u_frost[${match}]`)) as Float32Array),
        optics:Array.from(gl.getUniform(p,gl.getUniformLocation(p,`u_optics[${match}]`)) as Float32Array),
        filter:getComputedStyle(button).backdropFilter,height:rect.height};
    });
    expect(values.frost[0]).toBe(6);
    expect(values.filter).toContain("blur(6px)");
    expect(values.optics[0]).toBeGreaterThanOrEqual(26);
    expect(values.optics[1]).toBeGreaterThanOrEqual(10);
    expect(values.height-2*values.optics[1]).toBeGreaterThan(28);
  }
});
