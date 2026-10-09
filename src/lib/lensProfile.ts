// The same depth profile drives native DOM lenses and the wallpaper fallback.
// Deformation, not opacity or frost, decays towards the centre.
const smooth=(t:number)=>{const v=Math.max(0,Math.min(1,t));return v*v*(3-2*v);};
export function lensDisplacement(px:number,py:number,width:number,height:number,depth:number,strength:number,range:number,nx:number,ny:number):[number,number]{
 const half=Math.max(1,Math.min(width,height)*.5);
 const envelope=.025+.975*Math.pow(1-smooth(depth/half),1.35);
 const body=smooth((depth-range)/Math.max(half-range,1));
 const corner=1+.28*2*Math.abs(nx*ny);
 const gain=strength*envelope*corner;
 return [gain*(nx+(2*px/width-nx)*body)+1.5,gain*(ny+(2*py/height-ny)*body)-1];
}

export const LENS_PROFILE_GLSL=`
vec2 lensDisplacement(vec2 local, vec2 size, float depth, float strength, float range, vec2 normal) {
  float halfSize = max(1.0, min(size.x,size.y)*0.5);
  float envelope = 0.025 + 0.975*pow(1.0-smoothstep(0.0,halfSize,depth),1.35);
  float body = smoothstep(0.0,max(halfSize-range,1.0),depth-range);
  float corner = 1.0 + 0.28*2.0*abs(normal.x*normal.y);
  return strength*envelope*corner*mix(normal,2.0*local/size,body)+vec2(1.5,-1.0);
}
`;
