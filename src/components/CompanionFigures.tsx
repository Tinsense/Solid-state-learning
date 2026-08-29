import { useId, useMemo, useState } from "react";
import { Formula } from "./Formula";
import type { CompanionUnit } from "../content/companionChapters";

const points = [
  [42, 42], [198, 42], [198, 198], [42, 198],
  [92, 12], [248, 12], [248, 168], [92, 168],
];
const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];

function CrystalLab() {
  const [kind, setKind] = useState<"sc" | "bcc" | "fcc">("fcc");
  const data = {
    sc: { name: "simple cubic", count: "1", coordination: "6", distance: "a", packing: "0.524" },
    bcc: { name: "body-centred cubic", count: "2", coordination: "8", distance: "√3a / 2", packing: "0.680" },
    fcc: { name: "face-centred cubic", count: "4", coordination: "12", distance: "a / √2", packing: "0.740" },
  }[kind];
  const extra = kind === "bcc" ? [[145,105]] : kind === "fcc" ? [[120,42],[198,120],[120,198],[42,120],[170,12],[248,90]] : [];
  return <figure className="companion-lab liquid-panel" aria-label="立方 Bravais 格子交互模型">
    <div className="companion-lab__head"><div><span className="overline">INTERACTIVE LATTICE</span><h3>立方格子观察台</h3></div><div className="segmented">{(["sc","bcc","fcc"] as const).map(k => <button key={k} type="button" className={kind===k?"is-active":""} onClick={()=>setKind(k)}>{k.toUpperCase()}</button>)}</div></div>
    <div className="companion-lab__grid">
      <svg className="crystal-cube" viewBox="0 0 290 230" role="img" aria-label={`${data.name} 晶胞示意图`}>
        {edges.map(([a,b],i)=><line key={i} x1={points[a][0]} y1={points[a][1]} x2={points[b][0]} y2={points[b][1]}/>) }
        {[...points,...extra].map(([x,y],i)=><g key={i}><circle className="atom-halo" cx={x} cy={y} r="12"/><circle className="atom-core" cx={x} cy={y} r="5"/></g>)}
      </svg>
      <div className="lab-readout"><p>{data.name}</p><dl><div><dt>格点 / 常规胞</dt><dd>{data.count}</dd></div><div><dt>配位数</dt><dd>{data.coordination}</dd></div><div><dt>最近邻距</dt><dd>{data.distance}</dd></div><div><dt>堆积率</dt><dd>{data.packing}</dd></div></dl></div>
    </div>
  </figure>;
}

function MillerLab() {
  const [h, setH] = useState(1), [k, setK] = useState(1), [l, setL] = useState(0);
  const index = `(${h}${k}${l})`;
  return <figure className="companion-lab liquid-panel">
    <div className="companion-lab__head"><div><span className="overline">PLANE INDEXER</span><h3>Miller 晶面构造器</h3></div><strong className="lab-value">{index}</strong></div>
    <div className="companion-lab__grid">
      <svg className="miller-cube" viewBox="0 0 300 230" role="img" aria-label={`${index} 晶面示意`}>
        <path className="cube-wire" d="M45 55h150v145H45zM95 20h150v145H195M45 55l50-35m100 35 50-35m0 145-50 35"/>
        <polygon points={`${45+120/(h||.45)},200 ${45},${200-120/(k||.45)} ${195},${200-105/(l||.45)}`} />
        <text x="252" y="172">x</text><text x="91" y="15">y</text><text x="28" y="50">z</text>
      </svg>
      <div className="lab-sliders">{[["h",h,setH],["k",k,setK],["l",l,setL]].map(([name,value,setter])=><label key={name as string}><span>{name as string}<b>{value as number}</b></span><input type="range" min="0" max="3" step="1" value={value as number} onChange={e=>(setter as (n:number)=>void)(Number(e.target.value))}/></label>)}<p>轴截距：{h ? `a/${h}` : "∞"}，{k ? `b/${k}` : "∞"}，{l ? `c/${l}` : "∞"}</p></div>
    </div>
  </figure>;
}

