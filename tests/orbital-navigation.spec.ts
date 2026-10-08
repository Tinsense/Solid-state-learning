import {test,expect} from "@playwright/test";

test("切章保留背景与光学画布，点云轨道连续运行且没有加载页闪烁",async({page})=>{
  const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
  await page.goto("/?chapter=3");
  await expect(page.locator(".lattice-atmosphere")).toHaveAttribute("data-wallpaper-version","orbital-point-cloud-12");
  await page.evaluate(()=>{
    const w=window as unknown as {wallpaper:Element|null;glass:Element|null;loads:number};
    w.wallpaper=document.querySelector(".lattice-atmosphere");w.glass=document.querySelector(".studio-glass-shared-canvas");w.loads=0;
    new MutationObserver(()=>{if(document.body.textContent?.includes("正在载入本章课程"))w.loads++;}).observe(document.getElementById("root")!,{subtree:true,childList:true});
  });
  const select=async(chapter:number)=>{
    await page.getByRole("button",{name:/切换章节，当前/}).click();
    await page.getByRole("dialog").getByRole("link",{name:new RegExp(`^0?${chapter} `)}).click();
    await expect(page.getByRole("button",{name:new RegExp(`切换章节，当前第 ${chapter} 章`)})).toBeVisible();
    await page.waitForTimeout(280);
  };
  const before=Number(await page.locator(".lattice-atmosphere").getAttribute("data-orbit-time"));
  await select(6);await select(1);await select(3);
  const continuity=await page.evaluate(()=>{
    const w=window as unknown as {wallpaper:Element;glass:Element;loads:number};
    return {wallpaper:w.wallpaper===document.querySelector(".lattice-atmosphere"),glass:w.glass===document.querySelector(".studio-glass-shared-canvas"),loads:w.loads,
      time:Number((w.wallpaper as HTMLElement).dataset.orbitTime),rootName:getComputedStyle(document.documentElement).viewTransitionName,
      mainName:getComputedStyle(document.querySelector("main")!).viewTransitionName};
  });
  expect(continuity).toMatchObject({wallpaper:true,glass:true,loads:0,rootName:"none",mainName:"chapter-content"});
  expect(continuity.time).toBeGreaterThan(before);
  await page.goBack();await expect(page.getByRole("button",{name:/当前第 1 章/})).toBeVisible();
  await page.waitForTimeout(150);expect(errors).toEqual([]);
});

test("黑洞壁纸明暗主题均有点云、中心遮挡、动态冻结且无横向溢出",async({page})=>{
  await page.goto("/");
  const canvas=page.locator(".lattice-atmosphere");
  await expect(canvas).toHaveAttribute("data-wallpaper-loaded","true");
  await expect(page.locator(".hero-module")).toBeVisible();
  await page.waitForFunction(()=>Number(document.querySelector<HTMLElement>(".lattice-atmosphere")?.dataset.orbitTime)>.1);
  for(const theme of ["light","dark"]){
    await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
    await page.waitForTimeout(120);
    const pixels=await canvas.evaluate(el=>{
      const canvas=el as HTMLCanvasElement,c=canvas.getContext("2d")!;
      const [x,y,r]=JSON.parse(canvas.dataset.horizon!),scale=canvas.width/innerWidth;
      const data=c.getImageData(0,0,canvas.width,canvas.height).data;
      const plume=(side:number)=>{
        let total=0;
        const tilt=Number(canvas.dataset.orbitTilt);
        for(let i=0;i<16;i++)for(let j=0;j<12;j++){
          const u=side*r*(1.5+i*.04),v=r*(-.08+j*.018);
          const px=Math.round((x+u*Math.cos(tilt)-v*Math.sin(tilt))*scale);
          const py=Math.round((y+u*Math.sin(tilt)+v*Math.cos(tilt))*scale);
          const offset=(py*canvas.width+px)*4;
          total+=(data[offset]+data[offset+1]+data[offset+2])/3;
        }
        return total/192;
      };
      return {core:Array.from(c.getImageData(Math.round(x*scale),Math.round((y-r*.5)*scale),1,1).data),
        corner:Array.from(c.getImageData(0,0,1,1).data),time:Number(canvas.dataset.orbitTime),overflow:document.documentElement.scrollWidth-innerWidth,
        size:r/innerWidth,tilt:Number(canvas.dataset.orbitTilt),left:plume(-1),right:plume(1)};
    });
    expect(pixels.overflow).toBeLessThanOrEqual(1);
    expect(pixels.size).toBeLessThanOrEqual(page.viewportSize()!.width<700?.14:.09);
    expect(pixels.tilt).toBeCloseTo(-Math.PI/9);
    expect(pixels.core[0]).toBeLessThan(pixels.corner[0]);
    if(theme==="light"){
      expect(pixels.core[0]).toBeGreaterThan(210);
      expect(pixels.left).toBeLessThan(pixels.right);
      expect(255-pixels.right).toBeGreaterThan((255-pixels.left)*.6);
    }else{
      expect(pixels.core[0]).toBeLessThan(25);
      expect(pixels.left).toBeGreaterThan(pixels.right);
      expect(pixels.right).toBeGreaterThan(pixels.left*.6);
    }
  }
  await page.emulateMedia({reducedMotion:"reduce"});await page.waitForTimeout(120);
  const before=await canvas.getAttribute("data-orbit-time");await page.waitForTimeout(180);
  expect(await canvas.getAttribute("data-orbit-time")).toBe(before);
  await page.getByRole("button",{name:/切换章节，当前/}).click();
  await page.getByRole("dialog").getByRole("link",{name:/06.*自由电子气/}).click();
  await expect(page.getByTestId("chapter-hero-6")).toBeVisible();
  expect(await page.locator("main").evaluate(el=>el.getAnimations().length)).toBe(0);
});
