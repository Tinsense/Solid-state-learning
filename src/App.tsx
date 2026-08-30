import { useEffect, useMemo, useRef, useState } from "react";
import { Fragment } from "react";
import { derivations, exercises, sectionCopy, sections } from "./content/chapter3";
import { Derivation } from "./components/Derivation";
import { Formula, FormulaCard } from "./components/Formula";
import { ConceptCheck, Exercise, ReadingCallout, SectionHeader, SourceNote } from "./components/Learning";
import { BondingStage, DensityBonding, ElasticConstantsLab, ElasticWaveExplorer, InverseElasticLab, IonicLattice, KnowledgeMap, LennardJonesLab, LondonInteraction, MadelungChain, PauliLab, RadiiExplorer, StrainExplorer } from "./components/Figures";
import { LatticeAtmosphere } from "./components/LatticeAtmosphere";
import { useLiquidGlassSystem } from "./lib/liquidGlass";
import { ChapterSwitcher } from "./components/ChapterSwitcher";
import { CompanionChapterPage } from "./components/CompanionChapterPage";
import { companionChapters } from "./content/companionChapters";
import { CHAPTER_CHANGE_EVENT, readChapter } from "./lib/chapterNavigation";

const Icon = ({ name }: { name: "sun" | "moon" | "menu" | "search" | "close" | "arrow" }) => {
  const paths = {
    sun: <><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></>,
    moon: <path d="M20 15.6A8.5 8.5 0 0 1 8.4 4 8.5 8.5 0 1 0 20 15.6Z"/>,
    menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m20 20-4.4-4.4"/></>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5"/>
  };
  return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">{paths[name]}</svg>;
};

const prose = (items: string[]) => <div className="prose">{items.map((text) => <p key={text}>{text}</p>)}</div>;

