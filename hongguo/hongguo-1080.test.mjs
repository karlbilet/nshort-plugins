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
  assert.equal(manifest.version, '1.3.0');
  assert.ok(manifest.hosts.includes('p3-reading-sign.fqnovelpic.com'));
  assert.ok(manifest.hosts.includes('v3-reading-videocdn302.qznovelvod.com'));
  assert.ok(!manifest.hosts.some(host => host.includes('*')));
});

test('describe lists the three genres without a network request', async () => {
  let calls = 0;
  const context = runtime(async () => { calls += 1; throw new Error('describe must not fetch'); });
  const described = await context.nshort.describe();
  assert.equal(calls, 0);
  const ids = Array.from(described.modules, (row) => String(row.id));
  assert.deepEqual(ids, ['short_play', 'comic_series', 'ai_series']);
});

test('each Rex module reaches its own Hongguo catalog genre and scene', async () => {
  const requests = [];
  const context = runtime(async (url, options) => {
    requests.push({path: new URL(url).pathname, body: JSON.parse(options.body)});
    return {text: async () => JSON.stringify({data: {video_data: []}})};
  });
  for (const module of ['short_play', 'comic_series', 'ai_series']) {
    await context.nshort.catalog({module, page: 1});
  }
  assert.deepEqual(requests.map(row => row.path), Array(3).fill('/reading/distribution/category/landpage/v/'));
  assert.deepEqual(requests.map(row => row.body.select_items.genre), [['short_play'], ['comic_series'], ['ai_series']]);
  assert.deepEqual(requests.map(row => row.body.req_scene), ['default', 'comic_series', 'ai_series']);
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

test('catalog advances page offsets and uses continuation requests for the selected module', async () => {
  const calls = [];
  const context = runtime(async (_url, options) => {
    const body = JSON.parse(options.body);
    calls.push(body);
    return {text: async () => JSON.stringify({data: {
      video_data: [{series_id_str: String(body.offset + 123), series_title: '合成分页剧'}],
      next_offset: body.offset + 18, has_more: true,
    }})};
  });
  const ids = [];
  for (const page of [1, 2, 3]) {
    const result = await context.nshort.catalog({module: 'comic_series', page});
    ids.push(result.items[0].id);
    assert.equal(result.hasMore, true);
  }
  assert.deepEqual(calls.map(row => row.offset), [0, 18, 36]);
  assert.deepEqual(calls.map(row => row.client_req_type), [3, 2, 2]);
  assert.deepEqual(calls.map(row => row.select_items.genre), Array(3).fill(['comic_series']));
  assert.equal(new Set(ids).size, 3);
});

test('catalog rejects invalid page numbers before any source request', async () => {
  let calls = 0;
  const context = runtime(async () => { calls += 1; throw Error('unexpected fetch'); });
  for (const page of [0, -1, 1.5, 10001, 'invalid']) {
    await assert.rejects(() => context.nshort.catalog({page}), /页码无效/);
  }
  assert.equal(calls, 0);
});

function searchPage(query, rows, success = true) {
  return `<script>window._ROUTER_DATA=${JSON.stringify({loaderData: {
    'search_(keyword)/page': {query, isSuccess: success, searchList: rows},
  }})}</script>`;
}

test('search uses name JSON before HTML and keeps only identified drama records', async () => {
  const calls = [];
  const cover = 'https://p3-reading-sign.fqnovelpic.com/search.jpg';
  const context = runtime(async (url, options) => {
    calls.push({url, options});
    return {text: async () => JSON.stringify({suggest_list: [
      null,
      {word_type: 'common_query', keyword: '999', name: '查询词'},
      {word_type: 'short_play_name', name: '合成剧第一季', video_data: {series_id_str: '123', series_title: '合成剧第一季', series_cover: cover, episode_cnt: 81}},
      {word_type: 'short_play_name', video_data: {series_id_str: '123', series_title: '重复'}},
      {word_type: 'short_play_name', keyword: '456', name: '没有剧集身份'},
      {word_type: 'short_play_name', video_data: {series_id: 1e30, series_title: '科学计数编号'}},
    ]})};
  });
  const result = await context.nshort.search({keyword: ' 合成剧 '});
  assert.equal(calls.length, 1);
  const url = new URL(calls[0].url);
  assert.equal(url.pathname, '/incent_resource/suggestion');
  assert.equal(url.searchParams.get('query'), '合成剧');
  assert.equal(url.searchParams.get('app_id'), '8662');
  assert.equal(calls[0].options.headers.Accept, 'application/json');
  assert.deepEqual(Array.from(result.items, row => row.id), ['123']);
  assert.equal(result.items[0].cover, cover);
  assert.equal(result.items[0].episodes, 81);
});

test('search accepts the data-wrapped name response used by the builtin source', async () => {
  const context = runtime(async () => ({text: async () => JSON.stringify({data: {suggest_list: [
    {word_type: 'short_play_name', name: '合成剧', video_data: {series_id_str: '123', series_cover: 'https://p3-reading-sign.fqnovelpic.com/a.jpg'}},
  ]}})}));
  assert.equal((await context.nshort.search({query: '合成剧'})).items[0].id, '123');
});

test('unquoted 64-bit source IDs retain every digit without modifying quoted descriptions', async () => {
  const intro = '正文里的 "series_id": 9999999999999999999，以及转义符 \\"';
  const raw = '{"suggest_list":[{"word_type":"short_play_name","name":"合成剧","video_data":{"series_id":7621200213801176126,"series_title":"合成剧","series_intro":' + JSON.stringify(intro) + ',"episode_cnt":81}}]}';
  const context = runtime(async () => ({text: async () => raw}));
  const result = await context.nshort.search({query: '合成剧'});
  assert.equal(result.items[0].id, '7621200213801176126');
  assert.equal(result.items[0].intro, intro);
  assert.equal(result.items[0].episodes, 81);
});

test('catalog also retains an unquoted 64-bit source ID', async () => {
  const context = runtime(async () => ({text: async () => '{"data":{"video_data":[{"series_id":7621200213801176126,"series_title":"合成目录"}],"has_more":false}}'}));
  assert.equal((await context.nshort.catalog({})).items[0].id, '7621200213801176126');
});

test('failed name lookup falls back to a matching public search page', async () => {
  const calls = [];
  const context = runtime(async url => {
    calls.push(url);
    if (url.includes('/incent_resource/suggestion')) throw Error('name route unavailable');
    return {text: async () => searchPage('合成剧', [
      {video_data: {series_id_str: '123', series_title: '合成剧'}},
      {video_data: {series_id_str: '123', series_title: '重复'}},
      {keyword: '999', name: '非剧集结果'},
    ])};
  });
  const result = await context.nshort.search({keyword: '合成剧'});
  assert.equal(calls.length, 2);
  assert.deepEqual(Array.from(result.items, row => row.id), ['123']);
});

test('search rejects mismatched pages, unavailable routes and malformed data', async () => {
  for (const page of [
    searchPage('其他查询', [{video_data: {series_id_str: '123'}}]),
    searchPage('合成剧', [], false),
    '<script data-sdk-glue-default="pre-handler">/* no result data */</script>',
  ]) {
    const context = runtime(async url => ({text: async () => url.includes('/incent_resource/suggestion') ? '{}' : page}));
    await assert.rejects(() => context.nshort.search({query: '合成剧'}));
  }
});

test('a validated empty result stays empty and blank input never fetches', async () => {
  let calls = 0;
  const context = runtime(async url => {
    calls += 1;
    return {text: async () => url.includes('/incent_resource/suggestion') ? '{"suggest_list":[]}' : searchPage('合成剧', [])};
  });
  assert.equal((await context.nshort.search({query: '   '})).items.length, 0);
  assert.equal(calls, 0);
  assert.equal((await context.nshort.search({query: '合成剧'})).items.length, 0);
  assert.equal(calls, 2);
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


const commentVectors = JSON.parse(readFileSync(new URL('./fixtures/comment-signature.json', import.meta.url), 'utf8')).vectors;
const danmakuPages = JSON.parse(readFileSync(new URL('./fixtures/danmaku-pages.json', import.meta.url), 'utf8')).cases;

test('danmaku fetches the requested episode and preserves bounded timeline metadata', async () => {
  const calls = [];
  const context = runtime(async (url, options) => {
    calls.push({url, options});
    return {text:async()=>JSON.stringify({code:0,data:{data_list:[
      {comment:{comment_id:'one',common:{group_id:'456',status:1,content:{text:'原弹幕'}},expand:{offset_time:30500}}},
    ],extra:{next_query_danmaku_list_time:60000}}})};
  });
  const page = await context.nshort.danmaku({id:'123',episodeId:'456',startMs:30000,durationMs:65000});
  assert.deepEqual(JSON.parse(JSON.stringify(page)), {
    episodeId:'456',startMs:30000,nextMs:60000,items:[{id:'one',text:'原弹幕',timeMs:30500}],
  });
  assert.equal(calls.length,1);
  const request = calls[0];
  assert.equal(new URL(request.url).pathname,'/novel/commentapi/comment/list/456/v1/');
  assert.equal(request.options.method,'POST');
  const body = JSON.parse(request.options.body);
  assert.equal(body.group_id,'456');
  assert.equal(body.comment_type,20);
  assert.equal(body.count,90);
  assert.deepEqual(body.business_param,{book_id:'123',start_offset_time:30000,playlet_item_duration:65000,need_danmaku_guide_type:[1,3,4,2]});
  assert.equal(request.options.headers['X-SS-STUB'],'');
  for (const name of ['X-Argus','X-Gorgon','X-Ladon','X-Khronos']) assert.ok(request.options.headers[name]);
  assert.equal(request.options.headers.Authorization,undefined);
  assert.equal(request.options.headers.Cookie,undefined);
});

test('comment signatures match all builtin synthetic vectors without hashing the body', () => {
  const context = runtime();
  for (const v of commentVectors) {
    const url = new URL(v.url);
    const pairs = url.search.slice(1).split('&').filter(pair=>!pair.includes(';'));
    const aid = new URLSearchParams(pairs.join('&')).get('aid') || '';
    const actual = context.signCommentRequest({query:url.search.slice(1), aid, timestamp:v.unix_seconds,nonce:Uint8Array.from(v.nonce)});
    assert.deepEqual(JSON.parse(JSON.stringify(actual)),v.expected,v.name);
  }
});

test('danmaku matches builtin parser cases including empty, malformed, unicode and episode isolation', async () => {
  for (const v of danmakuPages) {
    const context = runtime(async()=>({text:async()=>JSON.stringify(v.raw)}));
    const args = {id:'700001',episodeId:v.context.episode_id,startMs:v.context.start_ms,durationMs:v.context.duration_ms};
    if (v.expected === null) await assert.rejects(()=>context.nshort.danmaku(args),undefined,v.name);
    else assert.deepEqual(JSON.parse(JSON.stringify(await context.nshort.danmaku(args))),v.expected,v.name);
  }
});

test('danmaku uses cursor window fallback and never hides transport or malformed failures as empty', async () => {
  const context = runtime(async()=>({text:async()=>JSON.stringify({code:0,data:{data_list:[],common_list_info:{cursor:JSON.stringify({start_offset_time:30000,end_offset_time:60000})}}})}));
  assert.equal((await context.nshort.danmaku({id:'123',episodeId:'456',startMs:30000,durationMs:65000})).nextMs,60000);
  for (const fetch of [async()=>{throw Error('network');},async()=>({text:async()=>''}),async()=>({text:async()=>'{}'})]) {
    const failed = runtime(fetch);
    await assert.rejects(()=>failed.nshort.danmaku({id:'123',episodeId:'456',startMs:0,durationMs:65000}));
  }
});
