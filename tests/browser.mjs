import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base=process.env.BASE_URL??'http://localhost:5173';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const errors=[],external=[],failures=[],checks=[];
await mkdir('test-results',{recursive:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const page=await context.newPage();
page.on('pageerror',error=>errors.push(error.message));
page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
page.on('request',req=>{if(!req.url().startsWith(base)&&!req.url().startsWith('blob:')&&!req.url().startsWith('data:'))external.push(req.url());});
page.on('response',res=>{if(res.status()>=400)failures.push(`${res.status()} ${res.url()}`);});
async function check(name,fn){await fn();checks.push(name);console.log('PASS',name);}
async function route(hash){await page.goto(`${base}/${hash}`);await page.locator('main h1').waitFor();}
async function noOverflow(){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Overflow at ${page.url()}`);}
async function modelReady(){await page.waitForFunction(()=>document.querySelector('model-viewer')?.loaded===true,null,{timeout:45000});}
async function selected(name){await page.waitForFunction(n=>document.querySelector('.mission-title h2')?.textContent===n,name);}
try{
  await check('Home renders NASA globe and local typography',async()=>{
    await route('');await page.locator('canvas').waitFor();await page.locator('.scene-message').waitFor({state:'hidden'});
    await page.evaluate(()=>document.fonts.ready);await noOverflow();
    await page.screenshot({path:'test-results/home-1440.png',fullPage:true});
    assert.match(await page.locator('h1').innerText(),/Left behind/);
  });
  await check('Manual explorer shows actual lunar module, evidence and model caveat',async()=>{
    await page.getByRole('link',{name:/Explore on your own/}).click();
    await page.waitForURL('**/#/moon/eagle');await modelReady();
    assert.match(await page.locator('.model-note').innerText(),/Only the descent stage remains/);
    await page.getByRole('tab',{name:/Facts & sources/}).click();
    assert.match(await page.locator('[role=tabpanel]').innerText(),/1969-059C/);
    assert.match(await page.locator('[role=tabpanel]').innerText(),/No verified object-level cost/);
    await page.screenshot({path:'test-results/moon-1440.png',fullPage:true});
    await page.getByRole('tab',{name:'The story'}).click();
  });
  await check('All lunar records select; actual Apollo terrain loads',async()=>{
    for(const name of ['The first lunar rover','The listening station','Surveyor 3','A mirror for the Moon']){
      await page.locator('.artifact-index').getByRole('button',{name:new RegExp(name)}).click();await selected(name);
    }
    await page.getByRole('button',{name:'NASA terrain'}).click();
    await page.locator('.scene-message').waitFor({state:'hidden'});
    assert.match(await page.locator('.map-disclaimer').innerText(),/not a navigable reconstruction/);
    await page.screenshot({path:'test-results/lunar-terrain.png',fullPage:true});
  });
  await check('Mars switch and compressed NASA models load locally',async()=>{
    await page.getByRole('button',{name:'Mars',exact:true}).click();await page.waitForURL('**/#/mars/opportunity');
    await selected('Opportunity');await modelReady();
    for(const name of ['InSight','Ingenuity','Viking 1']){
      await page.locator('.artifact-index').getByRole('button',{name:new RegExp(`^${name}`)}).click();await selected(name);await modelReady();
    }
    await page.screenshot({path:'test-results/mars-1440.png',fullPage:true});
  });
  await check('Collection search, empty state and separate deep-space destination work',async()=>{
    await page.getByRole('link',{name:/The collection/}).first().click();await page.waitForURL('**/#/collection');
    assert.equal(await page.locator('.collection-card').count(),18);
    const search=page.getByLabel('Search mission records');
    await search.fill('VIKING');assert.equal(await page.locator('.collection-card').count(),2);
    await search.fill('zzzzzzzz');assert.match(await page.locator('.empty-state').innerText(),/No mission found/);
    await search.fill('');await page.getByRole('button',{name:'Beyond',exact:true}).click();
    assert.equal(await page.locator('.collection-card').count(),5);
    await page.locator('.collection-card').filter({hasText:'Kepler'}).click();await page.waitForURL('**/#/collection/kepler');await modelReady();
    assert.match(await page.locator('.beyond-detail').innerText(),/Earth-trailing orbit around the Sun/);
  });
  await check('Deep-space records load NASA models or the documented archival image',async()=>{
    for(const [id,name] of [['dawn','Dawn'],['near','NEAR Shoemaker'],['pioneer10','Pioneer 10']]){
      await route(`#/collection/${id}`);await page.getByRole('heading',{name,exact:true}).waitFor();await modelReady();
    }
    await route('#/collection/pioneer11');await page.getByRole('heading',{name:'Pioneer 11',exact:true}).waitFor();
    assert.equal(await page.locator('model-viewer').count(),0);
    await page.waitForFunction(()=>{const img=document.querySelector('.beyond-detail .artifact-media img');return img?.complete&&img.naturalWidth>0;});
    assert.match(await page.locator('.beyond-detail .media-tag').innerText(),/NASA artist concept/);
  });
  await check('Mission-level sources and per-asset provenance are visible',async()=>{
    await route('#/sources');assert.equal(await page.locator('.source-record').count(),18);
    assert.ok(await page.locator('.asset-row').count()>=45);assert.equal(await page.locator('a[href*="notion"]').count(),0);
    await page.locator('.source-record').first().locator('summary').click();assert.match(await page.locator('.source-record').first().innerText(),/sample mass/);
  });
  await check('Reflection gives explanatory feedback',async()=>{
    await route('#/legacy');await page.getByRole('button',{name:/Not necessarily/}).click();
    assert.match(await page.locator('.quiz-feedback').innerText(),/Exactly/);
    await page.getByRole('button',{name:/Yes. No signal/}).click();assert.match(await page.locator('.quiz-feedback').innerText(),/silent spacecraft can still leave a valuable archive/);
  });
  await check('Intro can pause, advance and skip; guided stories can be skipped or exited',async()=>{
    await route('');await page.getByRole('button',{name:/Begin the journey/}).click();await page.waitForURL('**/#/intro');
    await page.getByRole('button',{name:'Pause',exact:true}).click();await page.getByRole('button',{name:/Continue/}).click();
    await page.getByRole('heading',{name:'Our small corner of space.'}).waitFor();await page.getByRole('button',{name:'Skip opening'}).click();await page.waitForURL('**/#/moon/eagle');
    await page.getByRole('button',{name:'Pause guided journey'}).click();await page.getByRole('button',{name:/Next story/}).click();await page.waitForURL('**/#/moon/rover');
    assert.equal(await page.getByRole('button',{name:'Resume guided journey'}).count(),1);
    await page.getByRole('button',{name:'Exit tour'}).click();assert.match(await page.locator('.tour-bar').innerText(),/Explore at your pace/);
  });
  await check('Guided clock advances, pauses and completes instead of looping',async()=>{
    await route('');await page.clock.install();
    await page.getByRole('button',{name:/Begin the journey/}).click();await page.getByRole('button',{name:'Skip opening'}).click();await page.waitForURL('**/#/moon/eagle');
    await page.clock.runFor(42000);await page.waitForURL('**/#/moon/rover');
    await page.getByRole('button',{name:'Pause guided journey'}).click();await page.clock.runFor(45000);assert.ok(page.url().endsWith('/moon/rover'));
    await page.getByRole('button',{name:'Resume guided journey'}).click();
    for(const id of ['alsep','surveyor','reflector','opportunity','insight','ingenuity','sojourner','viking1']){
      await page.getByRole('button',{name:/Next story/}).click();await page.waitForURL(`**/#/${['alsep','surveyor','reflector'].includes(id)?'moon':'mars'}/${id}`);
    }
    await page.getByRole('button',{name:/Finish the journey/}).click();await page.waitForURL('**/#/legacy');await page.clock.resume();
  });
  for(const width of [768,390])await check(`No horizontal overflow at ${width}px; navigation remains usable`,async()=>{
    await page.setViewportSize({width,height:900});
    for(const hash of ['','#/moon/eagle','#/mars/ingenuity','#/collection','#/sources','#/legacy','#/about']){
      await route(hash);await noOverflow();
      if(hash===''||hash==='#/moon/eagle'){if(hash)await modelReady();await page.screenshot({path:`test-results/${hash?'explorer':'home'}-${width}.png`,fullPage:true});}
    }
    if(width===390){await page.getByRole('button',{name:'Menu',exact:true}).click();await page.getByRole('link',{name:/The collection/}).first().click();await page.waitForURL('**/#/collection');}
  });
  await check('Without WebGL, NASA photographs and the full text collection remain usable',async()=>{
    const fallback=await context.newPage();const fallbackErrors=[];fallback.on('pageerror',e=>fallbackErrors.push(e.message));
    await fallback.addInitScript(()=>{
      const original=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(type,...args){return String(type).includes('webgl')?null:original.call(this,type,...args);};
      localStorage.setItem('left-behind-visited','{}');
    });
    try{
      await fallback.goto(`${base}/#/moon/eagle`);await fallback.locator('.error-message').waitFor();
      await fallback.waitForFunction(()=>{const img=document.querySelector('.artifact-media img');return img?.complete&&img.naturalWidth>0;});
      await fallback.locator('.artifact-index').getByRole('button',{name:/The first lunar rover/}).click();
      await fallback.getByRole('heading',{name:'The first lunar rover',exact:true}).waitFor();
      await fallback.getByRole('link',{name:/The collection/}).first().click();assert.equal(await fallback.locator('.collection-card').count(),18);
      assert.deepEqual(fallbackErrors,[]);
    }finally{await fallback.close();}
  });
  await check('Invalid routes recover to a usable page',async()=>{
    await route('#/moon/not-real');await selected('Eagle’s descent stage');await route('#/not-real');assert.match(await page.locator('h1').innerText(),/Left behind/);
  });
  assert.deepEqual(failures,[],'Failed resource requests');assert.deepEqual(errors,[],'Browser errors');assert.deepEqual(external,[],'Unexpected external runtime dependency');
} finally {
  await writeFile('test-results/browser-results.json',JSON.stringify({base,checks,errors,external,failures},null,2));await browser.close();
}
console.log(`${checks.length} browser checks passed; no external requests, failed resources, or console errors.`);
