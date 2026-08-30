export type DepthBlock = {
  objectives: string[];
  prerequisites: string[];
  reasoning: { title: string; body: string; latex?: string }[];
  example: { title: string; givens: string[]; reasoning: string[]; result: string; latex?: string };
  pitfalls: string[];
  symbols: { symbol: string; meaning: string; unit?: string }[];
};

const block = (
  objectives: string[], prerequisites: string[], reasoning: DepthBlock["reasoning"],
  example: DepthBlock["example"], pitfalls: string[], symbols: DepthBlock["symbols"]
): DepthBlock => ({ objectives, prerequisites, reasoning, example, pitfalls, symbols });

export const chapterDepth: Record<string, DepthBlock> = {
  "1:lattice": block(
    ["区分格子、基元与晶体结构", "判断一组平移矢量是否为原始矢量", "用三重积计算原胞体积"],
    ["三维向量的点积与叉积", "整数线性组合", "平移对称的含义"],
    [
      { title: "先找对称操作，而不是先画盒子", body: "允许的格子平移必须把每一种原子连同其化学身份一起映到同种原子。只让几何点重合而交换了元素，并不构成晶体的平移对称。", latex: "\\rho(\\mathbf r+\\mathbf T)=\\rho(\\mathbf r)" },
      { title: "原始矢量要生成全部格点", body: "三条线性无关矢量不仅要连接格点，还要让所有格点都可由整数系数组合得到。如果遗漏一半格点，它们只是非原始晶轴。", latex: "\\mathbf T=\\sum_{i=1}^3u_i\\mathbf a_i,\\quad u_i\\in\\mathbb Z" },
      { title: "体积是选择无关的判据", body: "不同形状的原胞可以等价，但体积必须相同。若候选晶胞体积是真正原胞的 m 倍，它就含 m 个格点。", latex: "V_c=|\\det(\\mathbf a_1,\\mathbf a_2,\\mathbf a_3)|" },
    ],
    { title: "bcc 原胞体积", givens: ["常规立方边长 a", "候选原始矢量 a(−1,1,1)/2、a(1,−1,1)/2、a(1,1,−1)/2"], reasoning: ["把三条矢量作为矩阵的列。", "计算行列式绝对值。", "与常规胞体积 a³ 比较。"], result: "行列式为 a³/2，因此一个常规胞含 2 个原胞，也就是 2 个格点。", latex: "V_c=\\left|\\det\\frac a2\\begin{pmatrix}-1&1&1\\\\1&-1&1\\\\1&1&-1\\end{pmatrix}\\right|=\\frac{a^3}{2}" },
    ["“晶胞”不一定是原胞。", "原胞含一个格点，不等于只含一个原子；基元可含多个原子。", "晶轴可以为方便而选成非原始矢量。"],
    [{ symbol: "aᵢ", meaning: "原始平移矢量", unit: "m" }, { symbol: "T", meaning: "格子平移", unit: "m" }, { symbol: "V_c", meaning: "原胞体积", unit: "m³" }]
  ),
  "1:bravais": block(
    ["从分数坐标构造 sc/bcc/fcc", "独立计算配位数和最近邻距", "从接触几何推导堆积率"],
    ["分数坐标", "欧氏距离", "晶胞边界共享计数"],
    [
      { title: "先用分数坐标列出格点", body: "sc 只有角点；bcc 增加 (1/2,1/2,1/2)；fcc 增加三个面心。边界点的等效数必须按共享晶胞数折算。" },
      { title: "最近邻由最小非零平移决定", body: "枚举相邻晶胞中的格点差矢并取最短模长。配位数就是具有该最短模长的差矢数量。", latex: "d_{nn}=\\min_{\\mathbf R\\ne0}|\\mathbf R|" },
      { title: "堆积率需要接触假设", body: "只有把最近邻球视为刚好接触，才能由 d_nn=2r 得到硬球半径。堆积率不是电子云真实占据率。", latex: "\\eta=\\frac{N_{cell}(4\\pi r^3/3)}{a^3}" },
    ],
    { title: "fcc 的最近邻与配位", givens: ["常规胞边长 a", "格点 (0,0,0) 与面心位置"], reasoning: ["从角点到相邻面心的差矢为 a(1/2,1/2,0)。", "其长度为 a/√2。", "三对坐标平面各给 4 个符号组合，共 12 个最近邻。"], result: "fcc 的 d_nn=a/√2，配位数 z=12。", latex: "|\\Delta\\mathbf r|=a\\sqrt{(1/2)^2+(1/2)^2}=\\frac a{\\sqrt2}" },
    ["不要把常规胞中的可见球数直接当作等效原子数。", "hcp 与 fcc 堆积率相同，但不是同一种 Bravais 格子。", "配位数依赖所讨论的结构与邻近壳层定义。"],
    [{ symbol: "d_nn", meaning: "最近邻距离", unit: "m" }, { symbol: "z", meaning: "最近邻配位数" }, { symbol: "η", meaning: "硬球堆积率" }]
  ),
  "1:planes": block(
    ["由截距得到 Miller 指数", "由 (hkl) 反求晶面方程", "理解立方晶体面间距"],
    ["平面方程", "截距与倒数", "向量法向量"],
    [
      { title: "Miller 指数标记的是平行面族", body: "选取不经过原点的一张代表面，写出以晶轴为单位的截距 p、q、r，再取倒数并约成互质整数。", latex: "(h:k:l)=(p^{-1}:q^{-1}:r^{-1})" },
      { title: "分数坐标中的面方程", body: "若位置写成 r=xa₁+ya₂+za₃，则 (hkl) 面族可写 hx+ky+lz=n；相邻整数 n 对应相邻平行面。", latex: "hx+ky+lz=n" },
      { title: "立方晶体的面间距", body: "立方倒格矢 G_hkl=(2π/a)(h,k,l)，而相邻面相位相差 2π，所以 d_hkl=2π/|G_hkl|。", latex: "d_{hkl}=\\frac a{\\sqrt{h^2+k^2+l^2}}" },
    ],
    { title: "(210) 面", givens: ["立方晶格常数 a", "h=2, k=1, l=0"], reasoning: ["x 截距为 a/h=a/2。", "y 截距为 a/k=a。", "l=0 表示与 z 轴平行。", "代入立方面间距公式。"], result: "截距为 (a/2,a,∞)，面间距 d_210=a/√5。", latex: "2x+y=1,\\qquad d_{210}=a/\\sqrt5" },
    ["l=0 意味着平行于 z 轴，不是 z 截距为 0。", "一般晶系中 [hkl] 不一定垂直于 (hkl)。", "(200) 与 (100) 方向相同但面间距不同。"],
    [{ symbol: "(hkl)", meaning: "晶面 Miller 指数" }, { symbol: "[uvw]", meaning: "晶向指数" }, { symbol: "d_hkl", meaning: "相邻平行面间距", unit: "m" }]
  ),
  "1:structures": block(
    ["用 Bravais 格子和基元描述 NaCl、CsCl、diamond", "由分数坐标判断配位", "避免把结构外观误判为格子类型"],
    ["Bravais 格子", "基元分数坐标", "最近邻搜索"],
    [
      { title: "化学身份必须参与对称判断", body: "若一次平移把 A 原子送到 B 原子，即使几何点重合，也不是含两种元素晶体的平移对称。" },
      { title: "CsCl 是 sc 加双原子基元", body: "选 sc 格点，在每点附上 Cs:(0,0,0) 与 Cl:(1/2,1/2,1/2)。体心位移会交换离子种类，因此不能作为 Bravais 平移。" },
      { title: "diamond 是 fcc 加位移基元", body: "两个相同原子相差 a(1/4,1/4,1/4)，生成两个互穿的 fcc 子晶格；最近邻沿四面体方向，配位数为 4。", latex: "\\boldsymbol\\tau_2-\\boldsymbol\\tau_1=\\frac a4(1,1,1)" },
    ],
    { title: "diamond 最近邻距离", givens: ["fcc 常规胞边长 a", "双原子基元位移 a(1,1,1)/4"], reasoning: ["最近邻正是连接两个子晶格的基元位移。", "计算该位移的模长。"], result: "最近邻距为 √3a/4，比 fcc Bravais 格点间距 a/√2 更短。", latex: "d_{nn}=\\left|\\frac a4(1,1,1)\\right|=\\frac{\\sqrt3}{4}a" },
    ["CsCl 结构不是 bcc Bravais 格子。", "NaCl 的每个子晶格是 fcc，但完整结构需要双原子基元。", "diamond 的常规胞含 8 个原子，不是 4 个。"],
    [{ symbol: "τ_j", meaning: "基元内第 j 个原子位置", unit: "m" }, { symbol: "r=T+τ_j", meaning: "完整原子位置", unit: "m" }]
  ),
  "2:bragg": block(
    ["从相位差推导 Bragg 定律", "区分 θ 与仪器横轴 2θ", "判断某阶反射是否存在"],
    ["波的相位", "程差", "弹性散射"],
    [
      { title: "Bragg 图像是一种等价构造", body: "原子并不是镜面。把同一晶面内散射相干求和后，可将衍射几何等价表述为平行晶面的镜面反射。" },
      { title: "两段额外路程", body: "来自下一晶面的波在入射和出射路径上各多走 d sinθ，总程差为 2d sinθ。", latex: "\\Delta L=2d\\sin\\theta" },
      { title: "存在性条件", body: "因为 sinθ≤1，n 阶峰只有在 nλ≤2d 时存在。仪器通常记录入射束与衍射束的夹角 2θ。", latex: "n\\lambda\\le2d" },
    ],
    { title: "Cu Kα 测 (111) 峰", givens: ["λ=0.15406 nm", "fcc 晶格常数 a=0.3615 nm", "一阶衍射"], reasoning: ["先算 d_111=a/√3。", "再算 sinθ=λ/(2d)。", "最后把 θ 乘 2得到衍射仪读数。"], result: "d_111≈0.2087 nm，2θ≈43.32°。", latex: "2\\theta=2\\arcsin\\frac{0.15406}{2(0.3615/\\sqrt3)}\\approx43.32^\\circ" },
    ["Bragg 角 θ 不是实验图横轴 2θ。", "满足 Bragg 条件不保证峰强非零；还要检查结构因子。", "高阶 n 可重写为更高 Miller 指数的一阶反射。"],
    [{ symbol: "λ", meaning: "入射波长", unit: "m" }, { symbol: "θ", meaning: "Bragg 角", unit: "rad 或 °" }, { symbol: "d", meaning: "晶面间距", unit: "m" }]
  ),
  "2:reciprocal": block(
    ["由实空间原始矢量构造倒格基矢", "证明 exp(iG·T)=1", "将 Laue 条件解释为相干条件"],
    ["向量叉积", "复指数相位", "平面波"],
    [
      { title: "倒格基矢是对偶基底", body: "bᵢ 的定义使其只与对应的 aᵢ 点积得到 2π，与另外两条原始矢量正交。", latex: "\\mathbf a_i\\cdot\\mathbf b_j=2\\pi\\delta_{ij}" },
      { title: "倒格矢让所有格点同相", body: "对 T=Σuᵢaᵢ 与 G=Σhᵢbᵢ，点积必为 2π 的整数倍。", latex: "e^{i\\mathbf G\\cdot\\mathbf T}=e^{i2\\pi\\sum_i h_iu_i}=1" },
      { title: "有限晶体给峰宽，无限晶体给 δ 峰", body: "有限个晶胞的几何级数在 G 附近形成尖峰；晶体尺寸越大，峰越窄。理想无限极限才严格要求 Δk=G。" },
    ],
    { title: "简单立方的倒格子", givens: ["a₁=a x̂、a₂=a ŷ、a₃=a ẑ"], reasoning: ["V_c=a³。", "计算 a₂×a₃=a²x̂。", "循环得到三条倒格基矢。"], result: "倒格子仍为简单立方，晶格常数为 2π/a。", latex: "\\mathbf b_1=\\frac{2\\pi}{a}\\hat x,\\quad\\mathbf b_2=\\frac{2\\pi}{a}\\hat y,\\quad\\mathbf b_3=\\frac{2\\pi}{a}\\hat z" },
    ["倒格矢的单位是 m⁻¹。", "是否含 2π 取决于定义；本站采用 aᵢ·bⱼ=2πδᵢⱼ。", "倒格子不是实空间中另一组原子。"],
    [{ symbol: "bᵢ", meaning: "倒格原始矢量", unit: "m⁻¹" }, { symbol: "G", meaning: "倒格矢", unit: "m⁻¹" }, { symbol: "Δk", meaning: "散射矢量 k′−k", unit: "m⁻¹" }]
  ),
  "2:brillouin": block(
    ["正确构造 Ewald 球", "理解弹性散射几何", "从倒格子的 Wigner-Seitz 构造第一 Brillouin 区"],
    ["倒格子", "矢量加法", "能量守恒"],
    [
      { title: "Ewald 球必须经过倒格原点", body: "以入射波矢 k 的起点/终点约定一致地放置球心。本站取球心 C，使从 C 指向倒格原点的矢量为 k；球半径为 |k|，所以原点必在球面。" },
      { title: "球面交点同时满足两条条件", body: "若倒格点 G 位于球面，则 k′=k+G 且 |k′|=|k|。前者是 Laue 条件，后者是弹性能量守恒。", latex: "|\\mathbf k+\\mathbf G|^2=|\\mathbf k|^2" },
      { title: "Brillouin 区是独立波矢域", body: "相差倒格矢的 Bloch 波矢物理等价。第一 BZ 选取离倒格原点最近的一组代表。" },
    ],
    { title: "弹性散射的标量条件", givens: ["k′=k+G", "|k′|=|k|"], reasoning: ["平方第二式。", "展开 |k+G|²。", "消去 k²。"], result: "得到 2k·G+G²=0；符号会随散射矢量定义改变。", latex: "2\\mathbf k\\cdot\\mathbf G+G^2=0" },
    ["Ewald 球半径是 |k|=2π/λ，不是 λ。", "改变波长会改变球半径；转动晶体等价于转动倒格子。", "第一 BZ 的边界是 Bragg 面。"],
    [{ symbol: "k,k′", meaning: "入射、出射波矢", unit: "m⁻¹" }, { symbol: "G", meaning: "参与反射的倒格矢", unit: "m⁻¹" }]
  ),
  "2:structure-factor": block(
    ["把晶格因子与基元因子分开", "逐项计算复相位", "判断 bcc/fcc/diamond 的系统消光"],
    ["复数相位", "基元分数坐标", "倒格矢"],
    [
      { title: "峰位和峰强来自不同层级", body: "晶格和决定允许的倒格点位置；结构因子是单个原胞内基元的复振幅和，决定允许点上的强度。", latex: "A(\\mathbf G)=L(\\mathbf G)S(\\mathbf G)" },
      { title: "相位必须先相加再平方", body: "不能把每个原子强度直接相加。先把 f_j e^{-iG·τ_j} 作为复数相加，再取模平方。", latex: "I\\propto|S|^2,\\quad S=\\sum_jf_je^{-i\\mathbf G\\cdot\\boldsymbol\\tau_j}" },
      { title: "同种原子的选择定则", body: "bcc 的 h+k+l 偶数允许；fcc 的 h、k、l 全奇或全偶允许。不同元素会改变抵消程度，原本的系统消光可能变成弱峰。" },
    ],
    { title: "bcc (110) 与 (111)", givens: ["基元位置 (0,0,0)、(1/2,1/2,1/2)", "两个原子散射因子均为 f"], reasoning: ["第二个原子的相位为 exp[−iπ(h+k+l)]。", "(110) 的指数和为 2。", "(111) 的指数和为 3。"], result: "S_110=2f、I_110∝4f²；S_111=0，发生系统消光。", latex: "S=f[1+(-1)^{h+k+l}]" },
    ["Laue 允许不等于结构因子非零。", "原子 form factor 随 |G| 增大而下降。", "强度还受 Lorentz、偏振、温度因子等实验因素影响。"],
    [{ symbol: "S_G", meaning: "结构因子" }, { symbol: "f_j", meaning: "第 j 个原子散射因子" }, { symbol: "τ_j", meaning: "基元位置", unit: "m" }]
  ),
  "4:mono": block(
    ["从离散运动方程推导色散", "识别第一 Brillouin 区", "检查 K→0 与 K→π/a 极限"],
    ["简谐振子", "复指数行波", "最近邻近似"],
    [
      { title: "模型从势能二阶展开开始", body: "把相邻原子间势能在平衡距离附近展开，线性项为零，二次项系数就是力常数 C。忽略更远邻与非谐项。", latex: "U\\simeq U_0+\\frac12C(u_{s+1}-u_s)^2" },
      { title: "离散拉普拉斯给出周期色散", body: "左右弹簧的合力是位移的二阶差分。代入行波后，相邻相位因子组合为 2cosKa−2。" },
      { title: "极限是最重要的自检", body: "K→0 时 ω≈a√(C/M)|K|，恢复声波；K=π/a 时相邻原子反相，ω 达到 2√(C/M)，群速度为零。" },
    ],
    { title: "区边界正常模", givens: ["K=π/a", "u_s=u₀e^{isKa}"], reasoning: ["相邻相位 e^{iπ}=−1。", "所以 u_{s+1}=−u_s。", "代入运动方程。"], result: "每个原子与两个反向位移的邻居相连，Mü_s=−4Cu_s，故 ω=2√(C/M)。", latex: "u_{s+1}=u_{s-1}=-u_s\\Rightarrow\\omega^2=4C/M" },
    ["K 与 K+2π/a 给出同一格点位移。", "相速度 ω/K 与群速度 dω/dK 不要混淆。", "C 是势能曲率，不是宏观弹性常数本身。"],
    [{ symbol: "C", meaning: "最近邻力常数", unit: "N m⁻¹" }, { symbol: "M", meaning: "原子质量", unit: "kg" }, { symbol: "K", meaning: "一维波矢", unit: "m⁻¹" }, { symbol: "ω", meaning: "角频率", unit: "rad s⁻¹" }]
  ),
  "4:velocity": block(
    ["区分相速度和群速度", "由色散求能量传播速度", "用声速反演长波力常数"],
    ["导数", "波包", "单原子链色散"],
    [
      { title: "单色平面波没有局域包络", body: "相速度描述等相位面移动；由相近 K 模叠加的波包，其包络以 dω/dK 移动，后者关联能量传输。", latex: "v_p=\\omega/K,\\qquad v_g=d\\omega/dK" },
      { title: "区边界是驻波", body: "K=π/a 时相邻原子反相，色散曲线斜率为零。模式仍有有限频率和能量，但对称的 ±K 分量形成不传播的驻波。" },
      { title: "连续介质是长波近似", body: "只有 Ka≪1 时，原子尺度细节被平均掉，才能以线性色散和单一声速描述。" },
    ],
    { title: "由声速估算 C", givens: ["a=0.30 nm", "M=5.0×10⁻²⁶ kg", "v_s=3.0 km s⁻¹"], reasoning: ["使用 v_s=a√(C/M)。", "整理 C=M(v_s/a)²。", "统一使用 SI 单位。"], result: "C=5.0 N m⁻¹。", latex: "C=5.0\\times10^{-26}\\left(\\frac{3.0\\times10^3}{3.0\\times10^{-10}}\\right)^2=5.0\\ {N\\,m^{-1}}" },
    ["群速度可以为零，但频率不一定为零。", "在强色散区不能把 ω/K 当作声速。", "真实三维晶体有不同传播方向与极化的声速。"],
    [{ symbol: "v_p", meaning: "相速度", unit: "m s⁻¹" }, { symbol: "v_g", meaning: "群速度", unit: "m s⁻¹" }]
  ),
  "4:diatomic": block(
    ["建立 2×2 动力学矩阵", "解释声学/光学本征向量", "分析区中心和区边界"],
    ["单原子链", "矩阵行列式", "二次方程"],
    [
      { title: "两个自由度必然给两条分支", body: "每个原胞有 u_s、v_s 两个位移。固定 K 后，动力学矩阵有两个本征值 ω²，因此出现声学支与光学支。" },
      { title: "区中心由平移对称约束", body: "K=0 的声学模是全部原子同位移的刚体平移，所以 ω=0。光学模中两类原子反相，且质心不动。", latex: "M_1u+M_2v=0" },
      { title: "重复距离约定要说清", body: "本站的 a 是相邻同类原子之间的原胞重复距离，异类最近邻间距为 a/2。因此第一 BZ 为 |K|≤π/a。" },
    ],
    { title: "区中心光学频率", givens: ["K=0", "最近邻力常数 C", "质量 M₁、M₂"], reasoning: ["令所有原胞的 u、v 相同。", "两类原子的相对位移使每个原子受到两根弹簧作用。", "结合质心不动条件消去振幅比。"], result: "ω_op²=2C(1/M₁+1/M₂)，且 u/v=−M₂/M₁。", latex: "\\omega_{op}^2=2C\\left(\\frac1{M_1}+\\frac1{M_2}\\right)" },
    ["光学支并不一定对应可见光频率。", "若两原子等质量，仍可因基元选择而发生带折叠；物理解读需结合真实原胞。", "不要把 a 与最近邻距混用。"],
    [{ symbol: "M₁,M₂", meaning: "原胞内两原子质量", unit: "kg" }, { symbol: "u,v", meaning: "两原子模振幅", unit: "m" }]
  ),
  "4:quantization": block(
    ["把正常模量子化为独立谐振子", "解释声子数与零点能", "区分晶体准动量和机械动量"],
    ["量子谐振子", "正常模", "倒格矢"],
    [
      { title: "先对角化，再量子化", body: "原子坐标相互耦合；正常模坐标 Q_Ks 把谐 Hamiltonian 对角化。每个模随后按一维量子谐振子处理。" },
      { title: "声子数不守恒", body: "晶体可通过非谐相互作用创造或湮灭声子，所以平衡分布的化学势为零。单个模的能量为 ħω(n+1/2)。" },
      { title: "只需模倒格矢守恒", body: "离散平移对称意味着 K 与 K+G 等价；散射守恒的是晶体准动量 modulo G。" },
    ],
    { title: "创造一个声子的能量", givens: ["某模角频率 ω", "初始占据数 n"], reasoning: ["初态能量为 ħω(n+1/2)。", "末态占据 n+1。", "两者相减。"], result: "无论原占据数是多少，创造一个声子都增加 ħω。", latex: "E_{n+1}-E_n=\\hbar\\omega" },
    ["声子不是局域在某个原子上的粒子。", "零点能存在，但不贡献谐近似下的热容。", "ħK 不是晶体整体质心的机械动量。"],
    [{ symbol: "n_Ks", meaning: "声子占据数" }, { symbol: "ħω", meaning: "单个声子能量", unit: "J" }, { symbol: "ħK", meaning: "晶体准动量", unit: "kg m s⁻¹" }]
  ),
  "5:planck": block(
    ["从几何级数得到 Bose 占据", "推导单模热容", "分析高低温极限"],
    ["量子谐振子能级", "正则系综", "指数函数求导"],
    [
      { title: "配分函数是几何级数", body: "忽略不影响热容的零点能，能级为 nħω。对 n=0,1,… 求 Boltzmann 权重即可得到单模配分函数。", latex: "Z=\\sum_{n=0}^\\infty e^{-n\\beta\\hbar\\omega}=\\frac1{1-e^{-\\beta\\hbar\\omega}}" },
      { title: "平均占据来自对 lnZ 求导", body: "平均热能 U=−∂lnZ/∂β=ħω/(e^{βħω}−1)，除以 ħω 得 Planck 占据。" },
      { title: "两端极限", body: "x=ħω/k_BT≫1 时占据指数小；x≪1 时 U≈k_BT，每个模恢复经典能量均分。" },
    ],
    { title: "冻结一个高频模", givens: ["ħω/k_B=300 K", "T=30 K"], reasoning: ["x=300/30=10。", "n̄=1/(e¹⁰−1)。", "e¹⁰≈22026。"], result: "n̄≈4.54×10⁻⁵，该模在 30 K 几乎未被热激发。", latex: "\\bar n=\\frac1{e^{10}-1}\\approx4.54\\times10^{-5}" },
    ["声子遵从 Bose 分布且化学势为零。", "零点能不能从平均总能量中删掉，但可从热容导数中消失。", "频率应使用角频率 ω；若用普通频率 ν，则能量是 hν。"],
    [{ symbol: "β", meaning: "1/(k_BT)", unit: "J⁻¹" }, { symbol: "n̄", meaning: "平均声子占据数" }, { symbol: "x", meaning: "ħω/(k_BT)" }]
  ),
  "5:dos": block(
    ["从周期边界条件计数 K 态", "推导三维 Debye DOS", "理解真实等频面的通式"],
    ["K 空间体积", "球壳体积", "线性色散"],
    [
      { title: "每个 K 态占据固定体积", body: "边长 L_i 的周期边界给 K_i=2πn_i/L_i，所以三维每态体积为 (2π)³/V。" },
      { title: "三维球壳产生 ω²", body: "半径 K 的球壳态数正比 K²dK；声学线性色散 ω=vK 将其变成 ω²dω/v³。" },
      { title: "真实晶体应沿等频面积分", body: "一般色散下，D(ω)由等频面面积除以群速度积分；群速度变小处态密度可增强并出现 van Hove 奇点。", latex: "D(\\omega)=\\frac{V}{(2\\pi)^3}\\sum_s\\int_{S_\\omega}\\frac{dS}{|\\nabla_\\mathbf K\\omega_s|}" },
    ],
    { title: "Debye 截止", givens: ["各向同性平均声速 v", "体积 V", "原子数 N", "三种极化"], reasoning: ["三极化球内态数为 VK_D³/(2π²)。", "要求总模数等于 3N。", "用 ω_D=vK_D。"], result: "K_D³=6π²N/V，ω_D=v(6π²N/V)^(1/3)。", latex: "K_D=(6\\pi^2N/V)^{1/3}" },
    ["DOS 的单位是每单位角频率。", "一纵两横声速不同时应分别计入 v_L⁻³+2v_T⁻³。", "Debye 球是保持总态数的近似，不是实际 BZ 形状。"],
    [{ symbol: "D(ω)", meaning: "声子态密度", unit: "s rad⁻¹" }, { symbol: "K_D", meaning: "Debye 截止波矢", unit: "m⁻¹" }, { symbol: "ω_D", meaning: "Debye 截止角频率", unit: "rad s⁻¹" }]
  ),
  "5:debye": block(
    ["建立 Debye 热容积分", "严格得到低温 T³ 系数", "比较 Debye 与 Einstein 模型"],
    ["Planck 单模能量", "Debye DOS", "无量纲积分"],
    [
      { title: "热容曲线必须来自积分", body: "Debye 模型的归一化热容不是经验插值。本站互动程序用数值积分直接计算 3t³∫x⁴eˣ/(eˣ−1)²dx，其中 t=T/Θ_D。" },
      { title: "低温为何是 T³", body: "低温有效频率窗口随 T 缩放，而三维声学 DOS∝ω²；能量积分因此 U∝T⁴，求导得到 C∝T³。" },
      { title: "高温自动回到 Dulong-Petit", body: "当 T≫Θ_D，所有 3N 个模进入经典极限，每模贡献 k_B，所以 C_V→3Nk_B。" },
    ],
    { title: "低温系数", givens: ["T≪Θ_D", "积分 ∫₀∞x⁴eˣ/(eˣ−1)²dx=4π⁴/15"], reasoning: ["把 Debye 积分上限 Θ_D/T 延伸到无穷。", "代入 9Nk_B(T/Θ_D)³。", "整理常数。"], result: "C_V=(12π⁴/5)Nk_B(T/Θ_D)³。", latex: "C_V=9Nk_B\\left(\\frac{T}{\\Theta_D}\\right)^3\\frac{4\\pi^4}{15}=\\frac{12\\pi^4}{5}Nk_B\\left(\\frac{T}{\\Theta_D}\\right)^3" },
    ["T³ 律只在 T≪Θ_D 的低温区成立。", "电子热容在金属中可贡献 γT，实验拟合常画 C/T 对 T²。", "Einstein 模型低温是指数冻结，不是 T³。"],
    [{ symbol: "Θ_D", meaning: "Debye 温度", unit: "K" }, { symbol: "C_V", meaning: "定容晶格热容", unit: "J K⁻¹" }, { symbol: "t", meaning: "T/Θ_D" }]
  ),
  "5:thermal": block(
    ["解释非谐性如何产生膨胀与散射", "推导 κ=(1/3)Cvl", "区分 Normal 与 Umklapp 过程"],
    ["声子群速度", "平均自由程", "倒格矢守恒"],
    [
      { title: "谐晶体没有内禀热阻", body: "纯二次 Hamiltonian 中正常模彼此独立，声子寿命无限。三次及更高阶非谐项才允许模之间交换能量并产生有限寿命。" },
      { title: "动理学式来自方向平均", body: "一小段平均自由程内，声子把上游温度的能量带到当前位置。三维各向同性平均给 ⟨v_x²⟩=v²/3。", latex: "\\kappa=\\frac13C_Vv\\ell" },
      { title: "Umklapp 让准动量折返", body: "Normal 过程 G=0 保持总晶体准动量，不能单独衰减整体漂移；Umklapp 过程带非零 G，可把结果折回第一 BZ 并产生热阻。" },
    ],
    { title: "边界限制下的低温 κ", givens: ["T≪Θ_D", "样品宽度 L 限制 l≈L", "声速近似常数"], reasoning: ["Debye 热容 C_V∝T³。", "v 与 L 在该温区近似不变。", "代入动理学式。"], result: "κ∝T³；升温后缺陷与声子-声子散射会改变这一幂律。", latex: "\\kappa=\\frac13C_VvL\\propto T^3" },
    ["κ 的简单动理学式是假设各向同性的近似。", "Normal 过程会影响局部分布，但单独不直接松弛总漂移。", "Matthiessen 规则是散射率相加的近似，并非所有材料都严格成立。"],
    [{ symbol: "κ", meaning: "热导率", unit: "W m⁻¹ K⁻¹" }, { symbol: "l", meaning: "平均自由程", unit: "m" }, { symbol: "τ", meaning: "声子寿命", unit: "s" }]
  ),
};
