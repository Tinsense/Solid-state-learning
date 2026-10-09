import {test,expect} from '@playwright/test';
import {lensDisplacement} from '../src/lib/lensProfile';

function ray(x:number,y:number,w:number,h:number,r:number,strength:number,range:number){
 const px=x-w*.5,py=y-h*.5,qx=Math.abs(px)-w*.5+r,qy=Math.abs(py)-h*.5+r;
 const ox=Math.max(qx,0),oy=Math.max(qy,0),length=Math.hypot(ox,oy);
 const distance=Math.min(Math.max(qx,qy),0)+length-r;
 const nx=(length?ox/length:qx>qy?1:0)*Math.sign(px),ny=(length?oy/length:qy>=qx?1:0)*Math.sign(py);
 const offset=lensDisplacement(px,py,w,h,Math.max(0,-distance),strength,range,nx,ny,r);
 return {x:x+offset[0],y:y+offset[1],distance};
}

test('圆角、内侧中轴及大卡片边缘的光线连续且不折返',()=>{
 for(const [w,h,r,strength,range] of [[980,576,44,48,38],[210,52,26,26,11],[360,680,36,32,28],[540,340,44,48,38]]){
  let minDet=Infinity,maxStep=0,minMargin=Infinity;
  for(let y=3;y<h-3;y+=3)for(let x=3;x<w-3;x+=3){
   const p=ray(x,y,w,h,r,strength,range);if(p.distance>-2)continue;
   const dx=ray(x+.1,y,w,h,r,strength,range),dy=ray(x,y+.1,w,h,r,strength,range);
   const ax=(dx.x-p.x)/.1,ay=(dx.y-p.y)/.1,bx=(dy.x-p.x)/.1,by=(dy.y-p.y)/.1;
   minDet=Math.min(minDet,ax*by-ay*bx);maxStep=Math.max(maxStep,Math.hypot(ax,ay),Math.hypot(bx,by));
   minMargin=Math.min(minMargin,p.x,w-p.x,p.y,h-p.y);
  }
  expect(minDet,`${w}x${h} ray field does not fold`).toBeGreaterThan(.1);
  expect(maxStep,`${w}x${h} no medial-axis seam`).toBeLessThan(1.6);
  expect(minMargin,`${w}x${h} no cropped backdrop samples`).toBeGreaterThan(0);
 }
});

test('真实DOM渐变在大卡片上下边缘没有反向跳变或纵向拉丝',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await page.evaluate(()=>{
  document.documentElement.dataset.theme='dark';
  const scene=document.createElement('div');scene.style.cssText='position:fixed;left:10px;top:100px;width:600px;height:400px;z-index:9998;background:linear-gradient(#000,#fff)';document.body.append(scene);
  const card=document.createElement('div');card.id='continuity-test';card.className='feature-figure';
  card.style.cssText='position:fixed;left:40px;top:130px;width:540px!important;height:340px;z-index:9999;margin:0;padding:0;border:0!important;background:transparent!important';document.body.append(card);
 });
 const card=page.locator('#continuity-test');await expect(card).toHaveAttribute('data-native-lens','true');
 const screenshot=await card.screenshot();
 const rows=await page.evaluate(async base64=>{
  const im=new Image();im.src='data:image/png;base64,'+base64;await im.decode();
  const canvas=document.createElement('canvas');canvas.width=im.width;canvas.height=im.height;const ctx=canvas.getContext('2d')!;ctx.drawImage(im,0,0);
  // Average a narrow central strip. This measures actual composited pixels,
  // including blur, transparency and any native filter boundary artefact.
  return Array.from({length:Math.floor(336/4)},(_,i)=>{
   const y=(2+i*4)*im.height/340,data=ctx.getImageData(Math.round(im.width*.48),Math.round(y),Math.round(im.width*.04),1).data;
   let total=0;for(let j=0;j<data.length;j+=4)total+=data[j];return total/(data.length/4);
  });
 },screenshot.toString('base64'));
 const steps=rows.slice(1).map((v,i)=>v-rows[i]);
 expect(Math.min(...steps),'no source-coordinate reversal at rim').toBeGreaterThanOrEqual(-1);
 expect(Math.max(...steps),'no sudden optical seam').toBeLessThan(8);
 expect(rows.at(-1)!-rows[0],'the source has not been replaced by a flat tint').toBeGreaterThan(150);
});
