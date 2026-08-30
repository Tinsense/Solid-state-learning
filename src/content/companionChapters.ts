import type { DerivationData, ExerciseData, SectionMeta } from "./chapter3";

export type CompanionUnit = {
  meta: SectionMeta;
  paragraphs: string[];
  formula?: { latex: string; meaning: string; variables: string[] };
  derivations?: DerivationData[];
  callout?: { title: string; body: string };
  check?: {
    id: string;
    question: string;
    choices: { label: string; correct?: boolean; feedback: string }[];
  };
  figure?: "crystal" | "miller" | "bragg" | "reciprocal" | "structure-factor" | "mono-phonon" | "diatomic" | "planck" | "dos" | "heat-capacity" | "thermal";
};

export type CompanionChapter = {
  number: 1 | 2 | 4 | 5;
  english: string;
  title: string;
  pages: string;
  hero: string;
  lead: string;
  metrics: [string, string, string];
  units: CompanionUnit[];
  summary: string[];
  exercises: ExerciseData[];
};

const unit = (index: string, id: string, title: string, english: string, question: string, reference: string, paragraphs: string[], extra: Partial<CompanionUnit> = {}): CompanionUnit => ({
  meta: { index, id, title, english, question, reference }, paragraphs, ...extra,
});

const chapter1: CompanionChapter = {
  number: 1,
  english: "Crystal Structure",
  title: "晶体结构",
  pages: "pp. 1–22",
  hero: "先学会描述重复，\n再读懂真实晶体。",
  lead: "晶体学的核心不是背结构名称，而是把“无限多原子”压缩成三件事：平移对称、Bravais 格子与基元。它们共同决定晶胞、晶面、配位和后续的衍射规律。",
  metrics: ["06 主题单元", "04 渐进推导", "03 交互实验"],
  units: [
    unit("00", "overview", "章概览", "Overview", "为什么一个无限晶体可以由有限信息完全指定？", "Kittel 8e, Chapter 1, pp. 1–3", [
      "理想晶体是一个在三维空间周期重复的原子阵列。我们先抽去原子种类，只保留平移点，得到 Bravais 格子；再把每个格点上附着的一组原子称为基元。格子 + 基元，才是实际晶体结构。",
      "这一分解非常重要：格子回答“怎样重复”，基元回答“重复什么”。同一个 fcc 格子配上不同基元，可以得到金属 Cu、NaCl、金刚石或闪锌矿等完全不同的晶体。",
    ]),
    unit("01", "lattice", "平移格子与原胞", "Lattice & primitive cell", "什么样的平移能让晶体与自身完全重合？", "Kittel 8e, Chapter 1, pp. 3–6", [
      "任意格点之间的允许平移写成 $\\mathbf T=u_1\\mathbf a_1+u_2\\mathbf a_2+u_3\\mathbf a_3$，其中 $u_i\\in\\mathbb Z$，$\\mathbf a_i$ 是一组原始平移矢量。选择并不唯一，但由它们张成的平行六面体必须恰含一个格点。",
      "原胞体积是三个原始矢量的标量三重积 $V_c=|\\mathbf a_1\\cdot(\\mathbf a_2\\times\\mathbf a_3)|$。它是格子的几何不变量：换一组合法原始矢量，形状可以改变，体积不变。Wigner–Seitz 原胞则由“离某格点最近的空间区域”构成，完整显示局域对称性。",
    ], {
      formula: { latex: "\\mathbf T=u_1\\mathbf a_1+u_2\\mathbf a_2+u_3\\mathbf a_3,\\qquad V_c=|\\mathbf a_1\\cdot(\\mathbf a_2\\times\\mathbf a_3)|", meaning: "整数平移生成整个 Bravais 格子；标量三重积给出一个格点所占的体积。", variables: ["aᵢ：原始平移矢量", "uᵢ∈ℤ：格点整数坐标", "V_c：原胞体积"] },
      derivations: [{ id: "cell-volume", title: "为什么原胞恰含一个格点？", result: "N_{\\rm points}=\\rho_L V_c=1", meaning: "原胞是格子的最小平移重复单元，因此格点数密度与原胞体积互为倒数。", variables: ["ρ_L：格点数密度", "V_c：原胞体积"], steps: [
        { title: "构造有限晶体", explanation: "沿三条原始矢量分别重复 N₁、N₂、N₃ 次，得到一个大平行六面体。", latex: "V=N_1N_2N_3V_c" },
        { title: "计数格点", explanation: "周期边界条件下，每个整数三元组对应一个不同格点。", latex: "N_L=N_1N_2N_3" },
        { title: "求格点密度", explanation: "用格点总数除以总体积，边界贡献在热力学极限消失。", latex: "\\rho_L=\\frac{N_L}{V}=\\frac1{V_c}" },
        { title: "回到一个原胞", explanation: "密度乘单胞体积即为其中的平均格点数。", latex: "\\rho_LV_c=1", insight: "常规晶胞可以含 1、2、4 个格点；“一个格点”只对原胞成立。" },
      ] }],
    }),
    unit("02", "bravais", "Bravais 格子与立方结构", "Bravais lattices", "sc、bcc、fcc 的差别究竟是格子还是基元？", "Kittel 8e, Chapter 1, pp. 6–11", [
      "二维只有 5 类 Bravais 格子，三维有 14 类，归属于 7 个晶系。简单立方、体心立方和面心立方是三种不同的 Bravais 格子；“体心”与“面心”不是额外原子装饰，而是平移点本身的集合。",
      "以常规立方晶胞边长 $a$ 表示：sc、bcc、fcc 每胞格点数分别为 1、2、4；配位数为 6、8、12；最近邻距分别为 $a$、$\\sqrt3a/2$、$a/\\sqrt2$。fcc 与 hcp 的理想硬球堆积率相同，均约为 0.740，但堆垛序列不同。",
    ], {
      formula: { latex: "\\eta_{\\rm sc}=\\frac{\\pi}{6},\\quad \\eta_{\\rm bcc}=\\frac{\\sqrt3\\pi}{8},\\quad \\eta_{\\rm fcc}=\\frac{\\pi}{3\\sqrt2}", meaning: "把晶胞内等效硬球总体积除以晶胞体积，得到三种立方格子的堆积率。", variables: ["η：packing fraction", "a：常规立方晶胞边长"] },
      figure: "crystal",
      derivations: [{ id: "fcc-packing", title: "fcc 堆积率为何是 0.740？", result: "\\eta_{\\rm fcc}=\\frac{4(4\\pi r^3/3)}{a^3}=\\frac{\\pi}{3\\sqrt2}", meaning: "fcc 最近邻沿面对角线接触，几何约束把原子半径与晶格常数联系起来。", variables: ["r：硬球半径", "a：晶格常数"], steps: [
        { title: "数清等效原子", explanation: "8 个角原子各贡献 1/8，6 个面心原子各贡献 1/2。", latex: "N=8\\times\\frac18+6\\times\\frac12=4" },
        { title: "找到接触方向", explanation: "面对角线上依次经过角—面心—角，正好容纳四个半径。", latex: "4r=\\sqrt2a\\quad\\Rightarrow\\quad r=\\frac{a}{2\\sqrt2}" },
        { title: "计算球总体积", explanation: "晶胞中 4 个等效硬球。", latex: "V_{\\rm sphere}=4\\times\\frac{4\\pi r^3}{3}" },
        { title: "除以晶胞体积", explanation: "代入 r 与 a 的关系，a³ 完全约去。", latex: "\\eta=\\frac{V_{\\rm sphere}}{a^3}=\\frac{\\pi}{3\\sqrt2}\\simeq0.740" },
      ] }],
    }),
    unit("03", "planes", "晶向与 Miller 指数", "Crystal planes", "怎样用三个整数唯一标记一族平行晶面？", "Kittel 8e, Chapter 1, pp. 11–14", [
      "晶向 $[uvw]$ 表示从一个格点出发、沿 $u\\mathbf a_1+v\\mathbf a_2+w\\mathbf a_3$ 的方向；晶面 $(hkl)$ 则通过截距的倒数定义。操作顺序是：以晶格常数为单位写出三个轴截距，取倒数，再化为最小整数。",
      "(hkl) 表示一张晶面，{hkl} 表示由对称性等价的晶面族；[uvw] 表示一个方向，[uvw] 的尖括号族则包含所有等价方向。只有在立方晶系中，[hkl] 才必然垂直于 (hkl)。",
    ], { figure: "miller", callout: { title: "平行于某轴意味着截距无穷大", body: "无穷大取倒数得到 0。因此 (110) 面平行于 z 轴，而不是在 z=0 处截断。负截距用上划线表示，例如 (1̄10)。" } }),
    unit("04", "structures", "典型晶体结构", "Simple crystal structures", "为什么 CsCl 不是 bcc Bravais 格子？", "Kittel 8e, Chapter 1, pp. 14–20", [
      "NaCl 可看成两个彼此错开的 fcc 子晶格，每个离子有 6 个异号最近邻。CsCl 则是简单立方 Bravais 格子配上 $(0,0,0)$ 与 $(1/2,1/2,1/2)$ 的双原子基元；若把两种离子视为不同，体心平移并不能让晶体与自身重合，所以它不是 bcc Bravais 格子。",
      "金刚石结构是 fcc 格子加上 $(0,0,0)$ 与 $(1/4,1/4,1/4)$ 的双原子基元，每个原子四配位，形成四面体共价键。闪锌矿结构保留相同几何，但两个基元位置由不同元素占据。",
    ], {
      formula: { latex: "\\mathbf r_j=x_j\\mathbf a_1+y_j\\mathbf a_2+z_j\\mathbf a_3", meaning: "基元中第 j 个原子的位置用原始矢量的分数坐标表示；所有真实原子位置为 T+rⱼ。", variables: ["(xⱼ,yⱼ,zⱼ)：分数坐标", "T：任一格点平移"] },
      check: { id: "cscl-bravais", question: "把 Cs 与 Cl 视为不同原子时，CsCl 的 Bravais 格子是什么？", choices: [
        { label: "体心立方", feedback: "体心平移会交换 Cs 与 Cl，晶体并未与自身重合。" },
        { label: "简单立方 + 双原子基元", correct: true, feedback: "格点取简单立方，每点附着 Cs/Cl 两个位置即可完整生成结构。" },
        { label: "面心立方", feedback: "NaCl 的子晶格是 fcc，但 CsCl 不是。" },
      ] },
    }),
    unit("05", "map", "知识地图", "Chapter map", "如何从平移对称一路走到真实结构？", "Kittel 8e, Chapter 1, Summary", [
      "先确定允许平移，得到 Bravais 格子与原胞；再附加基元，得到原子种类和内部坐标；最后用晶向、晶面、配位数与堆积方式描述可测的结构特征。下一章的倒格子正是这套平移对称在波矢空间中的对应物。",
    ]),
  ],
  summary: ["平移矢量定义 Bravais 格子。", "原胞恰含一个格点，常规晶胞未必。", "格子加基元才等于真实晶体结构。", "Miller 指数把晶面几何压缩成整数。"],
  exercises: [
    { id: "c1-1", level: 1, title: "识别原胞与常规晶胞", prompt: "bcc 常规立方晶胞含多少个格点？它是不是原胞？", hints: ["角点共享给 8 个晶胞。", "体心点完全属于本胞。"], solution: "8×1/8+1=2 个格点，因此该常规立方晶胞不是原胞；bcc 原胞体积为 a³/2。", solutionLatex: "N=8\\times\\frac18+1=2,\\qquad V_c=\\frac{a^3}{2}" },
    { id: "c1-2", level: 2, title: "求 (213) 晶面截距", prompt: "立方晶体中 (213) 面与 x、y、z 轴的截距分别是多少？", hints: ["Miller 指数是截距的倒数。"], solution: "以晶格常数 a 为单位，截距分别为 a/2、a、a/3。", solutionLatex: "x=\\frac a2,\\quad y=a,\\quad z=\\frac a3" },
    { id: "c1-3", level: 3, title: "比较 bcc 与 fcc 密度", prompt: "同种原子且最近邻距相同时，比较 bcc 与 fcc 的原子数密度。", hints: ["先分别用最近邻距写出 a。", "bcc 每胞 2 原子，fcc 每胞 4 原子。"], solution: "bcc: a=2d/√3，n=2/a³=3√3/(4d³)；fcc: a=√2d，n=4/a³=√2/d³。fcc 略高。", solutionLatex: "n_{bcc}=\\frac{3\\sqrt3}{4d^3},\\qquad n_{fcc}=\\frac{\\sqrt2}{d^3}" },
  ],
};

