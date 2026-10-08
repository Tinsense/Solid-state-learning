/** Conventional-cell coordinates. Display radii are illustrative, not packing
 * radii; colours distinguish equivalent sublattices/layers, not atom species.
 * Reference: UCL PHAS 3C25, Section 1, Crystal Structure.
 */
export type Atom = {x:number;y:number;z:number;tone:number};
export type Cell = {atoms:Atom[];bonds:[number,number][];frame:[number,number][];radius:number};
const distance=(a:Atom,b:Atom)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
function neighbors(atoms:Atom[],length:number):[number,number][]{
 const pairs:[number,number][]=[];
 atoms.forEach((a,i)=>atoms.forEach((b,j)=>{if(j>i&&Math.abs(distance(a,b)-length)<1e-6)pairs.push([i,j]);}));
 return pairs;
}
export function diamondCell():Cell {
 const atoms:Atom[]=[];
 for(const x of [0,1])for(const y of [0,1])for(const z of [0,1])atoms.push({x,y,z,tone:0});
 for(let axis=0;axis<3;axis++)for(const side of [0,1]){
  const p=[.5,.5,.5];p[axis]=side;atoms.push({x:p[0],y:p[1],z:p[2],tone:0});
 }
 for(const [x,y,z] of [[.25,.25,.25],[.25,.75,.75],[.75,.25,.75],[.75,.75,.25]])atoms.push({x,y,z,tone:1});
 const frame=neighbors(atoms.slice(0,8),1);
 return {atoms:atoms.map(p=>({...p,x:p.x-.5,y:p.y-.5,z:p.z-.5})),bonds:neighbors(atoms,Math.sqrt(3)/4),frame,radius:.068};
}
export function hcpCell():Cell {
 const atoms:Atom[]=[],frame:[number,number][]=[];
 const c=Math.sqrt(8/3);
 for(const y of [-c/2,c/2]){
  for(let i=0;i<6;i++){const a=i*Math.PI/3;atoms.push({x:Math.cos(a),y,z:Math.sin(a),tone:0});}
  atoms.push({x:0,y,z:0,tone:0});
 }
 for(let i=0;i<3;i++){const a=Math.PI/6+i*2*Math.PI/3;atoms.push({x:Math.cos(a)/Math.sqrt(3),y:0,z:Math.sin(a)/Math.sqrt(3),tone:1});}
 for(let i=0;i<6;i++)frame.push([i,(i+1)%6],[i+7,(i+1)%6+7],[i,i+7]);
 return {atoms,bonds:neighbors(atoms,1),frame,radius:.125};
}
