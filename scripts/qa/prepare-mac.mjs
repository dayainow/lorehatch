// Creates an isolated, disposable GUI fixture. Never reads or writes the user's saves.
import {mkdir,mkdtemp,writeFile,cp} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {IDS,initialState,selectEgg,confirmReady,earn,parseSave} from '../../app/domain.mjs';
const id=process.argv[2]??'C01', index=IDS.indexOf(id);
if(index<18)throw Error('Choose an expansion species ID: C01–C06 or F01–F06');
await mkdir('build/qa',{recursive:true});
const root=await mkdtemp(resolve('build/qa/run-')),folder=root+'/data',app=root+'/MoamonQA.app';
await mkdir(folder,{recursive:true});
let s=initialState('normal');
function advance(seconds){for(let i=0;i<seconds;i+=5){if(s.daily===9000){const d=new Date(s.day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+1);s.day=d.toISOString().slice(0,10);s.daily=0;}s=earn(s,Math.min(5,seconds-i),s.day);}}
for(const id of IDS.slice(0,index)){
 s=selectEgg(s,id);if(s.phase==='incubating')advance(300);s=confirmReady(s);advance(900);s=confirmReady(s);
}
s=selectEgg(s,id);advance(300);s.bank=900;
s=parseSave(JSON.stringify(s));
await writeFile(folder+'/saves.json',JSON.stringify({'lorehatch.v1.normal':JSON.stringify(s)}));
await cp('build/desktop/Lorehatch.app',app,{recursive:true});
const plist=app+'/Contents/Info.plist';
execFileSync('/usr/libexec/PlistBuddy',['-c','Set :CFBundleIdentifier app.dayainow.moamon.qa',plist]);
execFileSync('/usr/libexec/PlistBuddy',['-c','Set :CFBundleDisplayName Moamon QA',plist]);
execFileSync('/usr/libexec/PlistBuddy',['-c','Add :LSEnvironment dict',plist]);
execFileSync('/usr/libexec/PlistBuddy',['-c',`Add :LSEnvironment:LOREHATCH_DATA_DIR string ${folder}`,plist]);
execFileSync('codesign',['--force','--deep','--sign','-',app]);
console.log(`Isolated QA app: ${app}\nFixture: ${index} grown friends; ${id} hatch ready, with growth bank.`);
