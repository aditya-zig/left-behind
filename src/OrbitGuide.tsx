import {useEffect,useRef,useState,type ReactNode} from 'react';
import {motion,useInView,useSpring,type MotionValue} from 'motion/react';
import {useCompanionFlight} from './useCompanionFlight';
export function AlienUfo({lookX,lookY}:{lookX?:MotionValue<number>;lookY?:MotionValue<number>}={}){
  return <svg className="alien-ufo" viewBox="0 0 240 180" role="img" aria-label="Orbit, a fictional friendly alien in a flying saucer">
    <defs>
      <linearGradient id="ufo-metal" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#f0f5ff"/><stop offset=".45" stopColor="#8c9bac"/><stop offset=".6" stopColor="#e0e7f0"/><stop offset="1" stopColor="#354656"/></linearGradient>
      <linearGradient id="ufo-dome" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#d2f5ff" stopOpacity=".6"/><stop offset=".5" stopColor="#5285a4" stopOpacity=".12"/><stop offset="1" stopColor="#d2f5ff" stopOpacity=".35"/></linearGradient>
      <linearGradient id="alien-skin" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#c8f8ba"/><stop offset="1" stopColor="#66ad78"/></linearGradient>
      <radialGradient id="ufo-light"><stop stopColor="#b9efff" stopOpacity=".5"/><stop offset="1" stopColor="#b9efff" stopOpacity="0"/></radialGradient>
    </defs>
    <ellipse cx="120" cy="153" rx="85" ry="23" fill="url(#ufo-light)"/>
    <path d="M66 114 Q66 27 120 24 Q174 27 174 114Z" fill="url(#ufo-dome)" stroke="#c5e6f0" strokeOpacity=".5" strokeWidth="1.5"/>
    <path d="M96 108 Q96 85 120 86 Q144 85 144 108" fill="#569772"/>
    <path d="M93 58 Q93 37 120 36 Q147 37 147 58 Q146 83 120 94 Q94 83 93 58" fill="url(#alien-skin)"/>
    <motion.g className="alien-look" style={{x:lookX,y:lookY}}><g className="alien-eyes"><ellipse cx="107" cy="64" rx="9" ry="14" transform="rotate(-24 107 64)" fill="#111e23"/><ellipse cx="133" cy="64" rx="9" ry="14" transform="rotate(24 133 64)" fill="#111e23"/><ellipse cx="104" cy="60" rx="2.2" ry="3.7" fill="#dff9ff"/><ellipse cx="130" cy="60" rx="2.2" ry="3.7" fill="#dff9ff"/></g></motion.g>
    <path className="alien-mouth" d="M115 83 Q120 87 125 83" fill="none" stroke="#366746" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M82 68 Q80 45 98 35" stroke="#e2faff" strokeOpacity=".6" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <ellipse cx="120" cy="119" rx="95" ry="27" fill="#263645"/><ellipse cx="120" cy="111" rx="100" ry="22" fill="url(#ufo-metal)"/>
    <ellipse cx="120" cy="110" rx="66" ry="11" fill="#667b8d" fillOpacity=".3"/>
    <path d="M33 115 Q120 144 207 115" fill="none" stroke="#c6d2df" strokeOpacity=".7"/>
    <g className="ufo-lamps" fill="#c8f9ff"><ellipse cx="55" cy="121" rx="6" ry="3"/><ellipse cx="86" cy="128" rx="6" ry="3"/><ellipse cx="120" cy="130" rx="6" ry="3"/><ellipse cx="154" cy="128" rx="6" ry="3"/><ellipse cx="185" cy="121" rx="6" ry="3"/></g>
  </svg>;
}

