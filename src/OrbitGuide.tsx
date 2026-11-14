import BlipModel from './BlipModel';
type Props={text:string;title?:string;voice:boolean;voiceSupported:boolean;talking:boolean;motion:boolean;minimized:boolean;onToggleVoice:()=>void;onMinimize:()=>void;onNext?:()=>void};
export default function OrbitGuide(p:Props){
 return <aside className={`orbit-guide ${p.minimized?'guide-minimized':''}`} aria-label="Blip's guided story">
  <button className="blip-toggle" aria-label={p.minimized?'Show Blip guide':'Hide Blip guide'} onClick={p.onMinimize}><BlipModel motion={p.motion} talking={p.talking}/></button>
  {!p.minimized&&<div className="guide-bubble"><div className="guide-bubble-inner"><div className="guide-bubble-top"><strong>Blip</strong>{p.title&&<span>{p.title}</span>}</div><p className="guide-speech">{p.text}</p><div className="guide-actions"><button disabled={!p.voiceSupported} aria-pressed={p.voice} title="Optional device voice, not a NASA recording" onClick={p.onToggleVoice}>{p.voice?'Voice on':'Voice off'}</button>{p.onNext&&<button aria-label="Next story line" onClick={p.onNext}>Next →</button>}</div></div></div>}
 </aside>;
}
