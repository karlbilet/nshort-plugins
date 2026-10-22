import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

for (const [file, source] of [['huangguo-video.js','huangguo-video'],['huangguo-ai.js','huangguoai']]) {
  const path = fileURLToPath(new URL(file, import.meta.url));
  const text = existsSync(path) ? readFileSync(path,'utf8') : '';
  function load() {
    const context = vm.createContext({ fetch:()=>{ throw new Error('builtin plugin must not fetch'); } });
    vm.runInContext(text,context,{timeout:1000});
    assert.ok(context.nshort, `${file} must expose the NGuo plugin contract`);
    return context.nshort;
  }
  const plain = value => JSON.parse(JSON.stringify(value));
  test(`${file} has a fixed source binding and no network grant`, () => {
    assert.ok(text.startsWith('// @nshort '),'plugin bundle missing');
    const manifest = JSON.parse(text.split('\n')[0].slice(11));
    assert.equal(manifest.builtinSource,source);
    assert.deepEqual(manifest.hosts,[]);
    assert.equal(manifest.version,'1.0.0');
    for (const method of ['describe','catalog','search','detail','play','danmaku','seriesSeasons']) assert.equal(typeof load()[method],'function');
  });
  test(`${file} forwards only supported requests and prefers 1080p`, async () => {
    const p=load();
    const described = plain(await p.describe());
    assert.ok(described.modules.some((row) => row.id === 'all'));
    assert.deepEqual(plain(await p.catalog({page:1,module:'all'})),{builtin:{action:'catalog',page:1,category:''}});
    if (source === 'huangguoai') {
      assert.deepEqual(plain(await p.catalog({page:1,module:'ai-duanju'})),{builtin:{action:'catalog',page:1,category:'ai-duanju'}});
    }
    await assert.rejects(async()=>p.catalog({page:1,module:'../cn'}));
    assert.deepEqual(plain(await p.catalog({page:2,category:'',url:'https://arbitrary.test/'})),{builtin:{action:'catalog',page:2,category:''}});
    assert.deepEqual(plain(await p.search({query:'  高三爱情故事  '})),{builtin:{action:'search',query:'高三爱情故事'}});
    assert.deepEqual(plain(await p.detail({id:'sample'})),{builtin:{action:'detail',id:'sample'}});
    assert.deepEqual(plain(await p.play({id:'sample',episode:{id:'episode-2',currentEpisode:2},headers:{Authorization:'ignored'}})),{builtin:{action:'play',id:'sample',episodeId:'episode-2',quality:1080}});
    assert.equal((await p.play({id:'sample',episodeId:'episode-2',quality:720})).builtin.quality,720);
    assert.deepEqual(plain(await p.seriesSeasons()),{items:[]});
  });
  test(`${file} rejects missing identity and invalid user requests`, async () => {
    const p=load();
    await assert.rejects(async()=>p.detail({id:''}));
    await assert.rejects(async()=>p.play({id:'sample'}));
    await assert.rejects(async()=>p.catalog({page:-1}));
    await assert.rejects(async()=>p.search({query:''}));
  });
}
