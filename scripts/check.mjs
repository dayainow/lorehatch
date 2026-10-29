import { readFile, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { MODES, IDS } from '../app/domain.mjs';
for (const dir of ['app','scripts','tests']) for (const file of await readdir(dir)) if(file.endsWith('.mjs')) execFileSync(process.execPath,['--check',`${dir}/${file}`]);
const balance=JSON.parse(await readFile('data/balance.json','utf8'));
if(balance.growth_minutes*60!==MODES.normal.growth || balance.incubation_minutes*60!==MODES.normal.hatch || balance.daily_earning_cap_minutes*60!==MODES.normal.cap || JSON.stringify(balance.mvp_species_ids)!==JSON.stringify(IDS)) throw Error('Balance drift');
console.log('PASS: module syntax and planning balance parity');
const catalog = JSON.parse(await readFile('data/creatures.json','utf8'));
const plan = JSON.parse(await readFile('data/collection-plan.json','utf8'));
const { content, profiles, sourceLinks } = await import('../app/content.mjs');
const sameSet=(a,b)=>a.length===b.length&&new Set(a).size===a.length&&a.every(id=>b.includes(id));
const byId=new Map(catalog.creatures.map(c=>[c.id,c]));
if(byId.size!==catalog.creatures.length)throw Error('Duplicate catalog ID');
if(!sameSet(Object.keys(content),IDS)||!sameSet(Object.keys(profiles),IDS)||!sameSet(plan.playable_species_ids,IDS))throw Error('Playable content drift');
for(const c of catalog.creatures)for(const source of c.source_ids)if(!catalog.sources[source])throw Error(`Unknown source: ${c.id}/${source}`);
for(const [id,source] of Object.entries(sourceLinks))if(catalog.sources[source.id]!==source.url||!byId.get(id)?.source_ids.includes(source.id))throw Error(`Source link drift: ${id}`);
const planned=plan.species.map(c=>c.id);
const target=catalog.creatures.filter(c=>c.scope!=='deferred').map(c=>c.id);
if(plan.target_species_count!==target.length||!sameSet([...IDS,...planned],target)||!sameSet(plan.waves.flatMap(w=>w.species_ids),planned))throw Error('Collection plan count or wave drift');
for(const c of plan.species){
 if(byId.get(c.id)?.scope!=='collection')throw Error(`Unplanned species: ${c.id}`);
 for(const key of ['egg_pattern','silhouette','baby','adult','personality_ko','idle_motion_ko','pet_reaction_ko','growth_line_ko','research_gate_ko','art_gate_ko'])if(typeof c[key]!=='string'||!c[key].trim())throw Error(`Missing design field: ${c.id}/${key}`);
}
for(const id of IDS)for(const stage of ['baby','adult'])for(let frame=0;frame<2;frame++)await readFile(`assets/sprites/${id}-${stage}-${frame}.svg`);
console.log('PASS: 3 playable + 7 planned species, release waves and source links');
