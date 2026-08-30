import katex from "katex";

type FormulaProps = {
  latex: string;
  display?: boolean;
  label?: string;
  className?: string;
};

export function Formula({ latex, display = true, label, className = "" }: FormulaProps) {
  let html = "";
  try {
    html = katex.renderToString(latex, { displayMode: display, throwOnError: true, strict: "warn", trust: false });
  } catch {
    html = `<code>${latex.replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</code>`;
  }
  const props = {
    className: `formula ${display ? "formula--display" : "formula--inline"} ${className}`,
    "aria-label": label ?? `公式：${latex}`,
    dangerouslySetInnerHTML: { __html: html }
  };
  return display ? <div {...props} /> : <span {...props} />;
}

/** Render prose containing $...$ fragments as real inline KaTeX. */
export function RichText({ children }: { children: string }) {
  return <>{children.split(/(\$[^$]+\$)/g).filter(Boolean).map((part, index) =>
    part.startsWith("$") && part.endsWith("$")
      ? <Formula key={`${part}-${index}`} latex={part.slice(1, -1)} display={false} />
      : <span key={`${part}-${index}`}>{part}</span>
  )}</>;
}

export function FormulaCard({ latex, meaning, variables, children }: { latex: string; meaning: string; variables?: string[]; children?: React.ReactNode }) {
  return (
    <div className="formula-card">
      <Formula latex={latex} />
      <p>{meaning}</p>
      {variables && <ul className="variable-list">{variables.map((item) => <li key={item}>{item}</li>)}</ul>}
      {children}
    </div>
  );
}
