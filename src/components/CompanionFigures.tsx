import { useMemo, useState } from "react";
import type { CompanionUnit } from "../content/companionChapters";
import { Formula } from "./Formula";
import { ModelContract } from "./ScientificLearning";

type Vec3 = [number, number, number];
type Vec2 = [number, number];
const clamp = (value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
const project = ([x,y,z]:Vec3):Vec2 => [48+150*x+48*y,205-132*z-38*y];
const cubeVertices:Vec3[] = [[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]];
const cubeEdges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];

function LabShell({ label,title,value,contract,children }: { label:string;title:string;value?:string;contract:React.ComponentProps<typeof ModelContract>;children:React.ReactNode }) {
  return <figure className="companion-lab liquid-panel">
    <div className="companion-lab__head"><div><span className="overline">{label}</span><h3>{title}</h3></div>{value&&<output className="lab-value">{value}</output>}</div>
    <ModelContract {...contract}/>{children}
  </figure>;
}

const latticeData = {
  sc:{name:"simple cubic",count:1,coordination:6,distance:"a",distanceValue:1,packing:Math.PI/6,positions:cubeVertices},
  bcc:{name:"body-centred cubic",count:2,coordination:8,distance:"√3a / 2",distanceValue:Math.sqrt(3)/2,packing:Math.sqrt(3)*Math.PI/8,positions:[...cubeVertices,[.5,.5,.5] as Vec3]},
  fcc:{name:"face-centred cubic",count:4,coordination:12,distance:"a / √2",distanceValue:1/Math.sqrt(2),packing:Math.PI/(3*Math.sqrt(2)),positions:[...cubeVertices,[.5,.5,0],[.5,.5,1],[.5,0,.5],[.5,1,.5],[0,.5,.5],[1,.5,.5]] as Vec3[]},
};

