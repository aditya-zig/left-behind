import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { challengeUrl, findArtifact, nextTourId, searchArtifacts, tourIds, verifiedDate, worldArtifacts, worlds } from './data';
import type { Artifact, World } from './data';
import Model, { assetFor, assetLibrary } from './Model';
import './style.css';
const Scene=lazy(()=>import('./Scene'));
type Route={view:'home'|'intro'|'explore'|'collection'|'legacy'|'sources'|'about';world?:'moon'|'mars';id?:string};
function routeFromHash():Route{
  const [page,id]=window.location.hash.replace(/^#\/?/,'').split('/');
  if(page==='moon'||page==='mars')return {view:'explore',world:page,id:findArtifact(id)?.world===page?id:worldArtifacts(page)[0].id};
  if(['intro','collection','legacy','sources','about'].includes(page))return {view:page as Route['view'],id:findArtifact(id)?id:undefined};
  return {view:'home'};
}
const navigate=(path:string)=>{window.location.hash=path;};
function External({href,children,className}:{href:string;children:React.ReactNode;className?:string}){return <a href={href} target="_blank" rel="noreferrer" className={className}>{children}<span aria-hidden="true"> ↗</span></a>;}
function Globe({world,selected,items,onSelect,hero,mode}:{world:'moon'|'mars';selected?:Artifact;items?:Artifact[];onSelect?:(id:string)=>void;hero?:boolean;mode?:'globe'|'terrain'}){return <Suspense fallback={<div className="scene-message" role="status">Preparing the view…</div>}><Scene world={world} selected={selected} items={items} onSelect={onSelect} hero={hero} mode={mode}/></Suspense>;}
function Credits({artifact}:{artifact:Artifact}){return <div className="source-list">{artifact.sources.map((s,i)=><div key={s.url}><External href={s.url}>{s.title}</External><p>{s.supports}</p><span className="source-number">Source {i+1}</span></div>)}</div>;}
function useNarrator(text:string,enabled:boolean,playing:boolean){
  const [supported,setSupported]=useState(false);
  const [speaking,setSpeaking]=useState(false);
  useEffect(()=>setSupported('speechSynthesis' in window),[]);
  useEffect(()=>{
    setSpeaking(false);
    if(!enabled||!supported||!text)return;
    let active=true;
    const synth=window.speechSynthesis;
    const utterance=new SpeechSynthesisUtterance(text);utterance.rate=0.93;utterance.lang='en-US';
    utterance.onstart=()=>{if(active)setSpeaking(true);};
    utterance.onend=utterance.onerror=()=>{if(active)setSpeaking(false);};
    synth.cancel();synth.speak(utterance);
    if(!playing)synth.pause();
    return()=>{active=false;synth.cancel();};
    // Playback is handled separately so pause/resume does not restart the sentence.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[text,enabled,supported]);
  useEffect(()=>{if(!supported||!enabled)return;const synth=window.speechSynthesis;if(playing)synth.resume();else synth.pause();},[playing,enabled,supported]);
  return {supported,speaking};
}
const introScenes=[
  {title:'A universe of stories.',body:'Every mission starts with a question. Every machine we send carries a little of our curiosity with it.',image:'/assets/stars.jpg',credit:'NASA 3D Resources · Hipparcos star map. Catalogue projection, not a photograph of the Milky Way.',source:'https://github.com/nasa/NASA-3D-Resources/tree/master/Images%20and%20Textures/Hipparcos%20Star%20Map'},
  {title:'Our small corner of space.',body:'Across the solar system, spacecraft have become our eyes, ears, and hands. Some keep traveling. Others have found a place to stay.',image:'/assets/solar-system-photo.jpg',credit:'NASA/JPL · PIA10969. Published artist concept; sizes and distances are not to scale.',source:'https://images.nasa.gov/details/PIA10969'},
  {title:'Everything began at home.',body:'The view back toward Earth reminds us why we explore. We leave hardware behind, but bring knowledge home.',image:'/assets/earthrise-photo.jpg',credit:'NASA · AS11-44-6549. Earth over the lunar horizon, photographed from Apollo 11.',source:'https://images.nasa.gov/details/as11-44-6549'},
  {title:'Welcome to the archive.',body:'Your journey begins on the Moon. Explore five objects, then cross to Mars. You can pause, skip, switch worlds, or inspect the evidence at any time.',image:'/assets/control.png',credit:'NASA 3D Resources · JSC Mission Control Room reference-model preview, not a live control room.',source:'https://github.com/nasa/NASA-3D-Resources/tree/master/3D%20Models/JSC%20Mission%20Control%20Room'},
];
export default function App(){
  const [route,setRoute]=useState<Route>(routeFromHash);
  const [guided,setGuided]=useState(false);
  const [playing,setPlaying]=useState(true);
  const [voice,setVoice]=useState(false);
  const [hidden,setHidden]=useState(document.hidden);
  const [elapsed,setElapsed]=useState(0);
  const [introIndex,setIntroIndex]=useState(0);
  const [surface,setSurface]=useState(false);
  const [tab,setTab]=useState<'story'|'evidence'>('story');
  const [saved,setSaved]=useState<string[]>(()=>{try{return JSON.parse(localStorage.getItem('left-behind-visited')??'[]').filter((id:unknown)=>typeof id==='string'&&!!findArtifact(id));}catch{return [];}});
  const [menu,setMenu]=useState(false);
  const [notice,setNotice]=useState('');
  const main=useRef<HTMLElement>(null);
  const previousView=useRef(route.view);
  const world=route.world??'moon';
  const items=useMemo(()=>worldArtifacts(world),[world]);
  const selected=findArtifact(route.id??'')??items[0];
  const intro=introScenes[introIndex];
  const spokenText=route.view==='intro'?`${intro.title} ${intro.body}`:route.view==='explore'?selected.story:'';
  const {supported,speaking}=useNarrator(spokenText,voice,playing&&!hidden);
  const duration=route.view==='intro'?Math.max(10,Math.ceil(spokenText.split(/\s+/).length/2.4)):Math.max(30,Math.ceil(selected.story.split(/\s+/).length/2.4));
  useEffect(()=>{const onHash=()=>{setRoute(routeFromHash());setMenu(false);};window.addEventListener('hashchange',onHash);return()=>window.removeEventListener('hashchange',onHash);},[]);
  useEffect(()=>{const onVisible=()=>setHidden(document.hidden);document.addEventListener('visibilitychange',onVisible);return()=>document.removeEventListener('visibilitychange',onVisible);},[]);
  useEffect(()=>{
    setElapsed(0);setTab('story');
    if(previousView.current!==route.view){window.scrollTo({top:0,behavior:'instant'});main.current?.focus({preventScroll:true});previousView.current=route.view;}
    document.title=route.view==='explore'?`${selected.name} — Left Behind`:'Left Behind — A NASA Space Apps Story';
    if(route.view==='explore')setSaved(old=>old.includes(selected.id)?old:[...old,selected.id]);
  },[route.view,selected.id,introIndex]);
  useEffect(()=>{try{localStorage.setItem('left-behind-visited',JSON.stringify(saved));}catch{/* Browsing still works when storage is unavailable. */}},[saved]);
  useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(''),4000);return()=>clearTimeout(t);},[notice]);
  const advance=useCallback(()=>{
    setElapsed(0);
    if(route.view==='intro'){
      if(introIndex<introScenes.length-1)setIntroIndex(i=>i+1);
      else {setGuided(true);navigate('/moon/eagle');}
    }else if(route.view==='explore'){
      const next=nextTourId(selected.id);
      if(next){const a=findArtifact(next)!;navigate(`/${a.world}/${a.id}`);}else{setGuided(false);navigate('/legacy');}
    }
  },[route.view,introIndex,selected.id]);
  useEffect(()=>{
    if(!playing||hidden||!(route.view==='intro'||(route.view==='explore'&&guided)))return;
    const id=setInterval(()=>setElapsed(t=>t+0.25),250);return()=>clearInterval(id);
  },[playing,hidden,route.view,guided,selected.id,introIndex]);
  useEffect(()=>{if(playing&&!hidden&&elapsed>=duration&&!(voice&&speaking))advance();},[elapsed,duration,advance,voice,speaking,playing,hidden]);
  function startTour(){setIntroIndex(0);setPlaying(true);setGuided(true);navigate('/intro');}
  function openArtifact(a:Artifact){setGuided(false);setPlaying(true);navigate(a.world==='beyond'?`/collection/${a.id}`:`/${a.world}/${a.id}`);}
  function switchWorld(next:'moon'|'mars'){setSurface(false);setElapsed(0);navigate(`/${next}/${worldArtifacts(next)[0].id}`);}
  async function share(){try{await navigator.clipboard.writeText(window.location.href);setNotice('Link copied. This opens the same mission record.');}catch{setNotice('Copy the address in your browser to share this record.');}}
  return <>
    <a className="skip-link" href="#main-content" onClick={e=>{e.preventDefault();main.current?.focus();}}>Skip to content</a>
    <header className="site-header">
      <a className="wordmark" href="#/" aria-label="Left Behind home">LEFT<span>BEHIND</span><span className="brand-dot"/></a>
      <button className="menu-toggle" onClick={()=>setMenu(!menu)} aria-expanded={menu} aria-controls="primary-nav">{menu?'Close':'Menu'}</button>
      <nav id="primary-nav" className={menu?'open':''} aria-label="Main navigation">
        <button onClick={startTour} className={route.view==='intro'?'current':''}>The journey</button>
        <a href="#/collection" aria-current={route.view==='collection'?'page':undefined}>The collection <span>18</span></a>
        <a href="#/sources" aria-current={route.view==='sources'?'page':undefined}>Sources</a>
        <a href="#/about" aria-current={route.view==='about'?'page':undefined}>About</a>
      </nav>
      <button className={`sound-control ${voice?'on':''}`} aria-pressed={voice} onClick={()=>{if(!supported){setNotice('Read-aloud is unavailable in this browser. Every story has a complete transcript.');return;}setVoice(!voice);}} title="Optional device read-aloud; no recording or microphone">{voice?'Sound on':'Sound off'} <span aria-hidden="true">{voice?'◖))':'◖×'}</span></button>
    </header>
    <main id="main-content" ref={main} tabIndex={-1}>
      {route.view==='home'&&<>
        <section className="home-hero">
          <div className="hero-orbit"><Globe world="moon" hero/></div>
          <div className="hero-intro"><p className="context-line">An independent NASA Space Apps experience</p><h1>Left behind.<br/><em>Not forgotten.</em></h1><p className="hero-copy">Their missions ended. Their stories didn’t.<br/>Meet the machines still waiting on the Moon and Mars.</p><div className="hero-actions"><button className="button primary" onClick={startTour}>Begin the journey <span>↗</span></button><a className="text-link" href="#/moon/eagle">Explore on your own <span>→</span></a></div><p className="hero-note">A guided story. A real archive. No space suit required.</p></div>
          <div className="hero-foot"><span>Made with NASA imagery, models & mission records</span><span>Drag the Moon to look around <span aria-hidden="true">↔</span></span></div>
        </section>
        <section className="world-section">
          <div className="section-intro"><h2>Two worlds.<br/><em>So much left to tell.</em></h2><p>Some objects were designed to stay. Others outlived every expectation. None of them is simply “space junk.”</p></div>
          <div className="world-choices">{(['moon','mars'] as const).map(w=><a href={`#/${w}/${worldArtifacts(w)[0].id}`} className={`world-choice ${w}`} key={w}><img src={w==='moon'?'/assets/eagle-photo.jpg':'/assets/ingenuity-photo.jpg'} alt={w==='moon'?'Apollo 11 lunar module on the Moon — NASA photograph':'Ingenuity on Mars — NASA published mission image'} width="1280" height="960" loading="lazy"/><div><span>{worldArtifacts(w).length} mission stories</span><h3>{worlds[w].name}</h3><p>{worlds[w].subtitle}</p><span className="round-arrow" aria-hidden="true">↗</span></div></a>)}</div>
        </section>
        <section className="archive-feature"><img src="/assets/rover-photo.jpg" alt="James Irwin working beside the Apollo 15 lunar rover — photograph by David Scott, NASA" width="1280" height="1280" loading="lazy"/><div><h2>What stays behind<br/><em>moves us forward.</em></h2><p>A landing stage became a launchpad. A mirror became a decades-long experiment. A helicopter became proof that we could fly on another world.</p><p>Follow the hardware. Discover the human decisions, the hard limits, and the science that survived the silence.</p><a className="button light" href="#/legacy">Discover the legacy <span>→</span></a><External href="https://images.nasa.gov/details/as15-86-11603" className="asset-credit">Apollo 15 · NASA / David Scott</External></div></section>
        <section className="trust-band"><h2>The story is only as good<br/><em>as the evidence behind it.</em></h2><p>Every mission has a source trail. Every model has an origin. No invented transmissions, live telemetry, item prices, or generated space imagery.</p><a className="text-link" href="#/sources">Open the source archive <span>→</span></a></section>
      </>}
      {route.view==='intro'&&<section className="intro-page">
        <div className={`intro-visual intro-${introIndex}`}><img key={intro.image} src={intro.image} alt={intro.credit} width="1600" height="1000"/><External href={intro.source} className="intro-credit">{intro.credit}</External></div>
        <div className="intro-content"><p className="context-line">Your journey · {introIndex+1} of {introScenes.length}</p><h1>{intro.title}</h1><p>{intro.body}</p><div className="intro-steps" aria-label="Opening chapters">{introScenes.map((s,i)=><button key={s.title} aria-label={`Go to ${s.title}`} aria-current={i===introIndex?'step':undefined} onClick={()=>setIntroIndex(i)}><span/></button>)}</div><div className="intro-controls"><button className="button primary" onClick={advance}>{introIndex===3?'Arrive on the Moon':'Continue'} <span>→</span></button><button onClick={()=>setPlaying(!playing)}>{playing?'Pause':'Resume'}</button><button onClick={()=>{setElapsed(0);setGuided(true);setPlaying(true);navigate('/moon/eagle');}}>Skip opening</button></div><p className="small-note">NASA source images, not a scale-accurate animated fly-through. {voice?'Read-aloud uses your device’s voice.':'Sound is optional. All text stays on screen.'}</p><progress value={elapsed} max={duration} aria-label="Opening chapter progress"/></div>
      </section>}
      {route.view==='explore'&&<>
        <section className={`explorer ${world}`}>
          <div className="explorer-heading"><div><p className="context-line">The surface archive · {worlds[world].distance}</p><h1>{worlds[world].name}</h1></div><div className="world-switch" aria-label="Choose a world">{(['moon','mars'] as const).map(w=><button key={w} aria-pressed={world===w} onClick={()=>switchWorld(w)}>{worlds[w].name}</button>)}</div></div>
          <div className="explorer-grid">
            <div className="map-column"><div className="map-toolbar"><div className="segmented"><button aria-pressed={!surface} onClick={()=>setSurface(false)}>Globe</button><button aria-pressed={surface} onClick={()=>setSurface(true)}>NASA terrain</button></div><External href={worlds[world].trek}>Open NASA Trek</External></div>
              <div className="map-stage"><Globe world={world} selected={selected} items={items} onSelect={id=>{setGuided(false);navigate(`/${world}/${id}`);}} mode={surface?'terrain':'globe'}/></div>
              <div className="map-caption"><span>{surface?worlds[world].terrainLabel:'NASA surface texture · contextual globe'}</span><span>Drag to orbit · Scroll to zoom</span></div>
              <p className="map-disclaimer">{surface?`${worlds[world].terrainLabel}, from NASA’s 3D printing collection. Relief model, not a navigable reconstruction. Mars terrain is the original landing site, not Opportunity’s final location. No artifact positions or scales are inferred from this mesh.`:'Markers show source-based landing sites or approximate regions, not live positions. Nearby objects can overlap; select any record below.'}</p>
              <div className="artifact-index" aria-label={`${worlds[world].name} mission records`}>{items.map(a=><button key={a.id} className={a.id===selected.id?'active':''} aria-pressed={a.id===selected.id} onClick={()=>{setGuided(false);navigate(`/${world}/${a.id}`);}}><span className={`index-dot ${saved.includes(a.id)?'visited':''}`}/><span>{a.name}</span><span>{a.year}</span></button>)}</div>
            </div>
            <article className="mission-panel" aria-label={`${selected.name} mission story`}>
              <div className="mission-title"><div><span className="mission-kind">{selected.mission}</span><h2>{selected.name}</h2><p>{selected.subtitle}</p></div><button className="share-button" onClick={share} aria-label={`Copy link to ${selected.name}`}>↗</button></div>
              <Model key={selected.id} artifact={selected}/>
              {selected.modelNote&&<p className="model-note">{selected.modelNote}</p>}
              <div className="mission-tabs" role="tablist" aria-label="Mission information" onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?'story':e.key==='End'?'evidence':tab==='story'?'evidence':'story';setTab(next);document.getElementById(`${next}-tab`)?.focus();}}}><button role="tab" id="story-tab" tabIndex={tab==='story'?0:-1} aria-selected={tab==='story'} aria-controls="story-content" onClick={()=>setTab('story')}>The story</button><button role="tab" id="evidence-tab" tabIndex={tab==='evidence'?0:-1} aria-selected={tab==='evidence'} aria-controls="evidence-content" onClick={()=>setTab('evidence')}>Facts & sources <span>{selected.sources.length}</span></button></div>
              {tab==='story'?<div id="story-content" role="tabpanel" aria-labelledby="story-tab"><div className="story-transcript"><span className="transcript-label">The mission archive · original educational narration</span><p>{selected.story}</p></div><div className="mission-fact"><strong>{selected.fact}</strong><span>{selected.factLabel}</span></div><div className="status-inline"><span className="status-dot"/><strong>{selected.status}</strong><p>{selected.statusDetail}</p></div></div>:<div id="evidence-content" role="tabpanel" aria-labelledby="evidence-tab"><dl className="evidence-facts"><div><dt>Where it is</dt><dd>{selected.location}<small>{selected.locationNote}</small></dd></div><div><dt>Built to do</dt><dd>{selected.purpose}</dd></div><div><dt>Why it stayed</dt><dd>{selected.why}</dd></div><div><dt>What we learned</dt><dd>{selected.discovery}</dd></div><div><dt>Documented status</dt><dd>{selected.statusDetail}</dd></div><div><dt>Cost</dt><dd>No verified object-level cost is supplied. Mission and program budgets are not prices for the hardware shown.</dd></div></dl><Credits artifact={selected}/><p className="small-note">Records checked {verifiedDate}. Historical documentation, not live health data.</p></div>}
            </article>
          </div>
          <div className="tour-bar"><div className="tour-summary"><span className="tour-indicator"/>{guided?<><strong>Guided journey</strong><span>Story {tourIds.indexOf(selected.id)+1} of {tourIds.length}</span></>:<><strong>Explore at your pace</strong><span>{saved.filter(id=>tourIds.includes(id)).length} of 10 spotlight stories visited</span></>}</div><div className="tour-actions">{guided?<><button onClick={()=>setPlaying(!playing)} aria-label={playing?'Pause guided journey':'Resume guided journey'}>{playing?'Ⅱ Pause':'▷ Resume'}</button><progress value={elapsed} max={duration} aria-label="Current story progress"/><button onClick={advance}>{nextTourId(selected.id)?'Next story →':'Finish the journey →'}</button><button onClick={()=>setGuided(false)}>Exit tour</button></>:<><button onClick={()=>{setGuided(true);setPlaying(true);setElapsed(0);if(!tourIds.includes(selected.id))navigate(`/${world}/${world==='moon'?'eagle':'opportunity'}`);}}>▷ Start guided tour here</button><a href="#/legacy">The legacy →</a></>}</div></div>
        </section>
      </>}
      {route.view==='collection'&&<Collection openArtifact={openArtifact} selectedId={route.id}/>}
      {route.view==='sources'&&<Sources/>}
      {route.view==='legacy'&&<Legacy openArtifact={openArtifact}/>}
      {route.view==='about'&&<About startTour={startTour}/>}
    </main>
    {route.view!=='explore'&&route.view!=='intro'&&<footer className="site-footer"><a href="#/" className="footer-brand">LEFT BEHIND<span>Not forgotten.</span></a><div><p>Built for NASA Space Apps.<br/>An independent educational project.<br/>Not affiliated with or endorsed by NASA.</p><a href="#/sources">Sources & asset credits</a><a href="#/about">Project notes & accessibility</a><External href="https://github.com/aditya-zig/left-behind">View on GitHub</External></div><p className="footer-fine">NASA imagery and models remain credited to their original sources. AI-assisted code and educational writing; original mission evidence is linked throughout.</p></footer>}
    {notice&&<div className="toast" role="status">{notice}</div>}
  </>;
}
function Collection({openArtifact,selectedId}:{openArtifact:(a:Artifact)=>void;selectedId?:string}){
  const [query,setQuery]=useState('');const [filter,setFilter]=useState<World|'all'>('all');
  const found=searchArtifacts(query,filter==='all'?undefined:filter);
  const selected=findArtifact(selectedId??'');
  return <section className="collection-page page-shell"><div className="page-heading"><p className="context-line">The complete collection</p><h1>Machines with<br/><em>unfinished stories.</em></h1><p>Thirteen objects on the Moon and Mars. Five more stories beyond them. Different destinations, carefully separated.</p></div>
    {selected&&<article className="beyond-detail" aria-label={`${selected.name} detailed record`}><div><p className="context-line">Beyond the Moon & Mars · {selected.category}</p><h2>{selected.name}</h2><p className="detail-subtitle">{selected.subtitle}</p><div className="story-transcript"><p>{selected.story}</p></div><div className="status-inline"><strong>{selected.status}</strong><p>{selected.statusDetail}</p></div><dl className="evidence-facts"><div><dt>Location</dt><dd>{selected.location}<small>{selected.locationNote}</small></dd></div><div><dt>Purpose</dt><dd>{selected.purpose}</dd></div><div><dt>Why it stayed</dt><dd>{selected.why}</dd></div><div><dt>Discovery</dt><dd>{selected.discovery}</dd></div><div><dt>Cost</dt><dd>No verified object-level cost shown.</dd></div></dl><Credits artifact={selected}/><a href="#/collection" className="text-link">Close mission record ↑</a></div><div><Model key={selected.id} artifact={selected}/><p className="model-note">{selected.modelNote??'NASA reference model or published mission image. Not a live view or final-condition reconstruction.'}</p></div></article>}
    <div className="collection-controls"><div className="filter-tabs" aria-label="Filter collection">{(['all','moon','mars','beyond'] as const).map(w=><button aria-pressed={w===filter} key={w} onClick={()=>setFilter(w)}>{w==='all'?'All 18':w==='beyond'?'Beyond':worlds[w].name}</button>)}</div><label className="search-field"><span className="sr-only">Search mission records</span><input type="search" value={query} placeholder="Find a mission or artifact" onChange={e=>setQuery(e.target.value)}/><span aria-hidden="true">⌕</span></label></div><p className="result-count" role="status">{found.length} {found.length===1?'record':'records'}{query?` for “${query}”`:''}</p>
    <div className="collection-grid">{found.map(a=>{const asset=assetFor(a);const image=asset.preview??asset.photo;return <button className={`collection-card ${a.world}`} key={a.id} onClick={()=>openArtifact(a)}><div className={`card-image ${asset.preview?'model-preview':''}`}>{image&&<img src={image.file} alt="" width="640" height="480" loading="lazy"/>}<span className="card-visual-type">{asset.preview?'NASA model preview':image?.kind.includes('artist concept')?'NASA artist concept':image?.kind.includes('illustration')?'NASA illustration':'NASA archive'}</span><span className="card-destination">{a.world==='beyond'?'Beyond Moon & Mars':worlds[a.world].name}</span><span className="card-arrow" aria-hidden="true">↗</span></div><div className="card-copy"><span>{a.year} · {a.category}</span><h2>{a.name}</h2><p>{a.subtitle}</p><span className="card-status">{a.status}</span></div></button>;})}</div>{!found.length&&<div className="empty-state"><h2>No mission found.</h2><p>Try a name such as “Viking,” a place, or “rover.”</p><button className="button light" onClick={()=>{setQuery('');setFilter('all');}}>Reset search</button></div>}
    <div className="collection-end"><h2>Different endings.<br/><em>A shared inheritance.</em></h2><p>Being left behind is not a single technical state. Some equipment completed its job. Some lost contact. Passive experiments can remain useful without transmitting at all.</p><a href="#/legacy" className="text-link">See what connects them →</a></div>
  </section>;
}
function Sources(){
  const [q,setQ]=useState('');const filtered=searchArtifacts(q);
  const assetRows=Object.entries(assetLibrary).flatMap(([key,values])=>Object.entries(values).map(([type,asset])=>({key,type,asset})));
  return <section className="sources-page page-shell"><div className="page-heading"><p className="context-line">Open the evidence</p><h1>No source.<br/><em>No story.</em></h1><p>Start with the challenge’s own resources. Follow every claim back to a NASA mission record, and every image or model back to its collection.</p></div>
    <div className="source-principles"><div><h2>The official challenge</h2><p>“Abandoned but not Forgotten: Storytelling about NASA’s Discarded Equipment on the Moon and Mars.” The listed NSSDCA records are used for Apollo mission data, surface locations, and what stayed behind. NASA Science records support mission histories.</p><External href={challengeUrl}>Challenge statement & resource list</External></div><div><h2>What we actually used</h2><p>NASA’s 3D Resources repository supplies locally served spacecraft models, the Mars texture, and landing-site terrain. NASA Goddard’s CGI Moon Kit supplies the LRO-based lunar globe map. The NASA Image and Video Library supplies Apollo photography and a clearly labeled solar-system concept.</p><External href="https://science.nasa.gov/3d-resources/">NASA’s 3D resource directory</External><External href="https://svs.gsfc.nasa.gov/4720/">NASA Goddard · CGI Moon Kit / LRO map</External><External href="https://science.nasa.gov/mars/resources/">NASA Mars media resources</External></div><div><h2>Editorial guardrails</h2><p>No invented quotes, simulated transmissions, “live” dashboards, item-level cost estimates, or generated NASA-style visuals. Mission end is not always last contact. Water evidence is not proof of life.</p><span className="verified">Source review: {verifiedDate}</span></div></div>
    <section className="source-records"><div className="section-intro"><h2>Mission by mission.</h2><label className="search-field"><span className="sr-only">Search the source archive</span><input value={q} onChange={e=>setQ(e.target.value)} type="search" placeholder="Search the source archive"/></label></div>{filtered.map(a=><details key={a.id} className="source-record"><summary><span>{a.name}<small>{a.mission}</small></span><span>{a.sources.length} {a.sources.length===1?'source':'sources'} +</span></summary><div><p>{a.locationNote}</p><Credits artifact={a}/><p className="small-note">Status: {a.statusDetail} Object-level cost is not asserted.</p></div></details>)}{!filtered.length&&<p>No matching source records. Clear your search to see all missions.</p>}</section>
    <section className="asset-register"><h2>The visual archive.</h2><p>All space imagery comes from NASA-published sources. Models are illustrative reference geometry, not recovered scans or final-condition reconstructions. NASA-published artist concepts are not photographs. Source records contain original creator credits and usage notes.</p><div className="asset-resource-links"><External href="https://github.com/nasa/NASA-3D-Resources">NASA 3D Resources repository</External><External href="https://images.nasa.gov/">NASA Image & Video Library</External><External href="https://www.nasa.gov/nasa-brand-center/images-and-media/">NASA media usage guidelines</External><External href="https://www.nasa.gov/wp-content/uploads/2024/02/final-catalogue-of-manmade-material-on-the-moon.pdf">NASA lunar material catalogue</External></div><details className="asset-details"><summary>{assetRows.length} local assets · show provenance register +</summary><div>{assetRows.map(({key,type,asset})=><div className="asset-row" key={`${key}-${type}`}><span>{key} · {type}<small>{asset.kind} · {(asset.bytes/1024/1024).toFixed(2)} MB</small></span><External href={asset.source}>Original record</External><a href={asset.file} download>Download local asset ↓</a></div>)}</div></details><p className="small-note">Repository assets pinned to commit 11ebb4ee043715aefbba6aeec8a61746fad67fa7. SHA-256 checksums are available in the project source. NASA does not endorse this project. Third-party creator rights, where stated on an original source, still apply.</p></section>
  </section>;
}
function Legacy({openArtifact}:{openArtifact:(a:Artifact)=>void}){
  const [answer,setAnswer]=useState<number|null>(null);
  return <section className="legacy-page"><div className="legacy-hero page-shell"><p className="context-line">The journey doesn’t end in silence</p><h1>They stayed.<br/><em>We moved forward.</em></h1><p>The hardware is distant. Its inheritance is all around us: knowledge, engineering experience, and better questions for the next mission.</p></div>
    <section className="legacy-comparison page-shell"><h2>Two surfaces.<br/><em>Different kinds of staying.</em></h2><div className="comparison-columns"><div><img src="/assets/alsep-photo.jpg" alt="Apollo 12 scientific instruments deployed on the lunar surface — NASA" width="1280" height="1238" loading="lazy"/><h3>On the Moon</h3><p>Humans deliberately left landing stages, vehicles, and instruments. ALSEP extended a short visit into years of measurements. Passive reflectors show why “left behind” does not automatically mean “useless.”</p><button className="text-link" onClick={()=>openArtifact(findArtifact('reflector')!)}>Revisit the reflector →</button></div><div><img src="/assets/insight-photo.jpg" alt="InSight lander as published in the NASA mission archive" width="1280" height="960" loading="lazy"/><h3>On Mars</h3><p>Robots became our field scientists. Dust, cold, energy limits, and mechanical damage shaped their endings. Their returned observations still support research after the machines stop responding.</p><button className="text-link" onClick={()=>openArtifact(findArtifact('insight')!)}>Revisit InSight →</button></div></div></section>
    <section className="future-band page-shell"><div><h2>What the next<br/><em>mission inherits.</em></h2><p>Not every lesson is a discovery. Some are about how to land, how to drive, how to survive a winter, or how to fly in air thinner than Earth’s.</p></div><div className="legacy-lessons"><div><span>Mobility</span><p>Sojourner tested a rover architecture. Spirit and Opportunity demonstrated long journeys. Ingenuity established powered flight on another world.</p></div><div><span>Continuity</span><p>ALSEP and InSight turned time into a scientific instrument. Their archives allow researchers to ask questions the original missions could not finish.</p></div><div><span>Stewardship</span><p>Equipment is also heritage. Future exploration must balance access, scientific value, planetary protection, and respect for historic sites.</p><External href="https://www.nasa.gov/office-of-technology-policy-and-strategy/historic-sites/">NASA lunar heritage guidance</External></div></div></section>
    <section className="beyond-band page-shell"><div className="section-intro"><h2>Some stories<br/><em>never touched these worlds.</em></h2><p>The challenge also includes spacecraft at Ceres, Eros, in solar orbit, and on outbound journeys. They belong to the story, not on a Moon or Mars map.</p></div><div className="beyond-list">{worldArtifacts('beyond').map(a=><button key={a.id} onClick={()=>openArtifact(a)}><span>{a.name}</span><span>{a.location}</span><span>↗</span></button>)}</div></section>
    <section className="reflection page-shell"><h2>One last thought.</h2><p>A spacecraft no longer communicates. Does that mean its scientific value has ended?</p><div className="quiz-options">{['Yes. No signal means no more science.','Not necessarily. Its returned data and engineering lessons can still be studied.'].map((text,i)=><button key={text} aria-pressed={answer===i} onClick={()=>setAnswer(i)}>{text}</button>)}</div>{answer!==null&&<p className="quiz-feedback" role="status">{answer===1?'Exactly. A mission’s hardware has a working lifetime; its data can have a much longer one.':'A silent spacecraft can still leave a valuable archive. Its returned data may support research long after contact ends.'}</p>}<div className="closing-actions"><a className="button primary" href="#/collection">Keep exploring <span>↗</span></a><a href="#/sources" className="text-link">Follow the evidence →</a></div></section>
  </section>;
}
function About({startTour}:{startTour:()=>void}){return <section className="about-page page-shell"><div className="page-heading"><p className="context-line">Project field notes</p><h1>A museum<br/><em>without walls.</em></h1><p>Left Behind is an independent educational response to the NASA Space Apps storytelling challenge. The subject is equipment. The story is exploration.</p></div><div className="about-sections"><section><h2>How to explore</h2><p>Start the guided journey for ten spotlight stories: five on the Moon and five on Mars. Pause or skip at any time. Switch worlds without waiting. The collection holds all eighteen records, including the additional Mars missions and destinations beyond both worlds.</p><p>Drag a globe or NASA reference model to inspect it. Use the globe’s arrow keys to rotate, + and − to zoom, and Home to reset. NASA terrain is a separate relief view of the Apollo 11 or Opportunity landing site; NASA Trek opens the actual mapping tool.</p><button className="button primary" onClick={startTour}>Start the journey →</button></section><section><h2>What is real</h2><p>The mission evidence, photographs, NASA-published concepts, surface textures, terrain, and spacecraft models come from linked NASA resources. A model shows a reference configuration, not necessarily the hardware’s present condition. All locations are contextual or explicitly approximate.</p><p>The educational narration is newly written from those records. It is not an astronaut quote or an actual transmission. No generated images, procedural space effects, invented waveforms, or simulated live data are used.</p></section><section><h2>Sound, privacy & access</h2><p>Sound is off by default. Optional read-aloud uses your browser or operating system’s speech service, not ElevenLabs or a prerecorded NASA voice. Device voice availability and quality vary. Some systems may use an online speech service. No microphone permission is requested.</p><p>Complete transcripts stay visible. The experience pauses when its tab is hidden, works without audio, and offers a non-3D collection when WebGL is unavailable. No automatic rotation or custom animated effects. Reduced-motion preferences are respected.</p><p>Only visited-record IDs are stored locally on your device. There is no account, backend, analytics, or tracking in this app. NASA links open externally; hosting-provider logs and external site policies are separate.</p><button className="text-link" onClick={()=>{try{localStorage.removeItem('left-behind-visited');window.location.reload();}catch{/* Storage may be disabled. */}}}>Clear local visit history →</button></section><section><h2>Built transparently</h2><p>Code and educational writing were developed with AI assistance and checked against the linked sources. This is a hackathon prototype, not a NASA product. No NASA affiliation, endorsement, verified classroom testing, or award eligibility is claimed.</p><p>All costs are withheld unless independently established at the object level. Last contact, mission declaration, passive usefulness, and retirement are separate concepts. Records were reviewed on {verifiedDate}; they do not monitor current spacecraft health.</p><External href="https://github.com/aditya-zig/left-behind">Code, provenance & project documentation</External></section></div></section>;}
