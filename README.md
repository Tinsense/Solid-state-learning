# 晶格 · Kittel 第三章交互式电子教材

面向材料、电池方向研究生的中文交互式学习网站，完整覆盖 Kittel *Introduction to Solid State Physics*（8th ed.）Chapter 3: **Crystal Binding and Elastic Constants**。

## 功能

- 11 个连续学习单元，覆盖惰性气体、离子/共价/金属/氢键、原子半径、应变应力、立方弹性和弹性波。
- 10 组 KaTeX 公式卡片与 progressive derivation（逐步推导）。
- 9 个实时实验：结合图景、London、Lennard–Jones、Pauli、Madelung、NaCl 壳层、电子密度、应变、立方弹性与弹性波。
- Concept Check、三级练习、知识图谱、进度本地保存、Dark/Light、键盘导航与 reduced-motion 支持。

## 运行

需要 Node.js 20.19+ 或 22.12+。

```bash
npm install
npm run dev
```

浏览器打开终端显示的本地地址，通常是 `http://127.0.0.1:5173`。

## 构建与预览

```bash
npm run build
npm run preview
```

生产文件位于 `dist/`。KaTeX 字体与代码均被打包进 `dist`，预览不依赖外部 CDN。

## 测试

```bash
npx playwright install chromium
npm test
```

测试覆盖首页、目录、渐进推导、Lennard–Jones slider、Madelung 收敛、弹性波方向/模式、Concept Check 和横向溢出，并在 1440 px 与 390 px 两种视口运行。

## 内容说明

教学内容依据用户提供的 Kittel PDF 第 3 章重写。公式默认使用 SI；涉及 Kittel 原书 CGS 记号处提供明确对照。插图均用 SVG/CSS 重新绘制，没有扫描或嵌入教材原图。
