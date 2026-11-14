export function AlienUfo(){
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
    <g className="alien-eyes"><ellipse cx="107" cy="64" rx="9" ry="14" transform="rotate(-24 107 64)" fill="#111e23"/><ellipse cx="133" cy="64" rx="9" ry="14" transform="rotate(24 133 64)" fill="#111e23"/><ellipse cx="104" cy="60" rx="2.2" ry="3.7" fill="#dff9ff"/><ellipse cx="130" cy="60" rx="2.2" ry="3.7" fill="#dff9ff"/></g>
    <path d="M115 83 Q120 87 125 83" fill="none" stroke="#366746" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M82 68 Q80 45 98 35" stroke="#e2faff" strokeOpacity=".6" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <ellipse cx="120" cy="119" rx="95" ry="27" fill="#263645"/><ellipse cx="120" cy="111" rx="100" ry="22" fill="url(#ufo-metal)"/>
    <ellipse cx="120" cy="110" rx="66" ry="11" fill="#667b8d" fillOpacity=".3"/>
    <path d="M33 115 Q120 144 207 115" fill="none" stroke="#c6d2df" strokeOpacity=".7"/>
    <g className="ufo-lamps" fill="#c8f9ff"><ellipse cx="55" cy="121" rx="6" ry="3"/><ellipse cx="86" cy="128" rx="6" ry="3"/><ellipse cx="120" cy="130" rx="6" ry="3"/><ellipse cx="154" cy="128" rx="6" ry="3"/><ellipse cx="185" cy="121" rx="6" ry="3"/></g>
  </svg>;
}

type Props={text:string;title:string;voice:boolean;voiceSupported:boolean;motion:boolean;minimized:boolean;onToggleVoice:()=>void;onMinimize:()=>void;onNext?:()=>void;onDetails?:()=>void;travelling:boolean};
export default function OrbitGuide(p:Props){
  return <aside className={`orbit-guide ${p.motion?'guide-animated':''} ${p.minimized?'guide-minimized':''} ${p.travelling?'guide-travelling':''}`} aria-label="Orbit's guided story">
    {!p.minimized&&<div className="guide-bubble glass">
      <div className="guide-bubble-top"><span>Orbit <span className="guide-role">Your fictional guide</span></span><button aria-label="Minimize guide" onClick={p.onMinimize}>−</button></div>
      <strong className="guide-story-title">{p.title}</strong><p className="guide-speech">{p.text}</p>
      <div className="guide-actions"><button disabled={!p.voiceSupported} aria-pressed={p.voice} onClick={p.onToggleVoice}>{p.voice?'◖ Voice on':'◖ Voice off'}</button>{p.onNext&&<button onClick={p.onNext}>Next line →</button>}{p.onDetails&&<button onClick={p.onDetails}>More info ↗</button>}</div>
    </div>}
    <button className="ufo-button" aria-label={p.minimized?'Show Orbit guide':'Minimize Orbit guide'} onClick={p.onMinimize}><AlienUfo/></button>
  </aside>;
}
