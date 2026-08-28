export type DerivationStep = {
  title: string;
  explanation: string;
  latex: string;
  insight?: string;
};

export type DerivationData = {
  id: string;
  title: string;
  result: string;
  meaning: string;
  variables: string[];
  steps: DerivationStep[];
};

export type SectionMeta = {
  id: string;
  index: string;
  title: string;
  english: string;
  question: string;
  reference: string;
};

export const sections: SectionMeta[] = [
  { id: "overview", index: "00", title: "章概览", english: "Overview", question: "从原子间相互作用，怎样一路走到宏观声速？", reference: "Kittel 8e, Chapter 3, pp. 47–48" },
  { id: "binding", index: "01", title: "晶体为何结合", english: "Why crystals bind", question: "同一种电磁相互作用，为什么会呈现四种不同的结合图景？", reference: "Kittel 8e, Chapter 3, pp. 48–49" },
  { id: "inert-gas", index: "02", title: "惰性气体晶体", english: "Inert-gas crystals", question: "两个完全中性的闭壳层原子，为什么仍会互相吸引？", reference: "Kittel 8e, Chapter 3, pp. 49–60" },
  { id: "ionic", index: "03", title: "离子晶体", english: "Ionic crystals", question: "一个离子的能量，为什么必须由整个晶格共同决定？", reference: "Kittel 8e, Chapter 3, pp. 60–67" },
  { id: "other-bonds", index: "04", title: "共价、金属与氢键", english: "Covalent, metallic & hydrogen bonds", question: "电子密度分布如何决定键的方向性与强弱？", reference: "Kittel 8e, Chapter 3, pp. 67–70" },
  { id: "radii", index: "05", title: "原子与离子半径", english: "Atomic & ionic radii", question: "原子没有硬边界，为什么“半径”仍是有效的结构语言？", reference: "Kittel 8e, Chapter 3, pp. 70–73" },
  { id: "strain", index: "06", title: "应变与应力", english: "Strain & stress", question: "如何用六个数完整描述一个微小形变？", reference: "Kittel 8e, Chapter 3, pp. 73–76" },
  { id: "elasticity", index: "07", title: "立方晶体弹性", english: "Cubic elasticity", question: "为什么立方晶体只需要 C₁₁、C₁₂、C₄₄ 三个独立常数？", reference: "Kittel 8e, Chapter 3, pp. 77–80" },
  { id: "waves", index: "08", title: "弹性波", english: "Elastic waves", question: "声速如何“测量”晶体内部的弹性常数？", reference: "Kittel 8e, Chapter 3, pp. 80–84" },
  { id: "map", index: "09", title: "知识地图", english: "Chapter map", question: "结合能、曲率、弹性与声速之间的主线是什么？", reference: "Kittel 8e, Chapter 3, Summary, p. 85" },
  { id: "exercises", index: "10", title: "章节练习", english: "Exercises", question: "能否从直觉、计算与推导三个层次重新建构本章？", reference: "Kittel 8e, Chapter 3, Problems, pp. 86–89" }
];

