import {test,expect, type Page} from '@playwright/test';
type State={playing:boolean;paused:boolean;locked:boolean;score:number;attempts:number;level:number;target:number;flowers:number[];remaining:number;objects:number};
const state=(p:Page)=>p.evaluate(()=> (window as unknown as {__park:State}).__park);
async function slot(p:Page,n:number,touch=false){const b=(await p.locator('canvas').boundingBox())!;const x=b.x+(86+n%3*124)/420*b.width,y=b.y+(302+Math.floor(n/3)*117)/740*b.height;if(touch)await p.touchscreen.tap(x,y);else await p.mouse.click(x,y);}
async function ready(p:Page){await expect.poll(async()=>{const s=await state(p);return s?.playing&&!s.locked&&!s.paused;}).toBe(true);}
async function clockReady(p:Page){await p.clock.runFor(1050);for(let i=0;i<40;i++){const s=await state(p);if(s.playing&&!s.locked&&!s.paused)return;await p.clock.runFor(16);}throw new Error('Opportunity did not open');}
test('mobile touch, 20 rounds, result animation, persisted best and restart',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:3});const p=await context.newPage();const errors:string[]=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 await p.goto((process.env.GAME_URL || 'http://127.0.0.1:5174/game/')+'?test');await expect(p.locator('#start')).toBeVisible();await p.screenshot({path:'test-results/mobile-home.png'});await p.clock.install();await p.clock.pauseAt(new Date(Date.now()+1000));await p.locator('#start').tap();
 for(let round=1;round<=20;round++){
  for(let i=0;i<10;i++){await clockReady(p);const s=await state(p);await slot(p,s.target,true);if(i===0&&round===1)await p.screenshot({path:'test-results/mobile-kiss.png'});await expect.poll(async()=>(await state(p)).attempts).toBe(i+1);}
  await p.clock.runFor(1200);await expect(p.locator('#next')).toBeVisible();await expect(p.locator('#round-label')).toHaveText(`ROUND ${String(round).padStart(2,'0')} / 20`);expect((await state(p)).flowers.length).toBe(Math.min(round+1,4));expect((await state(p)).score).toBe(10);await p.screenshot({path:`test-results/round-${round}-clear.png`});if(round<20)await p.locator('#next').tap();
 }
 await expect(p.locator('h2').filter({hasText:'우리 사랑'})).toBeVisible();expect(await p.evaluate(()=>localStorage.getItem('kiss-park-best'))).toBe('200');await p.locator('#next').tap();await clockReady(p);expect((await state(p)).level).toBe(1);expect((await state(p)).score).toBe(0);await p.reload();await expect(p.locator('#best')).toHaveText('BEST 200');expect(errors).toEqual([]);await context.close();
});
test('mouse penalties, pause freezes clock, rapid clicks, timeout and failure',async({page:p})=>{
 await p.setViewportSize({width:1440,height:1000});await p.goto('?test');await expect(p.locator('#start')).toBeVisible();await expect.poll(()=>p.locator('img').evaluateAll(imgs=>imgs.every(img=>(img as HTMLImageElement).naturalWidth>0))).toBe(true);await p.screenshot({path:'test-results/desktop-home.png'});await p.locator('#start').click();await ready(p);
 await p.locator('#pause').click();const before=(await state(p)).remaining;await p.waitForTimeout(400);expect((await state(p)).remaining).toBe(before);await p.locator('#resume').click();await slot(p,(await state(p)).flowers[0]);expect((await state(p)).score).toBe(-2);await slot(p,0);expect((await state(p)).attempts).toBe(1);
 await ready(p);const b=(await p.locator('canvas').boundingBox())!;await p.mouse.click(b.x+b.width/2,b.y+b.height*.9);expect((await state(p)).score).toBe(-3);
 await ready(p);await expect.poll(async()=>(await state(p)).attempts,{timeout:6000}).toBe(3);expect((await state(p)).score).toBe(-3);
 for(let i=3;i<10;i++){await ready(p);await slot(p,(await state(p)).flowers[0]);}
 await expect(p.locator('.result-art.sad')).toBeVisible();await p.screenshot({path:'test-results/failure.png'});await p.locator('#home').click();await expect(p.locator('#start')).toBeVisible();
});
test('layouts and resize preserve session, sound controls work',async({page:p})=>{
 await p.goto('?test');await expect(p.locator('#start')).toBeVisible();await p.locator('#sound').click();await expect(p.locator('#sound')).toHaveAttribute('aria-pressed','false');await p.locator('#sound').click();await expect(p.locator('#sound')).toHaveAttribute('aria-pressed','true');
 for(const [width,height] of [[320,568],[375,667],[390,844],[430,932],[768,1024],[844,390]]){await p.setViewportSize({width,height});const box=(await p.locator('.game-shell').boundingBox())!;expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width+1);expect(box.y+box.height).toBeLessThanOrEqual(height+1);const start=(await p.locator('#start').boundingBox())!;expect(start.y+start.height).toBeLessThanOrEqual(box.y+box.height);await p.screenshot({path:`test-results/layout-${width}x${height}.png`});}
 await p.setViewportSize({width:390,height:844});await p.locator('#start').click();await ready(p);await slot(p,(await state(p)).target);await p.setViewportSize({width:844,height:390});expect((await state(p)).score).toBe(1);
});

