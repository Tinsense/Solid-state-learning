import {lensDisplacement} from "./lensProfile";
const NS="http://www.w3.org/2000/svg";
type Lens={filter:SVGFilterElement;image:SVGFEImageElement;blur:SVGFEGaussianBlurElement;layer:HTMLSpanElement;shine:HTMLCanvasElement;key:string};
const svgNode=<K extends keyof SVGElementTagNameMap>(name:K,attrs:Record<string,string>={})=>{
 const node=document.createElementNS(NS,name);for(const [key,value]of Object.entries(attrs))node.setAttribute(key,value);return node;
};

/** Chromium samples the actual composited DOM backdrop, on the scroll compositor.
 * Safari accepts url() syntax but does not implement SVG backdrop displacement;
 * it therefore keeps the element-attached WebGL wallpaper fallback. */
export const supportsNativeBackdrop=()=>/Chrome\/|Chromium\/|Edg\//.test(navigator.userAgent)
 && !/CriOS|EdgiOS/.test(navigator.userAgent)&&CSS.supports("backdrop-filter","url(#glass-probe)");

export class NativeBackdrop {
 private svg=svgNode("svg",{"aria-hidden":"true",width:"0",height:"0"});
 private defs=svgNode("defs");private lenses=new Map<HTMLElement,Lens>();private sequence=0;private invalidated=false;
 constructor(){this.svg.classList.add("studio-glass-filter-defs");this.svg.append(this.defs);document.body.append(this.svg);}
 update(element:HTMLElement,width:number,height:number,radius:number,strength:number,range:number,filter:string){
  element.dataset.lensCoverage="full";
  let lens=this.lenses.get(element);
  if(!lens){
   const id=`studio-native-lens-${++this.sequence}`;
   const f=svgNode("filter",{id,x:"0",y:"0",width:"100%",height:"100%",filterUnits:"userSpaceOnUse",primitiveUnits:"userSpaceOnUse","color-interpolation-filters":"sRGB"});
   const image=svgNode("feImage",{result:"lens-map",preserveAspectRatio:"none"});
   const blur=svgNode("feGaussianBlur",{in:"bent-backdrop",stdDeviation:"0",edgeMode:"duplicate"});
   f.append(image,svgNode("feDisplacementMap",{in:"SourceGraphic",in2:"lens-map",result:"bent-backdrop",scale:String(strength*2),xChannelSelector:"R",yChannelSelector:"G"}),blur);
   const layer=document.createElement("span");layer.className="studio-glass-optics";layer.setAttribute("aria-hidden","true");
   const shine=document.createElement("canvas");shine.className="studio-glass-surface-canvas";layer.append(shine);element.append(layer);this.defs.append(f);
   lens={filter:f,image,blur,layer,shine,key:""};this.lenses.set(element,lens);
   element.dataset.refractionSource="dom-backdrop";
   element.style.setProperty("--glass-native-lens",`url("#${id}")`);
  }
  const material=filter==="none"?"":filter.replace(/url\([^)]*\)/g,"").trim();
  const blur=material.match(/blur\(([^)]+)\)/)?.[1];
  if(blur!==undefined)lens.blur.setAttribute("stdDeviation",String(Number.parseFloat(blur)||0));
  const blurRadius=Number(lens.blur.getAttribute("stdDeviation"))||0;
  // Coordinates are local border-box coordinates; they do not change on scroll.
  const key=[width,height,radius,strength,range,blurRadius].map(v=>v.toFixed(1)).join(":");
  if(lens.key!==key){
   lens.key=key;
   // Reserve encoding headroom for stronger corner bends; never clip channels.
   const mapStrength=strength*1.35+2;
   // A lens needs real backdrop beyond its border. Clipping its source there
   // makes Gaussian alpha fade and leaks the sharp, unfiltered scene through.
   const pad=Math.ceil(mapStrength+blurRadius*3+2),mapWidth=width+pad*2,mapHeight=height+pad*2;
   for(const node of [lens.filter,lens.image]){
    node.setAttribute("x",String(-pad));node.setAttribute("y",String(-pad));
    node.setAttribute("width",String(mapWidth));node.setAttribute("height",String(mapHeight));
   }
   lens.filter.querySelector("feDisplacementMap")!.setAttribute("scale",String(mapStrength*2));
   const scale=Math.min(1,512/mapWidth,2048/mapHeight),w=Math.max(1,Math.ceil(mapWidth*scale)),h=Math.max(1,Math.ceil(mapHeight*scale));
   const map=document.createElement("canvas");map.width=w;map.height=h;
   const ctx=map.getContext("2d")!,pixels=ctx.createImageData(w,h);
   const glow=lens.shine;glow.width=w;glow.height=h;const glowCtx=glow.getContext("2d")!,lights=glowCtx.createImageData(w,h);
   for(const [name,value]of Object.entries({left:`${-pad}px`,top:`${-pad}px`,width:`${mapWidth}px`,height:`${mapHeight}px`}))glow.style.setProperty(name,value,"important");
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const px=(x+.5)/scale-pad-width/2,py=(y+.5)/scale-pad-height/2;
    const qx=Math.abs(px)-width/2+radius,qy=Math.abs(py)-height/2+radius;
    const ox=Math.max(qx,0),oy=Math.max(qy,0),length=Math.hypot(ox,oy);
    const distance=Math.min(Math.max(qx,qy),0)+length-radius,depth=Math.max(0,-distance);
    let nx=length?ox/length:qx>qy?1:0,ny=length?oy/length:qy>=qx?1:0;
    nx*=Math.sign(px);ny*=Math.sign(py);
    const [displacementX,displacementY]=lensDisplacement(px,py,width,height,depth,strength,range,nx,ny);
    const offset=(y*w+x)*4;
    // Neutral value is 128/255, so compensate for its half-code bias in scale.
    pixels.data[offset]=Math.round(127.5+127.5*displacementX/mapStrength);
    pixels.data[offset+1]=Math.round(127.5+127.5*displacementY/mapStrength);
    pixels.data[offset+2]=128;pixels.data[offset+3]=255;
    const diagonal=Math.pow(Math.max(0,(-nx-ny)/Math.SQRT2),6);
    const far=Math.pow(Math.max(0,(nx+ny)/Math.SQRT2),8)*.13;
    const edge=Math.max(0,1-depth/1.6),coverage=Math.max(0,Math.min(1,.5-distance));
    lights.data[offset]=lights.data[offset+1]=lights.data[offset+2]=255;
    lights.data[offset+3]=Math.round(255*coverage*(.018*Math.pow(edge,2)+.16*(diagonal+far)*edge));
   }
   ctx.putImageData(pixels,0,0);lens.image.setAttribute("href",map.toDataURL());glowCtx.putImageData(lights,0,0);
  }
  element.style.setProperty("--glass-native-blur",lens.blur.getAttribute("stdDeviation")||"0");
  // One explicit Gaussian AFTER displacement. Do not additionally blur in CSS.
  element.style.setProperty("--glass-native-frost",material.replace(/blur\([^)]*\)/g,"").trim()||"brightness(1)");
  element.dataset.nativeLens="true";
 }
 retain(elements:Set<HTMLElement>){for(const [element,lens]of this.lenses)if(!elements.has(element)){
  lens.filter.remove();lens.layer.remove();element.style.removeProperty("--glass-native-lens");element.style.removeProperty("--glass-native-frost");element.style.removeProperty("--glass-native-blur");delete element.dataset.nativeLens;delete element.dataset.refractionSource;delete element.dataset.lensCoverage;this.lenses.delete(element);
 }}
 invalidate(){this.invalidated=true;}
 beginFrame(){if(this.invalidated){for(const element of this.lenses.keys())delete element.dataset.nativeLens;this.invalidated=false;}}
 dispose(){this.retain(new Set());this.svg.remove();}
}
