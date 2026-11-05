import {readFile,writeFile} from 'node:fs/promises';
import {IDS,habitatNames,habitatOf} from '../app/domain.mjs';
import {content} from '../app/content.mjs';
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1190" viewBox="0 0 1080 1190"><rect width="1080" height="1190" rx="24" fill="#f4f0e3"/><g font-family="Arial,sans-serif" fill="#294438"><text x="40" y="55" font-size="28" font-weight="bold">MOAMON · 30 LITTLE FRIENDS</text><text x="40" y="87" font-size="15">Five habitats · Original game sprites · Grown forms</text></g>';
for(const [i,id] of IDS.entries()){
 const col=i%6,row=habitatOf(id),x=40+col*170,y=145+row*210;
 if(col===0)svg+=`<text x="40" y="${y-15}" font-family="sans-serif" font-size="18" fill="#48674f">${habitatNames[row]}</text>`;
 const body=(await readFile(`assets/sprites/${id}-adult-0.svg`,'utf8')).replace(/<svg[^>]*>|<\/svg>/g,'');
 svg+=`<g transform="translate(${x+12} ${y}) scale(4)">${body}</g><text x="${x+76}" y="${y+155}" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#294438">${String(i+1).padStart(2,'0')} · ${content[id].name}</text>`;
}
await writeFile('docs/media/moamon-roster.svg',svg+'</svg>');
