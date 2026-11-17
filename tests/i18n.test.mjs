import test from 'node:test';
import assert from 'node:assert/strict';
import {translateText as t,setLocale,resolveLocale} from '../app/i18n.mjs';
import {content,profiles} from '../app/content.mjs';
import {fieldnotes,pairs,habitatLore} from '../app/fieldnotes.mjs';
import {encounters,milestones} from '../app/journal.mjs';
import {initialState,parseSave,selectEgg,confirmReady} from '../app/domain.mjs';
function strings(value){return typeof value==='string'?[value]:value&&typeof value==='object'?Object.values(value).flatMap(strings):[];}
test('English covers all 30 species, care, encounters, relationships and milestones',()=>{
 for(const source of strings({content,profiles,fieldnotes,pairs,habitatLore,encounters,milestones:milestones(initialState())})){
  assert.doesNotMatch(t(source,'en'),/[가-힣]/,source);
 }
});
test('language switching preserves progress and user-authored Korean names',()=>{
 const s=confirmReady(selectEgg(initialState(),'G02'));s.pets[0].nickname='물방울';
 const before=JSON.stringify(s);setLocale('en');
 assert.equal(t('\uE000물방울\uE001의 작은 부탁'),'A little request from 물방울');
 assert.equal(t('모아몬'),'Moamon');setLocale('ko');
 assert.equal(t('MY LITTLE COMPANION'),'나의 작은 친구');
 assert.equal(JSON.stringify(parseSave(before)),before);assert.equal(JSON.stringify(s),before);
});
test('locale fallback, counters, dynamic stories and source labels are localized',()=>{
 assert.equal(resolveLocale('ko-KR'),'ko');assert.equal(resolveLocale('fr-FR'),'en');
 assert.equal(t('새봄의 진화 모습을 만나보세요.','en'),'Saebom is ready to evolve.');
 assert.equal(t('부화 진행','en'),'Hatching progress');
 assert.equal(t('5분 30초','en'),'5m 30s');
 assert.equal(t('성장한 친구 돌보기','en'),'Care for your grown friend');
 assert.equal(t('constructor','en'),'constructor');
});
