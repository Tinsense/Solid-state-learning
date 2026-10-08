import {test,expect} from "@playwright/test";

test("顶部玻璃对实际 DOM 条纹产生位移，不只是采样壁纸",async({page})=>{
 await page.goto("/");await expect(page.locator(".hero-module")).toBeVisible();
 await page.evaluate(()=>{
  const scene=document.createElement("div");scene.id="dom-lens-scene";
  scene.style.cssText="position:fixed;left:10px;top:110px;width:300px;height:180px;z-index:9998;background:repeating-linear-gradient(90deg,#111 0 6px,#eee 6px 12px);pointer-events:none";
  scene.innerHTML='<span style="font-size:30px;color:red">ACTUAL DOM</span>';document.body.append(scene);
  const button=document.createElement("button");button.className="liquid-button";button.id="dom-lens-test";
  button.style.cssText="position:fixed;left:40px;top:140px;width:220px;height:90px;z-index:9999;--material-clear-frost:blur(0px);background:transparent!important";document.body.append(button);
 });
 const button=page.locator("#dom-lens-test");await expect(button).toHaveAttribute("data-refraction-source","dom-backdrop");
 await page.waitForTimeout(150);const bent=await page.screenshot();
 await button.evaluate(el=>(el as HTMLElement).style.setProperty("backdrop-filter","none","important"));
 const flat=await page.screenshot();
 const difference=await page.evaluate(async({bent,flat})=>{
  const decode=async(data:string)=>{const im=new Image();im.src="data:image/png;base64,"+data;await im.decode();const c=document.createElement("canvas");c.width=im.width;c.height=im.height;const ctx=c.getContext("2d")!;ctx.drawImage(im,0,0);return{ctx,scale:im.width/innerWidth};};
  const a=await decode(bent),b=await decode(flat);
  const region=(left:number,top:number,width:number,height:number)=>{
   const p=a.ctx.getImageData(Math.round(left*a.scale),Math.round(top*a.scale),Math.round(width*a.scale),Math.round(height*a.scale)).data;
   const q=b.ctx.getImageData(Math.round(left*b.scale),Math.round(top*b.scale),Math.round(width*b.scale),Math.round(height*b.scale)).data;
   let sum=0;for(let i=0;i<p.length;i+=4)sum+=Math.abs(p[i]-q[i]);return sum/(p.length/4);
  };
  return{edge:region(43,178,8,12),centre:region(115,178,30,12)};
 },{bent:bent.toString("base64"),flat:flat.toString("base64")});
 expect(difference.edge).toBeGreaterThan(30);expect(difference.centre).toBeLessThan(12);
});

test("即使渲染线程暂不更新，折射边界仍和按钮同层滚动",async({page})=>{
 await page.goto("/");const hero=page.locator(".hero-module");await expect(hero).toHaveAttribute("data-native-lens","true");
 await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.waitForTimeout(100);
 const error=await hero.evaluate(el=>{
  const a=el.getBoundingClientRect();window.scrollTo({top:180,behavior:"instant"});const b=el.getBoundingClientRect();
  const child=el.querySelector(":scope > .studio-glass-optics")!,c=child.getBoundingClientRect();
  const global=document.querySelector<HTMLCanvasElement>(".studio-glass-shared-canvas")!;
  return{motion:a.top-b.top,local:Math.max(Math.abs(c.left-b.left),Math.abs(c.top-b.top),Math.abs(c.width-b.width)),hidden:getComputedStyle(global).visibility,dom:b.toJSON(),optical:c.toJSON(),position:getComputedStyle(child).position};
 });
 expect(error.motion).toBeGreaterThan(100);expect(error.local).toBeLessThan(2);expect(error.hidden).toBe("hidden");
});

test("目录没有全屏前景折射，文字覆盖本地高光并遮挡正文透镜",async({page},testInfo)=>{
 test.skip(testInfo.project.name!=="mobile","手机目录");await page.goto("/?chapter=2");await expect(page.locator(".hero-module")).toBeVisible();await page.evaluate(()=>document.documentElement.dataset.theme="light");
 await page.getByRole("button",{name:"章节目录",exact:true}).click();
 const rail=page.locator(".chapter-rail.is-open");await expect(rail).toHaveAttribute("data-native-lens","true");
 const result=await rail.evaluate(el=>{
  const gl=document.querySelector(".studio-glass-shared-canvas")!;
  const optical=el.querySelector(".studio-glass-optics")!;
  const styles=getComputedStyle(optical);
  return{global:getComputedStyle(gl).visibility,localZ:styles.zIndex,clipped:styles.overflow,filter:getComputedStyle(el).backdropFilter,
   lenses:[...el.querySelectorAll(".rail-item .studio-glass-optics")].length,main:document.querySelector<HTMLElement>("main")!.inert};
 });
 expect(result).toMatchObject({global:"hidden",localZ:"-1",clipped:"hidden",lenses:0,main:true});expect(result.filter).toContain("url(");expect(result.filter).toContain("blur(20px)");
 await page.screenshot({path:`tmp/native-directory-${testInfo.project.name}.png`});
});

test("兼容路径保留真实壁纸折射，光学画布仍附着控件而非覆盖屏幕",async({browser})=>{
 // Exercise the WebGL fallback in Chromium with a non-Chromium UA. This
 // verifies our fallback implementation, not Safari engine compatibility.
 const context=await browser.newContext({viewport:{width:390,height:844},userAgent:"Mozilla/5.0 Version/18.0 Safari/605.1.15"});
 const page=await context.newPage();await page.goto("http://127.0.0.1:4173/");
 await expect(page.locator(".studio-glass-shared-canvas")).toHaveAttribute("data-presentation","element-attached");
 await expect(page.locator(".hero-module")).toHaveAttribute("data-refraction-source","wallpaper-fallback");
 const result=await page.locator(".hero-module").evaluate(el=>{
  const local=el.querySelector<HTMLCanvasElement>(":scope > .studio-glass-optics > canvas")!;
  const ctx=local.getContext("2d")!,data=ctx.getImageData(0,0,local.width,local.height).data;
  const host=local.parentElement!,r=host.getBoundingClientRect(),b=el.getBoundingClientRect();
  return{alpha:data.some((value,i)=>i%4===3&&value>20),error:Math.max(Math.abs(r.top-b.top),Math.abs(r.left-b.left)),hidden:getComputedStyle(document.querySelector(".studio-glass-shared-canvas")!).visibility};
 });
 expect(result.alpha).toBe(true);expect(result.error).toBeLessThan(2);expect(result.hidden).toBe("hidden");await context.close();
});
