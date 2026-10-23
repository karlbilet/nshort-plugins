// @nshort {"id":"haokan","name":"好看免费短剧","version":"1.0.1","hosts":["sv.baidu.com","*.bdstatic.com","*.bdurl.net"]}
/*! 好看免费短剧 — ported from the Rex module of the same source. */
(function () {
  // ---- Rex Widget compatibility layer ----
  var __cache = {};
  var __b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  function __b64(text) {
    var s = unescape(encodeURIComponent(String(text))), out = '';
    for (var i = 0; i < s.length; i += 3) {
      var a = s.charCodeAt(i), b = s.charCodeAt(i + 1), c = s.charCodeAt(i + 2);
      var n = (a << 16) | ((b || 0) << 8) | (c || 0);
      out += __b64chars[(n >> 18) & 63] + __b64chars[(n >> 12) & 63] +
        (i + 1 < s.length ? __b64chars[(n >> 6) & 63] : '=') +
        (i + 2 < s.length ? __b64chars[n & 63] : '=');
    }
    return out;
  }
  if (typeof globalThis.unescape !== 'function') globalThis.unescape = function (s) { try { return decodeURIComponent(String(s)); } catch (e) { return String(s); } };
  if (typeof globalThis.escape !== 'function') globalThis.escape = function (s) { return encodeURIComponent(String(s)); };
  function __request(options) {
    var o = options || {};
    var method = String(o.method || 'GET').toUpperCase();
    var headers = {};
    var source = o.headers || {};
    for (var key in source) {
      var value = source[key];
      if (value === undefined || value === null) continue;
      headers[key] = String(value);
    }
    var init = { method: method, headers: headers };
    var payload = o.data !== undefined ? o.data : o.body;
    if (payload !== undefined && payload !== null && method !== 'GET' && method !== 'HEAD') {
      init.body = typeof payload === 'string' ? payload : JSON.stringify(payload);
    }
    return fetch(String(o.url), init).then(function (response) {
      return response.text().then(function (text) {
        return { statusCode: 200, status: 200, ok: true, headers: {}, data: o.base64Data ? __b64(text) : text, body: text, text: text };
      });
    });
  }
  globalThis.Widget = {
    http: {
      request: __request,
      get: function (url, options) { var o = options || {}; o.url = url; o.method = 'GET'; return __request(o); },
      post: function (url, data, options) { var o = options || {}; o.url = url; o.method = 'POST'; o.data = data; return __request(o); },
      head: function (url, options) { var o = options || {}; o.url = url; o.method = 'HEAD'; return __request(o); }
    },
    storage: {
      get: function (key) { return Promise.resolve(__cache[key]); },
      set: function (key, value) { __cache[key] = value; return Promise.resolve(); },
      remove: function (key) { delete __cache[key]; return Promise.resolve(); },
      clear: function () { __cache = {}; return Promise.resolve(); }
    },
    sharedCache: {
      get: function () { return Promise.resolve(null); },
      set: function () { return Promise.resolve(); }
    }
  };

  // ---- original Rex module ----
(() => {
  const SITE = 'https://sv.baidu.com';
  const cache = new Map(), searchStates = new Map(), searchLocks = new Map();
  const tags = [
    ['1','热播剧'],['2','新剧'],['5','漫剧'],['3','男频'],['4','女频'],
    ['2013','都市'],['2009','玄幻'],['2014','年代'],['2015','科幻'],['2016','军旅战争'],['2010','历史架空'],['2017','武侠武打'],['2012','家庭伦理'],['2011','古代言情'],['2008','现代言情'],['2018','青春校园'],
    ['1004','逆袭'],['2019','鉴宝'],['2005','异能'],['1007','甜宠'],['1006','虐恋'],['2007','闪婚'],['2020','种田'],['2004','穿越重生'],['2006','宫斗宅斗'],
    ['1001','战神'],['1008','总裁'],['2001','神豪'],['1002','神医'],['2003','萌宝'],['1003','赘婿'],['2002','王妃']
  ];
  const ranks = [['hot','热播榜'],['new','新剧榜'],['like','点赞榜'],['mustsee','必看榜']];
  const clean = x => String(x ?? '').replace(/<[^>]*>/g, '').trim();
  const query = x => Object.entries(x).map(([k,v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v)).join('&');
  function id(x) {return typeof x === 'string' && /^\d{1,24}$/.test(x) ? x : '';}
  function positive(x, label, maximum = 5000) {
    const n = Number(x); if (!Number.isSafeInteger(n) || n < 1 || n > maximum) throw Error('好看短剧' + label + '无效'); return n;
  }
  function linkFor(collection, vid) {return 'haokan://drama/' + collection + '/' + (vid || '0');}
  function parse(link) {
    const m = typeof link === 'string' && /^haokan:\/\/drama\/(\d{1,24})\/(\d{1,24})$/.exec(link);
    if (!m || m[1] === '0') throw Error('好看短剧链接无效'); return {collection: m[1], vid: m[2]};
  }
  function decode(value) {
    if (typeof value !== 'string' || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) throw Error('好看短剧响应编码无效');
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'; let bits = 0, buffer = 0, text = '';
    for (const c of value.replace(/=+$/, '')) {buffer = buffer << 6 | alphabet.indexOf(c); bits += 6; if (bits >= 8) {bits -= 8; text += '%' + (buffer >>> bits & 255).toString(16).padStart(2,'0');}}
    return decodeURIComponent(text);
  }
  async function request(path, body, {batch, missing = false} = {}) {
    const response = await Widget.http.request({url: SITE + path, method: 'POST', data: query(body), base64Data: true, timeout: 25,
      headers: {'Content-Type':'application/x-www-form-urlencoded; charset=utf-8', 'User-Agent':'Mozilla/5.0', Referer: SITE + '/'}});
    const status = Number(response?.statusCode ?? response?.status ?? 200);
    if (status < 200 || status >= 300) throw Error('好看短剧接口 HTTP ' + status);
    let data; try {data = JSON.parse(decode(response.data));} catch {throw Error('好看短剧接口响应无效');}
    if (batch) data = data?.[batch];
    if (missing && String(data?.status) === '3') return null;
    if (String(data?.status) !== '0' || !data.data || typeof data.data !== 'object') throw Error('好看短剧官方接口请求失败');
    return data.data;
  }
  function remember(collection, value) {cache.set(collection, {time: Date.now(), value}); if (cache.size > 60) cache.delete(cache.keys().next().value);}
  function coverFields(image) {return {coverUrl: image, posterPath: image, backdropPath: image};}
  function cards(rows) {
    if (!Array.isArray(rows)) throw Error('好看短剧列表无效');
    const seen = new Set(); return rows.flatMap(row => {
      const collection = id(row?.playlet_id), title = clean(row?.playlet_title || row?.title);
      if (!collection || !title || seen.has(collection) || ['3','6'].includes(String(row.playlet_type))) return [];
      seen.add(collection);
      return [{id: 'haokan:' + collection, type:'url', mediaType:'tv', title, description: clean(row.description || row.episodes_num_text),
        ...coverFields(clean(row.playlet_poster || row.poster)), link: linkFor(collection, id(row.progress_vid)), playerType:'app'}];
    });
  }
  async function loadList(params = {}) {
    const page = positive(params.page ?? 1, '页码', 100), tag = String(params.tag ?? '1');
    if (!tags.some(x => x[0] === tag)) throw Error('好看短剧分类无效');
    const data = await request('/haokan/ui-feed/playletTagsFeed', {tag_id: tag, pn: page, rn: 18}); return cards(data.list);
  }
  async function loadRank(params = {}) {
    const page = positive(params.page ?? 1, '页码', 100), tab = String(params.rank ?? 'hot');
    if (!ranks.some(x => x[0] === tab)) throw Error('好看短剧榜单无效');
    return cards((await request('/haokan/ui-interact/playlet/hotlist', {pn:page, rn:25, tab_name:tab, source:'playlet'})).list);
  }
  async function directory(reference, strict = true) {
    let vid = reference.vid;
    if (vid === '0') {
      // Legacy directory is only used to resolve one seed; it repeats its first ten rows on pn changes.
      const data = await request('/appui/api?cuid=00000000000000000000000000000000%7C0', {'video/commonlist':query({type:'playlet',from:'playlet_talos',id:reference.collection,rn:10,pn:1,direction:3})}, {batch:'video/commonlist'});
      vid = id(data.results?.[0]?.content?.vid); if (!vid) throw Error('好看短剧未返回首集');
    }
    const data = await request('/haokan/ui-video/playlet/rec/detail', {playlet_id:reference.collection,vid}, {missing:!strict});
    const count = Number(data?.episodes_num), videos = data?.vid_list;
    const eligible = data && id(data.playlet_id) === reference.collection && String(data.playlet_type) === '2' && clean(data.playlet_title)
      && Number.isSafeInteger(count) && count > 0 && count <= 5000 && Array.isArray(videos) && videos.length === count
      && videos.every(v => id(v)) && new Set(videos).size === count && videos.includes(vid);
    if (!eligible) {if (!strict) return null; throw Error('好看短剧目录不完整、身份不匹配或为付费/受限版本');}
    remember(reference.collection, data); return data;
  }
  async function searchPage(keyword, page) {
    let state = searchStates.get(keyword);
    if (!state || page === 1 || Date.now() - state.time > 120000) state = {time:Date.now(), inner:0, pn:1, pages:[], seen:[], done:false};
    while (state.pages.length < page && !state.done) {
      const result = [], seen = new Set(state.seen);
      // Skip pages containing only clips while keeping official pagination bounded.
      for (let attempt = 0; attempt < 1 && !result.length && !state.done; attempt++) {
        const data = await request('/haokan/ui-search/v2/search?cmd=search', {search:query({method:'get',tag:'rc',rn:10,pn:state.pn,title:keyword,force:0,needBjh:1,long_video:1,wordseg:1,outpn:0,innerpn:state.inner})});
        if (!Array.isArray(data.list)) throw Error('好看短剧搜索列表无效');
        for (let offset = 0; offset < data.list.length && result.length < 1; offset += 1) {
          const resolved = await Promise.all(data.list.slice(offset, offset + 1).map(async row => {
            const vid = id(row?.vid); if (!vid) return null;
            const related = await request('/appui/api', {'video/relate':query({method:'post',vid,tag:'playlet_talos'})}, {batch:'video/relate'});
            const current = related.cur_video, collection = id(current?.video_collection_id);
            if (!collection || id(current.vid) !== vid || seen.has(collection)) return null;
            return directory({collection,vid}, false);
          }));
          for (const item of resolved) if (item && !seen.has(item.playlet_id)) {seen.add(item.playlet_id); result.push(...cards([{...item,progress_vid:item.vid_list[0]}]));}
        }
        if (![0,1,'0','1',false,true].includes(data.has_more)) throw Error('好看短剧搜索分页状态无效');
        state.done = data.has_more === false || String(data.has_more) === '0';
        if (!state.done && (!Number.isSafeInteger(Number(data.innerpn)) || Number(data.innerpn) <= state.inner)) throw Error('好看短剧搜索分页未前进');
        state.inner = Number(data.innerpn); state.pn++;
      }
      if (!result.length && !state.done) throw Error('好看短剧搜索仍有结果待核对，请缩小关键词后重试');
      state.pages.push(result); state.seen = [...seen];
    }
    searchStates.set(keyword,state); if (searchStates.size > 10) searchStates.delete(searchStates.keys().next().value);
    return state.pages[page-1] || [];
  }
  async function search(params = {}) {
    const keyword = clean(params.keyword ?? params.query), page = positive(params.page ?? 1,'页码',30); if (!keyword) return [];
    const task = (searchLocks.get(keyword) || Promise.resolve()).catch(() => {}).then(() => searchPage(keyword,page)); searchLocks.set(keyword,task);
    try {return await task;} finally {if (searchLocks.get(keyword) === task) searchLocks.delete(keyword);}
  }
  async function loadDetail(link) {
    const reference = parse(link), stored = cache.get(reference.collection);
    const data = stored && Date.now()-stored.time < 120000 && (reference.vid === '0' || stored.value.vid_list.includes(reference.vid)) ? stored.value : await directory(reference);
    const image = clean(data.playlet_poster), title = clean(data.playlet_title);
    return {id:'haokan:'+reference.collection, type:'url', mediaType:'tv', title, description:clean(data.description), ...coverFields(image), link, playerType:'app',
      episodeItems:data.vid_list.map((videoId,index) => ({id:'haokan:'+reference.collection+':'+videoId,type:'url',mediaType:'tv',title,description:'第'+(index+1)+'集',
        episode:index+1,episodeNumber:index+1,season:1,seasonNumber:1,videoId,collectionId:reference.collection,link,...coverFields(image),playerType:'app'}))};
  }
  async function loadResource(params = {}) {
    const reference = parse(params.link), episode = positive(params.episode ?? params.episodeNumber ?? 1,'集数'), season = positive(params.season ?? params.seasonNumber ?? 1,'季度');
    if (season !== 1) throw Error('好看短剧未返回该季度');
    const data = await directory(reference), vid = data.vid_list[episode-1]; if (!vid) throw Error('好看短剧该集不存在');
    const [info, badges, related] = await Promise.all([
      request('/haokan/ui-video/getPlayletInfo',{vid}),
      request('/haokan/ui-video/playlet/rec/video/pageInfo',{playlet_id:reference.collection,vid_list:vid}),
      request('/appui/api',{'video/relate':query({method:'post',vid,tag:'playlet_talos',video_set_id:reference.collection})},{batch:'video/relate'})
    ]);
    const current = related.cur_video, badge = badges.list?.find(row => row.vid === vid);
    if (info.is_free !== true || !badge || String(badge.playlet_type) !== '2' || current?.playlet_unlock !== true || ['3','6'].includes(String(current.playlet_type))) throw Error('好看短剧付费或受限剧集暂不提供');
    if (id(current.vid) !== vid || id(current.video_collection_id) !== reference.collection || Number(current.location_index) !== episode-1 || Number(current.video_collection_item_count_int) !== data.episodes_num) throw Error('好看短剧播放分集不匹配');
    const qualities = Array.isArray(current.clarityUrl) ? [...current.clarityUrl] : [], seen = new Set();
    const resources = qualities.sort((a,b) => Number(b.rank ?? 0)-Number(a.rank ?? 0)).flatMap(row => {
      if (!/^https?:\/\/vd\d+\.bdstatic\.com\/[^\s]+$/i.test(row?.url || '')) return [];
      const url = row.url.replace(/^http:/i,'https:'); if (seen.has(url)) return []; seen.add(url);
      return [{name:'好看短剧 '+clean(row.title || row.key || '高清'),url,format:'mp4',playerType:'app',episode,season,headers:{'User-Agent':'Mozilla/5.0',Referer:SITE+'/'}}];
    });
    if (!resources.length) throw Error('好看短剧未返回官方免费播放地址'); return resources;
  }
  const searchParams = [{name:'keyword',title:'关键词',type:'input'},{name:'page',title:'页码',type:'page'}];
  const WidgetMetadata = {id:'forward.haokan.short-drama',title:'好看免费短剧',version:'1.0.0',requiredVersion:'0.0.1',author:'balge',site:SITE,
    description:'好看短剧的分类、搜索和播放。',detailCacheDuration:120,
    modules:[
      {id:'discover',title:'短剧广场',functionName:'loadList',cacheDuration:120,params:[{name:'page',title:'页码',type:'page'},{name:'tag',title:'分类',type:'enumeration',value:'1',enumOptions:tags.map(([value,title])=>({title,value}))}]},
      {id:'rank',title:'榜单',functionName:'loadRank',cacheDuration:120,params:[{name:'page',title:'页码',type:'page'},{name:'rank',title:'榜单',type:'enumeration',value:'hot',enumOptions:ranks.map(([value,title])=>({title,value}))}]},
      {id:'search',title:'搜索',functionName:'search',cacheDuration:60,params:searchParams},
      {id:'loadResource',title:'播放资源',functionName:'loadResource',type:'stream',cacheDuration:0,params:[]}
    ],search:{title:'搜索',functionName:'search',params:searchParams}};
  Object.assign(globalThis,{WidgetMetadata,loadList,loadRank,search,loadDetail,loadResource});
})();

  // Expose the module's declared entry points to the adapter.
  if (typeof loadList === 'function') globalThis.loadList = loadList;
  if (typeof loadTaggedList === 'function') globalThis.loadTaggedList = loadTaggedList;
  if (typeof loadDetail === 'function') globalThis.loadDetail = loadDetail;
  if (typeof loadResource === 'function') globalThis.loadResource = loadResource;
  if (typeof search === 'function') globalThis.search = search;
  if (typeof loadSearchHints === 'function') globalThis.loadSearchHints = loadSearchHints;
  if (typeof loadHotRankings === 'function') globalThis.loadHotRankings = loadHotRankings;
  if (typeof loadAdvancedGenre === 'function') globalThis.loadAdvancedGenre = loadAdvancedGenre;
  if (typeof loadByTagAttr === 'function') globalThis.loadByTagAttr = loadByTagAttr;
  if (typeof loadByTagRel === 'function') globalThis.loadByTagRel = loadByTagRel;
  if (typeof loadByTagRole === 'function') globalThis.loadByTagRole = loadByTagRole;
  if (typeof loadByTagBody === 'function') globalThis.loadByTagBody = loadByTagBody;
  if (typeof loadByTagLoc === 'function') globalThis.loadByTagLoc = loadByTagLoc;
  if (typeof loadByTagPlot === 'function') globalThis.loadByTagPlot = loadByTagPlot;
  if (typeof loadByTagPos === 'function') globalThis.loadByTagPos = loadByTagPos;

  // ---- nshort adapter ----
  var __api = (function () {
  async function __retry(fn) {
    try { return await fn(); } catch (error) { return await fn(); }
  }
  var NAME = "好看免费短剧";
  var META = (typeof WidgetMetadata !== 'undefined') ? WidgetMetadata : {};
  function pid(row) { return String(row.link || '').replace(/^haokan:\/\/drama\//, '').split('/').join('_'); }
  function linkOf(id) { return 'haokan://drama/' + id.split('_').join('/'); }
  function fixUrl(url) { return url; }
  function toDrama(row) {
    var remark = String(row.remark || '');
    var episodes = Number(row.episodes || row.totalEpisodeNum || row.episodeCount || 0) || 0;
    if (!episodes) episodes = Number((remark.match(/\d+/) || [0])[0]) || 0;
    return {
      id: pid(row),
      title: String(row.title || '').slice(0, 120),
      description: String(row.description || row.intro || '').slice(0, 2000),
      cover: String(row.coverUrl || row.posterPath || row.backdropPath || ''),
      episodes: episodes,
      category: String(row.category || '').slice(0, 40)
    };
  }
  function chaptersOf(detail) {
    var rows = Array.isArray(detail.episodeItems) ? detail.episodeItems : [];
    rows = rows.filter(function (row) { return row && Number(row.episode) > 0; });
    if (!rows.length) return [{ id: '1', title: '正片' }];
    return rows.map(function (row, index) {
      var number = Number(row.episode) || index + 1;
      return { id: String(number), title: String(row.description || row.title || ('第' + number + '集')).slice(0, 80) };
    });
  }
  async function describe() {
    var rows = (META.modules || []).filter(function (m) {
      return m && m.id && m.functionName && m.type !== 'stream' && m.functionName !== 'loadResource' && typeof globalThis[m.functionName] === 'function';
    }).slice(0, 16).map(function (m) {
      var params = (m.params || []).filter(function (p) { return p && p.name && p.type; }).slice(0, 6).map(function (p) {
        var name = String(p.name).toLowerCase().slice(0, 32), title = String(p.title || p.name).slice(0, 40), kind = String(p.type);
        if (kind === 'page') return { name: name, title: title, type: 'page' };
        if (kind === 'enumeration') {
          var options = (p.enumOptions || []).filter(function (option) { return option && typeof option.value === 'string'; }).slice(0, 80)
            .map(function (option) { var value = String(option.value); if (!value) value = 'all'; return { title: String(option.title || value).slice(0, 40), value: value.slice(0, 32) }; });
          if (!options.length) return null;
          var wanted = (p.value === undefined || p.value === '') ? 'all' : String(p.value);
          var value = options.some(function (option) { return option.value === wanted; }) ? wanted : options[0].value;
          return { name: name, title: title, type: 'enumeration', value: value, enumOptions: options };
        }
        if (kind === 'input') {
          var text = p.value === undefined ? '' : String(p.value).slice(0, 160);
          return { name: name, title: title, type: 'input', value: text };
        }
        return null;
      }).filter(Boolean);
      var moduleID = String(m.id).toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'list';
      if (!/^[a-z]/.test(moduleID)) moduleID = 'm' + moduleID;
      return { id: moduleID.slice(0, 32), title: String(m.title || m.id).slice(0, 40), params: params };
    });
    return { title: NAME, modules: rows, search: { title: '搜索', params: [{ name: 'keyword', title: '关键词', type: 'input' }] } };
  }
  async function catalog(args) {
    args = args || {};
    var mods = META.modules || [], selected = null;
    if (args.module) selected = mods.filter(function (m) { return String(m.id).toLowerCase().replace(/[^a-z0-9_-]/g, '') === args.module || m.id === args.module; })[0] || null;
    if (!selected) selected = mods.filter(function (m) { return m && m.functionName && m.type !== 'stream' && typeof globalThis[m.functionName] === 'function'; })[0] || null;
    var fn = selected ? globalThis[selected.functionName] : globalThis.loadList;
    if (typeof fn !== 'function') throw new Error(NAME + '模块不可用');
    var params = {};
    if (selected && selected.params) selected.params.forEach(function (p) {
      if (!p || !p.name) return;
      var alias = String(p.name).toLowerCase();
      if (args[alias] !== undefined) params[p.name] = args[alias];
      else if (args[p.name] !== undefined) params[p.name] = args[p.name];
      else if (p.value !== undefined) params[p.name] = p.value;
    });
    for (var key in args) if (key !== 'module' && key !== 'query') {
      var known = (selected && selected.params || []).some(function (p) { return p && (String(p.name).toLowerCase() === key || p.name === key); });
      if (!known) params[key] = args[key];
    }
    for (var name in params) if (params[name] === 'all') params[name] = '';
    var rows = await __retry(function () { return fn(params); });
    return { items: (rows || []).map(toDrama) };
  }
  async function search(args) {
    args = args || {};
    var keyword = String(args.keyword || args.query || '').trim();
    if (!keyword || typeof globalThis.search !== 'function') return { items: [] };
    var rows = await __retry(function () { return globalThis.search({ keyword: keyword, page: Number(args.page) || 1 }); });
    return { items: (rows || []).map(toDrama) };
  }
  async function detail(args) {
    args = args || {};
    var value = await __retry(function () { return globalThis.loadDetail(linkOf(String(args.id || ''))); });
    return { drama: toDrama(value), chapters: chaptersOf(value) };
  }
  async function play(args) {
    args = args || {};
    var id = String(args.id || ''), episode = Number(args.episode && typeof args.episode === 'object' ? args.episode.id : args.episode) || 1, link = linkOf(id);
    if (typeof globalThis.loadResource === 'function') {
      var rows = await __retry(function () { return globalThis.loadResource({ link: link, episode: episode, episodeNumber: episode }); });
      rows = Array.isArray(rows) ? rows : [rows];
      var urls = rows.filter(function (row) { return row && typeof row.url === 'string' && /^https?:\/\//.test(row.url); })
        .map(function (row) { return fixUrl(row.url); });
      if (!urls.length) throw new Error(NAME + '未返回播放地址');
      if (urls.length === 1) return { url: urls[0] };
      return { url: urls[0], variants: urls.slice(0, 16).map(function (url) { return { url: url }; }) };
    }
    var value = await __retry(function () { return globalThis.loadDetail(link); });
    if (!value || typeof value.videoUrl !== 'string' || !/^https?:\/\//.test(value.videoUrl)) throw new Error(NAME + '未返回播放地址');
    return { url: fixUrl(value.videoUrl) };
  }
  return { describe: describe, catalog: catalog, search: search, detail: detail, play: play };
  })();
  globalThis.nshort = __api;
})();
