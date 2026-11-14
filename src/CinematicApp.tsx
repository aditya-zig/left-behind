import {lazy,Suspense,useCallback,useEffect,useMemo,useRef,useState} from 'react';
import ArchiveApp from './App';
import Model,{assetFor} from './Model';
import OrbitGuide from './OrbitGuide';
import {findArtifact,worldArtifacts,type Artifact} from './data';
import {opening,routeMission,storyLines} from './cinematic';
import type {FlightMode,World} from './FlightScene';
import './cinematic.css';
const FlightScene=lazy(()=>import('./FlightScene'));
const introCopy={
  galaxy:{title:'Far from home.',text:'Our story starts in the Milky Way. Somewhere in this galaxy, a small blue world decided to explore.',label:'The Milky Way'},
  solar:{title:'A little closer.',text:'Inside our Solar System, explorers from Earth have travelled to other worlds. Some came home. Their equipment stayed.',label:'The Solar System'},
  earth:{title:'It began here.',text:'This is home. From here, we sent landers, rovers and experiments to the Moon and Mars. Let’s go find them.',label:'Earth'},
  choose:{title:'Where shall we go?',text:'I’m Orbit, your fictional guide. Pick the Moon or Mars. I’ll fly with you, then we’ll discover the stories behind the hardware.',label:'Choose your destination'},
};
function useMotionPreference(){const [reduced,set]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);useEffect(()=>{const q=matchMedia('(prefers-reduced-motion: reduce)'),fn=()=>set(q.matches);q.addEventListener('change',fn);return()=>q.removeEventListener('change',fn);},[]);return reduced;}
function useVoice(text:string,enabled:boolean,onEnd?:()=>void){
  const supported=typeof speechSynthesis!=='undefined',end=useRef(onEnd);end.current=onEnd;
  useEffect(()=>{if(!supported||!enabled)return;let active=true;speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.rate=.92;utterance.lang='en-US';utterance.onend=()=>{if(active)end.current?.();};speechSynthesis.speak(utterance);return()=>{active=false;speechSynthesis.cancel();};},[text,enabled,supported]);
  return supported;
}
function DeferredModel({item,motion}:{item:Artifact;motion:boolean}){
  const ref=useRef<HTMLDivElement>(null),[visible,set]=useState(false);
  useEffect(()=>{if(!ref.current)return;const observer=new IntersectionObserver(entries=>set(entries[0].isIntersecting),{rootMargin:'100px'});observer.observe(ref.current);return()=>observer.disconnect();},[]);
  return <div ref={ref} className="showcase-model">{visible?<Model artifact={item} autoRotate={motion}/>:<img src={assetFor(item).preview?.file} alt={`NASA model preview of ${item.name}`} loading="lazy"/>}</div>;
}
function MissionDialog({item,motion,onClose}:{item:Artifact;motion:boolean;onClose:()=>void}){
  const dialog=useRef<HTMLDialogElement>(null);const [tab,setTab]=useState<'story'|'evidence'>('story');
  useEffect(()=>{const current=dialog.current;current?.showModal();return()=>current?.close();},[]);
  return <dialog ref={dialog} className="mission-dialog glass" aria-label={`${item.name}: story and NASA evidence`} onCancel={onClose} onClick={event=>{if(event.target===event.currentTarget)onClose();}}>
    <button className="close-mission" aria-label="Close mission details" onClick={onClose}>×</button>
    <div className="dialog-visual"><Model artifact={item} autoRotate={motion}/>{item.modelNote&&<p className="reference-note">{item.modelNote}</p>}</div>
    <div className="dialog-story"><p className="mission-meta">{item.mission} · {item.year}</p><h2>{item.name}</h2><p className="mission-subtitle">{item.subtitle}</p>
      <div className="dialog-tabs" role="tablist" aria-label="Mission information"><button role="tab" aria-selected={tab==='story'} onClick={()=>setTab('story')}>The story</button><button role="tab" aria-selected={tab==='evidence'} onClick={()=>setTab('evidence')}>Facts & NASA sources</button></div>
      {tab==='story'?<div className="dialog-copy" role="tabpanel"><p>{item.story}</p><div className="mission-fact"><strong>{item.fact}</strong><span>{item.factLabel}</span></div><h3>Why it stayed</h3><p>{item.why}</p><h3>What we learned</h3><p>{item.discovery}</p><button className="text-action" onClick={()=>setTab('evidence')}>Show the evidence ↗</button></div>:<div className="dialog-copy evidence-copy" role="tabpanel"><dl><dt>Purpose</dt><dd>{item.purpose}</dd><dt>Recorded status</dt><dd>{item.status} — {item.statusDetail}</dd><dt>Location</dt><dd>{item.location}. {item.coordinates?.join(', ')}<br/>{item.locationNote}</dd></dl><h3>Read the original NASA records</h3>{item.sources.map(source=><a className="mission-source" key={source.url} href={source.url} target="_blank" rel="noreferrer"><strong>{source.title} ↗</strong><span>{source.supports}</span></a>)}<p className="reference-note">Educational retelling, not a recovered transmission. Positions and camera travel are illustrative. No unsupported equipment cost is assigned.</p></div>}
    </div>
  </dialog>;
}
function CinematicExperience({route}:{route:string}){
  const initial=routeMission(route),reduced=useMotionPreference();
  const [mode,setMode]=useState<FlightMode>(initial?.world??(reduced?'choose':'galaxy'));
  const [selected,setSelected]=useState(initial?.item??findArtifact('eagle')!);
  const [motion,setMotion]=useState(!reduced),[introPlaying,setIntroPlaying]=useState(!reduced),[ready,setReady]=useState(false),[travelling,setTravelling]=useState(false);
  const [voice,setVoice]=useState(false),[guideMinimized,setGuideMinimized]=useState(false),[line,setLine]=useState(0),[detail,setDetail]=useState<Artifact|null>(null),[reset,setReset]=useState(0);
  const [hovered,setHovered]=useState<{item:Artifact;anchor:{x:number;y:number}}|null>(null),[tour,setTour]=useState(false);
  const leaveTimer=useRef<ReturnType<typeof setTimeout>|null>(null),sceneRef=useRef<HTMLElement>(null),lastFocus=useRef<HTMLElement|null>(null);
  const isWorld=mode==='moon'||mode==='mars';
  const items=useMemo(()=>worldArtifacts(mode==='mars'?'mars':'moon'),[mode]);
  const lines=useMemo(()=>storyLines(selected.story),[selected.story]);
  const intro=isWorld?null:introCopy[mode as keyof typeof introCopy];
  const speech=travelling?`Hold tight. We’re travelling to the ${mode==='moon'?'Moon':'planet Mars'}. Our camera journey is cinematic, not a real trajectory.`:isWorld?lines[line]??lines[0]:intro?.text??'';
  const voiceSupported=useVoice(speech,voice&&!guideMinimized&&!detail,()=>{if(!isWorld&&introPlaying&&motion&&mode!=='choose'){const index=opening.indexOf(mode);setMode(opening[Math.min(index+1,3)]);}else if(tour&&!travelling){if(line<lines.length-1)setLine(n=>n+1);else nextStop();}});
  useEffect(()=>{const next=routeMission(route);if(next){setSelected(next.item);setMode(next.world);setLine(0);}else if(route==='#/intro'){setMode(reduced?'choose':'galaxy');setIntroPlaying(!reduced);}},[route,reduced]);
  useEffect(()=>{if(reduced){setMotion(false);setIntroPlaying(false);}},[reduced]);
  useEffect(()=>{setLine(0);setHovered(null);},[selected.id]);
  useEffect(()=>{
    if(!introPlaying||!ready||isWorld||mode==='choose'||!motion||voice)return;
    let elapsed=0;const timer=setInterval(()=>{if(document.hidden)return;elapsed+=250;if(elapsed>=5500){const index=opening.indexOf(mode as typeof opening[number]);setMode(opening[Math.min(index+1,3)]);}},250);
    return()=>clearInterval(timer);
  },[mode,introPlaying,ready,isWorld,motion,voice]);
  useEffect(()=>()=>{if(leaveTimer.current)clearTimeout(leaveTimer.current);},[]);
  const visit=useCallback((world:World,item?:Artifact)=>{
    const record=item??worldArtifacts(world)[0];setHovered(null);setDetail(null);setSelected(record);setLine(0);setMode(world);setTravelling(motion);setIntroPlaying(false);setTour(false);setGuideMinimized(false);window.location.hash=`/${world}/${record.id}`;
    sceneRef.current?.scrollIntoView({behavior:motion?'smooth':'auto'});
  },[motion]);
  const select=useCallback((item:Artifact)=>{setSelected(item);setLine(0);setHovered(null);window.location.hash=`/${item.world}/${item.id}`;},[]);
  const openDetail=useCallback((item:Artifact)=>{lastFocus.current=document.activeElement as HTMLElement;setHovered(null);setDetail(item);},[]);
  const closeDetail=()=>{setDetail(null);lastFocus.current?.focus();};
  const nextStop=useCallback(()=>{const index=items.findIndex(item=>item.id===selected.id);const next=items[(index+1)%items.length];select(next);},[items,selected.id,select]);
  useEffect(()=>{
    if(!tour||detail||travelling||voice)return;
    let elapsed=0;const timer=setInterval(()=>{if(document.hidden)return;elapsed+=250;if(elapsed>=Math.max(6500,(lines[line]?.split(' ').length??10)*440)){if(line<lines.length-1)setLine(n=>n+1);else nextStop();}},250);
    return()=>clearInterval(timer);
  },[tour,detail,travelling,voice,line,lines,nextStop]);
  const onHover=useCallback((item:Artifact,anchor:{x:number;y:number})=>{if(leaveTimer.current)clearTimeout(leaveTimer.current);setHovered({item,anchor});},[]);
  const onLeave=useCallback(()=>{if(leaveTimer.current)clearTimeout(leaveTimer.current);leaveTimer.current=setTimeout(()=>setHovered(null),180);},[]);
  const keepPreview=()=>{if(leaveTimer.current)clearTimeout(leaveTimer.current);};
  const replay=()=>{setMode(reduced?'choose':'galaxy');setIntroPlaying(!reduced);setTour(false);setTravelling(false);setHovered(null);setReset(n=>n+1);window.location.hash='/';sceneRef.current?.scrollIntoView({behavior:'smooth'});};
  const skip=()=>{setMode('choose');setIntroPlaying(false);setTravelling(false);};
  const onArrive=useCallback(()=>setTravelling(false),[]),onReady=useCallback(()=>setReady(true),[]);
  return <div className={`cinematic-app ${motion?'motion-on':'motion-off'}`}>
    <a className="cinematic-skip" href="#mission-access" onClick={event=>{event.preventDefault();(document.querySelector(isWorld?'#mission-access':'.cosmic-intro-copy') as HTMLElement|null)?.focus();}}>Skip to the mission list</a>
    <header className="cosmic-nav glass"><button className="cosmic-wordmark" onClick={replay}>Left Behind<span className="wordmark-orbit" aria-hidden="true"/></button><nav aria-label="Main navigation"><a href="#/collection">The collection</a><a href="#/sources">NASA sources</a></nav><button className="motion-toggle" aria-pressed={motion} onClick={()=>{setMotion(v=>!v);setIntroPlaying(false);}}>{motion?'Ⅱ Motion':'▶ Motion'}</button></header>
    <main>
      <section ref={sceneRef} className={`cosmic-stage stage-${mode}`} aria-label="Cinematic space explorer">
        <Suspense fallback={<div className="scene-starting" role="status">Opening the universe…</div>}><FlightScene mode={mode} selected={selected} motion={motion} previewing={Boolean(hovered||detail)} reset={reset} onReady={onReady} onArrive={onArrive} onHover={onHover} onLeave={onLeave} onSelect={item=>{select(item);openDetail(item);}}/></Suspense>
        <div className="cinematic-scrim"/>
        {!isWorld?<div className="cosmic-intro-copy" tabIndex={-1} key={mode}>
          <p className="cosmic-context">{intro?.label}</p><h1>{intro?.title}</h1><p className="cosmic-description">{mode==='choose'?'Two worlds. Extraordinary machines. Discover the human stories that stayed behind.':'A journey through space, to the things we left behind.'}</p>
          {mode==='choose'?<div className="destination-actions"><button className="destination-choice glass" onClick={()=>visit('moon')}><span className="destination-disc moon-disc"/><span><strong>The Moon</strong><small>First steps. Lasting traces.</small></span><span aria-hidden="true">↗</span></button><button className="destination-choice glass" onClick={()=>visit('mars')}><span className="destination-disc mars-disc"/><span><strong>Mars</strong><small>Robots. Dust. Discovery.</small></span><span aria-hidden="true">↗</span></button></div>:<div className="opening-controls"><button className="light-button" onClick={skip}>Choose a destination ↗</button><button className="quiet-button" aria-pressed={!introPlaying} onClick={()=>setIntroPlaying(v=>!v)}>{introPlaying?'Pause opening':'Continue opening'}</button></div>}
          {!ready&&<p className="asset-loading" role="status">Loading NASA imagery… you can choose a destination now.</p>}
        </div>:<><div className="planet-heading"><button className="back-to-space" onClick={()=>{skip();window.location.hash='/';}}>← Destinations</button><h1>{mode==='moon'?'The Moon.':'Mars.'}</h1><p>{mode==='moon'?'Our first steps are still here.':'The mission ends. The story doesn’t.'}</p><div className="planet-switch glass"><button aria-pressed={mode==='moon'} onClick={()=>visit('moon')}>Moon</button><button aria-pressed={mode==='mars'} onClick={()=>visit('mars')}>Mars</button></div></div>
          {travelling&&<div className="travel-label glass" role="status"><span className="travel-indicator"/>Travelling to {mode==='moon'?'the Moon':'Mars'}<button onClick={()=>{setMotion(false);setTravelling(false);}}>Skip flight</button></div>}
          {!travelling&&<div className="surface-instruction">Drag to orbit · scroll to zoom · hover a landing site</div>}
          <div id="mission-access" tabIndex={-1} className="mission-dock glass" aria-label="All missions on this world"><div className="mission-dock-heading"><span>{items.length} mission stories</span><button aria-pressed={tour} onClick={()=>setTour(v=>!v)}>{tour?'Ⅱ Pause tour':'▶ Guided tour'}</button></div><div className="mission-dock-items">{items.map(item=><button key={item.id} aria-pressed={selected.id===item.id} className="mission-chip" onClick={()=>select(item)} onDoubleClick={()=>openDetail(item)}><span>{item.mission}</span><strong>{item.name}</strong></button>)}</div><div className="dock-current"><span>{selected.name}</span><button onClick={()=>openDetail(selected)}>Explore this story ↗</button><button aria-label="Next mission" onClick={nextStop}>→</button></div></div>
        </>}
        <div className="space-caption">{mode==='galaxy'?<a href="https://science.nasa.gov/photojournal/our-milky-way-gets-a-makeover-artist-concept/" target="_blank" rel="noreferrer">Milky Way artist concept · NASA/JPL-Caltech/R. Hurt ↗</a>:<><a href="#/sources">NASA imagery & reference models ↗</a><span>Cinematic journey · not to scale{isWorld?' · approximate landing areas':''}</span></>}</div>
        {!isWorld&&<div className="opening-timeline" aria-label="Opening chapters">{opening.map((step,i)=><button key={step} aria-label={`Go to ${introCopy[step].label}`} aria-current={mode===step?'step':undefined} onClick={()=>{setMode(step);setIntroPlaying(false);}}><span/><small>{['Milky Way','Solar System','Earth','Explore'][i]}</small></button>)}</div>}
        <OrbitGuide text={speech} title={travelling?'A new world ahead':isWorld?selected.name:'Let’s go exploring.'} voice={voice} voiceSupported={voiceSupported} motion={motion} minimized={guideMinimized} onToggleVoice={()=>setVoice(v=>!v)} onMinimize={()=>setGuideMinimized(v=>!v)} onNext={isWorld&&!travelling?()=>setLine(n=>(n+1)%lines.length):undefined} onDetails={isWorld&&!travelling?()=>openDetail(selected):undefined} travelling={travelling}/>
        {hovered&&!detail&&!travelling&&<div className="hotspot-preview glass" style={{left:Math.max(12,Math.min(hovered.anchor.x-140,window.innerWidth-292)),top:Math.max(96,Math.min(hovered.anchor.y-330,window.innerHeight-440))}} onMouseEnter={keepPreview} onMouseLeave={onLeave} onKeyDown={event=>{if(event.key==='Escape')setHovered(null);}}><button className="close-preview" aria-label="Close preview" onClick={()=>setHovered(null)}>×</button><Model key={hovered.item.id} artifact={hovered.item} autoRotate={motion}/><div className="preview-copy"><span>{hovered.item.mission} · NASA reference</span><strong>{hovered.item.name}</strong><button onClick={()=>{select(hovered.item);openDetail(hovered.item);}}>Discover the story ↗</button></div></div>}
      </section>
      {!isWorld&&<>
        <section className="mission-showcase" aria-labelledby="showcase-title"><div className="showcase-intro"><h2 id="showcase-title">They stayed.<br/>The story goes on.</h2><p>Not forgotten. Not all abandoned. Meet the machines that became part of another world.</p></div><div className="showcase-objects">{['eagle','opportunity','ingenuity'].map(id=>{const item=findArtifact(id)!;return <article key={id} className={`showcase-object object-${id}`}><DeferredModel item={item} motion={motion}/><div><p>{item.mission}</p><h3>{item.name}</h3><p>{item.subtitle}</p><button className="text-action" onClick={()=>visit(item.world as World,item)}>Go to {item.world==='moon'?'the Moon':'Mars'} ↗</button></div></article>;})}</div></section>
        <section className="journey-proof"><img src="/assets/eagle-photo.jpg" alt="Buzz Aldrin beside the Apollo 11 lunar module on the Moon. NASA photograph by Neil Armstrong." loading="lazy"/><div><h2>Wonder first.<br/>Evidence always.</h2><p>Every mission story leads back to NASA. The models, the imagery, the discoveries—real sources you can open and explore.</p><a className="light-button" href="#/sources">Explore the NASA sources ↗</a><small>Orbit is a fictional guide. The missions are real.<br/>Apollo 11 photograph: NASA / Neil Armstrong.</small></div></section>
        <footer className="cosmic-footer"><button onClick={replay}>Left Behind ↗</button><p>An independent NASA Space Apps project.<br/>Not affiliated with or endorsed by NASA.</p><a href="#/collection">All 18 mission records ↗</a><a href="#/about">About the project ↗</a></footer>
      </>}
    </main>
    {detail&&<MissionDialog key={detail.id} item={detail} motion={motion} onClose={closeDetail}/>}
  </div>;
}
export default function CinematicRouter(){
  const [route,setRoute]=useState(()=>window.location.hash);
  useEffect(()=>{const changed=()=>setRoute(window.location.hash);window.addEventListener('hashchange',changed);return()=>window.removeEventListener('hashchange',changed);},[]);
  const archive=/^#\/(collection|sources|legacy|about)(?:\/|$)/.test(route)||new URLSearchParams(location.search).has('classic');
  return archive?<div className="cinematic-archive"><ArchiveApp/></div>:<CinematicExperience route={route}/>;
}
