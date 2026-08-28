import { useMemo, useState, type CSSProperties } from "react";
import { Formula } from "./Formula";

function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (value: T) => void; label: string }) {
  return (
    <div className="segmented liquid-panel" role="group" aria-label={label}>
      {options.map((option) => <button type="button" key={option.value} className={value === option.value ? "is-active" : ""} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}</button>)}
    </div>
  );
}

const bondingInfo = {
  vdw: { label: "Van der Waals", title: "相关涨落", copy: "闭壳层电子云的瞬时偏移相互关联。没有永久电荷转移，吸引弱且近似无方向。" },
  ionic: { label: "Ionic", title: "电荷转移", copy: "价电子向电负性更强的一侧转移，形成正、负离子；长程库仑能由整个晶格决定。" },
  covalent: { label: "Covalent", title: "核间共享", copy: "电子密度在两核之间累积。共享轨道降低能量，同时产生强烈的方向选择。" },
  metallic: { label: "Metallic", title: "电子离域", copy: "价电子不再属于某一根键，而是在多个离子实之间形成可移动的电子海。" }
} as const;

export function BondingStage() {
  const [type, setType] = useState<keyof typeof bondingInfo>("vdw");
  const info = bondingInfo[type];
  const nuclei = type === "metallic" ? [[155,125],[260,125],[365,125],[205,215],[315,215]] : [[205,170],[315,170]];
  return (
    <figure className="feature-figure bonding-stage">
      <div className="figure-head"><div><span className="overline">INTERACTIVE FIELD</span><h3>四种结合，一张连续电子图景</h3></div><span className="figure-index">01 / 09</span></div>
      <Segmented value={type} label="选择结合类型" onChange={setType} options={Object.entries(bondingInfo).map(([value, item]) => ({ value: value as keyof typeof bondingInfo, label: item.label }))} />
      <div className="bonding-canvas">
        <svg viewBox="0 0 520 330" role="img" aria-label={`${info.label} 结合的电子密度示意动画`}>
          <defs>
            <filter id="soft"><feGaussianBlur stdDeviation="18" /></filter>
            <radialGradient id="cloud"><stop offset="0" stopColor="var(--figure-bright)" stopOpacity=".55"/><stop offset="1" stopColor="var(--figure-bright)" stopOpacity="0"/></radialGradient>
          </defs>
          <g className={`bond-scene bond-scene--${type}`}>
            {type === "metallic" && <path className="electron-sea" d="M85 92c65-57 294-55 358 12 55 58 7 157-66 181-92 31-253 22-305-52-33-47-25-107 13-141Z" />}
            {type !== "metallic" && <>
              <ellipse className="cloud cloud-a" cx={type === "vdw" ? 216 : type === "ionic" ? 190 : 250} cy="170" rx={type === "ionic" ? 55 : type === "covalent" ? 88 : 70} ry={type === "covalent" ? 64 : 76}/>
              <ellipse className="cloud cloud-b" cx={type === "vdw" ? 304 : type === "ionic" ? 330 : 270} cy="170" rx={type === "ionic" ? 96 : type === "covalent" ? 88 : 70} ry={type === "covalent" ? 64 : 76}/>
              {type === "covalent" && <ellipse className="bond-density" cx="260" cy="170" rx="68" ry="34" />}
            </>}
            {nuclei.map(([x,y], index) => <g key={`${x}-${y}`} className="nucleus" transform={`translate(${x} ${y})`}><circle r="18"/><circle r="4"/><text y="43">{type === "ionic" ? (index ? "−" : "+") : "+"}</text></g>)}
            {type === "metallic" && Array.from({length: 20}, (_, i) => <circle key={i} className="free-electron" cx={100+(i*71)%340} cy={85+(i*47)%170} r="3" style={{"--i": i} as CSSProperties}/>) }
            {type === "vdw" && <g className="dipole-arrows"><path d="M177 250h67m-8-7 8 7-8 7M276 250h67m-8-7 8 7-8 7"/><text x="260" y="286" textAnchor="middle">correlated fluctuation</text></g>}
          </g>
        </svg>
        <div className="figure-caption"><span>{info.title}</span><p>{info.copy}</p></div>
      </div>
    </figure>
  );
}

