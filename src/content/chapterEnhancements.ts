import type { DepthBlock } from "./chapterDepth";
const math=(s:string)=>s.replaceAll("§",String.fromCharCode(92));
const block=(objectives:string[],reasoning:[string,string,string?][],example:DepthBlock["example"],pitfalls:string[],symbols:DepthBlock["symbols"]):DepthBlock=>({
 objectives,prerequisites:["微积分与二阶Taylor展开","能量、密度和单位制的区分"],
 reasoning:reasoning.map(([title,body,latex])=>({title,body,latex:latex?math(latex):undefined})),
 example:{...example,latex:example.latex?math(example.latex):undefined},pitfalls,symbols
});
export const chapterEnhancements:Record<string,DepthBlock>={
 "3:inert-gas":block(["从两个耦合振子的零点能推出R⁻⁶吸引","区分原子对势与整个fcc晶格势","从势的曲率连接体模量"],[
  ["中性不代表没有涨落","闭壳层没有永久偶极，但量子零点涨落产生瞬时偶极。两原子偶极耦合改变正常模频率，吸引来源是耦合前后零点能之差。","U_{dip}\\propto x_1x_2/R^3"],
  ["必须把一阶贡献抵消","对称与反对称模的频移一正一负，一阶R⁻³项在频率和中抵消。保留平方根二阶项才得到负R⁻⁶；不能仅凭偶极相互作用就直接声称平均吸引R⁻³。","§omega_++§omega_-=2§omega_0-O(R^{-6})"],
  ["原子对与晶格计数","晶格总能把全部邻壳求和，每一对计两次所以乘1/2。Lennard–Jones指数12是方便的经验排斥，不是精确泡利力。","U_{tot}=2N§epsilon[A_{12}(§sigma/R)^{12}-A_6(§sigma/R)^6]"],
  ["平衡与曲率是不同导数","一阶导数为零定位R0，二阶导数控制压缩恢复。fcc每原子体积v=R³/√2，总体积V=Nv，所以dR/dV=R/(3V)。在平衡处dU/dR=0，链式法则中的一阶导数项消失，得到B=R0²U''(R0)/(9V0)。这里U是N个原子的总能量；若使用每原子能量u，则分母也要改为每原子体积v0。","B=V§frac{d^2U}{dV^2},§quad B_{R_0}=§frac{R_0^2}{9V_0}§frac{d^2U}{dR^2}"]
 ],{title:"fcc平衡距不是孤立二原子距",givens:["A12=12.13188","A6=14.45392"],reasoning:["设dU/dR=0。","得到(R0/σ)^6=2A12/A6。","与孤立对2^(1/6)比较。"],result:"晶格给R0/σ≈1.090，而孤立LJ对约1.122。远邻吸引改变平衡距。",latex:"R_0/§sigma=(2A_{12}/A_6)^{1/6}§simeq1.090"},["不要漏去对计数1/2。","单对势曲率单位J/m²，不是体模量Pa。","原书此段部分使用CGS，SI库仑项需4πε0。"],[{symbol:"R",meaning:"最近邻距",unit:"m"},{symbol:"B",meaning:"体模量",unit:"Pa"},{symbol:"ε",meaning:"LJ能量尺度",unit:"J"}]),
 "3:ionic":block(["明确Madelung长度基准","从Born–Mayer平衡消去排斥系数","区分晶格能与中性原子结合能"],[
  ["先规定能量零点","把离子从晶格移到无限远离子得到晶格能；拆成中性原子还涉及电离能、电子亲和能，不能把两个过程当作相同结合能。"],
  ["长程求和需要边界","库仑晶格的条件收敛要求电中性分组或Ewald类方法。按距离逐个乱排会产生非物理结果；一维交替链使用对称分组才得到2ln2。","§alpha_{1D}=2§sum_{n=1}^§infty(-1)^{n+1}/n=2§ln2"],
  ["平衡消去未知排斥","写每离子对能A exp(−R/ρ)−K/R，其中K=αq²/(4πε0)。导数为零得到A exp(−R0/ρ)=Kρ/R0²，再代回能量。","u(R_0)=-§frac{K}{R_0}(1-§rho/R_0)"],
  ["稳定性还看二阶","驻点不保证极小，曲率K(1/ρ−2/R0)/R0²。稳定条件R0>2ρ，与实验中ρ通常小于离子距一致。","u''(R_0)=§frac{K}{R_0^2}(1/§rho-2/R_0)"]
 ],{title:"NaCl库仑能量尺度",givens:["α=1.74756","R0=0.282nm","q=e，e²/(4πε0)=1.439965eV·nm"],reasoning:["K/R0=α×1.439965/0.282。","这是不含排斥修正的每离子对吸引。","Born–Mayer平衡还乘(1−ρ/R0)。"],result:"裸晶格吸引约8.924eV/离子对；不能直接当作中性原子结合能。",latex:"K/R_0§simeq8.924§,§mathrm{eV}"},["α的数值依赖选R还是常规a作长度。","一对离子与单离子能量归一不同。","只算六个最近邻不是完整NaCl晶格能。"],[{symbol:"α",meaning:"指定长度约定的Madelung常数"},{symbol:"ρ",meaning:"排斥衰减长度",unit:"m"},{symbol:"K",meaning:"库仑能×长度",unit:"J·m"}]),
 "3:elasticity":block(["保持张量剪应变与工程剪应变一致","用稳定性判断参数能否用于实验","从均匀压缩推出体模量"],[
  ["应变来自位移梯度对称部","反对称部分是刚体转动，不产生线性弹性应变。工程剪应变γxy=2εxy，Voigt能量系数必须随约定匹配。","§epsilon_{ij}=§tfrac12(§partial_iu_j+§partial_ju_i)"],
  ["立方能量","三个独立常数分别控制轴向、轴间耦合与剪切。任意应变能应非负才是稳定弹性体。","w=§tfrac12C_{11}§sum_i§epsilon_{ii}^2+C_{12}§sum_{i<j}§epsilon_{ii}§epsilon_{jj}+2C_{44}§sum_{i<j}§epsilon_{ij}^2"],
  ["分解稳定模式","均匀体积变化、体积不变四方形变和纯剪切给三个必要充分条件；互动参数不能越界后还报告实声速。","C_{11}+2C_{12}>0,§quad C_{11}-C_{12}>0,§quad C_{44}>0"],
  ["体模量","均匀轴应变e时体积应变约3e，应力(C11+2C12)e，因此B=(C11+2C12)/3。","B=(C_{11}+2C_{12})/3"]
 ],{title:"稳定性不是所有Cij都为正",givens:["C11=150GPa","C12=−20GPa","C44=40GPa"],reasoning:["C11+2C12=110>0。","C11−C12=170>0。","C44>0。"],result:"线性立方弹性能正定，负C12本身不代表不稳定；B≈36.67GPa。",latex:"B=(150-40)/3=36.67§,§mathrm{GPa}"},["C12可以负，但须满足组合稳定条件。","弹性常数可因恒温/绝热测量不同。","大形变不能继续使用线性小应变模型。"],[{symbol:"εij",meaning:"张量应变，无量纲"},{symbol:"γxy",meaning:"工程剪应变=2εxy"},{symbol:"Cij",meaning:"弹性刚度",unit:"Pa"}]),
 "3:waves":block(["从Newton方程构造Christoffel矩阵","用任意传播方向求纵横偏振","了解声速反演的条件"],[
  ["从局部动量守恒开始","忽略耗散与体力，质量密度乘加速度等于应力散度，代入Hooke定律。","§rho§ddot u_i=C_{ijkl}§partial_j§partial_lu_k"],
  ["平面波代入","设u=A exp[i(k·r−ωt)]，两个空间导数给−kjkl，时间导数给−ω²。约去共同负号后得本征问题。","§Gamma_{ik}A_k=§rho v^2A_i,§quad §Gamma_{ik}=C_{ijkl}n_jn_l"],
  ["立方矩阵","对角元素C44+(C11−C44)ni²，非对角(C12+C44)ninj。其三个本征值除ρ并开平方给三支速度。","§Gamma_{ii}=C_{44}+(C_{11}-C_{44})n_i^2,§quad §Gamma_{i§ne j}=(C_{12}+C_{44})n_in_j"],
  ["高对称方向与一般方向","[100]能直接读C11与C44，[110]、[111]含组合。一般方向偏振不严格平行或垂直n，因此称准纵、准横波。反演还需ρ、方向和模式识别。"]
 ],{title:"从[100]声速反演",givens:["ρ=5000kg/m³","vL=5000m/s","vT=3000m/s"],reasoning:["C11=ρvL²。","C44=ρvT²。","仍缺C12，需其他方向或体模量。"],result:"C11=125GPa、C44=45GPa，两声速不能唯一确定三个常数。",latex:"C_{11}=125§,§mathrm{GPa},§quad C_{44}=45§,§mathrm{GPa}"},["密度与速度要用相容SI单位。","动态绝热刚度不一定等于静态等温刚度。","不稳定负本征值不能取绝对值后继续画实声速。"],[{symbol:"n",meaning:"单位传播方向"},{symbol:"Γ",meaning:"Christoffel矩阵",unit:"Pa"},{symbol:"ρ",meaning:"质量密度",unit:"kg/m³"}]),
 "6:fermi-surface":block(["区分占据球与边界费米面","把状态计数转成正确EF尺度","从积分求零温总能"],[
  ["一个k格体积","周期边界使各方向间隔2π/L，每个波矢格体积(2π)³/V，再乘两自旋。","N=2§frac{V}{(2§pi)^3}§frac{4§pi k_F^3}{3}"],
  ["态数与能量","n=N/V给kF=(3π²n)¹ᐟ³；把kF代动能才得EF，不能把半径kF和能量EF混用。","E_F=§hbar^2(3§pi^2n)^{2/3}/(2m)"],
  ["零温总能","三维D(E)∝sqrt E，积分ED(E)至EF并与N积分比较。","U_0=§int_0^{E_F}ED(E)dE=§tfrac35NE_F"],
  ["零温压力","固定N时EF随V⁻²ᐟ³，压力−∂U/∂V给2U/(3V)，是量子简并压力而非经典nkBT。","P_0=2U_0/(3V)=2nE_F/5"]
 ],{title:"n=10²⁸m⁻³的电子尺度",givens:["裸电子质量","自旋简并2"],reasoning:["先求kF≈6.665×10⁹m⁻¹。","EF≈1.693eV。","TF=EF/kB≈1.965×10⁴K。"],result:"室温T/TF约0.015，电子高度简并，不应用经典Maxwell气体。",latex:"E_F§simeq1.693§,§mathrm{eV},§quad T_F§simeq1.965§times10^4§,§mathrm K"},["费米面只是占据球边界，不是所有电子都在边界。","实际金属周期势与有效质量改变自由球模型。","n按m⁻³输入，若用cm⁻³先乘10⁶。"],[{symbol:"kF",meaning:"费米波矢",unit:"m⁻¹"},{symbol:"EF",meaning:"费米能",unit:"J或eV"},{symbol:"TF",meaning:"费米温度",unit:"K"}])
};
