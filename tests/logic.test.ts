import {describe,it,expect,vi} from 'vitest';
import {Round,positions,DURATIONS,TOTAL_ROUNDS,readBest,saveBest} from '../src/logic';
describe('round scoring and lifecycle',()=>{
 it('accepts only one action per opportunity',()=>{const r=new Round();expect(r.hit('eppy')).toBe(false);r.open();expect(r.hit('eppy')).toBe(true);expect(r.hit('flower')).toBe(false);expect(r.score).toBe(1);});
 it('awards +1, -2, -1 and 0 exactly',()=>{const r=new Round();for(const h of ['eppy','flower','empty','miss'] as const){r.open();r.hit(h);}expect(r.score).toBe(-2);expect(r.outcomes).toHaveLength(4);});
 it('requires ten completed opportunities and seven points',()=>{const r=new Round();for(let i=0;i<7;i++){r.open();r.hit('eppy');}expect(r.passed).toBe(false);for(let i=0;i<3;i++){r.open();r.hit('miss');}expect(r.passed).toBe(true);r.open();expect(r.hit('eppy')).toBe(false);expect(r.score).toBe(7);});
 it('fails below seven and supports negative scores',()=>{const r=new Round();for(let i=0;i<10;i++){r.open();r.hit('flower');}expect(r.score).toBe(-20);expect(r.done).toBe(true);expect(r.passed).toBe(false);});
 it('resets independently and speeds up each round',()=>{expect(DURATIONS[0]).toBeGreaterThan(DURATIONS[1]);expect(DURATIONS[1]).toBeGreaterThan(DURATIONS[2]);expect(TOTAL_ROUNDS).toBe(20);expect(DURATIONS).toHaveLength(20);expect(DURATIONS[0]).toBeCloseTo(3000/1.3);expect(DURATIONS[0]/DURATIONS[19]).toBeCloseTo(15);for(let i=1;i<20;i++){expect(DURATIONS[i]).toBeGreaterThan(0);expect(DURATIONS[i]).toBeLessThan(DURATIONS[i-1]);expect(DURATIONS[i-1]/DURATIONS[i]).toBeCloseTo(15**(1/19));}expect(new Round(20).duration).toBe(DURATIONS[19]);expect(new Round().outcomes).toEqual([]);});
 it('always yields nine distinct in-bounds slots',()=>{for(let i=0;i<100;i++){const p=positions();expect(new Set(p).size).toBe(9);expect(p.every(n=>n>=0&&n<=8)).toBe(true);}});
});

it('preserves old records and persists a 200-point completion',()=>{let stored='30';vi.stubGlobal('localStorage',{getItem:()=>stored,setItem:(_key:string,value:string)=>{stored=value;}});try{expect(readBest()).toBe(30);expect(saveBest(200)).toBe(200);expect(readBest()).toBe(200);expect(saveBest(10)).toBe(200);}finally{vi.unstubAllGlobals();}});
