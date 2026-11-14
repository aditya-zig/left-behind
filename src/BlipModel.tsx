import {useEffect,useRef,useState} from 'react';
import * as T from 'three';

// Geometry and materials adapted directly from the operator's 3d.zip/mascot-ufo.html.
function suppliedUfo(scene:T.Scene){
const M = (c:T.ColorRepresentation, o:T.MeshPhysicalMaterialParameters = {}) => new T.MeshPhysicalMaterial(Object.assign({ color: c, roughness: .4, clearcoat: .6, clearcoatRoughness: .25 }, o));
const hullTop = M(0xb4bfd0, { metalness: .15, roughness: .32, side: T.DoubleSide });
const hullBot = M(0x6d44c4, { roughness: .35, side: T.DoubleSide });
const skin = M(0x74e43a, { roughness: .38, clearcoat: .8 });
const mesh = (g:T.BufferGeometry, m:T.Material, p?:number[]|null, s?:number[]) => { const o = new T.Mesh(g, m); if (p) o.position.set(p[0],p[1],p[2]); if (s) o.scale.set(s[0],s[1],s[2]); return o; };
const smooth = (pts:number[][]) => new T.SplineCurve(pts.map(p => new T.Vector2(p[0],p[1]))).getPoints(36);
const outline = (m:T.Mesh) => { const o = new T.Mesh(m.geometry, new T.MeshBasicMaterial({ color: 0x0a2a33, side: T.BackSide })); o.scale.setScalar(1.045); m.add(o); };

const ship = new T.Group(); scene.add(ship);
/* saucer */
ship.add(mesh(new T.LatheGeometry(smooth([[2.55, 0], [2.5, .14], [2.2, .25], [1.6, .37], [1.1, .44], [.9, .46]]), 64), hullTop));
ship.add(mesh(new T.LatheGeometry(smooth([[.01, -.76], [.8, -.72], [1.5, -.56], [2.1, -.3], [2.5, -.08], [2.55, 0]]), 64), hullBot));
const band = mesh(new T.TorusGeometry(2.53, .09, 14, 90), M(0xe8edf5, { roughness: .3 }), [0, -.03, 0]); band.rotation.x = Math.PI / 2; ship.add(band);
for (let i = 0; i < 3; i++) { const a = Math.PI / 2 + i * Math.PI * 2 / 3; ship.add(mesh(new T.SphereGeometry(1, 24, 16), M(0xa9b6c9), [Math.cos(a) * 1.25, -.74, Math.sin(a) * 1.25], [.42, .3, .42])); }
/* lights */
const bulbs = [];
for (let i = 0; i < 9; i++) {
  const a = Math.PI * .1 + i * Math.PI * .8 / 8, r = 1.95 - Math.abs(i - 4) * .06;
  const m = new T.MeshStandardMaterial({ color: 0xffe21a, emissive: 0xffc800, emissiveIntensity: .8, roughness: .3 });
  const g = new T.Group(); g.position.set(Math.cos(a) * r, .3, Math.sin(a) * r); g.rotation.y = -a;
  g.add(mesh(new T.SphereGeometry(1, 20, 14), m, null, [.16, .09, .16]));
  const ring = mesh(new T.TorusGeometry(.17, .025, 8, 24), M(0xffffff), [0, .01, 0]); ring.rotation.x = Math.PI / 2; g.add(ring);
  ship.add(g); bulbs.push(m);
}
/* cockpit + dome */
ship.add(mesh(new T.CylinderGeometry(.92, .92, .12, 48, 1, true), M(0x5d6678, { side: T.DoubleSide }), [0, .42, 0]));
ship.add(mesh(new T.CircleGeometry(.92, 40), M(0x2f3646), [0, .38, 0])).children.at(-1)!.rotation.x = -Math.PI / 2;
const lip = mesh(new T.TorusGeometry(.95, .05, 12, 60), M(0xdfe5ee), [0, .47, 0]); lip.rotation.x = Math.PI / 2; ship.add(lip);

/* alien */
const alien = new T.Group(); alien.position.y = .08; ship.add(alien);
const torso = mesh(new T.SphereGeometry(1, 28, 20), skin, [0, .46, 0], [.34, .3, .3]); alien.add(torso);
const hands = [-1, 1].map(s => { const h = mesh(new T.SphereGeometry(.1, 16, 12), skin, [s * .62, .5, .55]); alien.add(h); return h; });
const head = new T.Group(); head.position.set(0, 1.0, 0); alien.add(head);
const skull = mesh(new T.SphereGeometry(1, 56, 40), skin, null, [.62, .58, .57]); head.add(skull); outline(skull);
const eyes = [-1, 1].map(s => {
  const g = new T.Group(); g.position.set(s * .22, -.05, .5); g.rotation.set(0, s * .32, -s * .12);
  g.add(mesh(new T.SphereGeometry(1, 32, 24), M(0x0d0f12, { roughness: .1, clearcoat: 1, clearcoatRoughness: .05 }), null, [.17, .21, .1]));
  g.add(mesh(new T.SphereGeometry(.04, 12, 10), new T.MeshBasicMaterial({ color: 0xffffff }), [.05, .09, .085]));
  g.add(mesh(new T.SphereGeometry(.018, 10, 8), new T.MeshBasicMaterial({ color: 0xffffff }), [-.06, -.07, .09]));
  head.add(g); return g;
});
const smile = mesh(new T.TorusGeometry(.12, .014, 8, 28, Math.PI), new T.MeshBasicMaterial({ color: 0x12301a }), [0, -.27, .5]); smile.rotation.z = Math.PI; head.add(smile);
const mouth = mesh(new T.SphereGeometry(1, 16, 12), new T.MeshBasicMaterial({ color: 0x12301a }), [0, -.29, .49], [.09, .02, .04]); mouth.visible = false; head.add(mouth);
head.add(mesh(new T.SphereGeometry(.07, 12, 10), new T.MeshBasicMaterial({ color: 0xc8ffa6, transparent: true, opacity: .55 }), [-.22, .34, .44])); // head shine
/* dome */
const dome = mesh(new T.SphereGeometry(1, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2), M(0x66ccff, { transparent: true, opacity: .32, roughness: .04, clearcoat: 1, side: T.DoubleSide, depthWrite: false, emissive: 0x2a8fd0, emissiveIntensity: .25 }), [0, .46, 0], [1.02, 1.25, 1.02]);
ship.add(dome);
[[-.62, 1.2, .45, .3, .05], [-.78, .95, .3, .12, .05]].forEach(([x, y, z, h, w]) => { const g = mesh(new T.SphereGeometry(1, 12, 10), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .75 }), [x, y, z], [w, h, .02]); g.rotation.z = .35; ship.add(g); });
/* tractor beam */
const beam = mesh(new T.CylinderGeometry(.6, 1.6, 3.2, 40, 1, true), new T.MeshBasicMaterial({ color: 0x9b8cff, transparent: true, opacity: .12, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }), [0, -2.3, 0]);
ship.add(beam);

