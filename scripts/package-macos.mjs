import {cp,mkdir,rm,writeFile,readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
if(process.platform!=='darwin')throw Error('macOS packaging requires a Mac with Xcode command line tools.');
const {version}=JSON.parse(await readFile('package.json','utf8'));
const run=(bin,args)=>execFileSync(bin,args,{stdio:'inherit'});
run(process.execPath,['scripts/build.mjs']);
await mkdir('release',{recursive:true});await rm('build/desktop',{recursive:true,force:true});await mkdir('build/desktop',{recursive:true});
const app=resolve('build/desktop/Lorehatch.app'),contents=app+'/Contents';
for(const dir of ['MacOS','Resources'])await mkdir(`${contents}/${dir}`,{recursive:true});
const sdk=execFileSync('xcrun',['--sdk','macosx','--show-sdk-path'],{encoding:'utf8'}).trim();
for(const arch of ['arm64','x86_64'])run('xcrun',['swiftc','-swift-version','5','-O','-sdk',sdk,'-target',`${arch}-apple-macos13.0`,'-module-cache-path','build/swift-cache','desktop/Store.swift','desktop/Companion.swift','desktop/main.swift','-o',`build/desktop/Lorehatch-${arch}`,'-framework','Cocoa','-framework','WebKit','-framework','Network']);
run('lipo',['-create','build/desktop/Lorehatch-arm64','build/desktop/Lorehatch-x86_64','-output',`${contents}/MacOS/Lorehatch`]);
await cp('dist',`${contents}/Resources/site`,{recursive:true});
const iconset='build/desktop/AppIcon.iconset';await mkdir(iconset);
for(const size of [16,32,128,256,512])for(const scale of [1,2]){
 const target=`${iconset}/icon_${size}x${size}${scale===2?'@2x':''}.png`;
 // Normalize generated PNG encoding for Apple's iconutil.
 execFileSync('sips',['-s','format','png',`assets/icons/icon-${size*scale}.png`,'--out',target],{stdio:'pipe'});
}
run('iconutil',['-c','icns',iconset,'-o',`${contents}/Resources/AppIcon.icns`]);
await writeFile(`${contents}/Info.plist`,`<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict><key>CFBundleExecutable</key><string>Lorehatch</string><key>CFBundleIdentifier</key><string>app.dayainow.lorehatch</string><key>CFBundleName</key><string>Lorehatch</string><key>CFBundleDisplayName</key><string>모아몬</string><key>CFBundleShortVersionString</key><string>${version}</string><key>CFBundleVersion</key><string>${version}</string><key>CFBundlePackageType</key><string>APPL</string><key>CFBundleIconFile</key><string>AppIcon</string><key>LSMinimumSystemVersion</key><string>13.0</string><key>NSHighResolutionCapable</key><true/><key>NSAppTransportSecurity</key><dict><key>NSAllowsLocalNetworking</key><true/></dict></dict></plist>`);
run('codesign',['--force','--deep','--sign','-',app]);run('codesign',['--verify','--deep','--strict',app]);
run(`${contents}/MacOS/Lorehatch`,['--self-test']);
const archive=`release/Lorehatch-${version}-macOS-universal.zip`;await rm(archive,{force:true});run('ditto',['-c','-k','--sequesterRsrc','--keepParent',app,archive]);
const checksum=createHash('sha256').update(await readFile(archive)).digest('hex');await writeFile('release/SHA256SUMS.txt',`${checksum}  Lorehatch-${version}-macOS-universal.zip\n`);
console.log(`Packaged: ${archive}\nAd-hoc signed only; no Developer ID signature or notarization.`);
