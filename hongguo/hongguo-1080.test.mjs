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
  assert.equal(manifest.version, '1.1.0');
  assert.ok(manifest.hosts.includes('p3-reading-sign.fqnovelpic.com'));
  assert.ok(manifest.hosts.includes('v3-reading-videocdn302.qznovelvod.com'));
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

test('detail keeps the source poster alongside the requested episode list', async () => {
  const cover = 'https://p3-reading-sign.fqnovelpic.com/poster.jpg';
  const context = runtime(async()=>({text:async()=>JSON.stringify({data:{video_data:{
    series_id_str:'123',series_title:'合成剧',series_cover:cover,episode_cnt:1,
    video_list:[{vid:'456',vid_index:1,series_id:'123'}],
  }}})}));
  const result = await context.nshort.detail({id:'123'});
  assert.equal(result.drama.cover,cover);
  assert.equal(result.chapters[0].id,'456');
});

function publicPage({series = '123', episode = '456', urlEpisode = episode, index = 1, limit = 3} = {}) {
  return `<script>window._ROUTER_DATA=${JSON.stringify({loaderData:{'player_x/page':{
    series_id: series, vid: episode, publicVideoSeo:{width:360,height:640},
    seriesDetail:{accessible_episode_cnt:limit,vid_list:index === 1 ? [episode] : ['111',episode]},
  }}})}</script><script type="application/ld+json">${JSON.stringify({
    '@type':'VideoObject',contentUrl:`https://hongguoduanju.com/video/public/${urlEpisode}/360p.mp4`,
  })}</script>`;
}

test('invalid App keys fall back to this episode public VideoObject', async () => {
  const calls = [];
  const context = runtime(async (url) => {
    calls.push(url);
    return {text:async()=>url.includes('/novel/player/') ? JSON.stringify({data:{video_model:{video_list:[
      {definition:'1080p',spade_a:'synthetic',main_url:'https://toutiaovod.com/encrypted.mp4'},
    ]}}}) : publicPage()};
  });
  const result = await context.nshort.play({id:'123',episode:{id:'456'}});
  assert.equal(result.url, 'https://hongguoduanju.com/video/public/456/360p.mp4');
  assert.equal(result.quality, 360);
  assert.ok(calls[0].includes('/multi_video_model/v1/'));
  assert.equal(calls.length, 3);
});

test('empty App response still tries the public page', async () => {
  const context = runtime(async url => ({text:async()=>url.includes('/novel/player/') ? '' : publicPage()}));
  assert.equal((await context.nshort.play({id:'123',episode:{id:'456'}})).quality,360);
});

test('web fallback rejects different episodes and previews outside the free range', async () => {
  for (const page of [publicPage({urlEpisode:'789'}),publicPage({episode:'789'}),publicPage({index:2,limit:1})]) {
    const context = runtime(async url=>({text:async()=>url.includes('/novel/player/') ? '{}' : page}));
    await assert.rejects(()=>context.nshort.play({id:'123',episode:{id:'456'}}));
  }
});

// Shared builtin Go/Swift synthetic ContentKey vector; no source credentials.
const spade = 'mL8T+Vu+EvdZvhL1X7kR90G6DvVfpSbcXaUm3luiJdyloHFgdnE=';
const expectedKey = '00112233445566778899aabbccddeeff';
const cdn = 'v3-reading-videocdn302.qznovelvod.com';
const highURL = `https://${cdn}/high.mp4?token=synthetic%2Fvalue`;