export function LondonInteraction() {
  const [distance, setDistance] = useState(1.55);
  const strength = Math.pow(1.25 / distance, 6);
  const cloudShift = Math.min(14, 7 / Math.pow(distance, 3) * 4);
  const rightX = 225 + distance * 120;
  return (
    <figure className="feature-figure lab-grid" id="london-lab">
      <div className="lab-visual">
        <div className="figure-head"><div><span className="overline">QUANTUM CORRELATION</span><h3>让距离放大六次方律</h3></div><output>{strength.toFixed(3)}×</output></div>
        <svg viewBox="0 0 560 290" role="img" aria-label="两个原子电子云的相关瞬时偶极，距离可调">
          <defs><radialGradient id="atomCloud"><stop offset="0" stopColor="var(--figure-bright)" stopOpacity=".5"/><stop offset="1" stopColor="var(--figure-bright)" stopOpacity=".04"/></radialGradient></defs>
          <g className="london-atom"><circle cx={210+cloudShift} cy="130" r="72" fill="url(#atomCloud)"/><circle cx="210" cy="130" r="9"/><text x="210" y="232" textAnchor="middle">atom 1</text></g>
          <g className="london-atom"><circle cx={rightX-cloudShift} cy="130" r="72" fill="url(#atomCloud)"/><circle cx={rightX} cy="130" r="9"/><text x={rightX} y="232" textAnchor="middle">atom 2</text></g>
          <path className="measure-line" d={`M210 245v17m0-8H${rightX}m0-9v17`} /><text className="measure-label" x={(210+rightX)/2} y="280" textAnchor="middle">R = {distance.toFixed(2)} R*</text>
        </svg>
      </div>
      <figcaption className="lab-controls">
        <span className="overline">CONTROL R</span><h4>耦合强度 ∝ R⁻⁶</h4><p>把近距离强度归一为 1。稍微拉远，两电子云仍然可见，但相互作用已经急剧下降。</p>
        <label><span>原子间距 R / R*</span><output>{distance.toFixed(2)}</output><input data-testid="london-distance" type="range" min="1.25" max="2.7" step="0.01" value={distance} onChange={(e)=>setDistance(Number(e.target.value))}/></label>
        <div className="metric-row"><div><span>dipole coupling</span><strong>R<sup>−3</sup></strong></div><div><span>energy lowering</span><strong>R<sup>−6</sup></strong></div></div>
      </figcaption>
    </figure>
  );
}

function makePath(fn: (x:number)=>number, xMin=.82, xMax=2.5, steps=160) {
  const mapX=(x:number)=>52+(x-xMin)/(xMax-xMin)*420;
  const mapY=(y:number)=>250-(Math.max(-1.25,Math.min(3.4,y))+1.25)/4.65*205;
  return Array.from({length:steps},(_,i)=>{const x=xMin+(xMax-xMin)*i/(steps-1);return `${i?"L":"M"}${mapX(x).toFixed(2)} ${mapY(fn(x)).toFixed(2)}`}).join(" ");
}