function ChapterThreeApp() {
  useLiquidGlassSystem();
  const [theme, setTheme] = useState<"dark" | "light">(() => (localStorage.getItem("kittel-theme") as "dark" | "light") || "dark");
  const [active, setActive] = useState("overview");
  const [railOpen, setRailOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [completed, setCompleted] = useState<Set<string>>(() => new Set(JSON.parse(localStorage.getItem("kittel-progress") || "[]")));
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("kittel-theme", theme);
  }, [theme]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: "-20% 0px -60%", threshold: [0, .15, .5] });
    sections.forEach(({ id }) => { const node = document.getElementById(id); if (node) observer.observe(node); });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearchOpen(true); }
      if (event.key === "Escape") { setSearchOpen(false); setRailOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => { if (searchOpen) requestAnimationFrame(() => searchRef.current?.focus()); }, [searchOpen]);

  const complete = (id: string) => setCompleted((previous) => {
    const next = new Set(previous); next.add(id); localStorage.setItem("kittel-progress", JSON.stringify([...next])); return next;
  });
  const progress = Math.round(completed.size / 6 * 100);
  const go = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); setRailOpen(false); setSearchOpen(false); };
  const openDerivation = (key: "wave100" | "wave110" | "wave111") => {
    window.dispatchEvent(new CustomEvent("open-derivation", { detail: key }));
    setTimeout(() => document.getElementById(`derivation-${key}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 20);
  };

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return [
      ...sections.map((s) => ({ id: s.id, title: `${s.index} · ${s.title}`, text: `${s.english} ${s.question}` })),
      ...Object.values(derivations).map((d) => ({ id: `derivation-${d.id}`, title: d.title, text: `${d.meaning} ${d.variables.join(" ")}` }))
    ].filter((item) => `${item.title} ${item.text}`.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  return (
    <>
      <LatticeAtmosphere />
      <header className="site-header liquid-panel">
        <button className="brand" type="button" onClick={() => go("overview")} aria-label="返回章首页">
          <span className="brand-glyph" aria-hidden="true"><i/><i/><i/><i/></span>
          <span><strong>晶格</strong><small>KITTEL · CHAPTER 03</small></span>
        </button>
        <ChapterSwitcher current={3} compact/>
        <div className="chapter-title"><span>03</span><p>Crystal Binding<br/>and Elastic Constants</p></div>
        <div className="header-actions">
          <button className="top-action" type="button" onClick={() => setSearchOpen(true)} aria-label="搜索知识点"><Icon name="search"/><span>搜索</span><kbd>⌘ K</kbd></button>
          <button className="top-action icon-only" type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="切换明暗主题"><Icon name={theme === "dark" ? "sun" : "moon"}/></button>
          <button className="progress-chip top-action" type="button" onClick={() => go("exercises")} aria-label={`学习进度 ${progress}%`}>
            <span className="mini-ring" style={{"--progress": `${progress * 3.6}deg`} as React.CSSProperties}><b>{progress}</b></span><span>学习进度<small>{completed.size} / 6 checks</small></span>
          </button>
        </div>
      </header>

      <button className="mobile-rail-toggle liquid-button" type="button" onClick={() => setRailOpen(!railOpen)} aria-expanded={railOpen} aria-controls="chapter-rail"><Icon name={railOpen ? "close" : "menu"}/><span>章节目录</span></button>
      {railOpen && <button className="rail-scrim" type="button" aria-label="关闭目录" onClick={() => setRailOpen(false)}/>} 

      <aside className={`chapter-rail ${railOpen ? "is-open" : ""}`} id="chapter-rail" aria-label="第三章目录">
        <div className="rail-label"><span>CH.</span><strong>03</strong></div>
        <ChapterSwitcher current={3}/>
        <nav>{sections.map((item) => <button key={item.id} type="button" className={`rail-item ${active === item.id ? "is-active" : ""}`} onClick={() => go(item.id)}><span>{item.index}</span><span>{item.title}<small>{item.english}</small></span></button>)}</nav>
        <div className="rail-footer"><span>Based on</span><strong>Kittel · 8th ed.</strong><small>pp. 47–89</small></div>
      </aside>

      <main id="main-content">
        <section id="overview" className="hero section-shell liquid-panel hero-module">
          <div className="hero-copy">
            <p className="overline">INTERACTIVE ELECTRONIC TEXTBOOK · 中文精讲</p>
            <h1>从一条势能曲线，<br/><span>听见晶体的声音。</span></h1>
            <p className="hero-lead">结合决定平衡距离，势阱曲率决定弹性，弹性与密度共同决定声速。这是 Kittel 第三章真正贯穿始终的物理主线。</p>
            <div className="hero-actions"><button className="liquid-button primary hero-start-glass" type="button" onClick={() => go("binding")}><span>开始学习</span><Icon name="arrow"/></button><button className="liquid-button secondary hero-map-glass" type="button" onClick={() => go("map")}><span>先看知识地图</span></button></div>
          </div>
          <div className="hero-lattice" aria-label="三维晶格和穿过其中的弹性波抽象动画" role="img">
            <div className="lattice-plane plane-a"/><div className="lattice-plane plane-b"/><div className="lattice-plane plane-c"/>
            {Array.from({length: 27}, (_, i) => <i key={i} style={{"--x":i%3,"--y":Math.floor(i/3)%3,"--z":Math.floor(i/9)} as React.CSSProperties}/>) }
            <svg viewBox="0 0 500 250" aria-hidden="true"><path d="M15 128c55-90 108 90 164 0s109-90 164 0 109 90 150 0"/></svg>
            <span className="hero-label label-potential">U(R)<small>interaction</small></span><span className="hero-label label-curvature">d²U/dR²<small>stiffness</small></span><span className="hero-label label-wave">v<small>sound</small></span>
          </div>
          <div className="hero-metrics"><div><span>学习路径</span><strong>11</strong><small>主题单元</small></div><div><span>渐进推导</span><strong>10</strong><small>公式工作台</small></div><div><span>交互实验</span><strong>09</strong><small>实时物理图</small></div></div>
          <SourceNote>{sections[0].reference}；页面内容为教学式重写，所有插图均为重新绘制。</SourceNote>
        </section>

        <section id="binding" className="section-shell content-section">
          <SectionHeader section={sections[1]}/>{prose(sectionCopy.binding)}<BondingStage/>
          <ReadingCallout title="“结合能为正”与“晶体能量为负”并不矛盾"><p>若以分离原子为零能量，稳定晶体的总势能 U<sub>crystal</sub>&lt;0；把晶体拆开所需的能量 E<sub>coh</sub>=−U<sub>crystal</sub>&gt;0。阅读数据表时一定先确认符号约定。</p></ReadingCallout>
          <ConceptCheck id="binding-sign" question="以彼此无限远的中性原子为零能量，稳定晶体的总能量应当是什么符号？" choices={[{label:"负值",correct:true,feedback:"稳定结构位于势能最低点；拆散所需的结合能则取其绝对值为正。"},{label:"正值",feedback:"正的通常是“拆散晶体所需能量”的大小，而不是晶体相对分离原子的势能。"},{label:"必须为零",feedback:"只有把晶体本身选作能量零点时才可能这样记。"}]} onComplete={complete}/>
          <SourceNote>{sections[1].reference}</SourceNote>
        </section>

        <section id="inert-gas" className="section-shell content-section">
          <SectionHeader section={sections[2]}/>{prose(sectionCopy.inert)}
          <LondonInteraction/><Derivation data={derivations.london}/><PauliLab/><LennardJonesLab/><Derivation data={derivations.lennardJones}/>
          <div className="split-explanation"><div><span className="overline">FROM PAIR TO CRYSTAL</span><h3>孤立原子对 ≠ fcc 晶体</h3><p>晶体中的每个原子同时与多壳层原子作用。把几何信息压缩进晶格和之后，平衡最近邻距从双原子势的 1.122σ 变为约 1.09σ。</p></div><div className="number-stack"><span><b>S₁₂</b>12.13188</span><span><b>S₆</b>14.45392</span><small>Kittel Eq. (12) · fcc lattice sums</small></div></div>
          <Derivation data={derivations.fcc}/>
          <ConceptCheck id="london-scale" question="若原子距离 R 增大为原来的 2 倍，London attraction 的大小变为多少？" choices={[{label:"1 / 8",feedback:"这是 R⁻³ 偶极耦合幅度的缩放，不是能量的最终缩放。"},{label:"1 / 16",feedback:"需要对距离倍率取六次方。"},{label:"1 / 64",correct:true,feedback:"(2R)⁻⁶/R⁻⁶=2⁻⁶=1/64，所以色散吸引随距离衰减极快。"},{label:"1 / 36",feedback:"指数是 6，不是把距离直接乘 6。"}]} onComplete={complete}/>
          <SourceNote>{sections[2].reference}；fcc 晶格和与式 (11)–(16) 已按原书逐项核对。</SourceNote>
        </section>

        <section id="ionic" className="section-shell content-section">
          <SectionHeader section={sections[3]}/>{prose(sectionCopy.ionic)}
          <div className="unit-switch-panel"><div><span className="overline">SI DEFAULT · CGS TRACE</span><h3>同一物理，两套单位制</h3><p>本站默认使用现代 SI。Kittel 原书本节采用 CGS，因此原书的 q²/r 在 SI 中必须补上 1/(4πε₀)。</p></div><div><Formula latex={`U_{ij}^{\\rm SI}=\\pm\\frac{q^2}{4\\pi\\varepsilon_0r_{ij}}`}/><Formula latex={`U_{ij}^{\\rm CGS}=\\pm\\frac{q^2}{r_{ij}}`}/></div></div>
          <FormulaCard latex={`U_{\\rm tot}^{\\rm SI}=N\\left[z\\lambda e^{-R/\\rho}-\\frac{\\alpha q^2}{4\\pi\\varepsilon_0R}\\right]`} meaning="最近邻短程排斥与全晶格长程库仑能的竞争给出平衡距离。N 是离子对数，z 是最近邻配位数。" variables={["λ、ρ：经验排斥势参数","α：Madelung constant","R：最近邻距离"]}/>
          <MadelungChain/><Derivation data={derivations.madelung}/><IonicLattice/>
          <ReadingCallout title="为什么三维晶格和不能“随便逐壳加”？"><p>1/r 衰减慢，而每个壳层中的格点数随半径增长。正负大项的抵消依赖求和边界是否保持宏观电中性。Ewald summation（Ewald 求和）通过高斯屏蔽把问题拆成实空间与倒空间的两个快速收敛和，并明确处理自能和边界条件。</p></ReadingCallout>
          <ConceptCheck id="madelung-geometry" question="若 α 的定义改用晶格常数 a 而不是最近邻距 R，α 的数值会怎样？" choices={[{label:"一定不变",feedback:"α 无量纲，但它依赖选作分母的参考长度。"},{label:"随长度约定重标度",correct:true,feedback:"物理能量 α/R 不变；若参考长度改变，α 必须反向重标度。"},{label:"变成有量纲",feedback:"α 仍是无量纲几何量，只是数值约定改变。"}]} onComplete={complete}/>
          <SourceNote>{sections[3].reference}；SI/CGS 对照按 Kittel p. 62 的说明转换。</SourceNote>
        </section>

        <section id="other-bonds" className="section-shell content-section">
          <SectionHeader section={sections[4]}/>{prose(sectionCopy.bonds)}<DensityBonding/>
          <div className="editorial-table" role="table" aria-label="四类晶体结合的比较"><div role="row"><span>结合类型</span><span>电子图景</span><span>方向性</span><span>代表性质</span></div><div role="row"><strong>van der Waals</strong><span>相关瞬时偶极</span><span>弱</span><span>低熔点、软</span></div><div role="row"><strong>ionic</strong><span>电荷转移</span><span>弱</span><span>高结合能、绝缘</span></div><div role="row"><strong>covalent</strong><span>核间共享电子对</span><span>强</span><span>硬、结构定向</span></div><div role="row"><strong>metallic</strong><span>离域价电子</span><span>通常较弱</span><span>导电、延展</span></div></div>
          <SourceNote>{sections[4].reference}</SourceNote>
        </section>

        <section id="radii" className="section-shell content-section">
          <SectionHeader section={sections[5]}/>{prose(sectionCopy.radii)}<RadiiExplorer/>
          <ReadingCallout title="半径是结构参数，不是粒子照片"><p>从衍射实验得到的是核间距。把距离拆成 r<sub>cation</sub>+r<sub>anion</sub> 需要一个约定和参考体系。因此离子半径表必须连同价态、配位数与数据来源一起使用。</p></ReadingCallout>
          <SourceNote>{sections[5].reference}</SourceNote>
        </section>

        <section id="strain" className="section-shell content-section">
          <SectionHeader section={sections[6]}/>{prose(sectionCopy.strain)}
          <FormulaCard latex={`\\varepsilon_{ij}=\\frac12\\left(\\frac{\\partial u_i}{\\partial x_j}+\\frac{\\partial u_j}{\\partial x_i}\\right),\\qquad \\delta=\\frac{\\Delta V}{V}=\\operatorname{tr}\\boldsymbol\\varepsilon`} meaning="对称小应变张量排除了刚体转动；其迹就是一阶体积变化。" variables={["uᵢ：位移场分量","εᵢⱼ：tensor strain","δ：dilation（体膨胀率）"]}/>
          <StrainExplorer/><Derivation data={derivations.strain}/>
          <ConceptCheck id="strain-factor" question="若简单剪切位移为 u=γy、v=0，标准张量分量 εxy 等于多少？" choices={[{label:"γ",feedback:"这是 engineering shear strain，也就是直角的总角度变化。"},{label:"γ / 2",correct:true,feedback:"εxy=½(∂u/∂y+∂v/∂x)=γ/2。"},{label:"2γ",feedback:"张量分量反而比工程剪切小一半。"}]} onComplete={complete}/>
          <SourceNote>{sections[6].reference}；Kittel 的 e_xy 按工程剪切记号解释，本站同时显示标准张量形式。</SourceNote>
        </section>

        <section id="elasticity" className="section-shell content-section">
          <SectionHeader section={sections[7]}/>{prose(sectionCopy.elasticity)}<Derivation data={derivations.stiffness}/><ElasticConstantsLab/><Derivation data={derivations.bulk}/>
          <ConceptCheck id="c44-role" question="在 C₁₁ 与 C₁₂ 不变时，单独增大 C₄₄ 最直接改变哪种响应？" choices={[{label:"静水压缩",feedback:"B=(C₁₁+2C₁₂)/3，不含 C₄₄。"},{label:"纯剪切",correct:true,feedback:"C₄₄ 是立方晶体的剪切刚度，直接提高剪切能量和相应横波声速。"},{label:"体积模量",feedback:"体积模量不含 C₄₄。"}]} onComplete={complete}/>
          <SourceNote>{sections[7].reference}；刚度矩阵、能量密度与 B 的系数已按 Kittel Eqs. (43), (50), (54) 核对。</SourceNote>
        </section>

        <section id="waves" className="section-shell content-section">
          <SectionHeader section={sections[8]}/>{prose(sectionCopy.waves)}
          <FormulaCard latex={`\\rho\\,\\ddot u_i=\\partial_j\\sigma_{ij},\\qquad \\det\\left(\\Gamma_{ik}-\\rho v^2\\delta_{ik}\\right)=0`} meaning="动量守恒给出连续介质运动方程；把平面波代入后得到 Christoffel 本征值问题。" variables={["Γᵢₖ=Cᵢⱼₖₗnⱼnₗ：Christoffel matrix","n=K/|K|：传播方向","本征向量：极化方向"]}/>
          <ElasticWaveExplorer onDerive={openDerivation}/><Derivation data={derivations.wave100}/><Derivation data={derivations.wave110}/><Derivation data={derivations.wave111}/><InverseElasticLab/>
          <ConceptCheck id="wave-polarization" question="[110] 方向 T₂ 模式的粒子位移方向是什么？" choices={[{label:"[110]",feedback:"这与 K 平行，是纵波 L。"},{label:"[001]",feedback:"这是面外横波 T₁。"},{label:"[1 −1 0]",correct:true,feedback:"[1 −1 0]·[110]=0，所以它是面内横向极化 T₂。"}]} onComplete={complete}/>
          <SourceNote>{sections[8].reference}；三方向有效常数按 Kittel Fig. 20 与 Eqs. (59)–(71) 核对。</SourceNote>
        </section>

        <section id="map" className="section-shell content-section">
          <SectionHeader section={sections[9]}/><KnowledgeMap/>
          <div className="chapter-summary"><h3>把这一章压缩成四句话</h3><ol><li><span>01</span><p>电子分布决定原子间势能 <b>U(R)</b> 的形状与结合类型。</p></li><li><span>02</span><p>势能极小值给出平衡距离 <b>R₀</b> 与 cohesive energy。</p></li><li><span>03</span><p>极小值附近的曲率在连续极限中表现为弹性刚度 <b>Cᵢⱼ</b>。</p></li><li><span>04</span><p>刚度与密度组成弹性波本征值：<b>ρv²=C<sub>eff</sub></b>。</p></li></ol></div>
          <SourceNote>{sections[9].reference}</SourceNote>
        </section>

        <section id="exercises" className="section-shell content-section">
          <SectionHeader section={sections[10]}/><div className="exercise-list">{exercises.map((exercise) => <Exercise key={exercise.id} exercise={exercise}/>)}</div>
          <div className="completion-panel"><span className="overline">CHAPTER COMPLETE</span><h3>{progress === 100 ? "六个概念检查已全部完成。" : `你已完成 ${completed.size} / 6 个概念检查。`}</h3><p>真正的掌握标准不是记住公式，而是能从势能、对称性和运动方程重新推回公式。</p><div className="completion-bar"><i style={{width:`${progress}%`}}/></div><button className="text-button" type="button" onClick={() => go("overview")}>回到章首页 ↑</button></div>
          <SourceNote>{sections[10].reference}；练习为围绕原章核心问题重新编写，并非原书题目逐字复制。</SourceNote>
        </section>
      </main>

      <aside className="context-rail" aria-label="当前学习位置"><span>{sections.find((item)=>item.id===active)?.index}</span><strong>{sections.find((item)=>item.id===active)?.english}</strong><i/></aside>

      {searchOpen && <div className="search-overlay" role="dialog" aria-modal="true" aria-label="搜索知识点"><button className="search-backdrop" type="button" onClick={()=>setSearchOpen(false)} aria-label="关闭搜索"/><div className="search-panel liquid-panel"><div className="search-input"><Icon name="search"/><input ref={searchRef} value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索 London、Madelung、剪切应变…"/><button type="button" onClick={()=>setSearchOpen(false)}><Icon name="close"/></button></div><div className="search-results">{!query && <p>试试：<button onClick={()=>setQuery("Madelung")}>Madelung</button><button onClick={()=>setQuery("声速")}>声速</button><button onClick={()=>setQuery("剪切")}>剪切</button></p>}{query && searchResults.length===0 && <p>没有找到匹配内容。</p>}{searchResults.map(item=><button type="button" key={item.id} onClick={()=>go(item.id)}><span>{item.title}</span><small>{item.text}</small><Icon name="arrow"/></button>)}</div></div></div>}
    </>
  );
}

function App() {
  const [requested, setRequested] = useState(readChapter);
  const [routeKey, setRouteKey] = useState(0);
  useEffect(() => {
    const update = () => { setRequested(readChapter()); setRouteKey(value => value + 1); window.scrollTo({ top: 0, behavior: "smooth" }); };
    window.addEventListener("popstate", update);
    window.addEventListener(CHAPTER_CHANGE_EVENT, update);
    return () => { window.removeEventListener("popstate", update); window.removeEventListener(CHAPTER_CHANGE_EVENT, update); };
  }, []);
  if (requested === 1 || requested === 2 || requested === 4 || requested === 5) {
    return <Fragment key={`${requested}-${routeKey}`}><CompanionChapterPage chapter={companionChapters[requested]}/></Fragment>;
  }
  return <Fragment key={`3-${routeKey}`}><ChapterThreeApp/></Fragment>;
}

export default App;








