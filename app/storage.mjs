import { initialState, parseSave } from './domain.mjs';
export const keyFor = mode => `lorehatch.v1.${mode}`;
export function load(storage, mode) {
  const key = keyFor(mode);
  try {
    const raw = storage.getItem(key);
    if (raw !== null) {
      try { return { state: parseSave(raw, mode), warning: '' }; }
      catch { /* Try the last valid backup before opening recovery mode. */ }
    }
    const backup = storage.getItem(`${key}.backup`);
    if (backup !== null) {
      try { return { state: parseSave(backup, mode), warning:'최근 저장이 없거나 손상되어 마지막 정상 백업을 불러왔어요.' }; }
      catch { /* Preserve both originals for manual recovery. */ }
    }
    if (raw === null && backup === null) return { state: initialState(mode), warning: '' };
    return { state: initialState(mode), warning:'저장 데이터를 읽지 못했어요. 원본은 유지했으며, 설정에서 복구 파일을 가져올 수 있어요.', blocked:true };
  } catch { return { state:initialState(mode), warning:'브라우저 저장소에 접근할 수 없어요. 이번 진행은 파일로 내보내 보관하세요.', blocked:true }; }
}
export function persist(storage, state) {
  const raw = JSON.stringify(state); parseSave(raw, state.mode);
  const key = keyFor(state.mode);
  const old = storage.getItem(key);
  let validOld = false;
  if (old !== null) {
    try { parseSave(old,state.mode); validOld = true; }
    catch { /* Invalid primary is never promoted to backup. */ }
  }
  // A failed backup write must stop the replacement of a valid primary.
  if (validOld) storage.setItem(`${key}.backup`,old);
  storage.setItem(key,raw);
}
