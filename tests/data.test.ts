import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { artifacts, findArtifact, nextTourId, searchArtifacts, tourIds, worldArtifacts, worlds } from '../src/data';
import registry from '../src/assets.json';

test('complete collection has unique IDs and separates off-world destinations',()=>{
  assert.equal(artifacts.length,18);
  assert.equal(new Set(artifacts.map(a=>a.id)).size,18);
  assert.equal(worldArtifacts('moon').length,5);
  assert.equal(worldArtifacts('mars').length,8);
  assert.equal(worldArtifacts('beyond').length,5);
  for(const a of artifacts){
    assert.ok(a.sources.length>0,a.id);
    assert.ok(a.story.split(/\s+/).length>=55,a.id);
    for(const s of a.sources){
      const host=new URL(s.url).hostname;
      assert.ok(host==='nasa.gov'||host.endsWith('.nasa.gov'),s.url);
      assert.ok(s.supports.length>15);
    }
    if(a.world==='beyond')assert.equal(a.coordinates,undefined,a.id);
    else {assert.ok(a.coordinates,a.id);assert.ok(Math.abs(a.coordinates[0])<=90);assert.ok(Math.abs(a.coordinates[1])<=180);}
    assert.ok(a.locationNote.length>25);
    assert.ok(a.statusDetail.length>25);
  }
});

test('guided journey has five distinct spotlights per world and terminates',()=>{
  assert.equal(tourIds.length,10);assert.equal(new Set(tourIds).size,10);
  for(const id of tourIds)assert.equal(findArtifact(id)?.featured,true);
  assert.equal(tourIds.slice(0,5).every(id=>findArtifact(id)?.world==='moon'),true);
  assert.equal(tourIds.slice(5).every(id=>findArtifact(id)?.world==='mars'),true);
  for(let i=0;i<9;i++)assert.equal(nextTourId(tourIds[i]),tourIds[i+1]);
  assert.equal(nextTourId('viking1'),null);
  assert.equal(nextTourId('missing'),null);
});

test('search is case-insensitive, whitespace tolerant and world scoped',()=>{
  assert.equal(searchArtifacts('  VIKING  ').length,2);
  assert.equal(searchArtifacts('rover','moon').length,1);
  assert.equal(searchArtifacts('Ceres','beyond')[0]?.id,'dawn');
  assert.equal(searchArtifacts('not a real mission').length,0);
  assert.equal(findArtifact('missing'),undefined);
});

test('important scientific distinctions remain in the record',()=>{
  assert.match(findArtifact('opportunity')!.statusDetail,/10 June 2018.*13 February 2019/);
  assert.match(findArtifact('opportunity')!.discovery,/not a detection of life/);
  assert.match(findArtifact('reflector')!.statusDetail,/2019.*not a live/);
  assert.match(findArtifact('eagle')!.modelNote!,/complete.*ascent stage.*Only the descent/);
  assert.match(findArtifact('ingenuity')!.statusDetail,/18 January 2024.*25 January/);
  assert.match(findArtifact('kepler')!.location,/around the Sun/);
});

test('every bundled NASA asset exists and matches its provenance checksum',()=>{
  let checked=0;
  for(const [id,group] of Object.entries(registry))for(const [type,asset] of Object.entries(group)){
    const path=`public${asset.file}`;
    assert.ok(existsSync(path),`${id}/${type}: ${path}`);
    const bytes=readFileSync(path);
    assert.equal(bytes.length,asset.bytes,path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,path);
    const host=new URL(asset.download).hostname;
    assert.ok(host.endsWith('.nasa.gov')||host==='raw.githubusercontent.com',host);
    checked++;
  }
  assert.ok(checked>=45);
});

test('each record has an actual local visual; reference models need no external resources',()=>{
  const assets=registry as Record<string,Record<string,{file:string}>>;
  for(const a of artifacts){
    const group=assets[a.assetKey??a.id];
    assert.ok(group?.model||group?.photo,a.id);
  }
  for(const group of Object.values(assets))if(group.model){
    const b=readFileSync(`public${group.model.file}`);
    assert.equal(b.toString('utf8',0,4),'glTF');
    const json=JSON.parse(b.toString('utf8',20,20+b.readUInt32LE(12)).trim());
    for(const item of [...(json.buffers??[]),...(json.images??[])])assert.ok(!item.uri||item.uri.startsWith('data:'),item.uri);
    assert.ok((json.extensionsRequired??[]).every((x:string)=>x==='KHR_draco_mesh_compression'),'Unbundled required decoder');
    if((json.extensionsRequired??[]).includes('KHR_draco_mesh_compression')){
      for(const file of ['draco_decoder.js','draco_decoder.wasm','draco_wasm_wrapper.js'])assert.ok(readFileSync(`public/draco/${file}`).length>10000);
      assert.match(readFileSync('src/main.tsx','utf8'),/dracoDecoderLocation: '\/draco\/'/);
    }
  }
});

test('planet textures are equirectangular, not circular planet photographs',()=>{
  // JPEG SOF markers give the original dimensions without adding an image dependency.
  for(const world of Object.values(worlds)){
    const b=readFileSync(`public${world.texture}`);
    let i=2,width=0,height=0;
    while(i<b.length){
      assert.equal(b[i],255);const marker=b[i+1];const length=b.readUInt16BE(i+2);
      if([0xc0,0xc1,0xc2].includes(marker)){height=b.readUInt16BE(i+5);width=b.readUInt16BE(i+7);break;}
      i+=length+2;
    }
    assert.equal(width,2*height,world.texture);
    assert.ok(width>=1000);
  }
});
