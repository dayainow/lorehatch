import {encounters,rememberEncounter,visitorFor,milestones} from './journal.mjs';
import {connectActivity,creditActivity} from './activity.mjs';
import {fieldnotes,habitatLore,friendship,pairs,recommendFriend} from './fieldnotes.mjs';
import { desktop, storage, downloadFile, SITE } from './platform.mjs';
import { installed, installationAvailable, installApp, registerApp, applyUpdate } from './install.mjs';
import { content, profiles, sourceLinks, starters, elements, affinity } from './content.mjs';
import { publicURL, shareText } from './share.mjs';
import { initialState, habitatNames, habitatOf, openHabitat, MODES, selectEgg, confirmReady, earn, earnInterval, setPartner, recordCare, renamePet, parseSave, targetSeconds, dayKey } from './domain.mjs';
import { load, persist, keyFor } from './storage.mjs';
const REPOSITORY = 'https://github.com/dayainow/lorehatch';
const canWrite = () => lockOwned && !saveBlocked;
const $ = s=>document.querySelector(s);
const mode = new URLSearchParams(location.search).get('mode') === 'demo' ? 'demo':'normal';
const loaded=load(storage,mode); let state=loaded.state, saveBlocked=!!loaded.blocked||!!desktop?.blocked;
let lockOwned=false, lockResolved=false, running=false, lastTick=0, lastWall=0, sessionElapsed=0, sessionLimit=0, checkpoint=0;
let modalReturnFocus=null,updateReady=false;
let page='garden', selectedPet=null, stagePreview='baby', notice=loaded.warning||desktop?.warning, toastTimer, reactionTimer;

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const name=id=>state.pets.find(p=>p.id===id)?.nickname || content[id]?.name || '';
const time=s=>`${String(Math.floor(Math.max(0,s)/60)).padStart(2,'0')}:${String(Math.floor(Math.max(0,s)%60)).padStart(2,'0')}`;
const duration=s=>mode==='demo'?`${Math.ceil(s)}초`:`${Math.floor(Math.max(0,s)/60)}분 ${String(Math.ceil(Math.max(0,s))%60).padStart(2,'0')}초`;
function sprite(id,stage='baby',extra='') {
 const base=id==='egg'?'egg':`${id}-${stage}`;
 return `<span class="sprite ${extra}" aria-hidden="true"><img src="./assets/sprites/${base}-0.svg" alt=""><img src="./assets/sprites/${base}-1.svg" alt=""></span>`;
}
function notify(message) { const t=$('#toast'); if(!t)return; t.textContent=message;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),4000); }
function save() {
 if (!canWrite())return;
 try { persist(storage,state); } catch { saveBlocked=true;notice='저장 공간에 기록하지 못했어요. 설정에서 진행 파일을 내보내 보관하세요.'; running=false; render(); }
}
function commit(next) {state=next;save();render();}
function pause(message) { running=false;lastTick=0;save();render();if(message)notify(message); }
function header() {
 return `<header class="header"><a class="brand" href="${mode==='demo'?'./?mode=demo':'./'}" aria-label="모아몬 홈"><span class="brand-mark">${sprite('egg')}</span><span>모아몬<small>MOAMON</small></span></a><nav aria-label="주 메뉴">${[['garden','정원'],['collection','도감'],['pets','내 펫'],['journal','추억']].map(([id,label])=>`<button data-page="${id}" class="nav-button ${page===id?'active':''}" ${page===id?'aria-current="page"':''}>${label}${id==='collection'?`<span>${state.pets.length}/${Object.keys(content).length}</span>`:''}</button>`).join('')}</nav><button class="icon-button" data-action="settings" aria-label="설정 열기">${icon('settings')}</button></header>`;
}
function icon(type){return type==='settings'?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m9 3-1 3-3 1-2 4 2 2 1 4 3 1 2 3 4-2 3-1 1-4 2-3-2-3-3-1-1-3Z"/><circle cx="12" cy="12" r="3"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';}
function scene() {
 const partner=state.pets.find(p=>p.id===state.partner);
 const egg=['incubating','hatch_ready'].includes(state.phase);
 return `<section class="scene" data-region="${partner?habitatOf(partner.id):0}" aria-label="숲속 정원"><div class="scene-top"><span class="scene-label"><i></i> ${habitatNames[partner?habitatOf(partner.id):0]}</span><span class="scene-counter">${state.pets.filter(p=>p.stage==='adult').length} / ${Object.keys(content).length} 성장</span></div><div class="sunbeam"></div><div class="scene-island" aria-hidden="true"></div><div class="firefly f1"></div><div class="firefly f2"></div><div class="firefly f3"></div>
 <div class="garden-decor ${state.settings.decoration}" aria-hidden="true">${state.settings.decoration==='flowers'?'<i>✿</i><i>✿</i><i>✿</i>':state.settings.decoration==='mushrooms'?'<i>♠</i><i>♠</i><i>♠</i>':'<i>◆</i><i>◆</i><i>◆</i>'}</div>
 ${partner?`<button class="scene-pet ${egg?'with-egg':''}" data-action="pet" aria-label="${esc(name(partner.id))} 쓰다듬기">${sprite(partner.id,partner.stage)}<span class="pet-heart" aria-hidden="true">♥</span><span class="pet-tag">${esc(name(partner.id))}<small>파트너</small></span></button>`:''}
 ${egg?`<div class="scene-egg ${partner?'secondary':''} ${state.phase==='hatch_ready'?'ready':''}">${sprite('egg')}<span class="pet-tag">${state.phase==='hatch_ready'?'만날 준비가 됐어요':'알을 품고 있어요'}</span></div>`:''}
 ${!partner&&!egg?`<div class="empty-nest">${sprite('egg')}<p>작은 만남이 기다리고 있어요</p></div>`:''}
 <div class="scene-bottom"><span>${running?'같이 작업하는 중':partner?'오늘도 함께, 천천히.':'당신의 첫 번째 작은 동료'}</span><button data-action="compact" class="scene-small">${document.body.classList.contains('compact')?'크게 보기':'작게 보기'} ↗</button></div></section>`;
}
function stageText() {return ({idle:'새로운 만남',incubating:'알을 품는 중',hatch_ready:'첫 인사를 나눠요',raising:'조금씩 자라고 있어요',growth_ready:'한 뼘 더 자랐어요',complete:'우리 정원이 완성됐어요'})[state.phase];}
function focusPanel() {
 const active=state.active, ready=state.phase.endsWith('ready'), growing=state.phase==='raising', incubation=state.phase==='incubating';
 const progress=active?Math.min(100,active.progress/targetSeconds(state)*100):0;
 return `<aside class="focus-panel"><div class="eyebrow">MY LITTLE COMPANION</div><h1>${stageText()}</h1><p class="panel-description">${state.phase==='idle'?'작업하는 시간에 작은 친구를 키워보세요.':state.phase==='complete'?'모든 친구가 자랐어요. 좋아하는 파트너와 계속 함께할 수 있어요.':!running&&!ready?'아래에서 같이 작업하기를 누르면 시간이 쌓여요.':ready?`${esc(name(active.id))}${state.phase==='hatch_ready'?'의 부화를 확인해 주세요.':'의 새로운 모습을 확인해보세요.'}`:`${incubation?esc(name(active.id))+'의 알을 품고 있어요.':esc(name(active.id))+'의 성장 시간이 쌓이고 있어요.'}`}</p>
 ${active?`<div class="active-pet"><span class="portrait ${content[active.id].color}">${sprite(incubation||state.phase==='hatch_ready'?'egg':active.id)}</span><div><span class="caption">${incubation||state.phase==='hatch_ready'?'품고 있는 알':'키우는 펫'}</span><strong>${esc(name(active.id))}</strong><span class="species-label">${content[active.id].kind}</span></div></div><div class="progress-heading"><span>${ready?'준비 완료':incubation?'부화까지':'성장까지'}</span><strong id="remaining">${ready?'확인해 주세요':duration(targetSeconds(state)-active.progress)}</strong></div><progress value="${progress}" max="100" aria-label="${incubation||state.phase==='hatch_ready'?'부화':'성장'} 진행">${Math.round(progress)}%</progress>`:''}
 ${ready?`<button class="primary full" data-action="confirm">${state.phase==='hatch_ready'?'알 부화시키기':'성장한 모습 보기'} ${icon('arrow')}</button>`:''}
 ${['idle','complete'].includes(state.phase)?`<button class="primary full" data-action="${state.phase==='complete'?'collection':'eggs'}">${state.phase==='complete'?'완성한 도감 보기':state.tutorialClaimed?'다음 알 고르기':'첫 알 고르기'} ${icon('arrow')}</button>`:''}
 ${(growing||incubation||state.phase==='complete')?`<div class="session"><div class="session-label"><span>함께한 시간</span><span id="session-clock">${time(sessionElapsed)}</span></div><div class="duration-options" aria-label="함께한 시간 선택">${[5,15,30,0].map(n=>`<button data-duration="${n}" aria-pressed="${sessionLimit===n*60}" ${running?'disabled':''}>${n?n+'분':'계속 함께'}</button>`).join('')}</div><button class="primary full ${running?'pause':''}" data-action="toggle"><span>${running?'Ⅱ 일시정지':'▶ 같이 작업하기'}</span><span class="button-time">${mode==='demo'?'빠른 체험':sessionLimit?time(sessionLimit):'자유롭게'}</span></button><p class="hint">${mode==='demo'?'체험: 부화 15초 · 성장 30초':'이 화면이 보이는 동안만 시간이 쌓여요.'}</p></div>`:''}
 <div class="daily"><span>오늘 함께한 시간</span><strong id="daily">${Math.floor(state.daily/60)}<small> / 150분</small></strong><div class="daily-line"><i id="daily-bar" style="width:${state.daily/MODES[mode].cap*100}%"></i></div>${state.bank>0?`<p>다음 펫에게 이어줄 시간 ${duration(state.bank)}</p>`:''}</div>
 ${desktop&&state.activity?.enabled?'<p class="activity-status"><i></i> AI 작업 신호 연결 켜짐</p>':''}<p class="quiet-note">서두르지 않아도 괜찮아요.<br>자리를 비워도 친구는 기다려요.</p></aside>`;
}
function nextCare(){
 const pet=state.pets.find(p=>p.id===state.partner);if(!pet)return '';
 const bond=friendship(pet.id,state.pets), other=state.pets.find(p=>p.id===bond.other);
 const cared=pet.care?.includes(pet.stage);
 let message=!cared?`${name(pet.id)}의 ${pet.stage==='baby'?'첫 반응':'달라진 반응'}을 발견해 보세요.`:
 bond.complete?`두 친구의 이야기 ‘${bond.title}’를 발견했어요.`:
 !other?`${content[bond.other].name}를 만나면 ‘${bond.title}’ 이야기를 이어갈 수 있어요.`:
 other.stage==='adult'&&!other.care?.includes('adult')?`${content[bond.other].name}도 다 자랐어요. 한 번 돌봐 주세요.`:'함께 자란 뒤 다시 돌보면 두 친구의 이야기가 열려요.';
 const target=cared&&other?.stage==='adult'&&!other.care?.includes('adult')?other:pet;
 return `<section class="next-care" aria-label="친구와 함께하기"><div><span class="eyebrow">${fieldnotes[pet.id][0]}</span><h2>함께하는 친구 · ${esc(name(pet.id))}</h2><p>${esc(message)}</p></div><button class="secondary" data-detail="${target.id}">${target.id!==pet.id?esc(name(target.id))+' 돌보기':cared?'돌봄과 이야기 보기':fieldnotes[pet.id][1]} →</button></section>`;
}
function visitorSection(){
 const id=visitorFor(state,dayKey());if(!id)return '';
 const done=(state.memories??[]).includes(id),pet=state.pets.find(p=>p.id===id),next=milestones(state).find(m=>!m.complete);
 return `<section class="visitor-section"><div class="visitor-character">${sprite(id,pet.stage)}</div><div><span class="eyebrow">오늘 함께할 친구</span><h2>${esc(name(id))}의 작은 부탁</h2><p>${done?'함께 만든 추억을 다시 펼쳐볼까요?':'잠깐 이야기를 나누고 추억 카드 한 장을 남겨요.'}</p><button class="secondary" data-encounter="${id}">${done?'추억 다시 보기':'친구 만나기'} →</button></div>${next?`<button class="next-stamp" data-page="journal"><small>다음 수집 목표</small><strong>${next.title}</strong><span>${next.description} · ${next.value}/${next.target}</span></button>`:''}</section>`;
}
function journalPage(){
 const marks=milestones(state),memories=state.memories??[];
 return `<main id="main-content" tabindex="-1" class="collection-page journal-page"><div class="page-title"><div><span class="eyebrow">OUR DAYS TOGETHER</span><h1>작은 추억 수첩</h1><p>함께 보낸 순간을 모아요. 놓친 날이 있어도 추억은 기다려요.</p></div><div class="collection-count">${memories.length}<span> / ${Object.keys(encounters).length}장</span></div></div><h2>정원의 발자국 <small>${marks.filter(m=>m.complete).length} / ${marks.length}</small></h2><div class="stamp-grid">${marks.map(m=>`<div class="journal-stamp ${m.complete?'earned':''}"><span class="stamp-seal">${m.complete?'✿':m.number}</span><strong>${m.title}</strong><p>${m.description}</p><small>${m.complete?'달성했어요':m.value+' / '+m.target}</small><progress value="${m.value}" max="${m.target}" aria-label="${m.title} 진행"></progress></div>`).join('')}</div><h2>친구와 만든 추억</h2><p>만난 친구라면 언제든 이야기를 나눌 수 있어요. 다시 골라도 불이익은 없어요.</p><div class="memory-grid">${Object.keys(content).map(id=>{const pet=state.pets.find(p=>p.id===id),owned=memories.includes(id);return `<button class="memory-card ${owned?'collected':''}" ${pet?'data-encounter="'+id+'"':'data-detail="'+id+'"'}>${sprite(id,pet?.stage||'adult',pet?'':'silhouette')}<span>${owned?encounters[id][3]:pet?'함께 만들 추억':'아직 만나지 못했어요'}</span><strong>${content[id].name}</strong><small>${owned?'기록 펼치기 ↗':pet?'이야기 나누기 →':'도감에서 찾아보기'}</small></button>`}).join('')}</div></main>`;
}
function encounterPage(id,wrong=false){
 const pet=state.pets.find(p=>p.id===id);if(!pet)return;
 const [question,choices,,title,ending]=encounters[id],owned=(state.memories??[]).includes(id);
 $('#modal')?.close();
 openModal(`<span class="eyebrow">${owned?'우리의 추억':'친구의 작은 부탁'}</span><h2 id="modal-title">${owned?title:esc(name(id))}</h2><div class="detail-art ${content[id].color}">${sprite(id,pet.stage)}</div><p class="encounter-copy">${owned?ending:question}</p>${owned?'<p class="modal-note">추억 수첩에 기록했어요. 언제든 다시 볼 수 있어요.</p><button class="primary full" data-action="open-journal">추억 수첩 펼치기 →</button>':`<div class="encounter-choices">${choices.map((label,index)=>`<button class="secondary full" data-memory-id="${id}" data-choice="${index}" ${!canWrite()?'disabled':''}>${label}</button>`).join('')}</div><p role="status">${wrong?'친구가 고개를 갸웃해요. 다른 방법도 생각해 볼까요?':'천천히 골라도 괜찮아요.'}</p>`}`,'encounter');
}

function gardenPage(){
 const firstVisit = state.phase === 'idle' && !state.tutorialClaimed;
 const opening = `<main id="main-content" tabindex="-1" class="forest-cover">
   <div class="cover-copy"><span class="cover-label">MOAMON &nbsp; / &nbsp; 책상 위 알 키우기</span>
   <h1>같이 작업하는 동안,<br>작은 친구가 자라요.</h1>
   <p>첫 알을 골라 숲용, 페가수스, 불씨 강아지 중 한 친구를 만나세요.<br>정원을 열어 두고 같이 작업하면 친구가 자라요.</p>
   <button class="primary" data-action="eggs">첫 알 고르기 ${icon('arrow')}</button>
   <button class="cover-demo" data-action="${mode==='demo'?'normal':'demo'}">${mode==='demo'?'일반 정원 열기':'30초 성장 체험'} ↗</button><p class="trial-note">체험 정원은 일반 정원과 따로 저장돼요.</p></div>
   <div class="cover-cast" aria-label="만날 수 있는 세 친구">${starters.map(id=>[id,content[id]]).map(([id,pet])=>`<figure>${sprite(id,'baby')}<figcaption>${elements[id]} · ${pet.name}</figcaption></figure>`).join('')}</div>
 </main>`;
 return `${firstVisit ? opening : `<main id="main-content" tabindex="-1" class="workspace">${scene()}${focusPanel()}</main>${nextCare()}${visitorSection()}`}<section class="below-garden"><div><span class="eyebrow">A LITTLE EVERY DAY</span><p>작은 알 하나에서,<br><strong>나만의 정원으로.</strong></p></div><ol class="journey"><li class="${state.tutorialClaimed?'done':''}"><span>01</span>알 고르기</li><li class="${state.pets.length?'done':''}"><span>02</span>함께 자라기</li><li class="${state.pets.some(p=>p.stage==='adult')?'done':''}"><span>03</span>도감 채우기</li></ol><span class="local-label">◌ ${desktop?"이 Mac에 저장됩니다":"이 브라우저에 저장됩니다"}</span></section>`;}
let guideHabitat=0;
let guideElement='전체';
let guideMissing=false;
function guideControls(count){
 const grown=state.pets.filter(p=>p.stage==='adult').length;
 return `<section class="guide-index" aria-label="도감 찾아보기">
 <div role="group" aria-label="서식지 도감">${habitatNames.map((h,i)=>`<button data-habitat="${i}" aria-pressed="${i===guideHabitat}">${h} ${state.pets.filter(p=>habitatOf(p.id)===i).length}/6</button>`).join('')}</div>
 <p>${guideHabitat>openHabitat(state)?habitatNames[guideHabitat-1]+' 친구 6종을 성장시키면 이곳의 알이 열려요.':'이곳의 알을 키울 수 있어요.'}</p><p>발견 <strong>${state.pets.length}종</strong> · 성장 <strong>${grown}종</strong></p>
 <div role="group" aria-label="속성 선택">${['전체','불','물','풀'].map(el=>`<button data-element="${el}" aria-pressed="${guideElement===el}">${el}</button>`).join('')}
 <button data-guide-missing aria-pressed="${guideMissing}">미발견만</button></div>
 <small role="status">${guideElement==='전체'?'모든 속성':guideElement+' 속성'} · ${count}종 표시</small></section>`;
}
function collectionPage(petsOnly=false) {
 const ids=petsOnly?state.pets.map(p=>p.id):Object.keys(content).filter(id=>habitatOf(id)===guideHabitat&&(guideElement==='전체'||elements[id]===guideElement)&&(!guideMissing||!state.pets.some(p=>p.id===id)));
 return `<main id="main-content" tabindex="-1" class="collection-page"><div class="page-title"><div><span class="eyebrow">${petsOnly?'OUR LITTLE FAMILY':'FIELD NOTES · VOL. 01'}</span><h1>${petsOnly?'내 펫':'모아몬 도감'}</h1><p>${petsOnly?'함께할 파트너를 골라주세요.':habitatLore[guideHabitat]}</p></div><div class="collection-count">${state.pets.length}<span> / ${Object.keys(content).length}종</span></div></div>${petsOnly?'':guideControls(ids.length)}${!petsOnly&&!ids.length?'<p>이 속성의 친구를 모두 만났어요. 미발견만 보기를 끄면 다시 볼 수 있어요.</p>':''}${petsOnly&&!ids.length?'<div class="empty-state"><p>아직 만난 친구가 없어요.</p><button class="primary" data-action="eggs">첫 알 고르기 →</button></div>':''}<div class="bestiary">${ids.map((id,i)=>{const p=state.pets.find(p=>p.id===id);return `<button class="creature-entry ${p?'owned':'locked'}" data-detail="${id}"><span class="entry-number">NO. ${String(Object.keys(content).indexOf(id)+1).padStart(2,'0')}</span><div class="specimen ${content[id].color}">${sprite(id,p?.stage||'adult',p?'':'silhouette')}<span class="specimen-ground"></span></div><div class="entry-title"><h2>${esc(p?name(id):content[id].name)}</h2><span>${p?p.stage==='adult'?'성장':'아기':'미발견'}</span></div><p>${elements[id]} 속성 · ${content[id].kind}</p><div class="entry-footer">${p?`${state.partner===id?'● 파트너 · ':''}${new Date(p.hatchedAt).toLocaleDateString('ko-KR')} 만남`:content[id].description}<span>↗</span></div></button>`}).join('')}</div>${petsOnly?'':relationships()}<p class="collection-note">서식지마다 여섯 친구가 살아요. 아기와 성장한 모습은 같은 친구예요. 친구 이야기 ${pairs.filter(([id])=>friendship(id,state.pets).complete).length} / ${pairs.length}개를 발견했어요.</p></main>`;
}
function menuCare(){
 const ready=state.phase.endsWith('ready');
 if(ready)return ['confirm',state.phase==='hatch_ready'?'알 부화시키기':'성장한 모습 보기'];
 if(state.phase==='idle')return ['eggs',state.tutorialClaimed?'다음 알 고르기':'첫 알 고르기'];
 return ['toggle',running?'잠깐 쉬기':'같이 작업하기'];
}
let previousMenu='';
function updateMenu(){
 if(!desktop?.menu)return;
 const line=state.active ? name(state.active.id)+' · '+(state.phase.endsWith('ready')?'준비 완료':duration(targetSeconds(state)-state.active.progress)+' 남음') : stageText();
 const label=menuCare()[1];
 const pet=state.pets.find(p=>p.id===(state.partner || state.active?.id));
 const spriteKey=pet ? pet.id+'-'+pet.stage : 'egg';
 const still=state.settings.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const signature=JSON.stringify([line,label,spriteKey,still]);
 if(previousMenu===signature)return;
 desktop.menu(line,label,spriteKey,still);previousMenu=signature;
}
window.addEventListener('moamon-activity',event=>{
 if(!canWrite())return;
 const next=creditActivity(state,event.detail);if(next===state)return;
 if(running){commit({...state,activity:next.activity});return;}
 const changed=next.phase!==state.phase;commit(next);
 if(changed)notify('AI 작업과 함께 친구가 자랐어요. 새로운 모습을 확인해 주세요.');
});
window.addEventListener('moamon-pet-care',()=>{
 if(!canWrite())return;
 const id=state.pets.find(p=>p.id===(state.partner||state.active?.id))?.id;
 if(id){$('#modal')?.close();detail(id);performCare(id);}else{notify('첫 알이 부화하면 돌볼 수 있어요.');}
});
window.addEventListener('moamon-care',()=>{
 if(document.querySelector('dialog[open]')||!canWrite())return;
 page='garden';render();document.querySelector('[data-action="'+menuCare()[0]+'"]')?.click();
});
function render(){
 updateMenu();
 const open=$('dialog[open]'); if(open) return;
 const focus=document.activeElement?.dataset;const restore=focus?.action || null;
 document.body.classList.toggle('reduce-motion',state.settings.reducedMotion);
 $('#app').innerHTML=`${header()}${updateReady?'<div class="update-banner" role="status"><span>새 버전이 준비됐어요. 현재 진행을 저장하고 업데이트할 수 있어요.</span><button data-action="update">업데이트</button></div>':''}${mode==='demo'?'<div class="mode-banner"><span>빠른 체험 중 · 일반 정원과 별도로 저장돼요</span><button data-action="normal">일반 정원으로 →</button></div>':''}${!lockOwned&&lockResolved?'<div class="warning" role="status">다른 탭에서 이 정원을 열고 있어요. 이 탭은 둘러보기만 할 수 있습니다. 다른 탭을 닫은 후 새로고침해 주세요.</div>':''}${notice?`<div class="warning" role="status">${esc(notice)}</div>`:''}${page==='garden'?gardenPage():page==='journal'?journalPage():collectionPage(page==='pets')}<section class="community"><span>작은 정원이 마음에 드셨나요?</span><div><button data-action="share">정원 공유하기 ↗</button><a href="${REPOSITORY}" target="_blank" rel="noopener noreferrer">☆ GitHub에서 Star</a><button data-action="help">이용 안내</button>${!installed()?'<button data-action="install">앱 설치</button>':''}</div></section><footer><span>MOAMON <span class="footer-dot">·</span> 작은 동료와 함께하는 시간</span><span>${desktop?"MAC APP":"WEB APP"} 0.6.0</span></footer><div id="toast" role="status" aria-live="polite"></div><dialog id="modal" aria-labelledby="modal-title"></dialog>`;
 if(!canWrite())document.querySelectorAll('[data-action="toggle"],[data-action="confirm"],[data-action="eggs"]').forEach(el=>el.disabled=true);
 if(restore)document.querySelector(`[data-action="${restore}"]`)?.focus({preventScroll:true});
}
function openModal(html,kind){const modal=$('#modal');
 const el=document.activeElement;
 if(!modal.contains(el)){for(const key of ['action','page','detail'])if(el?.dataset?.[key]){modalReturnFocus='[data-'+key+'="'+CSS.escape(el.dataset[key])+'"]';break;}}
modal.innerHTML=`<button class="close-modal" data-action="close" aria-label="닫기">×</button>${html}`;modal.dataset.kind=kind;modal.showModal();}
function eggs(){
 let available=(state.tutorialClaimed?Object.keys(content):starters).filter(id=>habitatOf(id)<=openHabitat(state)&&!state.pets.some(p=>p.id===id));
 const recommended=state.tutorialClaimed?recommendFriend(available,state.pets):null;
 if(recommended)available=[recommended,...available.filter(id=>id!==recommended)];
 openModal(`<span class="eyebrow">A NEW FRIEND</span><h2 id="modal-title">${state.tutorialClaimed?'다음 친구를 만나볼까요?':'첫 번째 알을 골라주세요'}</h2><p>${state.tutorialClaimed?`함께한 시간 ${duration(MODES[mode].hatch)} 후 부화해요.`:'첫 알은 기다림 없이 바로 만날 수 있어요.'}</p><div class="egg-choices">${available.map(id=>`<button class="egg-choice ${content[id].color}" data-egg="${id}"><div>${sprite(id)}</div><strong>${content[id].name}${id===recommended?' · 추천':''}</strong><span>${elements[id]} 속성 · ${content[id].kind}</span><small>${content[id].description}</small><small>${state.pets.some(p=>p.id===friendship(id,state.pets).other)?'정원의 친구와 함께할 수 있어요 · ':''}${content[friendship(id,state.pets).other].name}와 이어지는 이야기 · ${friendship(id,state.pets).title}</small><b>이 친구의 알 고르기 →</b></button>`).join('')}</div><p class="modal-note">세샘숲에서는 불이 가시풀을 태우고, 풀이 물을 머금고, 물이 불씨를 식혀요. 첫 친구가 다 자라면 호롱·토리·여울의 알도 고를 수 있어요.</p>`,'eggs');
}
function performCare(id){
 if(!canWrite())return;
 const pet=state.pets.find(p=>p.id===id);if(!pet)return;
 const before=friendship(id,state.pets).complete;
 commit(recordCare(state,id));
 if(saveBlocked)return;
 desktop?.react?.();
 $('#modal').close();detail(id);
 const bond=friendship(id,state.pets);
 if(!before&&bond.complete){
  $('#modal').close();
  openModal(`<span class="eyebrow">함께 발견한 이야기</span><h2 id="modal-title">${bond.title}</h2><div class="bond-cast">${sprite(id,'adult')}${sprite(bond.other,'adult')}</div><p class="care-response">${bond.ending}</p><p>${content[id].name}와 ${content[bond.other].name}의 이야기를 도감에 기록했어요.</p><button class="primary full" data-detail="${id}">친구의 기록 보기</button>`,'bond');
 }else{
  document.querySelector('.detail-art')?.classList.add('care-bounce');
  document.querySelector('.care-response')?.setAttribute('role','status');
  document.querySelector('[data-care]')?.focus({preventScroll:true});
 }
}
function relationships(){
 const rows=pairs.filter(([id])=>habitatOf(id)===guideHabitat);
 return `<section class="relationships" aria-label="친구 관계"><h2>이곳의 친구 이야기</h2>${rows.map(([a,b,title])=>{
  const bond=friendship(a,state.pets);
  return `<div class="relationship"><div class="bond-friends">${[a,b].map(id=>{const pet=state.pets.find(p=>p.id===id);return `<button data-detail="${id}" aria-label="${content[id].name} 기록 보기">${sprite(id,pet?.stage||'adult',pet?'':'silhouette')}<span>${content[id].name}</span><small>${pet?.care?.includes('adult')?'돌봄 완료':pet?.stage==='adult'?'성장 후 돌보기':pet?'함께 자라는 중':'아직 만나지 못함'}</small></button>`}).join('<span aria-hidden="true">＋</span>')}</div><div><h3>${title} ${bond.complete?'✓':''}</h3><p>${bond.complete?bond.ending:bond.hint}</p></div></div>`;
 }).join('')}</section>`;
}
function carePage(pet){
 const [role,action,baby,adult]=fieldnotes[pet.id];
 const bond=friendship(pet.id,state.pets);
 return `<section class="pet-profile"><h3>${role} · 현재 ${pet.stage==='baby'?'아기':'성장한'} 친구 돌보기</h3><button class="secondary" data-care="${pet.id}" ${!canWrite()?'disabled':''}>${action}</button>
 <p class="care-response">${pet.care?.includes(pet.stage)?(pet.stage==='baby'?baby:adult):'직접 돌보면 이 모습의 반응이 기록돼요.'}</p>
 <h3>${bond.title} · ${content[bond.other].name}와의 이야기</h3><p>${bond.complete?bond.ending:bond.hint}</p>
 <button class="text-button" data-detail="${bond.other}">${content[bond.other].name} 기록 보기 →</button>${bond.complete?'':'<small>두 친구가 다 자란 뒤 각각 한 번 돌보면 뒷이야기가 열려요.</small>'}</section>`;
}
function detail(id,stage){
 const pet=state.pets.find(p=>p.id===id);selectedPet=id;stagePreview=stage||pet?.stage||'adult';
 if(!pet){openModal(`<span class="eyebrow">NOT YET DISCOVERED</span><h2 id="modal-title">${content[id].name}</h2><div class="detail-art ${content[id].color}">${sprite(id,'adult','silhouette')}</div><p>${content[id].description}</p><p><strong>${elements[id]} 속성</strong> · ${starters.includes(id)&&!state.tutorialClaimed?'첫 알에서 선택할 수 있어요.':(habitatOf(id)>openHabitat(state)?habitatNames[habitatOf(id)-1]+'의 여섯 친구를 성장시켜 주세요.':'다음 알에서 선택할 수 있어요.')}</p><button class="primary full" data-action="close">기다릴게요</button>`,'detail');return;}
 openModal(`<span class="eyebrow">NO. ${String(Object.keys(content).indexOf(id)+1).padStart(2,'0')} · ${content[id].kind}</span><h2 id="modal-title">${esc(name(id))}</h2><div class="detail-art ${content[id].color}">${sprite(id,stagePreview)}</div><div class="stage-options"><button data-stage="baby" aria-pressed="${stagePreview==='baby'}">아기</button><button data-stage="adult" aria-pressed="${stagePreview==='adult'}" ${pet.stage!=='adult'?'disabled':''}>성장 ${pet.stage!=='adult'?'🔒':''}</button></div><p>${stagePreview==='adult'?content[id].adult:content[id].description}</p>${carePage(pet)}<section class="pet-profile" aria-label="펫 정보"><h3>정보</h3><p><strong>속성</strong> ${elements[id]} · ${affinity[elements[id]]}에 강해요</p><p><strong>성격</strong> ${esc(profiles[id].personality)}</p><p><strong>좋아하는 것</strong> ${profiles[id].likes.map(esc).join(" · ")}</p><p><strong>작은 반응</strong> ${esc(profiles[id].reaction)}</p></section><details><summary>이야기</summary><h3>우리의 설정</h3><p>${esc(profiles[id].adaptation)}</p><h3>전승과 출처</h3><p>${esc(profiles[id].tradition)}</p>${sourceLinks[id]?`<a class="source-link" href="${sourceLinks[id].url}" target="_blank" rel="noopener noreferrer">${sourceLinks[id].id} · ${sourceLinks[id].title} ↗</a>`:""}<small>캐릭터 이름과 디자인은 창작안이며 전승 자체와 구분해요.</small></details><section class="pet-record" aria-label="함께한 기록"><h3>함께한 기록</h3><p>만난 날 <time datetime="${esc(pet.hatchedAt)}">${new Date(pet.hatchedAt).toLocaleDateString("ko-KR")}</time></p>${pet.grownAt?`<p>성장한 날 <time datetime="${esc(pet.grownAt)}">${new Date(pet.grownAt).toLocaleDateString("ko-KR")}</time></p>`:"<p>아직 함께 자라는 중이에요.</p>"}</section><form id="rename-form"><label for="nickname">별명 <span>선택 · 최대 20자</span></label><div class="rename-row"><input id="nickname" name="nickname" maxlength="20" value="${esc(pet.nickname)}" placeholder="${content[id].name}" ${!canWrite()?'disabled':''}><button class="secondary" ${!canWrite()?'disabled':''}>저장</button></div></form><button class="primary full" data-partner="${id}" ${!canWrite()||state.partner===id?'disabled':''}>${state.partner===id?'지금 함께하는 파트너':'파트너로 선택'}</button>`,'detail');
}
function activitySettings(){
 if(!desktop||mode!=='normal')return '';
 return `<section class="setting-section"><h3>AI와 함께 자라기 <small>실험 기능</small></h3><p>Claude Code 작업 완료 신호를 연결하세요. 같은 1분 구간에서 한 번, 성장 시간 1분을 반영해요.</p><label class="switch-row">작업 완료 신호 반영<input id="activity" type="checkbox" ${state.activity?.enabled?'checked':''} ${!canWrite()?'disabled':''}></label><p>앱이 실행 중이어야 해요. 연결 전 기록과 1분 넘게 지난 신호는 적립하지 않아요. 같이 작업하는 중에는 자동 적립이 멈춰요.</p><details><summary>Claude Code 연결 안내</summary><p>Stop 명령 훅에 앱 실행 파일과 <code>--activity-signal</code>을 등록하세요. 저장소의 docs/24-ai-activity.md를 참고해 주세요. 이 스위치만으로 훅이 설치되지는 않아요.</p><p>신호 시각만 저장하며 프롬프트·응답·토큰·키는 읽지 않습니다. Codex 연동은 아직 지원하지 않습니다.</p></details></section>`;
}
function desktopSettings(){
 if(!desktop?.companion)return '';
 const status=desktop.companion('status');
 return `<section class="setting-section"><h3>바탕화면 친구</h3><p>정원의 파트너가 화면 위에 함께 있어요. 클릭하면 메뉴, 두 번 클릭하면 정원이 열려요.</p><p id="companion-status" role="status">${status.visible?'표시 중':'숨겨짐'} · ${status.size===144?'크게':'작게'}</p><div class="button-row"><button class="secondary" data-companion="toggle">표시 / 숨기기</button><button class="secondary" data-companion="small">작게</button><button class="secondary" data-companion="large">크게</button></div><button class="text-button" data-companion="reset">화면 오른쪽 아래로 데려오기</button></section>`;
}
function settings(){pause();openModal(`<span class="eyebrow">MAKE YOURSELF AT HOME</span><h2 id="modal-title">정원 설정</h2>${desktopSettings()}${activitySettings()}<section class="setting-section"><h3>편안하게 보기</h3><label class="switch-row">동작 줄이기<input type="checkbox" id="motion" ${state.settings.reducedMotion?'checked':''} ${!canWrite()?'disabled':''}></label><label class="select-row" for="decoration">정원 소품<select id="decoration" ${!canWrite()?'disabled':''}>${[['flowers','들꽃'],['mushrooms','버섯'],['stones','조약돌']].map(([v,l])=>`<option value="${v}" ${state.settings.decoration===v?'selected':''}>${l}</option>`).join('')}</select></label></section><section class="setting-section"><h3>내 진행 보관하기</h3><p>${desktop?"진행은 이 Mac의 앱 데이터 폴더에 저장돼요.":"진행은 이 브라우저에만 저장돼요."} 브라우저 데이터를 지우기 전에 파일을 보관해 주세요.</p><div class="button-row"><button class="secondary" data-action="export">파일 내보내기</button><button class="secondary" data-action="import" ${!lockOwned?'disabled':''}>파일 가져오기</button><input type="file" id="import-file" accept="application/json,.json" hidden></div><p id="import-status" role="status"></p></section><section class="setting-section"><h3>${mode==='demo'?'일반 정원으로 돌아가기':'먼저 짧게 체험해 보기'}</h3><p>체험 모드에서는 부화 15초, 성장 30초로 친구들을 만나볼 수 있어요. 일반 진행과 섞이지 않아요.</p><button class="secondary" data-action="${mode==='demo'?'normal':'demo'}">${mode==='demo'?'일반 정원 열기':'빠른 체험 열기'} →</button></section><section class="setting-section danger-section"><button class="text-button" data-action="reset" ${!lockOwned?'disabled':''}>${mode==='demo'?'체험':'현재 정원'} 진행 초기화</button></section><p class="modal-note">로그인 · 광고 · 분석 수집 없음<br>화면을 벗어나거나 잠자기 상태가 되면 함께한 시간 적립이 멈춥니다.</p>`,'settings');}
function help(){
 pause();openModal(`<span class="eyebrow">WELCOME TO MOAMON</span><h2 id="modal-title">작은 정원 이용 안내</h2><ol class="help-steps"><li><strong>첫 알 고르기</strong><p>세 친구 중 하나를 고르세요. 첫 알은 바로 부화해요.</p></li><li><strong>같이 작업하기</strong><p>일반 정원은 부화 5분 · 성장 15분, 빠른 체험은 부화 15초 · 성장 30초예요. 하루 최대 150분이 성장에 반영돼요.</p></li><li><strong>성장 확인하고 다음 알 고르기</strong><p>도감에서 아기와 성장한 모습을 보고 파트너를 바꿀 수 있어요.</p></li></ol><details open><summary>화면을 닫아도 자라나요?</summary><p>이 화면이 보이는 동안만 적립돼요. 탭 이동·화면 잠금·긴 대기에는 멈추고, 다시 돌아오면 같이 작업하기을 눌러주세요. 다른 앱 작업 중의 지속 적립은 데스크톱 버전에서 검증할 예정이에요.</p></details><details><summary>진행은 어디에 저장되나요?</summary><p>이 브라우저의 저장소에 저장돼요. 기기·브라우저·사이트 주소가 바뀌면 별도 정원으로 열려요. 설정에서 파일을 내보내 보관하고 같은 모드에 가져올 수 있어요. 브라우저 데이터를 지우면 진행도 사라져요.</p></details><details><summary>어떤 정보를 수집하나요?</summary><p>앱은 집중 세션의 시간만 로컬에서 계산해요. 작업 내용·키보드 입력·클립보드를 수집하지 않으며 분석 추적 도구를 사용하지 않아요. 사이트를 제공하는 호스팅 서비스는 접속 로그를 처리할 수 있어요. GitHub 링크는 외부 사이트를 열어요.</p></details><p>브라우저 알파 버전이에요. 문제가 생기면 사용한 브라우저와 재현 순서를 알려주세요. 저장 파일에는 별명이 있으니 공개 이슈에 첨부하기 전에 확인해 주세요.</p><a class="secondary feedback-link" href="${REPOSITORY}/issues" target="_blank" rel="noopener noreferrer">GitHub에 의견 남기기 ↗</a>`,'help');
}
function share(){
 pause();openModal(`<span class="eyebrow">A LITTLE GARDEN TO SHARE</span><h2 id="modal-title">작은 정원을 나눠보세요</h2><div class="share-preview">${state.pets.length?state.pets.map(p=>sprite(p.id,p.stage)).join(''):sprite('egg')}<strong>내 펫 도감</strong><span>${state.pets.length} / ${Object.keys(content).length}종 · ${state.pets.filter(p=>p.stage==='adult').length}종 성장</span></div><p>카드에는 모은 펫과 성장 수만 담아요. 별명과 함께한 시간은 포함하지 않아요.</p><div class="button-row"><button class="primary" data-action="share-image">카드 이미지 저장</button><button class="secondary" data-action="share-link">링크 공유</button></div><label class="share-label" for="share-url">공유할 주소</label><input id="share-url" class="share-url" readonly value="${esc(publicURL(desktop?SITE:location.href))}"><p class="modal-note">다른 사람은 자신의 새 정원에서 시작해요.</p>`,'share');
}
async function shareLink(){
 const data={title:'모아몬',text:shareText(desktop?SITE:location.href),url:publicURL(desktop?SITE:location.href)};
 try {if(navigator.share)await navigator.share(data);else if(navigator.clipboard){await navigator.clipboard.writeText(data.text);notify('공유 문구와 주소를 복사했어요.');}else{$('#share-url')?.select();notify('주소를 선택했어요. 복사해서 공유해 주세요.');}}
 catch(err){if(err.name!=='AbortError'){$('#share-url')?.select();notify('공유 주소를 직접 복사해 주세요.');}}
}
async function shareImage(){
 const canvas=document.createElement('canvas');canvas.width=960;canvas.height=600;const ctx=canvas.getContext('2d');
 ctx.fillStyle='#f4f1e8';ctx.fillRect(0,0,960,600);ctx.fillStyle='#163c39';ctx.fillRect(32,32,896,440);
 ctx.fillStyle='#e5ead0';ctx.font='18px sans-serif';ctx.fillText('MOAMON · MY LITTLE GARDEN',72,88);
 ctx.font='bold 46px sans-serif';ctx.fillText('내 펫 도감',72,160);
 const pets=state.pets.map(p=>({...p}));const ids=pets.length?pets:[{id:'egg'}];
 const images=await Promise.all(ids.map(p=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=new URL(`../assets/sprites/${p.id==='egg'?'egg':p.id+'-'+p.stage}-0.svg`,import.meta.url).href;})));
 const tile=Math.min(224,Math.floor(864/images.length));ctx.imageSmoothingEnabled=false;images.forEach((img,i)=>ctx.drawImage(img,480-images.length*tile/2+i*tile,430-tile,tile,tile));
 ctx.fillStyle='#315a42';ctx.font='bold 26px sans-serif';ctx.fillText(`${pets.length} / ${Object.keys(content).length}종 · ${pets.filter(p=>p.stage==='adult').length}종 성장`,64,528);
 ctx.font='18px sans-serif';ctx.fillText('알에서 시작하는 작은 만남. 함께 키워보세요.',64,567);
 canvas.toBlob(blob=>{if(!blob){notify('이미지를 만들지 못했어요.');return;}downloadFile(blob,'lorehatch-garden.png').catch(()=>notify('이미지를 저장하지 못했어요.'));},'image/png');
}
function showInstall(){
 pause();openModal(`<span class="eyebrow">어디서든 나의 작은 정원</span><h2 id="modal-title">모아몬 설치하기</h2><p>원하는 방식으로 정원을 가까이 두세요. 웹과 데스크톱 앱의 진행은 파일로 옮길 수 있어요.</p><section class="setting-section"><h3>macOS 앱 다운로드</h3><p>Mac용 앱은 배포 준비 중이에요. 공개된 설치 파일이 있는지 릴리스 목록에서 확인해 주세요.</p><a class="primary" href="${REPOSITORY}/releases" target="_blank" rel="noopener noreferrer">공개 릴리스 확인 ↗</a><p class="hint">개발자 서명·공증 전의 알파 버전입니다. macOS가 실행을 제한하면 아래 안내를 확인하세요.</p></section><section class="setting-section"><h3>브라우저 앱으로 설치</h3>${installationAvailable()?'<button class="primary full" data-action="install-now">이 기기에 앱 설치</button>':''}<p>Chrome·Edge: 주소창의 설치 아이콘 또는 메뉴의 ‘앱 설치’<br>Mac Safari: 파일 → Dock에 추가<br>iPhone·iPad Safari: 공유 → 홈 화면에 추가</p><p>설치 메뉴의 이름과 지원 여부는 브라우저에 따라 달라요. 한 번 온라인으로 연 뒤 앱 화면을 오프라인에서도 다시 열 수 있어요.</p></section><section class="setting-section"><h3>기존 펫 옮기기</h3><p>지금 정원의 설정에서 ‘파일 내보내기’를 누른 뒤, 새 앱의 같은 모드에서 ‘파일 가져오기’를 선택하세요. 브라우저와 앱 저장은 자동으로 합쳐지지 않아요.</p><a class="source-link" href="${REPOSITORY}/blob/main/docs/17-install.md" target="_blank" rel="noopener noreferrer">설치·업데이트·복구 안내 ↗</a></section>`,'install');
}
function closeModal(){const modal=$('#modal');modal.close();render();if(modalReturnFocus)document.querySelector(modalReturnFocus)?.focus({preventScroll:true});}
function switchMode(next){pause();location.href=next==='demo'?'./?mode=demo':'./';}
const mutations=new Set(['confirm','toggle','start-after-hatch','reset']);
document.addEventListener('click',event=>{
 const b=event.target.closest('button');if(!b||b.disabled)return;
 if(b.dataset.encounter){encounterPage(b.dataset.encounter);return;}
 if(b.dataset.memoryId){if(!canWrite())return;const id=b.dataset.memoryId,next=rememberEncounter(state,id,Number(b.dataset.choice));if(next!==state){commit(next);if(!saveBlocked){desktop?.react?.();encounterPage(id);}}else encounterPage(id,true);return;}
 if(b.dataset.companion){const status=desktop.companion(b.dataset.companion);$('#companion-status').textContent=`${status.visible?'표시 중':'숨겨짐'} · ${status.size===144?'크게':'작게'}`;return;}
 if(b.dataset.habitat!==undefined){guideHabitat=Number(b.dataset.habitat);render();document.querySelector('[data-habitat="'+guideHabitat+'"]')?.focus();return;}
 if(b.dataset.element || b.hasAttribute('data-guide-missing')){
  if(b.dataset.element)guideElement=b.dataset.element;else guideMissing=!guideMissing;
  render();
  document.querySelector(b.dataset.element?`[data-element="${guideElement}"]`:'[data-guide-missing]')?.focus({preventScroll:true});
  return;
 }
 if(b.dataset.page){page=b.dataset.page;render();window.scrollTo(0,0);$('#main-content')?.focus({preventScroll:true});return;}
 if(b.dataset.egg){if(!canWrite())return;closeModal();commit(selectEgg(state,b.dataset.egg));notify('알을 골랐어요. 첫 인사를 나눠보세요.');return;}
 if(b.dataset.care){
  if(!canWrite())return;
  performCare(b.dataset.care);return;
 }
 if(b.dataset.detail){$('#modal').close();detail(b.dataset.detail);return;}
 if(b.dataset.stage){$('#modal').close();detail(selectedPet,b.dataset.stage);return;}
 if(b.dataset.partner){if(!canWrite())return;state=setPartner(state,b.dataset.partner);closeModal();save();render();notify('파트너로 선택했어요.');return;}
 if(b.dataset.duration!==undefined){if(running)return;sessionLimit=Number(b.dataset.duration)*60;sessionElapsed=0;render();return;}
 const action=b.dataset.action;if(mutations.has(action)&&(!lockOwned||(saveBlocked&&action!=='reset')))return;
 if(action==='open-journal'){closeModal();page='journal';render();window.scrollTo(0,0);$('#main-content')?.focus({preventScroll:true});return;}
 if(action==='close')closeModal();
 if(action==='eggs')eggs();
 if(action==='settings')settings();
 if(action==='install')showInstall();
 if(action==='install-now')installApp().catch(()=>notify('설치 메뉴에서 다시 시도해 주세요.'));
 if(action==='update'){pause();if(!saveBlocked)applyUpdate();else notify('진행을 내보내 보관한 뒤 새로고침해 주세요.');}
 if(action==='help')help();
 if(action==='share')share();
 if(action==='share-link')shareLink();
 if(action==='share-image')shareImage().catch(()=>notify('이미지를 만들지 못했어요. 링크 공유를 이용해 주세요.'));
 if(action==='collection'){page='collection';render();}
 if(action==='demo'||action==='normal')switchMode(action);
 if(action==='compact'){document.body.classList.toggle('compact');render();}
 if(action==='pet'){const el=$('.scene-pet');el.classList.remove('petted');void el.offsetWidth;el.classList.add('petted');clearTimeout(reactionTimer);reactionTimer=setTimeout(()=>el.classList.remove('petted'),1400);notify(fieldnotes[state.partner][state.pets.find(p=>p.id===state.partner)?.stage==='adult'?3:2]);}
 if(action==='confirm'){
  const id=state.active.id, hatch=state.phase==='hatch_ready';state=confirmReady(state);save();render();
  openModal(`<span class="eyebrow">${hatch?'HELLO, LITTLE ONE':'GROWING TOGETHER'}</span><h2 id="modal-title">${hatch?'만나서 반가워요, ':'다 자랐어요, '}${esc(name(id))}!</h2><div class="celebration ${content[id].color}">${sprite(id,hatch?'baby':'adult')}<span>✧</span><span>✧</span><span>✧</span></div><p>${hatch?content[id].description:content[id].adult}</p><p class="modal-note">${hatch?'아기 모습이 도감에 기록됐어요.':'성장한 모습이 도감에 기록됐어요.'}</p><button class="primary full" data-action="${hatch?'start-after-hatch':'close'}">${hatch?(mode==='demo'?'30초 같이 작업하기':'같이 작업하기'):'정원으로 돌아가기 →'}</button>${hatch?'<button class="text-button full" data-action="close">나중에 키우기</button>':`<button class="secondary full" data-detail="${id}">성장한 친구 돌보기 →</button>`}`,'celebration');
 }
 if(action==='start-after-hatch')closeModal();
 if(action==='toggle'||action==='start-after-hatch'){
  if(running){pause('잠시 쉬어가요. 지금까지의 시간은 저장했어요.');return;}
  if(state.daily>=MODES[mode].cap && dayKey()<=state.day){notify('오늘 적립할 수 있는 시간을 모두 채웠어요. 내일 다시 함께해요.');return;}
  if(sessionLimit&&sessionElapsed>=sessionLimit)sessionElapsed=0;
  running=true;lastTick=performance.now();lastWall=Date.now();render();
 }
 if(action==='export'){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});downloadFile(blob,`lorehatch-${mode}-${dayKey()}.json`).catch(()=>notify('파일을 내보내지 못했어요. 다시 시도해 주세요.'));
 }
 if(action==='import')$('#import-file').click();
 if(action==='reset'){
  if(!confirm(`${mode==='demo'?'체험':'현재 정원'}의 펫과 진행을 모두 지울까요? 되돌리려면 내보낸 파일이 필요해요.`))return;
  try {storage.removeItem(keyFor(mode));storage.removeItem(keyFor(mode)+'.backup');} catch {notify('저장소에 접근할 수 없어 초기화하지 못했어요.');return;}
  state=initialState(mode);saveBlocked=false;notice='';sessionElapsed=0;closeModal();save();render();notify('새 정원을 준비했어요.');
 }
});
document.addEventListener('submit',e=>{
 if(e.target.id!=='rename-form')return;e.preventDefault();if(!canWrite())return;
 state=renamePet(state,selectedPet,$('#nickname').value);save();$('#modal').close();detail(selectedPet,stagePreview);notify('별명을 저장했어요.');
});
document.addEventListener('change',async e=>{
 if(!lockOwned||(saveBlocked&&e.target.id!=='import-file'))return;
 if(e.target.id==='activity'){state=connectActivity(state,e.target.checked);save();return;}
 if(e.target.id==='motion'){state.settings.reducedMotion=e.target.checked;document.body.classList.toggle('reduce-motion',e.target.checked);save();}
 if(e.target.id==='decoration'){state.settings.decoration=e.target.value;save();}
 if(e.target.id==='import-file'){
  const file=e.target.files[0];if(!file)return;
  try {
   if(file.size>100000)throw Error('100KB 이하의 저장 파일을 선택해 주세요.');
   const imported=parseSave(await file.text(),mode);
   if(!confirm('현재 진행을 이 파일로 바꿀까요? 지금 진행은 먼저 내보내 보관할 수 있어요.')){e.target.value='';return;}
   persist(storage,imported);state=imported;saveBlocked=false;notice='';sessionElapsed=0;closeModal();render();notify('진행 파일을 불러왔어요.');
  } catch(err){$('#import-status').textContent=`가져오지 못했어요: ${err.message} 기존 진행은 그대로예요.`;e.target.value='';}
 }
});
document.addEventListener('cancel',e=>{if(e.target.id==='modal'){e.preventDefault();closeModal();}},true);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)pause('화면을 벗어나 시간 적립을 잠시 멈췄어요.');});
window.addEventListener('lorehatch-suspend',()=>pause('시간 적립을 멈추고 진행을 저장했어요.'));
window.addEventListener('lorehatch-update-ready',()=>{updateReady=true;render();});
window.addEventListener('lorehatch-installed',()=>{render();notify('앱이 설치됐어요. 앱 목록에서 정원을 열어보세요.');});
window.addEventListener('pagehide',()=>{running=false;save();});
window.addEventListener('storage',e=>{if(e.key===keyFor(mode)&&!lockOwned){const updated=load(storage,mode);state=updated.state;saveBlocked=!!updated.blocked;notice=updated.warning;render();}});
setInterval(()=>{
 if(!running||!canWrite()||document.hidden)return;
 const now=performance.now(),wallNow=Date.now(),delta=(now-lastTick)/1000,wallStart=lastWall;lastTick=now;lastWall=wallNow;
 if(delta>5||delta<0||Math.abs((wallNow-wallStart)/1000-delta)>2){pause('잠자기 또는 긴 대기를 감지해 시간 적립을 멈췄어요.');return;}
 const seconds=Math.min(delta,sessionLimit?Math.max(0,sessionLimit-sessionElapsed):delta);
 const prev=state.phase;state=earnInterval(state,seconds,wallStart);sessionElapsed+=seconds;checkpoint+=seconds;
 updateMenu();
 if(checkpoint>=5||prev!==state.phase){save();checkpoint=0;}
 if(prev!==state.phase){running=false;render();notify('새로운 모습이 기다려요. 준비되면 확인해 주세요.');return;}
 if((sessionLimit&&sessionElapsed>=sessionLimit)||state.daily>=MODES[mode].cap){pause(state.daily>=MODES[mode].cap?'오늘의 적립을 모두 채웠어요.':'함께한 시간이 끝났어요. 수고했어요.');return;}
 if($('#session-clock'))$('#session-clock').textContent=time(sessionElapsed);
 if($('#remaining')&&state.active)$('#remaining').textContent=duration(targetSeconds(state)-state.active.progress);
 if($('progress')&&state.active)$('progress').value=state.active.progress/targetSeconds(state)*100;
 if($('#daily'))$('#daily').innerHTML=`${Math.floor(state.daily/60)}<small> / 150분</small>`;
 if($('#daily-bar'))$('#daily-bar').style.width=`${state.daily/MODES[mode].cap*100}%`;
},250);
render();
if(desktop){lockOwned=true;lockResolved=true;render();}
else if(navigator.locks){navigator.locks.request(`lorehatch-${mode}`,{ifAvailable:true},async lock=>{lockResolved=true;lockOwned=!!lock;if(lock){const fresh=load(storage,mode);state=fresh.state;saveBlocked=!!fresh.blocked;notice=fresh.warning;}render();if(lock)await new Promise(()=>{});}).catch(()=>{lockResolved=true;notice='중복 실행을 확인할 수 없어 둘러보기 모드로 열었어요.';render();});}
else {lockResolved=true;notice='이 브라우저에서는 안전한 저장 잠금을 지원하지 않아요. 최신 Chrome 또는 Safari로 열어주세요.';render();}

registerApp();
