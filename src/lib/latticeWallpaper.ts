type Orbit = { radius:number; phase:number; thickness:number; speed:number; size:number; brightness:number };

/** Stylised orbital wallpaper, not a relativistic simulation. */
export function startLatticeWallpaper(canvas:HTMLCanvasElement) {
  const ctx=canvas.getContext("2d",{alpha:false});
  if(!ctx)return()=>{};
  const motion=matchMedia("(prefers-reduced-motion: reduce)");
  let width=0,height=0,frame=0,last=0,time=0,revision=0,disposed=false;
  let disk:Orbit[]=[],halo:Orbit[]=[];
  const grain=document.createElement("canvas");grain.width=grain.height=512;
  let pattern:CanvasPattern|null=null,grainTheme="";
  let seed=28109;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const orbits=(count:number,kind:"disk"|"halo"|"field")=>Array.from({length:count},()=>{
    const radius=kind==="disk"?1.02+Math.pow(random(),1.8)*5.2:kind==="halo"?1.02+Math.pow(random(),2.4)*.62:1.5+random()*10;
    return {radius,phase:random()*Math.PI*2,thickness:(random()+random()+random()-1.5),
      speed:(kind==="field"?.045:.54)/Math.pow(radius,1.5),size:.4+random()*.65,brightness:.35+random()*.65};
  });
  const resize=()=>{
    width=innerWidth;height=innerHeight;
    const dpr=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const compact=width<700;
    seed=28109;
    disk=orbits(compact?24000:40000,"disk");
    halo=orbits(compact?9500:16000,"halo");
    pattern=null;grainTheme="";
    canvas.dataset.particleCount=String(disk.length+halo.length+28000);
  };
  const draw=(stamp:number)=>{
    frame=0;if(disposed||document.hidden)return;
    // Prioritise drawer interaction over decorative point-cloud work.
    const interval=document.querySelector(".chapter-menu,.chapter-rail.is-open")?83:33;
    if(!motion.matches&&last&&stamp-last<interval){frame=requestAnimationFrame(draw);return;}
    if(!motion.matches&&last)time+=Math.min((stamp-last)/1000,.1);
    last=stamp;
    const t=motion.matches?0:time,light=document.documentElement.dataset.theme==="light",mobile=width<700;
    const cx=width*.51,cy=height*(mobile?.51:.53);
    const horizon=Math.min(width*(mobile?.135:.082),height*.145);
    const tilt=-Math.PI/9;
    const background=ctx.createLinearGradient(0,0,width,height);
    background.addColorStop(0,light?"#f1f3f4":"#141918");
    background.addColorStop(1,light?"#e7edf0":"#171c1a");
    ctx.fillStyle=background;ctx.fillRect(0,0,width,height);
    const dot=(x:number,y:number,point:Orbit,alpha:number)=>{
      if(x<0||x>width||y<0||y>height)return;
      ctx.globalAlpha=Math.max(0,Math.min(.8,alpha));
      ctx.fillRect(x,y,point.size,point.size);
    };
    // Dense, stable dust layer. Rotate its cached point texture around the
    // same centre, rather than re-randomising particles or drawing 150k dots.
    const theme=light?"light":"dark";
    if(grainTheme!==theme||!pattern){
      const g=grain.getContext("2d")!;g.clearRect(0,0,512,512);seed=81726;
      g.fillStyle=light?"#597082":"#d4d5bb";
      for(let i=0;i<28000;i++){
        g.globalAlpha=(light?.08:.18)+random()*(light?.25:.42);
        const size=.35+random()*.65;g.fillRect(random()*512,random()*512,size,size);
      }
      pattern=ctx.createPattern(grain,"repeat");grainTheme=theme;
    }
    ctx.save();ctx.translate(cx,cy);ctx.rotate(t*.008);
    ctx.globalAlpha=1;ctx.fillStyle=pattern!;
    const extent=Math.hypot(width,height);ctx.fillRect(-extent,-extent,extent*2,extent*2);ctx.restore();
    ctx.save();ctx.translate(cx,cy);ctx.rotate(tilt);ctx.translate(-cx,-cy);
    // Restrained local emission inside the dusty accretion plane, not a
    // fullscreen bloom. The left-hand plume follows the reference's light.
    ctx.save();ctx.translate(cx-horizon*1.3,cy+horizon*.07);ctx.scale(1,.13);
    const emission=ctx.createRadialGradient(0,0,0,0,0,horizon*3.6);
    emission.addColorStop(0,light?"rgba(66,88,104,.08)":"rgba(220,222,186,.25)");
    emission.addColorStop(.42,light?"rgba(66,88,104,.025)":"rgba(220,222,186,.09)");
    emission.addColorStop(1,"rgba(0,0,0,0)");ctx.fillStyle=emission;
    ctx.fillRect(-horizon*3.6,-horizon*3.6,horizon*7.2,horizon*7.2);ctx.restore();
    const drawDisk=(front:boolean)=>{
      ctx.fillStyle=light?"#435f70":"#f0efd0";
      for(const point of disk){
        const angle=point.phase+t*point.speed,depth=Math.sin(angle);
        if((depth>=0)!==front)continue;
        const sideAngle=Math.cos(angle),left=Math.max(0,-sideAngle);
        // An eccentric projected flow: the left plume is longer and thicker,
        // while the right stream is compressed. Smooth phase-dependent
        // factors keep each point moving continuously through the orbit.
        const ripple=1+.035*Math.sin(angle*3+point.radius*2.7-t*.18);
        const x=cx+sideAngle*point.radius*horizon*(.92-.20*sideAngle)*ripple;
        const y=cy+depth*point.radius*horizon*(.13+.035*left)
          +point.thickness*horizon*(.075+.075*left);
        const radial=Math.exp(-(point.radius-1.02)*.30);
        const side=.25+.75*Math.pow((1-sideAngle)*.5,1.35);
        const clump=.86+.14*Math.sin(angle*4+point.radius*1.6-t*.12);
        dot(x,y,point,(light?.43:.95)*point.brightness*radial*side*clump);
      }
    };
    drawDisk(false);
    // Bent far-side arc evokes lensing; the horizon occludes its lower half.
    ctx.fillStyle=light?"#536b79":"#d6dcc4";
    for(const point of halo){
      const angle=point.phase+t*point.speed;
      const x=cx+Math.cos(angle)*point.radius*horizon;
      const y=cy-Math.abs(Math.sin(angle))*point.radius*horizon*.91+point.thickness*horizon*.045;
      dot(x,y,point,(light?.38:.80)*point.brightness*Math.exp(-(point.radius-1.02)*2.2));
    }
    ctx.globalAlpha=1;
    // Pale negative-space core in light mode keeps black copy legible.
    ctx.fillStyle=light?"#e6ebee":"#101412";
    ctx.beginPath();ctx.arc(cx,cy,horizon,Math.PI,Math.PI*2);ctx.closePath();ctx.fill();
    drawDisk(true);
    ctx.restore();
    ctx.globalAlpha=1;
    canvas.dataset.wallpaperVersion="orbital-point-cloud-12";
    canvas.dataset.wallpaperLoaded="true";
    canvas.dataset.wallpaperFrame=String(++revision);
    canvas.dataset.orbitTime=t.toFixed(4);
    canvas.dataset.horizon=JSON.stringify([cx,cy,horizon]);
    canvas.dataset.orbitTilt=String(tilt);
    canvas.dataset.diskProfile="eccentric-left-plume";
    if(!motion.matches)frame=requestAnimationFrame(draw);
  };
  const refresh=()=>{cancelAnimationFrame(frame);last=0;frame=requestAnimationFrame(draw);};
  const onResize=()=>{resize();refresh();};
  const observer=new MutationObserver(refresh);
  observer.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
  addEventListener("resize",onResize,{passive:true});
  document.addEventListener("visibilitychange",refresh);
  motion.addEventListener("change",refresh);resize();refresh();
  return()=>{
    disposed=true;cancelAnimationFrame(frame);observer.disconnect();removeEventListener("resize",onResize);
    document.removeEventListener("visibilitychange",refresh);motion.removeEventListener("change",refresh);
  };
}