const chapter2: CompanionChapter = {
  number: 2,
  english: "Wave Diffraction and the Reciprocal Lattice",
  title: "波的衍射与倒格子",
  pages: "pp. 23–46",
  hero: "把晶体放进波矢空间，\n衍射条件就变成几何。",
  lead: "实空间的周期排列会把散射只允许在一组离散倒格矢上发生。Bragg 定律、Laue 方程、Ewald 球和结构因子，其实是同一个相干叠加条件的不同语言。",
  metrics: ["06 主题单元", "04 渐进推导", "04 交互实验"],
  units: [
    unit("00", "overview", "章概览", "Overview", "为什么晶体只在少数角度产生强衍射？", "Kittel 8e, Chapter 2, pp. 23–25", [
      "X 射线、电子或中子照射周期晶体时，每个散射中心都发出次级波。绝大多数方向上相位彼此抵消；只有当相邻晶面贡献的程差是整波长时，振幅同相累加并形成尖锐峰。",
      "倒格子不是抽象装饰，而是把“所有允许相位条件”编码为格点。一次弹性衍射就是散射矢量恰好落到一个倒格点。",
    ]),
    unit("01", "bragg", "Bragg 定律", "Bragg law", "2d sinθ=nλ 从哪里来？", "Kittel 8e, Chapter 2, pp. 25–27", [
      "考虑间距为 $d$ 的平行晶面。上下两层反射波的额外路程由入射段和出射段各贡献 $d\\sin\\theta$，总程差为 $2d\\sin\\theta$。相长干涉要求它等于整数个波长。",
      "$\\theta$ 是入射束与晶面的夹角，而实验衍射仪常报告入射束与衍射束之间的 $2\\theta$。$n$ 阶反射也可等价看成间距 $d/n$ 的晶面族的一阶反射。",
    ], {
      formula: { latex: "2d\\sin\\theta=n\\lambda", meaning: "相邻晶面散射波的程差等于整波长时出现衍射峰。", variables: ["d：晶面间距", "θ：Bragg 角", "λ：波长", "n：衍射级次"] },
      derivations: [{ id: "bragg-law", title: "从程差推出 Bragg 定律", result: "\\Delta L=2d\\sin\\theta=n\\lambda", meaning: "相长干涉只要求相位差为 2π 的整数倍。", variables: ["ΔL：相邻晶面的程差"], steps: [
        { title: "投影入射段", explanation: "第二束波到达下一晶面前多走一段，其长度是面间距在传播方向上的投影。", latex: "\\Delta L_{in}=d\\sin\\theta" },
        { title: "投影出射段", explanation: "反射后从下层晶面返回同一波前还要多走相同距离。", latex: "\\Delta L_{out}=d\\sin\\theta" },
        { title: "转成相位差", explanation: "传播距离 ΔL 对应相位差 2πΔL/λ。", latex: "\\Delta\\phi=\\frac{2\\pi}{\\lambda}(2d\\sin\\theta)" },
        { title: "要求同相", explanation: "相长干涉要求 Δφ=2πn。", latex: "2d\\sin\\theta=n\\lambda" },
      ] }], figure: "bragg",
    }),
    unit("02", "reciprocal", "倒格子与 Laue 条件", "Reciprocal lattice", "实空间平移如何变成波矢空间的整数条件？", "Kittel 8e, Chapter 2, pp. 27–33", [
      "定义倒格基矢 $\\mathbf b_i$，使 $\\mathbf a_i\\cdot\\mathbf b_j=2\\pi\\delta_{ij}$。于是任意倒格矢 $\\mathbf G=h\\mathbf b_1+k\\mathbf b_2+l\\mathbf b_3$ 都满足 $e^{i\\mathbf G\\cdot\\mathbf T}=1$：对所有格子平移，平面波相位完全不变。",
      "入射与出射波矢分别为 $\\mathbf k$ 与 $\\mathbf k'$，散射矢量 $\\Delta\\mathbf k=\\mathbf k'-\\mathbf k$。所有晶胞同相叠加的条件是 $\\Delta\\mathbf k=\\mathbf G$；点乘三条原始矢量便得到三条 Laue 方程。",
    ], {
      formula: { latex: "\\mathbf b_1=2\\pi\\frac{\\mathbf a_2\\times\\mathbf a_3}{V_c},\\qquad \\Delta\\mathbf k=\\mathbf G", meaning: "倒格基矢与实空间原始矢量互为对偶；衍射要求动量转移等于倒格矢。", variables: ["G=hb₁+kb₂+lb₃", "Δk=k′−k", "aᵢ·bⱼ=2πδᵢⱼ"] },
      derivations: [{ id: "laue", title: "从晶格和推出 Laue 条件", result: "\\Delta\\mathbf k=\\mathbf G", meaning: "无限周期阵列的傅里叶谱只存在于倒格点。", variables: ["T：任意格子平移", "Δk：散射矢量"], steps: [
        { title: "写单胞振幅", explanation: "位于 T 的晶胞相对原点多一个传播相位。", latex: "A(\\Delta\\mathbf k)\\propto\\sum_{\\mathbf T}e^{i\\Delta\\mathbf k\\cdot\\mathbf T}" },
        { title: "要求相邻胞同相", explanation: "沿任一原始矢量平移后，相位必须增加 2π 的整数倍。", latex: "\\Delta\\mathbf k\\cdot\\mathbf a_i=2\\pi n_i" },
        { title: "展开对偶基底", explanation: "满足三条整数点积条件的全部向量，恰由倒格基矢的整数线性组合构成。", latex: "\\Delta\\mathbf k=h\\mathbf b_1+k\\mathbf b_2+l\\mathbf b_3" },
        { title: "得到衍射条件", explanation: "因此散射矢量必须等于某个倒格矢。", latex: "\\Delta\\mathbf k=\\mathbf G", insight: "Bragg 定律是这条矢量条件投影到一族晶面后的标量形式。" },
      ] }], figure: "reciprocal",
    }),
    unit("03", "brillouin", "Ewald 球与 Brillouin 区", "Ewald construction", "怎样用一张几何图判断哪些反射可出现？", "Kittel 8e, Chapter 2, pp. 33–38", [
      "弹性散射保持 $|\\mathbf k'|=|\\mathbf k|=2\\pi/\\lambda$。以入射波矢末端为球心、$|\\mathbf k|$ 为半径作 Ewald 球；当球面穿过倒格点 $\\mathbf G$ 时，便同时满足 $\\Delta\\mathbf k=\\mathbf G$ 与能量守恒。",
      "第一 Brillouin 区是倒格子的 Wigner–Seitz 原胞：从原点到各倒格点连线，作垂直平分面，围出的最近区域就是第一布里渊区。它是所有不等价 Bloch 波矢的基本域。",
    ], { callout: { title: "倒格子之间的对应", body: "sc 的倒格子仍是 sc；bcc 与 fcc 互为倒格子。这里说的是 Bravais 格子类型，比例常数由 2π/a 决定。" } }),
    unit("04", "structure-factor", "结构因子与消光", "Structure factor", "满足 Laue 条件为何仍可能看不到峰？", "Kittel 8e, Chapter 2, pp. 38–44", [
      "Laue 条件只保证不同晶胞同相；同一晶胞内不同基元原子的散射还可能互相抵消。结构因子 $S_{\\mathbf G}=\\sum_j f_j e^{-i\\mathbf G\\cdot\\mathbf r_j}$ 正是这个单胞内的复振幅，峰强与 $|S_{\\mathbf G}|^2$ 成正比。",
      "对同种原子的 bcc，$S=f[1+e^{-i\\pi(h+k+l)}]$，因此 $h+k+l$ 为奇数时系统消光。对 fcc，只有 $h,k,l$ 全奇或全偶时允许。原子形状还通过 form factor $f(\\mathbf G)$ 使高角峰逐渐变弱。",
    ], {
      formula: { latex: "S_{\\mathbf G}=\\sum_j f_j e^{-i\\mathbf G\\cdot\\mathbf r_j},\\qquad I_{\\mathbf G}\\propto|S_{\\mathbf G}|^2", meaning: "结构因子把基元的种类与相对位置转化为每个衍射峰的振幅和系统消光。", variables: ["fⱼ：原子散射因子", "rⱼ：基元位置", "I_G：积分强度的核心因子"] },
      figure: "structure-factor",
      check: { id: "bcc-extinction", question: "单原子 bcc 晶体的 (111) 反射是否允许？", choices: [
        { label: "允许", feedback: "先检查 h+k+l 的奇偶性。" },
        { label: "系统消光", correct: true, feedback: "1+1+1=3 为奇数，角点与体心贡献相差 π，振幅抵消。" },
        { label: "只由波长决定", feedback: "波长决定 Ewald 球是否相交，但结构因子仍可能让峰消失。" },
      ] },
    }),
    unit("05", "map", "知识地图", "Chapter map", "Bragg、Laue 与结构因子如何合并成一次实验？", "Kittel 8e, Chapter 2, Summary", [
      "先由晶格周期给出倒格点位置，再由 Ewald 几何选择满足弹性散射的点，最后由基元结构因子决定每个允许峰的强弱。峰位主要告诉你晶格，峰强则进一步告诉你基元。",
    ]),
  ],
  summary: ["Bragg 定律是相邻晶面程差条件。", "倒格点是周期晶体允许的散射矢量。", "第一 Brillouin 区是倒格子的 Wigner–Seitz 原胞。", "结构因子决定峰强与系统消光。"],
  exercises: [
    { id: "c2-1", level: 1, title: "Bragg 角与 2θ", prompt: "λ=0.154 nm、d=0.200 nm 时，一阶峰的 2θ 是多少？", hints: ["先算 sinθ=λ/(2d)。", "实验横轴通常是 2θ。"], solution: "sinθ=0.385，θ≈22.64°，因此 2θ≈45.28°。", solutionLatex: "2\\theta=2\\arcsin\\left(\\frac{0.154}{2\\times0.200}\\right)\\approx45.28^\\circ" },
    { id: "c2-2", level: 2, title: "判断 bcc 反射", prompt: "列出 (100)、(110)、(111)、(200) 中单原子 bcc 允许的反射。", hints: ["h+k+l 为偶数时允许。"], solution: "(110) 与 (200) 允许；(100) 与 (111) 系统消光。", solutionLatex: "h+k+l=2,2\\quad\\Rightarrow\\quad(110),(200)" },
    { id: "c2-3", level: 3, title: "证明面间距公式", prompt: "证明立方晶体 d_hkl=a/√(h²+k²+l²)。", hints: ["倒格矢 G_hkl 的模长等于 2π/d_hkl。", "立方倒格基矢模长为 2π/a。"], solution: "G=(2π/a)(h,k,l)，故 |G|=(2π/a)√(h²+k²+l²)=2π/d，整理即得。", solutionLatex: "d_{hkl}=\\frac{2\\pi}{|\\mathbf G_{hkl}|}=\\frac a{\\sqrt{h^2+k^2+l^2}}" },
  ],
};

