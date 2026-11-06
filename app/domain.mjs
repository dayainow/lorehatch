import {newSpecies} from './new-species.mjs';
export const habitatNames=['세샘숲','갈대늪','별빛고개','조개해변','꽃바람들판'];
export const IDS = ['D01', 'G01', 'G02', 'D02', 'N01', 'E01', ...newSpecies.map(row=>row[0])];
export const habitatOf=id=>Math.floor(IDS.indexOf(id)/6);
export const openHabitat=s=>Math.min(habitatNames.length-1,Math.floor(s.pets.filter(p=>p.stage==='adult').length/6));
export const MODES = Object.freeze({ normal: { hatch: 300, growth: 900, cap: 9000 }, demo: { hatch: 15, growth: 30, cap: 9000 } });
export const SAVE_VERSION = 1;
export function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function initialState(mode = 'normal', day = dayKey()) {
  if (!MODES[mode]) throw new Error('잘못된 모드입니다.');
  return { schemaVersion: SAVE_VERSION, balanceVersion: 1, mode, phase: 'idle', active: null, pets: [], partner: null, bank: 0, day, daily: 0, total: 0, tutorialClaimed: false, settings: { reducedMotion: false, decoration: 'flowers' } };
}
export function targetSeconds(s) { return ['incubating','hatch_ready'].includes(s.phase) ? MODES[s.mode].hatch : MODES[s.mode].growth; }
function applyBank(s) {
  if (!['incubating', 'raising'].includes(s.phase)) return s;
  const take = Math.min(s.bank, targetSeconds(s) - s.active.progress);
  s.active.progress += take; s.bank -= take;
  if (s.active.progress >= targetSeconds(s)) s.phase = s.phase === 'incubating' ? 'hatch_ready' : 'growth_ready';
  return s;
}
export function selectEgg(state, id) {
  if (!IDS.includes(id) || habitatOf(id)>openHabitat(state) || !['idle','complete'].includes(state.phase) || state.pets.some(p => p.id === id)) return state;
  const s = structuredClone(state);
  s.active = { id, progress: 0 };
  s.phase = s.tutorialClaimed ? 'incubating' : 'hatch_ready';
  if (!s.tutorialClaimed) { s.active.progress = MODES[s.mode].hatch; s.tutorialClaimed = true; }
  return applyBank(s);
}
export function confirmReady(state, now = new Date().toISOString()) {
  if (!['hatch_ready','growth_ready'].includes(state.phase)) return state;
  const s = structuredClone(state);
  if (s.phase === 'hatch_ready') {
    s.pets.push({ id: s.active.id, stage: 'baby', nickname: '', hatchedAt: now, grownAt: null });
    s.partner ??= s.active.id;
    s.active.progress = 0; s.phase = 'raising';
  } else {
    const p = s.pets.find(p => p.id === s.active.id);
    p.stage = 'adult'; p.grownAt = now;
    s.active = null; s.phase = s.pets.length === IDS.length ? 'complete' : 'idle';
  }
  return applyBank(s);
}
export function earn(state, seconds, day = dayKey()) {
  if (!Number.isFinite(seconds) || seconds <= 0 || seconds > 5) return state;
  const s = structuredClone(state);
  // Dates may advance once; rolling a clock/timezone backwards never reopens a bucket.
  if (day > s.day) { s.day = day; s.daily = 0; }
  const credit = Math.max(0, Math.min(seconds, MODES[s.mode].cap - s.daily));
  s.daily += credit; s.total += credit; s.bank += credit;
  // The bank never grows beyond the remaining content budget.
  s.bank = Math.min(s.bank, (s.mode==='normal'?18000:135));
  return applyBank(s);
}
export function recordCare(state,id){
  const pet=state.pets.find(p=>p.id===id);
  if(!pet||pet.care?.includes(pet.stage))return state;
  return {...state,pets:state.pets.map(p=>p.id===id?{...p,care:[...(p.care??[]),p.stage]}:p)};
}
export function setPartner(state, id) {
  if (!state.pets.some(p => p.id === id)) return state;
  return { ...state, partner: id };
}
export function renamePet(state, id, name) {
  if (typeof name !== 'string') return state;
  return { ...state, pets: state.pets.map(p => p.id === id ? { ...p, nickname: name.trim().slice(0,20) } : p) };
}
const number = (n, max) => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= max;
const validDate = d => typeof d === 'string' && d.length <= 32 && Number.isFinite(Date.parse(d));
export function parseSave(text, expectedMode) {
  if (typeof text !== 'string' || text.length > 100000) throw new Error('저장 파일이 너무 큽니다.');
  let s; try { s = JSON.parse(text); } catch { throw new Error('JSON 저장 파일을 읽을 수 없습니다.'); }
  const fail = () => { throw new Error('지원하지 않거나 손상된 저장 파일입니다.'); };
  if (!s || s.schemaVersion !== SAVE_VERSION || !Object.hasOwn(MODES,s.mode) || (expectedMode && s.mode !== expectedMode)) fail();
  if(s.balanceVersion!==undefined&&s.balanceVersion!==1)fail();
  const legacy=s.mode==='normal'&&s.balanceVersion===undefined;
  const cfg = legacy?{hatch:1500,growth:4500,cap:9000}:MODES[s.mode];
  const validationTarget=['incubating','hatch_ready'].includes(s.phase)?cfg.hatch:cfg.growth;
  if(s.activity!==undefined&&(!s.activity||typeof s.activity.enabled!=='boolean'||!Number.isSafeInteger(s.activity.lastBucket)||s.activity.lastBucket<0||!Number.isSafeInteger(s.activity.since)||s.activity.since<0))fail();
  if (!['idle','incubating','hatch_ready','raising','growth_ready','complete'].includes(s.phase)) fail();
  if (!Array.isArray(s.pets) || s.pets.length > IDS.length || new Set(s.pets.map(p=>p?.id)).size !== s.pets.length) fail();
  for (const p of s.pets) if (!p || !IDS.includes(p.id) || !['baby','adult'].includes(p.stage) || typeof p.nickname !== 'string' || p.nickname.length > 20 || !validDate(p.hatchedAt) || (p.stage === 'adult' ? !validDate(p.grownAt) : p.grownAt !== null)) fail();
  if(s.memories!==undefined&&(!Array.isArray(s.memories)||s.memories.length>IDS.length||new Set(s.memories).size!==s.memories.length||s.memories.some(id=>!s.pets.some(p=>p.id===id))))fail();
  for(const p of s.pets)if(p.care!==undefined&&(!Array.isArray(p.care)||p.care.length>2||new Set(p.care).size!==p.care.length||p.care.some(stage=>stage!=='baby'&&(stage!=='adult'||p.stage!=='adult'))))fail();
  if (s.partner !== null && !s.pets.some(p=>p.id===s.partner)) fail();
  if (s.pets.length && s.partner === null) fail();
  if (!number(s.bank,s.mode==='normal'?18000:135) || !number(s.daily,cfg.cap) || !number(s.total,Number.MAX_SAFE_INTEGER) || s.daily > s.total) fail();
  if (typeof s.day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s.day) || !validDate(`${s.day}T12:00:00Z`) || new Date(`${s.day}T12:00:00Z`).toISOString().slice(0,10)!==s.day || typeof s.tutorialClaimed !== 'boolean') fail();
  if (!s.settings || typeof s.settings.reducedMotion !== 'boolean' || !['flowers','mushrooms','stones'].includes(s.settings.decoration)) fail();
  const activePhase = ['incubating','hatch_ready','raising','growth_ready'].includes(s.phase);
  if (activePhase) {
    if (!s.active || !IDS.includes(s.active.id) || !number(s.active.progress,validationTarget)) fail();
    if (s.phase.endsWith('ready') && s.active.progress !== validationTarget) fail();
    if (['incubating','raising'].includes(s.phase) && s.active.progress >= validationTarget) fail();
    const pet = s.pets.find(p=>p.id===s.active.id);
    if (['incubating','hatch_ready'].includes(s.phase) ? !!pet : pet?.stage !== 'baby') fail();
  } else if (s.active !== null) fail();
  if (s.pets.some(p=>p.stage==='baby' && (p.id!==s.active?.id || !['raising','growth_ready'].includes(s.phase)))) fail();
  if (!s.tutorialClaimed && (s.phase !== 'idle' || s.pets.length || s.total || s.bank)) fail();
  // Reopen a completed original garden when the new egg becomes available.
  if (s.phase==='complete' && [3,4,6,18].includes(s.pets.length) && IDS.slice(0,s.pets.length).every(id=>s.pets.some(p=>p.id===id && p.stage==='adult'))) s.phase='idle';
  if (s.phase==='complete' && (s.pets.length!==IDS.length || s.pets.some(p=>p.stage!=='adult'))) fail();
  if (s.phase==='idle' && s.pets.length===IDS.length) fail();
  if(legacy&&activePhase){
    const target=targetSeconds(s);
    if(s.active.progress>=target){s.bank=Math.min(18000,s.bank+s.active.progress-target);s.active.progress=target;s.phase=['incubating','hatch_ready'].includes(s.phase)?'hatch_ready':'growth_ready';}
  }
  // Return only known fields; never retain arbitrary imported properties.
  return { schemaVersion: SAVE_VERSION, balanceVersion:1, mode:s.mode, phase:s.phase, active:s.active ? { id:s.active.id, progress:s.active.progress }:null,
    pets:s.pets.map(p=>({id:p.id,stage:p.stage,nickname:p.nickname,hatchedAt:p.hatchedAt,grownAt:p.grownAt,...(p.care?{care:[...p.care]}:{})})), partner:s.partner,
    bank:s.bank, day:s.day, daily:s.daily, total:s.total, tutorialClaimed:s.tutorialClaimed,
    ...(s.activity?{activity:{enabled:s.activity.enabled,lastBucket:s.activity.lastBucket,since:s.activity.since}}:{}),
    ...(s.memories?{memories:[...s.memories]}:{}),
    settings:{ reducedMotion:s.settings.reducedMotion, decoration:s.settings.decoration } };
}

// Split short active ticks at local midnight; neither side can reopen a past bucket.
export function earnInterval(state, seconds, wallStart) {
  if(!Number.isFinite(wallStart)||!Number.isFinite(seconds)||seconds<=0||seconds>5)return state;
  const start=new Date(wallStart),end=new Date(wallStart+seconds*1000);
  if(dayKey(start)===dayKey(end))return earn(state,seconds,dayKey(start));
  const boundary=new Date(start.getFullYear(),start.getMonth(),start.getDate()+1).getTime();
  const before=Math.max(0,Math.min(seconds,(boundary-wallStart)/1000));
  return earn(earn(state,before,dayKey(start)),seconds-before,dayKey(end));
}