type Props={sceneKey?:string;compact?:boolean;media?:ReactNode;text:string;title:string;narrating?:boolean;motion:boolean;minimized:boolean;onMinimize:()=>void;onNext?:()=>void;onDetails?:()=>void;travelling:boolean};
const spring={stiffness:95,damping:17,mass:.8};
export default function OrbitGuide(p:Props){
  const ref=useRef<HTMLElement>(null),inView=useInView(ref,{margin:'80px'}),[visible,setVisible]=useState(!document.hidden);
  const x=useSpring(0,spring),y=useSpring(0,spring),tilt=useSpring(0,spring),eyesX=useSpring(0,spring),eyesY=useSpring(0,spring);
  const active=p.motion&&visible&&inView&&!p.minimized;
  const flight=useCompanionFlight(p.sceneKey??p.title,Boolean(p.compact),p.motion&&visible&&!p.minimized,p.travelling);
  useEffect(()=>{const changed=()=>setVisible(!document.hidden);document.addEventListener('visibilitychange',changed);return()=>document.removeEventListener('visibilitychange',changed);},[]);
  useEffect(()=>{
    if(!active){[x,y,tilt,eyesX,eyesY].forEach(value=>value.jump(0));return;}
    let frame=0,px=0,py=0;
    const move=(event:PointerEvent)=>{if(event.pointerType==='touch')return;px=event.clientX;py=event.clientY;if(frame)return;frame=requestAnimationFrame(()=>{frame=0;const rect=ref.current?.querySelector('.ufo-button')?.getBoundingClientRect();if(!rect)return;const dx=Math.max(-1,Math.min(1,(px-rect.x-rect.width/2)/350)),dy=Math.max(-1,Math.min(1,(py-rect.y-rect.height/2)/350));x.set(dx*18);y.set(dy*10);tilt.set(dx*10);eyesX.set(dx*5);eyesY.set(dy*4);});};
    window.addEventListener('pointermove',move,{passive:true});return()=>{window.removeEventListener('pointermove',move);cancelAnimationFrame(frame);};
  },[active,x,y,tilt,eyesX,eyesY]);
  return <motion.aside ref={ref} style={{width:flight.width}} initial={false} animate={{x:flight.x,y:flight.y}} transition={p.motion?{duration:p.travelling?3.6:2.8,ease:'easeInOut'}:{duration:0}} className={`orbit-guide flight-companion ${p.compact?'companion-compact':''} ${active?'guide-animated':''} ${p.minimized?'guide-minimized':''} ${p.travelling?'guide-travelling':''} ${p.narrating?'guide-speaking':''} ${p.media?'guide-with-media':''}`} aria-label="Orbit's guided story">
    <motion.button className="ufo-button" aria-label={p.minimized?'Show Orbit guide':'Minimize Orbit guide'} onClick={p.onMinimize} initial={p.motion?{opacity:0,scale:.88,y:20}:false} animate={{opacity:1,scale:1,y:0}} transition={{type:'spring',stiffness:180,damping:18}} whileHover={p.motion?{scale:1.06}:undefined} whileTap={p.motion?{scale:.96}:undefined}>
      <motion.span className="orbit-float" animate={active?{x:[0,10,-8,0],y:[0,-16,-6,0],rotate:p.travelling?[-12,8,-5,0]:[-3,3,-2,-3]}:{x:0,y:0,rotate:0}} transition={active?{duration:6,repeat:Infinity,ease:'easeInOut'}:{duration:0}}><motion.span className="orbit-look" style={{x,y,rotate:tilt}}><AlienUfo lookX={eyesX} lookY={eyesY}/></motion.span></motion.span>
    </motion.button>
    {p.compact&&!p.minimized&&<span className="companion-flight-label">{p.travelling?'Flying with you':p.narrating?'Orbit · speaking':'Orbit · your co-pilot'}</span>}
    {!p.compact&&!p.minimized&&p.media&&<motion.div key={p.title} className="guide-media" initial={p.motion?{opacity:0,scale:.97}:false} animate={{opacity:1,scale:1}} transition={{duration:.45,ease:[.16,1,.3,1]}}>{p.media}</motion.div>}
    {!p.compact&&!p.minimized&&<motion.div className="guide-bubble glass" initial={p.motion?{opacity:0,y:12}:false} animate={{opacity:1,y:0}} transition={{duration:.3,ease:[.16,1,.3,1]}}>
      <div className="guide-bubble-top"><span>Orbit <span className="guide-speaking-dot" data-speaking={Boolean(p.narrating)} aria-label={p.narrating?'Narrating':'Your fictional guide'}/></span><button aria-label="Minimize guide" onClick={p.onMinimize}>−</button></div>
      <strong className="guide-story-title">{p.title}</strong><motion.p key={p.text} className="guide-speech" initial={p.motion?{opacity:0,y:6,filter:'blur(3px)'}:false} animate={{opacity:1,y:0,filter:'blur(0px)'}} transition={{duration:.45,ease:[.16,1,.3,1]}}>{p.text}</motion.p>
      {p.onDetails&&<motion.button className="guide-primary" onClick={p.onDetails} whileHover={p.motion?{scale:1.015}:undefined} whileTap={p.motion?{scale:.98}:undefined}>Inspect this equipment ↗</motion.button>}{p.onNext&&<div className="guide-actions"><motion.button aria-label="Next thought" onClick={p.onNext} whileHover={p.motion?{x:5}:undefined} whileTap={p.motion?{scale:.94}:undefined}>→</motion.button></div>}
    </motion.div>}
  </motion.aside>;
}
