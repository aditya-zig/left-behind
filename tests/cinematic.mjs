import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.BASE_URL??'http://127.0.0.1:5173';
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
const page=await context.newPage(),errors=[],failed=[],external=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});page.on('request',r=>{if(!r.url().startsWith(base)&&/^https?:/.test(r.url()))external.push(r.url());});
const ready=()=>page.locator('.flight-scene[data-ready=true]').waitFor({timeout:30000});
const shot=name=>page.screenshot({path:`test-results/cinematic-${name}.png`});
const pass=name=>{checks.push(name);console.log('PASS',name);};
await mkdir('test-results',{recursive:true});
try{
 await page.goto(base);await ready();await expect(page.locator('.flight-fallback')).toHaveCount(0);await expect(page.locator('.flight-canvas canvas')).toHaveCount(1);
 await page.getByRole('button',{name:'Go to The Milky Way',exact:true}).click();await expect(page.locator('h1')).toHaveText('Far from home.');await shot('galaxy');pass('NASA galaxy renders without StrictMode context loss');
 await page.getByRole('button',{name:'Go to The Solar System',exact:true}).click();await expect(page.locator('h1')).toHaveText('A little closer.');
 await page.getByRole('button',{name:'Go to Earth',exact:true}).click();await expect(page.locator('h1')).toHaveText('It began here.');
 await page.getByRole('button',{name:'Go to Choose your destination',exact:true}).click();await expect(page.locator('.destination-choice')).toHaveCount(2);pass('opening chapters and destination choices');
 await page.locator('.destination-choice').first().click();await expect(page.locator('.stage-moon')).toBeVisible();await expect(page.locator('.travel-label')).toHaveCount(0,{timeout:16000});await expect(page.locator('.mission-chip')).toHaveCount(5);await shot('moon');pass('animated Moon arrival and all five accessible missions');
 await page.locator('.motion-toggle').click();await expect(page.locator('.motion-toggle')).toHaveAttribute('aria-pressed','false');
 const pin=page.locator('.orbital-hotspot[data-visible=true] .orbital-pin').first();await pin.hover();await expect(page.locator('.hotspot-preview')).toBeVisible();await page.waitForFunction(()=>document.querySelector('.hotspot-preview model-viewer')?.loaded===true,{},{timeout:30000});
 await page.locator('.hotspot-preview').hover();await shot('hover-model');await page.getByRole('button',{name:'Discover the story'}).click();await expect(page.getByRole('dialog')).toBeVisible();
 await page.getByRole('tab',{name:'Facts & NASA sources'}).click();await expect(page.locator('.mission-source')).not.toHaveCount(0);await expect(page.locator('.evidence-copy')).toContainText('Recorded status');await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);pass('hover NASA model, native modal, source evidence and Escape');
 await page.locator('.planet-switch').getByRole('button',{name:'Mars',exact:true}).click();await expect(page.locator('.stage-mars')).toBeVisible();await expect(page.locator('.mission-chip')).toHaveCount(8);
 await page.locator('.mission-chip').filter({hasText:'Ingenuity'}).click();await expect(page.locator('.guide-speech')).toContainText('Ingenuity');
 const before=await page.locator('.guide-speech').innerText();await page.getByRole('button',{name:'Next line'}).click();await expect(page.locator('.guide-speech')).not.toHaveText(before);await page.getByRole('button',{name:'More info'}).click();await expect(page.locator('.mission-dialog h2')).toContainText('Ingenuity');await page.keyboard.press('Escape');await shot('mars');pass('Mars switch, eight records, guide lines and matching details');
 await page.locator('.cosmic-nav').getByRole('link',{name:'NASA sources'}).click();await expect(page.locator('.source-record')).toHaveCount(18);await expect(page.locator('.asset-row')).toHaveCount(49);pass('complete original NASA source archive and 49 traced assets');
 for(const width of [768,390]){
  await page.setViewportSize({width,height:900});await page.goto(base+'/#/mars/ingenuity');await ready();await page.locator('.motion-toggle').click();await expect(page.locator('.mission-chip')).toHaveCount(8);
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error(`Horizontal overflow at ${width}`);
  await page.getByRole('button',{name:'Explore this story'}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await shot(`mars-${width}`);
 }
 pass('tablet and mobile layouts and touch-accessible mission detail');
 const reduced=await context.newPage();await reduced.emulateMedia({reducedMotion:'reduce'});await reduced.goto(base);await reduced.locator('.destination-choice').first().waitFor();await expect(reduced.locator('.motion-toggle')).toHaveAttribute('aria-pressed','false');await reduced.setViewportSize({width:390,height:900});await reduced.screenshot({path:'test-results/cinematic-choose-390.png'});await reduced.close();pass('reduced motion skips opening and disables rotation');
 const voiced=await context.newPage();await voiced.addInitScript(()=>{
  window.__spoken=[];Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},speak(u){window.__utterance=u;window.__spoken.push(u.text);}},configurable:true});
 });await voiced.goto(base);await voiced.locator('.flight-scene[data-ready=true]').waitFor();await voiced.getByRole('button',{name:'Go to The Milky Way',exact:true}).click();await voiced.clock.install();await voiced.getByRole('button',{name:'Continue opening',exact:true}).click();await voiced.getByRole('button',{name:/Voice off/}).click();
 await expect.poll(()=>voiced.evaluate(()=>window.__spoken.at(-1))).toContain('Milky Way');await voiced.clock.runFor(6000);await expect(voiced.locator('h1')).toHaveText('Far from home.');await voiced.evaluate(()=>window.__utterance.onend?.());await expect(voiced.locator('h1')).toHaveText('A little closer.');await voiced.close();pass('simulated device narration completes before advancing the opening');
 const fallback=await context.newPage();await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){if(String(kind).startsWith('webgl'))return null;return original.call(this,kind,...args);};});await fallback.goto(base+'/#/moon/eagle');await expect(fallback.locator('.flight-fallback')).toBeVisible();await expect(fallback.locator('.mission-chip')).toHaveCount(5);await fallback.getByRole('button',{name:'Explore this story'}).click();await expect(fallback.locator('.mission-dialog .artifact-media img')).toBeVisible();await fallback.close();pass('no-WebGL image, story and mission-list fallback');
 if(errors.length||failed.length||external.length)throw Error(JSON.stringify({errors,failed,external}));pass('no application errors, missing assets or external requests');
}finally{await writeFile('test-results/cinematic-results.json',JSON.stringify({checks,errors,failed,external},null,2));await browser.close();}
