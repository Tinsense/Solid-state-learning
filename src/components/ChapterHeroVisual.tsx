import { useState } from "react";
import { physicsModels } from "../content/physicsModels";

const latticePoints = Array.from({ length: 16 }, (_, i) => ({ x: 42 + (i % 4) * 72, y: 42 + Math.floor(i / 4) * 58 }));

function CrystalHero() {
  const [kind, setKind] = useState<"sc" | "bcc" | "fcc">("fcc");
  const extras = kind === "sc" ? [] : kind === "bcc" ? [{ x: 150, y: 130 }] : [{ x: 78, y: 71 }, { x: 222, y: 71 }, { x: 78, y: 187 }, { x: 222, y: 187 }];
  return <><svg viewBox="0 0 300 260" role="img" aria-label={`${kind.toUpperCase()} 晶格与基元重复`}>
    <g className="hero-cell-lines">{[0,1,2,3].map(i=><path key={`h${i}`} d={`M42 ${42+i*58}H258`}/>)}{[0,1,2,3].map(i=><path key={`v${i}`} d={`M${42+i*72} 42V216`}/>)}</g>
    {[...latticePoints,...extras].map((p,i)=><g className="hero-atom" key={i}><circle cx={p.x} cy={p.y} r="13"/><circle cx={p.x} cy={p.y} r="5"/></g>)}
    <path className="hero-vector" d="M42 236h72m-8-7 8 7-8 7"/><text x="120" y="241">a₁</text>
  </svg><div className="hero-visual-controls segmented" aria-label="选择立方格子">{(["sc","bcc","fcc"] as const).map(item=><button type="button" key={item} aria-pressed={kind===item} className={kind===item?"is-active":""} onClick={()=>setKind(item)}>{item.toUpperCase()}</button>)}</div><p>改变格点居中方式，观察“重复规则”本身如何变化。</p></>;
}

function DiffractionHero() {
  const [angle,setAngle]=useState(18);
  const theta=angle*Math.PI/180, cx=150, cy=126, r=90;
  return <><svg viewBox="0 0 300 260" role="img" aria-label="旋转晶体时 Ewald 圆扫过倒格点">
    <circle className="hero-ewald" cx={cx} cy={cy} r={r}/>
    {Array.from({length:35},(_,i)=>{const h=i%7-3,k=Math.floor(i/7)-2,x=60+h*34*Math.cos(theta)-k*34*Math.sin(theta),y=126+h*34*Math.sin(theta)+k*34*Math.cos(theta);const hit=Math.abs(Math.hypot(x-cx,y-cy)-r)<7;return <circle className={hit?"hero-reciprocal-hit":"hero-reciprocal-dot"} key={i} cx={x} cy={y} r={hit?6:3}/>})}
    <path className="hero-vector" d="M150 126H60m9-7-9 7 9 7"/><text x="96" y="117">k</text><text x="184" y="224">|k′|=|k|</text>
  </svg><label className="hero-visual-slider"><span>旋转晶体</span><b>{angle}°</b><input aria-label="晶体转角" type="range" min="-35" max="35" value={angle} onChange={e=>setAngle(Number(e.target.value))}/></label><p>圆周扫过倒格点时，几何允许的衍射反射出现。</p></>;
}

function VibrationHero() {
  const [mode,setMode]=useState<"acoustic"|"optical">("acoustic");
  const atoms=Array.from({length:7},(_,i)=>({x:34+i*39, shift: mode==="acoustic"?Math.sin(i*.75)*12:(i%2?12:-12)}));
  return <><svg viewBox="0 0 300 260" role="img" aria-label={`${mode==="acoustic"?"声学":"光学"}晶格振动模式`}>
    <path className="hero-equilibrium" d="M25 130H275"/>{atoms.slice(0,-1).map((atom,i)=><path className="hero-spring" key={i} d={`M${atom.x+atom.shift} 130 L${atoms[i+1].x+atoms[i+1].shift} 130`}/>)}
    {atoms.map((atom,i)=><g className={`hero-atom ${mode==="optical"&&i%2?"is-secondary":""}`} key={i}><circle cx={atom.x+atom.shift} cy="130" r={i%2?13:9}/><path className="hero-motion" d={`M${atom.x} ${174+(i%2)*22}v${atom.shift/2}`}/></g>)}
    <path className="hero-wave" d="M24 74c42-42 74 42 116 0s74-42 136 0"/><text x="25" y="224">ω(K) · dω/dK = v_g</text>
  </svg><div className="hero-visual-controls segmented"><button type="button" aria-pressed={mode==="acoustic"} className={mode==="acoustic"?"is-active":""} onClick={()=>setMode("acoustic")}>声学支</button><button type="button" aria-pressed={mode==="optical"} className={mode==="optical"?"is-active":""} onClick={()=>setMode("optical")}>光学支</button></div><p>{mode==="acoustic"?"长波时相邻原子近乎同相，频率从零起步。":"两类原子反相振动，K=0 仍可具有有限频率。"}</p></>;
}