export function LennardJonesLab() {
  const [r, setR] = useState(1.122);
  const rep = 4*Math.pow(1/r,12), attr = -4*Math.pow(1/r,6), total=rep+attr;
  const force=24*(2*Math.pow(r,-13)-Math.pow(r,-7));
  const state = Math.abs(force)<.08 ? "平衡位置" : force>0 ? "排斥占优" : "吸引占优";
  const mapX=(x:number)=>52+(x-.82)/(2.5-.82)*420, mapY=(y:number)=>250-(Math.max(-1.25,Math.min(3.4,y))+1.25)/4.65*205;
  const atomGap=90+r*68;
  return (
    <figure className="feature-figure lj-lab" id="lj-lab">
      <div className="figure-head"><div><span className="overline">POTENTIAL + FORCE</span><h3>Lennard–Jones 实验台</h3></div><span className={`state-pill state-${state}`}>{state}</span></div>
      <div className="lj-layout">
        <div className="lj-atoms">
          <div className="atom-pair" style={{"--gap": `${atomGap}px`} as CSSProperties}><i/><i/></div>
          <label><span>R / σ</span><output data-testid="lj-value">{r.toFixed(3)}</output><input data-testid="lj-slider" type="range" min="0.86" max="2.5" step="0.002" value={r} onChange={(e)=>setR(Number(e.target.value))}/></label>
          <div className="readout"><div><span>U / ε</span><strong>{total.toFixed(3)}</strong></div><div><span>F · σ / ε</span><strong>{force.toFixed(3)}</strong></div></div>
          <p>力的正号表示把原子推开；负号表示拉近。平衡点满足 F=−dU/dR=0。</p>
        </div>
        <div className="plot-wrap">
          <svg viewBox="0 0 510 300" role="img" aria-label="Lennard-Jones 排斥项、吸引项与总势能曲线">
            <path className="axis" d="M52 30v220h430M52 195h430"/>
            {[1,1.5,2,2.5].map(x=><g key={x}><path className="tick" d={`M${mapX(x)} 250v6`}/><text x={mapX(x)} y="274" textAnchor="middle">{x}</text></g>)}
            <text x="474" y="288" textAnchor="end">R / σ</text><text x="22" y="34">U / ε</text>
            <path className="curve repulsive" d={makePath(x=>4*Math.pow(x,-12))}/><path className="curve attractive" d={makePath(x=>-4*Math.pow(x,-6))}/><path className="curve total" d={makePath(x=>4*(Math.pow(x,-12)-Math.pow(x,-6)))}/>
            <path className="marker-line" d={`M${mapX(r)} 36V250`}/><circle className="marker" cx={mapX(r)} cy={mapY(total)} r="6"/>
          </svg>
          <div className="plot-legend"><span className="legend-total">total</span><span className="legend-rep">repulsive R⁻¹²</span><span className="legend-attr">attractive −R⁻⁶</span></div>
        </div>
      </div>
    </figure>
  );
}

export function PauliLab() {
  const [distance,setDistance]=useState(1.5);
  const overlap=Math.max(0,1-(distance-0.7)/1.2);
  return <figure className="feature-figure lab-grid compact-lab">
    <div className="lab-visual pauli-visual"><div className="cloud-disc"/><div className="overlap-zone" style={{opacity:overlap}}/><div className="cloud-disc"/><span>electron-density overlap</span></div>
    <figcaption className="lab-controls"><span className="overline">PAULI REPULSION</span><h3>排斥不是“硬球相撞”</h3><p>重叠增大时，电子态必须正交化并混入更高能级。能量上升速度远快于远程吸引。</p><label><span>电子云中心距</span><output>{distance.toFixed(2)}</output><input type="range" min="0.72" max="1.9" step=".01" value={distance} onChange={e=>setDistance(Number(e.target.value))}/></label><div className="energy-bar"><i style={{width:`${Math.pow(overlap,2)*100}%`}}/><span>higher-state mixing</span></div></figcaption>
  </figure>;
}

export function MadelungChain() {
  const [n,setN]=useState(8);
  const partial=(m:number)=>2*Array.from({length:m},(_,i)=>Math.pow(-1,i)/(i+1)).reduce((a,b)=>a+b,0);
  const alpha=partial(n), exact=2*Math.log(2);
  const points=Array.from({length:50},(_,i)=>`${36+i/49*430},${180-(partial(i+1)-1.28)/.25*110}`).join(" ");
  return <figure className="feature-figure" id="madelung-lab">
    <div className="figure-head"><div><span className="overline">CONDITIONAL SERIES</span><h3>一维 Madelung 收敛实验</h3></div><output data-testid="madelung-value">α<sub>{n}</sub> = {alpha.toFixed(6)}</output></div>
    <div className="madelung-layout">
      <div className="ion-chain" aria-label="正负离子交替的一维链">{Array.from({length:15},(_,i)=>{const k=i-7; const active=Math.abs(k)<=n && k!==0;return <div key={i} className={`${k%2===0?"negative":"positive"} ${active?"is-active":""}`}><span>{k%2===0?"−":"+"}</span><small>{k===0?"ref":Math.abs(k)+"R"}</small></div>})}</div>
      <div className="convergence-chart"><svg viewBox="0 0 500 220" role="img" aria-label="Madelung 部分和向 2 ln 2 振荡收敛"><path className="axis" d="M36 28v162h440"/><path className="exact-line" d={`M36 ${180-(exact-1.28)/.25*110}H476`}/><polyline points={points}/><circle cx={36+(n-1)/49*430} cy={180-(alpha-1.28)/.25*110} r="6"/><text x="470" y={170-(exact-1.28)/.25*110} textAnchor="end">2 ln 2</text><text x="470" y="210" textAnchor="end">neighbors n</text></svg></div>
    </div>
    <label className="wide-slider"><span>计入邻居壳层 n</span><output>{n} / 50</output><input data-testid="madelung-slider" type="range" min="1" max="50" value={n} onChange={e=>setN(Number(e.target.value))}/></label>
    <figcaption><p>奇数项从上方逼近，偶数项从下方逼近；误差尺度约为下一项。三维库仑和更棘手，因为扩大求和体积的方式会改变表面电荷。</p></figcaption>
  </figure>;
}

