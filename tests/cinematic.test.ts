import {test} from 'node:test';
import assert from 'node:assert/strict';
import {artifacts} from '../src/data';
import {opening,routeMission,storyLines,flightEase} from '../src/cinematic';
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
test('guide retains incomplete or punctuation-free final sentences',()=>{
 assert.deepEqual(storyLines('A short explanation'),['A short explanation']);assert.equal(storyLines('One. Two! Three?').join(' '),'One. Two! Three?');
});