function ThermalHero() {
  const [temperature,setTemperature]=useState(.32);
  const bars=Array.from({length:11},(_,i)=>{const x=(i+1)/11,occupation=1/(Math.exp(x/temperature*2.4)-1);return Math.min(125,occupation*45)});
  return <><svg viewBox="0 0 300 260" role="img" aria-label="温度改变声子谱的热占据">
    <path className="hero-axis" d="M30 32v174h245"/>{bars.map((height,i)=><rect className="hero-spectrum-bar" key={i} x={43+i*20} y={206-height} width="12" height={height}/>)}
    <path className="hero-dos" d="M32 206 C88 205 102 178 128 132 S196 45 270 38"/><text x="38" y="24">D(ω) · n̄(ω,T)</text><text x="247" y="226">ω</text>
  </svg><label className="hero-visual-slider"><span>约化温度 T/ΘD</span><b>{temperature.toFixed(2)}</b><input aria-label="约化温度" type="range" min=".08" max="1" step=".01" value={temperature} onChange={e=>setTemperature(Number(e.target.value))}/></label><p>升温会逐步解冻更高频的声子模，而不是同时激活全部自由度。</p></>;
}

function FermiHero() {
  const [temperature, setTemperature] = useState(.12);
  const occupancy = (x: number) => 1 / (Math.exp((x - 1) / temperature) + 1);
  const curve = Array.from({ length: 80 }, (_, index) => {
    const energy = index / 79 * 2;
    return `${30 + energy * 120},${208 - occupancy(energy) * 150}`;
  }).join(" ");
  return <><svg viewBox="0 0 300 260" role="img" aria-label="温度升高时费米能附近的占据阶跃变宽">
    <path className="hero-axis" d="M30 35v173h244"/>
    <line className="hero-equilibrium" x1="150" y1="45" x2="150" y2="209"/>
    <polyline className="hero-dos" points={curve} fill="none"/>
    <circle className="hero-reciprocal-hit" cx="150" cy="133" r="5"/>
    <text x="154" y="231">E / E<tspan baselineShift="sub" fontSize="10">F</tspan></text>
    <text x="36" y="28">f(E)</text><text x="153" y="54">f=½</text>
  </svg><label className="hero-visual-slider"><span>约化温度 T/T<sub>F</sub></span><b>{temperature.toFixed(2)}</b><input aria-label="费米气体约化温度" type="range" min=".02" max=".4" step=".01" value={temperature} onChange={event=>setTemperature(Number(event.target.value))}/></label><p>封面示意固定 μ≈E<sub>F</sub>；下方实验会重新求 μ 以严格保持电子数。</p></>;
}

function PhysicsHero({ chapter }: { chapter: number }) {
  const data=physicsModels[chapter][0];
  const [value,setValue]=useState(data.controls[0].initial);
  const parameters=data.controls.map((item,i)=>i===0?value:item.initial);
  const samples=Array.from({length:101},(_,i)=>{
    const x=data.domain[0]+(data.domain[1]-data.domain[0])*i/100;
    return data.series[0].evaluate(x,parameters);
  });
  const min=Math.min(...samples),span=Math.max(1e-9,Math.max(...samples)-min);
  return <><svg viewBox="0 0 300 260" role="img" aria-label={data.title}><path className="hero-axis" d="M30 35v173h240"/><polyline className="hero-dos" fill="none" points={samples.map((y,i)=>(30+i*2.4)+","+(208-(y-min)/span*150)).join(" ")}/><text x="30" y="25">{data.yLabel}</text><text x="30" y="232">{data.xLabel}</text></svg>
    <label className="hero-visual-slider"><span>{data.controls[0].label}</span><b>{value.toFixed(2)}</b><input type="range" aria-label={data.controls[0].label} min={data.controls[0].min} max={data.controls[0].max} step={data.controls[0].step} value={value} onChange={event=>setValue(Number(event.target.value))}/></label>
    <p>{data.title}；完整假设、单位与第二条实验见本章正文。</p></>;
}
export function ChapterHeroVisual({ chapter }: { chapter: number }) {
  if(chapter>=7)return <div className={"chapter-hero-visual chapter-hero-visual--"+chapter} data-testid={"chapter-hero-"+chapter}><span className="overline">PHYSICS IN MOTION</span><PhysicsHero chapter={chapter}/></div>;
  return <div className={`chapter-hero-visual chapter-hero-visual--${chapter}`} data-testid={`chapter-hero-${chapter}`}>
    <span className="overline">{chapter===1?"LATTICE + BASIS":chapter===2?"RECIPROCAL SPACE":chapter===4?"NORMAL MODES":chapter===5?"THERMAL PHONONS":"FERMI SURFACE"}</span>
    {chapter===1?<CrystalHero/>:chapter===2?<DiffractionHero/>:chapter===4?<VibrationHero/>:chapter===5?<ThermalHero/>:<FermiHero/>}
  </div>;
}