const shells = [
  {n:1,count:6,charge:"Cl⁻",distance:"R",copy:"最近邻：沿 ±x、±y、±z 六个方向。"},
  {n:2,count:12,charge:"Na⁺",distance:"√2 R",copy:"次近邻：位于面对角方向，与中心同号。"},
  {n:3,count:8,charge:"Cl⁻",distance:"√3 R",copy:"第三壳层：位于体对角方向，再次回到异号。"}
];
export function IonicLattice() {
  const [shell,setShell]=useState(1); const selected=shells[shell-1];
  return <figure className="feature-figure ionic-lattice"><div className="figure-head"><div><span className="overline">NACL LATTICE</span><h3>从一个离子，看到整个晶格</h3></div><span>{selected.count} × {selected.charge}</span></div><div className="ionic-layout"><svg viewBox="0 0 480 360" role="img" aria-label={`NaCl 晶格第 ${shell} 配位壳层`}>
    {Array.from({length:5},(_,row)=>Array.from({length:5},(_,col)=>{const x=90+col*75+(row%2)*16,y=48+row*61; const dist=Math.max(Math.abs(row-2),Math.abs(col-2)); const isCenter=row===2&&col===2; const active=!isCenter&&dist===Math.min(shell,2); const positive=(row+col)%2===0;return <g key={`${row}-${col}`} className={`lattice-ion ${positive?"positive":"negative"} ${active?"is-active":""} ${isCenter?"is-center":""}`} transform={`translate(${x} ${y})`}><circle r={isCenter?22:15}/><text y="5" textAnchor="middle">{positive?"+":"−"}</text></g>}))}
    <path className="cube-wire" d="M106 78 331 78 406 139 181 139ZM181 139v122l225 0V139M106 78v122l75 61M106 200l225 0 75 61M331 78v122"/></svg><div className="shell-panel"><span>COORDINATION SHELL {shell}</span><strong>{selected.count}</strong><h4>{selected.charge} at {selected.distance}</h4><p>{selected.copy}</p><div className="shell-buttons">{shells.map(item=><button type="button" key={item.n} className={shell===item.n?"is-active":""} onClick={()=>setShell(item.n)}>{item.n}</button>)}</div><p className="quiet">Madelung 能量是所有壳层带符号贡献的总和，不等于最近邻能量。</p></div></div></figure>
}

