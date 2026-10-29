export const IDS = ['D01', 'G01', 'G02'];
export const MODES = Object.freeze({ normal: { hatch: 1500, growth: 4500, cap: 9000 }, demo: { hatch: 15, growth: 30, cap: 9000 } });
export const SAVE_VERSION = 1;
export function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function initialState(mode = 'normal', day = dayKey()) {
  if (!MODES[mode]) throw new Error('잘못된 모드입니다.');
  return { schemaVersion: SAVE_VERSION, mode, phase: 'idle', active: null, pets: [], partner: null, bank: 0, day, daily: 0, total: 0, tutorialClaimed: false, settings: { reducedMotion: false, decoration: 'flowers' } };
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
  if (!IDS.includes(id) || !['idle','complete'].includes(state.phase) || state.pets.some(p => p.id === id)) return state;
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
  s.bank = Math.min(s.bank, 3 * (MODES[s.mode].hatch + MODES[s.mode].growth));
  return applyBank(s);
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
  const cfg = MODES[s.mode];
  if (!['idle','incubating','hatch_ready','raising','growth_ready','complete'].includes(s.phase)) fail();
  if (!Array.isArray(s.pets) || s.pets.length > 3 || new Set(s.pets.map(p=>p?.id)).size !== s.pets.length) fail();
  for (const p of s.pets) if (!p || !IDS.includes(p.id) || !['baby','adult'].includes(p.stage) || typeof p.nickname !== 'string' || p.nickname.length > 20 || !validDate(p.hatchedAt) || (p.stage === 'adult' ? !validDate(p.grownAt) : p.grownAt !== null)) fail();
  if (s.partner !== null && !s.pets.some(p=>p.id===s.partner)) fail();
  if (s.pets.length && s.partner === null) fail();
  if (!number(s.bank,3*(cfg.hatch+cfg.growth)) || !number(s.daily,cfg.cap) || !number(s.total,Number.MAX_SAFE_INTEGER) || s.daily > s.total) fail();
  if (typeof s.day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s.day) || !validDate(`${s.day}T12:00:00Z`) || new Date(`${s.day}T12:00:00Z`).toISOString().slice(0,10)!==s.day || typeof s.tutorialClaimed !== 'boolean') fail();
  if (!s.settings || typeof s.settings.reducedMotion !== 'boolean' || !['flowers','mushrooms','stones'].includes(s.settings.decoration)) fail();
  const activePhase = ['incubating','hatch_ready','raising','growth_ready'].includes(s.phase);
  if (activePhase) {
    if (!s.active || !IDS.includes(s.active.id) || !number(s.active.progress,targetSeconds(s))) fail();
    if (s.phase.endsWith('ready') && s.active.progress !== targetSeconds(s)) fail();
    if (['incubating','raising'].includes(s.phase) && s.active.progress >= targetSeconds(s)) fail();
    const pet = s.pets.find(p=>p.id===s.active.id);
    if (['incubating','hatch_ready'].includes(s.phase) ? !!pet : pet?.stage !== 'baby') fail();
  } else if (s.active !== null) fail();
  if (s.pets.some(p=>p.stage==='baby' && (p.id!==s.active?.id || !['raising','growth_ready'].includes(s.phase)))) fail();
  if (!s.tutorialClaimed && (s.phase !== 'idle' || s.pets.length || s.total || s.bank)) fail();
  if (s.phase==='complete' && (s.pets.length!==3 || s.pets.some(p=>p.stage!=='adult'))) fail();
  if (s.phase==='idle' && s.pets.length===3) fail();
  // Return only known fields; never retain arbitrary imported properties.
  return { schemaVersion: SAVE_VERSION, mode:s.mode, phase:s.phase, active:s.active ? { id:s.active.id, progress:s.active.progress }:null,
    pets:s.pets.map(p=>({id:p.id,stage:p.stage,nickname:p.nickname,hatchedAt:p.hatchedAt,grownAt:p.grownAt})), partner:s.partner,
    bank:s.bank, day:s.day, daily:s.daily, total:s.total, tutorialClaimed:s.tutorialClaimed,
    settings:{ reducedMotion:s.settings.reducedMotion, decoration:s.settings.decoration } };
}
