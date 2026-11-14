import {findArtifact, worldArtifacts,type Artifact} from './data';
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
