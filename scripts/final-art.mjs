// Original, individually composed 32px final forms. No third-party artwork.
import {writeFile} from 'node:fs/promises';
import {IDS} from '../app/domain.mjs';
export function finalArt(id,frame=0){
 let s='';const ink='#293e3b',ivory='#fff0ce',pink='#e99a91';
 const r=(x,y,w,h,c)=>s+=`<rect x="${x}" y="${y+frame}" width="${w}" height="${h}" fill="${c}"/>`;
 const box=(x,y,w,h,c)=>{r(x,y,w,h,ink);r(x+1,y+1,w-2,h-2,c)};
 const oval=(x,y,w,h,c)=>{r(x+2,y,w-4,h,ink);r(x,y+2,w,h-4,ink);r(x+2,y+1,w-4,h-2,c);r(x+1,y+3,w-2,h-6,c)};
 const eye=(x,y)=>{r(x,y,2,3,ink);r(x,y,1,1,ivory)};
 const face=(x,y,w)=>{eye(x,y);eye(x+w,y);r(x+3,y+5,Math.max(2,w-4),1,ink);r(x-2,y+4,2,1,pink);r(x+w+2,y+4,2,1,pink)};
 const leaf=(x,y,c='#91b96d')=>{r(x+2,y,3,7,ink);r(x,y+2,7,3,ink);r(x+1,y+2,5,2,c);r(x+3,y+1,1,5,c)};
 const flame=(x,y)=>{r(x+2,y,2,4,'#df7546');r(x,y+4,6,5,'#df7546');r(x+1,y+5,4,3,'#ffdb88')};
 const flower=(x,y,c='#e9a3ae')=>{r(x+2,y,3,7,c);r(x,y+2,7,3,c);r(x+2,y+2,3,3,'#f8db8c')};
 const feet=(c)=>{box(8,26,6,4,c);box(20,26,6,4,c)};
 switch(id){
 case 'D01':
  // Leaf-winged forest guardian, long neck, branching antlers and curled vine.
  box(1,10,8,13,'#6d9861');box(24,7,7,16,'#6d9861');leaf(2,10);leaf(24,8);
  oval(8,15,17,13,'#82ab6b');r(12,19,9,7,ivory);box(9,8,15,13,'#b6d58d');
  r(10,2,2,7,ink);r(7,3,5,2,ink);leaf(4,0);r(22,1,2,8,ink);leaf(23,0);
  face(12,12,7);feet('#a7cb83');box(2,22,7,5,'#7eac66');break;
 case 'G01':
  // Tall foal with layered feather fans and flowing mane.
  for(let j=0;j<3;j++){box(1+j*3,2+j*4,5,15-j*2,'#c9e9e7');box(26-j*3,2+j*4,5,15-j*2,'#c9e9e7')}
  oval(9,18,16,9,'#e6ebdc');box(14,9,10,14,'#f9efd7');box(10,6,15,12,'#f9efd7');
  box(11,1,4,7,'#c1dde0');box(21,1,4,7,'#c1dde0');r(18,4,5,5,'#79adbd');r(22,12,3,12,'#79adbd');face(12,10,8);feet('#94bec8');break;
 case 'G02':
  // Sitting hearth hound: huge curled tail, charcoal ears, scalloped mane.
  box(23,13,8,14,'#ce8254');flame(25,6);oval(7,15,19,14,'#d79865');
  for(let j=0;j<5;j++)box(5+j*4,16+Math.abs(j-2),5,7,'#efbc70');
  oval(7,6,19,15,'#eeb67f');box(4,3,6,12,'#6e5048');box(24,3,5,12,'#6e5048');
  face(11,10,9);r(12,15,10,5,ivory);r(16,15,3,2,ink);feet(ivory);break;
 case 'D02':
  box(2,13,7,13,'#b96a50');box(25,11,5,13,'#b96a50');oval(7,9,19,20,'#efa474');r(12,17,9,9,'#ffe0a5');flame(14,0);flame(25,17);face(10,13,10);feet('#e79b66');break;
 case 'N01':
  oval(0,3,15,23,'#ad714e');oval(3,6,10,14,'#e3b783');oval(10,15,15,13,'#cd9566');box(13,7,16,14,'#e9bb86');box(14,2,4,7,'#c58a62');box(24,2,4,7,'#c58a62');face(16,11,8);box(12,20,9,7,'#759862');r(14,22,5,3,ivory);break;
 case 'E01':
  box(15,8,6,19,'#acd3da');oval(5,20,21,7,'#7eaab8');oval(12,5,14,10,'#e1eeee');r(24,10,7,3,'#d5a166');eye(20,8);r(10,3,12,2,'#75a7b9');r(15,0,3,6,'#c4e9e8');r(10,27,2,4,ink);r(21,27,2,4,ink);break;
 case 'M01':
  box(8,2,5,16,'#c8b782');box(20,0,5,17,'#c8b782');r(10,3,1,10,'#efe1b5');r(22,2,1,11,'#efe1b5');oval(6,13,22,15,'#d7c793');face(10,17,10);feet('#f0e2b7');leaf(3,8);break;
 case 'M02':
  oval(2,18,28,11,'#76b8a7');oval(6,10,21,15,'#9ad3bc');box(6,5,7,9,'#c0e6cd');box(20,5,7,9,'#c0e6cd');eye(9,8);eye(22,8);r(13,18,8,2,ink);oval(9,23,15,6,'#d6f2df');r(1,15,3,4,'#96dbe2');r(28,13,3,4,'#96dbe2');break;
 case 'M03':
  oval(0,3,13,18,'#a97262');oval(19,3,13,18,'#a97262');oval(3,18,10,11,'#d49c72');oval(19,18,10,11,'#d49c72');
  box(4,8,6,8,'#ffd694');box(22,8,6,8,'#ffd694');box(13,9,6,20,'#e6bc79');eye(14,12);r(11,4,2,7,ink);r(19,4,2,7,ink);break;
 case 'M04':
  oval(3,12,23,15,'#6e9b78');box(8,16,12,9,'#a9cb8b');oval(23,19,8,8,'#c5da9c');eye(27,21);flower(11,3);leaf(5,9);leaf(18,8);box(4,25,5,4,'#9ebf81');box(19,25,5,4,'#9ebf81');break;
 case 'M05':
  oval(3,7,23,19,'#afd2d9');oval(4,3,10,12,'#e3efea');oval(13,1,13,14,'#e3efea');box(10,12,10,10,'#7ca9b9');box(13,15,5,5,'#d9ecea');oval(2,24,29,6,'#b1cab5');box(26,16,3,10,'#b1cab5');box(29,14,2,11,'#b1cab5');break;
 case 'M06':
  oval(2,16,25,11,'#9b6f60');box(5,11,15,12,'#c98c69');face(7,14,8);box(23,9,5,13,'#a9755b');flame(24,2);for(let x=9;x<24;x+=5)r(x,23,3,2,'#ffcd83');feet('#c39575');break;
 case 'R01':
  for(let j=0;j<5;j++)box(2+j*5,4+Math.abs(j-2)*2,6,17,'#8b7757');
  oval(2,17,28,12,'#bb9c73');box(19,15,11,10,'#e3c99b');eye(24,17);r(29,22,3,2,ink);leaf(12,1);break;
 case 'R02':
  oval(5,6,22,23,'#9dbbc9');box(2,15,6,11,'#759bac');box(25,15,5,11,'#759bac');oval(7,9,9,11,ivory);oval(17,9,9,11,ivory);eye(11,12);eye(20,12);r(16,18,2,3,'#d6ad75');r(5,2,3,7,'#d7edf0');r(24,2,3,7,'#d7edf0');break;
 case 'R03':
  box(1,11,30,6,'#7aadb9');box(4,8,24,12,'#9bcbd2');oval(9,6,14,18,'#b5dce0');
  face(11,12,8);r(15,22,3,7,'#6d9eae');r(18,27,7,2,'#6d9eae');break;
 case 'R04':
  box(8,18,18,9,'#b6b785');box(13,8,13,14,'#d4d09b');r(11,2,2,9,ink);r(24,1,2,10,ink);leaf(6,1);leaf(24,0);face(15,12,7);box(8,25,4,6,'#87966b');box(22,25,4,6,'#87966b');break;
 case 'R05':
  oval(6,9,21,20,'#a1887c');box(0,19,10,10,'#d4a28b');box(23,19,9,10,'#d4a28b');face(11,13,8);r(13,18,8,4,'#d98e80');flame(13,0);break;
 case 'R06':
  oval(20,5,12,23,'#ce9b61');oval(22,4,9,10,'#f7dfa1');oval(7,16,18,13,'#d5a06e');box(6,5,6,13,'#d5a06e');box(22,4,6,13,'#d5a06e');oval(7,12,20,12,'#eabf85');face(10,14,10);r(12,23,10,4,ivory);break;
 case 'C01':
  oval(5,6,23,23,'#b3d7d8');oval(9,17,14,10,ivory);box(0,22,8,6,'#81b6c3');box(25,22,7,6,'#81b6c3');face(11,10,9);oval(0,2,7,7,'#d5edef');oval(24,0,7,7,'#d5edef');break;
 case 'C02':
  box(1,7,9,12,'#db8f82');box(23,4,9,13,'#db8f82');r(4,7,3,4,ivory);r(26,4,3,4,ivory);oval(6,15,22,12,'#e5ac90');face(10,17,11);for(let x=3;x<30;x+=6)box(x,25,4,5,'#bd8377');break;
 case 'C03':
  box(12,3,13,13,'#9ac29b');r(23,9,8,4,'#b5d5ab');eye(19,6);oval(10,13,14,12,'#8fb8a1');box(12,22,12,8,'#85b2a1');r(16,24,6,3,ivory);leaf(4,11);leaf(6,2);break;
 case 'C04':
  oval(5,9,22,16,'#d7adc5');for(let j=0;j<4;j++)box(2+j*8,22,6,8,'#b68aa7');face(11,14,8);box(8,2,16,8,'#d7c9bf');for(let x=10;x<24;x+=4)r(x,3,1,5,'#a596b0');break;
 case 'C05':
  box(12,2,8,24,'#eac58b');box(2,12,28,8,'#eac58b');box(5,22,8,8,'#eac58b');box(20,22,8,8,'#eac58b');face(11,13,8);r(14,5,4,4,ivory);break;
 case 'C06':
  oval(3,18,26,11,'#d5d392');oval(12,8,15,15,'#e9e2af');eye(20,12);r(23,17,8,4,'#c99a62');leaf(7,2);leaf(16,1);r(16,4,3,7,'#927c53');box(5,21,11,6,'#91af78');break;
 case 'F01':
  for(const [x,y] of [[3,12],[7,5],[16,3],[23,10],[22,20],[12,23],[2,21]])oval(x,y,9,9,'#eee5b8');
  oval(8,13,18,15,'#cfc39b');face(12,16,8);flower(11,1,'#eed27f');feet('#aa9b7f');break;
 case 'F02':
  oval(0,8,12,19,'#8cb8ce');oval(21,8,11,19,'#8cb8ce');oval(8,7,17,21,'#b0d2dd');eye(11,12);eye(21,12);box(15,17,6,14,'#8fbaca');r(19,27,5,4,'#8fbaca');r(14,2,5,4,'#c6e9e8');break;
 case 'F03':
  oval(4,3,8,9,'#b48565');oval(22,3,8,9,'#b48565');oval(5,8,24,22,'#c69670');face(11,12,10);oval(11,19,13,9,'#efd5a0');r(14,21,7,2,'#cf8e60');feet('#a47b5e');break;
 case 'F04':
  box(6,3,6,13,'#bc9eaa');box(22,3,6,13,'#bc9eaa');oval(7,10,21,17,'#dcc1c6');face(11,13,10);box(1,18,6,12,'#bc9eaa');flower(22,0);r(11,25,13,3,'#ab7e9d');feet('#d9bcc4');break;
 case 'F05':
  oval(0,3,13,14,'#e1e9d3');oval(20,3,12,14,'#e1e9d3');oval(8,9,18,20,'#e4c57f');r(10,20,14,3,'#79654e');r(12,26,10,2,'#79654e');face(12,12,8);r(10,3,2,7,ink);r(23,2,2,8,ink);box(2,22,6,7,'#ecc17a');break;
 case 'F06':
  oval(4,1,8,14,'#a9bac7');oval(21,0,9,15,'#a9bac7');oval(5,13,24,17,'#bfccd3');oval(0,20,10,10,'#8da6b6');face(11,16,10);r(10,5,1,6,'#e6bbc2');r(25,4,1,6,'#e6bbc2');feet('#d7e3de');break;
 default:throw new Error('Missing final design '+id);
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges">${s}</svg>`;
}
for(const id of IDS)for(let frame=0;frame<2;frame++)await writeFile(`assets/sprites/${id}-final-${frame}.svg`,finalArt(id,frame));
