import { createElement, useEffect, useRef, useState } from 'react';
import resources from './assets.json';
import type { Artifact } from './data';
export type Asset = {file:string;source:string;kind:string;download:string;bytes:number;sha256:string;retrieved:string;caption?:string};
export const assetLibrary:Record<string,Record<string,Asset>>=resources;
export function assetFor(artifact:Artifact){return assetLibrary[artifact.assetKey??artifact.id]??{};}
// model-viewer can fail before dispatching an error when WebGL2 is absent.
// Detect that case before importing it, then keep the NASA photograph usable.
const webGLAvailable=(()=>{
  try{
    const gl=document.createElement('canvas').getContext('webgl2');
    if(!gl)return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  }catch{return false;}
})();
export default function Model({artifact}:{artifact:Artifact}){
  const asset=assetFor(artifact);
  const element=useRef<HTMLElement>(null);
  const [failed,setFailed]=useState(!webGLAvailable);
  const [loaded,setLoaded]=useState(false);
  useEffect(()=>{
    setFailed(!webGLAvailable);setLoaded(false);
    if(!asset.model||!webGLAvailable)return;
    let active=true;
    import('@google/model-viewer').catch(()=>{if(active)setFailed(true);});
    const current=element.current;
    const ready=()=>setLoaded(true),error=()=>setFailed(true);
    current?.addEventListener('load',ready);current?.addEventListener('error',error);
    return()=>{active=false;current?.removeEventListener('load',ready);current?.removeEventListener('error',error);};
  },[artifact.id,asset.model]);
  const image=asset.photo??asset.preview;
  return <figure className={`artifact-media ${asset.model&&!failed?'is-model':''}`}>
    {asset.model&&!failed ? <>
      {createElement('model-viewer',{
        ref:element,src:asset.model.file,poster:asset.preview?.file,
        alt:`NASA reference 3D model of ${artifact.name}. ${artifact.modelNote??'Reference geometry, not a real-time spacecraft view.'}`,
        'camera-controls':true,'touch-action':'pan-y','interaction-prompt':'none','shadow-intensity':'0','exposure':'1.4',
        'camera-orbit':'35deg 65deg auto','field-of-view':'30deg','loading':'eager','reveal':'auto',
      })}
      {!loaded&&<span className="media-loading" role="status">Preparing NASA model…</span>}
      <span className="media-tag">NASA 3D reference · drag to inspect</span>
    </> : image ? <><img src={image.file} width="1280" height="960" alt={image.caption??`${artifact.name} — NASA published mission image; may be an artist concept. See the original image record.`}/><span className="media-tag">{image.kind.includes('artist concept')?'NASA artist concept':image.kind.includes('illustration')?'NASA illustration':'NASA archival image'}</span></> : <div className="media-unavailable">Mission record available. No verified image bundled.</div>}
    <figcaption>{(!asset.model||failed)&&image?.caption&&<span>{image.caption}</span>}<a href={(asset.model&&!failed?asset.model:image)?.source??artifact.sources[0].url} target="_blank" rel="noreferrer">Original NASA asset & credits ↗</a>{failed&&<span>3D unavailable; showing the NASA image instead.</span>}</figcaption>
  </figure>;
}
