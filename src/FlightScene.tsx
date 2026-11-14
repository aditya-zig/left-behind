import {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {type Artifact} from './data';
import {sitesFor,type SurfaceSite} from './atlas';
import {flightEase} from './cinematic';

export type FlightMode='galaxy'|'solar'|'earth'|'choose'|'moon'|'mars';
export type World='moon'|'mars';
type Props={mode:FlightMode;selected:Artifact;focusSite:SurfaceSite|null;motion:boolean;previewing:boolean;reset:number;onReady:()=>void;onArrive:()=>void;onUnavailable:()=>void;onSiteSelect:(site:SurfaceSite)=>void};
const sites={moon:sitesFor('moon'),mars:sitesFor('mars')};
const centers={earth:new THREE.Vector3(0,0,0),moon:new THREE.Vector3(22,0,0),mars:new THREE.Vector3(53,1,-10)};
const radii={earth:8,moon:3.8,mars:6};
const direction=(lat:number,lon:number)=>new THREE.Vector3(Math.cos(lat*Math.PI/180)*Math.cos(lon*Math.PI/180),Math.sin(lat*Math.PI/180),-Math.cos(lat*Math.PI/180)*Math.sin(lon*Math.PI/180));
// The scientific graticule is a coordinate overlay, not fabricated NASA imagery.

export default function FlightScene(props:Props){
  const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLDivElement>(null);
  const latest=useRef(props);latest.current=props;
  const pinRefs=useRef(new Map<string,HTMLDivElement>());
  const commands=useRef<{aim:()=>void;zoom:(n:number)=>void}|null>(null);
  const [error,setError]=useState(false),[ready,setReady]=useState(false);
  useEffect(()=>{
    if(!host.current||!canvas.current)return;
    const container=host.current;
    let renderer:THREE.WebGLRenderer;
    try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});}catch{setError(true);latest.current.onReady();latest.current.onArrive();latest.current.onUnavailable();return;}
    // Each effect owns its canvas. StrictMode teardown must not lose the next effect's context.
    canvas.current.appendChild(renderer.domElement);setError(false);
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;
    const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(38,1,.08,10000);
    camera.position.set(0,150,1700);
    const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.055;controls.enablePan=false;controls.rotateSpeed=.45;controls.zoomSpeed=.6;controls.autoRotateSpeed=.35;
    const textures:THREE.Texture[]=[];const loader=new THREE.TextureLoader();let alive=true,frame=0,visible=true,aiming=true,arrived=false,last=performance.now(),readyCount=0;
    const goalPosition=new THREE.Vector3(),goalTarget=new THREE.Vector3(),fromPosition=new THREE.Vector3(),fromTarget=new THREE.Vector3();let flightElapsed=0;
    const load=(url:string)=>{const t=loader.load(url,()=>{if(!alive)return;readyCount++;if(readyCount>=3){setReady(true);latest.current.onReady();}},undefined,()=>{if(!alive)return;readyCount++;if(readyCount>=3){setReady(true);latest.current.onReady();}});t.colorSpace=THREE.SRGBColorSpace;textures.push(t);return t;};
    const stars=new THREE.Mesh(new THREE.SphereGeometry(4500,48,24),new THREE.MeshBasicMaterial({map:load('/assets/stars.jpg'),side:THREE.BackSide,transparent:true,opacity:.4,depthWrite:false}));scene.add(stars);
    const galaxyMaterial=new THREE.MeshBasicMaterial({map:load('/assets/galaxy.jpg'),transparent:true,depthWrite:false});
    const galaxy=new THREE.Mesh(new THREE.PlaneGeometry(1800,1800),galaxyMaterial);galaxy.position.set(0,0,-200);galaxy.rotation.z=-.18;scene.add(galaxy);
    const planets=new THREE.Group();scene.add(planets);
    scene.add(new THREE.AmbientLight(0xc5d7ed,1.6));const sunlight=new THREE.DirectionalLight(0xfff6e7,3.3);sunlight.position.set(-45,25,70);scene.add(sunlight);
    const meshes={} as Record<'earth'|World,THREE.Mesh>;
    (['earth','moon','mars'] as const).forEach(name=>{
      const texture=load(`/assets/${name==='moon'?'moon-map':name}.jpg`);
      const mesh=new THREE.Mesh(new THREE.SphereGeometry(radii[name],96,64),new THREE.MeshStandardMaterial({map:texture,roughness:1,metalness:0}));mesh.position.copy(centers[name]);meshes[name]=mesh;planets.add(mesh);
    });
    const grids=new Map<World,THREE.LineSegments>();
    for(const body of ['moon','mars'] as const){
      const points:number[]=[],r=radii[body]*1.003;
      const segment=(a:THREE.Vector3,b:THREE.Vector3)=>{points.push(a.x,a.y,a.z,b.x,b.y,b.z);};
      for(const lat of [-60,-30,0,30,60])for(let lon=-180;lon<180;lon+=5)segment(direction(lat,lon).multiplyScalar(r),direction(lat,lon+5).multiplyScalar(r));
      for(let lon=-180;lon<180;lon+=30)for(let lat=-90;lat<90;lat+=5)segment(direction(lat,lon).multiplyScalar(r),direction(lat+5,lon).multiplyScalar(r));
      const grid=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(points,3)),new THREE.LineBasicMaterial({color:0xb4c9d8,transparent:true,opacity:.17}));grid.position.copy(centers[body]);scene.add(grid);grids.set(body,grid);
    }
    const sun=new THREE.Sprite(new THREE.SpriteMaterial({map:load('/assets/sun-sdo.jpg'),blending:THREE.AdditiveBlending,depthWrite:false}));sun.scale.set(38,33.6,1);sun.position.set(-80,2,-30);planets.add(sun);
    const aim=()=>{
      const {mode,selected,focusSite}=latest.current;arrived=false;aiming=true;flightElapsed=0;
      controls.autoRotate=false;controls.enableDamping=false;controls.update();controls.enableDamping=latest.current.motion;
      fromPosition.copy(camera.position);fromTarget.copy(controls.target);controls.minDistance=.1;controls.maxDistance=5000;
      if(mode==='galaxy'){goalPosition.set(0,65,780);goalTarget.set(0,0,-200);}
      else if(mode==='solar'){goalPosition.set(32,60,170);goalTarget.set(10,0,-8);}
      else if(mode==='earth'){goalPosition.set(13,4,26);goalTarget.copy(centers.earth);}
      else if(mode==='choose'){goalPosition.set(34,13,62);goalTarget.set(35,0,-5);}
      else{
        const center=centers[mode],r=radii[mode];
        const w=container.clientWidth,distance=w<600?3.8:w<1000?3.8:3.25;
        goalTarget.copy(center);goalPosition.copy(center).add(direction(...(focusSite?.coordinates??selected.coordinates??[0,0])).multiplyScalar(r*distance));
      }
      if(!latest.current.motion){camera.position.copy(goalPosition);controls.target.copy(goalTarget);aiming=false;}
    };
    commands.current={aim,zoom:n=>{const delta=camera.position.clone().sub(controls.target);delta.multiplyScalar(n);delta.clampLength(controls.minDistance,controls.maxDistance);camera.position.copy(controls.target).add(delta);}};aim();
    const resize=()=>{
      const w=container.clientWidth,h=container.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;
      if(w>1000)camera.setViewOffset(w,h,-w*.14,0,w,h);else camera.clearViewOffset();
      camera.updateProjectionMatrix();
    };
    const observer=new ResizeObserver(resize);observer.observe(container);resize();
    const viewObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;last=performance.now();},{threshold:.01});viewObserver.observe(container);
    const resetClock=()=>{last=performance.now();};document.addEventListener('visibilitychange',resetClock);
    const onContextLost=(event:Event)=>{event.preventDefault();if(alive){setError(true);latest.current.onReady();latest.current.onArrive();latest.current.onUnavailable();}};renderer.domElement.addEventListener('webglcontextlost',onContextLost);
    const tick=(now:number)=>{
      frame=requestAnimationFrame(tick);const elapsed=Math.max(0,(now-last)/1000),dt=Math.min(elapsed,.05);last=now;
      if(!alive||document.hidden||!visible)return;
      const {mode,motion,previewing}=latest.current,isSurface=mode==='moon'||mode==='mars';
      planets.visible=mode!=='galaxy';for(const [body,grid] of grids)grid.visible=mode===body;
      for(const body of ['earth','moon','mars'] as const)meshes[body].visible=!isSurface||aiming||body===mode;
      sun.visible=!isSurface||aiming;
      const opacityGoal=mode==='galaxy'?1:0;galaxyMaterial.opacity=THREE.MathUtils.damp(galaxyMaterial.opacity,opacityGoal,2,elapsed);galaxy.visible=galaxyMaterial.opacity>.004;
      if(aiming){
        // Duration follows visible wall-clock time, not frame count: slow GPUs still arrive.
        flightElapsed+=elapsed;const progress=motion?flightEase(flightElapsed):1;
        camera.position.lerpVectors(fromPosition,goalPosition,progress);controls.target.lerpVectors(fromTarget,goalTarget,progress);
        if(progress===1)aiming=false;
      }
      if(!aiming&&!arrived){arrived=true;latest.current.onArrive();}
      controls.enabled=isSurface&&!aiming;controls.enableDamping=motion;controls.autoRotate=isSurface&&motion&&!previewing&&!aiming;
      if(isSurface&&!aiming){controls.minDistance=radii[mode]*1.4;controls.maxDistance=radii[mode]*7;}
      controls.update(elapsed);
      if(!isSurface&&motion){meshes.earth.rotation.y+=dt*.025;meshes.mars.rotation.y+=dt*.02;}
      if(isSurface){meshes[mode].rotation.y=0;}
      const currentCenter=isSurface?centers[mode]:centers.moon;
      const towardCamera=camera.position.clone().sub(currentCenter).normalize();
      for(const body of ['moon','mars'] as const){
        sites[body].forEach(item=>{
          const pin=pinRefs.current.get(item.id);if(!pin)return;
          const normal=direction(...(item.coordinates??[0,0]));const p=normal.clone().multiplyScalar(radii[body]*1.006).add(centers[body]);
          const front=mode===body&&!aiming&&normal.dot(towardCamera)>.15;
          p.project(camera);const x=(p.x*.5+.5)*container.clientWidth,y=(-p.y*.5+.5)*container.clientHeight;
          const shown=front&&p.z<1&&x>24&&x<container.clientWidth-24&&y>50&&y<container.clientHeight-40;
          pin.dataset.visible=String(shown);pin.setAttribute('aria-hidden',String(!shown));const button=pin.querySelector('button');if(button)button.tabIndex=shown?0:-1;
          pin.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
        });
      }
      renderer.render(scene,camera);
    };frame=requestAnimationFrame(tick);
    return()=>{
      alive=false;cancelAnimationFrame(frame);observer.disconnect();viewObserver.disconnect();document.removeEventListener('visibilitychange',resetClock);commands.current=null;controls.dispose();renderer.domElement.removeEventListener('webglcontextlost',onContextLost);
      scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.LineSegments){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}else if(o instanceof THREE.Sprite)o.material.dispose();});textures.forEach(t=>t.dispose());renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
    };
  },[]);
  useEffect(()=>{commands.current?.aim();},[props.mode,props.selected.id,props.focusSite?.id,props.reset]);
  const isWorld=props.mode==='moon'||props.mode==='mars';
  return <div ref={host} className={`flight-scene ${error?'scene-fallback':''}`} data-ready={ready||error}>
    <div ref={canvas} className="flight-canvas" aria-label="Interactive NASA-textured worlds. Use the mission list for every landing site." tabIndex={isWorld?0:-1} onKeyDown={event=>{
      if(event.key==='+'||event.key==='='){commands.current?.zoom(.85);event.preventDefault();}if(event.key==='-'){commands.current?.zoom(1.18);event.preventDefault();}if(event.key==='Home'){commands.current?.aim();event.preventDefault();}
    }}/>
    {error&&<div className="flight-fallback"><img src={props.mode==='mars'?'/assets/mars.jpg':props.mode==='moon'?'/assets/moon-map.jpg':'/assets/galaxy.jpg'} alt="NASA reference imagery"/><p>3D is unavailable on this device. Every mission, NASA image and story is still available below.</p></div>}
    {!error&&(['moon','mars'] as const).flatMap(body=>sites[body].map(item=><div key={item.id} ref={el=>{if(el)pinRefs.current.set(item.id,el);else pinRefs.current.delete(item.id);}} className={`orbital-hotspot ${(props.focusSite?.id??props.selected.id)===item.id?'selected':''} ${item.artifactId?'story-site':'context-site'}`} data-visible="false" aria-hidden="true">
      <button className="orbital-pin" tabIndex={-1} aria-label={`Explore ${item.name}`} title={`${item.name} · ${item.kind}`} onClick={()=>props.onSiteSelect(item)}><span className="site-dot"/><span className="site-name">{item.name}</span></button>
    </div>))}
    {isWorld&&!error&&<div className="flight-map-controls glass" aria-label="Globe controls"><button aria-label="Zoom in" onClick={()=>commands.current?.zoom(.82)}>+</button><button aria-label="Zoom out" onClick={()=>commands.current?.zoom(1.2)}>−</button><button aria-label="Recenter globe" onClick={()=>commands.current?.aim()}>⌖</button></div>}
  </div>;
}
