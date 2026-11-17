import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import * as domain from '../app/domain.mjs';
import * as catalog from '../app/content.mjs';
import * as notes from '../app/fieldnotes.mjs';
import * as journal from '../app/journal.mjs';
import * as activity from '../app/activity.mjs';
import * as storageModule from '../app/storage.mjs';
import * as i18n from '../app/i18n.mjs';
// Exercise the real view templates without starting a browser, timers, downloads, or native APIs.
test('every rendered catalog and dialog has English copy, including composed labels',async()=>{
 i18n.setLocale('en');
 const element={style:{},innerHTML:'',textContent:'',dataset:{},contains:()=>false,showModal(){},close(){},focus(){},setAttribute(){},classList:{toggle(){},add(){},remove(){}}};
 const nodes=new Map();const get=key=>{if(!nodes.has(key))nodes.set(key,{...element});return nodes.get(key);};
 let tick, monotonicTime=0;
 const events=new Map();
 const context=vm.createContext({...domain,...catalog,...notes,...journal,...activity,...storageModule,...i18n,t:i18n.translateText,localize:()=>{},
  desktop:null,storage:{getItem:()=>null},localStorage:{getItem:()=>null},navigator:{language:'en'},URL,URLSearchParams,Date,Math,JSON,CSS:{escape:s=>s},
  location:{search:'?lang=en',href:'http://localhost/?lang=en'},
  document:{documentElement:{},body:{classList:{toggle(){},contains:()=>false}},activeElement:null,querySelector:selector=>selector==='dialog[open]'?null:get(selector),querySelectorAll:()=>[],addEventListener:(name,listener)=>events.set(name,listener)},
  window:{addEventListener:(name,listener)=>events.set(name,listener),matchMedia:()=>({matches:false})},
  performance:{now:()=>monotonicTime},setInterval:callback=>{tick=callback;},setTimeout(){},clearTimeout(){},
  installed:()=>false,installationAvailable:()=>false,publicURL:s=>s,SITE:'https://dayainow.github.io/lorehatch/',shareText:()=>''
 });
 let source=(await readFile(new URL('../app/main.mjs',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'');
 source=source.slice(0,source.lastIndexOf('\nrender();\nif(desktop)'));
 source=source.replaceAll('import.meta.url',JSON.stringify('http://localhost/app/main.mjs'));
 vm.runInContext(source,context);
 const check=html=>{
  const text=[...html.matchAll(/>([^<>]*)</g)].map(m=>m[1]).concat([...html.matchAll(/(?:aria-label|placeholder)="([^"]*)"/g)].map(m=>m[1]));
  for(const s of text)if(s.trim()&&!s.includes('한국어'))assert.doesNotMatch(i18n.translateText(s,'en'),/[가-힣]/,s);
 };
 const run=expression=>vm.runInContext(expression,context);
 for(const expression of ['gardenPage()','collectionPage()','journalPage()'])check(run(expression));
 for(const id of domain.IDS){run(`detail('${id}')`);check(get('#modal').innerHTML);}
 const full=domain.initialState();full.tutorialClaimed=true;full.phase='complete';full.partner='G02';full.pets=domain.IDS.map(id=>({id,stage:'adult',nickname:'',hatchedAt:'2026-11-11T00:00:00Z',grownAt:'2026-11-11T01:00:00Z',care:['baby','adult']}));
 context.fixture=full;run('state=fixture');
 for(let habitat=0;habitat<5;habitat++){run(`guideHabitat=${habitat}`);check(run('collectionPage()'));}
 for(const id of domain.IDS){
  run(`detail('${id}')`);check(get('#modal').innerHTML);
  run(`detail('${id}','baby')`);check(get('#modal').innerHTML);
  run(`encounterPage('${id}')`);check(get('#modal').innerHTML);
  run(`state.memories=['${id}'];encounterPage('${id}')`);check(get('#modal').innerHTML);
 }

 // Every species and evolution form reaches the shared motion view and native bridge.
 const sent=[];
 context.desktop={menu:(...args)=>sent.push(args)};
 for(const id of domain.IDS)for(const form of ['baby','adult','final']){
  run(`state.partner='${id}';state.pets=state.pets.map(p=>p.id==='${id}'?{...p,stage:'${form==='baby'?'baby':'adult'}',finalForm:${form==='final'}}:p)`);
  for(const active of [false,true]){
   run(`running=${active};previousMenu='';updateMenu()`);
   const html=run('scene()');
   assert.match(html,new RegExp(id+'-'+form+'-0.svg'));
   assert.match(html,new RegExp('data-mood="'+(active?'focus':'idle')+'"'));
   assert.equal(sent.at(-1)[2],id+'-'+form);
   assert.equal(sent.at(-1)[4],active);
  }
 }
 run('running=false');
 context.desktop=null;
 check(run('gardenPage()'));check(run('journalPage()'));
 for(const expression of ['settings()','help()','share()','showInstall()']){run(expression);check(get('#modal').innerHTML);}
 context.desktop={companion:()=>({visible:true,size:144})};run('state.activity={enabled:true}');
 check(run('activitySettings()'));check(run('desktopSettings()'));

 // A hidden Mac garden still earns for a pet session, and suspend clears the native focus indicator.
 const focusStates=[];
 context.desktop={backgroundFocus:true,menu:(...args)=>focusStates.push(args[4])};
 context.storage.setItem=()=>{};
 const egg=domain.selectEgg(domain.initialState(),catalog.starters[0]);
 context.fixture=domain.confirmReady(egg);
 context.document.hidden=true;
 run('state=fixture; lockOwned=true');
 assert.equal(run('toggleSession()'),'started');
 check(run('quickActions()'));
 assert.match(run('quickActions()'), /data-running="true"/);
 events.get('moamon-garden-closed')();
 monotonicTime=1000;
 tick();
 assert.equal(run('state.active.progress'),1);
 assert.equal(focusStates.at(-1),true);
 events.get('lorehatch-suspend')();
 assert.equal(focusStates.at(-1),false);
 context.desktop=null;
 run('toggleSession()');
 monotonicTime=2000;
 tick();
 assert.equal(run('state.active.progress'),1);

 // The same action works from the garden, mobile quick bar, and Mac menu.
 const id=catalog.starters[0];
 run(`detail('${id}')`);
 assert.match(get('#modal').innerHTML,/data-stage="adult"[^>]*disabled/);
 check(get('#modal').innerHTML);
 run("for(let i=0;i<180 && state.phase==='raising';i++)state=earn(state, Math.min(5,targetSeconds(state)-state.active.progress))");
 assert.equal(run('state.phase'),'growth_ready');
 assert.equal(run('menuCare()[0]'),'confirm');
 assert.equal(i18n.translateText(run('menuCare()[1]'),'en'),'Evolve');
 check(run('gardenPage()'));
 assert.match(run('quickActions()'),/진화시키기/);
 events.get('click')({target:{closest:()=>({dataset:{action:'confirm'},hasAttribute:()=>false})}});
 assert.equal(run('state.pets[0].stage'),'adult');
 assert.equal(get('#modal').dataset.kind,'evolution');
 assert.match(get('#modal').innerHTML,new RegExp(id+'-baby-0'));
 assert.match(get('#modal').innerHTML,new RegExp(id+'-adult-0'));
 check(get('#modal').innerHTML);
 assert.match(run('collectionPage(true)'),/1차 진화/);
 run(`detail('${id}')`);
 assert.match(get('#modal').innerHTML,/data-stage="adult" aria-pressed="true"/);

});
