import {lazy,Suspense,useCallback,useEffect,useMemo,useRef,useState} from 'react';
import ArchiveApp from './App';
import Model,{assetFor} from './Model';
import OrbitGuide from './OrbitGuide';
import {artifacts,findArtifact,worldArtifacts,type Artifact} from './data';
import {routeMission,storyLines} from './cinematic';
import type {World} from './FlightScene';
import film from './media.json';
import './cinematic.css';
const FlightScene=lazy(()=>import('./FlightScene'));
const featured=['eagle','opportunity','ingenuity'];
const detailRoute=(hash:string)=>hash.startsWith('#/equipment/')?findArtifact(hash.split('/')[2]):undefined;
function useReducedMotion(){
 const [reduced,set]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{const q=matchMedia('(prefers-reduced-motion: reduce)'),change=()=>set(q.matches);q.addEventListener('change',change);return()=>q.removeEventListener('change',change);},[]);return reduced;
}
function useVoice(text:string,enabled:boolean,onEnd:()=>void){
 const supported=typeof speechSynthesis!=='undefined',end=useRef(onEnd);end.current=onEnd;
 const [speaking,setSpeaking]=useState(false);
 useEffect(()=>{
  if(!supported||!enabled){setSpeaking(false);return;}
  let active=true;
  const speak=()=>{speechSynthesis.cancel();if(document.hidden)return;const u=new SpeechSynthesisUtterance(text);u.rate=.92;u.lang='en-US';u.onstart=()=>{if(active)setSpeaking(true);};u.onend=()=>{if(active){setSpeaking(false);end.current();}};u.onerror=()=>{if(active)setSpeaking(false);};speechSynthesis.speak(u);};
  const visibility=()=>{setSpeaking(false);speechSynthesis.cancel();if(!document.hidden)speak();};speak();document.addEventListener('visibilitychange',visibility);
  return()=>{active=false;document.removeEventListener('visibilitychange',visibility);speechSynthesis.cancel();};
 },[text,enabled,supported]);return {supported,speaking};
}
function NasaFilm({motion,className=''}:{motion:boolean;className?:string}){
 const ref=useRef<HTMLVideoElement>(null);
 useEffect(()=>{const v=ref.current;if(!v)return;let visible=false;const sync=()=>{if(motion&&visible&&!document.hidden)void v.play().catch(()=>{/* Poster remains available when autoplay is blocked. */});else v.pause();};const observer=new IntersectionObserver(entries=>{visible=entries[0].intersectionRatio>.01;sync();},{threshold:.01});observer.observe(v);document.addEventListener('visibilitychange',sync);return()=>{observer.disconnect();document.removeEventListener('visibilitychange',sync);v.pause();};},[motion]);
 return <video ref={ref} className={`nasa-film ${className}`} src="/media/nasa-lunar-animations.mp4" poster="/media/nasa-lunar-poster.jpg" muted loop playsInline preload="metadata" aria-hidden="true"/>;
}
function DeferredModel({item,motion}:{item:Artifact;motion:boolean}){
 const ref=useRef<HTMLDivElement>(null),[visible,set]=useState(false),image=assetFor(item).preview??assetFor(item).photo;
 useEffect(()=>{if(!ref.current)return;const observer=new IntersectionObserver(entries=>set(entries[0].isIntersecting),{rootMargin:'60px'});observer.observe(ref.current);return()=>observer.disconnect();},[]);
 return <div ref={ref} className="showcase-model">{visible?<Model artifact={item} autoRotate={motion}/>:image&&<img src={image.file} alt={image.caption??`NASA reference of ${item.name}`} loading="lazy"/>}</div>;
}
function HomeIcon({onHome}:{onHome?:()=>void}){
 return <a className="home-icon" href="#/" aria-label="Home" onClick={onHome?e=>{e.preventDefault();onHome();}:undefined}><svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m3 10 9-7 9 7M5 9v11h5v-6h4v6h5V9" strokeLinejoin="round" strokeLinecap="round"/></svg></a>;
}
function EquipmentPage({item,motion,onBack}:{item:Artifact;motion:boolean;onBack:()=>void}){
 useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});document.querySelector<HTMLElement>('.equipment-page h1')?.focus();},[item.id]);
 const asset=assetFor(item),map=item.world==='moon'?'https://trek.nasa.gov/moon/':item.world==='mars'?'https://trek.nasa.gov/mars/':undefined;
 const cite=(index=0)=><a className="inline-source" href={item.sources[index]?.url??item.sources[0].url} target="_blank" rel="noreferrer">NASA source ↗</a>;
 return <main className="equipment-page" data-mission={item.id}>
  <button className="equipment-back" onClick={onBack}>← Back to exploring</button>
  <section className="equipment-opening" id="mission-story"><div className="equipment-visual"><Model artifact={item} autoRotate={motion}/>{item.modelNote&&<p className="reference-note">{item.modelNote}</p>}</div>
   <div className="equipment-intro"><p className="equipment-mission">{item.mission} · {item.year}</p><h1 tabIndex={-1}>{item.name}</h1><p className="equipment-subtitle">{item.subtitle}</p><p className="equipment-story">{item.story} {cite()}</p><div className="equipment-fact"><strong>{item.fact}</strong><span>{item.factLabel}</span></div></div>
  </section>
  <div className="equipment-reading-layout">
   <article className="equipment-article">
    <section id="mission-purpose"><h2>What it was built to do</h2><p>{item.purpose} {cite()}</p></section>
    <section id="mission-stayed"><h2>Why it stayed</h2><p>{item.why} {cite()}</p></section>
    <section id="mission-discovery"><h2>What we learned</h2><p>{item.discovery} {cite()}</p></section>
    <section className="equipment-evidence" id="mission-record"><h2>Where the story stands</h2><dl><div><dt>Recorded status</dt><dd>{item.status}. {item.statusDetail}</dd></div><div><dt>Location</dt><dd>{item.location}. {item.locationNote}</dd></div></dl><p className="evidence-caution">These are historical mission records, not a live connection to the hardware. A map marker is a contextual reference, not an exact parking coordinate. {item.modelNote??'A reference visual is not a live image of the site.'}</p></section>
    <section id="mission-sources"><h2>Read the original evidence</h2><p>The links below identify what each NASA record supports. Follow the source, not just the retelling.</p><div className="equipment-sources">{item.sources.map((source,index)=><a key={source.url} href={source.url} target="_blank" rel="noreferrer"><span className="source-number">{String(index+1).padStart(2,'0')}</span><span><strong>{source.title} ↗</strong><span>{source.supports}</span><small>{new URL(source.url).hostname}</small></span></a>)}</div></section>
   </article>
   <aside className="equipment-reading-tools" aria-label="Mission reading guide"><div><h2>In this story</h2><nav aria-label="On this page"><a href="#mission-story" onClick={e=>{e.preventDefault();document.getElementById('mission-story')?.scrollIntoView({behavior:motion?'smooth':'instant'});}}>The mission</a>{[['mission-purpose','Its purpose'],['mission-stayed','Why it stayed'],['mission-discovery','The science'],['mission-record','Status & location'],['mission-sources','NASA evidence']].map(([id,label])=><a key={id} href={`#${id}`} onClick={e=>{e.preventDefault();document.getElementById(id)?.scrollIntoView({behavior:motion?'smooth':'instant'});}}>{label}</a>)}</nav></div>
    <div className="official-resources"><h2>Explore with NASA</h2>{map&&<a href={map} target="_blank" rel="noreferrer">{item.world==='moon'?'Moon':'Mars'} Trek ↗<span>Explore NASA’s interactive surface maps.</span></a>}{asset.model&&<a href={asset.model.source} target="_blank" rel="noreferrer">Original NASA 3D resource ↗<span>The reference model used on this page.</span></a>}{asset.photo&&<a href={asset.photo.source} target="_blank" rel="noreferrer">Original mission image ↗<span>View its NASA context and credits.</span></a>}<a href="https://science.nasa.gov/3d-resources/" target="_blank" rel="noreferrer">NASA 3D Resources ↗<span>More official models and visualizations.</span></a><a href="https://nssdc.gsfc.nasa.gov/" target="_blank" rel="noreferrer">NASA science archive ↗<span>Mission and spacecraft reference records.</span></a></div>
   </aside>
  </div><p className="reference-note">Educational retelling, not an actual transmission. NASA sources remain the authority. Costs are omitted where no item-specific authoritative figure is provided.</p>
 </main>;
}
function CinematicExperience({route}:{route:string}){
 const initial=routeMission(route),reduced=useReducedMotion();
 const [mode,setMode]=useState<'choose'|World>(initial?.world??'choose'),[selected,setSelected]=useState(initial?.item??findArtifact('eagle')!);
 const [motion,setMotion]=useState(!reduced),[travelling,setTravelling]=useState(false),[voice,setVoice]=useState(false),[line,setLine]=useState(0),[minimized,setMinimized]=useState(false);
 const [detail,setDetail]=useState<Artifact|undefined>(()=>detailRoute(route)),[backRoute,setBackRoute]=useState('#/');
 const [hovered,setHovered]=useState<{item:Artifact;anchor:{x:number;y:number}}|null>(null),[menu,setMenu]=useState(false),[mapUnavailable,setMapUnavailable]=useState(false);
 const leaveTimer=useRef<ReturnType<typeof setTimeout>|null>(null),stage=useRef<HTMLElement>(null);
 const isWorld=mode!=='choose',items=useMemo(()=>worldArtifacts(mode==='mars'?'mars':'moon'),[mode]);
 const lines=useMemo(()=>storyLines(selected.story),[selected.story]);
 const speech=travelling?`We’re on our way to ${mode==='moon'?'the Moon':'Mars'}. This is an illustrated journey, not a real spacecraft trajectory.`:isWorld?lines[line]??lines[0]:'Hi, I’m Blip. Choose the Moon or Mars, then point to a landing site. I’ll tell you the story of what stayed behind.';
 const select=useCallback((item:Artifact)=>{setSelected(item);setLine(0);setMenu(false);window.location.hash=`/${item.world}/${item.id}`;},[]);
 const nextLine=useCallback(()=>{if(line<lines.length-1)setLine(n=>n+1);else{const index=items.findIndex(x=>x.id===selected.id);if(index<items.length-1)select(items[index+1]);else setVoice(false);}},[line,lines.length,items,selected.id,select]);
 const narration=useVoice(speech,voice&&!minimized&&!detail,()=>{if(isWorld&&!travelling)nextLine();});
 useEffect(()=>{const record=detailRoute(route);if(record){setDetail(record);return;}setDetail(undefined);const next=routeMission(route);if(next){setSelected(next.item);setMode(next.world);setLine(0);}else setMode('choose');},[route]);
 useEffect(()=>{if(reduced)setMotion(false);},[reduced]);
 useEffect(()=>()=>{if(leaveTimer.current)clearTimeout(leaveTimer.current);},[]);
 useEffect(()=>{if(!detail)return;const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){window.location.hash=backRoute;setDetail(undefined);}};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);},[detail,backRoute]);
 const visit=useCallback((world:World,item?:Artifact)=>{const record=item??worldArtifacts(world)[0];setDetail(undefined);setHovered(null);setSelected(record);setLine(0);setMode(world);setTravelling(motion);setMinimized(false);setMapUnavailable(false);setMenu(false);window.location.hash=`/${world}/${record.id}`;window.scrollTo({top:0,behavior:'instant'});},[motion]);
 const openEquipment=useCallback((item:Artifact)=>{setBackRoute(window.location.hash||'#/');setHovered(null);setDetail(item);window.location.hash=`/equipment/${item.id}`;},[]);
 const closeEquipment=()=>{setDetail(undefined);window.location.hash=backRoute;setTravelling(motion&&backRoute.startsWith('#/moon')||motion&&backRoute.startsWith('#/mars'));};
 const home=()=>{setMode('choose');setTravelling(false);setHovered(null);setVoice(false);window.location.hash='/';window.scrollTo({top:0,behavior:'instant'});};
 const onHover=useCallback((item:Artifact,anchor:{x:number;y:number})=>{if(leaveTimer.current)clearTimeout(leaveTimer.current);setHovered({item,anchor});},[]);
 const onLeave=useCallback(()=>{if(leaveTimer.current)clearTimeout(leaveTimer.current);leaveTimer.current=setTimeout(()=>setHovered(null),220);},[]);
 const arrived=useCallback(()=>setTravelling(false),[]),ready=useCallback(()=>{},[]),unavailable=useCallback(()=>setMapUnavailable(true),[]);
 return <div className={`cinematic-app ${motion?'motion-on':'motion-off'}`}>
  <HomeIcon onHome={home}/>
  <a className="cinematic-skip" href="#mission-access" onClick={e=>{e.preventDefault();if(isWorld){setMenu(true);document.querySelector<HTMLElement>('.mission-access summary')?.focus();}else document.querySelector<HTMLElement>('.destination-actions button')?.focus();}}>Skip to missions</a>
  {detail?<EquipmentPage item={detail} motion={motion} onBack={closeEquipment}/>:<main>
   <section ref={stage} className={`cosmic-stage stage-${mode}`} aria-label="NASA space explorer">
    {isWorld?<Suspense fallback={<div className="scene-starting" role="status">Opening the Moon and Mars explorer…</div>}><FlightScene mode={mode} selected={selected} motion={motion} previewing={Boolean(hovered)} reset={0} onReady={ready} onArrive={arrived} onUnavailable={unavailable} onHover={onHover} onLeave={onLeave} onSelect={openEquipment}/></Suspense>:<NasaFilm motion={motion}/>}
    <div className="cinematic-scrim"/>
    {isWorld?<><div className="planet-heading"><h1 tabIndex={-1}>{mode==='moon'?'The Moon.':'Mars.'}</h1><div className="planet-switch"><button aria-pressed={mode==='moon'} onClick={()=>visit('moon')}>Moon</button><button aria-pressed={mode==='mars'} onClick={()=>visit('mars')}>Mars</button></div></div>
     {travelling&&<p className="travel-label" role="status">Travelling to {mode==='moon'?'the Moon':'Mars'}…</p>}
     <details id="mission-access" className="mission-access" open={menu||mapUnavailable} onToggle={e=>setMenu(e.currentTarget.open)}><summary>Mission index</summary><div>{items.map(item=><button key={item.id} aria-pressed={selected.id===item.id} onClick={()=>{select(item);openEquipment(item);}}>{item.name} <span>↗</span></button>)}</div></details>
    </>:<div className="cosmic-intro-copy"><h1>Left Behind.</h1><p>Explore the machines that stayed on other worlds.</p><div className="destination-actions"><button className="destination-choice" onClick={()=>visit('moon')}>The Moon <span>↗</span></button><button className="destination-choice" onClick={()=>visit('mars')}>Mars <span>↗</span></button></div></div>}
    <div className="stage-utilities"><button className="motion-toggle" aria-pressed={motion} onClick={()=>{setMotion(v=>!v);setTravelling(false);}}>{motion?'Ⅱ Pause motion':'▶ Play motion'}</button>{!isWorld&&<a href={film.source} target="_blank" rel="noreferrer">NASA+ film ↗</a>}</div>
    <OrbitGuide text={speech} title={isWorld&&!travelling?selected.name:travelling?'Next stop':undefined} voice={voice} voiceSupported={narration.supported} talking={narration.speaking} motion={motion} minimized={minimized} onToggleVoice={()=>setVoice(v=>!v)} onMinimize={()=>setMinimized(v=>!v)} onNext={isWorld&&!travelling?nextLine:undefined}/>
   </section>
   {!isWorld&&<div className="home-equipment"><NasaFilm motion={motion} className="equipment-film"/><div className="home-equipment-content">
    <section className="mission-showcase" aria-labelledby="showcase-title"><h2 id="showcase-title">They stayed.<br/>The story goes on.</h2><div className="showcase-objects">{featured.map(id=>{const item=findArtifact(id)!;return <article className="showcase-object" key={id}><DeferredModel item={item} motion={motion}/><h3><button onClick={()=>openEquipment(item)}>{item.name} ↗</button></h3></article>;})}</div></section>
    <section className="journey-proof"><img src="/assets/eagle-photo.jpg" alt="Buzz Aldrin and the Apollo 11 lunar module, photographed by Neil Armstrong. NASA." loading="lazy"/><div><h2>Wonder first.<br/>Evidence always.</h2><p>Every mission leads back to NASA.</p><a href="#/sources" className="light-button">Read the NASA records ↗</a></div></section>
    <section className="more-equipment" aria-labelledby="more-title"><h2 id="more-title">More to discover.</h2><div className="equipment-catalogue">{artifacts.filter(item=>!featured.includes(item.id)).map(item=><article className="catalogue-object" key={item.id}><DeferredModel item={item} motion={motion}/><p>{item.world==='beyond'?'Beyond the Moon & Mars':item.world==='moon'?'Moon':'Mars'}</p><h3><button onClick={()=>openEquipment(item)}>{item.name} ↗</button></h3></article>)}</div></section>
    <footer className="cosmic-footer"><p>Independent NASA Space Apps project. Not endorsed by NASA.</p><p><a href={film.source} target="_blank" rel="noreferrer">Background: {film.title} · NASA+ / original contributors ↗</a><br/>Animation excerpts show future concepts, not recordings of the historic missions.</p><p>Blip is the supplied fictional mascot. Mission imagery and equipment are NASA resources.</p><div><a href="#/about">Project notes</a><a href="https://github.com/aditya-zig/left-behind" target="_blank" rel="noreferrer">Code ↗</a></div></footer>
   </div></div>}
  </main>}
 </div>;
}
export default function CinematicRouter(){
 const [route,setRoute]=useState(()=>window.location.hash);
 useEffect(()=>{const changed=()=>setRoute(window.location.hash);window.addEventListener('hashchange',changed);return()=>window.removeEventListener('hashchange',changed);},[]);
 const archive=/^#\/(collection|sources|legacy|about)(?:\/|$)/.test(route)||new URLSearchParams(location.search).has('classic');
 return archive?<div className="cinematic-archive"><HomeIcon/><ArchiveApp/></div>:<CinematicExperience route={route}/>;
}
