const chapters = [
  { number: 1, label: "晶体结构" },
  { number: 2, label: "衍射与倒格子" },
  { number: 3, label: "晶体结合" },
  { number: 4, label: "晶格振动" },
  { number: 5, label: "声子热学" },
];

export function ChapterSwitcher({ current, compact = false }: { current: number; compact?: boolean }) {
  return (
    <nav className={`chapter-switcher ${compact ? "is-compact" : ""}`} aria-label="选择学习章节">
      {chapters.map((chapter) => (
        <a
          key={chapter.number}
          href={chapter.number === 3 ? "./" : `?chapter=${chapter.number}`}
          className={chapter.number === current ? "is-current" : ""}
          aria-current={chapter.number === current ? "page" : undefined}
          title={`第 ${chapter.number} 章 · ${chapter.label}`}
        >
          <span>{String(chapter.number).padStart(2, "0")}</span>
          {!compact && <small>{chapter.label}</small>}
        </a>
      ))}
    </nav>
  );
}
