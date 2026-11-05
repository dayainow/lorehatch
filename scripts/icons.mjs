import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {deflateSync} from 'node:zlib';
const rects=[...((await readFile('assets/sprites/egg-0.svg','utf8')).matchAll(/<rect x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)" fill="(#[a-fA-F0-9]+)"/g))].map(m=>({x:+m[1]+16,y:+m[2]+14,w:+m[3],h:+m[4],color:m[5]}));
const crc=b=>{let c=0xffffffff;for(const v of b){c^=v;for(let n=0;n<8;n++)c=c&1?0xedb88320^(c>>>1):c>>>1;}return(c^0xffffffff)>>>0;};
function chunk(type,data){const body=Buffer.concat([Buffer.from(type),data]),out=Buffer.alloc(data.length+12);out.writeUInt32BE(data.length);body.copy(out,4);out.writeUInt32BE(crc(body),out.length-4);return out;}
function png(size){
 const raw=Buffer.alloc(size*(1+size*4));
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const px=x/size*64,py=y/size*64;let color='#163c39';
  for(const r of rects)if(px>=r.x&&px<r.x+r.w&&py>=r.y&&py<r.y+r.h)color=r.color;
  const offset=y*(size*4+1)+1+x*4;raw[offset]=parseInt(color.slice(1,3),16);raw[offset+1]=parseInt(color.slice(3,5),16);raw[offset+2]=parseInt(color.slice(5,7),16);raw[offset+3]=255;
 }
 const header=Buffer.alloc(13);header.writeUInt32BE(size);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
}
await mkdir('assets/icons',{recursive:true});
for(const size of [16,32,64,128,180,192,256,512,1024])await writeFile(`assets/icons/icon-${size}.png`,png(size));
await writeFile('assets/icons/maskable-512.png',png(512));
console.log('Original egg app icons generated.');
