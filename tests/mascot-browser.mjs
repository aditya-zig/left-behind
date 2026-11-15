import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const script=JSON.parse(await readFile(new URL('../src/mascot-script.json',import.meta.url)));
const text=id=>script.find(line=>line.id===id).text;
const base=process.env.BASE_URL??'http://127.0.0.1:5174';
const browser=await chromium.launch({headless:process.env.HEADED!=='1',channel:'chrome',slowMo:process.env.HEADED==='1'?120:0,args:['--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({reducedMotion:'reduce',viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>{window.__players=[];const Original=window.Audio;window.Audio=function(...args){const audio=new Original(...args);window.__players.push(audio);return audio;};});
 const caption=page.locator('.tour-caption p');
 const playing=()=>page.waitForFunction(()=>window.__players.at(-1)?.currentTime>.1);
 await page.goto(`${base}/#/moon/eagle`);
 await expect(caption).toHaveText(text('moon_apollo_lunar_modules_eagle_01'));
 assert.equal(await page.evaluate(()=>window.__players.length),0,'no unsolicited audio');
 await page.getByRole('button',{name:'Next voice line',exact:true}).click();await playing();
 await expect(caption).toHaveText(text('moon_apollo_lunar_modules_eagle_02'));
 assert.match(await page.evaluate(()=>window.__players.at(-1).src),/moon_apollo_lunar_modules_eagle_02.wav$/);
 await page.getByRole('button',{name:'Next voice line',exact:true}).click();await playing();
 await expect(caption).toHaveText(text('moon_apollo_lunar_modules_eagle_03'));
 assert.equal(await page.evaluate(()=>window.__players.slice(0,-1).every(player=>player.paused)),true);
 // Real ended event advances the caption to the next exact recording, not a timer.
 await page.evaluate(()=>{const player=window.__players.at(-1);player.currentTime=player.duration-.08;});
 await expect(caption).toHaveText(text('moon_apollo_lunar_modules_eagle_04'));await playing();
 await page.getByRole('button',{name:'Mute narration',exact:true}).click();
 assert.equal(await page.evaluate(()=>window.__players.every(player=>player.paused)),true);
 await page.locator('#site-select').selectOption('apollo17-lm');
 await expect(page.locator('.recording-controls')).toContainText('no supplied recording');
 await page.getByRole('button',{name:'Enable narration',exact:true}).click();
 assert.equal(await page.evaluate(()=>window.__players.every(player=>player.paused)),true,'unrecorded site never plays unrelated speech');
 // Fly between worlds with real audio; the travel caption must survive until its clip ends.
 await page.getByRole('button',{name:'Enable motion',exact:true}).click();
 await page.locator('.planet-switch').getByRole('button',{name:'Mars',exact:true}).click();
 await expect(caption).toHaveText(text('journey_travel_mars_01'));
 await expect(page.locator('.flight-companion')).toHaveClass(/guide-travelling/);await playing();
 const a=await page.locator('.flight-companion').boundingBox();await page.waitForTimeout(1200);const b=await page.locator('.flight-companion').boundingBox();
 assert.ok(Math.abs(a.x-b.x)+Math.abs(a.y-b.y)>20,'mascot crosses the scene during flight');
 await expect(caption).toHaveText(text('mars_opportunity_01'),{timeout:20000});await playing();
 assert.match(await page.evaluate(()=>window.__players.at(-1).src),/mars_opportunity_01.wav$/);
 await page.getByRole('button',{name:'Next voice line',exact:true}).click();
 await expect(caption).toHaveText(text('mars_opportunity_02'));
 // Full-caption fade/blur animation is attached to each newly mounted line.
 assert.ok(await caption.evaluate(el=>el.getAnimations().length>0));
 await page.getByRole('button',{name:'Pause motion',exact:true}).click();
 await page.screenshot({path:'/tmp/left-behind-mascot-desktop.png'});
 // Mobile and reduced motion stay bounded, readable and still show the co-pilot.
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.setViewportSize({width:390,height:844});await page.goto(`${base}/#/moon/eagle`);
 await expect(caption).toHaveText(text('moon_apollo_lunar_modules_eagle_01'));
 const box=await page.locator('.flight-companion').boundingBox();assert.ok(box.x>=0&&box.x+box.width<=391);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 await page.getByRole('button',{name:/Story & evidence/}).click();await expect(page.locator('.mission-dialog')).toBeVisible();
 assert.equal(await page.evaluate(()=>window.__players.every(player=>player.paused)),true);
 await page.keyboard.press('Escape');
 await page.screenshot({path:'/tmp/left-behind-mascot-mobile.png'});
 assert.deepEqual(errors,[]);
 console.log('PASS: current UI, exact captions, real audio/end advancement, cancellation/mute, text-only locations, Moon→Mars travelling mascot, caption animation, mobile, reduced motion and dialogs');
}finally{await browser.close();}
