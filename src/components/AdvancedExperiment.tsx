import { useState } from "react";
import { physicsModels } from "../content/physicsModels";
import { Formula } from "./Formula";

export function AdvancedExperiment({ chapter, index = 0 }: { chapter: number; index?: number }) {
  const data = physicsModels[chapter]?.[index];
  const [parameters, setParameters] = useState(() => data?.controls.map(item => item.initial) ?? []);
  if (!data) return null;
  const curves = data.series.map(series => Array.from({ length: 241 }, (_, i) => {
    const x = data.domain[0] + (data.domain[1] - data.domain[0]) * i / 240;
    return { x, y: series.evaluate(x, parameters) };
  }));
  const values = curves.flat().map(point => point.y).filter(Number.isFinite);
  const yMin = Math.min(0, ...values), yMax = Math.max(...values);
  const range = Math.max(1e-9, yMax - yMin);
  const px = (x: number) => 58 + (x - data.domain[0]) / (data.domain[1] - data.domain[0]) * 570;
  const py = (y: number) => 252 - (y - yMin) / range * 205;
  return <article className="advanced-lab liquid-panel" data-testid={`advanced-lab-${chapter}-${index}`}>
    <p className="overline">QUANTITATIVE EXPERIMENT · 模型与边界</p><h3>{data.title}</h3>
    <Formula latex={data.equation}/>
    <svg viewBox="0 0 680 312" role="img" aria-label={`${data.title}，横轴${data.xLabel}，纵轴${data.yLabel}`}>
      <path className="lab-axis" d="M58 38V252H628"/>
      {curves.map((curve, i) => <polyline key={i} className={i === 0 ? "lab-curve" : "lab-reference"} style={{ opacity: i === 0 ? 1 : .65-i*.12 }} points={curve.filter(point => Number.isFinite(point.y)).map(point => `${px(point.x).toFixed(2)},${py(point.y).toFixed(2)}`).join(" ")}/>)}
      <text x="58" y="23">{data.yLabel}</text><text x="250" y="302">{data.xLabel}</text>
      {[0,.25,.5,.75,1].map(r => <g key={r}><text x={58+r*570} y="274" textAnchor="middle">{(data.domain[0]+r*(data.domain[1]-data.domain[0])).toFixed(2)}</text><text x="49" y={252-r*205+4} textAnchor="end">{(yMin+r*range).toPrecision(2)}</text></g>)}
    </svg>
    <p className="lab-note">曲线顺序：{data.series.map(item => item.label).join("；")}。首条为实线，其余为虚线。</p>
    <div className="lab-controls">{data.controls.map((control, i) => <label key={control.label}><span>{control.label}：<strong>{parameters[i].toFixed(control.step<.1?2:1)}</strong></span><input type="range" aria-label={control.label} min={control.min} max={control.max} step={control.step} value={parameters[i]} onChange={event=>setParameters(previous=>previous.map((value,j)=>i===j?Number(event.target.value):value))}/></label>)}</div>
    <output className="lab-readout" aria-live="polite">{data.readout(parameters).map(line => <span key={line}>{line}</span>)}</output>
    <p className="lab-note"><strong>假设与适用范围：</strong>{data.note}</p>
  </article>;
}
