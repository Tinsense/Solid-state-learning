import type { CompanionChapter, CompanionUnit } from "./companionChapters";
const math = (value: string) => value.replaceAll("§", String.fromCharCode(92));
export type Topic = {
 title: string; question: string; pages: string; paragraphs: string[]; latex: string;
 meaning: string; variables: string[]; steps?: [string,string,string][]; lab?: number; warning: string;
};
export function course(number: number, title: string, english: string, pages: string, hero: string, topics: Topic[], summary: string[], exercises: CompanionChapter["exercises"]): CompanionChapter {
 const units: CompanionUnit[] = [{meta:{id:"overview",index:"00",title:"章概览",english:"Overview",question:summary[0],reference:"Kittel 8e, Chapter "+number+", "+pages},paragraphs:[
  "本章先从"+topics[0].title+"建立变量，再学习"+topics.slice(1).map(t=>t.title).join("、")+"。每个模型都分别检查：对象是什么，忽略了什么，测量量如何由理论量得到。",
  "建议先在纸上重建推导，再改变实验参数检验极限。下方原书公式索引可逐式核对；原书CGS表达式与本站SI实验需先转换单位制。"
 ]}];
 topics.forEach((topic,i)=>{
  const id="topic-"+(i+1);
  units.push({meta:{id,index:String(i+1).padStart(2,"0"),title:topic.title,english:"Topic "+(i+1),question:topic.question,reference:"Kittel 8e, Chapter "+number+", "+topic.pages},
   paragraphs:topic.paragraphs,formula:{latex:math(topic.latex),meaning:topic.meaning,variables:topic.variables},
   derivations:topic.steps?[{id:"c"+number+"-"+id,title:"逐步推出："+topic.title,result:math(topic.latex),meaning:topic.meaning,variables:topic.variables,steps:topic.steps.map(([title,explanation,latex])=>({title,explanation,latex:math(latex)}))}]:undefined,
   advancedLab:topic.lab,callout:{title:"适用范围与常见误区",body:topic.warning},
   check:i===0?{id:"c"+number+"-model-check",question:"学习“"+topic.title+"”时，怎样判断公式能否用于新的实验？",choices:[
    {label:"先检查假设、单位制、边界条件与测量量",correct:true,feedback:topic.warning},
    {label:"只要符号相同就直接代数值",feedback:"尤其要区分SI/CGS、角频率/频率、体密度/总量以及符号定义。"},
    {label:"只比较曲线形状，不需要检查极限",feedback:"不同机制可能产生相似曲线；零场、低温、零耦合等极限是科学性检验的重要部分。"}
   ]}:undefined});
 });
 units.push({meta:{id:"map",index:String(topics.length+1).padStart(2,"0"),title:"知识地图",english:"Chapter map",question:"微观模型怎样连接到可测现象？",reference:"Kittel 8e, Chapter "+number+", "+pages},paragraphs:[summary.join(" ")]});
 return {number,title,english,pages,hero,lead:topics[0].paragraphs[0],metrics:[String(units.length).padStart(2,"0")+" 主题单元",String(topics.filter(t=>t.steps).length).padStart(2,"0")+" 渐进推导","02 定量实验"],units,summary,exercises};
}
export const exercise=(id:string,title:string,prompt:string,hints:string[],solution:string,latex:string):CompanionChapter["exercises"][number]=>({id,level:2,title,prompt,hints,solution,solutionLatex:math(latex)});
export const advancedChapters: Record<number,CompanionChapter> = {
7:course(7,"能带","Energy Bands","pp. 161–184","周期势不是装饰，\n它打开电子的禁带。",[
 {title:"Bragg反射与避免交叉",question:"任意弱周期势为什么也能在区边界开隙？",pages:"pp. 164–167, 177–180",paragraphs:[
  "周期势把波矢相差倒格矢的平面波耦合起来。在区边界k=G/2，自由态k与k−G能量相同，非简并微扰的分母趋零，必须同时保留两个态。开隙不是电子撞到一堵墙，而是原本简并的波通过势能混合。",
  "边界本征态接近cos(Gx/2)与sin(Gx/2)：电子密度分别偏向势阱与势垒，因而能量不同。离开边界后两自由态已有能差，混合程度变弱。复杂基元可能让某个势能傅里叶分量为零，此时相应几何边界不一定开隙。"
 ],latex:"E_§pm=§bar§epsilon§pm§sqrt{§delta§epsilon^2+|U_G|^2},§quad E_g=2|U_G|",meaning:"二态哈密顿量的本征值产生避免交叉与能隙。",variables:["ε̄=(εk+εk−G)/2","δε=(εk−εk−G)/2","U_G：势的傅里叶分量，单位能量"],steps:[
 ["选近简并基底","常数势U₀只整体平移能量；保留能连接两态的±G分量。","U(x)=U_0+U_Ge^{iGx}+U_G^*e^{-iGx}"],
 ["写矩阵","动能在平面波基底对角，周期势提供非对角耦合。","H=§begin{pmatrix}§epsilon_k&U_G§§U_G^*&§epsilon_{k-G}§end{pmatrix}"],
 ["求非零解条件","本征矢不为零要求特征行列式为零。","(§epsilon_k-E)(§epsilon_{k-G}-E)-|U_G|^2=0"],
 ["配平方","平均能量与半差使二次方程变成平方形式。","(E-§bar§epsilon)^2=§delta§epsilon^2+|U_G|^2"],
 ["取区边界","此处自由能量相等，上下能级各偏移一个耦合量。","E_§pm(G/2)=§epsilon_{G/2}§pm|U_G|"],
 ["检查零势极限","势消失，能隙消失，恢复自由电子交叉。","E_g=2|U_G|§longrightarrow0"]
 ],lab:0,warning:"两波近似只在单个区边界附近可信，远离边界需增加平面波基底。"},
 {title:"Bloch定理与中央方程",question:"为何Bloch态不是普通周期函数？",pages:"pp. 167–177",paragraphs:[
  "周期哈密顿量与平移算符对易，因此本征态可具有确定平移相位e^{ika}。把这段相位提出后，剩余u_k在一个原胞内周期重复。k与k+G给相同平移本征值，在约化区中用带标区分不同态。",
  "再将u展开为倒格矢傅里叶级数，薛定谔微分方程变成平面波系数的线性本征问题。势分量U_G连接波矢相差G的分量，增加基底可系统收敛能带。ℏk是晶体动量而不是机械动量平均值，群速度应由能带导数求。"
 ],latex:"(§epsilon_{k+G}-E)C_G+§sum_{G'}U_{G-G'}C_{G'}=0",meaning:"中央方程把实空间周期势变成倒空间矩阵。",variables:["ψk=e^{ikx}u_k","u_k(x+a)=u_k(x)","C_G：平面波系数"],warning:"缺陷和表面破坏精确平移对称，需有限体系或散射态而非直接套无限周期结论。"},
 {title:"Kronig–Penney允许区",question:"允许能带怎样从界面匹配出现？",pages:"pp. 168–169, 174–175",paragraphs:[
  "先在矩形势的每段常势区求正弦或指数解，再要求ψ和ψ′在界面连续。一个周期的传输矩阵把左端系数映到右端，Bloch条件指定其本征值e^{±iKa}，因此实K存在时迹的一半在[−1,1]。",
  "将势垒宽度缩到零并保持面积V不变，得到δ势垒模型。自由区相位z=αa随能量变化，P=mVa/ℏ²是无量纲势垒强度。P=0恢复自由电子；P增加使允许区缩窄。右端超出[−1,1]时K为复数，波呈衰减而不是传播。"
 ],latex:"§cos Ka=§cos z+P§frac{§sin z}{z}",meaning:"实Bloch波矢的存在条件决定允许带与禁带。",variables:["α²=2mE/ℏ²","z=αa","K：Bloch波矢"],lab:1,warning:"α和K不是同一个量；z=0要使用sin z/z→1，不能直接除零。"},
 {title:"态计数与导电性",question:"偶数价电子一定形成绝缘体吗？",pages:"pp. 180–182",paragraphs:[
  "N个原胞的周期晶体，每带有N个不等价k态；未劈裂的自旋简并使其容纳2N个电子。部分填充带附近有空态，微小电场能改变占据并产生电流；满带的速度贡献成对抵消。",
  "偶数电子不保证绝缘，因为不同能带可以重叠。奇数电子在无磁、保持原始平移的普通单粒子图景下通常不能全部满带，但磁有序、晶胞倍增和强关联会改变这一结论。判断导电性还需看费米能、带重叠和散射。"
 ],latex:"N_{k,§text{band}}=N,§quad N_{e,§text{band}}=2N",meaning:"Brillouin区的波矢量子化给每带态数。",variables:["N：原胞数","2：自旋简并"],warning:"满带不表示每个电子速度为零，而是完整占据态的净电流相消。"}
 ],["周期势混合近简并态并开隙。","Bloch态由平移相位与周期部分组成。","中央方程可逐步收敛能带。","填充与带重叠共同决定导电性。"],[
 exercise("c7-gap","边界能隙","|U_G|=0.08eV，能隙多大？",["上下能量分别偏移±|U_G|。"],"能隙0.16eV。","E_g=2|U_G|=0.16§,§mathrm{eV}"),
 exercise("c7-states","每带容量","1000原胞、每胞一个电子，该带满了吗？",["每个k允许两个自旋。"],"共有2000含自旋态，1000电子填一半。","N_e/(2N)=1/2")
 ]),
8:course(8,"半导体晶体","Semiconductor Crystals","pp. 185–220","曲率决定响应，\n带隙控制载流子。",[
 {title:"群速度、空穴和有效质量",question:"价带顶负曲率为何用正电空穴描述？",pages:"pp. 187–204",paragraphs:[
  "缓慢外场中的电子波包由能带导数决定速度。沿给定方向的二阶导数决定加速度；各向异性材料需用逆有效质量张量，导电质量、态密度质量和回旋质量一般不相同。",
  "满价带净电流为零，拿掉一个速度v的负电子，等效留下+ev的电流。将空穴激发能定义为带顶能量减原电子能量后，负曲率转为正曲率。间接带隙的导带底与价带顶不在同一k，光学跃迁还需要声子补偿动量。"
 ],latex:"v_i=§hbar^{-1}§partial_{k_i}E,§quad (m^{*-1})_{ij}=§hbar^{-2}§partial_{k_i}§partial_{k_j}E",meaning:"有效质量是局部能带曲率的动力学参数。",variables:["E：带能","k：Bloch波矢","m*：方向相关有效质量"],steps:[
 ["波包驻相","相邻k波干涉得到包络速度。","v=§hbar^{-1}dE/dk"],
 ["写外场力","一维均匀电场推动晶体动量。","§hbar§dot k=qE_x"],
 ["求加速度","对速度用时间链式法则。","§dot v=§hbar^{-1}(d^2E/dk^2)§dot k"],
 ["识别质量","把系数与牛顿形式qE/m*比较。","1/m^*=§hbar^{-2}d^2E/dk^2"],
 ["带边近似","局部抛物线中质量近乎常数。","E=E_c+§hbar^2(k-k_c)^2/(2m_e^*)"],
 ["空穴重标度","价带顶向下量激发能，曲率转正。","E_h=E_v-E_{§rm val}=§hbar^2q^2/(2m_h^*)"]
 ],warning:"ℏk不是一般机械动量；多谷半导体不能把一个标量质量用于所有实验。"},
 {title:"本征浓度与化学势",question:"激活指数里为什么是Eg/2？",pages:"pp. 205–208",paragraphs:[
  "非简并导带电子与价带空穴分别服从Boltzmann近似。三维抛物线态密度积分给Nc、Nv，它们随T³ᐟ²变化。热平衡的质量作用律np=NcNv exp(−Eg/kBT)与本征电中性n=p一起决定浓度。",
  "对乘积开平方产生半带隙指数。本征化学势也不总在带隙正中：两种态密度不同，产生(kBT/2)ln(Nv/Nc)偏移。温度依赖带隙、质量变化和简并都能让Arrhenius直线弯曲，拟合时要注明温区。"
 ],latex:"n_i=§sqrt{N_cN_v}e^{-E_g/(2k_BT)},§quad §mu_i=§frac{E_c+E_v}{2}+§frac{k_BT}{2}§ln§frac{N_v}{N_c}",meaning:"质量作用律与电中性联合给出本征浓度。",variables:["Nc=2(2πmₑ*kBT/h²)³ᐟ²","Nv：价带有效态密度","Eg=Ec−Ev"],steps:[
 ["导带积分","指数占据与三维态密度积分得到电子浓度。","n=N_ce^{-(E_c-§mu)/(k_BT)}"],
 ["空穴积分","空穴是1−f，化学势指数方向相反。","p=N_ve^{-(§mu-E_v)/(k_BT)}"],
 ["消去化学势","相乘只保留带隙。","np=N_cN_ve^{-E_g/(k_BT)}"],
 ["电中性","无净掺杂时电子与空穴成对出现。","n=p=n_i"],
 ["开平方","两个浓度相同，开平方得到半带隙指数。","n_i=§sqrt{N_cN_v}e^{-E_g/(2k_BT)}"],
 ["反求μ","代回电子浓度公式，得到态密度导致的偏移。","§mu_i=(E_c+E_v)/2+(k_BT/2)§ln(N_v/N_c)"]
 ],lab:0,warning:"浓度不是Fermi占据率。体密度m⁻³与cm⁻³相差10⁶，不可混用。"},
 {title:"浅杂质与电离温区",question:"施主为何形成远大于原子的束缚轨道？",pages:"pp. 209–214",paragraphs:[
  "带边电子使用有效质量，离子库仑吸引被静态介电极化屏蔽，因此浅施主近似为有效氢原子。较轻质量与强屏蔽使轨道变大、束缚变浅，连续介质近似才有机会合理。",
  "掺杂浓度不等于任意温度下的自由浓度：低温冻结，中温外因区近乎完全电离，高温本征激发占优。补偿掺杂需要同时解电中性与杂质占据，简并因子也进入电离表达式；高掺杂形成杂质带后孤立轨道近似失效。"
 ],latex:"E_D=13.6057§,§mathrm{eV}§frac{m^*/m_e}{§epsilon_r^2},§quad a_D=a_0§frac{§epsilon_r}{m^*/m_e}",meaning:"有效质量与介电屏蔽重标度氢原子能量和半径。",variables:["a₀=0.0529177nm","ED：到导带底的电离能","εr：静态相对介电常数"],lab:1,warning:"硅的谷简并、各向异性与中央胞修正使精确束缚能偏离此估计。"},
 {title:"输运、热电与超晶格",question:"同浓度材料为何电导不同？",pages:"pp. 208, 214–217",paragraphs:[
  "电导同时取决于浓度和迁移率，迁移率近似eτ/m*；散射改变τ的能量与温度依赖。热电势来自热梯度下能量选择性扩散，开路内建电场抵消净电流，不能只由载流子数量推断。",
  "半金属是价带导带略重叠，而非很小的正带隙。超晶格的长周期缩小Brillouin区并形成迷你带，恒定场使k穿越迷你区产生Bloch振荡；能否观察还需要散射时间足够长、Zener跃迁受控。"
 ],latex:"§sigma=e(n§mu_e+p§mu_h),§quad §omega_B=eEa/§hbar",meaning:"电导联系占据、曲率与散射，Bloch频率由场与周期决定。",variables:["μe、μh：迁移率m²/(V·s)","a：超晶格周期","ωB：角频率rad/s"],warning:"迁移率μ和化学势μ同符号但不是同一量；fB=ωB/(2π)。"}
 ],["带曲率控制动力学。","电中性配合质量作用律给本征浓度。","杂质电离随温度变化。","电导还需迁移率与寿命。"],[
 exercise("c8-donor","浅施主","m*/mₑ=0.1、εr=10，估算ED、aD。",["能量随m*/εr²，半径反向变化。"],"ED≈13.606meV，aD≈5.292nm。","E_D=13.606§,§mathrm{meV},§quad a_D=5.292§,§mathrm{nm}"),
 exercise("c8-ni","带隙变化","300K、NcNv不变，Eg增加0.1eV，ni变为几倍？",["取指数比。"],"约0.145倍。","n_i'/n_i=e^{-0.1/(2§times0.025852)}§simeq0.145")
 ]),
9:course(9,"费米面与金属","Fermi Surfaces and Metals","pp. 221–256","电子怎样绕行，\n由费米面形状决定。",[
 {title:"区图、费米面与轨道",question:"折叠能带会丢失电子态吗？",pages:"pp. 223–231",paragraphs:[
  "扩展区、约化区、周期区是同一能量集合的不同展示。折叠不是删态，约化区保留不同带标。费米面是每条部分填充带Eₙ(k)=EF的等能面，可有电子袋、空穴袋与连通颈。",
  "磁场中波包沿等能面运动，且k沿磁场方向的分量不变，所以轨道是等能面与垂直B平面的交线。速度是能量梯度，垂直费米面而不必平行k；开放轨道可能在重复区中贯穿，带来输运各向异性。"
 ],latex:"§hbar§dot{§mathbf k}=-e§mathbf v§times§mathbf B,§quad §mathbf v=§hbar^{-1}§nabla_kE",meaning:"磁场不做功，轨道由两个守恒条件限定。",variables:["E(k)=EF","k∥守恒","B：磁感应强度T"],steps:[
 ["写磁力","无电场时保留半经典Lorentz力。","§hbar§dot{§mathbf k}=-e§mathbf v§times§mathbf B"],
 ["能量守恒","梯度E与v平行，和v×B点积为零。","§dot E=§nabla_kE§cdot§dot{§mathbf k}=0"],
 ["纵向k守恒","磁力垂直B。","d(§mathbf k§cdot§mathbf B)/dt=0"],
 ["截面几何","两个守恒量确定轨道交线。","E(§mathbf k)=E_F,§quad k_§parallel=§mathrm{const}"],
 ["球形带极限","自由抛物线带的截线是圆。","§omega_c=eB/m"],
 ["一般回旋质量","截面积对能量导数决定量子振荡测到的质量。","m_c=§frac{§hbar^2}{2§pi}§frac{§partial A}{§partial E}"]
 ],warning:"机械轨迹、倒空间轨道和速度方向是三个不同对象，不应混画成同一条曲线。"},
 {title:"紧束缚与赝势方法",question:"原子轨道如何形成宽窄不同的带？",pages:"pp. 232–241",paragraphs:[
  "紧束缚从局域轨道出发，以跳跃矩阵元形成Bloch组合。最近邻跳跃越强带越宽，窄d带和宽s带对金属结合与费米面贡献不同。Wigner–Seitz方法利用原胞边界条件，赝势用平滑价电子问题替换芯区强烈振荡。",
  "赝势弱不等于真实核势弱，而是芯态正交性与强吸引部分抵消后的有效结果。计算费米面先要收敛带能，再根据电子总数求EF。本实验用二维正方格子单轨道模型明确展示曲率，而不是冒充铜、金的实际多带结果。"
 ],latex:"E(§mathbf k)=E_0-2t[§cos(k_xa)+§cos(k_ya)]",meaning:"最近邻跳跃在周期阵列中形成余弦色散。",variables:["t：跳跃能量","a：格距","带宽8t"],lab:0,warning:"不同方法近似起点不同，不能把小势自由电子用于所有金属。"},
 {title:"Landau量子化与Onsager频率",question:"量子振荡为何对1/B周期？",pages:"pp. 242–251",paragraphs:[
  "磁场量子化垂直轨道面积。固定EF时随B变化，不同Landau级依次穿过费米能；量子化面积与B线性，使相邻穿越在倒磁场中等距。三维不同k∥截面叠加时，非极值相位相消，极值截面保留。",
  "旋转磁场测频率可重建费米面几何，温度阻尼给回旋质量，Dingle阻尼给量子寿命。de Haas–van Alphen测磁化，Shubnikov–de Haas测电阻，观测量不同但闭轨道频率几何一致。强场磁击穿可连接本来分开的轨道。"
 ],latex:"F=§frac{§hbar A_{ext}}{2§pi e},§quad §Delta(1/B)=1/F",meaning:"量子化面积条件把费米面截面积转成倒磁场周期。",variables:["Aext：极值面积m⁻²","F：频率，单位T而非Hz","γ：相位偏置"],steps:[
 ["面积量子化","先取单条闭轨道，忽略劈裂和磁击穿。","A_F=2§pi eB(n+§gamma)/§hbar"],
 ["写倒磁场","费米面面积固定。","1/B_n=2§pi e(n+§gamma)/(§hbar A_F)"],
 ["相邻级相减","偏置γ消去。","§Delta(1/B)=2§pi e/(§hbar A_F)"],
 ["定义频率","周期倒数为F。","F=§hbar A_F/(2§pi e)"],
 ["筛选三维轨道","叠加k∥后驻相保留面积极值。","§partial A/§partial k_§parallel=0"],
 ["量纲检查","ℏA/e具有磁场量纲。","[F]=§mathrm T"]
 ],lab:1,warning:"图只演示频率，不提供真实磁化幅度；温度、散射、多频与相位需另算。"},
 {title:"多带Hall与开放轨道",question:"Hall符号一定代表多数载流子吗？",pages:"pp. 230–232, 251–255",paragraphs:[
  "开放轨道使电导方向依赖，磁阻可能高场不饱和。旋转场能把同一个费米面截成开放或闭合轨道，角度扫描因此有价值。简单单球模型无法捕捉这些拓扑变化。",
  "多带Hall响应按浓度和迁移率加权，弱场双载流子分子为pμh²−nμe²。即使电子更多，少数高迁移率空穴也可使Hall为正。拟合应同时约束纵向和横向电导，而不是只从RH反演一个浓度。"
 ],latex:"R_H=§frac{p§mu_h^2-n§mu_e^2}{e(p§mu_h+n§mu_e)^2}",meaning:"各向同性弱场双载流子Drude模型展示迁移率平方权重。",variables:["要求μB≪1","n、p：体浓度","μe、μh：迁移率"],warning:"复杂费米面不一定满足两个各向同性载流子假设。"}
 ],["费米面是部分填充带的等能几何。","磁轨道由能量和k∥守恒确定。","量子振荡测极值面积。","多带输运需要散射信息。"],[
 exercise("c9-period","振荡周期","F=200T时倒磁场周期是多少？",["周期是频率倒数。"],"0.005T⁻¹。","§Delta(1/B)=0.005§,§mathrm T^{-1}"),
 exercise("c9-mass","回旋质量","球形抛物线带的回旋质量是多少？",["A=2πm*E/ℏ²。"],"对A求导代入得到mc=m*。","m_c=§frac{§hbar^2}{2§pi}§frac{2§pi m^*}{§hbar^2}=m^*")
 ]),
10:course(10,"超导","Superconductivity","pp. 257–296","零电阻只是开始，\n相位才是共同语言。",[
 {title:"Meissner与London理论",question:"完美导体为何不等于超导体？",pages:"pp. 259–276",paragraphs:[
  "完美导体的E=0维持已有磁通，历史会影响内部场；超导体在弱场进入Meissner平衡态会排斥磁通。零电阻、热容跃变与能隙是互补证据，不能只凭电阻下降宣称宏观超导。",
  "London电流结合Maxwell方程使磁场按λ指数衰减。λ由超流密度和质量决定，ξ描述序参量变化或配对相关长度，二者不同。SI凝聚能密度为Bc²/(2μ0)，需分清原书Hc和Bc单位。"
 ],latex:"§nabla^2§mathbf B=§mathbf B/§lambda_L^2,§quad §lambda_L^2=§frac{m}{§mu_0n_se^2}",meaning:"局域静态超流响应使磁场进入有限表面层。",variables:["ns：超流电子数密度","λL：穿透深度m","μ0：真空磁导率"],steps:[
 ["London旋度","超流旋度与磁场反向。","§nabla§times§mathbf j_s=-(n_se^2/m)§mathbf B"],
 ["Ampère定律","静态条件忽略位移电流。","§nabla§times§mathbf B=§mu_0§mathbf j_s"],
 ["再取旋度","利用∇·B=0。","-§nabla^2§mathbf B=§mu_0§nabla§times§mathbf j_s"],
 ["定义λ","两式相代得到穿透长度。","§nabla^2§mathbf B=(§mu_0n_se^2/m)§mathbf B"],
 ["边界解","半无限样品深处有限，舍去增长支。","B(x)=B_0e^{-x/§lambda_L}"],
 ["参数极限","超流密度降低使穿透加深。","§lambda_L§propto n_s^{-1/2}"]
 ],lab:0,warning:"II型混合态存在涡旋，不能把Meissner指数场用于整个涡旋核心。"},
 {title:"BCS配对、能隙与同位素",question:"费米面附近弱吸引如何产生能隙？",pages:"pp. 266–269, 277–279",paragraphs:[
  "Cooper配对是许多k、−k态相干混合，不是彼此独立的局域分子。BCS准粒子谱把正常态能量ξk与配对尺度Δ组合为平方根；最小单准粒子激发为Δ，破坏一对通常涉及2Δ。",
  "弱耦合各向同性s波预测2Δ(0)/(kBTc)≈3.528，Tc对耦合指数敏感。简单声子模型有Tc∝M⁻¹ᐟ²同位素趋势，但库仑修正、强耦合和非常规机制会偏离，高温超导不能机械套这个比值。"
 ],latex:"E_k=§sqrt{§xi_k^2+§Delta^2},§quad 2§Delta(0)§simeq3.528k_BT_c",meaning:"粒子空穴混合在费米面附近打开准粒子能隙。",variables:["ξk=εk−μ","Δ：能量","Tc：K"],warning:"单粒子隧穿、光学破对和结电压阈值应分别考虑电极结构。"},
 {title:"磁通量子与II型涡旋",question:"为什么磁通量子中是2e？",pages:"pp. 279–287",paragraphs:[
  "宏观序参量相位沿闭环必须单值，总变化为2π整数。超流机械动量含矢势，深处电流趋零时得到h/(2e)磁通量子。一般有电流时严格量子化的是磁通oid，磁通本身只在相应极限接近整数。",
  "κ=λ/ξ决定界面能：κ<1/√2为I型，κ>1/√2为II型。II型在下上临界场之间有涡旋，核心尺度ξ、周围磁场尺度λ。GL近似Bc2≈Φ0/(2πξ²)，必须注明适用温区。"
 ],latex:"§Phi_0=h/(2e),§quad §kappa=§lambda/§xi,§quad B_{c2}§simeq§Phi_0/(2§pi§xi^2)",meaning:"对电荷与两种空间尺度决定磁通结构。",variables:["Φ0=2.067833848×10⁻¹⁵Wb","ξ：相干长度","Bc2：T"],warning:"小环有有限超流时需保留磁通oid，不应宣称任意环内磁通都是整数倍。"},
 {title:"Josephson与SQUID",question:"零电压怎样产生隧穿电流？",pages:"pp. 287–293",paragraphs:[
  "规范不变相位差δ决定I=Ic sinδ，零电压允许固定相位电流。恒定电压使相位以2eV/ℏ演化，电流频率为2eV/h；频率Hz与角频率rad/s不能混淆。",
  "对称DC SQUID两路径相位半差为πΦ/Φ0，两结电流相加得到cos磁通调制。固定平均相位电流是有符号曲线，最大临界电流是绝对值包络。结不对称、自感与噪声会改变深度。"
 ],latex:"I=I_c§sin§delta,§quad §dot§delta=2eV/§hbar,§quad I_{c,S}=2I_0|§cos(§pi§Phi/§Phi_0)|",meaning:"宏观相位联系电压、磁通与隧穿电流。",variables:["δ：规范不变相位差","I0：单结临界电流","V：结电压"],steps:[
 ["闭环约束","忽略自感，外磁通限定两结相位差。","§delta_2-§delta_1=2§pi§Phi/§Phi_0"],
 ["平均相位","两相位表示为平均值加减半差。","§delta_{1,2}=§bar§delta§mp§pi§Phi/§Phi_0"],
 ["电流相加","相同结的两路径并联。","I=I_0(§sin§delta_1+§sin§delta_2)"],
 ["正弦恒等式","将和化成平均相位与磁通乘积。","I=2I_0§sin§bar§delta§cos(§pi§Phi/§Phi_0)"],
 ["取最大值","最大化平均相位得到临界幅度。","I_{c,S}=2I_0|§cos(§pi§Phi/§Phi_0)|"],
 ["检查周期","一个磁通量子重复，半整数理想抵消。","I_c(§Phi_0/2)=0,§quad I_c(§Phi+§Phi_0)=I_c(§Phi)"]
 ],lab:1,warning:"电流曲线与临界包络是不同物理量，本模型不含环路自感。"}
 ],["Meissner区别于理想导体。","配对产生谱隙与相位刚性。","κ与磁通量子解释涡旋。","Josephson把相位变成可测信号。"],[
 exercise("c10-gap","BCS能隙","Tc=10K，估算弱耦合Δ(0)。",["Δ=1.764kBTc。"],"约1.520meV。","§Delta=1.520§,§mathrm{meV}"),
 exercise("c10-ac","AC频率","1μV结电压对应频率？",["f=2eV/h。"],"483.598MHz。","f=483.598§,§mathrm{MHz}")
 ]),
11:course(11,"抗磁与顺磁","Diamagnetism and Paramagnetism","pp. 297–320","产生磁矩与排列磁矩，\n是两种不同问题。",[
 {title:"局域矩的量子顺磁",question:"Curie律为什么不能外推到强场？",pages:"pp. 302–311",paragraphs:[
  "磁场劈裂Zeeman能级，Boltzmann占据偏向低能方向。弱场能级差远小于kBT，磁化随B/T线性；强场或低温集中到最低态，磁化饱和而不发散。",
  "自旋½两能级给tanh函数，一般J给Brillouin函数，适当经典极限趋Langevin。两种饱和曲线的弱场斜率不同，不能仅凭终点相同互换。"
 ],latex:"M=n§mu§tanh(§mu B/k_BT),§quad §chi_H=§mu_0n§mu^2/(k_BT)",meaning:"两能级统计给饱和，小场展开给SI的Curie磁化率。",variables:["μ：J/T","n：m⁻³","χH=M/H，无量纲"],steps:[
 ["列能量","两方向相差2μB。","E_§pm=§mp§mu B"],
 ["配分函数","两状态权重相加。","Z=2§cosh(§beta§mu B)"],
 ["平均磁矩","对lnZ求场导数。","§langle§mu_z§rangle=k_BT§partial_B§ln Z=§mu§tanh(§beta§mu B)"],
 ["体磁化","独立磁矩贡献按密度相加。","M=n§langle§mu_z§rangle"],
 ["弱场展开","tanhx≈x且B≈μ0H。","M§simeq n§mu^2B/(k_BT)"],
 ["饱和检查","强场有界，χH只在弱场定义线性响应。","M_s=n§mu,§quad §chi_H=§mu_0n§mu^2/(k_BT)"]
 ],lab:0,warning:"CGS的M/B与SI的M/H不同；Curie律要求独立或高温弱相关矩。"},
 {title:"轨道抗磁、Hund与晶体场",question:"闭壳层没有永久矩为何仍响应场？",pages:"pp. 299–302, 305–311",paragraphs:[
  "磁场改变轨道运动并诱导反向磁矩，闭壳层给负抗磁率，通常较弱且近乎不随温度变化。它不同于永久矩热定向产生的顺磁。",
  "开放壳层按Hund规则确定L、S、J，再用Landé因子连接角动量与磁矩。过渡金属晶体场可劈裂轨道简并并淬灭轨道贡献，稀土4f更接近自由离子。Van Vleck响应来自场混合激发态，低温也可近乎常数。"
 ],latex:"§chi_{dia}=-§frac{§mu_0ne^2}{6m_e}§sum_j§langle r_j^2§rangle",meaning:"球对称闭壳层的弱场轨道抗磁项。",variables:["n：原子密度","求和遍历原子电子","⟨r²⟩：m²"],lab:1,warning:"实验对比经典永久矩与自旋½，不是把Langevin顺磁函数当抗磁公式。"},
 {title:"Pauli与Landau响应",question:"金属电子为何不表现普通1/T顺磁？",pages:"pp. 315–317",paragraphs:[
  "场让两自旋能量相反移动，深费米海已满，不能全部独立转向。主要EF附近薄壳重分配，占据约束使响应由费米面态密度决定，T≪TF时温依赖弱。",
  "D(EF)若包含两自旋的体态密度，χP=μ0μB²D(EF)。自由三维电子D=3n/(2EF)。另有Landau轨道抗磁，自由球形非相互作用模型为−χP/3，实际多带和相互作用会改变比例。"
 ],latex:"§chi_P=§mu_0§mu_B^2D(E_F)=3§mu_0n§mu_B^2/(2E_F)",meaning:"泡利阻塞限制能响应的态到费米面附近。",variables:["D：两自旋合计J⁻¹m⁻³","μB：Bohr磁子","EF：J"],warning:"单自旋态密度与合计态密度会差2倍，总态密度与体态密度还差体积。"},
 {title:"等熵退磁冷却",question:"撤掉磁场为何能降低温度？",pages:"pp. 312–315",paragraphs:[
  "先与热浴接触等温加场，自旋有序并放热；再隔离、缓慢减场，近似等熵。独立自旋熵只依赖B/T，所以保持熵意味着温度随场下降。",
  "不能按T∝B无限降到零：残余偶极或交换内部场、热漏和有限操作时间最终主导。核退磁使用更小磁矩达到更低能量尺度，但需要充分预冷和良好热接触。"
 ],latex:"S=S(B/T)§quad§Rightarrow§quad T_f/T_i=B_f/B_i",meaning:"理想独立参数磁体系的等熵线保持B/T。",variables:["内部场可忽略","Ti、Tf：自旋温度"],warning:"强相关或场致相变时需实际熵面，不可直接套此比例。"}
 ],["量子统计产生Curie与饱和。","轨道诱导抗磁不同于永久矩定向。","Pauli响应由费米面决定。","等熵退磁把自旋熵转成冷却。"],[
 exercise("c11-curie","温度比","独立矩样品100K升至200K，弱场χ变几倍？",["χ=C/T。"],"减半。","§chi(200)/§chi(100)=1/2"),
 exercise("c11-cool","退磁","2K、2T等熵降至0.2T，理想温度？",["B/T不变。"],"0.2K，实际内部场与热漏限制。","T_f=0.2§,§mathrm K")
 ]),
12:course(12,"铁磁与反铁磁","Ferromagnetism and Antiferromagnetism","pp. 321–360","交换选择排列，\n畴与自旋波决定响应。",[
 {title:"交换与Weiss自洽",question:"没有外场为何产生自发磁化？",pages:"pp. 323–329",paragraphs:[
  "交换来自反对称多电子波函数与库仑能，不是经典偶极力放大。采用H=−2JΣSi·Sj时J>0偏平行，J<0偏反平行。平均场把邻居替换为与M成正比的有效场，M又由有效场产生，必须自洽。",
  "自旋½零场方程m=tanh(m/t)。t>1只有稳定零解，t<1出现±m稳定支。平均场忽略临界涨落，不用于精确描述低维或临界温区；多畴样品的净M可接近零，却有局部自发磁化。"
 ],latex:"m=§tanh(m/t),§quad t=T/T_c,§quad m=M/M_0",meaning:"自发磁化是响应与反馈的非零自洽根。",variables:["Tc：平均场转变温度","M0：零温饱和磁化","零场、自旋½"],steps:[
 ["分子场","邻居平均影响与M成正比。","B_{eff}=B+§lambda M"],
 ["两能级响应","把有效场代入量子顺磁。","M=n§mu§tanh[§mu(B+§lambda M)/(k_BT)]"],
 ["临界条件","小M线性反馈系数达到1。","k_BT_c=n§mu^2§lambda"],
 ["无量纲化","零场化为m与t的关系。","m=§tanh(m/t)"],
 ["临界展开","保留三次项找到小非零根。","m§simeq m/t-m^3/(3t^3),§quad m^2§simeq3t^2(1-t)"],
 ["极限检查","低温趋满磁化，高于转变取零。","m(0)=1,§quad m(t§ge1)=0"]
 ],lab:0,warning:"局域自发M和整块多畴样品净M不是同一个观测量。"},
 {title:"Magnon与Bloch低温律",question:"为什么磁化损失常按T³ᐟ²？",pages:"pp. 330–335",paragraphs:[
  "小角度自旋偏转作为自旋波传播，量子化后一个magnon降低总自旋一个量子。三维铁磁长波ℏω∝k²，使低能态密度∝sqrt(E)。",
  "态密度乘Bose分布并积分给magnon数∝T³ᐟ²，因此M(0)−M(T)∝T³ᐟ²。各向异性能隙、有限尺寸或低维会改变低温规律；中子磁散射可直接测激发谱，验证温度幂律的机制。"
 ],latex:"§hbar§omega_k=4JS(1-§cos ka)§simeq2JS(ka)^2,§quad §Delta M§propto T^{3/2}",meaning:"明确交换常数约定后得到长波二次色散。",variables:["H=−2JΣSi·Sj","S：自旋","T³ᐟ²适用于三维无隙低温"],lab:1,warning:"一维色散示意不表示一维各向同性模型有限温度存在长程序。"},
 {title:"反铁磁与亚铁磁",question:"反向子格是否一定净磁化为零？",pages:"pp. 336–345",paragraphs:[
  "反铁磁子格大小相同、方向相反，净磁化为零但交错序非零；亚铁磁子格大小或数量不同，反向仍留净M。亚铁磁可能有补偿温度，净M为零并不代表有序消失。",
  "反铁磁沿序方向与垂直方向响应不同。普通磁化测净M，磁中子衍射测交错有序，后者可在小净M下看到磁Bragg峰。无隙AFM长波常近线性，区别于铁磁二次色散。"
 ],latex:"§mathbf M=§mathbf M_A+§mathbf M_B,§quad §mathbf L=§mathbf M_A-§mathbf M_B",meaning:"净与交错序参量分别描述均匀和反向排列。",variables:["MA、MB：子格磁化","L：交错序","TN：Néel温度"],warning:"零净M不等于没有磁序；补偿点不等于Curie或Néel温度。"},
 {title:"畴壁、磁滞与小颗粒",question:"均匀磁化为什么分畴？",pages:"pp. 346–356",paragraphs:[
  "分畴降低退磁场与磁静能，但增加畴壁能。交换希望自旋缓慢变化，各向异性希望沿易轴，两者竞争给壁宽sqrt(A/K)与面能sqrt(AK)。",
  "磁滞来自钉扎、成核势垒与不可逆畴壁运动，不是单个平衡磁化函数。小颗粒可能单畴，也可能热激活超顺磁翻转，矫顽力依赖尺寸、缺陷、方向和观测时间。磁力显微镜主要显示杂散场相关响应，不是直接逐点磁化照片。"
 ],latex:"§delta_w§simeq§pi§sqrt{A/K},§quad §sigma_w§simeq4§sqrt{AK}",meaning:"连续单轴180°Bloch壁的尺度由交换与各向异性竞争决定。",variables:["A：J/m","K：J/m³","σw：J/m²"],warning:"薄膜退磁与壁类型会修正结果；双阱自由能不能自动生成真实磁滞。"}
 ],["交换与热涨落决定序。","magnon谱给低温修正。","净M与交错L分别表征磁序。","畴壁与钉扎控制实际磁滞。"],[
 exercise("c12-wave","长波色散","H=−2JΣSi·Sj，ka≪1时铁磁链色散？",["cosx≈1−x²/2。"],"ℏω≈2JSa²k²。","§hbar§omega§simeq2JSa^2k^2"),
 exercise("c12-wall","壁尺度","K增大4倍、A不变，壁宽和面能如何变？",["看平方根。"],"宽减半，面能加倍。","§delta'_w=§delta_w/2,§quad §sigma'_w=2§sigma_w")
 ]),
};
