import { content, profiles, sourceLinks } from './content.mjs';
import { publicURL, shareText } from './share.mjs';
import { initialState, MODES, selectEgg, confirmReady, earn, setPartner, renamePet, parseSave, targetSeconds, dayKey } from './domain.mjs';
import { load, persist, keyFor } from './storage.mjs';
const REPOSITORY = 'https://github.com/dayainow/lorehatch';
const canWrite = () => lockOwned && !saveBlocked;
const $ = s=>document.querySelector(s);
const mode = new URLSearchParams(location.search).get('mode') === 'demo' ? 'demo':'normal';
const storage = { getItem:k=>localStorage.getItem(k), setItem:(k,v)=>localStorage.setItem(k,v) };
const loaded=load(storage,mode); let state=loaded.state, saveBlocked=!!loaded.blocked;
let lockOwned=false, lockResolved=false, running=false, lastTick=0, sessionElapsed=0, sessionLimit=25*60, checkpoint=0;
let page='garden', selectedPet=null, stagePreview='baby', notice=loaded.warning, toastTimer, reactionTimer;

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const name=id=>state.pets.find(p=>p.id===id)?.nickname || content[id]?.name || '';
const time=s=>`${String(Math.floor(Math.max(0,s)/60)).padStart(2,'0')}:${String(Math.floor(Math.max(0,s)%60)).padStart(2,'0')}`;
const duration=s=>mode==='demo'?`${Math.ceil(s)}초`:`${Math.ceil(s/60)}분`;
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
 return `<header class="header"><a class="brand" href="${mode==='demo'?'./?mode=demo':'./'}" aria-label="환수정원 홈"><span class="brand-mark">${sprite('egg')}</span><span>환수정원<small>LOREHATCH</small></span></a><nav aria-label="주 메뉴">${[['garden','정원'],['collection','도감'],['pets','내 펫']].map(([id,label])=>`<button data-page="${id}" class="nav-button ${page===id?'active':''}" ${page===id?'aria-current="page"':''}>${label}${id==='collection'?`<span>${state.pets.length}/3</span>`:''}</button>`).join('')}</nav><button class="icon-button" data-action="settings" aria-label="설정 열기">${icon('settings')}</button></header>`;
}
function icon(type){return type==='settings'?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m9 3-1 3-3 1-2 4 2 2 1 4 3 1 2 3 4-2 3-1 1-4 2-3-2-3-3-1-1-3Z"/><circle cx="12" cy="12" r="3"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';}
function scene() {
 const partner=state.pets.find(p=>p.id===state.partner);
 const egg=['incubating','hatch_ready'].includes(state.phase);
 return `<section class="scene" aria-label="숲속 정원"><div class="scene-top"><span class="scene-label"><i></i> 작은 숲</span><span class="scene-counter">${state.pets.filter(p=>p.stage==='adult').length} / 3 성장</span></div><div class="sunbeam"></div><div class="firefly f1"></div><div class="firefly f2"></div><div class="firefly f3"></div>
 <div class="garden-decor ${state.settings.decoration}" aria-hidden="true">${state.settings.decoration==='flowers'?'<i>✿</i><i>✿</i><i>✿</i>':state.settings.decoration==='mushrooms'?'<i>♠</i><i>♠</i><i>♠</i>':'<i>◆</i><i>◆</i><i>◆</i>'}</div>
 ${partner?`<button class="scene-pet ${egg?'with-egg':''}" data-action="pet" aria-label="${esc(name(partner.id))} 쓰다듬기">${sprite(partner.id,partner.stage)}<span class="pet-heart" aria-hidden="true">♥</span><span class="pet-tag">${esc(name(partner.id))}<small>파트너</small></span></button>`:''}
 ${egg?`<div class="scene-egg ${partner?'secondary':''} ${state.phase==='hatch_ready'?'ready':''}">${sprite('egg')}<span class="pet-tag">${state.phase==='hatch_ready'?'만날 준비가 됐어요':'알을 품고 있어요'}</span></div>`:''}
 ${!partner&&!egg?`<div class="empty-nest">${sprite('egg')}<p>작은 만남이 기다리고 있어요</p></div>`:''}
 <div class="scene-bottom"><span>${running?'함께 집중하는 중':partner?'오늘도 함께, 천천히.':'당신의 첫 번째 작은 동료'}</span><button data-action="compact" class="scene-small">${document.body.classList.contains('compact')?'크게 보기':'작게 보기'} ↗</button></div></section>`;
}
function stageText() {return ({idle:'새로운 만남',incubating:'알을 품는 중',hatch_ready:'첫 인사를 나눠요',raising:'조금씩 자라고 있어요',growth_ready:'한 뼘 더 자랐어요',complete:'우리 정원이 완성됐어요'})[state.phase];}
function focusPanel() {
 const active=state.active, ready=state.phase.endsWith('ready'), growing=state.phase==='raising', incubation=state.phase==='incubating';
 const progress=active?Math.min(100,active.progress/targetSeconds(state)*100):0;
 return `<aside class="focus-panel"><div class="eyebrow">YOUR LITTLE COMPANION</div><h1>${stageText()}</h1><p class="panel-description">${state.phase==='idle'?'작업하는 시간에 작은 친구를 키워보세요.':state.phase==='complete'?'세 친구가 모두 자랐어요. 좋아하는 파트너와 계속 함께할 수 있어요.':ready?`${esc(name(active.id))}${state.phase==='hatch_ready'?'의 부화를 확인해 주세요.':'의 새로운 모습을 확인해보세요.'}`:`${incubation?esc(name(active.id))+'의 알을 품고 있어요.':esc(name(active.id))+'의 성장 시간이 쌓이고 있어요.'}`}</p>
 ${active?`<div class="active-pet"><span class="portrait ${content[active.id].color}">${sprite(incubation||state.phase==='hatch_ready'?'egg':active.id)}</span><div><span class="caption">${incubation||state.phase==='hatch_ready'?'품고 있는 알':'키우는 펫'}</span><strong>${esc(name(active.id))}</strong><span class="species-label">${content[active.id].kind}</span></div></div><div class="progress-heading"><span>${ready?'준비 완료':incubation?'부화까지':'성장까지'}</span><strong id="remaining">${ready?'확인해 주세요':duration(targetSeconds(state)-active.progress)}</strong></div><progress value="${progress}" max="100" aria-label="${incubation||state.phase==='hatch_ready'?'부화':'성장'} 진행">${Math.round(progress)}%</progress>`:''}
 ${ready?`<button class="primary full" data-action="confirm">${state.phase==='hatch_ready'?'알 부화시키기':'성장한 모습 보기'} ${icon('arrow')}</button>`:''}
 ${['idle','complete'].includes(state.phase)?`<button class="primary full" data-action="${state.phase==='complete'?'collection':'eggs'}">${state.phase==='complete'?'완성한 도감 보기':state.tutorialClaimed?'다음 알 고르기':'첫 알 고르기'} ${icon('arrow')}</button>`:''}
 ${(growing||incubation||state.phase==='complete')?`<div class="session"><div class="session-label"><span>집중 시간</span><span id="session-clock">${time(sessionElapsed)}</span></div><div class="duration-options" aria-label="집중 시간 선택">${[10,25,50,0].map(n=>`<button data-duration="${n}" aria-pressed="${sessionLimit===n*60}" ${running?'disabled':''}>${n?n+'분':'자유'}</button>`).join('')}</div><button class="primary full ${running?'pause':''}" data-action="toggle"><span>${running?'Ⅱ 일시정지':'▶ 집중 시작'}</span><span class="button-time">${mode==='demo'?'빠른 체험':sessionLimit?time(sessionLimit):'자유롭게'}</span></button><p class="hint">${mode==='demo'?'체험: 부화 15초 · 성장 30초':'이 화면이 보이는 동안만 시간이 쌓여요.'}</p></div>`:''}
 <div class="daily"><span>오늘 함께한 시간</span><strong id="daily">${Math.floor(state.daily/60)}<small> / 150분</small></strong><div class="daily-line"><i id="daily-bar" style="width:${state.daily/MODES[mode].cap*100}%"></i></div>${state.bank>0?`<p>다음 펫에게 이어줄 시간 ${duration(state.bank)}</p>`:''}</div>
 <p class="quiet-note">서두르지 않아도 괜찮아요.<br>자리를 비워도 친구는 기다려요.</p></aside>`;
}
function gardenPage(){return `${!state.tutorialClaimed?`<section class="welcome"><div><span class="eyebrow">BROWSER ALPHA · 3 PETS</span><h2>집중하는 시간에,<br>작은 친구가 자라요.</h2><p>첫 알은 바로 부화해요. 이 화면을 열어두고 집중을 시작하세요.<br>다른 탭으로 이동하면 잠시 멈추고, 진행은 이 브라우저에 저장돼요.</p></div><div class="welcome-actions"><button class="secondary" data-action="${mode==='demo'?'normal':'demo'}">${mode==='demo'?'일반 정원 열기':'30초 성장 체험'} →</button><button class="text-button" data-action="help">처음 오셨나요?</button></div></section>`:''}<main class="workspace">${scene()}${focusPanel()}</main><section class="below-garden"><div><span class="eyebrow">A LITTLE EVERY DAY</span><p>작은 알 하나에서,<br><strong>나만의 정원으로.</strong></p></div><ol class="journey"><li class="${state.tutorialClaimed?'done':''}"><span>01</span>알 고르기</li><li class="${state.pets.length?'done':''}"><span>02</span>함께 자라기</li><li class="${state.pets.some(p=>p.stage==='adult')?'done':''}"><span>03</span>도감 채우기</li></ol><span class="local-label">◌ 이 브라우저에 저장됩니다</span></section>`;}
function collectionPage(petsOnly=false) {
 const ids=petsOnly?state.pets.map(p=>p.id):Object.keys(content);
 return `<main class="collection-page"><div class="page-title"><div><span class="eyebrow">${petsOnly?'OUR LITTLE FAMILY':'FIELD NOTES · VOL. 01'}</span><h1>${petsOnly?'내 펫':'작은 친구들의 도감'}</h1><p>${petsOnly?'함께할 파트너를 골라주세요.':'아기부터 성장한 모습까지, 함께한 시간을 모아요.'}</p></div><div class="collection-count">${state.pets.length}<span> / 3종</span></div></div>${!ids.length?'<div class="empty-state"><p>아직 만난 친구가 없어요.</p><button class="primary" data-action="eggs">첫 알 고르기 →</button></div>':''}<div class="bestiary">${ids.map((id,i)=>{const p=state.pets.find(p=>p.id===id);return `<button class="creature-entry ${p?'owned':'locked'}" data-detail="${id}"><span class="entry-number">NO. ${String(Object.keys(content).indexOf(id)+1).padStart(2,'0')}</span><div class="specimen ${content[id].color}">${sprite(id,p?.stage||'adult',p?'':'silhouette')}<span class="specimen-ground"></span></div><div class="entry-title"><h2>${esc(p?name(id):content[id].name)}</h2><span>${p?p.stage==='adult'?'성장':'아기':'미발견'}</span></div><p>${content[id].kind}</p><div class="entry-footer">${p?`${state.partner===id?'● 파트너 · ':''}${new Date(p.hatchedAt).toLocaleDateString('ko-KR')} 만남`:'어떤 친구가 기다리고 있을까요?'}<span>↗</span></div></button>`}).join('')}</div><p class="collection-note">세 종, 여섯 가지 모습. 아기와 성장한 모습은 같은 친구예요.</p></main>`;
}
function render(){
 const open=$('dialog[open]'); if(open) return;
 const focus=document.activeElement?.dataset;const restore=focus?.action || null;
 document.body.classList.toggle('reduce-motion',state.settings.reducedMotion);
 $('#app').innerHTML=`${header()}${mode==='demo'?'<div class="mode-banner"><span>빠른 체험 중 · 일반 정원과 별도로 저장돼요</span><button data-action="normal">일반 정원으로 →</button></div>':''}${!lockOwned&&lockResolved?'<div class="warning" role="status">다른 탭에서 이 정원을 열고 있어요. 이 탭은 둘러보기만 할 수 있습니다. 다른 탭을 닫은 후 새로고침해 주세요.</div>':''}${notice?`<div class="warning" role="status">${esc(notice)}</div>`:''}${page==='garden'?gardenPage():collectionPage(page==='pets')}<section class="community"><span>작은 정원이 마음에 드셨나요?</span><div><button data-action="share">정원 공유하기 ↗</button><a href="${REPOSITORY}" target="_blank" rel="noopener noreferrer">☆ GitHub에서 Star</a><button data-action="help">이용 안내</button></div></section><footer><span>LOREHATCH <span class="footer-dot">·</span> 작은 동료와 함께하는 시간</span><span>BROWSER ALPHA 0.5.1</span></footer><div id="toast" role="status" aria-live="polite"></div><dialog id="modal" aria-labelledby="modal-title"></dialog>`;
 if(!canWrite())document.querySelectorAll('[data-action="toggle"],[data-action="confirm"],[data-action="eggs"]').forEach(el=>el.disabled=true);
 if(restore)document.querySelector(`[data-action="${restore}"]`)?.focus({preventScroll:true});
}
function openModal(html,kind){const modal=$('#modal');modal.innerHTML=`<button class="close-modal" data-action="close" aria-label="닫기">×</button>${html}`;modal.dataset.kind=kind;modal.showModal();}
function eggs(){
 const available=Object.keys(content).filter(id=>!state.pets.some(p=>p.id===id));
 openModal(`<span class="eyebrow">A NEW FRIEND</span><h2 id="modal-title">${state.tutorialClaimed?'다음 친구를 만나볼까요?':'첫 번째 알을 골라주세요'}</h2><p>${state.tutorialClaimed?`집중 시간 ${duration(MODES[mode].hatch)} 후 부화해요.`:'첫 알은 기다림 없이 바로 만날 수 있어요.'}</p><div class="egg-choices">${available.map(id=>`<button class="egg-choice ${content[id].color}" data-egg="${id}"><div>${sprite(id)}</div><strong>${content[id].name}</strong><span>${content[id].kind}</span><small>${content[id].description}</small><b>이 친구의 알 고르기 →</b></button>`).join('')}</div><p class="modal-note">결과를 알고 고르는 알이에요. 중복 없이 세 친구를 만나요.</p>`,'eggs');
}
function detail(id,stage){
 const pet=state.pets.find(p=>p.id===id);selectedPet=id;stagePreview=stage||pet?.stage||'adult';
 if(!pet){openModal(`<span class="eyebrow">NOT YET DISCOVERED</span><h2 id="modal-title">${content[id].name}</h2><div class="detail-art ${content[id].color}">${sprite(id,'adult','silhouette')}</div><p>${content[id].description}</p><p>알에서 만나면 도감이 기록돼요.</p><button class="primary full" data-action="close">기다릴게요</button>`,'detail');return;}
 openModal(`<span class="eyebrow">NO. ${String(Object.keys(content).indexOf(id)+1).padStart(2,'0')} · ${content[id].kind}</span><h2 id="modal-title">${esc(name(id))}</h2><div class="detail-art ${content[id].color}">${sprite(id,stagePreview)}</div><div class="stage-options"><button data-stage="baby" aria-pressed="${stagePreview==='baby'}">아기</button><button data-stage="adult" aria-pressed="${stagePreview==='adult'}" ${pet.stage!=='adult'?'disabled':''}>성장 ${pet.stage!=='adult'?'🔒':''}</button></div><p>${stagePreview==='adult'?content[id].adult:content[id].description}</p><section class="pet-profile" aria-label="펫 정보"><h3>정보</h3><p><strong>성격</strong> ${esc(profiles[id].personality)}</p><p><strong>좋아하는 것</strong> ${profiles[id].likes.map(esc).join(" · ")}</p><p><strong>작은 반응</strong> ${esc(profiles[id].reaction)}</p></section><details><summary>이야기</summary><h3>우리의 설정</h3><p>${esc(profiles[id].adaptation)}</p><h3>전승과 출처</h3><p>${esc(profiles[id].tradition)}</p>${sourceLinks[id]?`<a class="source-link" href="${sourceLinks[id].url}" target="_blank" rel="noopener noreferrer">${sourceLinks[id].id} · ${sourceLinks[id].title} ↗</a>`:""}<small>캐릭터 이름과 디자인은 창작안이며 전승 자체와 구분해요.</small></details><section class="pet-record" aria-label="함께한 기록"><h3>함께한 기록</h3><p>만난 날 <time datetime="${esc(pet.hatchedAt)}">${new Date(pet.hatchedAt).toLocaleDateString("ko-KR")}</time></p>${pet.grownAt?`<p>성장한 날 <time datetime="${esc(pet.grownAt)}">${new Date(pet.grownAt).toLocaleDateString("ko-KR")}</time></p>`:"<p>아직 함께 자라는 중이에요.</p>"}</section><form id="rename-form"><label for="nickname">별명 <span>선택 · 최대 20자</span></label><div class="rename-row"><input id="nickname" name="nickname" maxlength="20" value="${esc(pet.nickname)}" placeholder="${content[id].name}" ${!canWrite()?'disabled':''}><button class="secondary" ${!canWrite()?'disabled':''}>저장</button></div></form><button class="primary full" data-partner="${id}" ${!canWrite()||state.partner===id?'disabled':''}>${state.partner===id?'지금 함께하는 파트너':'파트너로 선택'}</button>`,'detail');
}
function settings(){pause();openModal(`<span class="eyebrow">MAKE YOURSELF AT HOME</span><h2 id="modal-title">정원 설정</h2><section class="setting-section"><h3>편안하게 보기</h3><label class="switch-row">동작 줄이기<input type="checkbox" id="motion" ${state.settings.reducedMotion?'checked':''} ${!canWrite()?'disabled':''}></label><label class="select-row" for="decoration">정원 소품<select id="decoration" ${!canWrite()?'disabled':''}>${[['flowers','들꽃'],['mushrooms','버섯'],['stones','조약돌']].map(([v,l])=>`<option value="${v}" ${state.settings.decoration===v?'selected':''}>${l}</option>`).join('')}</select></label></section><section class="setting-section"><h3>내 진행 보관하기</h3><p>진행은 이 브라우저에만 저장돼요. 브라우저 데이터를 지우기 전에 파일을 보관해 주세요.</p><div class="button-row"><button class="secondary" data-action="export">파일 내보내기</button><button class="secondary" data-action="import" ${!lockOwned?'disabled':''}>파일 가져오기</button><input type="file" id="import-file" accept="application/json,.json" hidden></div><p id="import-status" role="status"></p></section><section class="setting-section"><h3>${mode==='demo'?'일반 정원으로 돌아가기':'먼저 짧게 체험해 보기'}</h3><p>체험 모드에서는 부화 15초, 성장 30초로 세 친구를 만나볼 수 있어요. 일반 진행과 섞이지 않아요.</p><button class="secondary" data-action="${mode==='demo'?'normal':'demo'}">${mode==='demo'?'일반 정원 열기':'빠른 체험 열기'} →</button></section><section class="setting-section danger-section"><button class="text-button" data-action="reset" ${!lockOwned?'disabled':''}>${mode==='demo'?'체험':'현재 정원'} 진행 초기화</button></section><p class="modal-note">로그인 · 광고 · 분석 수집 없음<br>화면을 벗어나거나 잠자기 상태가 되면 집중이 멈춥니다.</p>`,'settings');}
function help(){
 pause();openModal(`<span class="eyebrow">WELCOME TO LOREHATCH</span><h2 id="modal-title">작은 정원 이용 안내</h2><ol class="help-steps"><li><strong>첫 알 고르기</strong><p>세 친구 중 하나를 고르세요. 첫 알은 바로 부화해요.</p></li><li><strong>집중 시작</strong><p>일반 정원은 부화 25분 · 성장 75분, 빠른 체험은 부화 15초 · 성장 30초예요. 하루 최대 150분이 성장에 반영돼요.</p></li><li><strong>성장 확인하고 다음 알 고르기</strong><p>도감에서 아기와 성장한 모습을 보고 파트너를 바꿀 수 있어요.</p></li></ol><details open><summary>화면을 닫아도 자라나요?</summary><p>이 화면이 보이는 동안만 적립돼요. 탭 이동·화면 잠금·긴 대기에는 멈추고, 다시 돌아오면 집중 시작을 눌러주세요. 다른 앱 작업 중의 지속 적립은 데스크톱 버전에서 검증할 예정이에요.</p></details><details><summary>진행은 어디에 저장되나요?</summary><p>이 브라우저의 저장소에 저장돼요. 기기·브라우저·사이트 주소가 바뀌면 별도 정원으로 열려요. 설정에서 파일을 내보내 보관하고 같은 모드에 가져올 수 있어요. 브라우저 데이터를 지우면 진행도 사라져요.</p></details><details><summary>어떤 정보를 수집하나요?</summary><p>앱은 집중 세션의 시간만 로컬에서 계산해요. 작업 내용·키보드 입력·클립보드를 수집하지 않으며 분석 추적 도구를 사용하지 않아요. 사이트를 제공하는 호스팅 서비스는 접속 로그를 처리할 수 있어요. GitHub 링크는 외부 사이트를 열어요.</p></details><p>브라우저 알파 버전이에요. 문제가 생기면 사용한 브라우저와 재현 순서를 알려주세요. 저장 파일에는 별명이 있으니 공개 이슈에 첨부하기 전에 확인해 주세요.</p><a class="secondary feedback-link" href="${REPOSITORY}/issues" target="_blank" rel="noopener noreferrer">GitHub에 의견 남기기 ↗</a>`,'help');
}
function share(){
 pause();openModal(`<span class="eyebrow">A LITTLE GARDEN TO SHARE</span><h2 id="modal-title">작은 정원을 나눠보세요</h2><div class="share-preview">${state.pets.length?state.pets.map(p=>sprite(p.id,p.stage)).join(''):sprite('egg')}<strong>나의 환수정원</strong><span>${state.pets.length} / 3종 · ${state.pets.filter(p=>p.stage==='adult').length}종 성장</span></div><p>카드에는 모은 펫과 성장 수만 담아요. 별명과 집중 시간은 포함하지 않아요.</p><div class="button-row"><button class="primary" data-action="share-image">카드 이미지 저장</button><button class="secondary" data-action="share-link">링크 공유</button></div><label class="share-label" for="share-url">공유할 주소</label><input id="share-url" class="share-url" readonly value="${esc(publicURL(location.href))}"><p class="modal-note">다른 사람은 자신의 새 정원에서 시작해요.</p>`,'share');
}
async function shareLink(){
 const data={title:'환수정원 · Lorehatch',text:shareText(location.href),url:publicURL(location.href)};
 try {if(navigator.share)await navigator.share(data);else if(navigator.clipboard){await navigator.clipboard.writeText(data.text);notify('공유 문구와 주소를 복사했어요.');}else{$('#share-url')?.select();notify('주소를 선택했어요. 복사해서 공유해 주세요.');}}
 catch(err){if(err.name!=='AbortError'){$('#share-url')?.select();notify('공유 주소를 직접 복사해 주세요.');}}
}
async function shareImage(){
 const canvas=document.createElement('canvas');canvas.width=960;canvas.height=600;const ctx=canvas.getContext('2d');
 ctx.fillStyle='#f4f1e8';ctx.fillRect(0,0,960,600);ctx.fillStyle='#163c39';ctx.fillRect(32,32,896,440);
 ctx.fillStyle='#e5ead0';ctx.font='18px sans-serif';ctx.fillText('LOREHATCH · MY LITTLE GARDEN',72,88);
 ctx.font='bold 46px sans-serif';ctx.fillText('나의 환수정원',72,160);
 const pets=state.pets.map(p=>({...p}));const ids=pets.length?pets:[{id:'egg'}];
 const images=await Promise.all(ids.map(p=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=new URL(`../assets/sprites/${p.id==='egg'?'egg':p.id+'-'+p.stage}-0.svg`,import.meta.url).href;})));
 ctx.imageSmoothingEnabled=false;images.forEach((img,i)=>ctx.drawImage(img,480-images.length*112+i*224,206,224,224));
 ctx.fillStyle='#315a42';ctx.font='bold 26px sans-serif';ctx.fillText(`${pets.length} / 3종 · ${pets.filter(p=>p.stage==='adult').length}종 성장`,64,528);
 ctx.font='18px sans-serif';ctx.fillText('알에서 시작하는 작은 만남. 함께 키워보세요.',64,567);
 canvas.toBlob(blob=>{if(!blob){notify('이미지를 만들지 못했어요.');return;}const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='lorehatch-garden.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},'image/png');
}
function closeModal(){const modal=$('#modal');modal.close();render();}
function switchMode(next){pause();location.href=next==='demo'?'./?mode=demo':'./';}
const mutations=new Set(['confirm','toggle','reset']);
document.addEventListener('click',event=>{
 const b=event.target.closest('button');if(!b||b.disabled)return;
 if(b.dataset.page){page=b.dataset.page;render();return;}
 if(b.dataset.egg){if(!canWrite())return;closeModal();commit(selectEgg(state,b.dataset.egg));notify('알을 골랐어요. 첫 인사를 나눠보세요.');return;}
 if(b.dataset.detail){detail(b.dataset.detail);return;}
 if(b.dataset.stage){$('#modal').close();detail(selectedPet,b.dataset.stage);return;}
 if(b.dataset.partner){if(!canWrite())return;state=setPartner(state,b.dataset.partner);closeModal();save();render();notify('파트너로 선택했어요.');return;}
 if(b.dataset.duration!==undefined){if(running)return;sessionLimit=Number(b.dataset.duration)*60;sessionElapsed=0;render();return;}
 const action=b.dataset.action;if(mutations.has(action)&&(!lockOwned||(saveBlocked&&action!=='reset')))return;
 if(action==='close')closeModal();
 if(action==='eggs')eggs();
 if(action==='settings')settings();
 if(action==='help')help();
 if(action==='share')share();
 if(action==='share-link')shareLink();
 if(action==='share-image')shareImage().catch(()=>notify('이미지를 만들지 못했어요. 링크 공유를 이용해 주세요.'));
 if(action==='collection'){page='collection';render();}
 if(action==='demo'||action==='normal')switchMode(action);
 if(action==='compact'){document.body.classList.toggle('compact');render();}
 if(action==='pet'){const el=$('.scene-pet');el.classList.remove('petted');void el.offsetWidth;el.classList.add('petted');clearTimeout(reactionTimer);reactionTimer=setTimeout(()=>el.classList.remove('petted'),1400);notify(profiles[state.partner].reaction);}
 if(action==='confirm'){
  const id=state.active.id, hatch=state.phase==='hatch_ready';state=confirmReady(state);save();render();
  openModal(`<span class="eyebrow">${hatch?'HELLO, LITTLE ONE':'GROWING TOGETHER'}</span><h2 id="modal-title">${hatch?'만나서 반가워요, ':'다 자랐어요, '}${esc(name(id))}!</h2><div class="celebration ${content[id].color}">${sprite(id,hatch?'baby':'adult')}<span>✧</span><span>✧</span><span>✧</span></div><p>${hatch?content[id].description:content[id].adult}</p><p class="modal-note">${hatch?'아기 모습이 도감에 기록됐어요.':'성장한 모습이 도감에 기록됐어요.'}</p><button class="primary full" data-action="close">정원으로 돌아가기 →</button>`,'celebration');
 }
 if(action==='toggle'){
  if(running){pause('잠시 쉬어가요. 지금까지의 시간은 저장했어요.');return;}
  if(state.daily>=MODES[mode].cap && dayKey()<=state.day){notify('오늘 적립할 수 있는 시간을 모두 채웠어요. 내일 다시 함께해요.');return;}
  if(sessionLimit&&sessionElapsed>=sessionLimit)sessionElapsed=0;
  running=true;lastTick=performance.now();render();
 }
 if(action==='export'){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`lorehatch-${mode}-${dayKey()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 if(action==='import')$('#import-file').click();
 if(action==='reset'){
  if(!confirm(`${mode==='demo'?'체험':'현재 정원'}의 펫과 진행을 모두 지울까요? 되돌리려면 내보낸 파일이 필요해요.`))return;
  try {localStorage.removeItem(keyFor(mode));localStorage.removeItem(keyFor(mode)+'.backup');} catch {notify('저장소에 접근할 수 없어 초기화하지 못했어요.');return;}
  state=initialState(mode);saveBlocked=false;notice='';sessionElapsed=0;closeModal();save();render();notify('새 정원을 준비했어요.');
 }
});
document.addEventListener('submit',e=>{
 if(e.target.id!=='rename-form')return;e.preventDefault();if(!canWrite())return;
 state=renamePet(state,selectedPet,$('#nickname').value);save();$('#modal').close();detail(selectedPet,stagePreview);notify('별명을 저장했어요.');
});
document.addEventListener('change',async e=>{
 if(!lockOwned||(saveBlocked&&e.target.id!=='import-file'))return;
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
document.addEventListener('cancel',e=>{if(e.target.id==='modal')setTimeout(render,0);},true);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)pause('화면을 벗어나 집중을 잠시 멈췄어요.');});
window.addEventListener('pagehide',()=>{running=false;save();});
window.addEventListener('storage',e=>{if(e.key===keyFor(mode)&&!lockOwned){const updated=load(storage,mode);state=updated.state;saveBlocked=!!updated.blocked;notice=updated.warning;render();}});
setInterval(()=>{
 if(!running||!canWrite()||document.hidden)return;
 const now=performance.now(), delta=(now-lastTick)/1000;lastTick=now;
 if(delta>5||delta<0){pause('잠자기 또는 긴 대기를 감지해 집중을 멈췄어요.');return;}
 const seconds=Math.min(delta,sessionLimit?Math.max(0,sessionLimit-sessionElapsed):delta);
 const prev=state.phase;state=earn(state,seconds);sessionElapsed+=seconds;checkpoint+=seconds;
 if(checkpoint>=5||prev!==state.phase){save();checkpoint=0;}
 if(prev!==state.phase){running=false;render();notify('새로운 모습이 기다려요. 준비되면 확인해 주세요.');return;}
 if((sessionLimit&&sessionElapsed>=sessionLimit)||state.daily>=MODES[mode].cap){pause(state.daily>=MODES[mode].cap?'오늘의 적립을 모두 채웠어요.':'집중 시간이 끝났어요. 수고했어요.');return;}
 if($('#session-clock'))$('#session-clock').textContent=time(sessionElapsed);
 if($('#remaining')&&state.active)$('#remaining').textContent=duration(targetSeconds(state)-state.active.progress);
 if($('progress')&&state.active)$('progress').value=state.active.progress/targetSeconds(state)*100;
 if($('#daily'))$('#daily').innerHTML=`${Math.floor(state.daily/60)}<small> / 150분</small>`;
 if($('#daily-bar'))$('#daily-bar').style.width=`${state.daily/MODES[mode].cap*100}%`;
},250);
render();
if(navigator.locks){navigator.locks.request(`lorehatch-${mode}`,{ifAvailable:true},async lock=>{lockResolved=true;lockOwned=!!lock;if(lock){const fresh=load(storage,mode);state=fresh.state;saveBlocked=!!fresh.blocked;notice=fresh.warning;}render();if(lock)await new Promise(()=>{});}).catch(()=>{lockResolved=true;notice='중복 실행을 확인할 수 없어 둘러보기 모드로 열었어요.';render();});}
else {lockResolved=true;notice='이 브라우저에서는 안전한 저장 잠금을 지원하지 않아요. 최신 Chrome 또는 Safari로 열어주세요.';render();}
