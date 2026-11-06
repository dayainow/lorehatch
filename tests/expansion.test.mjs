import test from 'node:test';
import assert from 'node:assert/strict';
import {IDS,initialState,selectEgg,confirmReady,earn,parseSave,recordCare} from '../app/domain.mjs';
import {encounters,rememberEncounter,milestones} from '../app/journal.mjs';
import {friendship} from '../app/fieldnotes.mjs';
test('all 30 companions retain both care stages and memories through the complete collection loop',()=>{
 let s=initialState('demo');
 const roundtrip=()=>{s=parseSave(JSON.stringify(s),'demo');};
 const advance=n=>{for(let i=0;i<n;i+=5)s=earn(s,Math.min(5,n-i));};
 for(const id of IDS){
  s=selectEgg(s,id);if(s.phase==='incubating')advance(15);
  assert.equal(s.phase,'hatch_ready');s=confirmReady(s);roundtrip();
  s=recordCare(s,id);advance(30);assert.equal(s.phase,'growth_ready');
  s=confirmReady(s);s=recordCare(s,id);
  s=rememberEncounter(s,id,encounters[id][2]);roundtrip();
  assert.deepEqual(s.pets.find(p=>p.id===id).care,['baby','adult']);
  assert.ok(s.memories.includes(id));
 }
 assert.equal(s.phase,'complete');assert.equal(s.memories.length,30);
 assert.ok(IDS.every(id=>friendship(id,s.pets).complete));
 assert.equal(milestones(s).filter(m=>m.complete).length,14);
});
