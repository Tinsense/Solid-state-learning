import type { CompanionChapter, CompanionUnit } from "./companionChapters";

const unit = (index: string, id: string, title: string, english: string, question: string, pages: string, paragraphs: string[], extra: Partial<CompanionUnit> = {}): CompanionUnit => ({
  meta: { index, id, title, english, question, reference: `Kittel 8e, Chapter 6, pp. ${pages}` },
  paragraphs,
  ...extra,
});

export const chapter6: CompanionChapter = {
  number: 6,
  english: "Free Electron Fermi Gas",
  title: "自由电子费米气体",
  pages: "pp. 131–160",
  hero: "电子不是经典小球，\n而是填满态的费米海。",
  lead: "从一维盒子的能级开始，数清自旋与波矢态，再进入三维费米球。费米面附近极薄的热激发层，连接金属的小电子热容、电导、霍尔效应和热导。",
  metrics: ["06 主题单元", "04 逐步推导", "03 交互实验"],
  units: [
    unit("00", "overview", "章概览", "Overview", "为什么导电电子很多，电子热容却很小？", "131–134", [
      "自由电子模型把离子实视为提供平均背景的正电荷；导电电子在金属体积中占据单粒子量子态。它保留电子的动能与泡利不相容，却暂不处理周期势如何打开能带间隙。后者属于第七章。",
      "最容易误解的地方是把费米气体当作经典气体：经典粒子随温度平滑分布，费米子在零温先从低能级填满至费米能。升温只改变费米面附近约 $k_BT$ 宽的一层占据，而不是让全部电子都从零开始吸热。",
      "本章的一条线索是“态数”：一维量子化给出离散能级，三维周期边界给出 $k$ 空间网格，体积计数给出 $k_F$ 和 $E_F$，再由费米面附近的态密度求出热与输运响应。",
    ]),
    unit("01", "one-dimensional", "一维量子化与泡利填充", "One-dimensional levels", "为什么第 N 个电子不能与前面的电子挤进同一轨道？", "134–136", [
      "长度为 $L$ 的无限深势阱要求波函数在两端为零。非平凡解只能容纳整数个半波：$\\psi_n(x)=\\sqrt{2/L}\\sin(n\\pi x/L)$，$n=1,2,\\ldots$。归一化系数来自 $\\int_0^L|\\psi_n|^2dx=1$。",
      "动能算符作用在正弦函数上会带出 $k_n^2=(n\\pi/L)^2$，所以能量随 $n^2$ 增长。每个空间轨道有两个自旋态，因此零温、偶数 $N$ 个电子填满到 $n_F=N/2$；电子不可简单地全部落到 $n=1$。",
      "硬壁驻波的 $k_n=n\\pi/L$ 与下一节周期边界平面波的 $k_n=2\\pi n/L$ 是不同的边界条件；热力学极限下物理态密度相同，但数态时不能把两套间隔混用。",
    ], {
      formula: { latex: "\\psi_n=\\sqrt{\\frac2L}\\sin\\frac{n\\pi x}{L},\\quad E_n=\\frac{\\hbar^2\\pi^2n^2}{2mL^2},\\quad E_F=\\frac{\\hbar^2\\pi^2N^2}{8mL^2}", meaning: "硬壁边界使波长离散；自旋二重简并决定最高占据轨道。", variables: ["n：正整数轨道序号", "N：偶数电子数", "m：电子质量"] },
      derivations: [{ id: "fermi-1d", title: "从边界条件到一维费米能", result: "E_F=\\hbar^2\\pi^2N^2/(8mL^2)", meaning: "能级量子化与泡利填充是两个独立步骤。", variables: ["L：盒长", "n_F：零温最高占据的轨道序号"], steps: [
        { title: "写薛定谔方程", explanation: "盒内势能为零，只剩动能算符。", latex: "-\\frac{\\hbar^2}{2m}\\frac{d^2\\psi}{dx^2}=E\\psi" },
        { title: "施加两端硬壁", explanation: "在 x=0、L 处波函数为零，允许的正弦波数是整数倍。", latex: "\\psi_n=A\\sin(n\\pi x/L),\\qquad k_n=n\\pi/L" },
        { title: "归一化并求能量", explanation: "正弦平方在盒中的积分为 L/2；二阶导数等于 −k²ψ。", latex: "A=\\sqrt{2/L},\\qquad E_n=\\hbar^2k_n^2/(2m)" },
        { title: "数自旋态", explanation: "每个 n 对应 ↑、↓ 两个轨道；N 个电子填到 n_F=N/2。", latex: "2n_F=N,\\qquad E_F=E_{n_F}=\\frac{\\hbar^2\\pi^2N^2}{8mL^2}" },
      ] }],
      check: { id: "spin-count", question: "一维硬壁盒内，零温 8 个电子最高填到哪个空间轨道？", choices: [
        { label: "n=4", correct: true, feedback: "每个 n 有两种自旋，8 个电子填满 n=1,2,3,4。" },
        { label: "n=8", feedback: "忽略了电子的自旋二重简并。" },
        { label: "全部在 n=1", feedback: "泡利原理不允许同一单粒子态容纳多个相同费米子。" },
      ] },
    }),
    unit("02", "fermi-surface", "三维费米球与态密度", "Fermi sphere & DOS", "为什么 $k_F$ 正比电子密度的三分之一次方？", "136–141", [
      "周期边界下 $k_i=2\\pi n_i/L$，每个允许的三维 $k$ 点占据 $(2\\pi)^3/V$ 的波矢空间体积。每个 $k$ 点仍有两种自旋。零温由低能到高能填充，$E=\\hbar^2k^2/(2m)$ 的等能面是球面，全部占据态形成半径 $k_F$ 的费米球。",
      "把球体积乘以 $k$ 点密度与自旋因子，可得 $N=2[V/(2\\pi)^3](4\\pi k_F^3/3)=Vk_F^3/(3\\pi^2)$。由此 $k_F=(3\\pi^2n)^{1/3}$，$E_F=\\hbar^2k_F^2/(2m)$，$v_F=\\hbar k_F/m$，其中 $n=N/V$。",
      "态密度 $g(E)=dN/dE$ 来自球壳而不是球体：三维抛物能带给 $g(E)\\propto\\sqrt E$。它在费米能处的值 $g(E_F)=3N/(2E_F)$，后面决定低温热容；此 $g$ 已把两种自旋算入。",
    ], {
      formula: { latex: "k_F=(3\\pi^2n)^{1/3},\\quad E_F=\\frac{\\hbar^2k_F^2}{2m},\\quad g(E)=\\frac{V}{2\\pi^2}\\left(\\frac{2m}{\\hbar^2}\\right)^{3/2}\\sqrt E", meaning: "三维球体积决定费米半径；球壳计数决定能量态密度。", variables: ["n=N/V：电子数密度", "g(E)：含双自旋的总态密度", "E_F：零温费米能"] },
      derivations: [{ id: "fermi-3d", title: "逐层数出三维态密度", result: "N=Vk_F^3/(3\\pi^2),\\quad g(E_F)=3N/(2E_F)", meaning: "因子 2 来自自旋，因子 4π/3 来自球体积。", variables: ["V=L³", "k_F：费米球半径"], steps: [
        { title: "确定一个态的体积", explanation: "三方向波矢间隔都为 2π/L。", latex: "\\Delta k_x\\Delta k_y\\Delta k_z=(2\\pi)^3/V" },
        { title: "数半径 k 内的轨道", explanation: "球体积乘态点密度，再乘两种自旋。", latex: "N(<k)=2\\frac{V}{(2\\pi)^3}\\frac{4\\pi k^3}{3}=\\frac{Vk^3}{3\\pi^2}" },
        { title: "换成能量", explanation: "自由粒子 $k=\\sqrt{2mE}/\\hbar$。", latex: "N(<E)=\\frac{V}{3\\pi^2}\\left(\\frac{2mE}{\\hbar^2}\\right)^{3/2}" },
        { title: "求导得到 DOS", explanation: "对能量求导，不要把累计态数直接当 DOS。", latex: "g(E)=\\frac{dN}{dE}=\\frac{V}{2\\pi^2}\\left(\\frac{2m}{\\hbar^2}\\right)^{3/2}\\sqrt E" },
      ] }],
      figure: "fermi-sphere",
      check: { id: "density-scaling", question: "自由电子密度变为 8 倍时，$k_F$ 变为多少倍？", choices: [
        { label: "2 倍", correct: true, feedback: "k_F∝n^(1/3)，8^(1/3)=2。" },
        { label: "8 倍", feedback: "要对三维球体积开三次方。" },
        { label: "64 倍", feedback: "这是把能量的平方关系也误加到了波矢上。" },
      ] },
    }),
    unit("03", "heat-capacity", "费米分布与电子热容", "Fermi occupation & heat capacity", "热能为什么只改变费米面附近的电子？", "136–147", [
      "有限温度下，能量为 $E$ 的单粒子态占据概率为 $f(E)=[e^{(E-\\mu)/(k_BT)}+1]^{-1}$。化学势 $\\mu$ 由总粒子数守恒决定；在 $E=\\mu$ 处 $f=1/2$。低温时阶跃只在宽度约 $k_BT$ 的区域被抹平。",
      "低温、三维自由电子气的电子热容是 $C_{V,e}=\\gamma T$，其中 $\\gamma=(\\pi^2/3)g(E_F)k_B^2=(\\pi^2/2)Nk_B^2/E_F$。这里 $g(E_F)$ 是含双自旋的整块样品总态密度。除以 $Nk_B$ 后得到 $(\\pi^2/2)(T/T_F)$。",
      "这一线性热容不是经典的 $3Nk_B/2$。当 $T\\ll T_F$ 时，虽然 $N$ 很大，但仅约 $Nk_BT/E_F$ 个电子可在泡利允许的空态附近改变占据；每个活跃电子可交换约 $k_BT$ 的能量。重费米子材料的异常大 $\\gamma$ 则意味着很大的低能态密度，超出裸自由电子质量的简单模型。",
    ], {
      formula: { latex: "f(E)=\\frac1{e^{(E-\\mu)/(k_BT)}+1},\\qquad C_{V,e}=\\frac{\\pi^2}{2}Nk_B\\frac{T}{T_F}", meaning: "费米分布的热模糊只发生在化学势附近，导致电子热容与 T 成正比。", variables: ["μ：化学势，由 N 守恒确定", "T_F=E_F/k_B：费米温度", "公式适用 T≪T_F 的三维自由电子气"] },
      derivations: [{ id: "sommerfeld-cv", title: "由费米窗口得到线性电子热容", result: "C_{V,e}=(\\pi^2/3)g(E_F)k_B^2T", meaning: "Sommerfeld 展开的二阶温度项给出准确系数。", variables: ["g(E_F)：含两自旋的总态密度"], steps: [
        { title: "写粒子数与能量", explanation: "用态密度乘费米占据积分；随温度改变 μ 以保持 N 不变。", latex: "N=\\int_0^\\infty g(E)f(E)dE,\\quad U=\\int_0^\\infty Eg(E)f(E)dE" },
        { title: "限定低温窗口", explanation: "远低于 μ 的态几乎始终满占据，远高于 μ 的态几乎始终为空。", latex: "|E-\\mu|\\lesssim k_BT" },
        { title: "做 Sommerfeld 展开", explanation: "保留 T² 项并同时满足 N 守恒，得到能量的主要热修正。", latex: "U(T)-U(0)=\\frac{\\pi^2}{6}g(E_F)(k_BT)^2+O(T^4)" },
        { title: "对 T 求导", explanation: "最终电子热容正比于费米能处的态密度。", latex: "C_{V,e}=\\frac{\\pi^2}{3}g(E_F)k_B^2T=\\frac{\\pi^2}{2}Nk_B\\frac{T}{T_F}" },
      ] }],
      figure: "fermi-step",
      check: { id: "active-electrons", question: "当 $T\\ll T_F$，主要参与新增热激发的电子在哪里？", choices: [
        { label: "费米面附近", correct: true, feedback: "深处没有可用的邻近空态，只有费米面附近的占据能改变。" },
        { label: "所有已占据态同等参与", feedback: "泡利阻塞使深处态无法轻易改变占据。" },
        { label: "只有最低能态", feedback: "最低能态通常仍是满占据。" },
      ] },
    }),
    unit("04", "transport", "电导、霍尔效应与热导", "Transport & Hall effect", "同一个散射时间如何连接三种输运？", "147–157", [
      "在弛豫时间近似中，电子在两次随机化碰撞之间受电场加速。稳态漂移速度大小为 $eE\\tau/m$，电流密度给出 $\\sigma=ne^2\\tau/m$，$\\rho=1/\\sigma$。$\\tau$ 是动量弛豫时间；这不是说电子每 $\\tau$ 秒必定与某个离子硬球碰撞一次。",
      "在弱磁场、单种电子载流子且各向同性抛物能带的模型下，洛伦兹力把纵向漂移偏转，横向积累电场直到受力平衡，霍尔系数 $R_H=E_y/(j_xB_z)=-1/(ne)$，符号表示负电荷。多能带或复杂费米面中该简单关系可能失效，不能仅凭一个霍尔系数无条件倒推真实载流子数。",
      "同样的费米面附近电子还运输热。对低温简并气、主要为弹性且能量依赖较弱的散射，Wiedemann–Franz 关系为 $\\kappa_e/(\\sigma T)=L_0=(\\pi^2/3)(k_B/e)^2$。声子热导不包含在这里；强非弹性散射和能量依赖的 $\\tau$ 也可使实测 Lorenz 数偏离 $L_0$。",
    ], {
      formula: { latex: "\\sigma=\\frac{ne^2\\tau}{m},\\quad R_H=-\\frac1{ne},\\quad \\frac{\\kappa_e}{\\sigma T}=\\frac{\\pi^2}{3}\\left(\\frac{k_B}{e}\\right)^2", meaning: "这三式分别连接电荷漂移、横向磁偏转和电子热流，适用假设并不完全相同。", variables: ["τ：动量弛豫时间", "R_H：单电子带弱场霍尔系数", "κ_e：仅电子部分热导率"] },
      derivations: [{ id: "drude-hall", title: "漂移电导与霍尔系数的符号", result: "\\sigma=ne^2\\tau/m,\\quad R_H=-1/(ne)", meaning: "先约定电子电荷为 −e，避免霍尔符号混乱。", variables: ["e>0：元电荷大小", "B_z：垂直磁场"], steps: [
        { title: "写平均运动方程", explanation: "电场驱动与弛豫项平衡；电子带负电。", latex: "m\\dot{\\mathbf v}=-e(\\mathbf E+\\mathbf v\\times\\mathbf B)-m\\mathbf v/\\tau" },
        { title: "先令 B=0", explanation: "稳态平均漂移方向与电场相反，但电流与电场同向。", latex: "\\mathbf v_d=-e\\tau\\mathbf E/m,\\quad \\mathbf j=-ne\\mathbf v_d=\\sigma\\mathbf E" },
        { title: "横向开路条件", explanation: "在约定 $j_y=0$、$B=B_z\\hat z$ 时，由 y 方向的洛伦兹力平衡得到 E_y=v_xB_z。", latex: "E_y=v_xB_z,\\qquad j_x=-nev_x" },
        { title: "代入霍尔定义", explanation: "消去漂移速度，负号指示单电子型载流子。", latex: "R_H=\\frac{E_y}{j_xB_z}=-\\frac1{ne}" },
      ] }],
      figure: "hall-transport",
      check: { id: "hall-limit", question: "实测 $R_H$ 与 $-1/(ne)$ 明显不符时，最谨慎的结论是什么？", choices: [
        { label: "简单单电子带模型可能不适用", correct: true, feedback: "多带、各向异性或散射细节都可能改变霍尔响应。" },
        { label: "电子一定不存在", feedback: "偏离简单模型不能证明没有电子载流子。" },
        { label: "原书公式必然错误", feedback: "应先检查模型前提。" },
      ] },
    }),
    unit("05", "map", "知识地图", "Chapter map", "这章如何从一个电子走到宏观金属性质？", "131–157", [
      "一维盒子先展示边界条件如何限制轨道，并由泡利原理引入填充。三维周期边界把问题变成 $k$ 空间计数，球体积决定 $E_F$，球壳决定 $g(E_F)$。有限温度只在费米面附近重新分配占据，因此电子热容是低温线性项。",
      "电输运再引入弛豫时间，磁场给横向霍尔信号，热流给电子热导。要记住三者的适用边界：自由电子费米气体描述动能与统计，但晶体真实能带、复杂费米面与散射机制还需要后续章节。",
    ]),
  ],
  summary: [
    "泡利原理使电子填满至费米能，而非全部落入最低态。",
    "三维态计数给 $k_F=(3\\pi^2n)^{1/3}$，球壳给 $g(E_F)$。",
    "低温只有费米面附近参与热激发，电子热容 $C_{V,e}\\propto T$。",
    "电导、霍尔和电子热导共享费米面物理，但各有模型前提。",
  ],
  exercises: [
    { id: "c6-1", level: 1, title: "一维填充", prompt: "无限深一维盒中放入 12 个不相互作用的电子，零温最高占据轨道序号是多少？", hints: ["每个空间轨道有两种自旋。"], solution: "每个 n 容纳两名相反自旋电子，因此最高填到 n_F=12/2=6。", solutionLatex: "n_F=N/2=6" },
    { id: "c6-2", level: 2, title: "电子密度缩放", prompt: "三维自由电子密度提高到 8 倍，$k_F$、$E_F$ 与 $v_F$ 分别怎样变化？", hints: ["k_F∝n^(1/3)", "E_F∝k_F²，v_F∝k_F。"], solution: "k_F 与 v_F 均变为 2 倍，E_F 变为 4 倍。", solutionLatex: "k_F' =2k_F,\\quad E_F'=4E_F,\\quad v_F'=2v_F" },
    { id: "c6-3", level: 2, title: "低温热容比", prompt: "同一金属在仍满足 $T\\ll T_F$ 的条件下，温度从 10 K 升到 20 K，电子热容近似变化多少？", hints: ["电子热容的首项为 γT。"], solution: "若能保持低温简并条件，电子热容近似翻倍；不能把声子 T³ 项混入。", solutionLatex: "C_{V,e}(20)/C_{V,e}(10)\\simeq2" },
    { id: "c6-4", level: 3, title: "霍尔符号与模型边界", prompt: "单电子带模型中若载流子数密度加倍，$R_H$ 如何变化？为何真实多带金属未必如此？", hints: ["R_H=−1/(ne) 只对单种各向同性载流子成立。"], solution: "理想单电子带模型下负号不变、绝对值减半。多带的电子与空穴对横向电导的权重不同，不能由总数简单求倒数。", solutionLatex: "R_H'=-1/(2ne)=R_H/2" },
  ],
};
