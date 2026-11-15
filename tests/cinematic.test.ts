import {test} from 'node:test';
import assert from 'node:assert/strict';
import {artifacts} from '../src/data';
import {opening,routeMission,storyLines,flightEase,adjacentStop,tourSites,tourCaption,surfaceDirection} from '../src/cinematic';
test('camera flight reaches its destination on wall-clock time even at two frames per second',()=>{
 let elapsed=0;for(let frame=0;frame<8;frame++)elapsed+=.5;
 assert.equal(flightEase(elapsed),1);assert.equal(flightEase(3.6),1);assert.equal(flightEase(0),0);assert.equal(flightEase(1.8),.5);assert.equal(flightEase(-1),0);
});
test('opening follows the galaxy → solar neighbourhood → Earth → destination sequence',()=>assert.deepEqual(opening,['galaxy','solar','earth','choose']));
test('guide lines preserve every sourced word, never inventing a new transmission',()=>{
 for(const item of artifacts){const lines=storyLines(item.story);assert.ok(lines.length>0);assert.equal(lines.join(' ').replace(/\s+/g,' '),item.story.replace(/\s+/g,' '));assert.ok(lines.every(x=>x.trim().length>0));}
});
test('world routes cannot display another world’s record',()=>{
 assert.equal(routeMission('#/moon/eagle')?.item.id,'eagle');assert.equal(routeMission('#/mars/ingenuity')?.item.id,'ingenuity');assert.equal(routeMission('#/moon/ingenuity')?.item.world,'moon');assert.equal(routeMission('#/mars/unknown')?.item.world,'mars');assert.equal(routeMission('#/collection/kepler'),null);
});
test('guided tour uses verified equipment stops and wraps in either direction',()=>{
 for(const world of ['moon','mars'] as const){const stops=tourSites(world);assert.ok(stops.length>=5);assert.ok(stops.every(site=>site.world===world&&site.artifactId&&site.source.url));assert.equal(adjacentStop(world,stops.at(-1)!.id,1).id,stops[0].id);assert.equal(adjacentStop(world,stops[0].id,-1).id,stops.at(-1)!.id);assert.equal(adjacentStop(world,'context-site',1).id,stops[0].id);for(const site of stops)assert.ok(tourCaption(site).split(/\s+/).length<=16);}
});
test('surface camera stays outside the planet even for antipodal and coincident stops',()=>{
 for(const [from,to] of [[[1,0,0],[-1,0,0]],[[0,1,0],[0,-1,0]],[[1,0,0],[1,0,0]],[[1,0,0],[0,0,1]]]){
  for(let i=0;i<=20;i++){const point=surfaceDirection(from,to,i/20);assert.ok(point.every(Number.isFinite));assert.ok(Math.abs(Math.hypot(...point)-1)<.00001);}
  surfaceDirection(from,to,0).forEach((n,i)=>assert.ok(Math.abs(n-from[i])<.00001));surfaceDirection(from,to,1).forEach((n,i)=>assert.ok(Math.abs(n-to[i])<.00001));
 }
});
test('guide retains incomplete or punctuation-free final sentences',()=>{
 assert.deepEqual(storyLines('A short explanation'),['A short explanation']);assert.equal(storyLines('One. Two! Three?').join(' '),'One. Two! Three?');
});
