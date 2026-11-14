import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { worlds } from './data';
import type { Artifact } from './data';

type Pin = { id: string; name: string; x: number; y: number; visible: boolean };
type Props = { world: 'moon'|'mars'; selected?: Artifact; items?: Artifact[]; onSelect?: (id:string)=>void; hero?: boolean; mode?:'globe'|'terrain' };
const noItems: Artifact[] = [];
export default function Scene({world,selected,items=noItems,onSelect,hero=false,mode='globe'}:Props) {
  const host=useRef<HTMLDivElement>(null);
  const controlsRef=useRef<{ zoom:(factor:number)=>void; reset:()=>void; focus:(coordinates:[number,number])=>void }|null>(null);
  const [pins,setPins]=useState<Pin[]>([]);
  const [state,setState]=useState<'loading'|'ready'|'error'>('loading');
  const selection=useRef(selected);
  selection.current=selected;
  useEffect(()=>{
    const element=host.current;
    if(!element)return;
    let disposed=false;
    let renderer:THREE.WebGLRenderer;
    setState('loading');setPins([]);
    try {renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}
    catch {setState('error');return;}
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    element.prepend(renderer.domElement);
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(35,1,0.01,100);
    const toVector=(latitude:number,longitude:number,r=1.015)=>{
      const lat=THREE.MathUtils.degToRad(latitude),lon=THREE.MathUtils.degToRad(longitude);
      return new THREE.Vector3(Math.cos(lat)*Math.cos(lon)*r,Math.sin(lat)*r,-Math.cos(lat)*Math.sin(lon)*r);
    };
    const initial=mode==='terrain'?new THREE.Vector3(0,2.5,2.3):toVector(...(selection.current?.coordinates ?? [12,world==='moon'?10:0]),hero?3.05:3.4);
    camera.position.copy(initial);
    const controls=new OrbitControls(camera,renderer.domElement);
    controls.enableDamping=false;controls.enablePan=mode==='terrain';controls.enableZoom=!hero;
    controls.minDistance=mode==='terrain'?1:1.5;controls.maxDistance=6;
    controls.autoRotate=false;
    scene.add(new THREE.AmbientLight(0xffffff,1.35));
    const sunlight=new THREE.DirectionalLight(0xf2f4ff,3.1);
    sunlight.position.set(4,3,5);scene.add(sunlight);
    const objects:THREE.BufferGeometry[]=[];const materials:THREE.Material[]=[];const textures:THREE.Texture[]=[];
    const render=()=>{
      if(disposed)return;
      renderer.render(scene,camera);
      if(!hero && mode==='globe'){
        const w=element.clientWidth,h=element.clientHeight;
        const look=camera.position.clone().normalize();
        setPins(items.filter(a=>a.coordinates).map(a=>{
          const p=toVector(...a.coordinates!);const front=p.clone().normalize().dot(look)>0.24;
          const screen=p.project(camera);
          return {id:a.id,name:a.name,x:(screen.x+1)*w/2,y:(1-screen.y)*h/2,visible:front&&screen.z<1};
        }));
      }
    };
    const resize=()=>{const w=element.clientWidth,h=element.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();render();};
    const observer=new ResizeObserver(resize);observer.observe(element);
    controls.addEventListener('change',render);
    const onKey=(event:KeyboardEvent)=>{
      const keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','=','Home'];
      if(!keys.includes(event.key))return;
      event.preventDefault();
      const v=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
      if(event.key==='ArrowLeft')v.theta-=0.15;
      if(event.key==='ArrowRight')v.theta+=0.15;
      if(event.key==='ArrowUp')v.phi-=0.15;
      if(event.key==='ArrowDown')v.phi+=0.15;
      if(event.key==='+'||event.key==='=')v.radius=Math.max(controls.minDistance,v.radius*0.85);
      if(event.key==='-')v.radius=Math.min(controls.maxDistance,v.radius*1.15);
      v.makeSafe();camera.position.setFromSpherical(v).add(controls.target);
      if(event.key==='Home'){controls.target.set(0,0,0);camera.position.copy(initial);}
      controls.update();render();
    };
    element.addEventListener('keydown',onKey);
    controlsRef.current={zoom:(f)=>{camera.position.sub(controls.target).multiplyScalar(f).clampLength(controls.minDistance,controls.maxDistance).add(controls.target);controls.update();render();},reset:()=>{camera.position.copy(initial);controls.target.set(0,0,0);controls.update();render();},focus:(coordinates)=>{if(mode!=='globe')return;camera.position.copy(toVector(...coordinates,camera.position.length()));controls.target.set(0,0,0);controls.update();render();}};
    if(mode==='globe'){
      const texture=new THREE.TextureLoader().load(worlds[world].texture,()=>{if(!disposed){setState('ready');render();}},undefined,()=>{if(!disposed)setState('error');});
      texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);
      const geometry=new THREE.SphereGeometry(1,96,64);objects.push(geometry);
      const material=new THREE.MeshStandardMaterial({map:texture,roughness:1,metalness:0});materials.push(material);
      scene.add(new THREE.Mesh(geometry,material));
    }else{
      new STLLoader().load(worlds[world].terrain,(geometry)=>{
        if(disposed){geometry.dispose();return;}
        geometry.computeVertexNormals();geometry.center();
        // NASA printing-model orientation is Z-up. Preserve the supplied relief.
        geometry.rotateX(-Math.PI/2);geometry.computeBoundingBox();
        const size=new THREE.Vector3();geometry.boundingBox!.getSize(size);
        geometry.scale(2.3/Math.max(size.x,size.y,size.z),2.3/Math.max(size.x,size.y,size.z),2.3/Math.max(size.x,size.y,size.z));
        objects.push(geometry);
        const material=new THREE.MeshStandardMaterial({color:world==='moon'?0xa7a8ac:0x9b6852,roughness:1,side:THREE.DoubleSide});materials.push(material);
        scene.add(new THREE.Mesh(geometry,material));setState('ready');render();
      },undefined,()=>{if(!disposed)setState('error');});
    }
    resize();
    const onLoss=(event:Event)=>{event.preventDefault();setState('error');};
    renderer.domElement.addEventListener('webglcontextlost',onLoss);
    return()=>{disposed=true;observer.disconnect();element.removeEventListener('keydown',onKey);controls.dispose();objects.forEach(x=>x.dispose());materials.forEach(x=>x.dispose());textures.forEach(x=>x.dispose());renderer.domElement.removeEventListener('webglcontextlost',onLoss);renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();controlsRef.current=null;};
  },[world,mode,hero,items]);
  useEffect(()=>{if(selected?.coordinates)controlsRef.current?.focus(selected.coordinates);},[selected?.id,world,mode]);
  return <div className={`scene-wrap ${hero?'hero-scene':''}`}>
    <div ref={host} className="scene" tabIndex={hero?-1:0} role="group" aria-label={`${worlds[world].name} ${mode==='globe'?'globe':'NASA landing-site terrain'}. Drag to orbit, scroll to zoom. Keyboard: arrows to rotate, plus or minus to zoom, Home to reset.`}>
      {state==='loading'&&<div className="scene-message" role="status">Loading NASA {mode==='globe'?'surface imagery':'terrain'}…</div>}
      {state==='error'&&<div className="scene-message error-message"><p>3D isn’t available on this device.</p><p>The full collection and mission stories are still available below.</p><a href={worlds[world].trek} target="_blank" rel="noreferrer">Open NASA {worlds[world].name} Trek ↗</a></div>}
      {state==='ready'&&pins.filter(p=>p.visible).map(p=><button key={p.id} className={`map-pin ${selected?.id===p.id?'selected':''}`} style={{left:p.x,top:p.y}} onClick={()=>onSelect?.(p.id)} aria-label={`Open ${p.name}`} title={p.name}><span/>{selected?.id===p.id&&<strong>{p.name}</strong>}</button>)}
    </div>
    {!hero&&state!=='error'&&<div className="scene-navigation" aria-label="3D view controls"><button onClick={()=>controlsRef.current?.zoom(0.8)} aria-label="Zoom in">+</button><button onClick={()=>controlsRef.current?.zoom(1.25)} aria-label="Zoom out">−</button><button onClick={()=>controlsRef.current?.reset()} aria-label="Reset 3D view">↺</button></div>}
  </div>;
}
