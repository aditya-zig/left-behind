import {SurfaceVisual} from './Photography';
import {AlienUfo} from './OrbitGuide';
import {formatCoordinates,mapPosition,type SurfaceSite} from './atlas';
import {tourCaption} from './cinematic';
type Props={site:SurfaceSite;stops:SurfaceSite[];travelling:boolean;motion:boolean;playing:boolean;progress:number;onPlay:()=>void;onPrevious:()=>void;onNext:()=>void;onDetails:()=>void;onSelect:(site:SurfaceSite)=>void};
export default function TourPanel(p:Props){
 const index=p.stops.findIndex(site=>site.id===p.site.id),[x,y]=mapPosition(p.site.coordinates);
 return <>
  <article className={`tour-story glass ${p.travelling?'tour-in-flight':''}`} aria-label="Current discovery" aria-live="polite" aria-busy={p.travelling}>
   <div className="tour-story-meta"><span>{p.site.mission}</span><span>{index<0?'Map stop':`${String(index+1).padStart(2,'0')} / ${String(p.stops.length).padStart(2,'0')}`}</span></div>
   <div className="tour-visual"><SurfaceVisual key={p.site.id} site={p.site} motion={p.motion&&!p.travelling}/></div>
   <h2>{p.site.name}</h2><div className="tour-caption"><AlienUfo/><p>{tourCaption(p.site)}</p></div>
   <button className="tour-evidence" onClick={p.onDetails}>Story & evidence <span aria-hidden="true">↗</span></button>
  </article>
  <div className="tour-transport glass" aria-label="Guided tour controls">
   <button aria-label="Previous stop" onClick={p.onPrevious}>←</button>
   <button className="tour-play" aria-label={p.playing?'Pause guided tour':'Play guided tour'} aria-pressed={p.playing} onClick={p.onPlay}><span aria-hidden="true">{p.playing?'Ⅱ':'▷'}</span><span>{p.playing?'Auto tour':'Explore'}</span></button>
   <button className="tour-next" aria-label="Next stop" onClick={p.onNext}>Next stop <span aria-hidden="true">→</span></button>
   <span className="tour-progress" style={{transform:`scaleX(${p.progress})`}}/>
  </div>
  <div className="tour-minimap" aria-label="Location overview"><div className="tour-minimap-map"><img src={p.site.world==='moon'?'/assets/moon-map.jpg':'/assets/mars.jpg'} alt={`NASA ${p.site.world} cylindrical reference map`}/>{p.stops.map(site=>{const [left,top]=mapPosition(site.coordinates);return <button key={site.id} style={{left:`${left}%`,top:`${top}%`}} aria-label={`Map: ${site.name}`} aria-current={site.id===p.site.id?'location':undefined} title={site.name} onClick={()=>p.onSelect(site)}/>;})}<span className="minimap-cross" style={{left:`${x}%`,top:`${y}%`}}/></div><span>{p.site.kind==='Hardware position'?'Catalogued position':p.site.kind==='Landing reference'?'Landing reference':'Approx. region'} · {formatCoordinates(p.site.coordinates)}</span></div>
 </>;
}
