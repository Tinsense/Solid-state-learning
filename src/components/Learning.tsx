import { useState } from "react";
import type { ExerciseData, SectionMeta } from "../content/chapter3";
import { Formula } from "./Formula";

export function SectionHeader({ section }: { section: SectionMeta }) {
  return (
    <header className="section-header">
      <span className="section-number">{section.index}</span>
      <div><p className="overline">{section.english}</p><h2>{section.title}</h2><p className="section-question">{section.question}</p></div>
    </header>
  );
}

export function SourceNote({ children }: { children: React.ReactNode }) {
  return <footer className="source-note"><span>Source trace</span><p>{children}</p></footer>;
}

type Choice = { label: string; correct?: boolean; feedback: string };

export function ConceptCheck({ id, question, choices, onComplete }: { id: string; question: string; choices: Choice[]; onComplete?: (id: string) => void }) {
  const [choice, setChoice] = useState<number | null>(null);
  const selected = choice === null ? null : choices[choice];

  return (
    <aside className="concept-check" id={`check-${id}`}>
      <div className="concept-check__label"><span>CONCEPT CHECK</span><span>即时检验</span></div>
      <h3>{question}</h3>
      <div className="choice-grid" role="group" aria-label={question}>
        {choices.map((item, index) => (
          <button
            type="button" key={item.label}
            className={choice === index ? (item.correct ? "is-correct" : "is-wrong") : ""}
            onClick={() => { setChoice(index); if (item.correct) onComplete?.(id); }}
            aria-pressed={choice === index}
          >
            <span>{String.fromCharCode(65 + index)}</span>{item.label}
          </button>
        ))}
      </div>
      {selected && <div className={`feedback ${selected.correct ? "is-correct" : "is-wrong"}`} role="status"><strong>{selected.correct ? "判断正确" : "再想一步"}</strong><p>{selected.feedback}</p></div>}
    </aside>
  );
}

export function Exercise({ exercise }: { exercise: ExerciseData }) {
  const [hintCount, setHintCount] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  return (
    <article className="exercise-card">
      <div className="exercise-meta"><span>LEVEL {exercise.level}</span><span>{exercise.level === 1 ? "概念" : exercise.level === 2 ? "计算" : "推导"}</span></div>
      <h3>{exercise.title}</h3>
      <p>{exercise.prompt}</p>
      {hintCount > 0 && (
        <ol className="hint-list">{exercise.hints.slice(0, hintCount).map((hint, index) => <li key={hint}><span>Hint {index + 1}</span>{hint}</li>)}</ol>
      )}
      {showSolution && (
        <div className="exercise-solution"><span>完整解答</span><p>{exercise.solution}</p>{exercise.solutionLatex && <Formula latex={exercise.solutionLatex} />}</div>
      )}
      <div className="exercise-actions">
        <button className="liquid-button secondary" type="button" disabled={hintCount >= exercise.hints.length} onClick={() => setHintCount((n) => Math.min(exercise.hints.length, n + 1))}>提示 {Math.min(hintCount + 1, exercise.hints.length)}</button>
        <button className="liquid-button" type="button" onClick={() => setShowSolution((value) => !value)}>{showSolution ? "收起解答" : "显示解答"}</button>
      </div>
    </article>
  );
}

export function ReadingCallout({ title, children }: { title: string; children: React.ReactNode }) {
  return <aside className="reading-callout"><span>READ THIS CAREFULLY</span><h3>{title}</h3><div>{children}</div></aside>;
}