export function DensityBonding() {
  const [ionicity,setIonicity]=useState(.25);
  return <figure className="feature-figure density-lab"><div className="figure-head"><div><span className="overline">ELECTRON DENSITY</span><h3>离子性不是开关，而是一条连续轴</h3></div><output>{Math.round(ionicity*100)}% ionic</output></div><svg viewBox="0 0 650 300" role="img" aria-label="电子密度从共价分布连续过渡到离子分布">
    <defs><radialGradient id="densityA"><stop offset="0" stopColor="var(--figure-bright)" stopOpacity={.62-.3*ionicity}/><stop offset="1" stopColor="var(--figure-bright)" stopOpacity="0"/></radialGradient><radialGradient id="densityB"><stop offset="0" stopColor="var(--figure-bright)" stopOpacity={.62+.3*ionicity}/><stop offset="1" stopColor="var(--figure-bright)" stopOpacity="0"/></radialGradient></defs>
    {Array.from({length:6},(_,i)=><ellipse key={`a${i}`} className="contour" cx={230-ionicity*18} cy="140" rx={34+i*18*(1-ionicity*.25)} ry={27+i*13} opacity={.2+i*.09}/>) }
    {Array.from({length:6},(_,i)=><ellipse key={`b${i}`} className="contour" cx={420-ionicity*12} cy="140" rx={34+i*18*(1+ionicity*.35)} ry={27+i*13} opacity={.2+i*.09}/>) }
    <ellipse cx="230" cy="140" rx="108" ry="92" fill="url(#densityA)"/><ellipse cx="420" cy="140" rx={108+ionicity*44} ry={92+ionicity*28} fill="url(#densityB)"/><ellipse className="bond-density" cx="325" cy="140" rx={85*(1-ionicity)} ry="30" opacity={1-ionicity}/><circle cx="230" cy="140" r="8"/><circle cx="420" cy="140" r="8"/><text x="230" y="260" textAnchor="middle">A</text><text x="420" y="260" textAnchor="middle">B</text></svg><label className="wide-slider"><span>covalent</span><output>ionicity</output><input type="range" min="0" max="1" step=".01" value={ionicity} onChange={e=>setIonicity(Number(e.target.value))}/><span>ionic</span></label></figure>
}

export function RadiiExplorer() {
  const [cn,setCn]=useState(6); const cation=42+(cn-4)*2.4, anion=66+(cn-4)*1.7;
  const neighbors=Array.from({length:cn},(_,i)=>{const a=i/cn*Math.PI*2; return [180+Math.cos(a)*105,145+Math.sin(a)*105]});
  return <figure className="feature-figure lab-grid"><div className="lab-visual"><svg viewBox="0 0 360 300" role="img" aria-label={`配位数 ${cn} 时的经验离子半径示意`}><circle className="radius-guide" cx="180" cy="145" r={cation}/><circle className="ion-core" cx="180" cy="145" r={cation*.52}/><text x="180" y="150" textAnchor="middle">M⁺</text>{neighbors.map(([x,y],i)=><g key={i}><circle className="radius-guide" cx={x} cy={y} r={anion*.58}/><circle className="neighbor-core" cx={x} cy={y} r="12"/></g>)}</svg></div><figcaption className="lab-controls"><span className="overline">EFFECTIVE RADII</span><h3>半径随配位环境而变</h3><p>这里展示的是结构模型中的有效半径趋势，不是电荷密度的硬边界。</p><label><span>coordination number</span><output>CN = {cn}</output><input type="range" min="4" max="12" step="1" value={cn} onChange={e=>setCn(Number(e.target.value))}/></label><div className="metric-row"><div><span>cation</span><strong>{cation.toFixed(0)} pm*</strong></div><div><span>anion</span><strong>{anion.toFixed(0)} pm*</strong></div></div><small>* 教学用归一化趋势值，不对应特定离子表。</small></figcaption></figure>
}

