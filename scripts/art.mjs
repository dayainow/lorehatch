// Original code-authored pixel artwork. No external artwork or sprite sources.
import { writeFile } from 'node:fs/promises';
const rect = (x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const outline='#273d39';
function sprite(id,adult,frame) {
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
 } else if(id==='G01') {
  r(7,15+dy,17,10,outline);r(8,16+dy,15,8,'#d9d6bd');r(10,16+dy,12,5,'#fff1d5');
  r(19,8+dy,8,13,outline);r(20,9+dy,7,11,'#efe2ca');r(24,12+dy,5,6,outline);r(24,13+dy,4,4,'#fff1d5');
  r(20,4+dy,3,5,outline);r(21,5+dy,1,4,'#efd3b4');r(18,9+dy,3,10,'#6c929d');r(18,8+dy,7,3,'#9cc1bd');
  r(24,11+dy,2,2,outline);r(25,15+dy,2,1,'#ba9e97');r(23,15+dy,1,1,'#d7a0a0');
  r(8,24,4,4,outline);r(19,24,4,4,outline);r(8,23,3,3,'#e9ddc1');r(19,23,3,3,'#e9ddc1');
  r(4,17+dy,4,9,'#638b9a');r(3,21+dy,3,5,'#9dc4c3');
  r(9,11+dy,4,10,outline);r(11,13+dy,6,8,'#95b6b9');r(10,12+dy,3,7,'#fff5dd');r(13,15+dy,3,4,'#f1e7d2');
  if(adult){r(6,5+dy,3,12,outline);r(7,6+dy,3,10,'#fff5dd');r(10,8+dy,3,11,'#e4e4d4');r(13,11+dy,3,8,'#c1d1cb');r(20,2+dy,2,3,'#d5b672');}
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
for(const id of ['D01','G01','G02']) for(const stage of ['baby','adult']) for(let f=0;f<2;f++) await writeFile(`assets/sprites/${id}-${stage}-${f}.svg`,sprite(id,stage==='adult',f));
for(let f=0;f<2;f++){
let p='';for(const a of [[12,5,8,2,outline],[10,7,12,3,outline],[8,10,16,14,outline],[10,24,12,3,outline],[10,10,12,14,'#e7dbb7'],[12,7,8,3,'#f9edce'],[9,14,3,7,'#f9edce'],[12,24,8,1,'#c9b98f'],[15,12,3,4,'#83a273'],[18,18,3,3,'#83a273'],[11,20,2,2,'#a1b589']])p+=rect(a[0]+f,a[1],a[2],a[3],a[4]);
await writeFile(`assets/sprites/egg-${f}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges">${p}</svg>`);
}
console.log('14 original 32x32 SVG pixel frames written.');
