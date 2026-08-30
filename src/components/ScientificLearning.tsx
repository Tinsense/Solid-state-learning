import { Formula } from "./Formula";
import type { DepthBlock } from "../content/chapterDepth";

export function ScientificDeepDive({ data }: { data: DepthBlock }) {
  return <div className="scientific-depth">
    <section className="learning-contract liquid-panel">
      <div><span className="overline">LEARNING TARGETS</span><h3>学完这一节，你应该能自己推出什么？</h3><ul>{data.objectives.map(item=><li key={item}>{item}</li>)}</ul></div>
      <div><span className="overline">PREREQUISITES</span><h3>开始前需要会什么？</h3><ul>{data.prerequisites.map(item=><li key={item}>{item}</li>)}</ul></div>
    </section>
    <section className="reasoning-chain liquid-panel">
      <header><span className="overline">REASONING CHAIN</span><h3>把逻辑一层一层搭起来</h3></header>
      <ol>{data.reasoning.map((step,index)=><li key={step.title}><span>{String(index+1).padStart(2,"0")}</span><div><h4>{step.title}</h4><p>{step.body}</p>{step.latex&&<Formula latex={step.latex}/>}</div></li>)}</ol>
    </section>
    <section className="worked-example liquid-panel">
      <header><span className="overline">WORKED EXAMPLE</span><h3>{data.example.title}</h3></header>
      <div className="worked-example__grid"><div><h4>已知</h4><ul>{data.example.givens.map(item=><li key={item}>{item}</li>)}</ul></div><div><h4>推理</h4><ol>{data.example.reasoning.map(item=><li key={item}>{item}</li>)}</ol></div></div>
      <div className="worked-result"><span>结论</span><p>{data.example.result}</p>{data.example.latex&&<Formula latex={data.example.latex}/>}</div>
    </section>
    <section className="accuracy-grid">
      <aside className="pitfall-card liquid-panel"><span className="overline">COMMON PITFALLS</span><h3>最容易错在哪里？</h3><ul>{data.pitfalls.map(item=><li key={item}>{item}</li>)}</ul></aside>
      <aside className="symbol-card liquid-panel"><span className="overline">SYMBOLS & UNITS</span><h3>符号与单位</h3><dl>{data.symbols.map(item=><div key={item.symbol}><dt>{item.symbol}</dt><dd>{item.meaning}{item.unit&&<small>{item.unit}</small>}</dd></div>)}</dl></aside>
    </section>
  </div>;
}

export function ModelContract({ model, assumptions, outputs, checks }: { model:string; assumptions:string[]; outputs:string; checks:string[] }) {
  return <aside className="model-contract" aria-label="互动模型说明">
    <div><span>MODEL</span><strong>{model}</strong></div>
    <div><span>ASSUMPTIONS</span><p>{assumptions.join(" · ")}</p></div>
    <div><span>OUTPUT</span><p>{outputs}</p></div>
    <div><span>SELF-CHECK</span><p>{checks.join(" · ")}</p></div>
  </aside>;
}