test('1080p encrypted App candidate beats plain 720 and preserves its key', async () => {
  const calls = [];
  const context = runtime(async (url, options) => {
    calls.push({url, options});
    return {text: async () => JSON.stringify({data: {'456': {video_model: {video_list:[
      {main_url:'https://toutiaovod.com/low.mp4',codec_type:'h264',definition:'720p'},
      {main_url:Buffer.from(highURL).toString('base64'),backup_url:`https://${cdn}/backup.mp4`,
        video_meta:{codec_type:'h264',vwidth:1080,vheight:1920,definition:'1080p'},encrypt_info:{encrypt:true,spade_a:spade}},
      {main_url:`https://${cdn}/unsupported.mp4`,codec_type:'bytevc2',definition:'2160p',spade_a:spade},
    ]}}}})};
  });
  const result = await context.nshort.play({id:'123',episode:{id:'456'}});
  assert.equal(result.quality,1080);
  assert.equal(result.url,highURL);
  assert.equal(result.cencKey,expectedKey);
  assert.equal(result.variants[0].url,`https://${cdn}/backup.mp4`);
  assert.equal(result.variants[0].cencKey,expectedKey);
  assert.equal(result.variants.at(-1).quality,720);
  assert.equal(result.variants.at(-1).cencKey,undefined);
  assert.equal(calls.length,1);
  assert.ok(calls[0].url.includes('/multi_video_model/v1/'));
  const payload = JSON.parse(calls[0].options.body);
  assert.equal(payload.biz_param.video_platform,1024);
  assert.equal(payload.biz_param.need_all_video_definition,true);
  assert.deepEqual(payload.mixed_video_id_map,{'1004':['456']});
  assert.equal(payload.dr_scene,undefined);
});

test('raw unpadded content keys decode consistently and invalid keys skip the candidate', async () => {
  for (const valid of [spade,spade.replace(/=+$/,'')]) {
    const context = runtime(async()=>({text:async()=>JSON.stringify({data:{video_model:{video_list:[
      {main_url:highURL,codec_type:'h264',definition:'1080p',spade_a:valid},
    ]}}})}));
    assert.equal((await context.nshort.play({id:'123',episode:{id:'456'}})).cencKey,expectedKey);
  }
  for (const invalid of ['','AA==','!!!!','mr8T+Vu+EvdZvhL1X7kR90G6DvVfpSbcXaUm3luiJdyloGR1dVpzNw==']) {
    const context = runtime(async()=>({text:async()=>JSON.stringify({data:{video_model:{video_list:[
      {main_url:highURL,codec_type:'h264',definition:'1080p',encrypt:true,spade_a:invalid},
      {main_url:'https://toutiaovod.com/low.mp4',codec_type:'h264',definition:'720p',encrypt:'0'},
    ]}}})}));
    const result = await context.nshort.play({id:'123',episode:{id:'456'}});
    assert.equal(result.quality,720);
    assert.equal(result.cencKey,undefined);
  }
});

test('undeclared CDN and wrong episode models cannot hijack playback', async () => {
  const context = runtime(async url=>({text:async()=>url.includes('/novel/player/') ? JSON.stringify({data:{'789':{video_model:{video_list:[
    {main_url:highURL,codec_type:'h264',definition:'1080p',spade_a:spade},
  ]}}}}) : publicPage()}));
  assert.equal((await context.nshort.play({id:'123',episode:{id:'456'}})).quality,360);
  const safe = runtime(async()=>({text:async()=>JSON.stringify({data:{video_model:{video_list:[
    {main_url:'https://unlisted.qznovelvod.com/high.mp4',codec_type:'h264',definition:'1080p',spade_a:spade},
    {main_url:'https://toutiaovod.com/low.mp4',codec_type:'h264',definition:'720p'},
  ]}}})}));
  assert.equal((await safe.nshort.play({id:'123',episode:{id:'456'}})).quality,720);
});

test('clear App candidate remains first and does not request the web page', async () => {
  let requests=0;
  const context = runtime(async ()=>{requests++;return {text:async()=>JSON.stringify({data:{video_model:{video_list:[
    {definition:'1080p',codec_type:'h264',main_url:'https://toutiaovod.com/clear.mp4'},
  ]}}})};});
  assert.equal((await context.nshort.play({id:'123',episode:{id:'456'}})).quality,1080);
  assert.equal(requests,1);
});
