import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const restore=process.argv.includes('--restore');
const registry=JSON.parse(await readFile(new URL('../src/assets.json',import.meta.url),'utf8'));
const root=resolve(fileURLToPath(new URL('../public',import.meta.url)));
let checked=0,downloaded=0;
for(const [id,group] of Object.entries(registry))for(const [kind,asset] of Object.entries(group)){
  const path=resolve(root,'.'+asset.file);
  if(!path.startsWith(root+sep))throw new Error(`Invalid asset path: ${asset.file}`);
  const valid=bytes=>bytes.length===asset.bytes&&createHash('sha256').update(bytes).digest('hex')===asset.sha256;
  let existing;try{existing=await readFile(path);}catch(error){if(error.code!=='ENOENT')throw error;}
  if(existing&&valid(existing)){checked++;continue;}
  if(!restore)throw new Error(`${asset.file} is missing or changed. Run npm run assets:restore to restore the pinned original.`);
  const url=new URL(asset.download);
  if(url.protocol!=='https:'||!(url.hostname.endsWith('.nasa.gov')||url.hostname==='raw.githubusercontent.com'))throw new Error(`Unapproved asset host: ${url.hostname}`);
  const response=await fetch(url,{signal:AbortSignal.timeout(90000)});
  if(!response.ok)throw new Error(`HTTP ${response.status}: ${id}/${kind}`);
  const bytes=Buffer.from(await response.arrayBuffer());
  if(!valid(bytes))throw new Error(`Upstream asset changed: ${asset.file}. Original preserved; review the source before updating its checksum.`);
  await mkdir(dirname(path),{recursive:true});await writeFile(path,bytes);downloaded++;checked++;
  console.log('RESTORED',asset.file);
}
console.log(`Verified ${checked} NASA assets; restored ${downloaded}. Font and Draco licenses are in docs/.`);
