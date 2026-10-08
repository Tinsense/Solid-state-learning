import {test,expect} from "@playwright/test";
import {diamondCell,hcpCell} from "../src/lib/crystalCells";
test("金刚石常规晶胞的四面体近邻和立方框架正确",()=>{
 const cell=diamondCell();
 expect(cell.atoms).toHaveLength(18);expect(cell.frame).toHaveLength(12);expect(cell.bonds).toHaveLength(16);
 for(let i=14;i<18;i++){
  const origin=cell.atoms[i];
  const vectors=cell.bonds.filter(pair=>pair.includes(i)).map(pair=>cell.atoms[pair[0]===i?pair[1]:pair[0]]).map(p=>[p.x-origin.x,p.y-origin.y,p.z-origin.z]);
  expect(vectors).toHaveLength(4);
  for(const v of vectors)expect(Math.hypot(...v)).toBeCloseTo(Math.sqrt(3)/4,8);
  expect(vectors[0].reduce((sum,v,j)=>sum+v*vectors[1][j],0)/(3/16)).toBeCloseTo(-1/3,8);
 }
});
test("HCP 六棱柱保持理想轴比和 ABA 层位置",()=>{
 const cell=hcpCell();expect(cell.atoms).toHaveLength(17);expect(cell.frame).toHaveLength(18);
 expect(cell.atoms.filter(p=>p.y===0)).toHaveLength(3);
 expect(Math.max(...cell.atoms.map(p=>p.y))-Math.min(...cell.atoms.map(p=>p.y))).toBeCloseTo(Math.sqrt(8/3),8);
 for(const [i,j] of cell.bonds){const a=cell.atoms[i],b=cell.atoms[j];expect(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)).toBeCloseTo(1,8);}
 for(let i=0;i<7;i++){expect(cell.atoms[i].x).toBe(cell.atoms[i+7].x);expect(cell.atoms[i].z).toBe(cell.atoms[i+7].z);}
});
