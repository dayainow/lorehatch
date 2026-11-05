import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

// itch.io expects index.html at the archive root, not inside a dist folder.
execFileSync(process.execPath, ['scripts/build.mjs'], { stdio: 'inherit' });
const { version } = JSON.parse(await readFile('package.json', 'utf8'));
await mkdir('release', { recursive: true });
const name = `Lorehatch-${version}-web.zip`;
const archive = resolve('release', name);
await rm(archive, { force: true });
execFileSync('zip', ['-qr', archive, '.'], { cwd: 'dist', stdio: 'inherit' });
const entries = execFileSync('unzip', ['-Z1', archive], { encoding: 'utf8' }).split('\n');
for (const required of ['index.html', 'app/main.mjs', 'service-worker.js', 'manifest.webmanifest']) {
  if (!entries.includes(required)) throw Error(`Archive missing ${required}`);
}
execFileSync('unzip', ['-tq', archive], { stdio: 'inherit' });
const hash = createHash('sha256').update(await readFile(archive)).digest('hex');
await writeFile(`${archive}.sha256`, `${hash}  ${name}\n`);
console.log(`Ready for local review: ${archive}\nNo upload or publication performed.`);
