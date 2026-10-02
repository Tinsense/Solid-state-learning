export type PhysicsModel = {
  title: string; xLabel: string; yLabel: string; domain: [number, number];
  controls: { label: string; min: number; max: number; step: number; initial: number }[];
  series: { label: string; evaluate: (x: number, p: number[]) => number }[];
  readout: (p: number[]) => string[]; note: string; equation: string;
};
const kb = 8.617333262e-5; // eV/K
const meanField = (t: number) => {
  if (t >= 1) return 0;
  let lo = 1e-9, hi = 1;
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (Math.tanh(m / t) - m > 0) lo = m; else hi = m; }
  return (lo + hi) / 2;
};
const c = (label: string, min: number, max: number, step: number, initial: number) => ({ label, min, max, step, initial });
const model = (title: string, domain: [number, number], xLabel: string, yLabel: string, controls: PhysicsModel["controls"], equation: string, note: string, series: PhysicsModel["series"], readout: PhysicsModel["readout"]): PhysicsModel => ({ title, domain, xLabel, yLabel, controls, equation, note, series, readout });
export const physicsModels: Record<number, PhysicsModel[]> = {
  7: [
    model("区边界的避免交叉", [-1,1], "ξ = δk / G", "E / E₀", [c("势能傅里叶分量 |U_G| / E₀",0,.4,.01,.12)], "E_\\pm=E_0(1+4\\xi^2)\\pm\\sqrt{16E_0^2\\xi^2+|U_G|^2}", "两平面波近似：k=G/2+δk，ξ=δk/G，E₀=ℏ²G²/(8m)。只在区边界附近可信，远离边界需增加基底。势能取实数不影响本征值。", [{label:"上带",evaluate:(x,p)=>1+4*x*x+Math.hypot(4*x,p[0])},{label:"下带",evaluate:(x,p)=>1+4*x*x-Math.hypot(4*x,p[0])}],p=>[`边界能隙 / E₀ = ${(2*p[0]).toFixed(3)}`,"U_G=0 时恢复交叉"]),
    model("δ 势垒 Kronig–Penney 允许区", [0,12], "z = αa", "cos(Ka)", [c("无量纲势垒强度 P",0,8,.1,2)], "\\cos Ka=\\cos z+P\\frac{\\sin z}{z}", "横轴是自由区相位，不是 Bloch 波矢。实数 K 存在当且仅当右端落在 [−1,1]；超出时属于禁带。z=0 使用 sin z/z→1。", [{label:"色散条件右端",evaluate:(x,p)=>Math.cos(x)+p[0]*(x===0?1:Math.sin(x)/x)},{label:"允许区上界",evaluate:()=>1},{label:"允许区下界",evaluate:()=>-1}],p=>[`z→0：右端 = ${(1+p[0]).toFixed(2)}`,"P=0 时全部自由电子能量允许"]),
  ],
  8: [
    model("本征载流子的热激活", [150,650], "T / K", "log₁₀(nᵢ / m⁻³)", [c("带隙 E_g / eV",.2,2,.01,1.12)], "n_i=\\sqrt{N_cN_v}e^{-E_g/(2k_BT)}", "固定带隙、抛物线非简并能带；取 Nc(300 K)=2.8×10²⁵、Nv(300 K)=1.04×10²⁵ m⁻³并按 T³ᐟ²缩放。用于机制比较，不是完整硅材料温度拟合。", [{label:"本征浓度",evaluate:(x,p)=>Math.log10(Math.sqrt(2.8e25*1.04e25)*(x/300)**1.5)-p[0]/(2*kb*x*Math.LN10)}],p=>[`300 K：nᵢ = ${(Math.sqrt(2.8e25*1.04e25)*Math.exp(-p[0]/(600*kb))).toExponential(3)} m⁻³`,"带隙增大会指数降低浓度"]),
    model("浅施主的有效氢原子", [4,24], "εᵣ", "束缚能 / meV", [c("有效质量 m* / mₑ",.05,1,.01,.26)], "E_D=13.6057\\,\\mathrm{eV}\\frac{m^*/m_e}{\\epsilon_r^2},\\quad a_D=0.0529177\\,\\mathrm{nm}\\frac{\\epsilon_r}{m^*/m_e}", "各向同性有效质量近似，忽略谷简并、中央胞修正及高浓度屏蔽。εᵣ采用静态相对介电常数。", [{label:"施主束缚能",evaluate:(x,p)=>13605.7*p[0]/x**2}],p=>[`εᵣ=11.7：E_D = ${(13605.7*p[0]/11.7**2).toFixed(2)} meV`,`εᵣ=11.7：a_D = ${(0.0529177*11.7/p[0]).toFixed(2)} nm`]),
  ],
  9: [
    model("紧束缚带的速度与曲率", [-Math.PI,Math.PI], "ka", "E / t", [c("横向相位 kᵧa / π",0,1,.01,.3)], "E(\\mathbf k)=-2t(\\cos k_xa+\\cos k_ya)", "二维正方格子、单轨道、仅最近邻。显示固定 kᵧ 的切片，不冒充三维金属费米面；带宽8t。斜率给速度，二阶导数给逆有效质量。", [{label:"能量切片",evaluate:(x,p)=>-2*(Math.cos(x)+Math.cos(p[0]*Math.PI))}],p=>[`切片中心 E/t = ${(-2*(1+Math.cos(p[0]*Math.PI))).toFixed(3)}`,"全带宽 W = 8t"]),
    model("Onsager 振荡在 1/B 中的周期", [.02,.12], "1/B / T⁻¹", "振荡信号（归一化）", [c("极值截面积 A / 10¹⁸ m⁻²",.05,2,.01,.3)], "F=\\frac{\\hbar A_{ext}}{2\\pi e},\\quad \\Delta(1/B)=1/F", "仅显示频率几何：信号 cos(2πF/B)，忽略温度、Dingle阻尼、相位偏置和多轨道叠加。实际磁化幅度不能由此图推算。", [{label:"周期示意",evaluate:(x,p)=>Math.cos(2*Math.PI*104.758*p[0]*x)}],p=>[`F = ${(104.758*p[0]).toFixed(2)} T`,`Δ(1/B) = ${(1/(104.758*p[0])).toFixed(4)} T⁻¹`]),
  ],
  10: [
    model("Meissner 场的空间衰减", [0,500], "距表面 x / nm", "B / B₀", [c("London 穿透深度 λ / nm",20,200,1,60)], "B(x)=B_0e^{-x/\\lambda_L}", "半无限平面样品、局域London理论、弱场Meissner态；不适用于涡旋核或原子尺度。x=λ 时场降至 1/e。", [{label:"磁场",evaluate:(x,p)=>Math.exp(-x/p[0])}],p=>[`x=λ：B/B₀ = ${Math.exp(-1).toFixed(4)}`,`λ = ${p[0]} nm`]),
    model("对称 DC SQUID 的磁通调制", [-2,2], "Φ / Φ₀", "I / (2I₀)", [c("结相位均值 δ / π",-.5,.5,.01,.5)], "I=2I_0\\sin\\bar\\delta\\cos(\\pi\\Phi/\\Phi_0)", "两个相同Josephson结，忽略环路自感。实线是固定平均相位的总电流；虚线是最大临界电流包络，不是同一物理量。", [{label:"固定相位电流",evaluate:(x,p)=>Math.sin(p[0]*Math.PI)*Math.cos(Math.PI*x)},{label:"临界包络",evaluate:x=>Math.abs(Math.cos(Math.PI*x))}],()=>["Φ₀ = h/(2e) = 2.067833848×10⁻¹⁵ Wb","调制周期为一个 Φ₀"]),
  ],
  11: [
    model("自旋 ½ 的饱和与 Curie 极限", [0,5], "x = μB/(kBT)", "M / (nμ)", [c("温度 T / K",1,100,1,20)], "M=n\\mu\\tanh x,\\quad \\chi=\\frac{\\mu_0n\\mu^2}{k_BT}", "独立自旋½、两能级、固定μ=μB。横轴是约化场，因此改温度不改变归一化曲线，却改变同一x所需真实B和弱场磁化率。", [{label:"量子饱和",evaluate:x=>Math.tanh(x)},{label:"弱场展开 x",evaluate:x=>x}],p=>[`x=1 所需 B = ${(p[0]/.6717138).toFixed(2)} T`,`Curie χ 相对10 K = ${(10/p[0]).toFixed(3)}`]),
    model("Langevin 与两能级的区别", [0,6], "x = μB/(kBT)", "M / Mₛ", [c("比较场 x₀",.1,6,.1,1)], "L(x)=\\coth x-1/x", "Langevin是可连续转向的经典固定磁矩，tanh是量子自旋½。两者同样饱和，但弱场斜率分别1/3与1；不能用同一磁矩直接互换。", [{label:"经典Langevin",evaluate:x=>x<1e-4?x/3:1/Math.tanh(x)-1/x},{label:"自旋½",evaluate:x=>Math.tanh(x)}],p=>[`L(x₀) = ${(1/Math.tanh(p[0])-1/p[0]).toFixed(4)}`,`tanh(x₀) = ${Math.tanh(p[0]).toFixed(4)}`]),
  ],
  12: [
    model("Weiss 自洽磁化", [.05,1.5], "T / T꜀", "M / M₀", [c("观察温度 T/T꜀",.05,1.5,.01,.6)], "m=\\tanh(m/t)", "零外场、自旋½平均场模型；选择正磁化稳定支。t≥1时m=0，低于临界点求非零根。临界涨落不包含在平均场内。", [{label:"自洽解",evaluate:x=>meanField(x)}],p=>[`m(t₀) = ${meanField(p[0]).toFixed(5)}`,"t→0：m→1；t≥1：m=0"]),
    model("铁磁自旋波的二次色散", [0,Math.PI], "ka", "ℏω / J", [c("自旋 S",.5,2,.5,.5)], "\\hbar\\omega=4JS(1-\\cos ka)", "一维最近邻Heisenberg铁磁体，采用H=−2JΣSᵢ·Sⱼ且J>0，避免交换常数差一倍。这里只讨论线性自旋波，不断言一维有限温度存在长程序。", [{label:"精确格子色散",evaluate:(x,p)=>4*p[0]*(1-Math.cos(x))},{label:"长波2JS(ka)²",evaluate:(x,p)=>2*p[0]*x*x}],p=>[`区边界 ℏω/J = ${(8*p[0]).toFixed(1)}`,"k→0：ω∝k²"]),
  ],
  13: [
    model("横向弛豫与共振线宽", [-8,8], "失谐 Δf / kHz", "吸收（归一化）", [c("T₂ / ms",.05,2,.01,.3)], "A(\\Delta f)=\\frac{1}{1+(2\\pi\\Delta f T_2)^2}", "单一均匀Lorentz线，Δf用kHz且T₂用ms时乘积无量纲。忽略T₂*非均匀展宽和饱和；频率FWHM为1/(πT₂)，不是1/T₂。", [{label:"吸收线",evaluate:(x,p)=>1/(1+(2*Math.PI*x*p[0])**2)}],p=>[`FWHM = ${(1/(Math.PI*p[0])).toFixed(3)} kHz`,"失谐0：吸收=1"]),
    model("自由感应衰减", [0,5], "t / ms", "Mₓ / M₀", [c("T₂ / ms",.2,3,.1,1),c("旋转系失谐 Δf / kHz",0,2,.05,.5)], "M_x=M_0e^{-t/T_2}\\cos(2\\pi\\Delta f t)", "旋转坐标系中的横向信号，没有把GHz实验载频绘成慢振荡。仅均匀T₂弛豫；静态场分布需另外给T₂*。", [{label:"FID",evaluate:(x,p)=>Math.exp(-x/p[0])*Math.cos(2*Math.PI*p[1]*x)},{label:"包络",evaluate:(x,p)=>Math.exp(-x/p[0])}],p=>[`t=T₂：包络=${Math.exp(-1).toFixed(4)}`,`Δf = ${p[1].toFixed(2)} kHz`]),
  ],
  14: [
    model("电子气的介电函数与等离子频率", [.15,3], "ω / ωₚ", "Re εᵣ", [c("阻尼 γ / ωₚ",0,.5,.01,.05)], "\\epsilon_r(\\omega)=1-\\frac{\\omega_p^2}{\\omega(\\omega+i\\gamma)}", "e^(−iωt)约定、ε∞=1的Drude介电函数。无阻尼时ε在ωₚ过零；有阻尼时零点移至√(1−γ²/ωₚ²)。负介电区不支持无损体横向传播。", [{label:"实部",evaluate:(x,p)=>1-1/(x*x+p[0]*p[0])}],p=>[`Re ε=0：ω/ωₚ = ${Math.sqrt(1-p[0]**2).toFixed(4)}`,"Im ε ≥ 0，满足被动介质约定"]),
    model("静电屏蔽如何截短库仑尾", [.1,8], "r / nm", "rV / C", [c("屏蔽长度 λ / nm",.2,3,.1,1)], "V(r)=\\frac{q}{4\\pi\\epsilon_0r}e^{-r/\\lambda}", "三维线性Thomas–Fermi/Debye型屏蔽的Yukawa形式；纵轴乘r后展示屏蔽因子，不是原势本身，也不包括Friedel振荡。", [{label:"有屏蔽",evaluate:(x,p)=>Math.exp(-x/p[0])},{label:"裸库仑",evaluate:()=>1}],p=>[`r=λ：rV/C = ${Math.exp(-1).toFixed(4)}`,`屏蔽波矢 kₛ = ${(1/p[0]).toFixed(3)} nm⁻¹`]),
  ],
  15: [
    model("Lorentz 共振的正常入射反射率", [.1,2.5], "ω / ω₀", "R", [c("阻尼 γ / ω₀",.02,.6,.01,.12),c("振子强度 f",.1,4,.1,1)], "R=\\left|\\frac{\\sqrt{\\epsilon_r}-1}{\\sqrt{\\epsilon_r}+1}\\right|^2", "真空入射、半无限非磁介质；ε=1+f/(1−x²−iγx)，平方根选Im n≥0。薄膜干涉、表面粗糙度及多振子均未包含。", [{label:"反射率",evaluate:(x,p)=>{const a=1-x*x,b=p[0]*x,d=a*a+b*b,re=1+p[1]*a/d,im=p[1]*b/d,abs=Math.hypot(re,im),n=Math.sqrt((abs+re)/2),k=Math.sqrt((abs-re)/2);return ((n-1)**2+k*k)/((n+1)**2+k*k);}}],p=>[`共振阻尼 = ${p[0].toFixed(2)} ω₀`,"被动模型：0≤R≤1"]),
    model("Wannier 激子的束缚能尺度", [4,25], "εᵣ", "Eᵦ / meV", [c("约化质量 μ / mₑ",.02,.5,.01,.1)], "E_b=13.6057\\,\\mathrm{eV}\\frac{\\mu/m_e}{\\epsilon_r^2},\\quad E_n=E_g-E_b/n^2", "三维弱束缚氢原子模型；μ⁻¹=mₑ*⁻¹+mₕ*⁻¹。半径远大于晶格常数才适用，不能用于强局域Frenkel激子。", [{label:"1s束缚能",evaluate:(x,p)=>13605.7*p[0]/x**2}],p=>[`εᵣ=10：Eᵦ = ${(136.057*p[0]).toFixed(3)} meV`,`εᵣ=10：aᵦ* = ${(0.529177/p[0]).toFixed(3)} nm`]),
  ],
  16: [
    model("Landau 自由能的双阱", [-1.8,1.8], "约化极化 p", "约化自由能 f", [c("二次系数 a（∝T−T₀）",-1.5,1.5,.05,-.5),c("约化外场 e",-.3,.3,.01,0)], "f(p)=ap^2/2+p^4/4-ep", "b>0的连续相变模型。图是自由能景观而不是自动绘出的磁滞环；非零外场极值需解ap+p³=e并检查稳定性。", [{label:"自由能",evaluate:(x,p)=>p[0]*x*x/2+x**4/4-p[1]*x}],p=>[p[1]===0?`零场稳定 |p| = ${Math.sqrt(Math.max(0,-p[0])).toFixed(4)}`:"外场使双阱倾斜",p[0]<0?"零场 p=0 不稳定":"零场 p=0 稳定"]),
    model("局域场与介电增强", [0,.9], "x = nα/(3ε₀)", "εᵣ", [c("观察 x₀",0,.85,.01,.3)], "\\frac{\\epsilon_r-1}{\\epsilon_r+2}=\\frac{n\\alpha}{3\\epsilon_0}", "立方或各向同性介质的Clausius–Mossotti近似。x→1发散说明近似失稳，不意味着真实材料介电常数无限；局域结构和非线性需重新处理。", [{label:"局域场结果",evaluate:x=>(1+2*x)/(1-x)},{label:"忽略局域场1+3x",evaluate:x=>1+3*x}],p=>[`εᵣ(x₀) = ${((1+2*p[0])/(1-p[0])).toFixed(3)}`,"稀薄极限：εᵣ≈1+3x"]),
  ],
  17: [
    model("理想 pn 结的整流", [-.2,.6], "电压 V / V", "ln(1+I/Iₛ)", [c("温度 T / K",200,450,1,300),c("理想因子 η",1,2,.05,1)], "I=I_s[e^{qV/(\\eta k_BT)}-1]", "为避免巨大指数淹没反向区，纵轴是ln(1+I/Iₛ)=qV/(ηkBT)。数值读数给实际电流比；忽略串联电阻、击穿、高注入和温度依赖Iₛ。", [{label:"对数电流",evaluate:(x,p)=>x/(p[1]*kb*p[0])}],p=>[`V=0.3 V：I/Iₛ = ${Math.expm1(.3/(p[1]*kb*p[0])).toExponential(3)}`,`热电压 kBT/q = ${(kb*p[0]*1000).toFixed(2)} mV`]),
    model("二维电子的整数填充", [.5,12], "B / T", "填充因子 ν", [c("面密度 nₛ / 10¹⁵ m⁻²",.2,5,.1,2)], "\\nu=\\frac{n_sh}{eB},\\quad R_H=\\frac{h}{\\nu e^2}", "实线是连续的Landau填充因子，并非自动出现平台的实验Hall曲线。量子化平台需要无序局域化和费米能处于迁移率隙，不能简单把ν取整冒充平台。", [{label:"连续填充因子",evaluate:(x,p)=>4.135667696*p[0]/x}],p=>[`ν=2 所需 B = ${(4.135667696*p[0]/2).toFixed(3)} T`,"ν=2 理想平台：R_H=12906.4037 Ω"]),
  ],
  18: [
    model("Landauer 电导台阶与温度展宽", [0,5], "E_F / Δ", "G / (2e²/h)", [c("kBT / Δ",.01,.5,.01,.06),c("各通道透射率 T",.1,1,.05,1)], "G=\\frac{2e^2}{h}\\sum_n\\int T_n(E)(-\\partial f/\\partial E)dE", "自旋简并、4个阈值Eₙ=nΔ的理想阶跃通道，透射率相同且能量无关。有限温度积分可解析化为阈值Fermi占据；包含两端接触电阻。", [{label:"两端电导",evaluate:(x,p)=>p[1]*[1,2,3,4].reduce((sum,n)=>sum+1/(1+Math.exp((n-x)/p[0])),0)}],p=>[`四通道充分开启：G/G₀ = ${(4*p[1]).toFixed(2)}`,"G₀=2e²/h=77.4809 μS"]),
    model("库仑阻塞的电荷抛物线", [0,3], "门电荷 n_g", "E / E_C", [c("总电容 C / aF",1,100,1,10)], "E_N=E_C(N-n_g)^2,\\quad E_C=e^2/(2C)", "常相互作用模型，N=0..3；只展示静电加电子能量，不包含离散单粒子能级、共隧穿或Kondo。相邻抛物线在半整数n_g简并。", [0,1,2,3].map(n=>({label:`N=${n}`,evaluate:(x:number)=>(n-x)**2})),p=>[`E_C = ${(80.1088317/p[0]).toFixed(3)} meV`,`E_C/kB = ${(929.63/p[0]).toFixed(2)} K`]),
  ],
  19: [
    model("短程有序的径向分布", [0,8], "r / d", "g(r)", [c("相关长度 ξ / d",.5,4,.1,1.5)], "g(r)\\longrightarrow1\\quad(r\\gg\\xi)", "教学构造：r<0.7d设排斥核，其外为衰减振荡，体现近邻峰与远程无序。不是由真实SiO₂数据拟合，也不能据此提取实际配位数。", [{label:"短程有序模型",evaluate:(x,p)=>x<.7?0:1+.8*Math.exp(-(x-.7)/p[0])*Math.cos(2*Math.PI*(x-1))}],p=>[`ξ = ${p[0].toFixed(1)} d`,"长程 g(r)→1，不保留周期δ峰"]),
    model("单个双能级的 Schottky 热容", [.05,3], "kBT / Δ", "C / kB", [c("劈裂 Δ / meV",.1,5,.1,1)], "C/k_B=(\\Delta/k_BT)^2\\frac{e^{\\Delta/k_BT}}{(1+e^{\\Delta/k_BT})^2}", "两个非简并能级0与Δ。单个TLS热容不是线性T；玻璃近似C∝T需对近恒定劈裂分布积分，不能从本图直接推断。", [{label:"单个TLS",evaluate:x=>{const z=1/x,e=Math.exp(-z);return z*z*e/(1+e)**2;}}],p=>[`峰值温度约 T = ${(0.417*p[0]/.08617333).toFixed(2)} K`,"T→0和T→∞均趋零"]),
  ],
  20: [
    model("平衡空位的 Arrhenius 图", [.0006,.002], "1/T / K⁻¹", "ln(nᵥ/N)", [c("形成焓 H_f / eV",.3,2,.01,1),c("形成熵 S_f / kB",0,4,.1,1)], "n_v/N\\simeq e^{S_f/k_B}e^{-H_f/(k_BT)}", "稀缺陷、非相互作用的平衡模型，横轴1/T所以斜率−H_f/kB。缺陷含量由形成能决定；扩散还需要迁移能，不可混为同一激活能。", [{label:"ln空位分数",evaluate:(x,p)=>p[1]-p[0]*x/kb}],p=>[`1000 K：nᵥ/N = ${Math.exp(p[1]-p[0]/(kb*1000)).toExponential(3)}`,`斜率 = ${(-p[0]/kb).toFixed(1)} K`]),
    model("扩散核的展宽与守恒", [-8,8], "x / ℓ₀", "ℓ₀ c / N", [c("Dt / ℓ₀²",.2,4,.1,1)], "c(x,t)=\\frac{N}{\\sqrt{4\\pi Dt}}e^{-x^2/(4Dt)}", "无限一维介质、常数D、初始δ脉冲；积分从−∞到∞为N，图只截取有限区间。峰降低不是物质损失，而是宽度增长。", [{label:"归一化浓度",evaluate:(x,p)=>Math.exp(-x*x/(4*p[0]))/Math.sqrt(4*Math.PI*p[0])}],p=>[`均方位移 / ℓ₀² = ${(2*p[0]).toFixed(2)}`,"全空间积分=1"]),
  ],
  21: [
    model("螺位错的长程剪应力", [.5,20], "r / b", "τ / G", [c("剪切模量 G / GPa",10,100,1,40)], "\\tau(r)=Gb/(2\\pi r)", "各向同性线弹性、无限直螺位错，r≈b的核心区域不可信；图包含近核趋势但不能用于核心应力定量。外截断由样品或邻位错决定。", [{label:"弹性剪应力",evaluate:x=>1/(2*Math.PI*x)}],p=>[`r=10b：τ = ${(p[0]/(20*Math.PI)).toFixed(3)} GPa`,"弹性能/长度 ∝ ln(R/r₀)"]),
    model("位错密度与 Taylor 强化", [10,16], "log₁₀ ρ / m⁻²", "强化应力 Δτ / MPa", [c("α",.1,.5,.01,.3),c("剪切模量 G / GPa",10,100,1,40)], "\\Delta\\tau=\\alpha Gb\\sqrt\\rho", "取b=0.25nm的机制模型；α依赖位错结构。这里是分切应力，不是直接拉伸屈服强度，后者还需Schmid或Taylor取向因子。", [{label:"位错强化",evaluate:(x,p)=>p[0]*p[1]*1e9*.25e-9*Math.sqrt(10**x)/1e6}],p=>[`ρ=10¹⁴ m⁻²：Δτ = ${(p[0]*p[1]*2.5).toFixed(2)} MPa`,"密度增大100倍：强化增大10倍"]),
  ],
  22: [
    model("规则溶液：熵与混合焓竞争", [.001,.999], "组分 x_B", "ΔG / Ω", [c("约化温度 kBT / Ω",.05,.9,.01,.25)], "\\Delta G=\\Omega x(1-x)+k_BT[x\\ln x+(1-x)\\ln(1-x)]", "对称规则溶液、Ω>0，每个格点计能量。双阱提示分相，但共存组分需公切线；自旋分解边界来自G″=0。不是任意真实合金相图。", [{label:"混合自由能",evaluate:(x,p)=>x*(1-x)+p[0]*(x*Math.log(x)+(1-x)*Math.log(1-x))}],p=>[p[0]<.5?`自旋分解边界 x = ${((1-Math.sqrt(1-2*p[0]))/2).toFixed(3)}, ${((1+Math.sqrt(1-2*p[0]))/2).toFixed(3)}`:"无自旋分解不稳定区","临界约化温度=1/2"]),
    model("等原子二元合金的有序参数", [.05,1.5], "T / T꜀", "长程有序 η", [c("观察温度 T/T꜀",.05,1.5,.01,.5)], "\\eta=\\tanh(\\eta T_c/T)", "Bragg–Williams平均场、等原子双子格、连续有序转变。与第12章同属自洽结构，但η计化学占位，不是磁化；短程有序和具体晶格相关效应未包含。", [{label:"稳定有序参数",evaluate:x=>meanField(x)}],p=>[`η = ${meanField(p[0]).toFixed(5)}`,"无序态η=0不等于没有近邻关联"]),
  ],
};
