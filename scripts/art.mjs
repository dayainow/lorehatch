import {starterArt} from './starter-art.mjs';
// Original code-authored pixel artwork. No external artwork or sprite sources.
import { writeFile } from 'node:fs/promises';
const rect = (x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const outline='#273d39';
function sprite(id,adult,frame) {
 if(['D01','G01','G02'].includes(id))return starterArt(id,adult,frame);
 let p=''; const r=(...a)=>{p+=rect(...a)}; const dy=frame;
 if(id==='D01') {
  r(5,19+dy,5,5,outline);r(3,17+dy,3,5,outline);r(4,18+dy,3,3,'#749a52');
  r(9,14+dy,15,12,outline);r(11,12+dy,12,14,outline);r(11,14+dy,12,10,'#73985a');r(13,15+dy,11,8,'#a3bc73');
  r(12,8+dy,13,13,outline);r(14,6+dy,8,3,outline);r(13,9+dy,12,9,'#95b970');r(15,8+dy,7,3,'#bad78e');
  r(23,13+dy,5,6,outline);r(23,14+dy,4,4,'#bad78e');
  r(13,4+dy,3,5,'#e4cc94');r(21,4+dy,3,5,'#e4cc94');
  r(21,11+dy,2,3,outline);r(21,11+dy,1,1,'#f7f4ce');r(24,17+dy,2,1,'#64874e');r(18,15+dy,2,2,'#d8a78c');
  r(13,21+dy,7,3,'#d9d7a0');r(10,25,5,3,outline);r(20,25,5,3,outline);r(11,25,4,2,'#87aa66');r(21,25,4,2,'#87aa66');
  if(adult){r(5,9+dy,3,10,outline);r(8,11+dy,3,10,outline);r(6,11+dy,2,5,'#bdd58c');r(9,13+dy,3,5,'#9bbb68');r(17,2+dy,3,4,'#739b54');r(19,1+dy,3,2,'#a6bd6b');}
 } else if(id==='D02') {
  // A round lantern wyrm with mitten feet and a wick-shaped tail.
  r(6,11+dy,18,12,outline); r(9,8+dy,12,17,outline);
  r(7,12+dy,16,10,'#ed986d'); r(10,9+dy,10,15,'#ffc8a0');
  r(10,14+dy,3,3,outline); r(18,14+dy,3,3,outline);
  r(10,14+dy,1,1,'#fff6da'); r(18,14+dy,1,1,'#fff6da');
  r(8,18+dy,4,2,'#e78180'); r(19,18+dy,3,2,'#e78180');
  r(14,18+dy,3,1,outline); r(9,24,4,3,outline);r(18,24,4,3,outline);
  r(23,18+dy,5,3,'#ec996e');r(26,14+dy,3,5,'#e87546');r(27,12+dy,2,5,'#ffdb80');
  r(8,7+dy,3,4,'#eed195');r(20,7+dy,3,4,'#eed195');
  if(adult){r(10,5+dy,11,4,'#ec875c');r(13,2+dy,3,5,'#ffbf65');r(17,4+dy,3,4,'#ffe3a1');r(12,21+dy,7,3,'#fff1c3');}
 } else if(id==='N01'){
  // Curled tail, cheek pouch and leaf satchel.
  r(2,9+dy,10,14,outline);r(4,6+dy,9,9,outline);r(4,10+dy,7,11,'#c18a61');r(6,8+dy,5,5,'#edc593');
  r(10,17+dy,12,9,outline);r(11,18+dy,10,7,'#dba374');
  r(14,10+dy,12,12,outline);r(16,7+dy,3,6,outline);r(22,7+dy,3,6,outline);
  r(15,12+dy,10,8,'#e7b787');r(21,13+dy,2,3,outline);r(21,13+dy,1,1,'#fff7dc');r(23,18+dy,4,2,'#ffdfad');
  r(12,25,4,2,outline);r(19,25,5,2,outline);
  if(adult){r(2,5+dy,9,4,'#bb7856');r(3,3+dy,5,3,'#e4ad73');r(13,20+dy,5,5,'#6f985e');}
 } else if(id==='E01'){
  // Waterbird with paddle feet, a long beak and split crest.
  const y=adult?5:10;
  r(8,19+dy,15,7,outline);r(9,20+dy,13,5,'#9dbdc8');r(6,18+dy,9,4,'#769da9');
  r(17,y+6+dy,5,16-y,'#c3d9dc');r(15,y+dy,10,8,outline);r(16,y+1+dy,8,6,'#e2eeee');
  r(21,y+2+dy,2,2,outline);r(24,y+4+dy,6,2,'#dfa975');r(15,y-2+dy,4,3,'#86afb9');
  if(adult){r(11,y-4+dy,5,3,'#739aa9');r(17,y-4+dy,3,3,'#a6cdd1');}
  r(12,25,2,3,outline);r(18,25,2,3,outline);r(12,28,4,1,'#c69c75');r(18,28,4,1,'#c69c75');
 } else if(id==='G01') {
  r(7,15+dy,17,10,outline);r(8,16+dy,15,8,'#d9d6bd');r(10,16+dy,12,5,'#fff1d5');
  r(19,8+dy,8,13,outline);r(20,9+dy,7,11,'#efe2ca');r(24,12+dy,5,6,outline);r(24,13+dy,4,4,'#fff1d5');
  r(20,4+dy,3,5,outline);r(21,5+dy,1,4,'#efd3b4');r(18,9+dy,3,10,'#6c929d');r(18,8+dy,7,3,'#9cc1bd');
  r(24,11+dy,2,2,outline);r(25,15+dy,2,1,'#ba9e97');r(23,15+dy,1,1,'#d7a0a0');
  r(8,24,4,4,outline);r(19,24,4,4,outline);r(8,23,3,3,'#e9ddc1');r(19,23,3,3,'#e9ddc1');
  r(4,17+dy,4,9,'#638b9a');r(3,21+dy,3,5,'#9dc4c3');
  r(9,11+dy,4,10,outline);r(11,13+dy,6,8,'#95b6b9');r(10,12+dy,3,7,'#fff5dd');r(13,15+dy,3,4,'#f1e7d2');
  if(adult){r(6,5+dy,3,12,outline);r(7,6+dy,3,10,'#fff5dd');r(10,8+dy,3,11,'#e4e4d4');r(13,11+dy,3,8,'#c1d1cb');}
 } else {
  r(6,16+dy,21,10,outline);r(8,17+dy,17,8,'#92726b');r(11,21+dy,10,3,'#b69180');
  r(6,24,5,4,outline);r(22,24,5,4,outline);r(7,25,3,2,'#bc9480');r(23,25,3,2,'#bc9480');
  for(const [x,y] of [[3,11],[12,7],[21,11]]){
   r(x,y+dy,9,10,outline);r(x+1,y+1+dy,7,8,'#a78273');r(x,y-2+dy,3,6,'#674f50');r(x+6,y-2+dy,3,6,'#674f50');
   r(x+2,y+6+dy,5,3,'#d8b08c');r(x+3,y+5+dy,2,2,outline);r(x+2,y+3+dy,1,2,outline);r(x+6,y+3+dy,1,2,outline);
  }
  if(adult){r(14,4+dy,5,3,'#d6ba7a');r(15,3+dy,3,2,'#efd6a1');r(11,22+dy,12,2,'#d5ad70');r(28,18+dy,2,6,'#80645e');r(29,16+dy,2,4,'#bc9681');}
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges">${p}</svg>`;
}
for(const id of ['D01','G01','G02','D02','N01','E01']) for(const stage of ['baby','adult']) for(let f=0;f<2;f++) await writeFile(`assets/sprites/${id}-${stage}-${f}.svg`,sprite(id,stage==='adult',f));
for(let f=0;f<2;f++){
let p='';for(const a of [[12,5,8,2,outline],[10,7,12,3,outline],[8,10,16,14,outline],[10,24,12,3,outline],[10,10,12,14,'#e7dbb7'],[12,7,8,3,'#f9edce'],[9,14,3,7,'#f9edce'],[12,24,8,1,'#c9b98f'],[15,12,3,4,'#83a273'],[18,18,3,3,'#83a273'],[11,20,2,2,'#a1b589']])p+=rect(a[0]+f,a[1],a[2],a[3],a[4]);
await writeFile(`assets/sprites/egg-${f}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges">${p}</svg>`);
}
console.log('26 original 32x32 SVG pixel frames written.');

// Each mask is an original side/front silhouette. # is fur, + is belly, o is an eye.
const masks={
 rabbit:['..##..##..','..##..##..','..##..##..','..######..','.##o##o##.','.##++++##.','..#++++#..','.########.'],
 frog:['.###..###.','.o######o.','.########.','..#++++#..','.##++++##.','###....###'],
 moth:['###....###','####..####','.###oo###.','..######..','.###++###.','###.##.###'],
 turtle:['...####....','..######...','.##++++##..','###++++###o','..#########','..##...##..'],
 snail:['..####...#.#','.######..o.o','##++####.###','##+#+###.###','.##++######.','..#########.'],
 newt:['.....###o##.','....######..','.#.####.....','.#####..##..','##..#####...','....##..##..'],
 hedgehog:['..#.#.#....','.#######...','#########..','.######o##.','..##++++###','..##...##..'],
 owl:['##....##','########','#oo##oo#','#++##++#','##++++##','.##++##.','..####..'],
 ray:['.....#.....','....###....','..##o#o##..','###########','..##+++##..','....###....','.....##....','......##...'],
 deer:['.#.#...#.#','..##...##.','...#####..','..##o#o##.','...#+++#..','..######..','..##..##..'],
 mole:['....###....','..#######..','.###o#o###.','###++#++###','..##+++##..','.###...###.'],
 fox:['##......##','.##....##.','.########.','.##o##o##.','..#++++#..','...#++#.##','..#######.','..##..##..']
};
const colors={풀:['#98be75','#e2efae'],물:['#85baca','#dcf2e9'],불:['#db9470','#ffe0a8']};
const {newSpecies}=await import('../app/new-species.mjs');
for(const [id,,,,,,,shape] of newSpecies){
 const [base,light]=colors[newSpecies.find(row=>row[0]===id)[3]];
 for(const stage of ['baby','adult'])for(let frame=0;frame<2;frame++){
  const mask=masks[shape], scale=stage==='adult'?2.4:2, ox=(32-mask[0].length*scale)/2, oy=28-mask.length*scale-frame;
  let body='';
  for(const [y,row] of mask.entries())for(const [x,c] of [...row].entries()){
   if(c==='.')continue;
   const edge=row[x-1]==='.'||!x||row[x+1]==='.'||!row[x+1]||!y;
   body+=rect(Math.round(ox+x*scale),Math.round(oy+y*scale),Math.ceil(scale),Math.ceil(scale),c==='o'?outline:c==='+'?light:edge?'#516663':base);
  }
  // Adult features reflect each friend's role rather than a shared crest.
  const add=(x,y,w,h,c)=>{body+=rect(x,y-frame,w,h,c)};
  if(stage==='adult'){
   if(shape==='rabbit'){add(8,2,2,6,'#c8aa64');add(7,3,4,2,'#eed993');add(23,4,2,5,'#b99a51');}
   if(shape==='frog'){add(11,20,10,4,'#a6dfdd');add(13,21,6,2,'#efffff');}
   if(shape==='moth'){add(4,10,4,4,'#fff2a6');add(24,10,4,4,'#fff2a6');add(14,4,1,5,outline);add(18,4,1,5,outline);}
   if(shape==='turtle'){add(9,11,12,2,'#6eaa79');add(14,7,4,6,'#e5acbd');add(12,9,8,2,'#f7d8df');}
   if(shape==='snail'){add(5,6,12,3,'#f1f3eb');add(8,4,6,3,'#fffdf4');add(8,16,2,3,'#bce5eb');}
   if(shape==='newt'){add(9,15,2,2,'#ffdf91');add(14,13,2,2,'#ffdf91');add(18,10,2,2,'#ffdf91');}
   if(shape==='hedgehog'){add(6,8,3,4,'#ad8358');add(12,6,3,4,'#d1ad70');add(18,9,3,4,'#ad8358');}
   if(shape==='owl'){add(6,6,6,2,'#e9fbff');add(20,6,6,2,'#e9fbff');add(4,10,3,2,'#ceeaf0');add(25,10,3,2,'#ceeaf0');}
   if(shape==='ray'){add(6,15,3,2,'#e9fbf5');add(23,15,3,2,'#e9fbf5');add(15,7,2,3,'#dcf2e9');}
   if(shape==='deer'){add(4,5,4,2,'#a6cd72');add(8,2,3,2,'#d1e99b');add(22,5,4,2,'#a6cd72');add(20,2,3,2,'#d1e99b');}
   if(shape==='mole'){add(6,22,4,2,'#f5d6a5');add(22,22,4,2,'#f5d6a5');add(14,9,4,2,'#e8be90');}
   if(shape==='fox'){add(24,18,4,5,'#ffe1a0');add(25,16,3,3,'#fff4cf');add(11,19,10,2,'#fff0d0');}
  }
  await writeFile(`assets/sprites/${id}-${stage}-${frame}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges">${body}</svg>`);
 }
}