export const sectionCopy = {
  binding: [
    "所有晶体结合最终都来自电子与原子核之间的电磁相互作用。不同之处不在“是否有另一种力”，而在电子能否转移、能否离域，以及电子云重叠时量子态如何重新组织。",
    "把晶体从平衡状态拆成彼此无限远、处于基态的中性原子所需的能量称为 cohesive energy（结合能）。稳定晶体的势能最低，因此若把晶体能量作为零点，结合能取正；若写晶体总势能，则平衡值为负。"
  ],
  inert: [
    "He、Ne、Ar、Kr、Xe 的闭壳层近似球对称，没有永久偶极矩。它们形成的晶体主要是 fcc（He 是例外），结合能远小于典型离子晶体或共价晶体。",
    "短程处，电子云重叠触发 Pauli exclusion principle（泡利不相容原理）：已有轨道不能被相同自旋量子数的电子重复占据，波函数必须正交化，电子被迫混入更高能态，能量急剧上升。"
  ],
  ionic: [
    "离子晶体由正、负离子构成。吸引作用是长程库仑作用，短程稳定性来自闭壳层离子电子云重叠产生的排斥。NaCl 中每个离子同时感受到无限多个异号与同号离子，因此只算最近邻会漏掉晶格能的重要部分。",
    "Madelung constant（马德隆常数）α 只由晶格几何和参考长度的约定决定。采用最近邻距 R 作为长度单位时，NaCl 结构 α≈1.74756；α 的数值若换用晶格常数 a 作为单位会相应改变。"
  ],
  bonds: [
    "covalent bond（共价键）由原子共享电子对形成，核间电荷积聚降低电子能量，因此强而有方向性。金刚石中每个 C 形成四个四面体方向的键，这种方向性解释了其高硬度与较疏松的结构。",
    "metallic bond（金属键）中价电子在许多离子实之间离域。离域电子既提供结合，也带来高电导与热导。过渡金属还因 d 电子参与而具有更强、更加复杂的结合。",
    "hydrogen bond（氢键）源于 H 处在两个强电负性原子之间时形成的极性、部分共价相互作用。它弱于典型共价键，却足以控制冰、分子晶体与许多生物结构的几何。"
  ],
  radii: [
    "atomic radius（原子半径）与 ionic radius（离子半径）不是电荷密度突然归零的位置，而是把测得的原子间距分解后得到的可迁移结构参数。它们对预测晶格常数与配位几何很有用。",
    "同一离子的经验半径会随配位数、价态和键的离子性改变。通常配位数增加时，分配给该离子的有效半径也增加；阳离子往往小于相应中性原子，阴离子往往更大。"
  ],
  strain: [
    "位移场 u(r) 告诉我们每个材料点移动了多少。刚体平移和刚体转动不应产生弹性能；真正度量局部形变的是位移梯度的对称部分，即 small strain tensor（小应变张量）。",
    "应力 σᵢⱼ 的第一个下标表示力的方向，第二个下标表示受力面的法向。静态力矩平衡给出 σᵢⱼ=σⱼᵢ，因此应力与应变各有六个独立分量。dilation（体膨胀率）在小应变下是张量迹。"
  ],
  elasticity: [
    "线性弹性区间内，Hooke 定律把应力与应变线性关联。一般各向异性固体最多有 21 个独立刚度常数；立方对称性把它们压缩为 C₁₁、C₁₂、C₄₄ 三个。",
    "C₁₁控制沿晶轴的轴向刚度，C₁₂描述一个方向的伸缩与正交方向应力之间的耦合，C₄₄控制剪切。机械稳定的立方晶体必须满足 C₄₄>0、C₁₁−C₁₂>0、C₁₁+2C₁₂>0。"
  ],
  waves: [
    "弹性波不是“原子沿传播方向飞走”，而是位移场的相位传播。波矢 K 给出相位传播方向，极化向量 u 给出粒子振动方向；二者平行为 longitudinal wave（纵波），垂直为 transverse wave（横波）。",
    "在立方晶体的高对称方向，[100]、[110]、[111] 的 Christoffel 矩阵有简单本征向量。每个本征值就是有效弹性常数 C_eff，声速满足 ρv²=C_eff。"
  ]
};

const r = String.raw;

