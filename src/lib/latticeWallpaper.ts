import {diamondCell,hcpCell,type Atom,type Cell} from "./crystalCells";

/** Two crystal-cell geometries with illustrative ball-and-stick styling. */
export function startLatticeWallpaper(canvas:HTMLCanvasElement){
 const ctx=canvas.getContext("2d",{alpha:false});
 if(!ctx)return()=>{};
 const motion=matchMedia("(prefers-reduced-motion: reduce)");
 const cells=[diamondCell(),hcpCell()];
 let width=0,height=0,frame=0,last=-Infinity,revision=0;
 const resize=()=>{
  width=innerWidth;height=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,1.5);
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
  canvas.style.width=width+"px";canvas.style.height=height+"px";
  ctx.setTransform(dpr,0,0,dpr,0,0);
 };
 const crystal=(cell:Cell,cx:number,cy:number,size:number,yaw:number,tilt:number,roll:number,light:boolean)=>{
  const project=(p:Atom)=>{
   const x=p.x*Math.cos(yaw)+p.z*Math.sin(yaw),z=-p.x*Math.sin(yaw)+p.z*Math.cos(yaw);
   const y=p.y*Math.cos(tilt)-z*Math.sin(tilt),depth=p.y*Math.sin(tilt)+z*Math.cos(tilt);
   const scale=6/(6-depth);
   return {x:cx+(x*Math.cos(roll)-y*Math.sin(roll))*size*scale,y:cy+(x*Math.sin(roll)+y*Math.cos(roll))*size*scale,z:depth,scale,tone:p.tone};
  };
  const points=cell.atoms.map(project);
  type Mark={z:number;paint:()=>void};const marks:Mark[]=[];
  // Split rods to depth-sort them around the shaded spheres.
  const rod=(a:number,b:number,outline:boolean)=>{
   const start=cell.atoms[a],end=cell.atoms[b];
   for(let n=0;n<4;n++){
    const at=(t:number)=>project({x:start.x+(end.x-start.x)*t,y:start.y+(end.y-start.y)*t,z:start.z+(end.z-start.z)*t,tone:0});
    const p=at(n/4),q=at((n+1)/4);
    marks.push({z:(p.z+q.z)/2,paint:()=>{
     ctx.lineCap="round";
     ctx.lineWidth=outline?.7:Math.max(1.2,size*.008)*(p.scale+q.scale)/2;
     ctx.strokeStyle=outline?(light?"rgba(109,135,157,.23)":"rgba(176,195,208,.16)"):(light?"rgba(235,232,224,.9)":"rgba(156,176,190,.45)");
     ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
     if(!outline){ctx.lineWidth=.65;ctx.strokeStyle=light?"rgba(255,255,253,.68)":"rgba(223,231,232,.28)";ctx.stroke();}
    }});
   }
  };
  cell.frame.forEach(([a,b])=>rod(a,b,true));cell.bonds.forEach(([a,b])=>rod(a,b,false));
  for(const p of points)marks.push({z:p.z,paint:()=>{
   const r=cell.radius*size*p.scale;
   const fill=ctx.createRadialGradient(p.x-r*.34,p.y-r*.42,r*.02,p.x+r*.18,p.y+r*.18,r*1.25);
   const palette=p.tone?(light?["#fffdf4","#d5d2c7","#939d9f"]:["#d7d9d1","#8c979c","#465863"]):(light?["#e3eff4","#a1b8c8","#617e98"]:["#b5cbd6","#66859c","#304a60"]);
   fill.addColorStop(0,palette[0]);fill.addColorStop(.4,palette[1]);fill.addColorStop(1,palette[2]);
   ctx.fillStyle=fill;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();
  }});
  ctx.save();ctx.globalAlpha=light?.70:.48;
  marks.sort((a,b)=>a.z-b.z).forEach(mark=>mark.paint());ctx.restore();
 };
 const draw=(timestamp:number)=>{
  frame=0;if(document.hidden)return;
  if(!motion.matches&&timestamp-last<33){frame=requestAnimationFrame(draw);return;}
  last=timestamp;
  const light=document.documentElement.dataset.theme==="light",t=motion.matches?0:timestamp/1000;
  const mobile=width<700;
  ctx.fillStyle=light?"#e9edf0":"#101820";ctx.fillRect(0,0,width,height);
  // Broad blue-grey and ivory washes, no dots, waves or extra diagrams.
  for(const [x,y,r,color] of [
   [width*.04,height*.25,Math.max(width*.44,height*.55),light?"rgba(134,161,180,.40)":"rgba(71,105,131,.25)"],
   [width*.97,height*.78,Math.max(width*.4,height*.5),light?"rgba(207,199,182,.38)":"rgba(157,146,122,.12)"]
  ] as [number,number,number,string][]){
   const wash=ctx.createRadialGradient(x,y,0,x,y,r);wash.addColorStop(0,color);wash.addColorStop(1,"rgba(140,160,175,0)");
   ctx.fillStyle=wash;ctx.fillRect(0,0,width,height);
  }
  const size=mobile?Math.min(230,width*.59):Math.min(470,Math.max(270,width*.28));
  const orbitX=Math.sin(t*.026)*(mobile?7:18),orbitY=Math.cos(t*.023)*(mobile?12:24);
  crystal(cells[0],width*(mobile?.055:.085)+orbitX,height*.29+orbitY,size,.55+t*.045,-.24,-.17,light);
  crystal(cells[1],width*(mobile?.965:.935)-orbitX,height*.73-orbitY,size*.56,-.4-t*.037,.28,.17,light);
  // A central veil leaves a quiet reading zone without hiding edge objects.
  const quiet=ctx.createLinearGradient(0,0,width,0),base=light?"239,242,243":"16,24,32";
  quiet.addColorStop(0,`rgba(${base},0)`);quiet.addColorStop(.30,`rgba(${base},.28)`);
  quiet.addColorStop(.5,`rgba(${base},.76)`);quiet.addColorStop(.70,`rgba(${base},.28)`);quiet.addColorStop(1,`rgba(${base},0)`);
  ctx.fillStyle=quiet;ctx.fillRect(0,0,width,height);
  canvas.dataset.wallpaperVersion="crystal-duet-7";canvas.dataset.crystalCells="diamond,hcp";
  canvas.dataset.wallpaperFrame=String(++revision);
  if(!motion.matches)frame=requestAnimationFrame(draw);
 };
 const refresh=()=>{cancelAnimationFrame(frame);resize();last=-Infinity;frame=requestAnimationFrame(draw);};
 const observer=new MutationObserver(refresh);
 observer.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
 addEventListener("resize",refresh,{passive:true});document.addEventListener("visibilitychange",refresh);motion.addEventListener("change",refresh);refresh();
 return()=>{cancelAnimationFrame(frame);observer.disconnect();removeEventListener("resize",refresh);document.removeEventListener("visibilitychange",refresh);motion.removeEventListener("change",refresh);};
}
