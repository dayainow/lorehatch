import { cp, mkdir, rm, readdir, readFile, writeFile } from 'node:fs/promises';
import {createHash} from 'node:crypto';
await rm('dist',{recursive:true,force:true});await mkdir('dist');
for (const path of ['index.html','manifest.webmanifest','app','data','assets']) await cp(path,`dist/${path}`,{recursive:true});
// Concept sheets and development-sized icon sources are not runtime dependencies.
await rm('dist/assets/concepts',{recursive:true,force:true});
let assets=['./'];const hash=createHash('sha256');
async function collect(dir=''){
 for(const entry of await readdir(`dist/${dir}`,{withFileTypes:true})){
  const path=dir+entry.name;
  if(entry.isDirectory())await collect(path+'/');
  else {assets.push('./'+path);hash.update(path);hash.update(await readFile('dist/'+path));}
 }
}
await collect();
const worker=(await readFile('service-worker.js','utf8')).replace('__BUILD_ID__',hash.digest('hex').slice(0,12)).replace('/* PRECACHE */ []',JSON.stringify(assets));
await writeFile('dist/service-worker.js',worker);
console.log(`Static build: dist/ (${assets.length} offline assets)`);
