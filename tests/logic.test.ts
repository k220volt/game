import {describe,it,expect,vi} from 'vitest';
import {Round,Run,positions,DURATIONS,TOTAL_ROUNDS,MAX_TOTAL_SCORE,readBest,saveBest} from '../src/logic';
describe('round scoring and lifecycle',()=>{
 it('accepts only one action per opportunity',()=>{const r=new Round();expect(r.hit('eppy')).toBe(false);r.open();expect(r.hit('eppy')).toBe(true);expect(r.hit('flower')).toBe(false);expect(r.score).toBe(1);});
 it('awards +1, -2, -1 and 0 exactly',()=>{const r=new Round();for(const h of ['eppy','flower','empty','miss'] as const){r.open();r.hit(h);}expect(r.score).toBe(-2);expect(r.outcomes).toHaveLength(4);});
 it('requires ten completed opportunities and seven points',()=>{const r=new Round();for(let i=0;i<7;i++){r.open();r.hit('eppy');}expect(r.passed).toBe(false);for(let i=0;i<3;i++){r.open();r.hit('miss');}expect(r.passed).toBe(true);r.open();expect(r.hit('eppy')).toBe(false);expect(r.score).toBe(7);});
 it('fails below seven and supports negative scores',()=>{const r=new Round();for(let i=0;i<10;i++){r.open();r.hit('flower');}expect(r.score).toBe(-20);expect(r.done).toBe(true);expect(r.passed).toBe(false);});
 it('resets independently and speeds up each round',()=>{expect(DURATIONS[0]).toBeGreaterThan(DURATIONS[1]);expect(DURATIONS[1]).toBeGreaterThan(DURATIONS[2]);expect(TOTAL_ROUNDS).toBe(20);expect(DURATIONS).toHaveLength(20);expect(DURATIONS[0]).toBeCloseTo(3000/1.3);expect(DURATIONS[0]/DURATIONS[19]).toBeCloseTo(15);for(let i=1;i<20;i++){expect(DURATIONS[i]).toBeGreaterThan(0);expect(DURATIONS[i]).toBeLessThan(DURATIONS[i-1]);expect(DURATIONS[i-1]/DURATIONS[i]).toBeCloseTo(15**(1/19));}expect(new Round(20).duration).toBe(DURATIONS[19]);expect(new Round().outcomes).toEqual([]);});
 it('always yields nine distinct in-bounds slots',()=>{for(let i=0;i<100;i++){const p=positions();expect(new Set(p).size).toBe(9);expect(p.every(n=>n>=0&&n<=8)).toBe(true);}});
});
function finished(level: number, win: boolean) { const r = new Round(level); for(let i=0;i<10;i++){r.open();r.hit(win?'eppy':'flower');}return r; }
it('allows two retries and ends on the third failure across rounds',()=>{
 const run=new Run();run.finish(finished(1,true));run.finish(finished(2,false));
 expect(run.remaining).toBe(2);expect(run.over).toBe(false);expect(run.total).toBe(-10);
 run.finish(finished(2,true));expect(run.remaining).toBe(2);
 run.finish(finished(3,false));expect(run.over).toBe(false);
 run.finish(finished(3,false));expect(run.remaining).toBe(0);expect(run.over).toBe(true);expect(run.total).toBe(-40);
 expect(run.finish(finished(3,true))).toBe(false);expect(run.total).toBe(-40);
});
it('records each finished attempt once and resets with a new game',()=>{
 const run=new Run(), r=finished(1,false);expect(run.finish(new Round())).toBe(false);
 expect(run.finish(r)).toBe(true);expect(run.finish(r)).toBe(false);expect(run.remaining).toBe(2);
 const fresh=new Run();expect(fresh.remaining).toBe(3);expect(fresh.total).toBe(0);expect(fresh.over).toBe(false);
});
it('ends only after clearing the final round or exhausting chances',()=>{
 const run=new Run();for(let level=1;level<20;level++){run.finish(finished(level,true));expect(run.over).toBe(false);}
 run.finish(finished(20,true));expect(run.complete).toBe(true);expect(run.over).toBe(true);expect(run.total).toBe(200);
 const retry=new Run();retry.finish(finished(20,false));expect(retry.over).toBe(false);retry.finish(finished(20,true));expect(retry.complete).toBe(true);
});
it('keeps cumulative records above 200 when failed attempts scored points',()=>{
 let stored='0';vi.stubGlobal('localStorage',{getItem:()=>stored,setItem:(_key:string,value:string)=>{stored=value;}});
 try{expect(MAX_TOTAL_SCORE).toBe(212);saveBest(212);expect(readBest()).toBe(212);}finally{vi.unstubAllGlobals();}
});

it('preserves old records and persists a 200-point completion',()=>{let stored='30';vi.stubGlobal('localStorage',{getItem:()=>stored,setItem:(_key:string,value:string)=>{stored=value;}});try{expect(readBest()).toBe(30);expect(saveBest(200)).toBe(200);expect(readBest()).toBe(200);expect(saveBest(10)).toBe(200);}finally{vi.unstubAllGlobals();}});