export const derivations: Record<string, DerivationData> = {
  london: {
    id: "london", title: "London interaction（伦敦色散作用）", result: r`\Delta U(R)=-\frac{A}{R^6}`,
    meaning: "偶极耦合本身随 R⁻³ 衰减；基态的一阶修正为零，最低非零能量修正对耦合取二次，因此得到 R⁻⁶。",
    variables: ["R：两核间距", "e、m：振子电荷量与有效质量", "ω₀：孤立振子频率", "C=mω₀²：回复力常数"],
    steps: [
      { title: "把闭壳层原子近似成量子振子", explanation: "每个电子云相对正离子实的位移记为 x₁、x₂。未耦合时，两原子的哈密顿量只是两个相同谐振子之和。", latex: r`\mathcal H_0=\sum_{i=1}^{2}\left(\frac{p_i^2}{2m}+\frac12Cx_i^2\right),\qquad \omega_0=\sqrt{C/m}` },
      { title: "展开两原子的库仑能", explanation: "在 |x₁|,|x₂|≪R 下把四项库仑相互作用按 x/R 展开。常数项与线性项相消，最低非零的交叉项就是偶极-偶极耦合。", latex: r`\mathcal H_1=\frac{e^2}{R}+\frac{e^2}{R+x_1-x_2}-\frac{e^2}{R+x_1}-\frac{e^2}{R-x_2}\simeq-\frac{2e^2x_1x_2}{R^3}`, insight: "这里先出现 R⁻³：它是两个瞬时偶极之间的耦合尺度。" },
      { title: "换到对称与反对称简正坐标", explanation: "该线性变换把交叉项 x₁x₂ 对角化。对称模降低回复力，反对称模提高回复力。", latex: r`x_s=\frac{x_1+x_2}{\sqrt2},\quad x_a=\frac{x_1-x_2}{\sqrt2};\qquad \omega_{s,a}=\omega_0\sqrt{1\mp\frac{2e^2}{CR^3}}` },
      { title: "展开两个简正频率", explanation: "令 η=2e²/(CR³)≪1。使用 √(1±η)=1±η/2−η²/8+⋯。相加时线性项一正一负而抵消，二次项同号并保留。", latex: r`\omega_s+\omega_a=\omega_0\left(2-\frac{\eta^2}{4}+\cdots\right),\qquad \eta\propto R^{-3}`, insight: "关键视觉关系：R⁻³ × R⁻³ = R⁻⁶。" },
      { title: "比较耦合前后的零点能", explanation: "基态能为每个模 ½ℏω。减去两个孤立振子的零点能 ℏω₀，能量降低，因而作用是吸引。", latex: r`\Delta U=\frac{\hbar}{2}(\omega_s+\omega_a-2\omega_0)=-\hbar\omega_0\frac18\left(\frac{2e^2}{CR^3}\right)^2=-\frac{A}{R^6}`, insight: "一阶能量位移因对称性抵消；量子相关涨落留下负的二阶修正。" }
    ]
  },
  lennardJones: {
    id: "lennardJones", title: "Lennard–Jones 势的平衡距离", result: r`R_0=2^{1/6}\sigma`,
    meaning: "平衡点不是 U=0，而是势能极小值 dU/dR=0；在该点吸引力与排斥力正好平衡。",
    variables: ["ε：势阱深度", "σ：U=0 时的距离参数", "R₀：双原子势的平衡距离"],
    steps: [
      { title: "写出吸引与排斥两部分", explanation: "R⁻¹² 是便于计算的经验短程排斥，不是由基本理论精确导出的指数；R⁻⁶ 对应 London 吸引。", latex: r`U(R)=4\epsilon\left[\left(\frac{\sigma}{R}\right)^{12}-\left(\frac{\sigma}{R}\right)^6\right]` },
      { title: "对原子间距求导", explanation: "链式法则 dR⁻ⁿ/dR=−nR⁻ⁿ⁻¹。", latex: r`\frac{dU}{dR}=4\epsilon\left[-\frac{12\sigma^{12}}{R^{13}}+\frac{6\sigma^6}{R^7}\right]` },
      { title: "令合力为零", explanation: "F=−dU/dR。平衡要求导数为零，约去公共因子 6σ⁶/R¹³。", latex: r`-2\sigma^6+R_0^6=0\quad\Longrightarrow\quad R_0^6=2\sigma^6` },
      { title: "取正的六次方根并检查稳定性", explanation: "距离必须为正，且在此处二阶导数大于零，所以它是稳定极小值。代回可得 U(R₀)=−ε。", latex: r`R_0=2^{1/6}\sigma\approx1.122\sigma,\qquad U(R_0)=-\epsilon` }
    ]
  },
  fcc: {
    id: "fcc", title: "fcc 惰性气体的晶格能", result: r`U_{\rm tot}(R_0)=-(2.15)(4N\epsilon)=-8.60N\epsilon`,
    meaning: "晶体内每个原子与所有原子成对作用；½ 用来避免把每一对计算两次。",
    variables: ["N：原子总数", "R：最近邻距", "pᵢⱼR：第 i、j 原子距离", "S₆、S₁₂：fcc 晶格和"],
    steps: [
      { title: "对所有原子对求和", explanation: "固定一个参考原子 i，再遍历 j≠i。对全部 N 个 i 求和会把 (i,j) 与 (j,i) 各算一次，所以乘 ½。", latex: r`U_{\rm tot}=\frac12N(4\epsilon)\left[\sum_j'\left(\frac{\sigma}{p_{ij}R}\right)^{12}-\sum_j'\left(\frac{\sigma}{p_{ij}R}\right)^6\right]` },
      { title: "代入 Kittel 给出的 fcc 晶格和", explanation: "这两个几何数包含所有壳层。它们接近但不等于最近邻数 12，说明最近邻贡献最大、远邻仍有修正。", latex: r`S_{12}=\sum_j'p_{ij}^{-12}=12.13188,\qquad S_6=\sum_j'p_{ij}^{-6}=14.45392` },
      { title: "对最近邻距 R 极小化", explanation: "令 dU_tot/dR=0，得到 12S₁₂σ¹²/R¹³=6S₆σ⁶/R⁷。", latex: r`\left(\frac{R_0}{\sigma}\right)^6=\frac{2S_{12}}{S_6}` },
      { title: "得到晶体平衡最近邻距", explanation: "晶体中有多壳层相互作用，因此 1.09σ 不同于孤立原子对的 1.122σ。", latex: r`\frac{R_0}{\sigma}=\left(\frac{2\times12.13188}{14.45392}\right)^{1/6}\approx1.09` },
      { title: "代回总能量", explanation: "按 Kittel 的符号约定，晶体势能为负；把晶体拆散所需的结合能大小为 8.60Nε。零点振动会减弱实际结合，轻元素 Ne 的修正最明显。", latex: r`U_{\rm tot}(R_0)=2N\epsilon\left[S_{12}\left(\frac{\sigma}{R_0}\right)^{12}-S_6\left(\frac{\sigma}{R_0}\right)^6\right]\approx-8.60N\epsilon` }
    ]
  },
  madelung: {
    id: "madelung", title: "一维交替离子链的 Madelung 常数", result: r`\alpha=2\ln2`,
    meaning: "参考离子左右各有一个同距离子，电荷符号逐项交替；α 是纯几何量。",
    variables: ["R：最近邻距", "n：计入的邻居壳层", "α：马德隆常数"],
    steps: [
      { title: "选定参考离子与符号", explanation: "取中心离子为负。距离 R 的两个正离子给吸引贡献，2R 的两个负离子给排斥贡献，依次交替。α 约定为正。", latex: r`\frac{\alpha}{R}=2\left(\frac1R-\frac1{2R}+\frac1{3R}-\frac1{4R}+\cdots\right)` },
      { title: "提出公共长度 R", explanation: "距离单位被约去，留下只与几何有关的无量纲交错级数。", latex: r`\alpha=2\sum_{n=1}^{\infty}\frac{(-1)^{n+1}}{n}` },
      { title: "连接到对数的幂级数", explanation: "在 |x|≤1 的适当收敛意义下，ln(1+x) 的 Taylor 级数为交错调和结构。", latex: r`\ln(1+x)=x-\frac{x^2}{2}+\frac{x^3}{3}-\frac{x^4}{4}+\cdots` },
      { title: "令 x=1", explanation: "括号中的级数等于 ln2，再乘左右两个等距离子带来的因子 2。", latex: r`\alpha=2\left(1-\frac12+\frac13-\frac14+\cdots\right)=2\ln2\approx1.38629` },
      { title: "理解三维中的困难", explanation: "三维库仑晶格和通常是条件收敛的：若按不保持电中性的方式扩大求和区域，表面项会改变结果。Ewald 求和把 1/r 拆成实空间快速收敛项、倒空间快速收敛项与自能修正，从而固定物理边界条件。", latex: r`\frac1r=\frac{\operatorname{erfc}(\eta r)}r+\frac{\operatorname{erf}(\eta r)}r`, insight: "η 只是在两种表示之间分配工作；完整结果不依赖 η。" }
    ]
  },
  strain: {
    id: "strain", title: "为什么剪切应变有时差一个 2？", result: r`\gamma_{xy}=2\varepsilon_{xy}`, meaning: "张量剪切应变是位移梯度的对称部分；工程剪切应变是两条原本正交线之间夹角的总变化。",
    variables: ["u：x 方向位移", "v：y 方向位移", "ε_xy：张量剪切", "γ_xy：工程剪切"],
    steps: [
      { title: "从位移梯度出发", explanation: "∂u/∂y 表示沿 y 走动时 x 位移如何变化，∂v/∂x 表示沿 x 走动时 y 位移如何变化。", latex: r`\nabla\mathbf u=\begin{pmatrix}\partial u/\partial x&\partial u/\partial y\\[2pt]\partial v/\partial x&\partial v/\partial y\end{pmatrix}` },
      { title: "分解为形变与刚体转动", explanation: "对称部分改变长度和夹角；反对称部分只让物体整体转动，不应储存弹性能。", latex: r`\nabla\mathbf u=\underbrace{\tfrac12(\nabla\mathbf u+\nabla\mathbf u^{\mathsf T})}_{\boldsymbol\varepsilon\;\text{形变}}+\underbrace{\tfrac12(\nabla\mathbf u-\nabla\mathbf u^{\mathsf T})}_{\boldsymbol\omega\;\text{转动}}` },
      { title: "定义张量剪切分量", explanation: "标准小应变张量必须保持对称，因此 off-diagonal 分量带 ½。", latex: r`\varepsilon_{xy}=\frac12\left(\frac{\partial u}{\partial y}+\frac{\partial v}{\partial x}\right)` },
      { title: "定义工程剪切应变", explanation: "实验中常直接使用直角的总角度变化 γ_xy；它正好是两个小转角之和。Kittel 本章的 e_xy 使用这一 convention。", latex: r`\gamma_{xy}=\frac{\partial u}{\partial y}+\frac{\partial v}{\partial x}=2\varepsilon_{xy}` },
      { title: "保持能量与矩阵记号一致", explanation: "本网站矩阵默认使用 Voigt 工程记号 [εxx,εyy,εzz,γyz,γzx,γxy]。因此 σxy=C44γxy，能量中的该项是 ½C44γxy²。", latex: r`U=\tfrac12\boldsymbol\varepsilon_V^{\mathsf T}\mathbf C\boldsymbol\varepsilon_V,\qquad \boldsymbol\varepsilon_V=(\varepsilon_{xx},\varepsilon_{yy},\varepsilon_{zz},\gamma_{yz},\gamma_{zx},\gamma_{xy})^{\mathsf T}` }
    ]
  },
  stiffness: {
    id: "stiffness", title: "立方对称为何只留下三个刚度常数", result: r`\{C_{11},C_{12},C_{44}\}`,
    meaning: "三条立方轴等价；关于晶轴的旋转还禁止正应变与剪切应变的线性交叉项。",
    variables: ["C₁₁：轴向刚度", "C₁₂：正交方向耦合", "C₄₄：剪切刚度"],
    steps: [
      { title: "从二次弹性能开始", explanation: "线性弹性要求应力对总应变的一阶响应，因此能量对小应变最低为二次型。", latex: r`U=\frac12\sum_{i,j=1}^{6}C_{ij}\,\varepsilon_i\varepsilon_j,\qquad C_{ij}=C_{ji}` },
      { title: "施加 x、y、z 轴等价性", explanation: "立方体绕 [111] 轴旋转 120° 会循环交换 x→y→z，但晶体不变，所以三条轴向系数相等，三个两两耦合也相等。", latex: r`C_{11}=C_{22}=C_{33},\qquad C_{12}=C_{23}=C_{31}` },
      { title: "剪切方向同样等价", explanation: "三个坐标面的剪切通过立方旋转互换，因此它们共享 C₄₄；改变某一坐标轴符号还会使不允许的交叉项变号，迫使其为零。", latex: r`C_{44}=C_{55}=C_{66},\qquad C_{14}=C_{15}=\cdots=0` },
      { title: "得到 Voigt 刚度矩阵", explanation: "这里剪切列使用工程剪切 γ，而不是张量分量 ε_xy。", latex: r`\mathbf C=\begin{pmatrix}C_{11}&C_{12}&C_{12}&0&0&0\\C_{12}&C_{11}&C_{12}&0&0&0\\C_{12}&C_{12}&C_{11}&0&0&0\\0&0&0&C_{44}&0&0\\0&0&0&0&C_{44}&0\\0&0&0&0&0&C_{44}\end{pmatrix}` },
      { title: "写出与 Kittel 一致的能量密度", explanation: "若改用张量剪切 ε_xy=γ_xy/2，最后一组系数相应变为 2C₄₄ε_xy²；两种写法物理完全相同。", latex: r`U=\frac12C_{11}\sum_i\varepsilon_{ii}^2+C_{12}\sum_{i<j}\varepsilon_{ii}\varepsilon_{jj}+\frac12C_{44}(\gamma_{yz}^2+\gamma_{zx}^2+\gamma_{xy}^2)` }
    ]
  },
  bulk: {
    id: "bulk", title: "立方晶体的体积模量", result: r`B=\frac{C_{11}+2C_{12}}{3}`,
    meaning: "均匀压缩没有剪切，只测试正应变的共同变化与相互耦合。compressibility（压缩率）κ=1/B。",
    variables: ["δ=ΔV/V：体膨胀率", "B：体积模量", "p：静水压力"],
    steps: [
      { title: "给三轴相同的小应变", explanation: "均匀膨胀或压缩保持立方体形状。总相对体积变化是三个正应变之和。", latex: r`\varepsilon_{xx}=\varepsilon_{yy}=\varepsilon_{zz}=\frac{\delta}{3},\qquad \delta=\frac{\Delta V}{V}` },
      { title: "代入立方晶体能量", explanation: "三个 C₁₁ 平方项与三个 C₁₂ 交叉项分别汇总。", latex: r`U=\frac12C_{11}\,3\left(\frac{\delta}{3}\right)^2+C_{12}\,3\left(\frac{\delta}{3}\right)^2=\frac16(C_{11}+2C_{12})\delta^2` },
      { title: "与体积模量定义比较", explanation: "体积模量定义为产生体积应变所需的能量曲率。", latex: r`U=\frac12B\delta^2` },
      { title: "比较系数", explanation: "两式对任意小 δ 都相等，所以二次项系数必须相同。", latex: r`B=\frac{C_{11}+2C_{12}}{3},\qquad \kappa=\frac1B` }
    ]
  },
  wave100: {
    id: "wave100", title: "[100] 方向的纵波与横波", result: r`\rho v_L^2=C_{11},\qquad \rho v_T^2=C_{44}`,
    meaning: "沿立方轴传播时，轴向压缩与面内剪切完全解耦，两支横波简并。",
    variables: ["ρ：质量密度", "K：波数", "v=ω/K：相速度"],
    steps: [
      { title: "写出平面波试探解", explanation: "令波沿 x=[100] 传播。纵波极化也沿 x，位移只有 u 分量。", latex: r`u=u_0e^{i(Kx-\omega t)},\qquad v=w=0` },
      { title: "代入 x 方向弹性波方程", explanation: "所有 y、z 导数为零，只剩 C₁₁∂²u/∂x²。时间与空间二阶导分别带来 −ω² 与 −K²。", latex: r`-\rho\omega^2u=-C_{11}K^2u\quad\Longrightarrow\quad \rho\omega^2=C_{11}K^2` },
      { title: "除以 K² 得纵波声速", explanation: "在线性、长波极限中 ω=vK。", latex: r`v_L=\frac{\omega}{K}=\sqrt{\frac{C_{11}}{\rho}}` },
      { title: "换成横向极化", explanation: "令位移沿 y 或 z。此时只产生剪切，方程中的回复系数变成 C₄₄。", latex: r`v=v_0e^{i(Kx-\omega t)}\quad\Longrightarrow\quad \rho\omega^2=C_{44}K^2,\qquad v_T=\sqrt{\frac{C_{44}}{\rho}}` }
    ]
  },
  wave110: {
    id: "wave110", title: "[110] 方向的三个本征模", result: r`\rho v_L^2=\frac{C_{11}+C_{12}+2C_{44}}2`,
    meaning: "面外 T₁ 只测试 C₄₄；面内 T₂ 测试 C₁₁−C₁₂；纵波同时混合三种刚度。",
    variables: ["K∥[110]：Kx=Ky=K/√2", "L：u∥[110]", "T₂：u∥[1 −1 0]", "T₁：u∥[001]"],
    steps: [
      { title: "选定传播方向", explanation: "在 xy 面的面对角线上 Kx=Ky=K/√2，Kz=0。先考虑 xy 面内位移 (u,v)。", latex: r`\mathbf K=\frac{K}{\sqrt2}(1,1,0),\qquad \mathbf u=(u,v,0)e^{i(\mathbf K\cdot\mathbf r-\omega t)}` },
      { title: "建立 2×2 Christoffel 方程", explanation: "把平面波代入运动方程后，空间导数变成 iK 分量。", latex: r`\rho\omega^2\binom uv=\frac{K^2}{2}\begin{pmatrix}C_{11}+C_{44}&C_{12}+C_{44}\\C_{12}+C_{44}&C_{11}+C_{44}\end{pmatrix}\binom uv` },
      { title: "纵向本征向量 u=v", explanation: "矩阵的对称本征向量 (1,1) 平行 K。把一行元素相加得到纵波本征值。", latex: r`\rho v_L^2=\frac12(C_{11}+C_{12}+2C_{44}),\qquad \mathbf u_L\parallel[110]` },
      { title: "面内横向本征向量 u=−v", explanation: "反对称本征向量 (1,−1) 垂直 K。两行的耦合项相减，C₄₄ 在这一组合中抵消。", latex: r`\rho v_{T2}^2=\frac12(C_{11}-C_{12}),\qquad \mathbf u_{T2}\parallel[1\bar10]` },
      { title: "面外横波", explanation: "若位移沿 z=[001]，与 xy 面内分量解耦，回复完全由 C₄₄ 决定。", latex: r`\rho v_{T1}^2=C_{44},\qquad \mathbf u_{T1}\parallel[001]` }
    ]
  },
  wave111: {
    id: "wave111", title: "[111] 方向的纵波与简并横波", result: r`\rho v_L^2=\frac{C_{11}+2C_{12}+4C_{44}}3`,
    meaning: "三重旋转对称使两支横波简并；任意两个彼此正交且垂直 [111] 的方向都可作为横波基底。",
    variables: ["K∥[111]：Kx=Ky=Kz=K/√3", "L：u∥[111]", "T：u·K=0"],
    steps: [
      { title: "写出 [111] 的 Christoffel 矩阵", explanation: "三个方向余弦都为 1/√3，因此对角元相等，非对角元也相等。", latex: r`\boldsymbol\Gamma=\frac13\begin{pmatrix}C_{11}+2C_{44}&C_{12}+C_{44}&C_{12}+C_{44}\\C_{12}+C_{44}&C_{11}+2C_{44}&C_{12}+C_{44}\\C_{12}+C_{44}&C_{12}+C_{44}&C_{11}+2C_{44}\end{pmatrix}` },
      { title: "纵向本征向量 (1,1,1)", explanation: "每一行求和得到纵向本征值；极化平行传播方向。", latex: r`\Gamma_L=\frac{C_{11}+2C_{12}+4C_{44}}3,\qquad \rho v_L^2=\Gamma_L` },
      { title: "选择一个横向向量", explanation: "例如 (1,−1,0) 与 (1,1,1) 点积为零。代入矩阵得到横向本征值。", latex: r`\Gamma_T=\frac{C_{11}-C_{12}+C_{44}}3,\qquad \rho v_T^2=\Gamma_T` },
      { title: "解释两支横波简并", explanation: "垂直 [111] 的二维平面在三重旋转下等价；可再选 (1,1,−2) 作为第二个横向基底，两者本征值相同。", latex: r`\rho v_{T1}^2=\rho v_{T2}^2=\frac{C_{11}-C_{12}+C_{44}}3` }
    ]
  }
};

