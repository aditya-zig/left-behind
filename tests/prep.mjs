import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.BASE_URL??'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
await context.addInitScript(()=>{
  window.__spoken=[];
  window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{cancel(){window.__cancelled=(window.__cancelled??0)+1;},getVoices(){return[];},speak(utterance){window.__spoken.push({text:utterance.text,rate:utterance.rate});window.__utterance=utterance;}}});
});
const page=await context.newPage();
const errors=[],failures=[],external=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
page.on('response',r=>{if(r.status()>=400)failures.push(`${r.status()} ${r.url()}`);});
page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))external.push(r.url());});
await mkdir('test-results',{recursive:true});
async function check(name,fn){await fn();checks.push(name);console.log('PASS',name);}
try{
  await check('One short answer is shown first; explanations reveal on demand',async()=>{
    await page.goto(`${base}/prep.html`);
    await expect(page.locator('#question')).toHaveText('What did we build?');
    await expect(page.locator('#simple')).toBeHidden();
    await page.getByRole('button',{name:'Explain simply',exact:true}).click();
    await expect(page.locator('#simple')).toBeVisible();
    await expect(page.locator('#simple-text')).toContainText('museum exhibit');
    await page.getByRole('button',{name:'Next question',exact:true}).click();
    await expect(page.locator('#question')).toHaveText('Who is this for?');
    await expect(page.locator('#simple')).toBeHidden();
    await expect(page.locator('#question')).toBeFocused();
  });
  await check('Every judging answer is reachable and preserves scientific caveats',async()=>{
    for(let i=0;i<10;i++){await page.locator('#lesson').selectOption(String(i));await expect(page.locator('#answer')).toBeVisible();assert.ok((await page.locator('#answer').innerText()).split(/\s+/).length<=45);}
    await page.locator('#lesson').selectOption('3');
    await expect(page.locator('#answer')).toContainText('not measured learning gains');
    await page.locator('#lesson').selectOption('4');
    await expect(page.locator('#answer')).toContainText('LRO-based');
  });
  await check('Read-aloud uses the selected text and speed, and stops on navigation',async()=>{
    await page.locator('#speed').selectOption('0.72');
    await page.getByRole('button',{name:'Listen to this answer',exact:true}).click();
    await expect(page.getByRole('button',{name:'Stop reading',exact:true})).toBeVisible();
    const spoken=await page.evaluate(()=>window.__spoken.at(-1));
    assert.equal(spoken.rate,0.72);assert.match(spoken.text,/NASA mission records/);
    const before=await page.evaluate(()=>window.__cancelled);
    await page.getByRole('button',{name:'NASA basics',exact:true}).click();
    await expect(page.locator('#question')).toContainText('not all of NASA');
    assert.ok(await page.evaluate(()=>window.__cancelled)>before);
  });
  await check('Three NASA examples load actual local photographs and correct distinctions',async()=>{
    for(const name of ['Eagle','Ingenuity','Reflector']){
      await page.getByRole('button',{name,exact:true}).click();
      await page.locator('.fact-photo').evaluate(img=>img.complete?null:new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;}));
      assert.ok(await page.locator('.fact-photo').evaluate(img=>img.naturalWidth>0));
    }
    await expect(page.locator('#fact')).toContainText('laser light');
    await expect(page.locator('#content')).toContainText('2019');
    await page.getByRole('button',{name:'Ingenuity',exact:true}).click();
    await expect(page.locator('#fact')).toContainText('72');
  });
  await check('Mentor mode provides a spoken opening and three prioritised questions',async()=>{
    await page.getByRole('button',{name:'Talk to the mentor',exact:true}).click();
    await expect(page.locator('.ask-list li')).toHaveCount(3);
    await expect(page.locator('#mentor-opening')).toContainText('two changes');
    await page.getByRole('button',{name:'Read my opening',exact:true}).click();
    assert.match(await page.evaluate(()=>window.__spoken.at(-1).text),/honest advice/);
  });
  await check('Rehearsal hides the answer, saves notes safely, and records only self-assessed familiarity',async()=>{
    await page.getByRole('button',{name:'Practise answering',exact:true}).click();
    await page.locator('#lesson').selectOption('0');
    await expect(page.locator('#practice-answer')).toBeHidden();
    await page.getByRole('button',{name:'Give me a hint',exact:true}).click();
    await expect(page.locator('#hint')).toContainText('Space museum');
    await page.locator('#notes').fill('A museum about equipment, not new space research. <img src=x onerror=alert(1)>');
    await page.getByRole('button',{name:'I can explain this in my own words',exact:true}).click();
    await expect(page.locator('#familiar-label')).toContainText('1 of 10');
    await page.reload();
    await expect(page.locator('#notes')).toHaveValue(/<img src=x/);
    await expect(page.locator('#content img')).toHaveCount(0);
    await expect(page.locator('#familiar-label')).toContainText('1 of 10');
    await expect(page.locator('#practice-answer')).toBeHidden();
    await page.getByRole('button',{name:'Show a sample answer',exact:true}).click();
    await expect(page.locator('#practice-answer')).toBeVisible();
    const old=await page.locator('#question').innerText();
    await page.getByRole('button',{name:'Try another question',exact:true}).click();
    assert.notEqual(await page.locator('#question').innerText(),old);
    await expect(page.locator('#practice-answer')).toBeHidden();
  });
  await check('Desktop and phone layouts remain readable without horizontal overflow',async()=>{
    for(const width of [1440,768,390]){
      await page.setViewportSize({width,height:1000});
      for(const section of ['learn','basics','mentor','practice']){
        await page.goto(`${base}/prep.html#${section}`);await page.locator('#question').waitFor();
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width}px ${section}`);
      }
      await page.goto(`${base}/prep.html#learn`);
      await page.screenshot({path:`test-results/prep-${width}.png`,fullPage:true});
    }
  });
  await check('No speech or browser storage is required to learn and practise',async()=>{
    const fallback=await browser.newContext({viewport:{width:390,height:900}});
    await fallback.addInitScript(()=>{Object.defineProperty(window,'speechSynthesis',{value:undefined});Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage blocked');}});});
    const p=await fallback.newPage();const fallbackErrors=[];p.on('pageerror',e=>fallbackErrors.push(e.message));
    await p.goto(`${base}/prep.html#practice`);
    await p.getByRole('button',{name:'Show a sample answer',exact:true}).click();
    await expect(p.getByRole('button',{name:'Listen to this answer',exact:true})).toBeDisabled();
    await p.locator('#notes').fill('I can practise without saving.');
    await expect(p.locator('#save-status')).toContainText('Could not save');
    await expect(p.locator('#speech-status')).not.toContainText('microphone access');
    assert.deepEqual(fallbackErrors,[]);await fallback.close();
  });
  assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);assert.deepEqual(external,[]);
  console.log(`${checks.length} presentation-practice checks passed; no console errors, failed resources or external requests.`);
}finally{await writeFile('test-results/prep-results.json',JSON.stringify({base,checks,errors,failures,external},null,2));await browser.close();}
