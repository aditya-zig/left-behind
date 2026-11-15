import images from './photography.json';
import Model,{assetFor} from './Model';
import {findArtifact,type Artifact} from './data';
import type {SurfaceSite} from './atlas';
export type NasaPhoto={file:string;source:string;download:string;caption:string;width:number;height:number;bytes:number;sha256:string;retrieved:string;display?:{file:string;download:string;width:number;height:number;bytes:number;sha256:string}};
export const nasaPhotos:Record<string,NasaPhoto>=images;
const aliases:Record<string,string>={'apollo12-lm':'surveyor',insight:'insight-seismometer',ingenuity:'ingenuity-shadow'};
export function photoFor(id:string){return nasaPhotos[aliases[id]??id];}
export function brief(text:string,count=1){return text.split(/(?<=[.!?])\s+(?=[A-Z])/).slice(0,count).join(' ');}
export function NasaPhotograph({photo,className=''}:{photo:NasaPhoto;className?:string}){return <figure className={`nasa-photograph ${className}`}><a href={photo.download} target="_blank" rel="noreferrer" aria-label={`Open full-resolution NASA image: ${photo.caption}`}><img src={photo.display?.file??photo.file} width={photo.display?.width??photo.width} height={photo.display?.height??photo.height} alt={photo.caption} loading="lazy"/></a><figcaption><a href={photo.source} target="_blank" rel="noreferrer">{photo.caption} ↗</a></figcaption></figure>;}
export function SurfaceVisual({site,item,motion=false}:{site?:SurfaceSite;item?:Artifact;motion?:boolean}){
 const artifact=item??(site?.artifactId?findArtifact(site.artifactId):undefined),photo=photoFor(site?.id??artifact?.id??'');
 if(artifact&&assetFor(artifact).model)return <Model artifact={artifact} autoRotate={motion}/>;
 if(photo)return <NasaPhotograph photo={photo}/>;
 return artifact?<Model artifact={artifact}/>:null;
}