export function StrainExplorer() {
  const [exx,setExx]=useState(.12),[eyy,setEyy]=useState(-.04),[shear,setShear]=useState(.18),[notation,setNotation]=useState<"engineering"|"tensor">("engineering");
  const g=notation==="engineering"?shear:2*shear; const tensor=notation==="engineering"?shear/2:shear;
  const corners=[[0,0],[1,0],[1,1],[0,1]].map(([x,y])=>[115+(1+exx)*180*x+g*95*y,235-(1+eyy)*145*y]);
  const poly=corners.map(p=>p.join(",")).join(" ");
  return <figure className="feature-figure strain-lab" id="strain-lab"><div className="figure-head"><div><span className="overline">DEFORMATION FIELD</span><h3>应变张量实验</h3></div><Segmented value={notation} label="选择剪切应变记号" onChange={setNotation} options={[{value:"engineering",label:"engineering γ"},{value:"tensor",label:"tensor ε"}]}/></div><div className="strain-layout"><div className="strain-visual"><svg viewBox="0 0 470 320" role="img" aria-label="受正应变和剪切应变作用的方形晶胞"><path className="reference-square" d="M115 235h180V90H115Z"/><polygon points={poly}/>{corners.map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r="6"/>)}<path className="axis" d="M66 267h300m-267 25V38"/><text x="370" y="272">x</text><text x="91" y="40">y</text></svg><Formula latex={String.raw`\boldsymbol\varepsilon=\begin{pmatrix}${exx.toFixed(2)}&${tensor.toFixed(2)}\\${tensor.toFixed(2)}&${eyy.toFixed(2)}\end{pmatrix}`} /></div><div className="lab-controls"><label><span>normal ε<sub>xx</sub></span><output>{exx.toFixed(2)}</output><input type="range" min="-.2" max=".25" step=".01" value={exx} onChange={e=>setExx(Number(e.target.value))}/></label><label><span>normal ε<sub>yy</sub></span><output>{eyy.toFixed(2)}</output><input type="range" min="-.2" max=".25" step=".01" value={eyy} onChange={e=>setEyy(Number(e.target.value))}/></label><label><span>{notation==="engineering"?"engineering γxy":"tensor εxy"}</span><output>{shear.toFixed(2)}</output><input type="range" min="-.35" max=".35" step=".01" value={shear} onChange={e=>setShear(Number(e.target.value))}/></label><div className="notation-note"><strong>{notation==="engineering"?"γxy = 2εxy":"εxy = γxy / 2"}</strong><p>当前矩阵始终显示标准对称小应变张量。切换只改变 slider 的剪切 convention。</p></div></div></div></figure>
}

export function ElasticConstantsLab() {
  const [c11,setC11]=useState(166),[c12,setC12]=useState(64),[c44,setC44]=useState(80),[load,setLoad]=useState<"axial"|"hydro"|"shear">("axial");
  const B=(c11+2*c12)/3, stable=c44>0&&c11-c12>0&&c11+2*c12>0;
  const deform=load==="axial"?{sx:1+55/c11,sy:1-Math.max(0,c12/c11)*.14,skew:0}:load==="hydro"?{sx:1-15/B,sy:1-15/B,skew:0}:{sx:1,sy:1,skew:40/c44};
  return <figure className="feature-figure elasticity-lab" id="elasticity-lab"><div className="figure-head"><div><span className="overline">CUBIC CRYSTAL ELASTICITY</span><h3>三个常数，各司其职</h3></div><span className={stable?"stability stable":"stability unstable"}>{stable?"mechanically stable":"unstable set"}</span></div><div className="elasticity-layout"><div className="elastic-visual"><Segmented value={load} label="加载模式" onChange={setLoad} options={[{value:"axial",label:"轴向拉伸"},{value:"hydro",label:"静水压缩"},{value:"shear",label:"剪切"}]}/><svg viewBox="0 0 430 330" role="img" aria-label="立方晶体在所选载荷下的形变"><g className="reference-cube"><path d="M110 210 260 210 330 160 180 160ZM110 210v-105l70-50 150 0v105M110 105h150l70-50M260 105v105"/></g><g className="deformed-cube" transform={`translate(${185*(1-deform.sx)} ${160*(1-deform.sy)}) matrix(${deform.sx} 0 ${deform.skew} ${deform.sy} 0 0)`}><path d="M110 210 260 210 330 160 180 160ZM110 210v-105l70-50 150 0v105M110 105h150l70-50M260 105v105"/></g></svg><div className="elastic-metrics"><div><span>Bulk modulus B</span><strong>{B.toFixed(1)} GPa</strong></div><div><span>compressibility κ</span><strong>{(1/B*1000).toFixed(2)} TPa⁻¹</strong></div></div></div><figcaption className="lab-controls"><label><span>C<sub>11</sub> · axial</span><output>{c11} GPa</output><input type="range" min="30" max="300" value={c11} onChange={e=>setC11(Number(e.target.value))}/></label><label><span>C<sub>12</sub> · coupling</span><output>{c12} GPa</output><input type="range" min="-20" max="180" value={c12} onChange={e=>setC12(Number(e.target.value))}/></label><label><span>C<sub>44</sub> · shear</span><output>{c44} GPa</output><input type="range" min="1" max="180" value={c44} onChange={e=>setC44(Number(e.target.value))}/></label><div className="stability-rules"><span>Born stability</span><p>C₄₄ &gt; 0</p><p>C₁₁ − C₁₂ &gt; 0</p><p>C₁₁ + 2C₁₂ &gt; 0</p></div></figcaption></div></figure>
}

