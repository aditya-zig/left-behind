import {findArtifact, worldArtifacts,type Artifact} from './data';
import {sitesFor,type SurfaceSite,type SurfaceWorld} from './atlas';
export const tourSeconds=18;
export function tourSites(world:SurfaceWorld){return sitesFor(world).filter(site=>site.artifactId);}
export function adjacentStop(world:SurfaceWorld,id:string,step:number):SurfaceSite{
  const stops=tourSites(world),index=stops.findIndex(site=>site.id===id);
  return stops[((index<0?(step>0?-1:0):index)+step+stops.length)%stops.length];
}
const captions:Record<string,string>={
 eagle:'The crew came home. Their launchpad stayed.',rover:'The crew’s wheels. Still on the Moon.',alsep:'The astronauts left. The science kept listening.',surveyor:'A robot scout. Some parts came home.',reflector:'A mirror left for laser ranging from Earth.',
 opportunity:'Built for 90 days. Explored for almost 15 years.',insight:'It listened to Marsquakes. Dust ended the mission.',ingenuity:'Five flights planned. Seventy-two flown.',sojourner:'A small rover. A giant first for Mars.',viking1:'A laboratory on another world. Silent since 1982.',viking2:'A second landing. A different view of Mars.',spirit:'It kept exploring—until its wheels could go no further.',phoenix:'It found water ice beneath the Martian soil.',
};
export function tourCaption(site:SurfaceSite){return captions[site.id]??site.summary.split(/(?<=[.!?])\s+/)[0];}
// Unit-vector great-circle interpolation. The antipodal fallback avoids flying
// through the planet when the two locations are on opposite sides.
export function surfaceDirection(from:readonly number[],to:readonly number[],progress:number):[number,number,number]{
 const t=Math.max(0,Math.min(1,progress)),dot=Math.max(-1,Math.min(1,from.reduce((n,v,i)=>n+v*to[i],0)));
 if(dot>.9995){const v=from.map((n,i)=>n+(to[i]-n)*t),length=Math.hypot(...v);return v.map(n=>n/length) as [number,number,number];}
 let tangent=to.map((n,i)=>n-from[i]*dot),length=Math.hypot(...tangent);
 if(length<.00001){const axis=Math.abs(from[1])<.9?[0,1,0]:[1,0,0],projection=axis.reduce((n,v,i)=>n+v*from[i],0);tangent=axis.map((n,i)=>n-from[i]*projection);length=Math.hypot(...tangent);}
 const angle=Math.acos(dot)*t;
 return from.map((n,i)=>n*Math.cos(angle)+tangent[i]/length*Math.sin(angle)) as [number,number,number];
}
export const opening=['galaxy','solar','earth','choose'] as const;
export function flightEase(elapsed:number,duration=3.6):number{
  const t=Math.max(0,Math.min(1,elapsed/duration));return t*t*(3-2*t);
}
export function storyLines(story:string):string[]{
  const sentences=story.match(/[^.!?]+[.!?]+(?:[”’"]|$)?|[^.!?]+$/g)?.map(s=>s.trim()).filter(Boolean)??[story];
  const lines:string[]=[];
  for(const sentence of sentences){const last=lines.length-1;if(last>=0&&`${lines[last]} ${sentence}`.length<205)lines[last]+=` ${sentence}`;else lines.push(sentence);}
  return lines;
}
export function routeMission(hash:string):{world:'moon'|'mars';item:Artifact}|null{
  const [world,id]=hash.replace(/^#\/?/,'').split('/');
  if(world!=='moon'&&world!=='mars')return null;
  const item=findArtifact(id??'');return {world,item:item?.world===world?item:worldArtifacts(world)[0]};
}
