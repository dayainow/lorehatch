import {readFile,writeFile} from 'node:fs/promises';
let s='<svg xmlns="http://www.w3.org/2000/svg" width="960" height="570" viewBox="0 0 960 570"><rect width="960" height="570" rx="20" fill="#f4f0e3"/><g font-family="Arial,sans-serif" fill="#294438"><text x="40" y="50" font-size="25" font-weight="bold">MOAMON · YOUR FIRST FRIEND</text><text x="40" y="82" font-size="15">Baby → Grown · Original 32px game sprites</text></g>';
for(const [i,id] of ['D01','G01','G02'].entries()){
 for(const [j,stage] of ['baby','adult'].entries()){
 const svg=await readFile(`assets/sprites/${id}-${stage}-0.svg`,'utf8');
 s+=`<g transform="translate(${50+i*305} ${110+j*210}) scale(5)">${svg.replace(/<svg[^>]*>|<\/svg>/g,'')}</g>`;
 s+=`<text x="${130+i*305}" y="${295+j*210}" text-anchor="middle" font-family="Arial,sans-serif" fill="#45624a" font-size="15">${['Moruip · Grass','Poru · Water','Kokodu · Fire'][i]} / ${stage}</text>`;
 }
}
await writeFile('docs/media/starter-growth.svg',s+'</svg>');
const sprites={};for(const id of ['D01','G01','G02'])sprites[id]=(await readFile(`assets/sprites/${id}-adult-0.svg`,'utf8')).replace(/<svg[^>]*>|<\/svg>/g,'');
// Refresh existing README art in place, preserving composition.
for(const file of ['docs/media/moamon-cover.svg','docs/media/moamon-roster.svg']){
 let svg=await readFile(file,'utf8');let index=0;
 svg=svg.replace(/<g transform="translate\([^\"]+\) scale\([^\"]+\)">[\s\S]*?<\/g>/g,match=>{
 const ids=file.includes('cover')?['D01','G01','G02']:['D01','G01','G02'];
 const id=ids[index++];if(!id)return match;
 return match.replace(/>[^]*<\/g>$/,()=> '>'+sprites[id]+'</g>');
 });
 await writeFile(file,svg);
}