const chapter4: CompanionChapter = {
  number: 4,
  english: "Phonons I: Crystal Vibrations",
  title: "声子 I：晶格振动",
  pages: "pp. 89–104",
  hero: "把 N 个耦合原子，\n变成彼此独立的正常模。",
  lead: "晶格振动的关键不是追踪每个原子，而是寻找整个晶体共同振动的本征模式。色散关系给出频率、波矢和群速度；量子化以后，每个正常模的能量量子就是声子。",
  metrics: ["06 主题单元", "05 渐进推导", "03 交互实验"],
  units: [
    unit("00", "overview", "章概览", "Overview", "为什么周期边界会让振动频率形成能带？", "Kittel 8e, Chapter 4, pp. 89–91", [
      "在平衡位置附近，把总势能展开到位移的二次项，就得到一组线性耦合振子。平移对称使平面波成为本征解，但原子离散性让频率不再与波矢成严格直线关系，并产生有限的第一 Brillouin 区。",
      "每个波矢 $\\mathbf K$ 对应若干极化分支。单原子基元只有声学支；每个原胞含多个原子时，还会出现原胞内部反相运动的光学支。",
    ]),
    unit("01", "mono", "单原子链色散", "Monatomic chain", "最近邻弹簧如何产生正弦色散？", "Kittel 8e, Chapter 4, pp. 91–94", [
      "质量 $M$ 的原子以间距 $a$ 排列，最近邻力常数为 $C$。第 $s$ 个原子的恢复力来自左右两根弹簧，运动方程是 $M\\ddot u_s=C(u_{s+1}+u_{s-1}-2u_s)$。",
      "代入行波 $u_s=u_0e^{i(sKa-\\omega t)}$，相邻位移只差相位 $e^{\\pm iKa}$。离散二阶差分因此变成 $2\\cos Ka-2$，得到周期性的正弦色散。$K$ 与 $K+2\\pi/a$ 描述同一组格点位移，所以只需保留第一布里渊区。",
    ], {
      formula: { latex: "\\omega(K)=2\\sqrt{\\frac CM}\\left|\\sin\\frac{Ka}{2}\\right|,\\qquad -\\frac\\pi a\\le K\\le\\frac\\pi a", meaning: "单原子最近邻链的声学色散；区中心线性，区边界群速度为零。", variables: ["C：最近邻力常数", "M：原子质量", "a：原子间距", "K：波矢"] },
      derivations: [{ id: "mono-dispersion", title: "单原子链色散的完整推导", result: "\\omega^2=\\frac{4C}{M}\\sin^2\\frac{Ka}{2}", meaning: "离散平移把连续介质的 K² 修正成周期函数 sin²(Ka/2)。", variables: ["u_s：第 s 个原子的纵向位移"], steps: [
        { title: "写恢复力", explanation: "右弹簧伸长 u_{s+1}−u_s，左弹簧对第 s 个原子的力为 C(u_{s−1}−u_s)。", latex: "M\\ddot u_s=C(u_{s+1}+u_{s-1}-2u_s)" },
        { title: "代入正常模", explanation: "所有原子以同一频率振动，相邻原子的相位相差 Ka。", latex: "u_s=u_0e^{i(sKa-\\omega t)}" },
        { title: "消去公共因子", explanation: "用 u_{s±1}=u_s e^{±iKa}，并用 ü_s=−ω²u_s。", latex: "-M\\omega^2=C(e^{iKa}+e^{-iKa}-2)" },
        { title: "使用三角恒等式", explanation: "2−2cosx=4sin²(x/2)。", latex: "M\\omega^2=2C(1-\\cos Ka)=4C\\sin^2\\frac{Ka}{2}" },
        { title: "选择正频率", explanation: "频率取非负根；绝对值保证整个第一布里渊区内 ω≥0。", latex: "\\omega=2\\sqrt{\\frac CM}\\left|\\sin\\frac{Ka}{2}\\right|" },
      ] }], figure: "mono-phonon",
    }),
    unit("02", "velocity", "长波极限与群速度", "Group velocity", "声速为什么只由色散曲线在 K=0 的斜率决定？", "Kittel 8e, Chapter 4, pp. 93–95", [
      "波包由相邻 $K$ 的正常模叠加而成，其包络传播速度为 $v_g=d\\omega/dK$。对单原子链，$v_g=a\\sqrt{C/M}\\cos(Ka/2)$；区中心达到声速，区边界降为零。",
      "当 $Ka\\ll1$ 时，相邻原子几乎同相，晶格看起来像连续弹性介质。$\\sin(Ka/2)\\simeq Ka/2$，于是 $\\omega\\simeq v_s|K|$，其中 $v_s=a\\sqrt{C/M}$。测得低频声速即可反推出长波有效力常数。",
    ], {
      formula: { latex: "v_g=\\frac{d\\omega}{dK}=a\\sqrt{\\frac CM}\\cos\\frac{Ka}{2},\\qquad v_s=a\\sqrt{\\frac CM}", meaning: "群速度是能量与信息的传播速度；长波极限恢复连续介质声速。", variables: ["v_g：群速度", "v_s：长波声速"] },
      check: { id: "zone-edge", question: "单原子最近邻链在区边界 K=π/a 的群速度是多少？", choices: [
        { label: "最大", feedback: "区中心斜率最大。" }, { label: "零", correct: true, feedback: "cos(π/2)=0；该模成为驻波，能量不以波包形式向前传播。" }, { label: "等于相速度", feedback: "色散介质中两者一般不同。" },
      ] },
    }),
    unit("03", "diatomic", "双原子链：声学支与光学支", "Diatomic chain", "为什么一个原胞含两个原子就多出一条分支？", "Kittel 8e, Chapter 4, pp. 95–99", [
      "令重复距离为 $a$，原胞中质量 $M_1,M_2$ 的两类原子交替排列。每个 $K$ 的运动方程成为 $2\\times2$ 本征值问题，因此有两个本征频率：低频声学支中两原子在长波极限同相；高频光学支中它们反相，质心近似不动。",
      "区中心声学频率必须为零，因为全体原子同位移只对应刚体平移；光学频率满足 $\\omega^2=2C(1/M_1+1/M_2)$。区边界两支分别趋于 $2C/M_1$ 与 $2C/M_2$，并可能形成频率禁带。",
    ], {
      formula: { latex: "\\omega_{\\pm}^2=C\\left(\\frac1{M_1}+\\frac1{M_2}\\right)\\pm C\\sqrt{\\left(\\frac1{M_1}+\\frac1{M_2}\\right)^2-\\frac{4\\sin^2(Ka/2)}{M_1M_2}}", meaning: "正号为光学支，负号为声学支；a 是相邻同类原子之间的重复距离。", variables: ["M₁、M₂：两类原子质量", "C：相邻异类原子间力常数"] },
      derivations: [{ id: "diatomic-dispersion", title: "双原子链本征方程", result: "M_1M_2\\omega^4-2C(M_1+M_2)\\omega^2+2C^2(1-\\cos Ka)=0", meaning: "两个原胞内自由度产生关于 ω² 的二次方程，也就是两条色散分支。", variables: ["u_s、v_s：第 s 个原胞内两原子的位移"], steps: [
        { title: "写两类原子的运动方程", explanation: "每个原子都与左右两个异类最近邻相连。", latex: "M_1\\ddot u_s=C(v_s+v_{s-1}-2u_s),\\quad M_2\\ddot v_s=C(u_{s+1}+u_s-2v_s)" },
        { title: "代入 Bloch 形式", explanation: "同类原子跨一个原胞相差相位 e^{iKa}。", latex: "u_s=ue^{i(sKa-\\omega t)},\\quad v_s=ve^{i(sKa-\\omega t)}" },
        { title: "形成动力学矩阵", explanation: "把 u、v 的系数整理为齐次线性方程。", latex: "\\begin{vmatrix}2C-M_1\\omega^2&-C(1+e^{-iKa})\\\\-C(1+e^{iKa})&2C-M_2\\omega^2\\end{vmatrix}=0" },
        { title: "令行列式为零", explanation: "非零振幅解要求动力学矩阵奇异，并用 |1+e^{iKa}|²=2(1+cosKa)。", latex: "M_1M_2\\omega^4-2C(M_1+M_2)\\omega^2+2C^2(1-\\cos Ka)=0" },
        { title: "解关于 ω² 的二次方程", explanation: "两个根分别给出声学与光学分支。", latex: "\\omega_{\\pm}^2=C\\left(\\frac1{M_1}+\\frac1{M_2}\\right)\\pm C\\sqrt{\\left(\\frac1{M_1}+\\frac1{M_2}\\right)^2-\\frac{4\\sin^2(Ka/2)}{M_1M_2}}" },
      ] }], figure: "diatomic",
    }),
    unit("04", "quantization", "正常模量子化与声子", "Phonon quantization", "声子为何既有能量又只有准动量？", "Kittel 8e, Chapter 4, pp. 99–102", [
      "在谐近似中，每个 $(\\mathbf K,s)$ 正常模都是独立量子谐振子，能级间隔为 $\\hbar\\omega(\\mathbf K,s)$。把该模的占据数增加 1，就称为创造一个声子。零点能 $\\tfrac12\\hbar\\omega$ 不随占据数消失。",
      "声子的 $\\hbar\\mathbf K$ 是 crystal momentum（晶体准动量），不等同于整个晶体的机械动量。晶格只具有离散平移对称，因此散射过程只要求 $\\mathbf K$ 在模倒格矢 $\\mathbf G$ 的意义下守恒。",
    ], {
      formula: { latex: "H=\\sum_{\\mathbf K,s}\\hbar\\omega_{\\mathbf K s}\\left(n_{\\mathbf K s}+\\frac12\\right)", meaning: "谐晶体被分解成所有波矢与极化分支的独立量子谐振子。", variables: ["s：极化/分支", "n_Ks：声子占据数"] },
      callout: { title: "声子不是一颗在原子间穿行的小球", body: "一个声子是整个晶体某个正常模的一份量子激发。它可以携带能量和晶体准动量，但原子只在各自平衡位置附近振动。" },
    }),
    unit("05", "map", "知识地图", "Chapter map", "如何从弹簧链走到可观测声子？", "Kittel 8e, Chapter 4, Summary", [
      "从力常数写动力学矩阵，求本征值获得色散，求本征向量获得极化；再把每个正常模量子化得到声子。中子或 X 射线的非弹性散射可通过能量与准动量转移直接测量这些色散关系。",
    ]),
  ],
  summary: ["平移对称让平面波成为正常模。", "离散原子产生周期色散与有限 Brillouin 区。", "多原子基元产生光学支。", "每个量子化正常模的一份激发就是声子。"],
  exercises: [
    { id: "c4-1", level: 1, title: "区边界频率", prompt: "单原子链在 K=π/a 时的最大频率是多少？", hints: ["sin(π/2)=1。"], solution: "代入色散关系得 ω_max=2√(C/M)。", solutionLatex: "\\omega_{max}=2\\sqrt{C/M}" },
    { id: "c4-2", level: 2, title: "由声速求力常数", prompt: "一维链 a=0.30 nm、M=5.0×10⁻²⁶ kg、声速 3000 m/s，估算 C。", hints: ["使用 v=a√(C/M)。"], solution: "C=M(v/a)²≈5.0 N/m。", solutionLatex: "C=M\\left(\\frac va\\right)^2\\approx5.0\\ {N\\,m^{-1}}" },
    { id: "c4-3", level: 3, title: "光学模振幅比", prompt: "证明双原子链在 K=0 的光学模满足 u/v=−M₂/M₁。", hints: ["把 K=0 与光学频率代回任一运动方程。", "也可要求原胞质心不动。"], solution: "光学模中原胞质心固定，M₁u+M₂v=0，所以 u/v=−M₂/M₁。", solutionLatex: "M_1u+M_2v=0\\quad\\Rightarrow\\quad\\frac uv=-\\frac{M_2}{M_1}" },
  ],
};

