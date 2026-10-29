import { readFile, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { MODES, IDS } from '../app/domain.mjs';
for (const dir of ['app','scripts','tests']) for (const file of await readdir(dir)) if(file.endsWith('.mjs')) execFileSync(process.execPath,['--check',`${dir}/${file}`]);
const balance=JSON.parse(await readFile('data/balance.json','utf8'));
if(balance.growth_minutes*60!==MODES.normal.growth || balance.incubation_minutes*60!==MODES.normal.hatch || balance.daily_earning_cap_minutes*60!==MODES.normal.cap || JSON.stringify(balance.mvp_species_ids)!==JSON.stringify(IDS)) throw Error('Balance drift');
console.log('PASS: module syntax and planning balance parity');
