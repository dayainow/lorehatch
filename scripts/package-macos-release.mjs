import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const { version } = JSON.parse(await readFile('package.json', 'utf8'));
const identity = process.env.MOAMON_SIGN_IDENTITY?.trim();
const profile = process.env.MOAMON_NOTARY_PROFILE?.trim();

function capture(tool, args) {
  return execFileSync(tool, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
}

function run(tool, args) {
  execFileSync(tool, args, { stdio: 'inherit' });
}

function archiveApp(app, destination) {
  run('ditto', ['-c', '-k', '--sequesterRsrc', '--keepParent', app, destination]);
}

async function main() {
  if (process.platform !== 'darwin') throw Error('Run on macOS.');
  if (!identity || !profile) {
    throw Error('Set MOAMON_SIGN_IDENTITY and MOAMON_NOTARY_PROFILE. See docs/32-mac-release.md.');
  }
  const signingIdentities = capture('security', ['find-identity', '-v', '-p', 'codesigning']);
  const candidates = Array.from(signingIdentities.matchAll(/\b([A-F0-9]{40}) "(Developer ID Application: [^"]+)"/g));
  const matches = candidates.filter(([, hash, name]) => hash === identity.toUpperCase() || name === identity);
  if (matches.length !== 1) throw Error('Select one valid Developer ID Application identity from this Mac’s Keychain.');
  const [, signingHash] = matches[0];

  run('xcrun', ['--find', 'notarytool']);
  run('xcrun', ['--find', 'stapler']);
  run(process.execPath, ['scripts/package-macos.mjs']);

  const release = resolve('release');
  const staging = await mkdtemp(join(release, '.mac-release-'));
  try {
    const app = join(staging, 'Moamon.app');
    run('ditto', [resolve('build/desktop/Lorehatch.app'), app]);
    run('codesign', ['--force', '--options', 'runtime', '--timestamp', '--sign', signingHash, app]);
    run('codesign', ['--verify', '--deep', '--strict', '--verbose=2', app]);
    run(join(app, 'Contents/MacOS/Lorehatch'), ['--self-test']);

    const submission = join(staging, 'notary-input.zip');
    archiveApp(app, submission);
    const request = JSON.parse(capture('xcrun', [
      'notarytool', 'submit', submission, '--keychain-profile', profile,
      '--output-format', 'json',
    ]));
    console.log(`Apple notarization submission: ${request.id}`);
    const result = JSON.parse(capture('xcrun', [
      'notarytool', 'wait', request.id, '--keychain-profile', profile,
      '--timeout', '20m', '--output-format', 'json',
    ]));
    console.log(`Notarization ${result.id}: ${result.status}`);
    if (result.status !== 'Accepted') {
      console.error('Inspect with xcrun notarytool log <submission-id> --keychain-profile <profile>.');
      throw Error('Apple did not accept notarization. No release ZIP was produced by this run.');
    }

    run('xcrun', ['stapler', 'staple', app]);
    const name = `Moamon-${version}-macOS-universal.zip`;
    const zip = join(staging, name);
    archiveApp(app, zip);
    run('unzip', ['-tq', zip]);
    const verificationDir = join(staging, 'verify');
    run('ditto', ['-x', '-k', zip, verificationDir]);
    const unpacked = join(verificationDir, 'Moamon.app');
    run('codesign', ['--verify', '--deep', '--strict', unpacked]);
    run('xcrun', ['stapler', 'validate', unpacked]);
    if (Number(capture('sw_vers', ['-productVersion']).split('.')[0]) >= 14) {
      run('syspolicy_check', ['distribution', unpacked]);
    } else {
      run('spctl', ['--assess', '--type', 'execute', '--verbose=4', unpacked]);
    }

    const checksum = createHash('sha256').update(await readFile(zip)).digest('hex');
    await writeFile(`${zip}.sha256`, `${checksum}  ${name}\n`);
    await rename(zip, join(release, name));
    await rename(`${zip}.sha256`, join(release, `${name}.sha256`));
    console.log(`Verified release ZIP: ${join(release, name)}`);
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}

try {
  await main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
