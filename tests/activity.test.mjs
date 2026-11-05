import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,selectEgg,confirmReady,parseSave,dayKey} from '../app/domain.mjs';
import {connectActivity,creditActivity} from '../app/activity.mjs';
const now=1800000000000;
const start=()=>connectActivity(confirmReady(selectEgg(initialState('normal',dayKey(new Date(now))),'D01')),true,now);
test('activity records a minute once and persists the deduplication cursor',()=>{
 const s=start(), next=creditActivity(s,now+61000,now+62000);
 assert.equal(next.total-s.total,60);
 assert.strictEqual(creditActivity(next,now+65000,now+66000),next);
 const restored=parseSave(JSON.stringify(next));
 assert.strictEqual(creditActivity(restored,now+65000,now+66000),restored);
 assert.equal(s.total,0);
});
test('disabled, historical, expired, future and invalid signals do not grant growth',()=>{
 const s=start();
 for(const t of [now-1000,now+1000,now+61001,NaN,Infinity,'1800000060000'])assert.strictEqual(creditActivity(s,t,now+61000),s);
 assert.strictEqual(creditActivity(s,now+61000,now+122000),s);
 const off=connectActivity(s,false,now);assert.strictEqual(creditActivity(off,now+61000,now+62000),off);
});
test('AI credit observes the daily cap, rejects demo and never backfills reconnects',()=>{
 const s={...start(),daily:8990};const next=creditActivity(s,now+61000,now+62000);assert.equal(next.daily,9000);
 const demo={...start(),mode:'demo'};assert.strictEqual(creditActivity(demo,now+61000,now+62000),demo);
 const reconnected=connectActivity(next,true,now+120000);assert.strictEqual(creditActivity(reconnected,now+61000,now+121000),reconnected);
});
