import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import photos from '../src/photography.json';
import type {NasaPhoto} from '../src/Photography';

test('every added NASA photograph has verified source, native dimensions and local checksum',()=>{
 assert.equal(Object.keys(photos).length,31);
 const records:Record<string,NasaPhoto>=photos;
 for(const [key,photo] of Object.entries(records)){
  assert.ok(new URL(photo.source).hostname.endsWith('.nasa.gov'),key);
  assert.ok(photo.file.startsWith('/photography/'),key);
  assert.ok(photo.width>0&&photo.height>0,key);
  const path=resolve('public',photo.file.slice(1));
  assert.equal(statSync(path).size,photo.bytes,key);
  assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'),photo.sha256,key);
  if(photo.display){const display=photo.display;assert.ok(new URL(display.download).hostname.endsWith('.nasa.gov'));assert.ok(display.width<photo.width&&display.height<photo.height);const local=readFileSync(resolve('public',display.file.slice(1)));assert.equal(local.length,display.bytes);assert.equal(createHash('sha256').update(local).digest('hex'),display.sha256);}
 }
});
test('Sun uses NASA’s cylindrical EUV sphere map and archival references retain their caveats',()=>{
 assert.equal(photos['sun-map'].width,4096);assert.equal(photos['sun-map'].height,2048);
 assert.equal(photos['sun-map'].source,'https://svs.gsfc.nasa.gov/3851/');
 assert.match(photos['sun-map'].caption,/false|EUV/i);
 assert.match(photos['rover-systems'].caption,/Earth|ground/);
 assert.match(photos['surveyor-6'].caption,/reference|programme/i);
 assert.match(photos['ingenuity-shadow'].caption,/shadow/i);
 assert.match(photos['apollo15-reflector'].caption,/MESA|undeployed|before deployment/i);
 const scene=readFileSync('src/FlightScene.tsx','utf8');
 assert.match(scene,/new THREE\.SphereGeometry\(19,96,64\)/);
 assert.ok(scene.includes("load('/photography/sun-map.jpg')"));
 assert.ok(!scene.includes("load('/assets/sun-sdo.jpg')"));
});
