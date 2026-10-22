import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const script = readFileSync(new URL('./hongguo-1080.js', import.meta.url), 'utf8');
const manifest = JSON.parse(script.split('\n')[0].replace('// @nshort ', ''));

function runtime(fetch) {
  const context = vm.createContext({fetch});
  vm.runInContext(script, context);
  return context;
}

test('manifest declares the actual poster host without wildcard permissions', () => {
  assert.equal(manifest.version, '1.0.1');
  assert.ok(manifest.hosts.includes('p3-reading-sign.fqnovelpic.com'));
  assert.ok(!manifest.hosts.some(host => host.includes('*')));
});

test('catalog preserves the source poster URL', async () => {
  const cover = 'https://p3-reading-sign.fqnovelpic.com/poster.jpg';
  const context = vm.createContext({fetch: async () => ({text: async () => JSON.stringify({
    data: {video_data: [{series_id_str: '123', series_title: '合成剧', series_cover: cover, episode_cnt: 12}]},
  })})});
  vm.runInContext(script, context);
  const result = await context.nshort.catalog({});
  assert.equal(result.items[0].cover, cover);
  assert.equal(result.items[0].id, '123');
});

function publicPage({series = '123', episode = '456', urlEpisode = episode, index = 1, limit = 3} = {}) {
  return `<script>window._ROUTER_DATA=${JSON.stringify({loaderData:{'player_x/page':{
    series_id: series, vid: episode, publicVideoSeo:{width:360,height:640},
    seriesDetail:{accessible_episode_cnt:limit,vid_list:index === 1 ? [episode] : ['111',episode]},
  }}})}</script><script type="application/ld+json">${JSON.stringify({
    '@type':'VideoObject',contentUrl:`https://hongguoduanju.com/video/public/${urlEpisode}/360p.mp4`,
  })}</script>`;
}

test('App-only encrypted streams fall back to this episode public VideoObject', async () => {
  const calls = [];
  const context = runtime(async (url) => {
    calls.push(url);
    return {text:async()=>url.includes('/video_model/') ? JSON.stringify({data:{video_model:{video_list:[
      {definition:'1080p',spade_a:'synthetic',main_url:'https://toutiaovod.com/encrypted.mp4'},
    ]}}}) : publicPage()};
  });
  const result = await context.nshort.play({id:'123',episode:{id:'456'}});
  assert.equal(result.url, 'https://hongguoduanju.com/video/public/456/360p.mp4');
  assert.equal(result.quality, 360);
  assert.ok(calls[0].includes('/video_model/'));
  assert.equal(calls.length, 2);
});

test('empty App response still tries the public page', async () => {
  const context = runtime(async url => ({text:async()=>url.includes('/video_model/') ? '' : publicPage()}));
  assert.equal((await context.nshort.play({id:'123',episode:{id:'456'}})).quality,360);
});

test('web fallback rejects different episodes and previews outside the free range', async () => {
  for (const page of [publicPage({urlEpisode:'789'}),publicPage({episode:'789'}),publicPage({index:2,limit:1})]) {
    const context = runtime(async url=>({text:async()=>url.includes('/video_model/') ? '{}' : page}));
    await assert.rejects(()=>context.nshort.play({id:'123',episode:{id:'456'}}));
  }
});

test('clear App candidate remains first and does not request the web page', async () => {
  let requests=0;
  const context = runtime(async ()=>{requests++;return {text:async()=>JSON.stringify({data:{video_model:{video_list:[
    {definition:'1080p',codec_type:'h264',main_url:'https://toutiaovod.com/clear.mp4'},
  ]}}})};});
  assert.equal((await context.nshort.play({id:'123',episode:{id:'456'}})).quality,1080);
  assert.equal(requests,1);
});
