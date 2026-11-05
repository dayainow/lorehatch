import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
async function harness(){
 const handlers={},deleted=[],cache=new Map(),network=[];
 const self={location:{href:'https://example.test/lorehatch/service-worker.js'},addEventListener:(k,fn)=>handlers[k]=fn,clients:{claim:async()=>{}},skipWaiting(){this.skipped=true;}};
 const caches={open:async()=>({addAll:async list=>list.forEach(p=>cache.set(p,'cached:'+p)),match:async url=>cache.get(typeof url==='string'?url:url.url)}),keys:async()=>['other-app','lorehatch-old','lorehatch-test'],delete:async k=>deleted.push(k)};
 const code=(await readFile('service-worker.js','utf8')).replace('__BUILD_ID__','test').replace('/* PRECACHE */ []',JSON.stringify(['./','./app/main.mjs']));
 vm.runInNewContext(code,{self,caches,URL,fetch:async r=>{network.push(r.url);throw Error('offline');}});
 return {handlers,cache,deleted,network,self};
}
test('offline app navigation reuses the cached shell for normal and demo modes',async()=>{
 const h=await harness();let task;h.handlers.install({waitUntil:p=>task=p});await task;
 for(const path of ['','?mode=demo']){h.handlers.fetch({request:{url:'https://example.test/lorehatch/'+path,method:'GET',mode:'navigate'},respondWith:p=>task=p});assert.equal(await task,'cached:https://example.test/lorehatch/');}
 assert.equal(h.network.length,0);
});
test('activation removes only older Lorehatch caches and updates require an explicit message',async()=>{
 const h=await harness();let task;h.handlers.activate({waitUntil:p=>task=p});await task;
 assert.deepEqual(h.deleted,['lorehatch-old']);assert.equal(h.self.skipped,undefined);
 h.handlers.message({data:{type:'SKIP_WAITING'}});assert.equal(h.self.skipped,true);
});
test('external resources and non-GET requests bypass the app cache',async()=>{
 const h=await harness();let intercepted=false;
 for(const request of [{url:'https://github.com/dayainow/lorehatch',method:'GET'},{url:'https://example.test/lorehatch/save',method:'POST'}])h.handlers.fetch({request,respondWith:()=>intercepted=true});
 assert.equal(intercepted,false);
});
