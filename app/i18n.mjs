import {content,profiles} from './content.mjs';
import {fieldnotes,pairs,habitatLore} from './fieldnotes.mjs';
import {encounters,milestones} from './journal.mjs';
import {habitatNames,initialState} from './domain.mjs';
import {creatures,care,encounterRows,bonds,habitats,lore} from './locales/creatures.en.mjs';
import {ui,koLabels} from './locales/ui.en.mjs';
export const english={...ui};
const put=(ko,en)=>{if(ko&&en)english[ko]=en;};
creatures.forEach(([id,name,kind,baby,adult,personality,likes,reaction],i)=>{
 const c=content[id],p=profiles[id];
 [c.name,c.kind,c.description,c.adult,p.personality].forEach((text,j)=>put(text,[name,kind,baby,adult,personality][j]));
 p.likes.forEach((text,j)=>put(text,likes.split('|')[j]));
 put(p.reaction,reaction??baby);
 if(i>=6)put(p.adaptation,adult);
 fieldnotes[id].forEach((text,j)=>put(text,care[i][j]));
 const e=encounters[id],en=encounterRows[i];
 put(e[0],en[0]);put(e[3],en[2]);put(e[4],en[3]);
 e[1].forEach((choice,j)=>{if(!['큰 소리로 재촉하기','멀리 치워 두기'].includes(choice))put(choice,en[1][j]);});
});
pairs.forEach((pair,i)=>pair.slice(2).forEach((text,j)=>put(text,bonds[i][j])));
habitatNames.forEach((text,i)=>put(text,habitats[i]));habitatLore.forEach((text,i)=>put(text,lore[i]));
const originalProfiles=[
 ['An original leaf-winged forest dragon with branch antlers. Its egg and garden life are fictional, too.','An original character, not a reconstruction of a particular traditional creature.'],
 ['The blue mane, clumsy landings, and growth from an egg are fictional garden adaptations.','Inspired by Pegasus, the winged horse of Greek tradition. The linked source collects original passages and commentary.'],
 ['Charcoal ears, an ember tail, and a growing fire ruff are original garden designs.','An original ember puppy, not a reconstruction of a traditional creature.'],
 ['An original companion who lights the nighttime paths of Three Springs Forest.','An original lantern dragon, not a traditional creature.'],
 ['Carrying leaf letters around Three Springs Forest is our fictional adaptation.','Inspired by Ratatoskr from Norse tradition.'],
 ['Drawing morning footprints on the ripples is our fictional adaptation.','Inspired by Bennu from Egyptian tradition.']
];
creatures.slice(0,6).forEach(([id],i)=>{put(profiles[id].adaptation,originalProfiles[i][0]);put(profiles[id].tradition,originalProfiles[i][1]);});
const milestoneRows=[
 ['First Hello','Hatch your first friend'],['A Gentle Touch','Care for three different species'],['A Little Taller','Grow your first friend'],['Little Memories','Collect three memory cards'],['Better Together','Complete one friendship story'],['Forest Family','Grow all six forest friends'],['Marsh Family','Grow all six marsh friends'],['Ridge Family','Grow all six ridge friends'],['A Book of Memories','Collect eighteen memory cards'],['A Shared Garden','Complete nine friendship stories'],['Shore Family','Grow all six shore friends'],['Meadow Family','Grow all six meadow friends'],['A Second Memory Book','Collect thirty memory cards'],['Friends of Five Habitats','Complete fifteen friendship stories']
];
milestones(initialState()).forEach((m,i)=>{put(m.title,milestoneRows[i][0]);put(m.description,milestoneRows[i][1]);});
const escapeRE=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const phrases=new RegExp(Object.keys(english).sort((a,b)=>b.length-a.length).map(escapeRE).join('|'),'g');
export const resolveLocale=value=>String(value??'').toLowerCase().startsWith('ko')?'ko':'en';
export let locale='en';
export function setLocale(value){locale=resolveLocale(value);return locale;}
// Translation is a presentation boundary. Keys, values, imported saves and nicknames are not translated.
export function translateText(value,lang=locale){
 const names=[];
 const protectedText=String(value).replace(/\uE000([^]*?)\uE001/g,(_,name)=>{names.push(name);return `__MOAMON_NAME_${names.length-1}__`;});
 return translateCore(protectedText,lang).replace(/__MOAMON_NAME_(\d+)__/g,(match,index)=>names[index]??match);
}
function translateCore(value,lang){
 const text=String(value);
 if(lang==='ko')return text.replace(/MY LITTLE COMPANION|OUR DAYS TOGETHER|A LITTLE EVERY DAY|OUR LITTLE FAMILY|FIELD NOTES · VOL\. 01|A NEW FRIEND|NOT YET DISCOVERED|MAKE YOURSELF AT HOME|WELCOME TO MOAMON|A LITTLE GARDEN TO SHARE|HELLO, LITTLE ONE|GROWING TOGETHER|MY LITTLE GARDEN|MAC APP|WEB APP|NO\.|Theoi · Pegasus/g,m=>koLabels[m]);
 if(Object.hasOwn(english,text.trim()))return text.replace(text.trim(),english[text.trim()]);
 const t=s=>translateText(s,lang);
 const patterns=[
 [/^(.+)의 부화를 확인해 주세요\.$/,m=>`Ready to hatch: ${t(m[1])}.`],
 [/^(.+)의 새로운 모습을 확인해보세요\.$/,m=>`Meet ${t(m[1])} in a new grown form.`],
 [/^(.+)의 알을 품고 있어요\.$/,m=>`Keeping ${t(m[1])}’s egg warm.`],
 [/^(.+)의 성장 시간이 쌓이고 있어요\.$/,m=>`${t(m[1])} is growing with you.`],
 [/^(.+)의 (첫 반응|달라진 반응)을 발견해 보세요\.$/,m=>`Discover ${t(m[1])}’s ${m[2]==='첫 반응'?'first':'new'} care response.`],
 [/^두 친구의 이야기 ‘(.+)’를 발견했어요\.$/,m=>`You discovered their story: ${t(m[1])}.`],
 [/^(.+)를 만나면 ‘(.+)’ 이야기를 이어갈 수 있어요\.$/,m=>`Meet ${t(m[1])} to continue ${t(m[2])}.`],
 [/^(.+)도 다 자랐어요\. 한 번 돌봐 주세요\.$/,m=>`${t(m[1])} has grown too. Try its care action.`],
 [/^(.+)의 작은 부탁$/,m=>`A little request from ${t(m[1])}`],
 [/^(.+) 친구 6종을 성장시키면 이곳의 알이 열려요\.$/,m=>`Grow all six friends in ${t(m[1])} to unlock these eggs.`],
 [/^(.+)의 여섯 친구를 성장시켜 주세요\.$/,m=>`Grow all six friends in ${t(m[1])} first.`],
 [/^(.+)와 (.+)의 이야기를 도감에 기록했어요\.$/,m=>`The story of ${t(m[1])} and ${t(m[2])} is in your field guide.`],
 [/^(.+) · 현재 (아기|성장한) 친구 돌보기$/,m=>`${t(m[1])} · Care for the ${m[2]==='아기'?'baby':'grown'} form`],
 [/^(.+) · (.+)와의 이야기$/,m=>`${t(m[1])} · A story with ${t(m[2])}`],
 [/^(.+)의 펫과 진행을 모두 지울까요\? 되돌리려면 내보낸 파일이 필요해요\.$/,m=>`Reset all companions and progress in ${t(m[1])}? Restoring them requires an exported save.`],
 [/^함께한 시간 (.+) 후 부화해요\.$/,m=>`Hatches after ${t(m[1])} together.`]
 ];
 for(const [re,format] of patterns){const match=text.trim().match(re);if(match)return format(match);}
 return text.replace(/(\d+)개를 발견했어요\./g,'$1 discovered.').replace(phrases,m=>english[m])
 .replace(/(\d+)분/g,'$1m').replace(/(\d+)초/g,'$1s')
 .replace(/(\d+)종 표시/g,'$1 species shown').replace(/(\d+)종/g,'$1 species').replace(/(\d+)장/g,'$1 cards')
 .replace(/(\d+)개를 발견했어요\./g,'$1 discovered.')
 .replace(/ 쓰다듬기/g,' · pet').replace(/ 기록 보기/g,' · view notes').replace(/ 돌보기/g,' · care')
 .replace(/ 진행/g,' progress').replace(/ 만남/g,' · first met').replace(/ 남음/g,' left')
 .replace(/에 강해요/g,' (lore affinity)').replace(/ 속성/g,' element');
}
export function localize(root){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 for(const node of nodes){if(node.parentElement?.closest('[translate="no"],script,style,textarea'))continue;node.textContent=translateText(node.textContent);}
 for(const el of root.querySelectorAll('[aria-label],[placeholder],[title]')){
  if(el.closest('[translate="no"]'))continue;
  for(const attr of ['aria-label','placeholder','title'])if(el.hasAttribute(attr))el.setAttribute(attr,translateText(el.getAttribute(attr)));
 }
}