export type ExerciseData = { id: string; level: 1 | 2 | 3; title: string; prompt: string; hints: string[]; solution: string; solutionLatex?: string };

export const exercises: ExerciseData[] = [
  { id: "e1", level: 1, title: "R⁻⁶ 从哪里来？", prompt: "London interaction 为什么不是直接随偶极耦合的 R⁻³ 衰减？", hints: ["比较耦合前后两个简正模的零点能。", "√(1+η) 与 √(1−η) 相加时，一阶项会怎样？"], solution: "偶极耦合的幅度 η∝R⁻³。基态总零点能中，对称模和反对称模的一阶频移正负相消，最低非零项是 η²，因此 ΔU∝(R⁻³)²=R⁻⁶，并且二阶项为负。", solutionLatex: r`\Delta U\propto-\eta^2,\quad \eta\propto R^{-3}\quad\Rightarrow\quad\Delta U\propto-R^{-6}` },
  { id: "e2", level: 2, title: "Lennard–Jones 平衡", prompt: "从 U(R)=4ε[(σ/R)¹²−(σ/R)⁶] 推导 R₀，并求 U(R₀)。", hints: ["先计算 dU/dR 并令其为零。", "由 R₀⁶=2σ⁶ 可得 (σ/R₀)⁶=1/2。"], solution: "求导后约去公共因子得到 R₀⁶=2σ⁶，故 R₀=2¹ᐟ⁶σ。代回势能：(σ/R₀)⁶=1/2，十二次方为 1/4，所以 U=4ε(1/4−1/2)=−ε。", solutionLatex: r`R_0=2^{1/6}\sigma,\qquad U(R_0)=-\epsilon` },
  { id: "e3", level: 2, title: "一维 Madelung 链", prompt: "以一个负离子为中心，对左右交替电荷求和，说明 α=2ln2。", hints: ["左右同一距离各有一个离子，因此先提出因子 2。", "使用 ln(1+x) 的幂级数并令 x=1。"], solution: "各壳层符号交替且距离为 nR，于是 α=2Σ(−1)ⁿ⁺¹/n。它正是 2 倍的交错调和级数，等于 2ln2≈1.38629。", solutionLatex: r`\alpha=2\sum_{n=1}^\infty\frac{(-1)^{n+1}}n=2\ln2` },
  { id: "e4", level: 3, title: "从能量推导体积模量", prompt: "把均匀体积应变代入立方晶体弹性能，推导 B=(C₁₁+2C₁₂)/3。", hints: ["令 εxx=εyy=εzz=δ/3，剪切分量为零。", "与 U=½Bδ² 比较系数。"], solution: "代入后，三个平方项给 C₁₁δ²/6，三个交叉项给 C₁₂δ²/3，总和为 (C₁₁+2C₁₂)δ²/6。与 Bδ²/2 比较即得结果。", solutionLatex: r`\frac16(C_{11}+2C_{12})\delta^2=\frac12B\delta^2\Rightarrow B=\frac{C_{11}+2C_{12}}3` },
  { id: "e5", level: 3, title: "从声速反演刚度", prompt: "已知 ρ、v[100],L、v[100],T 和 v[110],T2，写出 C₁₁、C₄₄、C₁₂。", hints: ["[100] 两个模式直接给出 C₁₁ 与 C₄₄。", "使用 ρv²[110],T2=(C₁₁−C₁₂)/2。"], solution: "先得 C₁₁=ρv²[100],L 与 C₄₄=ρv²[100],T，再整理 [110] 面内横波关系得到 C₁₂=C₁₁−2ρv²[110],T2。", solutionLatex: r`C_{11}=\rho v_{100,L}^2,\quad C_{44}=\rho v_{100,T}^2,\quad C_{12}=C_{11}-2\rho v_{110,T2}^2` }
];