function BraggLab() {
  const [spacing, setSpacing] = useState(.2), [wavelength, setWavelength] = useState(.154), [order, setOrder] = useState(1);
  const ratio = order*wavelength/(2*spacing);
  const allowed = ratio <= 1;
  const theta = allowed ? Math.asin(ratio)*180/Math.PI : 90;
  return <figure className="companion-lab liquid-panel">
    <div className="companion-lab__head"><div><span className="overline">BRAGG GEOMETRY</span><h3>衍射角实验台</h3></div><strong className="lab-value">{allowed ? `2θ = ${(2*theta).toFixed(1)}°` : "无解"}</strong></div>
    <div className="companion-lab__grid">
      <svg className="bragg-stage" viewBox="0 0 340 230" role="img" aria-label="Bragg 衍射几何">
        {[80,130,180].map(y=><line className="lattice-plane-line" key={y} x1="25" y1={y} x2="315" y2={y}/>) }
        <path className="ray" d={`M30 20 L170 130 L${170+140*Math.cos(theta*Math.PI/180)} ${130-140*Math.sin(theta*Math.PI/180)}`}/>
        <path className="angle-arc" d="M125 130 A45 45 0 0 1 138 98"/><text x="113" y="111">θ</text>
        <line className="spacing-mark" x1="290" y1="130" x2="290" y2="180"/><text x="298" y="158">d</text>
      </svg>
      <div className="lab-sliders">
        <label><span>d / nm<b>{spacing.toFixed(3)}</b></span><input type="range" min=".10" max=".40" step=".005" value={spacing} onChange={e=>setSpacing(Number(e.target.value))}/></label>
        <label><span>λ / nm<b>{wavelength.toFixed(3)}</b></span><input type="range" min=".05" max=".25" step=".002" value={wavelength} onChange={e=>setWavelength(Number(e.target.value))}/></label>
        <label><span>级次 n<b>{order}</b></span><input type="range" min="1" max="3" step="1" value={order} onChange={e=>setOrder(Number(e.target.value))}/></label>
        <Formula latex={allowed ? `2(${spacing.toFixed(3)})\\sin(${theta.toFixed(2)}^\\circ)=${order}(${wavelength.toFixed(3)})` : "n\\lambda>2d\\;\\Rightarrow\\;\\text{无 Bragg 解}"}/>
      </div>
    </div>
  </figure>;
}

function ReciprocalLab() {
  const [radius, setRadius] = useState(2.4);
  const dots = useMemo(()=>Array.from({length:49},(_,i)=>({x:35+(i%7)*42,y:20+Math.floor(i/7)*32})),[]);
  return <figure className="companion-lab liquid-panel">
    <div className="companion-lab__head"><div><span className="overline">RECIPROCAL SPACE</span><h3>Ewald 球切片</h3></div><strong className="lab-value">|k|={radius.toFixed(1)} G₀</strong></div>
    <div className="companion-lab__grid"><svg className="reciprocal-stage" viewBox="0 0 330 230" role="img" aria-label="Ewald 圆与二维倒格点">
      {dots.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="3"/>)}<circle className="ewald-circle" cx="161" cy="116" r={radius*43}/><path className="k-vector" d="M35 116h126"/><text x="88" y="108">k</text>
    </svg><div className="lab-sliders"><label><span>Ewald 半径<b>{radius.toFixed(1)}</b></span><input type="range" min="1.2" max="3.0" step=".05" value={radius} onChange={e=>setRadius(Number(e.target.value))}/></label><p>圆周穿过倒格点时，同时满足弹性条件 |k′|=|k| 与 Laue 条件 Δk=G。</p></div></div>
  </figure>;
}

function PhononLab({ diatomic=false }: { diatomic?: boolean }) {
  const [q, setQ] = useState(.35), [ratio, setRatio] = useState(2);
  const mono = 2*Math.abs(Math.sin(Math.PI*q/2));
  const acoustic = Math.sqrt((1+1/ratio)-Math.sqrt((1+1/ratio)**2-4*Math.sin(Math.PI*q/2)**2/ratio));
  const optical = Math.sqrt((1+1/ratio)+Math.sqrt((1+1/ratio)**2-4*Math.sin(Math.PI*q/2)**2/ratio));
  const curve = (branch: "mono"|"acoustic"|"optical") => Array.from({length:81},(_,i)=>{
    const x=i/80, s=Math.sin(Math.PI*x/2);
    const y=branch==="mono"?2*s:Math.sqrt((1+1/ratio)+(branch==="optical"?1:-1)*Math.sqrt((1+1/ratio)**2-4*s*s/ratio));
    return `${30+x*280},${190-y*65}`;
  }).join(" ");
  return <figure className="companion-lab liquid-panel">
    <div className="companion-lab__head"><div><span className="overline">DISPERSION LAB</span><h3>{diatomic?"声学支与光学支":"单原子链色散"}</h3></div><strong className="lab-value">Ka/π={q.toFixed(2)}</strong></div>
    <div className="companion-lab__grid"><svg className="dispersion-stage" viewBox="0 0 340 230" role="img" aria-label="声子色散曲线">
      <path className="axis" d="M30 15v175h285"/><polyline className="dispersion acoustic" points={curve(diatomic?"acoustic":"mono")}/>{diatomic&&<polyline className="dispersion optical" points={curve("optical")}/>}<line className="cursor" x1={30+q*280} y1="20" x2={30+q*280} y2="190"/><text x="8" y="20">ω</text><text x="304" y="212">π/a</text>
    </svg><div className="lab-sliders"><label><span>约化波矢 Ka/π<b>{q.toFixed(2)}</b></span><input type="range" min="0" max="1" step=".01" value={q} onChange={e=>setQ(Number(e.target.value))}/></label>{diatomic&&<label><span>质量比 M₂/M₁<b>{ratio.toFixed(1)}</b></span><input type="range" min="1" max="4" step=".1" value={ratio} onChange={e=>setRatio(Number(e.target.value))}/></label>}<p>{diatomic?`ω₋=${acoustic.toFixed(3)}，ω₊=${optical.toFixed(3)}（以 √(C/M₁) 为单位）`:`ω=${mono.toFixed(3)} √(C/M)`}</p></div></div>
  </figure>;
}

