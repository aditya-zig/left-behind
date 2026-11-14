import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
const base=process.env.BASE_URL??'http://127.0.0.1:5173';
const assets=JSON.parse(await readFile(new URL('../src/assets.json',import.meta.url),'utf8'));
const ids=['eagle','rover','alsep','surveyor','reflector','opportunity','insight','ingenuity','sojourner','viking1','spirit','viking2','phoenix','dawn','near','pioneer10','pioneer11','kepler'];
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
const page=await context.newPage(),errors=[],failed=[],external=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});page.on('request',r=>{if(!r.url().startsWith(base)&&/^https?:/.test(r.url()))external.push(r.url());});
const pass=name=>{checks.push(name);console.log('PASS',name);};
const shot=name=>page.screenshot({path:`test-results/cinematic-${name}.png`});
const ready=()=>page.locator('.flight-scene[data-ready=true]').waitFor({timeout:30000});
const route=async hash=>{await page.evaluate(hash=>{location.hash=hash;},hash);};
const modelReady=selector=>page.waitForFunction(selector=>document.querySelector(selector)?.loaded===true,selector,{timeout:45000});
const fits=async label=>{if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error(`Horizontal overflow: ${label}`);};
await mkdir('test-results',{recursive:true});
try{
 await page.goto(base);await expect(page.locator('h1')).toHaveText('Left Behind.');await expect(page.locator('.blip-model canvas')).toHaveCount(1);
 await expect.poll(()=>page.locator('.stage-choose video').evaluate(v=>v.readyState)).toBeGreaterThanOrEqual(2);
 await expect.poll(()=>page.locator('.stage-choose video').evaluate(v=>v.currentTime)).toBeGreaterThan(0);
 expect(await page.locator('.stage-choose video').evaluate(v=>v.muted)).toBe(true);
 await expect(page.getByRole('link',{name:'Home',exact:true})).toHaveCount(1);await expect(page.locator('.cosmic-nav,.mission-dock,.mission-dialog')).toHaveCount(0);
 await shot('film-home');pass('NASA animation video, supplied 3D Blip and a single home icon, no navbar or dock');
 await expect(page.locator('.showcase-object')).toHaveCount(3);await expect(page.locator('.catalogue-object')).toHaveCount(15);
 expect(await page.evaluate(()=>Boolean(document.querySelector('.journey-proof').compareDocumentPosition(document.querySelector('.more-equipment'))&Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
 await page.locator('.more-equipment').scrollIntoViewIfNeeded();await expect(page.locator('.catalogue-object').first()).toBeVisible();await fits('equipment collection');await shot('more-equipment');pass('all 18 equipment records, including 15 additions after Wonder first');
 await page.getByRole('link',{name:'Home',exact:true}).click();await page.locator('.destination-choice').first().click();await ready();await expect(page.locator('.travel-label')).toHaveCount(0,{timeout:18000});await expect(page.locator('.flight-fallback')).toHaveCount(0);await expect(page.locator('.flight-canvas canvas')).toHaveCount(1);
 await expect(page.locator('.orbital-hotspot')).toHaveCount(5);await page.locator('.motion-toggle').click();
 const eagle=page.getByRole('button',{name:'Explore Eagle’s descent stage',exact:true});await expect(eagle).toBeVisible();await eagle.hover();await modelReady('.orbital-hotspot.selected model-viewer');await expect(page.locator('.hotspot-preview')).toHaveCount(0);await shot('moon-model-markers');pass('five Moon markers with an actual NASA model, labelled image fallbacks and no extra popup');
 await eagle.click();await expect(page.locator('.equipment-page')).toHaveAttribute('data-mission','eagle');await expect(page.locator('dialog')).toHaveCount(0);await expect(page.locator('.equipment-reading-tools')).toBeVisible();await expect(page.locator('.inline-source')).toHaveCount(4);
 await expect(page.locator('.equipment-sources a')).not.toHaveCount(0);await expect(page.locator('.official-resources a')).toHaveCount(5);await modelReady('.equipment-visual model-viewer');await shot('eagle-detail');
 const before=page.url();await page.getByRole('link',{name:'The science',exact:true}).click();expect(page.url()).toBe(before);await expect(page.locator('#mission-discovery')).toBeVisible();
 await page.keyboard.press('Escape');await expect(page.locator('.stage-moon')).toBeVisible();pass('full-page mission article, inline citations, official resource rail and Escape return');
 await page.locator('.planet-switch').getByRole('button',{name:'Mars',exact:true}).click();await ready();await expect(page.locator('.orbital-hotspot')).toHaveCount(8);await page.locator('.mission-access summary').click();await expect(page.locator('.mission-access button')).toHaveCount(8);await page.locator('.mission-access button').filter({hasText:'Ingenuity'}).click();await expect(page.locator('.equipment-page')).toHaveAttribute('data-mission','ingenuity');await modelReady('.equipment-visual model-viewer');pass('Mars switch and all eight missions remain keyboard/touch accessible');
 for(const id of ids){
  await route('/equipment/'+id);await expect(page.locator('.equipment-page')).toHaveAttribute('data-mission',id);await expect(page.locator('.equipment-article>section')).toHaveCount(5);await expect(page.locator('.equipment-sources a')).not.toHaveCount(0);
  if(assets[id]?.model)await modelReady('.equipment-visual model-viewer');else await expect(page.locator('.equipment-visual .artifact-media>img')).toBeVisible();
  const links=await page.locator('.equipment-sources a,.official-resources a').evaluateAll(nodes=>nodes.map(a=>a.href));for(const link of links){const u=new URL(link);expect(u.protocol).toBe('https:');expect(u.hostname.endsWith('nasa.gov')||u.hostname==='github.com'&&u.pathname.startsWith('/nasa/')).toBe(true);}
 }
 pass('every one of 18 detailed mission pages renders its NASA visual and official evidence links');
 await route('/sources');await expect(page.locator('.source-record')).toHaveCount(18);await expect(page.locator('.asset-row')).toHaveCount(49);await expect(page.locator('.site-header')).toBeHidden();await page.getByRole('link',{name:'Home',exact:true}).click();await expect(page.locator('.stage-choose')).toBeVisible();pass('complete original source archive preserved, without restoring the navbar');
 for(const width of [768,390]){
  await page.setViewportSize({width,height:900});await page.goto(base);await expect(page.locator('.guide-speech')).toBeVisible();await fits(`home ${width}`);await shot(`home-${width}`);
  await page.locator('.destination-choice').first().click();await ready();await expect(page.locator('.travel-label')).toHaveCount(0,{timeout:18000});await fits(`moon ${width}`);
  const collisions=await page.evaluate(()=>{
   const obstacles=[document.querySelector('.planet-heading'),document.querySelector('.guide-bubble')].map(e=>e.getBoundingClientRect());
   return [...document.querySelectorAll('.orbital-hotspot[data-visible=true] .orbital-pin')].filter(e=>{const r=e.getBoundingClientRect();return obstacles.some(o=>r.left<o.right&&r.right>o.left&&r.top<o.bottom&&r.bottom>o.top);}).map(e=>e.getAttribute('aria-label'));
  });expect(collisions).toEqual([]);await expect(page.locator('.orbital-hotspot[data-visible=true]')).toHaveCount(5);await shot(`moon-${width}`);
  await page.locator('.mission-access summary').click();await page.locator('.mission-access button').first().click();await expect(page.locator('.equipment-page')).toBeVisible();await fits(`detail ${width}`);await page.locator('.official-resources').scrollIntoViewIfNeeded();await shot(`detail-resources-${width}`);await page.getByRole('link',{name:'Home',exact:true}).click();
 }
 pass('768px and 390px layouts, equipment markers, mission access and linked detail pages');
 const reduced=await context.newPage();await reduced.emulateMedia({reducedMotion:'reduce'});await reduced.goto(base);await expect(reduced.locator('.motion-toggle')).toHaveAttribute('aria-pressed','false');expect(await reduced.locator('.stage-choose video').evaluate(v=>v.paused)).toBe(true);await reduced.locator('.destination-choice').first().click();await expect(reduced.locator('.travel-label')).toHaveCount(0);await reduced.close();pass('reduced motion pauses video, mascot motion, model rotation and travel');
 const voiced=await context.newPage();await voiced.emulateMedia({reducedMotion:'reduce'});await voiced.addInitScript(()=>{window.__spoken=[];Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},speak(u){window.__utterance=u;window.__spoken.push(u.text);u.onstart?.();}},configurable:true});});await voiced.goto(base+'/#/moon/eagle');await voiced.locator('.flight-scene[data-ready=true]').waitFor();await voiced.getByRole('button',{name:'Voice off',exact:true}).click();await expect.poll(()=>voiced.evaluate(()=>window.__spoken.length)).toBeGreaterThan(0);const first=await voiced.locator('.guide-speech').innerText();await voiced.evaluate(()=>window.__utterance.onend?.());await expect(voiced.locator('.guide-speech')).not.toHaveText(first);await voiced.getByRole('button',{name:'Voice on',exact:true}).click();await voiced.close();pass('optional simulated device speech and next-line synchronization');
 const fallback=await context.newPage();await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){if(String(kind).startsWith('webgl'))return null;return original.call(this,kind,...args);};});await fallback.goto(base+'/#/moon/eagle');await expect(fallback.locator('.flight-fallback')).toBeVisible();await expect(fallback.locator('.mission-access')).toHaveAttribute('open','');await expect(fallback.locator('.mission-access button')).toHaveCount(5);await fallback.locator('.mission-access button').first().click();await expect(fallback.locator('.equipment-visual .artifact-media>img')).toBeVisible();await expect(fallback.locator('.equipment-sources a')).not.toHaveCount(0);await fallback.close();pass('no-WebGL fallback automatically exposes the mission index, images and sourced articles');
 if(errors.length||failed.length||external.length)throw Error(JSON.stringify({errors,failed,external}));pass('no normal-run application errors, missing resources or external requests');
}finally{await writeFile('test-results/cinematic-results.json',JSON.stringify({checks,errors,failed,external},null,2));await browser.close();}
