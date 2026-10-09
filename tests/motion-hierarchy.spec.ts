import { test, expect } from "@playwright/test";

test("减少动态效果时目录跳转不强制平滑滚动",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});
 await page.addInitScript(()=>{
  const original=Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView=function(options){
   (window as unknown as {scrollOptions:unknown}).scrollOptions=options;
   original.call(this,options);
  };
 });
 await page.goto("/?chapter=6");
 await page.getByRole("button",{name:/开始学习/}).click();
 expect(await page.evaluate(()=>(window as unknown as {scrollOptions:{behavior:string}}).scrollOptions.behavior)).toBe("auto");
});

test("阅读与推导只有一层主要玻璃，嵌套内容不再重复模糊",async({page})=>{
 await page.goto("/");
 const derivation=page.locator(".derivation").first();
 await expect(derivation).toHaveAttribute("data-glass-layer","surface");
 const inner=derivation.locator(".formula-card").first();
 await expect(inner).toHaveAttribute("data-glass-layer","embedded");
 for(const theme of ["dark","light"]){
  await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
  const css=await inner.evaluate(element=>{const s=getComputedStyle(element);return {blur:s.backdropFilter,shadow:s.boxShadow};});
  expect(css).toEqual({blur:"none",shadow:"none"});
 }
 expect(await page.locator('[data-glass-layer="surface"]').evaluateAll(elements=>elements.some(element=>!!element.parentElement?.closest('[data-glass-layer="surface"]')))).toBe(false);
});

test("连续滚动时整面背景透镜对齐，前景正文不参与位移",async({page})=>{
 await page.goto("/?chapter=6");
 const canvas=page.locator(".studio-glass-shared-canvas");
 await expect(canvas).toHaveAttribute("data-presentation","native-backdrop");
 await expect(page.locator(".hero-module")).toBeVisible();
 for(const reducedMotion of ["no-preference","reduce"] as const){
  await page.emulateMedia({reducedMotion});
  const frames=await page.evaluate(async()=>{
   const canvas=document.querySelector<HTMLCanvasElement>(".studio-glass-shared-canvas")!;
   const gl=canvas.getContext("webgl2")!;
   const samples=[];
   for(let step=0;step<24;step++){
    window.scrollTo({top:40+step*9,behavior:"instant"});
    await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
    const program=gl.getParameter(gl.CURRENT_PROGRAM);
    const count=gl.getUniform(program,gl.getUniformLocation(program,"u_count"));
    const rects=Array.from({length:count},(_,i)=>Array.from(gl.getUniform(program,gl.getUniformLocation(program,`u_rects[${i}]`)) as Float32Array)).flat();
    const optics=Array.from({length:count},(_,i)=>Array.from(gl.getUniform(program,gl.getUniformLocation(program,`u_optics[${i}]`)) as Float32Array)).flat();
    const hero=document.querySelector(".hero-module")!;
    const rect=hero.getBoundingClientRect();
    const expected=[rect.left,rect.top,rect.width,rect.height];
    let error=Infinity;
    const local=hero.querySelector(":scope > .studio-glass-optics")!.getBoundingClientRect();
    error=Math.max(...expected.map((value,j)=>Math.abs(value-[local.left,local.top,local.width,local.height][j])));
    samples.push({error,visibility:getComputedStyle(canvas).visibility,range:Math.max(...optics.filter((_,i)=>i%4===1)),y:rect.top});
   }
   return samples;
  });
  expect(frames.at(-1)!.y).toBeLessThan(frames[0].y-100);
  for(const sample of frames){
   expect(sample.visibility).toBe("hidden");
   expect(sample.error).toBeLessThan(.3);
   expect(sample.range).toBeLessThanOrEqual(page.viewportSize()!.width<=700?28:38);
  }
 }
 const values=await page.evaluate(()=>{
  const canvas=document.querySelector<HTMLCanvasElement>(".studio-glass-shared-canvas")!;
  const gl=canvas.getContext("webgl2")!;
  const program=gl.getParameter(gl.CURRENT_PROGRAM);
  const rects=gl.getUniform(program,gl.getUniformLocation(program,"u_rects[0]"));
  const header=document.querySelector(".chapter-menu-trigger")!.getBoundingClientRect();
  const bounds=canvas.getBoundingClientRect();
  return {shader:Array.from(rects as Float32Array).slice(0,4),dom:[header.left,header.top,header.width,header.height],origin:[bounds.left,bounds.top]};
 });
 expect(values.origin).toEqual([0,0]);
 values.dom.forEach((value,index)=>expect(values.shader[index]).toBeCloseTo(value,1));
});

test("手机目录锁定正文、支持关闭与焦点返回且不变暗",async({page},info)=>{
 test.skip(info.project.name!=="mobile","手机对话式目录");
 await page.goto("/?chapter=22");
 const trigger=page.getByRole("button",{name:"章节目录"});
 await trigger.click();
 const drawer=page.getByRole("dialog");
 await expect(drawer).toBeVisible();
 await expect(page.getByRole("button",{name:"关闭章节目录"})).toBeFocused();
 expect(await page.evaluate(()=>document.documentElement.style.overflowY)).toBe("hidden");
 expect(await page.locator("main").evaluate(element=>element.inert)).toBe(true);
 expect(await page.locator(".rail-scrim").evaluate(element=>getComputedStyle(element).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
 await page.keyboard.press("Escape");
 await expect(trigger).toHaveAttribute("aria-expanded","false");
 await expect(trigger).toBeFocused();
 expect(await page.locator("main").evaluate(element=>element.inert)).toBe(false);
 await trigger.click();
 await page.getByRole("button",{name:"关闭章节目录"}).click();
 await expect(trigger).toHaveAttribute("aria-expanded","false");
});
