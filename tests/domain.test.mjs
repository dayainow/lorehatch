import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,selectEgg,confirmReady,earn,parseSave,setPartner,renamePet,MODES} from '../app/domain.mjs';
import {load,persist,keyFor} from '../app/storage.mjs';
const date='2026-10-29';
const start=()=>confirmReady(selectEgg(initialState('demo',date),'D01'));
function advance(s,n,day=date){while(n>0){const d=Math.min(n,5);s=earn(s,d,day);n-=d;}return s;}
const memory=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)};};
test('first hatch is instant and confirmation cannot duplicate a pet',()=>{const s=selectEgg(initialState('demo',date),'D01');assert.equal(s.phase,'hatch_ready');const p=confirmReady(s);assert.equal(p.pets.length,1);assert.strictEqual(confirmReady(p),p);assert.equal(p.phase,'raising');});
test('all three species complete without duplicate awards',()=>{let s=start();s=confirmReady(advance(s,30));for(const id of ['G01','G02']){s=selectEgg(s,id);assert.equal(s.phase,'incubating');s=confirmReady(advance(s,15));s=confirmReady(advance(s,30));}assert.equal(s.phase,'complete');assert.equal(s.total,120);assert.equal(s.pets.filter(p=>p.stage==='adult').length,3);assert.strictEqual(selectEgg(s,'D01'),s);assert.deepEqual(parseSave(JSON.stringify(s)),s);});
test('overflow survives completion and is applied to next egg',()=>{let s=advance(start(),35);assert.equal(s.phase,'growth_ready');assert.equal(s.bank,5);s=selectEgg(confirmReady(s),'G01');assert.equal(s.active.progress,5);assert.equal(s.bank,0);});
test('daily cap holds and past date cannot reset it',()=>{let s=advance(start(),9100);assert.equal(s.daily,9000);s=earn(s,5,'2026-10-28');assert.equal(s.daily,9000);s=earn(s,5,'2026-10-30');assert.equal(s.daily,5);assert.equal(s.total,9005);});
test('sleep gaps, negative values and nonfinite deltas are ignored',()=>{const s=start();for(const delta of [6,3600,-1,NaN,Infinity])assert.strictEqual(earn(s,delta),s);});
test('normal balance and demo saves remain separate',()=>{assert.equal(MODES.normal.growth,4500);assert.throws(()=>parseSave(JSON.stringify(start()),'normal'));const m=memory();persist(m,start());assert.equal(load(m,'normal').state.pets.length,0);assert.equal(load(m,'demo').state.pets.length,1);});
test('partner selection does not change raising target',()=>{let s=confirmReady(advance(start(),30));s=confirmReady(advance(selectEgg(s,'G01'),15));s=setPartner(s,'D01');assert.equal(s.active.id,'G01');assert.equal(s.partner,'D01');assert.strictEqual(setPartner(s,'invalid'),s);});
test('nickname trims and limits length',()=>{const s=renamePet(start(),'D01','  '+ '가'.repeat(30)+'  ');assert.equal(s.pets[0].nickname.length,20);});
test('invalid import fails without touching original state',()=>{const s=start();for(const mutate of [x=>x.pets.push(x.pets[0]),x=>x.active.id='bad',x=>x.bank=-1,x=>x.phase='complete',x=>x.day='2026-02-31',x=>x.settings=null,x=>x.partner='G02',x=>x.pets[0].stage='adult',x=>x.schemaVersion=999]){const copy=structuredClone(s);mutate(copy);assert.throws(()=>parseSave(JSON.stringify(copy)));}assert.equal(s.pets.length,1);assert.throws(()=>parseSave('x'.repeat(100001)));assert.throws(()=>parseSave('{'));});
test('unknown fields are stripped from imports',()=>{const s=start();s.evil='ignored';assert.equal(parseSave(JSON.stringify(s)).evil,undefined);});
test('save roundtrip and recovery from corrupted primary',()=>{const m=memory();const s=start();persist(m,s);persist(m,advance(s,5));m.setItem(keyFor('demo'),'{bad');const result=load(m,'demo');assert.deepEqual(result.state,s);assert.match(result.warning,/백업/);});
test('corrupt primary without backup is preserved and blocks overwrite',()=>{const m=memory();m.setItem(keyFor('demo'),'bad');assert.equal(load(m,'demo').blocked,true);assert.equal(m.getItem(keyFor('demo')),'bad');});
test('storage unavailable reports a blocked session',()=>{assert.equal(load({getItem(){throw Error('denied')}},'demo').blocked,true);});
test('transitions do not mutate their input',()=>{const s=start(),snapshot=JSON.stringify(s);advance(s,40);renamePet(s,'D01','test');assert.equal(JSON.stringify(s),snapshot);});
test('every transition survives save validation over full normal run',()=>{let s=initialState('normal',date);let day=date;for(const id of ['D01','G01','G02']){s=selectEgg(s,id);for(let i=0;i<3000;i++){s=parseSave(JSON.stringify(s));if(s.phase.endsWith('ready'))s=confirmReady(s);if(s.phase==='idle'||s.phase==='complete')break;if(s.daily===9000)day='2026-10-30';s=earn(s,5,day);}}assert.equal(s.phase,'complete');assert.equal(s.total,16500);});
test('missing or empty primary recovers the last valid backup',()=>{
 for(const primary of [null,'']){
  const m=memory(),s=start(),key=keyFor('demo');
  m.setItem(`${key}.backup`,JSON.stringify(s));if(primary!==null)m.setItem(key,primary);
  const result=load(m,'demo');assert.deepEqual(result.state,s);assert.match(result.warning,/백업/);
 }
});
test('invalid backup preserves data and reports recovery rather than access failure',()=>{
 for(const primary of [null,'bad']){
  const m=memory(),key=keyFor('demo');m.setItem(`${key}.backup`,'broken backup');if(primary!==null)m.setItem(key,primary);
  const result=load(m,'demo');assert.equal(result.blocked,true);assert.match(result.warning,/저장 데이터를 읽지 못/);
  assert.equal(m.getItem(key),primary);assert.equal(m.getItem(`${key}.backup`),'broken backup');
 }
});
test('backup write failure leaves the valid primary untouched',()=>{
 const m=memory(),s=start(),key=keyFor('demo');persist(m,s);
 const failing={getItem:m.getItem,setItem(k,v){if(k.endsWith('.backup'))throw Error('quota');m.setItem(k,v);}};
 assert.throws(()=>persist(failing,advance(s,5)),/quota/);assert.deepEqual(load(m,'demo').state,s);
});
test('primary write failure retains a valid primary and backup',()=>{
 const m=memory(),s=start(),key=keyFor('demo');persist(m,s);
 const failing={getItem:m.getItem,setItem(k,v){if(k===key)throw Error('quota');m.setItem(k,v);}};
 assert.throws(()=>persist(failing,advance(s,5)),/quota/);
 assert.deepEqual(load(m,'demo').state,s);assert.deepEqual(parseSave(m.getItem(`${key}.backup`),'demo'),s);
});
test('saving recovered data never replaces a valid backup with corrupt primary',()=>{
 const m=memory(),s=start(),key=keyFor('demo');m.setItem(key,'bad');m.setItem(`${key}.backup`,JSON.stringify(s));
 persist(m,advance(load(m,'demo').state,5));assert.deepEqual(parseSave(m.getItem(`${key}.backup`),'demo'),s);
 assert.equal(load(m,'demo').state.active.progress,5);
});
