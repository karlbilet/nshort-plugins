// @nshort {"id":"youman","name":"柚漫剧","version":"1.0.1","hosts":["yo.baidu.com","*.bdstatic.com","*.bdurl.net"]}
/*! 柚漫剧 — ported from the Rex module of the same source. */
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
  const SITE = 'https://yo.baidu.com';
  const detailCache = new Map();
  const categoryLocks = new Map();
  const categoryStates = new Map();
  const dimensions = [
    ['genre', '题材', ['言情', '家庭伦理', '玄幻', '青春校园', '惊悚恐怖', '搞笑', '悬疑推理', '末世灾难']],
    ['plot', '情节', ['逆袭', '穿越重生', '异能', '虐恋', '系统', '甜宠', '豪门', '复仇', '青梅竹马', '娱乐圈', '宫斗宅斗', '玄学风水', '双男主']],
    ['role', '角色', ['总裁', '神豪', '战神', '萌宝', '银发', '赘婿', '神医', '王妃', '皇子']],
    ['audience', '受众', ['男频', '女频']],
    ['sort', '推荐', ['newest', 'hottest']]
  ];
  const clean = value => String(value ?? '').replace(/<[^>]*>/g, '').trim();
  const query = values => Object.entries(values).map(([name, value]) => encodeURIComponent(name) + '=' + encodeURIComponent(value)).join('&');
  function positive(value, label, maximum = 10000) {
    const number = Number(value);
    if (!Number.isSafeInteger(number) || number < 1 || number > maximum) throw Error('柚漫剧' + label + '无效');
    return number;
  }
  function identifier(value) {
    if (typeof value !== 'string' && !(typeof value === 'number' && Number.isSafeInteger(value))) return '';
    const result = String(value).replace(/^sv_/, '');
    return /^\d{1,24}$/.test(result) ? result : '';
  }
  function linkFor(collection, first) {
    return 'youman://drama/' + collection + '/' + first;
  }
  function parseLink(link) {
    const match = typeof link === 'string' && /^youman:\/\/drama\/(\d{1,24})\/(\d{1,24})$/.exec(link);
    if (!match) throw Error('柚漫剧链接无效');
    return {collection: match[1], first: match[2]};
  }
  function decodeBase64(value) {
    if (typeof value !== 'string' || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) throw Error('柚漫剧响应编码无效');
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let buffer = 0, bits = 0, output = '';
    for (const character of value.replace(/=+$/, '')) {
      buffer = buffer << 6 | alphabet.indexOf(character);
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        output += '%' + (buffer >>> bits & 255).toString(16).padStart(2, '0');
      }
    }
    try { return decodeURIComponent(output); } catch { throw Error('柚漫剧响应编码无效'); }
  }
  async function request(path, body, form = false) {
    const options = {
      url: SITE + path, method: body === undefined ? 'GET' : 'POST', base64Data: true, timeout: 25,
      headers: {'Content-Type': form ? 'application/x-www-form-urlencoded; charset=utf-8' : 'application/json; charset=utf-8', 'User-Agent': 'Mozilla/5.0', Referer: SITE + '/'}
    };
    if (body !== undefined) options.data = form ? query({data: JSON.stringify(body)}) : JSON.stringify(body);
    const response = await Widget.http.request(options);
    const status = Number(response?.statusCode ?? response?.status ?? 200);
    if (!Number.isInteger(status) || status < 200 || status >= 300) throw Error('柚漫剧接口 HTTP ' + status);
    let decoded;
    try { decoded = JSON.parse(decodeBase64(response.data)); } catch { throw Error('柚漫剧接口响应无效'); }
    if (String(decoded?.errno) !== '0') throw Error('柚漫剧官方接口请求失败');
    if (!decoded.data || typeof decoded.data !== 'object') throw Error('柚漫剧接口数据无效');
    return decoded.data;
  }
  function schemeData(scheme) {
    if (typeof scheme !== 'string' || !/^newxcomic:\/\/video\/invokeVideoDetail\?/.test(scheme)) return null;
    const parameter = scheme.split('?')[1].split('&').find(part => part.startsWith('params='));
    if (!parameter) return null;
    try { return JSON.parse(decodeURIComponent(parameter.slice(7))); } catch { return null; }
  }
  function cards(items, searching = false) {
    if (!Array.isArray(items)) throw Error('柚漫剧官方列表无效');
    const seen = new Set(), result = [];
    for (const item of items) {
      const data = item?.data;
      if (!data || (searching ? data.type !== 'comic' || String(data.ext?.is_onsite) !== '1' : item.layout !== 'normal_image')) continue;
      if (String(data.ext?.is_onsite ?? '1') !== '1') continue;
      const scheme = schemeData(data.scheme);
      const collection = identifier(scheme?.ext?.collId ?? data.ext?.collection_id ?? data.collection_id);
      const first = identifier(scheme?.vid ?? data.id ?? item.id);
      const title = clean(data.title), image = clean(data.image ?? scheme?.videoInfo?.posterImage);
      if (!collection || !first || !title || seen.has(collection)) continue;
      seen.add(collection);
      result.push({id: 'youman:' + collection, type: 'url', mediaType: 'tv', title,
        description: clean(data.description || data.subtitle), coverUrl: image, posterPath: image, backdropPath: image,
        link: linkFor(collection, first), playerType: 'app'});
    }
    return result;
  }
  function filtersFor(params) {
    const result = [];
    for (const [name, kind, options] of dimensions) {
      const value = String(params[name] ?? '');
      if (!value) continue;
      if (!options.includes(value)) throw Error('柚漫剧分类无效');
      result.push({kind, option: name === 'sort' ? {name: value === 'newest' ? '最新' : '最热', sort_key: value, order: 'desc'} : {name: value}});
    }
    return result;
  }
  async function categoryPage(params, page, filter, key) {
    let state = categoryStates.get(key);
    if (!state) {
      try {
        state = await Widget.storage?.get?.(key);
        if (typeof state === 'string') state = JSON.parse(state);
      } catch { state = null; }
    }
    if (page === 1 || !state || Date.now() - state.time > 600000 || !Array.isArray(state.offsets) || !state.offsets.every(offset => typeof offset === 'string')) state = {time: Date.now(), offsets: [''], donePage: 0};
    if (state.donePage && page > state.donePage) return [];
    let current = Math.min(page, state.offsets.length), rows = [];
    while (current <= page) {
      const offset = state.offsets[current - 1];
      const data = await request('/xcomic/list/channel_filter?' + query({tab_id: '1', data: JSON.stringify({filter, offset, page_size: 18})}));
      rows = cards(data.items);
      if (data.has_more !== true && data.has_more !== false && !['0', '1', 0, 1].includes(data.has_more)) throw Error('柚漫剧分页状态无效');
      const hasMore = data.has_more === true || String(data.has_more) === '1';
      if (hasMore) {
        if (typeof data.offset !== 'string' || !data.offset || state.offsets.slice(0, current).includes(data.offset)) throw Error('柚漫剧分页未前进');
        state.offsets[current] = data.offset;
      } else state.donePage = current;
      categoryStates.set(key, state);
      if (categoryStates.size > 20) categoryStates.delete(categoryStates.keys().next().value);
      if (Widget.storage?.set) await Widget.storage.set(key, JSON.stringify(state));
      if (!hasMore) return current === page ? rows : [];
      current++;
    }
    return rows;
  }
  async function loadList(params = {}) {
    const page = positive(params.page ?? 1, '页码', 100), filter = filtersFor(params);
    const key = 'youman:category:v1:' + JSON.stringify(filter);
    const previous = categoryLocks.get(key) || Promise.resolve();
    const current = previous.catch(() => {}).then(() => categoryPage(params, page, filter, key));
    categoryLocks.set(key, current);
    try { return await current; } finally { if (categoryLocks.get(key) === current) categoryLocks.delete(key); }
  }
  async function search(params = {}) {
    const page = positive(params.page ?? 1, '页码', 100), keyword = clean(params.keyword ?? params.query);
    if (!keyword || page > 1) return [];
    const data = await request('/xcomic/search/search', {word: keyword, search_input_type: 'submit', cuid: '', isIncognito: '1', source: 'search', is_repeat_search: '0', ext_request: {}});
    return cards(data.items, true);
  }
  function seasonNumber(title) {
    const match = /第([\d一二三四五六七八九十百零〇两]+)季/.exec(title);
    if (!match) return 1;
    if (/^\d+$/.test(match[1])) return positive(match[1], '季度');
    const digits = {零: 0, 〇: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9};
    let total = 0, digit = 0;
    for (const character of match[1]) {
      if (character === '十' || character === '百') {total += (digit || 1) * (character === '十' ? 10 : 100); digit = 0;}
      else digit = digits[character];
    }
    return positive(total + digit, '季度');
  }
  function restricted(data) {
    return ['isPayColumn', 'payColumnState', 'needVip', 'isVip', 'isPay', 'drm', 'isPreview'].some(key => data?.[key] !== undefined && !['0', '', 'false'].includes(String(data[key])));
  }
  async function seasonDetail(reference) {
    let offset = 0, header, total, previousPosition = 0;
    const episodes = new Map();
    for (let attempt = 0; attempt < 50; attempt++) {
      const response = await request('/xcomic?action=feed&cmd=355&service=bdbox&osname=baiduboxapp', {data: {coll_id: reference.collection, first_id: reference.first, pd: 'comic', direction: '0', pn: String(offset), pageCount: '100', completeInfo: '1'}}, true);
      const data = response['355'];
      if (!data || identifier(data.collId) !== reference.collection || !Array.isArray(data.items) || !clean(data.collTitle)) throw Error('柚漫剧详情不匹配');
      const count = positive(data.collNum, '总集数', 5000);
      if (header && (total !== count || header.collTitle !== data.collTitle)) throw Error('柚漫剧选集不完整，请重试');
      if (!header) {header = data; total = count;}
      let lastPosition = 0;
      for (const item of data.items) {
        const position = positive(item?.data?.position, '集数', total);
        const video = identifier(item.data.videoInfo?.vid);
        if (!video) { episodes.set(position, item); lastPosition = Math.max(lastPosition, position); continue; } if (identifier(item.id) !== video) throw Error('柚漫剧分集不匹配');
        if (episodes.has(position) && episodes.get(position).data.videoInfo.vid !== item.data.videoInfo.vid) throw Error('柚漫剧重复集数不匹配');
        episodes.set(position, item);
        lastPosition = Math.max(lastPosition, position);
      }
      if (!['0', '1', 0, 1, false, true].includes(data.hasMore)) throw Error('柚漫剧分页状态无效');
      if (lastPosition <= previousPosition) throw Error('柚漫剧分页未前进');
      if (String(data.hasMore) === '0' || data.hasMore === false) {
        if (episodes.size !== total || Array.from({length: total}, (_, index) => index + 1).some(position => !episodes.has(position))) throw Error('柚漫剧选集不完整');
        return {...reference, header, items: [...episodes.values()].sort((left, right) => left.data.position - right.data.position)};
      }
      previousPosition = lastPosition;
      offset = lastPosition;
    }
    throw Error('柚漫剧分页超出安全上限，选集不完整');
  }
  async function assembleDetail(link) {
    const primary = parseLink(link), queue = [primary], seen = new Set(), seasons = [], numbers = new Set();
    while (queue.length) {
      const reference = queue.shift();
      if (seen.has(reference.collection)) continue;
      if (seen.size >= 16) throw Error('柚漫剧官方季度过多，请重试');
      seen.add(reference.collection);
      const result = await seasonDetail(reference);
      const number = seasonNumber(result.header.collTitle);
      if (numbers.has(number)) throw Error('柚漫剧官方季度编号冲突');
      numbers.add(number); result.number = number; seasons.push(result);
      const related = result.header.series;
      if (related !== undefined && !Array.isArray(related)) throw Error('柚漫剧官方季度列表无效');
      for (const row of related || []) {
        const collection = identifier(row.collId), first = identifier(row.id);
        if (!collection || !first) throw Error('柚漫剧官方季度标识无效');
        if (!seen.has(collection) && !queue.some(item => item.collection === collection)) queue.push({collection, first, cover: clean(row.cover)});
      }
    }
    const first = seasons[0], image = clean(first.header.playletInfo?.cover), title = clean(first.header.collTitle);
    const episodeItems = seasons.flatMap(season => {
      const artwork = clean(season.header.playletInfo?.cover || season.cover || image);
      return season.items.map(item => ({id: 'youman:' + season.collection + ':' + item.data.position,
        type: 'url', mediaType: 'tv', title: clean(season.header.collTitle), description: clean(item.data.title),
        coverUrl: artwork, posterPath: artwork, backdropPath: artwork, link, playerType: 'app',
        episode: Number(item.data.position), episodeNumber: Number(item.data.position), season: season.number, seasonNumber: season.number,
        collectionId: season.collection, firstId: season.first, videoId: identifier(item.data.videoInfo.vid)}));
    }).sort((left, right) => left.season - right.season || left.episode - right.episode);
    return {id: 'youman:' + primary.collection, type: 'url', mediaType: 'tv', title,
      description: clean(first.header.playletInfo?.synopsis), coverUrl: image, posterPath: image, backdropPath: image,
      link, playerType: 'app', episodeItems};
  }
  async function loadDetail(link) {
    parseLink(link);
    const cached = detailCache.get(link);
    if (cached && Date.now() - cached.time < 120000) return cached.value;
    const value = await assembleDetail(link);
    detailCache.set(link, {time: Date.now(), value});
    if (detailCache.size > 8) detailCache.delete(detailCache.keys().next().value);
    return value;
  }
  async function loadResource(params = {}) {
    parseLink(params.link);
    const selected = positive(params.episode ?? params.episodeNumber ?? 1, '集数', 5000);
    const explicitSeason = params.season ?? params.seasonNumber;
    if (explicitSeason !== undefined) positive(explicitSeason, '季度');
    const detail = await loadDetail(params.link), season = positive(explicitSeason ?? seasonNumber(detail.title), '季度');
    const row = detail.episodeItems.find(item => item.episode === selected && item.season === season);
    if (!row) throw Error('柚漫剧该季集不存在');
    const fresh = await seasonDetail({collection: row.collectionId, first: row.firstId});
    const current = fresh.items.find(item => Number(item.data.position) === selected);
    if (!current || identifier(current.data.videoInfo.vid) !== row.videoId) throw Error('柚漫剧分集不匹配，请重试');
    if (restricted(fresh.header) || restricted(fresh.header.playletInfo) || restricted(current.data) || restricted(current.data.videoInfo)) throw Error('柚漫剧付费或受限剧集暂不提供');
    const qualities = current.data.videoInfo.clarityUrl;
    if (!Array.isArray(qualities)) throw Error('柚漫剧未返回官方播放地址');
    const urls = new Set();
    const resources = qualities.filter(quality => !restricted(quality) && /^https?:\/\/vd\d+\.bdstatic\.com\/[^\s]+$/i.test(quality.url || '')).sort((left, right) => Number(right.rank ?? 0) - Number(left.rank ?? 0)).flatMap(quality => {
      const url = quality.url.replace(/^http:/i, 'https:');
      if (urls.has(url)) return [];
      urls.add(url);
      return [{name: '柚漫剧 ' + clean(quality.title || quality.key || '高清'), url, format: 'mp4', playerType: 'app', episode: selected, season,
        headers: {Referer: SITE + '/', 'User-Agent': 'Mozilla/5.0'}}];
    });
    if (!resources.length) throw Error('柚漫剧未返回官方免费播放地址');
    return resources;
  }
  const WidgetMetadata = {
    id: 'forward.youman.short-drama', title: '柚漫剧', version: '1.0.0', requiredVersion: '0.0.1', author: 'balge', site: SITE,
    description: '柚漫剧的分类、搜索和播放。', detailCacheDuration: 120,
    modules: [
      {id: 'discover', title: '漫剧库', functionName: 'loadList', cacheDuration: 120,
        params: [{name: 'page', title: '页码', type: 'page'}, ...dimensions.map(([name, title, options]) => ({name, title, type: 'enumeration', value: '',
          enumOptions: [{title: '全部', value: ''}, ...options.map(value => ({title: value === 'newest' ? '最新' : value === 'hottest' ? '最热' : value, value}))]}))]},
      {id: 'search', title: '搜索', functionName: 'search', cacheDuration: 60, params: [{name: 'keyword', title: '关键词', type: 'input'}, {name: 'page', title: '页码', type: 'page'}]},
      {id: 'loadResource', title: '播放资源', functionName: 'loadResource', type: 'stream', cacheDuration: 0, params: []}
    ],
    search: {title: '搜索', functionName: 'search', params: [{name: 'keyword', title: '关键词', type: 'input'}, {name: 'page', title: '页码', type: 'page'}]}
  };
  Object.assign(globalThis, {WidgetMetadata, loadList, search, loadDetail, loadResource});
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
  var NAME = "柚漫剧";
  var META = (typeof WidgetMetadata !== 'undefined') ? WidgetMetadata : {};
  function pid(row) { return String(row.link || '').replace(/^youman:\/\/drama\//, '').split('/').join('_'); }
  function linkOf(id) { return 'youman://drama/' + id.split('_').join('/'); }
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