return {ship,head,hands,eyes,smile,mouth,bulbs,beam};
}

export default function BlipModel({motion,talking}:{motion:boolean;talking:boolean}){
  const mount=useRef<HTMLDivElement>(null),live=useRef({motion,talking});live.current={motion,talking};
  const [failed,setFailed]=useState(false);
  useEffect(()=>{
    const host=mount.current;if(!host)return;
    let renderer:T.WebGLRenderer;
    try{renderer=new T.WebGLRenderer({antialias:true,alpha:true});}catch{setFailed(true);return;}
    host.appendChild(renderer.domElement);renderer.setPixelRatio(Math.min(devicePixelRatio,1.4));renderer.outputColorSpace=T.SRGBColorSpace;
    const scene=new T.Scene(),camera=new T.PerspectiveCamera(32,1,.1,100);
    scene.add(new T.HemisphereLight(0xdff0ff,0x3a2a7a,.85));
    const key=new T.DirectionalLight(0xffffff,1);key.position.set(3,6,7);scene.add(key);
    const rim=new T.PointLight(0x7fe8ff,1.4,25);rim.position.set(-5,3,-3);scene.add(rim);
    const under=new T.PointLight(0x9b6bff,1.6,12);under.position.set(0,-2.5,2);scene.add(under);
    const {ship,head,hands,eyes,smile,mouth,bulbs,beam}=suppliedUfo(scene);
    const look={x:0,y:0};let frame=0,elapsed=0,last=performance.now(),open=0,visible=true;
    const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.set(0,2,Math.max(10,6.4/(2*Math.tan(16*Math.PI/180)*camera.aspect)));camera.lookAt(0,.3,0);camera.updateProjectionMatrix();};
    const resized=new ResizeObserver(resize);resized.observe(host);resize();
    const observed=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;last=performance.now();});observed.observe(host);
    const pointer=(e:PointerEvent)=>{look.x=(e.clientX/innerWidth-.5)*2;look.y=(e.clientY/innerHeight-.5)*2;};window.addEventListener('pointermove',pointer,{passive:true});
    const lost=(event:Event)=>{event.preventDefault();setFailed(true);};renderer.domElement.addEventListener('webglcontextlost',lost);
    const tick=(now:number)=>{
      frame=requestAnimationFrame(tick);const dt=Math.min((now-last)/1000,.1);last=now;if(document.hidden||!visible)return;
      const moving=live.current.motion;if(moving)elapsed+=dt;const t=elapsed;
      const speaking=moving&&live.current.talking,target=speaking?Math.max(0,.5+.5*Math.sin(t*14)*Math.sin(t*5.3)):0;open+=(target-open)*.35;
      mouth.visible=open>.08;smile.visible=!mouth.visible;mouth.scale.set(.1-.03*open,.02+.13*open,.04);
      ship.position.y=moving?Math.sin(t*1.5)*.12:0;
      ship.rotation.z+=((moving?-look.x*.1+Math.sin(t*1.1)*.02:0)-ship.rotation.z)*.06;
      ship.rotation.x+=((moving?look.y*.06:0)-ship.rotation.x)*.06;
      head.rotation.y+=((moving?look.x*.5:0)-head.rotation.y)*.08;head.rotation.x+=((moving?look.y*.25:0)-head.rotation.x)*.08;
      head.position.y=1+open*.02;hands.forEach((h,i)=>h.position.y=.5+(speaking?Math.abs(Math.sin(t*9+i*2))*.08:0));
      bulbs.forEach((m,i)=>m.emissiveIntensity=.5+(moving?.9*Math.max(0,Math.sin(t*(speaking?9:2.2)-i*.7)):0));
      beam.material.opacity=.1+(speaking?.08+open*.1:0)+(moving?Math.sin(t*2)*.015:0);
      const blink=moving?Math.max(0,1-Math.abs(t%4.3-3.8)/.13):0;eyes.forEach(e=>e.scale.y=1-.85*Math.sin(blink*Math.PI));
      renderer.render(scene,camera);
    };frame=requestAnimationFrame(tick);
    return()=>{cancelAnimationFrame(frame);resized.disconnect();observed.disconnect();window.removeEventListener('pointermove',pointer);renderer.domElement.removeEventListener('webglcontextlost',lost);const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();scene.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();};
  },[]);
  return <div ref={mount} className="blip-model" role="img" aria-label="Blip, the animated 3D UFO mascot from your supplied file" data-source="3d.zip/mascot-ufo.html">{failed&&<span className="blip-fallback">Blip</span>}</div>;
}
