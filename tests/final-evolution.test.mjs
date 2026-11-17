import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,selectEgg,confirmReady,earn,beginFinal,parseSave,targetSeconds} from '../app/domain.mjs';
test('existing first evolution can reach a persisted final form without counting another species',()=>{
 let s=confirmReady(selectEgg(initialState('demo'),'D01'));
 for(let i=0;i<6;i++)s=earn(s,5);
 s=confirmReady(s);
 assert.equal(s.pets[0].stage,'adult');
 s=beginFinal(parseSave(JSON.stringify(s),'demo'),'D01');
 assert.equal(targetSeconds(s),60);
 for(let i=0;i<12;i++)s=earn(s,5);
 s=confirmReady(parseSave(JSON.stringify(s),'demo'));
 assert.equal(s.pets.length,1);
 assert.equal(s.pets[0].finalForm,true);
 assert.equal(parseSave(JSON.stringify(s),'demo').pets[0].finalForm,true);
 assert.equal(beginFinal(s,'D01'),s);
});
