import {test,expect} from "@playwright/test";

test("玻璃章节菜单支持键盘、同页切章，侧栏只含本章目录",async({page})=>{
 await page.goto("/?chapter=3");
 const trigger=page.getByRole("button",{name:/切换章节，当前/});
 await trigger.click();
 const menu=page.getByRole("dialog",{name:"选择学习章节"});
 await expect(menu).toBeVisible();
 await expect(menu.locator("a")).toHaveCount(22);
 await expect(menu.locator('[aria-current="page"]')).toBeFocused();
 await expect(menu).toHaveAttribute("data-glass-layer","surface");
 await expect.poll(async()=>(await menu.boundingBox())!.x).toBeGreaterThanOrEqual(10);
 const triggerRect=await trigger.boundingBox(),brandRect=await page.locator(".brand").boundingBox();
 expect(triggerRect!.x+triggerRect!.width).toBeLessThanOrEqual(brandRect!.x+1);
 expect(await menu.evaluate(el=>getComputedStyle(el).backdropFilter)).toContain("blur(");
 const bounds=await menu.boundingBox();
 expect(bounds!.x).toBeGreaterThanOrEqual(10);
 expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width-10);
 await page.keyboard.press("End");
 await expect(menu.getByRole("link",{name:/22.*合金/})).toBeFocused();
 await page.keyboard.press("Escape");
 await expect(trigger).toBeFocused();
 expect(await page.locator("main").evaluate(el=>el.inert)).toBe(false);
 await expect(page.locator("#chapter-rail .chapter-picker,#chapter-rail select")).toHaveCount(0);
 await trigger.click();
 await menu.getByRole("link",{name:/06.*自由电子气/}).click();
 await expect(page).toHaveURL(/chapter=6/);
 await expect(page.getByTestId("chapter-hero-6")).toBeVisible();
});

test("壁纸真实变化，减少动态效果时冻结",async({page})=>{
 await page.goto("/");
 const canvas=page.locator("canvas.lattice-atmosphere");
 await expect(canvas).toHaveAttribute("data-wallpaper-version","crystal-duet-7");
 await expect(canvas).toHaveAttribute("data-crystal-cells","diamond,hcp");
 const sample=()=>canvas.evaluate(el=>{
  const canvas=el as HTMLCanvasElement;
  const data=canvas.getContext("2d")!.getImageData(0,0,canvas.width,canvas.height).data;
  let sum=0;for(let i=0;i<data.length;i+=116)sum=(sum*31+data[i])>>>0;return sum;
 });
 const a=await sample();await page.waitForTimeout(180);expect(await sample()).not.toBe(a);
 await page.emulateMedia({reducedMotion:"reduce"});await page.waitForTimeout(150);
 const b=await sample();await page.waitForTimeout(180);expect(await sample()).toBe(b);
});

test("总目录从左向右滑出，减少动态效果时直接打开",async({page})=>{
 await page.goto("/");
 await page.getByRole("button",{name:/切换章节，当前/}).click();
 const samples=await page.evaluate(async()=>{
  const points=[];
  for(let i=0;i<20;i++){
   await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
   const panel=document.querySelector<HTMLElement>(".chapter-menu")!,rect=panel.getBoundingClientRect();
   const gl=document.querySelector<HTMLCanvasElement>(".studio-glass-shared-canvas")!.getContext("webgl2")!,program=gl.getParameter(gl.CURRENT_PROGRAM);
   const count=gl.getUniform(program,gl.getUniformLocation(program,"u_count"));let error=Infinity;
   for(let n=0;n<count;n++)if(gl.getUniform(program,gl.getUniformLocation(program,`u_flags[${n}]`))===5){
    const r=gl.getUniform(program,gl.getUniformLocation(program,`u_rects[${n}]`));
    error=Math.max(Math.abs(r[0]-rect.x),Math.abs(r[1]-rect.y));
   }
   points.push({x:rect.x,error});
  }return points;
 });
 expect(samples[0].x).toBeLessThan(samples.at(-1)!.x-10);
 for(const point of samples)expect(point.error).toBeLessThan(.5);
 await page.keyboard.press("Escape");
 await expect(page.getByRole("dialog",{name:"选择学习章节"})).toHaveCount(0);
 await page.emulateMedia({reducedMotion:"reduce"});
 await page.getByRole("button",{name:/切换章节，当前/}).click();
 expect(await page.locator(".chapter-menu").evaluate(el=>getComputedStyle(el).animationName)).toBe("none");
});
