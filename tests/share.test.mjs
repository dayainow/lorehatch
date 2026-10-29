import test from 'node:test';
import assert from 'node:assert/strict';
import {publicURL,shareText} from '../app/share.mjs';
test('sharing strips private queries and fragments while preserving project path',()=>{
 const url='https://dayainow.github.io/lorehatch/?mode=demo&nickname=private#secret';
 assert.equal(publicURL(url),'https://dayainow.github.io/lorehatch/');
 assert.ok(!shareText(url).includes('private'));assert.ok(!shareText(url).includes('secret'));
});
