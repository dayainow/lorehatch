// Original 32x32 starter silhouettes. Shared face grammar, distinct elemental anatomy.
export function starterArt(id,adult,frame){
 let out='';const ink='#293e3b',cream='#fff0cc',pink='#e99e91';
 const r=(x,y,w,h,c)=>out+=`<rect x="${x}" y="${y+frame}" width="${w}" height="${h}" fill="${c}"/>`;
 const eye=(x,y)=>{r(x,y,2,3,ink);r(x,y,1,1,'#fffdf0')};
 if(id==='D01'){
  // Broad seed-shaped head, folded leaf ears, tiny paws and a curled vine tail.
  if(adult){r(2,11,7,11,ink);r(3,12,5,8,'#83ac66');r(4,13,2,6,'#c6df91');r(24,9,6,13,ink);r(25,11,4,9,'#83ac66');r(26,12,1,7,'#c6df91');}
  r(8,17,16,10,ink);r(9,18,14,8,'#84aa69');r(12,20,8,6,cream);
  r(6,8,20,13,ink);r(8,6,16,16,ink);r(7,10,18,9,'#b4d48b');r(9,7,14,14,'#b4d48b');r(10,8,10,2,'#d5e7ab');
  r(8,3,4,5,ink);r(9,4,2,4,'#7fa45f');r(19,3,5,5,ink);r(20,4,3,3,'#7fa45f');
  eye(10,12);eye(20,12);r(8,16,3,2,pink);r(22,16,2,2,pink);r(15,17,3,1,ink);
  r(8,25,5,3,ink);r(19,25,5,3,ink);r(9,25,3,2,'#bad78e');r(20,25,3,2,'#bad78e');
  r(3,21,5,5,ink);r(3,20,2,3,'#8bb571');r(4,22,3,2,'#aace83');
  if(adult){r(14,2,2,5,'#537d51');r(15,1,5,2,'#92bc70');r(16,2,2,2,'#c9df97');}
 }else if(id==='G01'){
  // A soft round foal, scalloped water wings and a droplet forelock.
  const wing=adult?4:9;
  r(2,wing,4,12,ink);r(3,wing+1,2,9,'#b1dfe3');r(5,wing+3,4,10,ink);r(6,wing+4,2,7,'#e6f7ed');
  r(24,wing,4,12,ink);r(25,wing+1,2,9,'#b1dfe3');r(21,wing+3,4,10,ink);r(22,wing+4,2,7,'#e6f7ed');
  r(8,17,15,10,ink);r(9,18,13,8,'#e3eee5');r(11,22,8,3,'#b5d8dc');
  r(8,8,17,13,ink);r(10,6,13,16,ink);r(9,9,15,11,'#f8f4df');r(11,7,11,13,'#f8f4df');
  r(9,3,4,6,ink);r(10,4,2,4,'#c6dde0');r(21,3,3,6,ink);r(22,4,1,4,'#c6dde0');
  r(15,4,4,6,'#709fae');r(16,2,2,5,'#9bcdd6');r(16,5,1,2,'#e4f7ef');
  eye(11,11);eye(20,11);r(12,16,9,4,'#d5e6dc');r(14,17,1,1,ink);r(18,17,1,1,ink);r(9,15,2,2,pink);r(23,15,1,2,pink);
  r(9,25,4,4,ink);r(19,25,4,4,ink);r(10,25,2,2,'#9fc8cf');r(20,25,2,2,'#9fc8cf');
  if(adult){r(4,22,3,5,'#86b4c1');r(3,24,3,3,'#c3e5e6');r(14,22,4,2,'#719fae');}
 }else{
  // One round puppy, charcoal ears, warm mittens and a small ember tail.
  r(23,20,6,4,ink);r(26,16,4,7,ink);r(27,17,2,5,'#d97d4f');r(28,14,2,5,'#efb75e');
  if(adult){r(26,12,4,8,'#e88d48');r(27,10,2,7,'#ffd889');}
  r(8,17,16,11,ink);r(9,18,14,9,'#cf895b');r(12,20,8,6,cream);
  if(adult){r(6,17,5,7,'#e8aa60');r(21,17,5,7,'#e8aa60');r(10,22,12,3,'#f4cf89');r(13,24,6,2,'#ffe5aa');}
  r(6,7,20,14,ink);r(8,5,16,18,ink);r(7,9,18,11,'#edb17a');r(9,6,14,15,'#edb17a');
  r(5,5,5,10,ink);r(6,6,3,8,'#735149');r(22,5,5,10,ink);r(23,6,3,8,'#735149');
  r(12,7,8,2,'#f7cc92');eye(10,11);eye(20,11);
  r(11,16,11,5,cream);r(15,16,3,2,ink);r(16,18,1,2,ink);r(17,20,2,2,pink);
  r(8,16,2,2,pink);r(23,16,2,2,pink);
  r(8,26,5,3,ink);r(19,26,5,3,ink);r(9,26,3,2,cream);r(20,26,3,2,cream);
  if(adult){r(14,3,4,3,'#da8951');r(16,2,2,3,'#f3c779');}

 }
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges">${out}</svg>`;
}
