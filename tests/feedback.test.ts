import test from 'node:test';
import assert from 'node:assert/strict';
import {artifacts,findArtifact} from '../src/data';
import {additionalSites,surfaceSites,sitesFor,mapPosition,formatCoordinates} from '../src/atlas';
import {hardwareFor,costNote} from '../src/hardware';
import {stewardshipBrief} from '../src/stewardship';
test('coordinate atlas adds sourced sites without dropping any surface story',()=>{
 assert.equal(sitesFor('moon').length,19);assert.equal(sitesFor('mars').length,10);assert.equal(additionalSites.length,16);
 assert.equal(new Set(surfaceSites.map(s=>s.id)).size,surfaceSites.length);
 for(const s of surfaceSites){assert.ok(Math.abs(s.coordinates[0])<=90);assert.ok(Math.abs(s.coordinates[1])<=180);assert.ok(s.note.length>20);assert.match(s.source.url,/^https:\/\/[^/]*nasa\.gov\//);}
 for(const a of artifacts.filter(a=>a.world!=='beyond'))assert.ok(surfaceSites.some(s=>s.artifactId===a.id));
});
test('separate instruments use distinct published catalogue coordinates',()=>{
 assert.deepEqual(findArtifact('reflector')?.coordinates,[.67345,23.47307]);assert.deepEqual(findArtifact('alsep')?.coordinates,[-3.0098,-23.4249]);
 assert.notDeepEqual(findArtifact('reflector')?.coordinates,findArtifact('eagle')?.coordinates);
 assert.match(sitesFor('mars').find(s=>s.id==='curiosity-landing')!.note,/not.*current/i);
 assert.equal(surfaceSites.find(s=>s.id==='perseverance-landing')?.kind,'Landing reference');
});
test('equirectangular map preserves north, east and prime-meridian conventions',()=>{
 assert.deepEqual(mapPosition([90,-180]),[0,0]);assert.deepEqual(mapPosition([0,0]),[50,50]);assert.deepEqual(mapPosition([-90,180]),[100,100]);
 assert.equal(formatCoordinates([-3.0098,-23.4249]),'3.0098° S, 23.4249° W');
});
test('hardware separates stayed, departed and genuinely returned components',()=>{
 assert.equal(hardwareFor(findArtifact('eagle')!).parts.find(p=>p.name==='Ascent cabin and engine')?.state,'Departed');
 assert.equal(hardwareFor(findArtifact('surveyor')!).parts.filter(p=>p.state==='Returned').length,2);
 assert.ok(hardwareFor(findArtifact('rover')!).sources.length);assert.match(costNote,/No ranking or salvage value is invented/);
 for(const a of artifacts.filter(a=>a.world!=='beyond'))for(const p of hardwareFor(a).parts){assert.ok(p.name&&p.role&&p.where);assert.match(p.orbit,/-?\d+deg \d+deg auto/);}
});
test('responsibility brief changes with context and return risk; never claims a deployed cleanup',()=>{
 const lunar=stewardshipBrief('apollo','document'),mars=stewardshipBrief('mars','return');
 assert.notDeepEqual(lunar,mars);assert.match(JSON.stringify(mars),/contamination|containment/i);
 for(const target of ['apollo','mars','future'] as const)for(const action of ['document','reuse','return'] as const){const brief=stewardshipBrief(target,action);assert.ok(brief.context.length>30&&brief.approach.length>30&&brief.priority.length>20);}
});
