/** Shared rotating ionic lattice. Decorative geometry, not a dynamical simulation. */
export function startLatticeWallpaper(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", {alpha:false});
  if (!ctx) return () => {};
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let width=0,height=0,frame=0,last=-Infinity;
  const resize=()=>{
    width=innerWidth;height=innerHeight;
    const dpr=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    canvas.style.width=width+"px";canvas.style.height=height+"px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
  };
  const draw=(timestamp:number)=>{
    frame=0;
    if(document.hidden)return;
    if(!motion.matches&&timestamp-last<33){frame=requestAnimationFrame(draw);return;}
    last=timestamp;
    const light=document.documentElement.dataset.theme==="light";
    const time=motion.matches?0:timestamp/1000;
    ctx.fillStyle=light?"#f5f5f7":"#080b11";ctx.fillRect(0,0,width,height);
    // Broad, muted illumination makes scattering visible without a bright
    // rainbow behind the text. Fine lattice bonds reveal edge refraction.
    const hues=[210,157,276,27];
    for(let k=0;k<hues.length;k++){
      const phase=k*Math.PI*.5+time*.025;
      const x=width*(.5+.46*Math.cos(phase));
      const y=height*(.5+.4*Math.sin(phase));
      const glow=ctx.createRadialGradient(x,y,0,x,y,Math.max(width,height)*.65);
      glow.addColorStop(0,`hsla(${hues[k]},35%,${light?72:49}%,${light?.25:.15})`);
      glow.addColorStop(1,`hsla(${hues[k]},35%,50%,0)`);
      ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
    }
    const count=9,depth=3,step=Math.max(width/8,height/7);
    const yaw=.34+time*.035,tilt=.3+.12*Math.sin(time*.027),roll=-.16;
    const cy=Math.cos(yaw),sy=Math.sin(yaw),ct=Math.cos(tilt),st=Math.sin(tilt);
    const cr=Math.cos(roll),sr=Math.sin(roll),camera=step*16;
    type Node={x:number;y:number;z:number;scale:number;alpha:number;parity:number;hue:number};
    const nodes:Node[]=[];
    const index=(i:number,j:number,k:number)=>(k*count+j)*count+i;
    for(let k=0;k<depth;k++)for(let j=0;j<count;j++)for(let i=0;i<count;i++){
      const x0=(i-4)*step,y0=(j-4)*step,z0=(k-1)*step;
      const x1=x0*cy+z0*sy,z1=-x0*sy+z0*cy;
      const y1=y0*ct-z1*st,z=y0*st+z1*ct;
      const scale=camera/(camera-z);
      const x=width*.52+(x1*cr-y1*sr)*scale;
      const y=height*.51+(x1*sr+y1*cr)*scale;
      const edge=Math.min(1,Math.abs(x-width*.5)/(width*.5));
      nodes.push({x,y,z,scale,alpha:(.48+.3*edge)*Math.min(1.2,scale),parity:(i+j+k)%2,hue:hues[(i+2*j+k)%hues.length]});
    }
    const bonds:{a:Node;b:Node}[]=[];
    for(let k=0;k<depth;k++)for(let j=0;j<count;j++)for(let i=0;i<count;i++){
      const a=nodes[index(i,j,k)];
      if(i+1<count)bonds.push({a,b:nodes[index(i+1,j,k)]});
      if(j+1<count)bonds.push({a,b:nodes[index(i,j+1,k)]});
      if(k+1<depth)bonds.push({a,b:nodes[index(i,j,k+1)]});
    }
    bonds.sort((a,b)=>a.a.z+a.b.z-b.a.z-b.b.z);
    for(const {a,b} of bonds){
      ctx.strokeStyle=`hsla(${a.hue},20%,${light?40:76}%,${(a.alpha+b.alpha)*(light?.065:.075)})`;
      ctx.lineWidth=Math.max(.6,(a.scale+b.scale)*.4);
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
    }
    for(const p of [...nodes].sort((a,b)=>a.z-b.z)){
      const radius=(p.parity?3.3:5.1)*p.scale;
      if(p.x < -radius*3||p.x>width+radius*3||p.y < -radius*3||p.y>height+radius*3)continue;
      ctx.fillStyle=`hsla(${p.hue},30%,${light?44:74}%,${p.alpha*.055})`;
      ctx.beginPath();ctx.arc(p.x,p.y,radius*2.5,0,Math.PI*2);ctx.fill();
      const sphere=ctx.createRadialGradient(p.x-radius*.28,p.y-radius*.35,.1,p.x,p.y,radius);
      sphere.addColorStop(0,`hsla(${p.hue},25%,${light?73:88}%,${p.alpha*.78})`);
      sphere.addColorStop(1,`hsla(${p.hue},25%,${light?34:57}%,${p.alpha*.55})`);
      ctx.fillStyle=sphere;ctx.beginPath();ctx.arc(p.x,p.y,radius,0,Math.PI*2);ctx.fill();
    }
    // Sparse wavefronts leave the reading area calm; their movement also
    // makes the shared glass shader's refracted samples easy to compare.
    for(let k=0;k<3;k++){
      ctx.beginPath();
      for(let x=-10;x<=width+10;x+=8){
        const y=height*.54+k*29+49*Math.sin(x*.006-time*.22)+17*Math.sin(x*.012-time*.14);
        if(x===-10)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.strokeStyle=`hsla(${hues[k]},25%,${light?40:76}%,${light?.09:.12})`;
      ctx.lineWidth=k===1?1.6:.8;ctx.stroke();
    }
    canvas.dataset.wallpaperVersion="rotating-lattice-5";
    if(!motion.matches)frame=requestAnimationFrame(draw);
  };
  const refresh=()=>{cancelAnimationFrame(frame);resize();last=-Infinity;frame=requestAnimationFrame(draw);};
  const observer=new MutationObserver(refresh);
  observer.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
  addEventListener("resize",refresh,{passive:true});
  document.addEventListener("visibilitychange",refresh);
  motion.addEventListener("change",refresh);refresh();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();removeEventListener("resize",refresh);document.removeEventListener("visibilitychange",refresh);motion.removeEventListener("change",refresh);};
}