function HeatCapacityLab() {
  const [t, setT] = useState(.2);
  const einstein = (()=>{const x=1/t,e=Math.exp(Math.min(x,30));return x*x*e/(e-1)**2})();
  const debyeLow = Math.min(1, (4*Math.PI**4/5)*t**3);
  const path = (kind:"debye"|"einstein")=>Array.from({length:80},(_,i)=>{const x=.03+i/79*1.17; const y=kind==="einstein"?(()=>{const z=1/x,e=Math.exp(Math.min(z,30));return z*z*e/(e-1)**2})():Math.min(1,(4*Math.PI**4/5)*x**3/(1+(4*Math.PI**4/5)*x**3));return `${30+i/79*280},${190-y*150}`}).join(" ");
  return <figure className="companion-lab liquid-panel"><div className="companion-lab__head"><div><span className="overline">THERMAL POPULATION</span><h3>Debye / Einstein 热容</h3></div><strong className="lab-value">T/Θ={t.toFixed(2)}</strong></div><div className="companion-lab__grid"><svg className="dispersion-stage heat-stage" viewBox="0 0 340 230" role="img" aria-label="归一化热容随温度曲线"><path className="axis" d="M30 15v175h285"/><polyline className="dispersion acoustic" points={path("debye")}/><polyline className="dispersion optical" points={path("einstein")}/><line className="cursor" x1={30+(t-.03)/1.17*280} y1="20" x2={30+(t-.03)/1.17*280} y2="190"/><text x="7" y="22">C/3NkB</text><text x="275" y="212">T/Θ</text></svg><div className="lab-sliders"><label><span>约化温度 T/Θ<b>{t.toFixed(2)}</b></span><input type="range" min=".03" max="1.2" step=".01" value={t} onChange={e=>setT(Number(e.target.value))}/></label><p><i className="legend-dot acoustic"/> Debye 低温近似：{debyeLow.toFixed(3)}<br/><i className="legend-dot optical"/> Einstein：{einstein.toFixed(3)}</p></div></div></figure>;
}

function ThermalLab() {
  const [mode,setMode]=useState<"boundary"|"defect"|"umklapp">("umklapp");
  const id=useId();
  const info={boundary:["边界散射","ℓ≈样品尺寸","低温 κ∝T³"],defect:["缺陷 / 同位素","短波散射更强","抑制中高温 κ"],umklapp:["Umklapp","K₁+K₂=K₃+G","高温本征热阻"]}[mode];
  return <figure className="companion-lab liquid-panel"><div className="companion-lab__head"><div><span className="overline">MEAN FREE PATH</span><h3>声子散射路径</h3></div><div className="segmented">{(["boundary","defect","umklapp"] as const).map(m=><button key={m} type="button" className={mode===m?"is-active":""} onClick={()=>setMode(m)}>{m==="boundary"?"边界":m==="defect"?"缺陷":"U 过程"}</button>)}</div></div><div className="companion-lab__grid"><svg className="thermal-stage" viewBox="0 0 340 230" role="img" aria-labelledby={id}><title id={id}>{info[0]}</title><path className="phonon-path" d={mode==="boundary"?"M25 180Q90 20 155 150T315 45":mode==="defect"?"M25 170Q90 35 145 125L173 80Q225 185 315 45":"M25 175Q95 10 160 130L105 62Q220 190 315 35"}/>{Array.from({length:18},(_,i)=><circle key={i} cx={28+(i%6)*56} cy={35+Math.floor(i/6)*78} r={mode==="defect"&&i===8?9:4}/>)}</svg><div className="lab-readout"><p>{info[0]}</p><dl><div><dt>准动量</dt><dd>{info[1]}</dd></div><div><dt>宏观结果</dt><dd>{info[2]}</dd></div></dl></div></div></figure>;
}

export function CompanionFigure({ type }: { type: NonNullable<CompanionUnit["figure"]> }) {
  if (type === "crystal") return <CrystalLab/>;
  if (type === "miller") return <MillerLab/>;
  if (type === "bragg") return <BraggLab/>;
  if (type === "reciprocal") return <ReciprocalLab/>;
  if (type === "mono-phonon") return <PhononLab/>;
  if (type === "diatomic") return <PhononLab diatomic/>;
  if (type === "heat-capacity") return <HeatCapacityLab/>;
  return <ThermalLab/>;
}
