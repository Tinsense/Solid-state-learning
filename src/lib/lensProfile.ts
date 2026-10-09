// A converging lens samples INSIDE its silhouette. Sampling outwards makes
// Chromium repeat/lose the cropped backdrop at the border (vertical streaks).
// Bound the bevel slope and curvature so its ray field cannot fold over itself.
// Frost is applied in output space, independently of this smooth ray field.
const smooth=(t:number)=>{const v=Math.max(0,Math.min(1,t));return v*v*(3-2*v);};
export function lensDisplacement(px:number,py:number,width:number,height:number,depth:number,strength:number,range:number,nx:number,ny:number,radius=Math.min(width,height)*.25):[number,number]{
 const half=Math.max(1,Math.min(width,height)*.5);
 const bevel=Math.min(half,Math.max(range*2.2,radius*1.25));
 const amplitude=Math.min(strength*.75,bevel*.25,radius*.40);
 // The exact SDF normal jumps on the inner medial axes of a rounded box.
 // Blend to a smooth nearest-side normal BEFORE reaching those axes.
 const softness=Math.max(2,radius*.35);
 const wx=1/(1+Math.exp(Math.max(-40,Math.min(40,((width*.5-Math.abs(px))-(height*.5-Math.abs(py)))/softness))));
 const inner=smooth(depth/Math.max(radius,1));
 const sx=wx*Math.tanh(px/softness),sy=(1-wx)*Math.tanh(py/softness);
 const vx=nx+(sx-nx)*inner,vy=ny+(sy-ny)*inner;
 const corner=1+.22*2*Math.abs(nx*ny)*(1-inner);
 const rim=amplitude*Math.pow(1-smooth(depth/bevel),2)*corner;
 const dome=.035*Math.min(strength,half);
 return [-rim*vx-dome*2*px/width+1.5,-rim*vy-dome*2*py/height-1];
}

export const LENS_PROFILE_GLSL=`
vec2 lensDisplacement(vec2 local, vec2 size, float depth, float strength, float range, vec2 normal, float radius) {
  float halfSize = max(1.0, min(size.x,size.y)*0.5);
  float bevel = min(halfSize,max(range*2.2,radius*1.25));
  float amplitude = min(strength*0.75,min(bevel*0.25,radius*0.40));
  float softness = max(2.0,radius*0.35);
  vec2 side = size*0.5-abs(local);
  float wx = 1.0/(1.0+exp(clamp((side.x-side.y)/softness,-40.0,40.0)));
  float inner = smoothstep(0.0,max(radius,1.0),depth);
  vec2 innerNormal = vec2(wx,1.0-wx)*tanh(local/softness);
  float corner = 1.0+0.22*2.0*abs(normal.x*normal.y)*(1.0-inner);
  float rim = amplitude*pow(1.0-smoothstep(0.0,bevel,depth),2.0)*corner;
  float dome = 0.035*min(strength,halfSize);
  return -rim*mix(normal,innerNormal,inner)-dome*2.0*local/size+vec2(1.5,-1.0);
}
`;