const waveData = {
  "100": {
    L:{u:"[100]",latex:"C_{11}"}, T1:{u:"[010]",latex:"C_{44}"}, T2:{u:"[001]",latex:"C_{44}"}
  },
  "110": {
    L:{u:"[110]",latex:"\\frac{C_{11}+C_{12}+2C_{44}}{2}"}, T1:{u:"[001]",latex:"C_{44}"}, T2:{u:"[1 −1 0]",latex:"\\frac{C_{11}-C_{12}}{2}"}
  },
  "111": {
    L:{u:"[111]",latex:"\\frac{C_{11}+2C_{12}+4C_{44}}{3}"}, T1:{u:"[1 −1 0]",latex:"\\frac{C_{11}-C_{12}+C_{44}}{3}"}, T2:{u:"[1 1 −2]",latex:"\\frac{C_{11}-C_{12}+C_{44}}{3}"}
  }
} as const;

export function ElasticWaveExplorer({ onDerive }: { onDerive: (key:"wave100"|"wave110"|"wave111")=>void }) {
  const [direction,setDirection]=useState<keyof typeof waveData>("110"); const [mode,setMode]=useState<"L"|"T1"|"T2">("T2"); const [playing,setPlaying]=useState(false); const current=waveData[direction][mode];
  const pol= mode==="L"?[1,-.55]:mode==="T1"?[0,-1]:[1,.55];
  return <figure className="feature-figure wave-explorer" id="wave-explorer" data-testid="wave-explorer"><div className="figure-head"><div><span className="overline">ELASTIC WAVE EXPLORER</span><h3>传播方向不是振动方向</h3></div><button className="liquid-button play-button" type="button" onClick={()=>setPlaying(v=>!v)} aria-pressed={playing}>{playing?"暂停":"播放"}</button></div><div className="wave-layout"><div className="wave-stage"><svg viewBox="0 0 640 390" role="img" aria-label={`${direction} 方向 ${mode} 模式的晶格振动`}>
    <g className={`wave-atoms ${playing?"is-playing":""}`}>{Array.from({length:8},(_,col)=>Array.from({length:5},(_,row)=>{const phase=(col+row*.22)*.55;return <g key={`${col}-${row}`} className="wave-atom" style={{"--dx":`${pol[0]*9}px`,"--dy":`${pol[1]*9}px`,"--delay":`${-phase}s`} as CSSProperties} transform={`translate(${95+col*65} ${82+row*55})`}><circle r="8"/><circle className="wave-ring" r="14"/></g>}))}</g>
    <g className="vector k-vector"><path d="M100 340h145"/><path d="m232 332 13 8-13 8"/><text x="171" y="370">K ∥ [{direction}]</text></g><g className="vector u-vector" transform={mode==="T1"?"translate(370 350) rotate(-90)":mode==="T2"?"translate(350 335) rotate(-28)":"translate(350 340)"}><path d="M0 0h120"/><path d="m107-8 13 8-13 8"/><text x="58" y="28" transform={mode==="T1"?"rotate(90 58 28)":""}>u ∥ {current.u}</text></g>
  </svg></div><figcaption className="wave-controls"><div><span className="control-title">Direction · K</span><Segmented value={direction} label="传播方向" onChange={setDirection} options={[{value:"100",label:"[100]"},{value:"110",label:"[110]"},{value:"111",label:"[111]"}]}/></div><div><span className="control-title">Polarization · u</span><Segmented value={mode} label="极化模式" onChange={setMode} options={[{value:"L",label:"L"},{value:"T1",label:"T₁"},{value:"T2",label:"T₂"}]}/></div><div className="wave-equation"><span>effective stiffness</span><Formula latex={`\\rho v^2=${current.latex}`}/><button className="text-button" type="button" onClick={()=>onDerive(`wave${direction}`)}>展开该方向完整推导 →</button></div></figcaption></div></figure>
}

