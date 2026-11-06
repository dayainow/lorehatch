import test from 'node:test';
import assert from 'node:assert/strict';
import {IDS,initialState,selectEgg,confirmReady,parseSave} from '../app/domain.mjs';
import {encounters,rememberEncounter,visitorFor,milestones} from '../app/journal.mjs';
const start=()=>confirmReady(selectEgg(initialState(),'D01'));
test('all species have original encounter choices and obtainable unique memories',()=>{
 assert.deepEqual(Object.keys(encounters).sort(),[...IDS].sort());
 for(const [id,[,choices,index]] of Object.entries(encounters)){
  assert.equal(new Set(choices).size,3);assert.ok(choices[index]);
  const state={pets:[{id}],memories:[]};
  assert.strictEqual(rememberEncounter(state,id,(index+1)%3),state);
  const next=rememberEncounter(state,id,index);assert.deepEqual(next.memories,[id]);
  assert.strictEqual(rememberEncounter(next,id,index),next);assert.deepEqual(state.memories,[]);
 }
});
test('memory saves roundtrip and reject unowned, duplicated, and malformed memories',()=>{
 const s=start(),next=rememberEncounter(s,'D01',0);
 assert.deepEqual(parseSave(JSON.stringify(next)).memories,['D01']);
 assert.strictEqual(rememberEncounter(s,'G01',1),s);
 for(const memories of [['G01'],['D01','D01'],'D01'])assert.throws(()=>parseSave(JSON.stringify({...s,memories})));
 assert.equal(parseSave(JSON.stringify(s)).memories,undefined);
});
test('visitors are stable owned friends and milestones are bounded',()=>{
 const s=start();assert.equal(visitorFor(s,'2026-11-05'),'D01');assert.equal(visitorFor(initialState(),'2026-11-05'),null);
 const marks=milestones(s);assert.deepEqual(marks.map(m=>m.number),Array.from({length:14},(_,i)=>String(i+1).padStart(2,'0')));assert.equal(marks.filter(m=>m.complete).length,1);
 assert.ok(marks.every(m=>m.value>=0&&m.value<=m.target));
 const full={pets:IDS.map(id=>({id,stage:'adult',care:['adult']})),memories:[...IDS]};
 assert.equal(milestones(full).filter(m=>m.complete).length,14);
});


test('expansion preserves earned original collection milestones',()=>{
 const old={pets:IDS.slice(0,18).map(id=>({id,stage:'adult',care:['adult']})),memories:IDS.slice(0,18)};
 const marks=milestones(old);
 for(const id of ['album','together'])assert.equal(marks.find(m=>m.id===id).complete,true);
 for(const id of ['album30','together15','shore','meadow'])assert.equal(marks.find(m=>m.id===id).complete,false);
 assert.equal(marks.filter(m=>m.complete).length,10);
});

test('malformed pet containers with memories return the supported save error',()=>{
 for(const pets of [null,{},[null],[{}]]){
  assert.throws(()=>parseSave(JSON.stringify({...start(),pets,memories:['D01']})),{message:'지원하지 않거나 손상된 저장 파일입니다.'});
 }
});
