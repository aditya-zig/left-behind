import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import film from '../src/media.json';

test('edited NASA film and actual-frame poster match their provenance checksums',()=>{
 assert.equal(new URL(film.source).hostname,'plus.nasa.gov');
 assert.deepEqual(film.segments,[{start:8,end:21},{start:115.5,end:121.5},{start:159,end:170}]);
 assert.equal(film.segments.reduce((seconds,s)=>seconds+s.end-s.start,0),30);
 for(const file of film.files){
  const path=resolve('public',file.file.replace(/^\//,''));
  assert.equal(statSync(path).size,file.bytes);
  assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'),file.sha256);
 }
 assert.match(film.context,/future lunar exploration/);
 assert.match(film.context,/not historical recordings/);
});
