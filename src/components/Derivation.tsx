import { useEffect, useState } from "react";
import type { DerivationData } from "../content/chapter3";
import { Formula, FormulaCard } from "./Formula";

const Chevron = ({ direction = "right" }: { direction?: "left" | "right" | "down" }) => (
  <svg className={`icon chevron chevron--${direction}`} viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
);

export function Derivation({ data }: { data: DerivationData }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const handleOpen = (event: Event) => {
      if ((event as CustomEvent<string>).detail === data.id) {
        setOpen(true);
        setStep(0);
        setShowAll(false);
      }
    };
    window.addEventListener("open-derivation", handleOpen);
    return () => window.removeEventListener("open-derivation", handleOpen);
  }, [data.id]);

  const resetAndClose = () => { setOpen(false); setStep(0); setShowAll(false); };
  const toggle = () => open ? resetAndClose() : setOpen(true);

  return (
    <article className={`derivation ${open ? "is-open" : ""}`} id={`derivation-${data.id}`}>
      <div className="derivation-summary">
        <div>
          <span className="overline">FORMULA · DERIVATION</span>
          <h3>{data.title}</h3>
        </div>
        <FormulaCard latex={data.result} meaning={data.meaning} variables={data.variables}>
          <button className="liquid-button derivation-toggle" type="button" onClick={toggle} aria-expanded={open}>
            <span>{open ? "收起推导" : "逐步展开推导"}</span><Chevron direction={open ? "down" : "right"} />
          </button>
        </FormulaCard>
      </div>

      {open && (
        <div className="derivation-workspace" aria-live="polite">
          <div className="derivation-progress" aria-label={`推导进度 ${showAll ? data.steps.length : step + 1}/${data.steps.length}`}>
            {data.steps.map((_, index) => (
              <button
                key={index}
                type="button"
                className={index <= step || showAll ? "is-filled" : ""}
                onClick={() => { setShowAll(false); setStep(index); }}
                aria-label={`跳到第 ${index + 1} 步`}
              />
            ))}
          </div>

          <div className="derivation-step-list">
            {(showAll ? data.steps : [data.steps[step]]).map((item, visibleIndex) => {
              const actualIndex = showAll ? visibleIndex : step;
              return (
                <section className="derivation-step" key={`${data.id}-${actualIndex}-${showAll}`}>
                  <div className="step-number"><span>STEP</span><strong>{String(actualIndex + 1).padStart(2, "0")}</strong></div>
                  <div className="step-content">
                    <h4>{item.title}</h4>
                    <p>{item.explanation}</p>
                    <Formula latex={item.latex} className="formula--step" />
                    {item.insight && <aside className="insight"><span aria-hidden="true">↳</span><p>{item.insight}</p></aside>}
                  </div>
                </section>
              );
            })}
          </div>

          <div className="derivation-controls liquid-panel">
            <span>{showAll ? `完整推导 · ${data.steps.length} 步` : `Step ${step + 1} / ${data.steps.length}`}</span>
            <div>
              <button type="button" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0 || showAll}><Chevron direction="left" />上一步</button>
              <button type="button" onClick={() => { setShowAll(true); setStep(data.steps.length - 1); }} disabled={showAll}>显示完整推导</button>
              <button type="button" onClick={() => setStep(Math.min(data.steps.length - 1, step + 1))} disabled={step === data.steps.length - 1 || showAll}>下一步<Chevron /></button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