const chapter5: CompanionChapter = {
  number: 5,
  english: "Phonons II: Thermal Properties",
  title: "声子 II：热学性质",
  pages: "pp. 105–130",
  hero: "数清每个声子模，\n就能解释晶体的热。",
  lead: "热容由“有多少振动模能被温度激发”决定，热导则还要问“这些模能走多远”。Debye 模型、非谐性和 Umklapp 过程把微观声子谱连接到宏观热学。",
  metrics: ["06 主题单元", "05 渐进推导", "05 交互实验"],
  units: [
    unit("00", "overview", "章概览", "Overview", "为什么经典理论在低温完全失效？", "Kittel 8e, Chapter 5, pp. 105–108", [
      "经典能量均分认为每个谐振自由度都贡献 $k_BT$，给出 Dulong–Petit 极限 $3Nk_B$。但量子化后，高频模在 $k_BT\\ll\\hbar\\omega$ 时几乎不能被激发，因此低温热容必须下降。",
      "真正的计算分两步：先用 Bose–Einstein 分布求每个频率模的平均能量，再用态密度 $D(\\omega)$ 数清各频率区间有多少模式。",
    ]),
    unit("01", "planck", "Planck 分布与声子热容", "Planck distribution", "单个量子谐振模如何储存热能？", "Kittel 8e, Chapter 5, pp. 108–111", [
      "声子数不守恒，化学势为零。频率 $\\omega$ 的模在温度 $T$ 下平均占据数是 $\\bar n=[\\exp(\\hbar\\omega/k_BT)-1]^{-1}$。零点能不依赖温度，因此不贡献定容热容。",
      "对一个模求 $U_\\omega=\\hbar\\omega\\bar n$ 的温度导数，得到一个在低温指数冻结、在高温趋于 $k_B$ 的热容函数。晶体热容就是对所有模求和。",
    ], {
      formula: { latex: "\\bar n(\\omega)=\\frac1{e^{\\hbar\\omega/k_BT}-1},\\qquad C_V=\\frac{\\partial}{\\partial T}\\sum_{\\mathbf K,s}\\hbar\\omega_{\\mathbf K s}\\bar n", meaning: "Bose–Einstein 占据决定每个声子模的热能；对温度求导得到晶格热容。", variables: ["n̄：平均声子数", "ω_Ks：声子色散"] },
      figure: "planck",
      derivations: [{ id: "planck-mode", title: "单一声子模的热容", result: "C_\\omega=k_Bx^2\\frac{e^x}{(e^x-1)^2},\\qquad x=\\frac{\\hbar\\omega}{k_BT}", meaning: "量子谐振模从低温冻结平滑过渡到经典 k_B 极限。", variables: ["x：模能量与热能之比"], steps: [
        { title: "写平均热能", explanation: "去掉与温度无关的零点能，只保留热激发部分。", latex: "U_\\omega=\\hbar\\omega\\bar n=\\frac{\\hbar\\omega}{e^x-1}" },
        { title: "处理温度变量", explanation: "x=ħω/(k_BT)，因此 dx/dT=−x/T。", latex: "\\frac{dx}{dT}=-\\frac{x}{T}" },
        { title: "对 T 求导", explanation: "链式法则给出指数分布对温度的响应。", latex: "C_\\omega=\\frac{dU_\\omega}{dT}=\\hbar\\omega\\frac{e^x}{(e^x-1)^2}\\frac{x}{T}" },
        { title: "消去能量尺度", explanation: "利用 ħω/T=k_Bx。", latex: "C_\\omega=k_Bx^2\\frac{e^x}{(e^x-1)^2}" },
      ] }],
    }),
    unit("02", "dos", "正常模计数与态密度", "Density of states", "三维声子态密度为什么正比于 ω²？", "Kittel 8e, Chapter 5, pp. 111–116", [
      "周期边界条件让每个 $\\mathbf K$ 态在波矢空间占据体积 $(2\\pi)^3/V$。半径 $K$ 的球内每个极化分支包含 $VK^3/(6\\pi^2)$ 个状态；若线性色散 $\\omega=vK$，则壳层面积 $K^2$ 直接转化为 $D(\\omega)\\propto\\omega^2$。",
      "更精确地把一条纵支和两条横支分别计入，可写 $D(\\omega)=V\\omega^2( v_L^{-3}+2v_T^{-3})/(2\\pi^2)$。Debye 模型用一个等效声速把它们合并，并选择截止频率保证总模数恰为 $3N$。",
    ], {
      formula: { latex: "D(\\omega)=\\frac{V\\omega^2}{2\\pi^2}\\left(\\frac1{v_L^3}+\\frac2{v_T^3}\\right),\\qquad \\int_0^{\\omega_D}D(\\omega)d\\omega=3N", meaning: "三维 K 空间球壳计数给出 ω² 态密度；Debye 截止保证自由度总数正确。", variables: ["v_L、v_T：纵/横声速", "ω_D：Debye 截止频率"] },
      figure: "dos",
      derivations: [{ id: "debye-dos", title: "从 K 空间计数到 Debye 态密度", result: "D(\\omega)=\\frac{3V\\omega^2}{2\\pi^2v^3}", meaning: "在各向同性、三极化共用声速的近似下，态密度随频率平方增长。", variables: ["V：晶体体积", "v：Debye 平均声速"], steps: [
        { title: "确定单态体积", explanation: "周期边界条件使每个允许 K 点在三维 K 空间占据 (2π)³/V。", latex: "\\Delta V_K=\\frac{(2\\pi)^3}{V}" },
        { title: "数球内状态", explanation: "半径 K 的球体积乘三种极化，再除以单态体积。", latex: "N(K)=3\\frac{(4\\pi K^3/3)}{(2\\pi)^3/V}=\\frac{VK^3}{2\\pi^2}" },
        { title: "换成频率", explanation: "Debye 近似取三支均为线性色散 ω=vK。", latex: "N(\\omega)=\\frac{V\\omega^3}{2\\pi^2v^3}" },
        { title: "对频率求导", explanation: "态密度定义为单位频率间隔中的模数。", latex: "D(\\omega)=\\frac{dN}{d\\omega}=\\frac{3V\\omega^2}{2\\pi^2v^3}" },
      ] }],
    }),
    unit("03", "debye", "Debye T³ 定律与 Einstein 模型", "Debye heat capacity", "低温热容为什么普遍呈 T³？", "Kittel 8e, Chapter 5, pp. 116–121", [
      "Debye 模型保留低频声学模的线性色散并用 $\\omega_D$ 截止。低温时只有 $\\omega\\lesssim k_BT/\\hbar$ 的长波模被激发；三维态密度 $D\\propto\\omega^2$，使可参与的模数随 $T^3$ 增长，因此 $C_V\\propto T^3$。",
      "Einstein 模型把全部 $3N$ 个模设为同一频率 $\\omega_E$，能正确展示量子冻结和高温极限，却因缺少任意低频声学模而在低温给出指数衰减。",
    ], {
      formula: { latex: "C_V=9Nk_B\\left(\\frac{T}{\\Theta_D}\\right)^3\\int_0^{\\Theta_D/T}\\frac{x^4e^x}{(e^x-1)^2}dx\\xrightarrow[T\\ll\\Theta_D]{}\\frac{12\\pi^4}{5}Nk_B\\left(\\frac{T}{\\Theta_D}\\right)^3", meaning: "Debye 热容在低温呈 T³，在高温回到 3Nk_B。", variables: ["Θ_D=ħω_D/k_B：Debye 温度", "N：原子数"] },
      derivations: [{ id: "debye-t3", title: "Debye T³ 定律的逐步推导", result: "C_V=\\frac{12\\pi^4}{5}Nk_B(T/\\Theta_D)^3", meaning: "T³ 来自三维线性色散的 ω² 态密度，而非经验拟合。", variables: ["x=ħω/k_BT"], steps: [
        { title: "写总热能积分", explanation: "每个频率的模数乘该模平均热能。", latex: "U=\\int_0^{\\omega_D}D(\\omega)\\frac{\\hbar\\omega}{e^{\\hbar\\omega/k_BT}-1}d\\omega" },
        { title: "代入 Debye 态密度", explanation: "用截止条件把系数写成 9N/ω_D³。", latex: "D(\\omega)=\\frac{9N}{\\omega_D^3}\\omega^2" },
        { title: "无量纲化", explanation: "令 x=ħω/k_BT，上限变为 Θ_D/T。", latex: "U=9Nk_BT\\left(\\frac{T}{\\Theta_D}\\right)^3\\int_0^{\\Theta_D/T}\\frac{x^3}{e^x-1}dx" },
        { title: "取低温极限", explanation: "T≪Θ_D 时可把上限延伸到无穷，且积分为 π⁴/15。", latex: "\\int_0^\\infty\\frac{x^3}{e^x-1}dx=\\frac{\\pi^4}{15}" },
        { title: "对温度求导", explanation: "低温 U∝T⁴，因此 C_V∝T³。", latex: "C_V=\\frac{dU}{dT}=\\frac{12\\pi^4}{5}Nk_B\\left(\\frac{T}{\\Theta_D}\\right)^3" },
      ] }], figure: "heat-capacity",
    }),
    unit("04", "thermal", "非谐性、热膨胀与热导", "Anharmonicity & conductivity", "声子为什么会散射并产生有限热阻？", "Kittel 8e, Chapter 5, pp. 121–128", [
      "纯二次势中每个正常模永不交换能量，晶格也不会热膨胀。真实势能的三次、四次项造成非谐声子相互作用；势阱不对称使平均原子间距随温度增加，并让声子获得有限寿命。",
      "声子气体的动理学近似给出 $\\kappa=\\tfrac13C_Vv\\ell$。Normal 过程满足 $\\mathbf K_1+\\mathbf K_2=\\mathbf K_3$，本身不消除总晶体准动量；Umklapp 过程满足 $\\mathbf K_1+\\mathbf K_2=\\mathbf K_3+\\mathbf G$，能把准动量折回第一 Brillouin 区，是高温本征热阻的关键。边界、缺陷和同位素还会进一步限制平均自由程。",
    ], {
      formula: { latex: "\\mathbf j_U=-\\kappa\\nabla T,\\qquad \\kappa=\\frac13C_Vv\\ell,\\qquad \\mathbf K_1+\\mathbf K_2=\\mathbf K_3+\\mathbf G", meaning: "Fourier 定律定义热导率；动理学式把它拆成储热能力、传播速度和平均自由程；G≠0 标志 Umklapp。", variables: ["j_U：热流密度", "ℓ：平均自由程", "G：倒格矢"] },
      figure: "thermal",
      check: { id: "umklapp", question: "为什么纯 Normal 声子碰撞通常不能单独产生有限热阻？", choices: [
        { label: "它不交换能量", feedback: "Normal 过程可以交换能量。" },
        { label: "它保持总晶体准动量", correct: true, feedback: "在平移不变体系中，总漂移不能仅靠动量守恒碰撞衰减。" },
        { label: "它只在绝对零度发生", feedback: "Normal 与 Umklapp 都有温度依赖，但原因不是绝对零度。" },
      ] },
    }),
    unit("05", "map", "知识地图", "Chapter map", "热容与热导分别由哪些声子信息决定？", "Kittel 8e, Chapter 5, Summary", [
      "热容主要由色散与态密度决定，即有多少模在给定温度可被激发；热导还需要群速度和寿命，即这些能量能传播多快、多远。非谐性连接了热膨胀、声子寿命与 Umklapp 热阻。",
    ]),
  ],
  summary: ["Planck 分布决定单个声子模的热激发。", "三维线性色散给出 D(ω)∝ω²。", "Debye 模型解释低温 C_V∝T³。", "热导由热容、群速度与平均自由程共同决定。"],
  exercises: [
    { id: "c5-1", level: 1, title: "高温热容极限", prompt: "为什么含 N 个原子的三维晶体在高温有 C_V→3Nk_B？", hints: ["共有 3N 个正常模。", "每个量子谐振模在高温贡献 k_B。"], solution: "高温时 x=ħω/k_BT≪1，每个模恢复经典能量均分并贡献 k_B；3N 个模合计 3Nk_B。", solutionLatex: "C_V\\to3Nk_B" },
    { id: "c5-2", level: 2, title: "低温热容比", prompt: "同一 Debye 固体从 5 K 升至 10 K，若仍在 T³ 区，热容增大多少倍？", hints: ["C_V∝T³。"], solution: "(10/5)³=8 倍。", solutionLatex: "\\frac{C_V(10)}{C_V(5)}=\\left(\\frac{10}{5}\\right)^3=8" },
    { id: "c5-3", level: 3, title: "边界限制下的热导", prompt: "极低温下若 ℓ 由样品尺寸决定且近似常数，证明 κ∝T³。", hints: ["使用 κ=(1/3)C_Vvℓ。", "低温 Debye 热容 ∝T³，声速近似常数。"], solution: "边界散射使 ℓ≈常数，声速 v 也近似不随温度变化，因此 κ 的温度依赖全部来自 C_V，得到 κ∝T³。", solutionLatex: "\\kappa=\\frac13C_Vv\\ell\\propto T^3" },
  ],
};

export const companionChapters: Record<1 | 2 | 4 | 5, CompanionChapter> = { 1: chapter1, 2: chapter2, 4: chapter4, 5: chapter5 };