export function InverseElasticLab() {
  const rho=2330, vL=8430, vT=5840, vT2=4670;
  const targets={c11:rho*vL*vL/1e9,c44:rho*vT*vT/1e9,c12:rho*vL*vL/1e9-2*rho*vT2*vT2/1e9};
  const [answers,setAnswers]=useState({c11:"",c44:"",c12:""}); const [checked,setChecked]=useState(false);
  const status=(key:keyof typeof targets)=>{const val=Number(answers[key]);return checked?(Math.abs(val-targets[key])/targets[key]<.03?"correct":"wrong"):""};
  return <section className="inverse-lab"><div className="inverse-head"><span className="overline">MEASUREMENT → MODULUS</span><h3>从声速反算弹性常数</h3><p>先独立计算，点击 Check 后才显示步骤。单位统一使用 SI；答案填写 GPa。</p></div><div className="given-grid"><div><span>ρ</span><strong>2330 kg m⁻³</strong></div><div><span>v<sub>[100],L</sub></span><strong>8430 m s⁻¹</strong></div><div><span>v<sub>[100],T</sub></span><strong>5840 m s⁻¹</strong></div><div><span>v<sub>[110],T2</sub></span><strong>4670 m s⁻¹</strong></div></div><div className="answer-grid">{(["c11","c44","c12"] as const).map(key=><label key={key} className={status(key)}><span>C<sub>{key.slice(1)}</sub></span><input inputMode="decimal" value={answers[key]} onChange={e=>setAnswers({...answers,[key]:e.target.value})} aria-label={`输入 ${key.toUpperCase()}，单位 GPa`}/><b>GPa</b></label>)}</div><button className="liquid-button primary" type="button" onClick={()=>setChecked(true)} data-testid="inverse-check">Check</button>{checked&&<div className="inverse-solution"><p>C₁₁=ρv²<sub>[100],L</sub> = {targets.c11.toFixed(1)} GPa</p><p>C₄₄=ρv²<sub>[100],T</sub> = {targets.c44.toFixed(1)} GPa</p><p>C₁₂=C₁₁−2ρv²<sub>[110],T2</sub> = {targets.c12.toFixed(1)} GPa</p></div>}</section>
}

export function KnowledgeMap() {
  const go=(id:string)=>document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"});
  const nodes=[
    {id:"binding",label:"electromagnetic interaction",x:330,y:36}, {id:"binding",label:"electronic distribution",x:330,y:104}, {id:"binding",label:"bonding",x:330,y:172}, {id:"inert-gas",label:"U(R)",x:330,y:240}, {id:"elasticity",label:"curvature d²U/dR²",x:330,y:308}, {id:"elasticity",label:"elastic stiffness",x:330,y:376}, {id:"waves",label:"wave velocity",x:330,y:444},
    {id:"inert-gas",label:"London interaction",x:85,y:244}, {id:"ionic",label:"Madelung energy",x:85,y:316}, {id:"other-bonds",label:"electron overlap",x:575,y:244}, {id:"other-bonds",label:"delocalized electrons",x:575,y:316}
  ];
  return <figure className="knowledge-map"><svg viewBox="0 0 660 510" role="img" aria-label="第三章交互知识图谱"><path className="map-flow" d="M330 58v360M310 235H105v61M350 235h205v61"/><path className="map-arrow" d="m322 410 8 13 8-13M97 286l8 13 8-13M547 286l8 13 8-13"/>{nodes.map((node,i)=><g key={`${node.label}-${i}`} className="map-node" onClick={()=>go(node.id)} role="button" tabIndex={0} onKeyDown={e=>{if(e.key==="Enter"||e.key===" ")go(node.id)}} transform={`translate(${node.x} ${node.y})`}><rect x="-90" y="-21" width="180" height="42" rx="21"/><text textAnchor="middle" y="5">{node.label}</text></g>)}</svg><figcaption>点击任意节点回到相应知识段落。主线是：势能曲线的极小值给出平衡结构，极小值附近的曲率给出刚度，刚度与密度共同给出声速。</figcaption></figure>
}
