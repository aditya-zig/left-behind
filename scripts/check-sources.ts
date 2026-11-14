import {artifacts,challengeUrl} from '../src/data';
import {writeFile,mkdir} from 'node:fs/promises';
const urls=[...new Set([challengeUrl,...artifacts.flatMap(a=>a.sources.map(s=>s.url)),'https://svs.gsfc.nasa.gov/4720/','https://github.com/nasa/NASA-3D-Resources','https://www.nasa.gov/nasa-brand-center/images-and-media/'])];
const results:{url:string;status:number|string;title?:string;finalUrl?:string}[]=[];
for(let i=0;i<urls.length;i+=4)await Promise.all(urls.slice(i,i+4).map(async url=>{
  try{
    const response=await fetch(url,{signal:AbortSignal.timeout(30000),headers:{'User-Agent':'LeftBehind-SourceCheck/1.0 (educational NASA source availability check)'}});
    const text=await response.text();
    const result={url,status:response.status,title:text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1].replace(/\s+/g,' ').trim(),finalUrl:response.url};
    results.push(result);console.log(response.status,url,result.title??'');
  }catch(error){results.push({url,status:error instanceof Error?error.message:String(error)});console.error('UNAVAILABLE',url);}
}));
await mkdir('test-results',{recursive:true});
await writeFile('test-results/source-availability.json',JSON.stringify({checked:new Date().toISOString(),note:'HTTP availability only, not scientific verification.',results},null,2));
if(results.some(r=>r.status!==200))process.exitCode=1;
