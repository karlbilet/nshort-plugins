// @nshort {"id":"xingya","name":"星芽免费短剧","version":"1.0.1","hosts":["*.whjzjx.cn","*.shytkjgs.com","*.rongjuwh.cn","*.xingya.com.cn","*.qnqcdn.net"]}
/*! 星芽免费短剧 — ported from the Rex module of the same source. */
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
/*! 星芽免费短剧独立 Rex 模块；请勿记录游客令牌。 */
(() => {
  // Rex JavaScriptCore has no browser encoding or query APIs.
  var g = globalThis;
  if (!g.TextEncoder) g.TextEncoder = class {
    encode(value = "") {
      return Uint8Array.from(unescape(encodeURIComponent(String(value))), (c) => c.charCodeAt(0));
    }
  };
  if (!g.TextDecoder) g.TextDecoder = class {
    decode(bytes2 = new Uint8Array()) {
      return decodeURIComponent(Array.from(bytes2, (b) => "%" + b.toString(16).padStart(2, "0")).join(""));
    }
  };
  var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  if (!g.btoa) g.btoa = (value) => {
    let result = "";
    for (let i = 0; i < value.length; i += 3) {
      const a = value.charCodeAt(i), b = value.charCodeAt(i + 1), c = value.charCodeAt(i + 2);
      if (a > 255 || b > 255 || c > 255) throw new Error("Invalid base64 input");
      const n = a << 16 | (b || 0) << 8 | (c || 0);
      result += alphabet[n >>> 18] + alphabet[n >>> 12 & 63] + (i + 1 < value.length ? alphabet[n >>> 6 & 63] : "=") + (i + 2 < value.length ? alphabet[n & 63] : "=");
    }
    return result;
  };
  if (!g.atob) g.atob = (value) => {
    value = String(value).replace(/\s/g, "");
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(value) || value.length % 4 === 1) throw new Error("Invalid base64");
    let n = 0, bits = 0, result = "";
    for (const c of value.replace(/=+$/, "")) {
      n = n << 6 | alphabet.indexOf(c);
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        result += String.fromCharCode(n >>> bits & 255);
      }
    }
    return result;
  };
  if (!g.URLSearchParams) g.URLSearchParams = class {
    constructor(value = {}) {
      const decode = (s) => decodeURIComponent(s.replace(/\+/g, " "));
      this.rows = typeof value === "string" ? value.replace(/^\?/, "").split("&").filter(Boolean).map((part) => {
        const i = part.indexOf("=");
        return i < 0 ? [decode(part), ""] : [decode(part.slice(0, i)), decode(part.slice(i + 1))];
      }) : Object.entries(value).map(([key, v]) => [key, String(v)]);
    }
    get(key) {
      return this.rows.find((row) => row[0] === key)?.[1] ?? null;
    }
    getAll(key) {
      return this.rows.filter((row) => row[0] === key).map((row) => row[1]);
    }
    has(key) {
      return this.rows.some((row) => row[0] === key);
    }
    keys() {
      return this.rows.map((row) => row[0])[Symbol.iterator]();
    }
    [Symbol.iterator]() {
      return this.rows[Symbol.iterator]();
    }
    toString() {
      const encode = (s) => encodeURIComponent(s).replace(/[!'()~]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase()).replace(/%20/g, "+");
      return this.rows.map(([key, value]) => encode(key) + "=" + encode(value)).join("&");
    }
  };
  const API='https://app.whjzjx.cn',LOGIN='https://u.shytkjgs.com/user/v3/account/login';
  // App 4.1.1 ConfigPresenter initialization; this is protocol material, not a user credential.
  const PROTOCOL_KEY=[66,64,101,99,102,57,50,48,79,100,56,65,52,100,102,55];
  const utf8=s=>new TextEncoder().encode(String(s));
  const base64=bytes=>btoa(Array.from(bytes,b=>String.fromCharCode(b)).join(''));
  function mul(a,b){let n=0;for(;b;b>>>=1,a=(a<<1)^((a&128)?283:0))if(b&1)n^=a;return n&255;}
  const SBOX=Array.from({length:256},(_,x)=>{let y=0;if(x){y=1;for(let i=0;i<254;i++)y=mul(y,x);}let s=y;for(let i=1;i<5;i++)s^=(y<<i)|(y>>>(8-i));return (s^99)&255;});
  function aesEcbEncrypt(text,key=PROTOCOL_KEY){
    if(key.length!==16)throw Error('AES key length');
    const schedule=Array.from(key);let rc=1;
    for(let i=16;i<176;i+=4){let t=schedule.slice(i-4,i);if(i%16===0){t.push(t.shift());t=t.map(v=>SBOX[v]);t[0]^=rc;rc=mul(rc,2);}for(let j=0;j<4;j++)schedule[i+j]=schedule[i+j-16]^t[j];}
    const raw=utf8(text),pad=16-raw.length%16,bytes=new Uint8Array(raw.length+pad);bytes.set(raw);bytes.fill(pad,raw.length);
    for(let offset=0;offset<bytes.length;offset+=16){let state=Array.from(bytes.slice(offset,offset+16));
      const add=round=>{state=state.map((v,i)=>v^schedule[round*16+i]);};add(0);
      for(let round=1;round<=10;round++){
        state=state.map(v=>SBOX[v]);const prev=state.slice();for(let c=0;c<4;c++)for(let r=0;r<4;r++)state[4*c+r]=prev[4*((c+r)%4)+r];
        if(round<10)for(let c=0;c<4;c++){const i=c*4,[a,b,d,e]=state.slice(i,i+4);state[i]=mul(a,2)^mul(b,3)^d^e;state[i+1]=a^mul(b,2)^mul(d,3)^e;state[i+2]=a^b^mul(d,2)^mul(e,3);state[i+3]=mul(a,3)^b^d^mul(e,2);}
        add(round);
      }bytes.set(state,offset);
    }return base64(bytes);
  }
  function randomHex(n){let s='';while(s.length<n)s+=Math.floor(Math.random()*0x100000000).toString(16).padStart(8,'0');return s.slice(0,n);}
  const validId=value=>{const s=String(value??'');if(!/^\d{1,24}$/.test(s))throw Error('星芽剧集 ID 无效');return s;};
  const clean=value=>String(value??'').replace(/<[^>]*>/g,'').trim();
  const isPremium=item=>item.is_vip_theater===true||Number(item.vip)>0||Number(item.pay_type)>0||(Array.isArray(item.tags)&&item.tags.some(t=>/会员|付费/.test(String(t.tag_name??''))));
  function card(item){const id=validId(item.id),cover=item.cover_url??'';return {id:'xingya:'+id,type:'url',mediaType:'tv',title:clean(item.title)||'星芽短剧',coverUrl:cover,posterPath:cover,backdropPath:cover,description:clean(item.introduction||item.descrip),remark:item.total?'全'+item.total+'集':'',link:'xingya://theater/'+id};}
  function cards(rows){if(!Array.isArray(rows))throw Error('星芽列表格式无效');const seen=new Set();return rows.filter(item=>item&&/^\d{1,24}$/.test(String(item.id))&&!isPremium(item)).filter(item=>{const id=String(item.id);if(seen.has(id))return false;seen.add(id);return true;}).map(card);}
  class XingyaClient {
    constructor(widget){this.widget=widget;this.identity=null;this.token='';this.initializing=null;this.loggingIn=null;}
    async init(){if(!this.initializing)this.initializing=(async()=>{
      let saved;try{saved=await this.widget.storage?.get?.('xingya:guest:v1');if(typeof saved==='string')saved=JSON.parse(saved);}catch{}
      if(saved&&/^[a-f0-9]{16}$/.test(saved.deviceId)&&/^[a-f0-9]{32}$/.test(saved.uuid)){this.identity={deviceId:saved.deviceId,uuid:saved.uuid,createdAt:Number(saved.createdAt)||Date.now()-60000};this.token=typeof saved.token==='string'?saved.token:'';}
      else this.identity={deviceId:randomHex(16),uuid:randomHex(32),createdAt:Date.now()-60000};
    })();await this.initializing;}
    headers(){return {'X-App-Id':'7',platform:'1',app_version:'4.1.1',version_name:'4.1.1',device_platform:'android',manufacturer:'Google',device_type:'Pixel 6',device_brand:'google',os_version:'13',channel:'tengxun',raw_channel:'tengxun',device_id:this.identity.deviceId,uuid:this.identity.uuid,personalized_recommend_status:'0',support_h265:'0',font_scale:'1.0','user-agent':'okhttp/4.10.0','content-type':'application/json'};}
    async send(url,method,body,token){const headers=this.headers();if(token)headers.Authorization=token;
      const options={url,method,headers,base64Data:true,timeout:20};if(body!==undefined)options.data=body;
      const r=await this.widget.http.request(options),status=Number(r?.statusCode??r?.status??200);
      if(status===401)return {unauthorized:true};
      if(status<200||status>=300)throw Error('星芽接口 HTTP '+status);
      if(typeof r.data!=='string')throw Error('星芽响应编码无效');
      let json;try{json=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(r.data),c=>c.charCodeAt(0))));}catch{throw Error('星芽接口响应无效');}
      if(String(json.code)==='1040401'||String(json.code).toLowerCase()==='unauthorized')return {unauthorized:true};
      if(json.code!=='ok')throw Error('星芽接口请求失败（'+String(json.code??'unknown')+'）');
      return {data:json.data};
    }
    async login(){await this.init();if(!this.loggingIn)this.loggingIn=(async()=>{
      const d=this.identity,body={device:d.deviceId,package_name:'com.jz.xydj',android_id:d.deviceId,install_first_open:true,first_install_time:d.createdAt,last_update_time:d.createdAt,report_link_url:'',authorization:'',timestamp:Date.now()};
      const result=await this.send(LOGIN,'POST',aesEcbEncrypt(JSON.stringify(body)));
      if(result.unauthorized||!result.data?.token)throw Error('星芽游客会话建立失败');
      this.token=result.data.token;
      try{await this.widget.storage?.set?.('xingya:guest:v1',JSON.stringify({...d,token:this.token}));}catch{}
      return this.token;
    })().finally(()=>{this.loggingIn=null;});return this.loggingIn;}
    async request(path,params={},method='GET'){
      await this.init();if(!this.token)await this.login();
      const query=Object.entries(params).map(([k,v])=>encodeURIComponent(k)+'='+encodeURIComponent(String(v))).join('&');
      const url=API+path+(method==='GET'&&query?'?'+query:'');
      const body=method==='POST'?JSON.stringify(params):undefined;
      let used=this.token,result=await this.send(url,method,body,used);
      if(result.unauthorized){if(this.token===used)await this.login();result=await this.send(url,method,body,this.token);}
      if(result.unauthorized)throw Error('星芽会话失效（401）');return result.data;
    }
  }
  let instance;const client=()=>instance||(instance=new XingyaClient(Widget));
  const pageNumber=value=>{const n=Number(value??1);if(!Number.isSafeInteger(n)||n<1||n>10000)throw Error('星芽页码无效');return n;};
  async function loadList(params={}){
    const category=validId(params.category??0),section=String(params.section??1);if(!['1','2','3','7'].includes(section))throw Error('星芽频道无效');
    const d=await client().request('/cloud/v2/theater/home_page',{theater_class_id:section,type:1,class2_ids:category,page_num:pageNumber(params.page),page_size:24});
    if(!Array.isArray(d?.list))throw Error('星芽列表格式无效');return cards(d.list.filter(x=>x.type==='Theater').map(x=>x.theater));
  }
  async function search(params={}){const keyword=String(params.keyword??params.query??'').trim();if(!keyword||pageNumber(params.page)>1)return [];
    const d=await client().request('/v3/search',{text:keyword},'POST');return cards(d?.theater?.search_data??[]);
  }
  async function loadRank(params={}){const rank=String(params.rank??1);if(!['1','2','3','5'].includes(rank))throw Error('星芽榜单无效');if(pageNumber(params.page)>1)return [];
    const d=await client().request('/cloud/v1/first_level_ranking/detail',{id:rank});return cards(d?.list);
  }
  function linkId(link){const match=typeof link==='string'&&/^xingya:\/\/theater\/(\d{1,24})$/.exec(link);if(!match)throw Error('星芽链接无效');return match[1];}
  async function theater(link){const id=linkId(link),data=await client().request('/v2/theater_parent/detail',{theater_parent_id:id});if(!data||isPremium(data))throw Error('星芽会员或付费剧集暂不提供');return data;}
  function episodes(data){if(!Array.isArray(data.theaters))throw Error('星芽未返回剧集列表');const seen=new Set();return data.theaters.filter(e=>{const n=Number(e.num);if(!Number.isSafeInteger(n)||n<1||seen.has(n))return false;seen.add(n);return true;}).sort((a,b)=>Number(a.num)-Number(b.num));}
  async function loadDetail(link){const id=linkId(link),d=await theater(link),item=card({...d,id});item.playerType='app';item.episodeItems=episodes(d).map(e=>({id:'xingya:'+id+':1:'+e.num,type:'url',mediaType:'tv',title:item.title,description:'第'+e.num+'集',coverUrl:item.coverUrl,posterPath:item.posterPath,backdropPath:item.backdropPath,episode:Number(e.num),episodeNumber:Number(e.num),season:1,seasonNumber:1,link:item.link,playerType:'app'}));if(!item.episodeItems.length)throw Error('星芽未返回剧集列表');return item;}
  async function loadResource(params={}){const selected=Number(params.episode??params.episodeNumber??1);linkId(params.link);if(!Number.isSafeInteger(selected)||selected<1)throw Error('星芽集数无效');
    const d=await theater(params.link),e=episodes(d).find(e=>Number(e.num)===selected),url=e?.son_video_url;
    if(typeof url!=='string'||!/^https?:\/\/[^\s]+$/.test(url))throw Error('星芽未返回可播放地址');
    return [{name:'星芽免费短剧',playerType:'app',url,headers:{},format:/\.m3u8(?:\?|$)/i.test(url)?'hls':'auto',title:clean(d.title),episode:selected}];
  }
  const genres=[['全部',0],['都市',4],['逆袭',7],['古装',5],['亲情',41],['现代言情',15],['重生',6],['虐恋',8],['玄幻',35],['穿越',17],['脑洞',32],['甜宠',33],['古代言情',37],['战神',24],['历史',40],['赘婿',26],['萌宝',9],['神医',25]];
  const WidgetMetadata={id:'forward.xingya.short-drama',title:'星芽免费短剧',version:'1.0.1',requiredVersion:'0.0.1',author:'balge',site:'',detailCacheDuration:120,description:'星芽短剧的分类、搜索和播放。',modules:[
    {id:'discover',title:'剧场',functionName:'loadList',cacheDuration:120,params:[{name:'page',title:'页码',type:'page'},{name:'category',title:'题材',type:'enumeration',value:'0',enumOptions:genres.map(([title,value])=>({title,value:String(value)}))}]},
    {id:'ranking',title:'榜单',functionName:'loadRank',cacheDuration:120,params:[{name:'page',title:'页码',type:'page'},{name:'rank',title:'榜单',type:'enumeration',value:'1',enumOptions:[{title:'实时热榜',value:'1'},{title:'口碑榜',value:'5'},{title:'热搜榜',value:'2'},{title:'新剧榜',value:'3'}]}]},
    {id:'search',title:'搜索',functionName:'search',cacheDuration:60,params:[{name:'keyword',title:'关键词',type:'input'},{name:'page',title:'页码',type:'page'}]},
    {id:'loadResource',title:'播放资源',functionName:'loadResource',type:'stream',cacheDuration:0,params:[]}
  ],search:{title:'搜索',functionName:'search',params:[{name:'keyword',title:'关键词',type:'input'},{name:'page',title:'页码',type:'page'}]}};
  Object.assign(globalThis,{WidgetMetadata,loadList,loadRank,search,loadDetail,loadResource,XingyaClient,aesEcbEncrypt});
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
  var NAME = "星芽免费短剧";
  var META = (typeof WidgetMetadata !== 'undefined') ? WidgetMetadata : {};
  function pid(row) { return String(row.id || '').replace(/^xingya:/, ''); }
  function linkOf(id) { return 'xingya://theater/' + id; }
  function fixUrl(url) { return url.replace(/^http:\/\//, 'https://'); }
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
