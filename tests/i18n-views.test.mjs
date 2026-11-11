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
 const element={innerHTML:'',textContent:'',dataset:{},contains:()=>false,showModal(){},close(){},focus(){},setAttribute(){},classList:{toggle(){},add(){},remove(){}}};
 const nodes=new Map();const get=key=>{if(!nodes.has(key))nodes.set(key,{...element});return nodes.get(key);};
 const context=vm.createContext({...domain,...catalog,...notes,...journal,...activity,...storageModule,...i18n,t:i18n.translateText,localize:()=>{},
  desktop:null,storage:{getItem:()=>null},localStorage:{getItem:()=>null},navigator:{language:'en'},URL,URLSearchParams,Date,Math,JSON,CSS:{escape:s=>s},
  location:{search:'?lang=en',href:'http://localhost/?lang=en'},
  document:{documentElement:{},body:{classList:{toggle(){},contains:()=>false}},activeElement:null,querySelector:selector=>selector==='dialog[open]'?null:get(selector),querySelectorAll:()=>[],addEventListener(){}},
  window:{addEventListener(){},matchMedia:()=>({matches:false})},setInterval(){},setTimeout(){},clearTimeout(){},
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
 check(run('gardenPage()'));check(run('journalPage()'));
 for(const expression of ['settings()','help()','share()','showInstall()']){run(expression);check(get('#modal').innerHTML);}
 context.desktop={companion:()=>({visible:true,size:144})};run('state.activity={enabled:true}');
 check(run('activitySettings()'));check(run('desktopSettings()'));
});