function CrystalLab(){
  const [kind,setKind]=useState<keyof typeof latticeData>("fcc");
  const [aAngstrom,setA]=useState(4);
  const data=latticeData[kind];
  return <LabShell label="COORDINATE-DRIVEN MODEL" title="立方 Bravais 格子实验" value={`${data.name} · a=${aAngstrom.toFixed(2)} Å`} contract={{model:"常规立方晶胞 + 周期边界",assumptions:["等效硬球最近邻接触","理想无限晶体","单原子 Bravais 格子"],outputs:"距离用 Å；堆积率无量纲",checks:[`等效格点数=${data.count}`,`最近邻配位=${data.coordination}`]}}>
    <div className="companion-lab__grid"><svg className="crystal-cube" viewBox="0 0 310 235" role="img" aria-label={`${data.name} 常规晶胞的分数坐标投影`}>
      {cubeEdges.map(([i,j])=>{const a=project(cubeVertices[i]),b=project(cubeVertices[j]);return <line key={`${i}-${j}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}/>})}
      {data.positions.map((point,index)=>{const [x,y]=project(point);return <g key={`${point.join("-")}-${index}`}><circle className="atom-halo" cx={x} cy={y} r="12"/><circle className="atom-core" cx={x} cy={y} r="5"/></g>})}
      <text x="210" y="225">fractional coordinates</text>
    </svg><div className="lab-readout"><dl><div><dt>格点 / 常规胞</dt><dd>{data.count}</dd></div><div><dt>最近邻配位数</dt><dd>{data.coordination}</dd></div><div><dt>最近邻距离</dt><dd>{(data.distanceValue*aAngstrom).toFixed(3)} Å = {data.distance}</dd></div><div><dt>硬球堆积率</dt><dd>{data.packing.toFixed(4)}</dd></div></dl><label className="scientific-slider"><span>晶格常数 a</span><b>{aAngstrom.toFixed(2)} Å</b><input type="range" min="2" max="7" step=".05" value={aAngstrom} onChange={e=>setA(Number(e.target.value))}/></label><div className="segmented">{(["sc","bcc","fcc"] as const).map(key=><button key={key} type="button" aria-pressed={kind===key} className={kind===key?"is-active":""} onClick={()=>setKind(key)}>{key.toUpperCase()}</button>)}</div></div></div>
  </LabShell>;
}

function planePolygon(h:number,k:number,l:number){
  const coefficients=[h,k,l],points:Vec3[]=[];
  for(const [ia,ib] of cubeEdges){const a=cubeVertices[ia],b=cubeVertices[ib];const fa=coefficients.reduce((s,c,i)=>s+c*a[i],-1),fb=coefficients.reduce((s,c,i)=>s+c*b[i],-1);if(Math.abs(fa)<1e-9)points.push(a);if(fa*fb<0||Math.abs(fb)<1e-9){const denom=fb-fa;if(Math.abs(denom)>1e-9){const t=-fa/denom;if(t>=0&&t<=1)points.push(a.map((v,i)=>v+t*(b[i]-v)) as Vec3)}}}
  const unique=points.filter((p,i)=>points.findIndex(q=>q.every((v,j)=>Math.abs(v-p[j])<1e-6))===i);
  const projected=unique.map(project),center=projected.reduce((s,p)=>[s[0]+p[0]/projected.length,s[1]+p[1]/projected.length] as Vec2,[0,0]);
  return projected.sort((a,b)=>Math.atan2(a[1]-center[1],a[0]-center[0])-Math.atan2(b[1]-center[1],b[0]-center[0]));
}

function MillerLab(){
  const [h,setH]=useState(1),[k,setK]=useState(1),[l,setL]=useState(0),[aAngstrom,setA]=useState(4);
  const safe=h+k+l===0?[1,0,0]:[h,k,l],polygon=planePolygon(safe[0],safe[1],safe[2]);
  const d=aAngstrom/Math.sqrt(safe.reduce((s,v)=>s+v*v,0));
  const intercept=(index:number)=>safe[index]===0?"∞":`${(aAngstrom/safe[index]).toFixed(2)} Å`;
  return <LabShell label="EXACT PLANE-CUBE INTERSECTION" title="Miller 晶面构造器" value={`(${safe.join("")}) · d=${d.toFixed(3)} Å`} contract={{model:"立方晶胞内 hx+ky+lz=1 与 12 条晶胞棱精确求交",assumptions:["立方晶格","h,k,l≥0","晶格常数 a 已知"],outputs:"截距与面间距均用 Å",checks:["零指数对应无限截距","d=a/√(h²+k²+l²)"]}}>
    <div className="companion-lab__grid"><svg className="miller-cube" viewBox="0 0 310 235" role="img" aria-label={`立方晶体 ${safe.join("")} 晶面与晶胞棱的交线`}>
      {cubeEdges.map(([i,j])=>{const p=project(cubeVertices[i]),q=project(cubeVertices[j]);return <line className="cube-wire" key={`${i}-${j}`} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]}/>})}
      {polygon.length>=3&&<polygon points={polygon.map(p=>p.join(",")).join(" ")}/>}<text x="212" y="225">hx + ky + lz = 1</text>
    </svg><div className="lab-sliders">{[["h",h,setH],["k",k,setK],["l",l,setL]].map(([name,value,setter])=><label key={name as string}><span>{name as string}</span><b>{value as number}</b><input type="range" min="0" max="4" step="1" value={value as number} onChange={e=>(setter as (n:number)=>void)(Number(e.target.value))}/></label>)}<label><span>a / Å</span><b>{aAngstrom.toFixed(2)}</b><input type="range" min="2" max="7" step=".05" value={aAngstrom} onChange={e=>setA(Number(e.target.value))}/></label><div className="numeric-audit"><span>x 截距<b>{intercept(0)}</b></span><span>y 截距<b>{intercept(1)}</b></span><span>z 截距<b>{intercept(2)}</b></span></div>{h+k+l===0&&<p className="model-warning">(000) 不表示有限晶面，图中自动回退为 (100)。</p>}</div></div>
  </LabShell>;
}

function BraggLab(){
  const [d,setD]=useState(.2),[lambda,setLambda]=useState(.15406),[order,setOrder]=useState(1);
  const ratio=order*lambda/(2*d),allowed=ratio<=1,theta=allowed?Math.asin(ratio):NaN,deg=theta*180/Math.PI,impact:Vec2=[165,155],length=150;
  const incoming:Vec2=[impact[0]-length*Math.cos(theta||0),impact[1]-length*Math.sin(theta||0)],outgoing:Vec2=[impact[0]+length*Math.cos(theta||0),impact[1]-length*Math.sin(theta||0)];
  return <LabShell label="ELASTIC DIFFRACTION" title="Bragg 条件计算器" value={allowed?`θ=${deg.toFixed(2)}° · 2θ=${(2*deg).toFixed(2)}°`:"nλ > 2d · 无弹性解"} contract={{model:"平行晶面标量 Bragg 几何",assumptions:["单色平面波","弹性散射 |k′|=|k|","理想平行晶面"],outputs:"d、λ 用 nm；角度用 °",checks:["nλ≤2d","θ 从晶面而非面法线量起"]}}>
    <div className="companion-lab__grid"><svg className="bragg-stage" viewBox="0 0 340 235" role="img" aria-label="相邻晶面程差与 Bragg 角">
      {[105,155,205].map(y=><line className="lattice-plane-line" key={y} x1="20" y1={y} x2="320" y2={y}/>)}{allowed&&<><path className="ray" d={`M${incoming.join(" ")} L${impact.join(" ")} L${outgoing.join(" ")}`}/><path className="angle-arc" d={`M${impact[0]-45} ${impact[1]} A45 45 0 0 1 ${impact[0]-45*Math.cos(theta)} ${impact[1]-45*Math.sin(theta)}`}/><text x="112" y="143">θ</text></>}<line className="spacing-mark" x1="298" y1="155" x2="298" y2="205"/><text x="305" y="185">d</text>
    </svg><div className="lab-sliders"><label><span>晶面间距 d / nm</span><b>{d.toFixed(3)}</b><input type="range" min=".08" max=".40" step=".002" value={d} onChange={e=>setD(Number(e.target.value))}/></label><label><span>波长 λ / nm</span><b>{lambda.toFixed(4)}</b><input type="range" min=".04" max=".30" step=".001" value={lambda} onChange={e=>setLambda(Number(e.target.value))}/></label><label><span>级次 n</span><b>{order}</b><input type="range" min="1" max="4" step="1" value={order} onChange={e=>setOrder(Number(e.target.value))}/></label><Formula latex={allowed?`2(${d.toFixed(3)})\\sin(${deg.toFixed(2)}^\\circ)=${order}(${lambda.toFixed(4)})`:`${order}(${lambda.toFixed(4)})>2(${d.toFixed(3)})`}/><p>{allowed?"这是几何允许条件；实际峰是否出现、强度多大，还需检查结构因子与实验几何。":"正弦函数不可能大于 1，因此该级次没有弹性 Bragg 反射。"}</p></div></div>
  </LabShell>;
}

function ReciprocalLab(){
  const [kRadius,setKRadius]=useState(1.55),[rotation,setRotation]=useState(0),scale=48,origin:Vec2=[82,118],center:Vec2=[origin[0]+kRadius*scale,origin[1]],angle=rotation*Math.PI/180;
  const points=useMemo(()=>{const values:{h:number;k:number;x:number;y:number;residual:number}[]=[];for(let h=-3;h<=3;h++)for(let k=-3;k<=3;k++){const gx=(h*Math.cos(angle)-k*Math.sin(angle))*scale,gy=(h*Math.sin(angle)+k*Math.cos(angle))*scale,x=origin[0]+gx,y=origin[1]-gy,residual=Math.abs(Math.hypot(x-center[0],y-center[1])/scale-kRadius);values.push({h,k,x,y,residual})}return values},[angle,center,kRadius]);
  const nearest=points.filter(p=>p.h||p.k).sort((a,b)=>a.residual-b.residual)[0];
  return <LabShell label="EWALD CONSTRUCTION" title="倒空间衍射几何" value={`最近 G=(${nearest.h},${nearest.k}) · 失配 ${nearest.residual.toFixed(3)} G₀`} contract={{model:"二维正方倒格子 + Ewald 圆",assumptions:["弹性散射","倒格间距 G₀ 归一化为 1","二维切片"],outputs:"|k| 与失配均以 G₀ 为单位",checks:["圆严格经过 G=(0,0)","圆上倒格点满足 |k+G|=|k|"]}}>
    <div className="companion-lab__grid"><svg className="reciprocal-stage" viewBox="0 0 360 240" role="img" aria-label="经过倒格原点的 Ewald 圆与可达倒格点"><circle data-testid="ewald-circle" className="ewald-circle" cx={center[0]} cy={center[1]} r={kRadius*scale}/><path className="k-vector" d={`M${center[0]} ${center[1]} L${origin[0]} ${origin[1]}`}/><text x={(center[0]+origin[0])/2} y={origin[1]-8}>k</text>{points.filter(p=>p.x>-5&&p.x<365&&p.y>-5&&p.y<245).map(p=><g key={`${p.h}-${p.k}`} data-h={p.h} data-k={p.k} className={p===nearest?"nearest-reflection":""}><circle cx={p.x} cy={p.y} r={p===nearest?6:3}/>{p===nearest&&<text x={p.x+8} y={p.y-8}>({p.h},{p.k})</text>}</g>)}<path className="g-vector" d={`M${origin[0]} ${origin[1]} L${nearest.x} ${nearest.y}`}/></svg><div className="lab-sliders"><label><span>球半径 |k| / G₀</span><b>{kRadius.toFixed(2)}</b><input type="range" min=".65" max="2.8" step=".01" value={kRadius} onChange={e=>setKRadius(Number(e.target.value))}/></label><label><span>晶体转角</span><b>{rotation.toFixed(0)}°</b><input type="range" min="-45" max="45" step="1" value={rotation} onChange={e=>setRotation(Number(e.target.value))}/></label><p className={nearest.residual<.025?"model-success":""}>{nearest.residual<.025?"倒格点落在 Ewald 圆上：出现几何允许反射。":"尚未精确相交；继续调节波长（圆半径）或晶体转角。"}</p><Formula latex={`|\\,|\\mathbf k+\\mathbf G|-|\\mathbf k|\\,|=${nearest.residual.toFixed(3)}G_0`}/></div></div>
  </LabShell>;
}

const bases={bcc:[[0,0,0],[.5,.5,.5]],fcc:[[0,0,0],[0,.5,.5],[.5,0,.5],[.5,.5,0]],diamond:[[0,0,0],[0,.5,.5],[.5,0,.5],[.5,.5,0],[.25,.25,.25],[.25,.75,.75],[.75,.25,.75],[.75,.75,.25]]} satisfies Record<string,Vec3[]>;
function StructureFactorLab(){
  const [kind,setKind]=useState<keyof typeof bases>("bcc"),[h,setH]=useState(1),[k,setK]=useState(1),[l,setL]=useState(0),basis=bases[kind];
  const terms=basis.map(([x,y,z])=>{const phi=-2*Math.PI*(h*x+k*y+l*z);return {re:Math.cos(phi),im:Math.sin(phi)}}),sum=terms.reduce((s,t)=>({re:s.re+t.re,im:s.im+t.im}),{re:0,im:0}),amp=Math.hypot(sum.re,sum.im),normI=(amp/basis.length)**2,allowed=normI>1e-8;
  return <LabShell label="COMPLEX AMPLITUDE SUM" title="结构因子与系统消光" value={`(${h}${k}${l}) · |S/f|=${amp.toFixed(3)} · I/Imax=${normI.toFixed(3)}`} contract={{model:"同种原子、运动学衍射的基元结构因子",assumptions:["所有基元原子散射因子相同 f","忽略温度与吸收修正","使用常规胞分数坐标"],outputs:"振幅以 f 归一；强度以 N²f² 归一",checks:["先复振幅相加","消光时 |S|≈0"]}}>
    <div className="companion-lab__grid"><svg className="phasor-stage" viewBox="0 0 330 240" role="img" aria-label="结构因子复平面相量相加"><path className="axis" d="M25 120h280M165 18v204"/><circle className="phasor-unit" cx="165" cy="120" r="78"/>{terms.map((term,index)=><line className="phasor" key={index} x1="165" y1="120" x2={165+78*term.re} y2={120-78*term.im}/>)}<line className="phasor-sum" x1="165" y1="120" x2={165+78*sum.re/basis.length} y2={120-78*sum.im/basis.length}/><text x="174" y="30">Im</text><text x="292" y="112">Re</text></svg><div className="lab-sliders"><div className="segmented">{Object.keys(bases).map(key=><button key={key} type="button" className={kind===key?"is-active":""} aria-pressed={kind===key} onClick={()=>setKind(key as keyof typeof bases)}>{key}</button>)}</div>{[["h",h,setH],["k",k,setK],["l",l,setL]].map(([name,value,setter])=><label key={name as string}><span>{name as string}</span><b>{value as number}</b><input type="range" min="0" max="4" step="1" value={value as number} onChange={e=>(setter as (n:number)=>void)(Number(e.target.value))}/></label>)}<p className={allowed?"model-success":"model-warning"}>{allowed?"基元复振幅未抵消：该倒格点有非零结构因子。":"各基元相位精确抵消：发生系统消光。"}</p><Formula latex={`S/f=${sum.re.toFixed(3)}${sum.im<0?"":"+"}${sum.im.toFixed(3)}i,\\qquad I/I_{max}=${normI.toFixed(3)}`}/></div></div>
  </LabShell>;
}

function monoOmega(q:number){return 2*Math.sin(Math.PI*q/2)}
function diatomicOmega(q:number,ratio:number,sign:1|-1){const a=1+1/ratio,disc=Math.max(0,a*a-4*Math.sin(Math.PI*q/2)**2/ratio);return Math.sqrt(a+sign*Math.sqrt(disc))}
function curvePoints(fn:(q:number)=>number,maxY:number){return Array.from({length:121},(_,i)=>{const q=i/120;return `${34+q*276},${198-fn(q)/maxY*166}`}).join(" ")}
function PhononLab({diatomic=false}:{diatomic?:boolean}){
  const [q,setQ]=useState(.35),[ratio,setRatio]=useState(2),acoustic=diatomic?diatomicOmega(q,ratio,-1):monoOmega(q),optical=diatomic?diatomicOmega(q,ratio,1):0,maxY=diatomic?Math.sqrt(2*(1+1/ratio))*1.05:2.08,vgMono=Math.cos(Math.PI*q/2),delta=1e-4,vgAcoustic=diatomic?(diatomicOmega(clamp(q+delta,0,1),ratio,-1)-diatomicOmega(clamp(q-delta,0,1),ratio,-1))/(2*delta*Math.PI):vgMono,w2=optical*optical,denom=Math.hypot(1+Math.cos(Math.PI*q),Math.sin(Math.PI*q)),ratioVU=diatomic&&denom>1e-8?Math.abs(2-w2)/denom:0;
  return <LabShell label="DYNAMICAL MATRIX" title={diatomic?"双原子链本征模":"单原子链色散与群速度"} value={diatomic?`Ka/π=${q.toFixed(2)} · ω₋=${acoustic.toFixed(3)} · ω₊=${optical.toFixed(3)}`:`Ka/π=${q.toFixed(2)} · ω=${acoustic.toFixed(3)} · v_g=${vgMono.toFixed(3)}`} contract={{model:diatomic?"交替质量最近邻谐链":"单质量最近邻谐链",assumptions:["只含最近邻力常数 C","小位移谐近似",diatomic?"a 为相邻同类原子重复距":"a 为相邻原子距离"],outputs:diatomic?"ω 以 √(C/M₁) 归一":"ω 以 √(C/M) 归一；v_g 以 a√(C/M) 归一",checks:["K=0 声学支 ω=0","区边界群速度为 0"]}}>
    <div className="companion-lab__grid"><svg className="dispersion-stage" viewBox="0 0 340 235" role="img" aria-label={diatomic?"双原子链声学与光学色散":"单原子链色散及当前波矢"}><path className="axis" d="M34 22v176h276"/><polyline className="dispersion acoustic" points={curvePoints(q0=>diatomic?diatomicOmega(q0,ratio,-1):monoOmega(q0),maxY)}/>{diatomic&&<polyline className="dispersion optical" points={curvePoints(q0=>diatomicOmega(q0,ratio,1),maxY)}/>}<line className="cursor" x1={34+q*276} y1="22" x2={34+q*276} y2="198"/><text x="5" y="24">ω</text><text x="28" y="218">0</text><text x="290" y="218">π/a</text>{diatomic&&<><text x="238" y="52">optical</text><text x="238" y="180">acoustic</text></>}</svg><div className="lab-sliders"><label><span>约化波矢 Ka/π</span><b>{q.toFixed(2)}</b><input type="range" min="0" max="1" step=".005" value={q} onChange={e=>setQ(Number(e.target.value))}/></label>{diatomic&&<label><span>质量比 M₂/M₁</span><b>{ratio.toFixed(2)}</b><input type="range" min="1" max="5" step=".02" value={ratio} onChange={e=>setRatio(Number(e.target.value))}/></label>}<div className="numeric-audit">{diatomic?<><span>声学支 ω₋<b>{acoustic.toFixed(4)}</b></span><span>光学支 ω₊<b>{optical.toFixed(4)}</b></span><span>声学斜率 dω/d(Ka)<b>{vgAcoustic.toFixed(4)}</b></span><span>光学模 |v/u|<b>{ratioVU.toFixed(4)}</b></span></>:<><span>ω/√(C/M)<b>{acoustic.toFixed(4)}</b></span><span>v_g/[a√(C/M)]<b>{vgMono.toFixed(4)}</b></span><span>相邻相位差<b>{(q*180).toFixed(1)}°</b></span></>}</div></div></div>
  </LabShell>;
}

function PlanckLab(){
  const [x,setX]=useState(2.5),q=Math.exp(-x),occupation=1/Math.expm1(x),heat=x*x*Math.exp(x)/(Math.expm1(x)**2),probabilities=Array.from({length:8},(_,n)=>(1-q)*q**n);
  return <LabShell label="BOSE-EINSTEIN STATISTICS" title="单一声子模的热占据" value={`x=ħω/kBT=${x.toFixed(2)} · n̄=${occupation.toFixed(4)}`} contract={{model:"化学势 μ=0 的量子谐振模",assumptions:["热平衡","频率不随温度变","忽略非谐线宽"],outputs:"n̄ 与 Cω/kB 均无量纲",checks:["x≫1 时冻结","x≪1 时 Cω/kB→1"]}}>
    <div className="companion-lab__grid"><svg className="population-stage" viewBox="0 0 340 235" role="img" aria-label="声子数 n 的热平衡概率分布">{probabilities.map((p,n)=><g key={n}><rect x={35+n*37} y={198-p*160} width="24" height={p*160}/><text x={43+n*37} y="218">{n}</text></g>)}<path className="axis" d="M25 20v178h305"/><text x="7" y="22">Pₙ</text><text x="315" y="218">n</text></svg><div className="lab-sliders"><label><span>能量比 x=ħω/kBT</span><b>{x.toFixed(2)}</b><input type="range" min=".12" max="10" step=".02" value={x} onChange={e=>setX(Number(e.target.value))}/></label><div className="numeric-audit"><span>平均占据 n̄<b>{occupation.toFixed(5)}</b></span><span>基态概率 P₀<b>{probabilities[0].toFixed(5)}</b></span><span>单模热容 Cω/kB<b>{heat.toFixed(5)}</b></span></div><Formula latex={`\\bar n=\\frac1{e^{${x.toFixed(2)}}-1}=${occupation.toFixed(5)}`}/></div></div>
  </LabShell>;
}

function DosLab(){
  const [dimension,setDimension]=useState<1|2|3>(3),[w,setW]=useState(.55),density=dimension*w**(dimension-1),cumulative=w**dimension,path=Array.from({length:121},(_,i)=>{const x=i/120,y=dimension*x**(dimension-1);return `${34+x*276},${198-y/3*165}`}).join(" ");
  return <LabShell label="K-SPACE MODE COUNTING" title="Debye 态密度：维度从哪里进入？" value={`${dimension}D · ω/ωD=${w.toFixed(2)} · N(<ω)/N=${cumulative.toFixed(3)}`} contract={{model:"d 维各向同性线性色散 ω=vK",assumptions:["连续 K 空间","单一等效声速","0≤ω≤ωD"],outputs:"D 以 N/ωD 归一；累计模数以 N 归一",checks:[`D∝ω${dimension-1===0?"⁰":`^${dimension-1}`}`,"ω=ωD 时累计模数=1"]}}>
    <div className="companion-lab__grid"><svg className="dispersion-stage dos-stage" viewBox="0 0 340 235" role="img" aria-label={`${dimension} 维线性色散的归一化态密度`}><path className="axis" d="M34 22v176h276"/><polyline className="dispersion acoustic" points={path}/><line className="cursor" x1={34+w*276} y1="22" x2={34+w*276} y2="198"/><text x="3" y="24">D(ω)</text><text x="272" y="218">ω/ωD</text></svg><div className="lab-sliders"><div className="segmented">{([1,2,3] as const).map(d=><button key={d} type="button" className={dimension===d?"is-active":""} aria-pressed={dimension===d} onClick={()=>setDimension(d)}>{d}D</button>)}</div><label><span>约化频率 ω/ωD</span><b>{w.toFixed(2)}</b><input type="range" min="0" max="1" step=".01" value={w} onChange={e=>setW(Number(e.target.value))}/></label><div className="numeric-audit"><span>归一 DOS<b>{density.toFixed(4)}</b></span><span>累计模比例<b>{cumulative.toFixed(4)}</b></span></div><Formula latex={`D_${dimension}(\\omega)\\propto\\omega^{${dimension-1}},\\qquad N(<\\omega)/N=(\\omega/\\omega_D)^{${dimension}}`}/></div></div>
  </LabShell>;
}

function debyeIntegrand(x:number){if(x<1e-5)return x*x;if(x>45)return x**4*Math.exp(-x);const em1=Math.expm1(x);return x**4*Math.exp(x)/(em1*em1)}
function simpsonIntegral(upper:number){const n=600,h=upper/n;let sum=debyeIntegrand(0)+debyeIntegrand(upper);for(let i=1;i<n;i++)sum+=(i%2?4:2)*debyeIntegrand(i*h);return sum*h/3}
function debyeNormalized(t:number){return clamp(3*t**3*simpsonIntegral(1/t),0,1)}
function einsteinNormalized(t:number){const x=1/t;if(x>45)return x*x*Math.exp(-x);const em1=Math.expm1(x);return x*x*Math.exp(x)/(em1*em1)}
function HeatCapacityLab(){
  const [t,setT]=useState(.20),debye=debyeNormalized(t),einstein=einsteinNormalized(t),curve=(fn:(x:number)=>number)=>Array.from({length:100},(_,i)=>{const x=.025+i/99*1.175;return `${34+i/99*276},${198-fn(x)*165}`}).join(" ");
  return <LabShell label="NUMERICAL DEBYE INTEGRAL" title="Debye 与 Einstein 热容" value={`T/Θ=${t.toFixed(3)} · CD/3NkB=${debye.toFixed(4)}`} contract={{model:"Debye 连续声学谱与 Einstein 单频谱",assumptions:["谐近似","定容热容","Debye 使用三维线性色散"],outputs:"两条曲线均归一为 C/(3NkB)",checks:["T→∞ 时两者→1","Debye 低温∝T³，Einstein 指数冻结"]}}>
    <div className="companion-lab__grid"><svg className="dispersion-stage heat-stage" viewBox="0 0 340 235" role="img" aria-label="数值积分得到的 Debye 与 Einstein 归一化热容"><path className="axis" d="M34 22v176h276"/><polyline className="dispersion acoustic" points={curve(debyeNormalized)}/><polyline className="dispersion optical" points={curve(einsteinNormalized)}/><line className="cursor" x1={34+(t-.025)/1.175*276} y1="22" x2={34+(t-.025)/1.175*276} y2="198"/><text x="2" y="24">C/3NkB</text><text x="275" y="218">T/Θ</text><text x="215" y="68">Debye</text><text x="215" y="105">Einstein</text></svg><div className="lab-sliders"><label><span>约化温度 T/Θ</span><b>{t.toFixed(3)}</b><input type="range" min=".025" max="1.2" step=".005" value={t} onChange={e=>setT(Number(e.target.value))}/></label><div className="numeric-audit"><span>Debye 数值积分<b>{debye.toFixed(6)}</b></span><span>Einstein 精确式<b>{einstein.toFixed(6)}</b></span><span>低温 Debye 近似<b>{Math.min(1,4*Math.PI**4/5*t**3).toFixed(6)}</b></span></div><Formula latex={`\\frac{C_D}{3Nk_B}=3t^3\\int_0^{1/t}\\frac{x^4e^x}{(e^x-1)^2}dx=${debye.toFixed(5)}`}/></div></div>
  </LabShell>;
}

function ThermalLab(){
  const [t,setT]=useState(.25),[w,setW]=useState(.55),[enabled,setEnabled]=useState({boundary:true,defect:true,umklapp:true}),rates={boundary:.04,defect:.30*w**4,umklapp:1.6*w*w*t*Math.exp(-1/(3*t))};
  const total=(enabled.boundary?rates.boundary:0)+(enabled.defect?rates.defect:0)+(enabled.umklapp?rates.umklapp:0),ell=total>0?1/total:Infinity;
  return <LabShell label="MATTHIESSEN-RATE MODEL" title="声子平均自由程与散射竞争" value={`τ⁻¹/Γ₀=${total.toFixed(4)} · ℓΓ₀/v=${Number.isFinite(ell)?ell.toFixed(2):"∞"}`} contract={{model:"三个独立散射率的教学型 Matthiessen 模型",assumptions:["独立散射通道","固定约化频率","系数仅用于比较趋势，不代表具体材料"],outputs:"全部为相对/约化量，不输出伪装的绝对 κ",checks:["关闭全部通道时 ℓ→∞","缺陷率∝ω⁴","U 过程低温指数抑制"]}}>
    <div className="companion-lab__grid"><svg className="rate-stage" viewBox="0 0 340 235" role="img" aria-label="边界、缺陷和 Umklapp 相对散射率柱状图"><path className="axis" d="M35 20v178h285"/>{(["boundary","defect","umklapp"] as const).map((key,i)=>{const height=enabled[key]?Math.min(160,rates[key]*420):0;return <g key={key}><rect className={`rate-bar ${key}`} x={65+i*82} y={198-height} width="48" height={height}/><text x={67+i*82} y="220">{key==="boundary"?"边界":key==="defect"?"缺陷":"U过程"}</text></g>})}</svg><div className="lab-sliders"><label><span>约化温度 T/ΘD</span><b>{t.toFixed(2)}</b><input type="range" min=".04" max="1" step=".01" value={t} onChange={e=>setT(Number(e.target.value))}/></label><label><span>约化频率 ω/ωD</span><b>{w.toFixed(2)}</b><input type="range" min=".05" max="1" step=".01" value={w} onChange={e=>setW(Number(e.target.value))}/></label><div className="mechanism-toggles">{(["boundary","defect","umklapp"] as const).map(key=><button key={key} type="button" aria-pressed={enabled[key]} className={enabled[key]?"is-active":""} onClick={()=>setEnabled(v=>({...v,[key]:!v[key]}))}>{key==="boundary"?"边界":key==="defect"?"缺陷":"Umklapp"}</button>)}</div><div className="numeric-audit"><span>Γ边界<b>{rates.boundary.toFixed(4)}</b></span><span>Γ缺陷<b>{rates.defect.toFixed(4)}</b></span><span>ΓU<b>{rates.umklapp.toFixed(4)}</b></span></div><Formula latex={`\\Gamma_{tot}=\\sum_i\\Gamma_i=${total.toFixed(4)},\\qquad \\ell=v/\\Gamma_{tot}`}/></div></div>
  </LabShell>;
}

export function CompanionFigure({type}:{type:NonNullable<CompanionUnit["figure"]>}){
  if(type==="crystal")return <CrystalLab/>; if(type==="miller")return <MillerLab/>; if(type==="bragg")return <BraggLab/>; if(type==="reciprocal")return <ReciprocalLab/>; if(type==="structure-factor")return <StructureFactorLab/>; if(type==="mono-phonon")return <PhononLab/>; if(type==="diatomic")return <PhononLab diatomic/>; if(type==="planck")return <PlanckLab/>; if(type==="dos")return <DosLab/>; if(type==="heat-capacity")return <HeatCapacityLab/>; return <ThermalLab/>;
}
