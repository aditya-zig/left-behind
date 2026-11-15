import {lazy,Suspense,useCallback,useEffect,useMemo,useRef,useState} from 'react';
import ArchiveApp from './App';
import Model,{assetFor} from './Model';
import {brief,SurfaceVisual,photoFor} from './Photography';
import OrbitGuide from './OrbitGuide';
import MissionDialog from './MissionDialog';
import CoordinateAtlas from './CoordinateAtlas';
import Stewardship from './Stewardship';
import {findArtifact,type Artifact} from './data';
import {formatCoordinates,sitesFor,surfaceSites,type SurfaceSite} from './atlas';
import {opening,routeMission,adjacentStop,tourSites,tourCaption,tourSeconds} from './cinematic';
import TourPanel from './TourPanel';
import type {FlightMode,World} from './FlightScene';
import './cinematic.css';
import './tour.css';
const FlightScene=lazy(()=>import('./FlightScene'));
const introCopy={
 galaxy:{title:'Far from home.',text:'We explored other worlds. Our machines stayed.',label:'The Milky Way'},
 solar:{title:'A little closer.',text:'Two worlds. Traces of us.',label:'The Solar System'},
 earth:{title:'It began here.',text:'We left from here. Let’s see what stayed.',label:'Earth'},
 choose:{title:'Where shall we go?',text:'Pick a world. Follow the discoveries.',label:'Choose your destination'},
};
function useMotionPreference(){const [reduced,set]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);useEffect(()=>{const q=matchMedia('(prefers-reduced-motion: reduce)'),fn=()=>set(q.matches);q.addEventListener('change',fn);return()=>q.removeEventListener('change',fn);},[]);return reduced;}
function useVoice(text:string,enabled:boolean,onEnd?:()=>void){
 const supported=typeof speechSynthesis!=='undefined',end=useRef(onEnd),[speaking,setSpeaking]=useState(false),[failed,setFailed]=useState(false);end.current=onEnd;
 useEffect(()=>{setSpeaking(false);setFailed(false);if(!supported||!enabled)return;let active=true;speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.rate=.92;utterance.lang='en-US';utterance.onstart=()=>{if(active)setSpeaking(true);};utterance.onend=()=>{if(active){setSpeaking(false);end.current?.();}};utterance.onerror=()=>{if(active){setSpeaking(false);setFailed(true);}};speechSynthesis.speak(utterance);return()=>{active=false;speechSynthesis.cancel();};},[text,enabled,supported]);
 return {supported,speaking,failed};
}
function DeferredModel({item,motion}:{item:Artifact;motion:boolean}){const ref=useRef<HTMLDivElement>(null),[visible,set]=useState(false);useEffect(()=>{if(!ref.current)return;const observer=new IntersectionObserver(entries=>set(entries[0].isIntersecting),{rootMargin:'100px'});observer.observe(ref.current);return()=>observer.disconnect();},[]);return <div ref={ref} className="showcase-model">{visible?<Model artifact={item} autoRotate={motion}/>: <img src={assetFor(item).preview?.file} alt={`NASA reference preview of ${item.name}`} loading="lazy"/>}</div>;}
function SiteDialog({site,onClose}:{site:SurfaceSite;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);useEffect(()=>{const d=dialog.current;d?.showModal();return()=>d?.close();},[]);
 return <dialog ref={dialog} className="site-dialog" aria-labelledby="site-title" onCancel={onClose}><header className="mission-dialog-heading"><div><span className="eyebrow">{site.mission} · {site.kind}</span><h2 id="site-title">{site.name}</h2></div><button aria-label="Close site details" onClick={onClose}>×</button></header><div className="site-dialog-copy"><SurfaceVisual site={site}/><p className="coordinate-value">{formatCoordinates(site.coordinates)}</p><p>{brief(site.summary)}</p><a className="light-button" href={site.source.url} target="_blank" rel="noreferrer">Explore NASA’s mission record ↗</a><details className="location-notes"><summary>Photo & location notes</summary><p>{site.note}</p><p>The image is historical, not a live view or a surveyed reconstruction.</p></details></div></dialog>;
}
function routeSite(route:string){const id=route.split('/')[2];return id?.startsWith('@')?surfaceSites.find(site=>site.id===id.slice(1)&&site.world===route.split('/')[1])??null:null;}
function CinematicExperience({route}:{route:string}){
 const initial=routeMission(route),reduced=useMotionPreference();
 const [mode,setMode]=useState<FlightMode>(initial?.world??(reduced?'choose':'galaxy')),[selected,setSelected]=useState(initial?.item??findArtifact('eagle')!);
 const [focusSite,setFocusSite]=useState<SurfaceSite|null>(()=>routeSite(route));
 const [motion,setMotion]=useState(!reduced),[introPlaying,setIntroPlaying]=useState(!reduced&&!initial),[ready,setReady]=useState(false),[travelling,setTravelling]=useState(false);
 const [voice,setVoice]=useState(true),[audioArmed,setAudioArmed]=useState(false),[guideMinimized,setGuideMinimized]=useState(false),[tourPlaying,setTourPlaying]=useState(!reduced),[tourProgress,setTourProgress]=useState(0),[detail,setDetail]=useState<Artifact|null>(null),[siteDetail,setSiteDetail]=useState<SurfaceSite|null>(null),[atlas,setAtlas]=useState(false),[reset,setReset]=useState(0),[unavailable,setUnavailable]=useState(false);
 const sceneRef=useRef<HTMLElement>(null),lastFocus=useRef<HTMLElement|null>(null);
 const isWorld=mode==='moon'||mode==='mars',world:World=mode==='mars'?'mars':'moon',sites=useMemo(()=>sitesFor(world),[world]);
 const currentSite=focusSite??sites.find(site=>site.artifactId===selected.id)??sites[0];
 const stops=useMemo(()=>tourSites(world),[world]);
 const intro=isWorld?null:introCopy[mode as keyof typeof introCopy];
 const speech=travelling?`Flying to ${currentSite.name}.`:isWorld?tourCaption(currentSite):brief(intro?.text??'');
 const selectSite=useCallback((site:SurfaceSite)=>{setFocusSite(site.artifactId?null:site);if(site.artifactId)setSelected(findArtifact(site.artifactId)!);setTourProgress(0);setMode(site.world);setTravelling(motion&&(site.world!==mode||site.id!==(focusSite?.id??selected.id)));setIntroPlaying(false);setGuideMinimized(false);window.location.hash=`/${site.world}/${site.artifactId??`@${site.id}`}`;},[motion,mode,focusSite?.id,selected.id]);
 const nextStop=useCallback(()=>selectSite(adjacentStop(world,currentSite.id,1)),[world,currentSite.id,selectSite]);
 const previousStop=()=>selectSite(adjacentStop(world,currentSite.id,-1));
 const pauseTour=useCallback(()=>setTourPlaying(false),[]);
 useEffect(()=>{
  setTourProgress(0);if(!isWorld||!ready||travelling||!tourPlaying||!motion||detail||siteDetail||atlas)return;
  let elapsed=0;const timer=setInterval(()=>{if(document.hidden)return;elapsed+=200;setTourProgress(elapsed/(tourSeconds*1000));if(elapsed>=tourSeconds*1000){clearInterval(timer);nextStop();}},200);
  return()=>clearInterval(timer);
 },[isWorld,ready,travelling,tourPlaying,motion,detail,siteDetail,atlas,currentSite.id,nextStop]);
 // Narration is enabled by default, but browsers require an interaction before audio.
 useEffect(()=>{const arm=()=>setAudioArmed(true);window.addEventListener('pointerdown',arm,{once:true});window.addEventListener('keydown',arm,{once:true});return()=>{window.removeEventListener('pointerdown',arm);window.removeEventListener('keydown',arm);};},[]);
 const voiceState=useVoice(speech,voice&&audioArmed&&!guideMinimized&&!detail&&!siteDetail&&!atlas,()=>{if(!isWorld&&introPlaying&&motion&&mode!=='choose'){const index=opening.indexOf(mode);setMode(opening[Math.min(index+1,3)]);}});
 useEffect(()=>{const next=routeMission(route);if(next){setSelected(next.item);setFocusSite(routeSite(route));setMode(next.world);setTourProgress(0);}else if(route==='#/intro'){setMode(reduced?'choose':'galaxy');setIntroPlaying(!reduced);setFocusSite(null);}},[route,reduced]);
 useEffect(()=>{if(reduced){setMotion(false);setIntroPlaying(false);setTourPlaying(false);}},[reduced]);
 useEffect(()=>{if(mode==='choose')setIntroPlaying(false);},[mode]);
 const waitingForVoice=voice&&audioArmed&&voiceState.supported&&!voiceState.failed;
 useEffect(()=>{if(!introPlaying||!ready||isWorld||mode==='choose'||!motion||waitingForVoice)return;let elapsed=0;const timer=setInterval(()=>{if(document.hidden)return;elapsed+=250;if(elapsed>=6000){const index=opening.indexOf(mode as typeof opening[number]);setMode(opening[Math.min(index+1,3)]);}},250);return()=>clearInterval(timer);},[mode,introPlaying,ready,isWorld,motion,waitingForVoice]);
 const visit=useCallback((target:World,item?:Artifact)=>{selectSite(item?(sitesFor(target).find(site=>site.artifactId===item.id)??sitesFor(target)[0]):sitesFor(target)[0]);sceneRef.current?.scrollIntoView({behavior:motion?'smooth':'auto'});},[motion,selectSite]);
 const rememberFocus=()=>{lastFocus.current=document.activeElement as HTMLElement;};
 // Wait until the native dialog is removed; its opener is inert before React commits.
 const restoreFocus=()=>{const el=lastFocus.current;requestAnimationFrame(()=>{if(el?.isConnected)el.focus({preventScroll:true});});};
 const openDetail=()=>{rememberFocus();if(focusSite)setSiteDetail(focusSite);else setDetail(selected);};
 const closeDetail=()=>{setDetail(null);setSiteDetail(null);restoreFocus();};
 const closeAtlas=()=>{setAtlas(false);restoreFocus();};
 const replay=()=>{setMode(reduced?'choose':'galaxy');setIntroPlaying(motion&&!reduced);setTravelling(false);setFocusSite(null);setTourPlaying(!reduced&&motion);setReset(n=>n+1);window.location.hash='/';sceneRef.current?.scrollIntoView({behavior:motion?'smooth':'auto'});};
 const skip=()=>{setMode('choose');setIntroPlaying(false);setTravelling(false);};
 const onArrive=useCallback(()=>setTravelling(false),[]),onReady=useCallback(()=>setReady(true),[]),onUnavailable=useCallback(()=>setUnavailable(true),[]);
 return <div className={`cinematic-app ${motion?'motion-on':'motion-off'} ${isWorld?'tour-active':''}`} >
  <a className="cinematic-skip" href="#mission-access" onClick={e=>{e.preventDefault();(document.querySelector(isWorld?'#mission-access':'.cosmic-intro-copy') as HTMLElement|null)?.focus();}}>Skip to the mission controls</a>
  <button className="home-icon glass" aria-label="Go home" title="Home" onClick={replay}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m3 10 9-7 9 7M5 9v11h5v-6h4v6h5V9" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
  <div className="explorer-settings" aria-label="Experience settings"><button className="motion-toggle glass" aria-label={motion?'Pause motion':'Enable motion'} title={motion?'Pause motion':'Enable motion'} aria-pressed={motion} onClick={()=>{setMotion(v=>!v);setIntroPlaying(false);}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">{motion?<><path d="M9 5v14M15 5v14"/></>:<path d="m8 5 11 7-11 7Z"/>}</svg></button><button className="voice-toggle glass" disabled={!voiceState.supported} aria-label={voice?'Mute narration':'Enable narration'} title={!voiceState.supported?'Device narration unavailable':voice&&!audioArmed?'Narration enabled · starts after your first interaction':voice?'Mute narration':'Enable narration'} aria-pressed={voice} onClick={()=>{setAudioArmed(true);setVoice(v=>!v);}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9Z" strokeLinejoin="round"/>{voice?<><path d="M16 8a6 6 0 0 1 0 8M19 5a10 10 0 0 1 0 14" strokeLinecap="round"/></>:<path d="m17 9 5 6m0-6-5 6" strokeLinecap="round"/>}</svg></button></div>
  <main><section ref={sceneRef} className={`cosmic-stage stage-${mode} ${isWorld?'':'stage-opening'}`} aria-label="Interactive NASA space explorer">
   <Suspense fallback={<div className="scene-starting" role="status">Opening NASA’s universe…</div>}><FlightScene mode={mode} selected={selected} focusSite={focusSite} motion={motion} previewing={Boolean(detail||siteDetail||atlas)} reset={reset} onReady={onReady} onArrive={onArrive} onUnavailable={onUnavailable} onSiteSelect={site=>{pauseTour();selectSite(site);}} onInteract={pauseTour}/></Suspense><div className="cinematic-scrim"/>
   {!isWorld?<div className="cosmic-intro-copy" tabIndex={-1} key={mode}><h1>{intro?.title}</h1>
    <div className="destination-actions">{(['moon','mars'] as const).map(w=><button key={w} className="destination-choice glass" onClick={()=>visit(w)}><span className={`destination-disc ${w}-disc`} aria-hidden="true"/><strong>{w==='moon'?'Moon':'Mars'}</strong><span aria-hidden="true">↗</span></button>)}</div>
    {!ready&&<p className="asset-loading" role="status">Loading NASA imagery. You can choose a destination now.</p>}
   </div>:<><div className="planet-heading"><button className="back-to-space" onClick={()=>{skip();window.location.hash='/';}}>← Worlds</button><span className="tour-eyebrow">Left behind / {world==='moon'?'01':'02'}</span><h1>{world==='moon'?'MOON':'MARS'}</h1><div className="planet-switch glass">{(['moon','mars'] as const).map(w=><button key={w} aria-pressed={world===w} onClick={()=>visit(w)}>{w==='moon'?'Moon':'Mars'}</button>)}</div><button className="coordinate-trigger" aria-label={`Coordinates & all ${sites.length} sites`} onClick={()=>{rememberFocus();setAtlas(true);}}>All {sites.length} locations ↗</button></div>
    {travelling&&<div className="travel-label glass" role="status">Flying to {currentSite.name}<span aria-hidden="true"> ↗</span></div>}
    <p id="globe-help" className="sr-only">Drag to orbit, scroll to zoom. Keyboard: plus or minus to zoom, Home to recenter. Coordinate grid and pins are enlarged, not to scale. {unavailable?'3D unavailable; use the coordinate atlas.':''}</p>
    <div id="mission-access" tabIndex={-1} className="mission-dock glass" aria-label="Mission focus controls"><label htmlFor="site-select"><span className="sr-only">Choose a location</span><select id="site-select" value={currentSite.id} onChange={e=>{pauseTour();selectSite(sites.find(s=>s.id===e.target.value)!);}}> {sites.map(site=><option key={site.id} value={site.id}>{site.mission} · {site.name}</option>)}</select></label><a className="nasa-credits" href="#/sources">NASA sources ↗</a></div>
   </>}
   {!isWorld&&<div className="space-caption">{mode==='galaxy'?<a href="https://science.nasa.gov/photojournal/our-milky-way-gets-a-makeover-artist-concept/" target="_blank" rel="noreferrer">Milky Way · NASA/JPL-Caltech/R. Hurt ↗</a>:mode==='solar'?<a href="https://svs.gsfc.nasa.gov/3851/" target="_blank" rel="noreferrer">Sun · NASA STEREO/SDO · EUV false colour ↗</a>:<a href="#/sources">NASA sources ↗</a>}</div>}
   {!isWorld&&<details className="opening-timeline"><summary>Our journey</summary><div aria-label="Opening chapters">{opening.map((step,i)=><button key={step} aria-label={`Go to ${introCopy[step].label}`} aria-current={mode===step?'step':undefined} onClick={()=>{setMode(step);setIntroPlaying(false);}}><span/><small>{['Milky Way','Solar System','Earth','Explore'][i]}</small></button>)}<button aria-label={introPlaying&&motion?'Pause opening':'Play opening'} aria-pressed={introPlaying&&motion} onClick={()=>{if(introPlaying&&motion)setIntroPlaying(false);else{if(mode==='choose')setMode('galaxy');setMotion(true);setIntroPlaying(true);}}}>{introPlaying&&motion?'Pause':'Play'} ↗</button></div></details>}
   {isWorld?<TourPanel site={currentSite} stops={stops} travelling={travelling} motion={motion&&!detail&&!siteDetail&&!atlas} playing={tourPlaying&&motion} progress={tourProgress} onPlay={()=>{if(!motion){setMotion(true);setTourPlaying(true);}else setTourPlaying(v=>!v);}} onPrevious={previousStop} onNext={nextStop} onDetails={openDetail} onSelect={site=>{pauseTour();selectSite(site);}}/>:<OrbitGuide text={speech} title="Follow what stayed." narrating={voiceState.speaking} motion={motion} minimized={guideMinimized} onMinimize={()=>setGuideMinimized(v=>!v)} travelling={false}/>}
   {isWorld&&<div className="tour-map-note">Drag to explore · Illustrative route, not a spacecraft trajectory</div>}
  </section>
  {!isWorld&&<><section className="mission-showcase" aria-labelledby="showcase-title"><div className="showcase-intro"><h2 id="showcase-title">Left behind.</h2></div><div className="showcase-objects">{['eagle','opportunity','ingenuity'].map(id=>{const item=findArtifact(id)!;return <article key={id} className="showcase-object"><DeferredModel item={item} motion={motion}/><div><h3>{item.name}</h3><button className="text-action" onClick={()=>visit(item.world as World,item)}>Find on {item.world==='moon'?'the Moon':'Mars'} ↗</button></div></article>;})}</div></section><section className="journey-proof"><img src={photoFor('eagle')?.file??'/assets/eagle-photo.jpg'} alt="Buzz Aldrin beside Eagle. NASA / Neil Armstrong." loading="lazy"/><div><h2>What should we leave?</h2><a className="light-button" href="#/responsibility">Explore solutions ↗</a><small>NASA / Neil Armstrong</small></div></section><footer className="cosmic-footer"><small>Independent project · No NASA endorsement.</small><a href="#/collection">Missions ↗</a><a href="#/sources">Credits ↗</a></footer></>}
  </main>
  {detail&&<MissionDialog key={detail.id} item={detail} motion={motion} onClose={closeDetail}/>} {siteDetail&&<SiteDialog site={siteDetail} onClose={closeDetail}/>}
  {atlas&&<CoordinateAtlas world={world} onClose={closeAtlas} onVisit={site=>{closeAtlas();selectSite(site);}}/>}
 </div>;
}
export default function CinematicRouter(){const [route,setRoute]=useState(()=>window.location.hash);useEffect(()=>{const changed=()=>setRoute(window.location.hash);window.addEventListener('hashchange',changed);return()=>window.removeEventListener('hashchange',changed);},[]);const archive=/^#\/(collection|sources|legacy|about)(?:\/|$)/.test(route)||new URLSearchParams(location.search).has('classic');return route==='#/responsibility'?<Stewardship/>:archive?<div className="cinematic-archive"><ArchiveApp/></div>:<CinematicExperience route={route}/>;}
