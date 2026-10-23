// @nshort {"id":"qimao","name":"七猫短剧","version":"1.0.1","hosts":["*.qmplaylet.com","*.wtzw.com"]}
/*! 七猫短剧 — ported from the Rex module of the same source. */
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
/*! 七猫短剧独立 Rex 模块；接口签名材料属于模块私密配置，请勿输出到日志。 */
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
  const API_STORE = "https://api-store.qmplaylet.com";
  const API_READ = "https://api-read.qmplaylet.com";
  const SIGN_KEY_BYTES=Uint8Array.from([100,51,100,71,105,74,99,54,53,49,103,83,81,56,119,49]);
  const APP_VERSION = "11900";
  const APP_ID = "com.duoduo.read";

  function md5Bytes(bytes) {
    const bitLength = bytes.length * 8;
    const size = ((bytes.length + 8 >>> 6) + 1) * 64;
    const data = new Uint8Array(size);
    data.set(bytes); data[bytes.length] = 128;
    const view = new DataView(data.buffer);
    view.setUint32(size - 8, bitLength >>> 0, true);
    view.setUint32(size - 4, Math.floor(bitLength / 4294967296), true);
    let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
    const shifts = [7,12,17,22,5,9,14,20,4,11,16,23,6,10,15,21];
    const k = Array.from({length:64}, (_,i) => Math.floor(Math.abs(Math.sin(i+1))*4294967296) >>> 0);
    const rol = (x,n) => (x << n | x >>> (32-n)) >>> 0;
    for (let off=0; off<size; off+=64) {
      const m=Array.from({length:16},(_,i)=>view.getUint32(off+i*4,true));
      let a=a0,b=b0,c=c0,d=d0;
      for(let i=0;i<64;i++){
        let f,g;
        if(i<16){f=b&c|~b&d;g=i;}
        else if(i<32){f=d&b|~d&c;g=(5*i+1)&15;}
        else if(i<48){f=b^c^d;g=(3*i+5)&15;}
        else{f=c^(b|~d);g=(7*i)&15;}
        const sum=(a+f+k[i]+m[g])>>>0;
        [a,d,c,b]=[d,c,b,(b+rol(sum,shifts[(i>>>4)*4+(i&3)]))>>>0];
      }
      a0=(a0+a)>>>0;b0=(b0+b)>>>0;c0=(c0+c)>>>0;d0=(d0+d)>>>0;
    }
    return [a0,b0,c0,d0].map(n=>[0,1,2,3].map(i=>((n >>> (i*8))&255).toString(16).padStart(2,"0")).join("")).join("");
  }
  function signText(text) {
    const source=new TextEncoder().encode(String(text));
    const bytes=new Uint8Array(source.length+SIGN_KEY_BYTES.length);
    bytes.set(source);bytes.set(SIGN_KEY_BYTES,source.length);
    return md5Bytes(bytes);
  }
  function signParams(params) {
    const canonical=Object.keys(params).filter(k=>k!=="sign").sort().map(k=>k+"="+String(params[k] ?? "")).join("");
    return signText(canonical);
  }
  function signHeaders(qmParams) {
    return signParams({AUTHORIZATION:"","app-version":APP_VERSION,"application-id":APP_ID,channel:"va-tengxun_lf","is-white":"","net-env":"1",platform:"android","qm-params":qmParams,reg:""});
  }
  function base64Utf8(text) {
    const bytes=new TextEncoder().encode(text);
    let binary="";for(const b of bytes)binary+=String.fromCharCode(b);
    return btoa(binary);
  }
  function encodeQmParams() {
    const raw=base64Utf8(JSON.stringify({version_code:APP_VERSION,device_model:"Rex",os:"Android",brand:"generic"}));
    const from="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const to="9saI0oy_HGitgNA8Fk3hfRqC4p mBOuc6Kx5T-2zSZ1VvjQ7DwnLe".replace(/ /g,"")+"MUlErYWbdJ";
    const map=Object.fromEntries(Array.from(from,(c,i)=>[c,to[i]]));
    return Array.from(raw,c=>map[c] ?? c).join("");
  }
  function validId(value) {
    const id=String(value ?? "");
    if(!/^\d{1,24}$/.test(id))throw new Error("七猫剧集 ID 无效");
    return id;
  }
  function records(payload) {
    const root=payload?.data ?? payload;
    const list=root?.list ?? root?.play_list ?? [];
    if(!Array.isArray(list))throw new Error("七猫列表格式无效");
    return list;
  }
  function plainText(value) {
    return String(value ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").trim();
  }
  function chineseNumber(value) {
    if (/^\d+$/.test(value)) return Number(value);
    const digits={零:0,〇:0,一:1,二:2,两:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9};
    if (value === "十") return 10;
    if (value.includes("十")) {
      const [tens,ones]=value.split("十");
      return (tens ? digits[tens] : 1)*10+(ones ? digits[ones] : 0);
    }
    return [...value].reduce((n,char)=>n*10+(digits[char] ?? NaN),0);
  }
  function seasonTitle(value) {
    const title=plainText(value);
    const match=/^(.*?)\s*第\s*([0-9]{1,2}|[零〇一二两三四五六七八九十]{1,3})\s*(季|部|番)$/.exec(title);
    if(!match)return null;
    const season=chineseNumber(match[2]);
    if(!Number.isSafeInteger(season)||season<1||season>99)return null;
    return {base:match[1].trim(),number:season,suffix:match[3],title};
  }
  function card(item) {
    const id=validId(item.playlet_id ?? item.id);
    const cover=item.image_link ?? item.cover ?? "";
    return {id:"qimao:"+id,type:"url",mediaType:"tv",title:plainText(item.title ?? "七猫短剧"),coverUrl:cover,posterPath:cover,backdropPath:cover,description:String(item.intro ?? item.sub_title ?? ""),remark:item.total_episode_num ? "全"+item.total_episode_num+"集" : "",link:"qimao://playlet/"+id};
  }
  class QimaoClient {
    constructor(widget) { this.widget=widget; }
    async request(host,path,params={},method="GET",body="") {
      const query={...params};
      const signature=signParams(query);
      const timestamp=String(Math.floor(Date.now()/1000));
      const qmParams=encodeQmParams();
      const headers={authorization:"","application-id":APP_ID,platform:"android","app-version":APP_VERSION,channel:"va-tengxun_lf",reg:"","is-white":"","net-env":"1","no-permiss":"3","qm-params":qmParams,sign:signHeaders(qmParams),"content-type":"application/x-www-form-urlencoded"};
      const signedQuery={...query,sign:signature};
      let url=host+path;
      if(method==="GET")url+="?"+new URLSearchParams(signedQuery).toString();
      else body=new URLSearchParams(signedQuery).toString();
      const options={url,method,headers,base64Data:true,timeout:15};
      if(method!=="GET")options.data=body;
      const response=await this.widget.http.request(options);
      const status=Number(response?.statusCode ?? response?.status ?? 200);
      if(status<200||status>=300)throw new Error("七猫接口 HTTP "+status);
      if(typeof response.data!=="string")throw new Error("七猫接口响应编码无效");
      const text=new TextDecoder().decode(Uint8Array.from(atob(response.data),c=>c.charCodeAt(0)));
      const json=JSON.parse(text);
      if(json.code!=null&&Number(json.code)!==0)throw new Error(String(json.message ?? "七猫接口请求失败"));
      return json.data ?? json;
    }
  }
  async function client() {
    if(!globalThis.__qimaoClient)globalThis.__qimaoClient=new QimaoClient(Widget);
    return globalThis.__qimaoClient;
  }
  async function discover(params={}) {
    const page=Math.max(1,Number(params.page)||1);
    const form={exposure_playlet_ids:"",is_new_user:"1",preference:String(params.category ?? params.rank ?? "")};
    const api=await client();
    const cacheKey="qimao:discover:cursor:"+form.preference+":"+page;
    let nextId=params.cursor||"";
    if(page>1&&!nextId)try{nextId=String(await Widget.storage?.get?.(cacheKey)||"");}catch{}
    let data;
    for(let current=page>1&&!nextId?1:page;current<=page;current++){
      const request={...form};if(nextId)request.next_id=nextId;
      data=await api.request(API_STORE,"/api/v1/playlet/discover",request,"POST");
      nextId=String(data.next_id ?? "");
      if(nextId)try{await Widget.storage?.set?.("qimao:discover:cursor:"+form.preference+":"+(current+1),nextId);}catch{}
    }
    return records(data).map(card);
  }
  async function loadList(params={}) { return discover(params); }
  async function loadTaggedList(params={}) {
    const tagId=String(params.tag_id ?? params.category ?? params.rank ?? "0");
    if(!/^(?:-1|\d{1,12})$/.test(tagId))throw new Error("七猫分类/榜单 ID 无效");
    const page=Math.max(1,Number(params.page)||1),title=String(params.tag_title ?? tagId),key="qimao:index:cursor:"+tagId+":"+page;
    const api=await client();let nextId=params.cursor||"";
    if(page>1&&!nextId)try{nextId=String(await Widget.storage?.get?.(key)||"");}catch{}
    let data;
    for(let current=page>1&&!nextId?1:page;current<=page;current++){
      const body={tag_id:tagId,next_id:nextId,slot_id:String(params.slot_id ?? ""),playlet_privacy:"1",preference:"",latest_play_over:"",operation:"0"};
      data=await api.request(API_STORE,"/api/v1/playlet/index",body,"POST");
      nextId=String(data.next_id ?? "");
      if(nextId)try{await Widget.storage?.set?.("qimao:index:cursor:"+tagId+":"+(current+1),nextId);}catch{}
    }
    const list=Array.isArray(data.list)?data.list:[];
    return list.map(card);
  }
  async function search(params={}) {
    const keyword=String(params.keyword ?? params.query ?? "").trim();if(!keyword)return [];
    const api=await client();
    const data=await api.request(API_STORE,"/api/v1/playlet/search",{extend:"",page:String(Math.max(1,Number(params.page)||1)),playlet_privacy:"1",wd:keyword,read_preference:"",track_id:""});
    return records(data).map(card);
  }
  async function loadDetail(link) {
    const match=typeof link==="string"&&/^qimao:\/\/playlet\/(\d{1,24})$/.exec(link);
    if(!match)throw new Error("七猫详情链接无效");
    const id=validId(match[1]),api=await client();
    const [detail,player]=await Promise.all([
      api.request(API_STORE,"/api/v1/playlet/detail",{playlet_id:id}),
      api.request(API_READ,"/player/api/v1/playlet/info",{playlet_id:id,is_material:"0"})
    ]);
    const episodes=Array.isArray(player.play_list)?player.play_list:[];
    if(!episodes.length)throw new Error("七猫未返回剧集列表");
    const title=plainText(detail.title ?? player.title ?? "七猫短剧"),parsedSeason=seasonTitle(title);
    let seasons=[];
    if(parsedSeason?.base) {
      try {
        const result=await api.request(API_STORE,"/api/v1/playlet/search",{extend:"",page:"1",playlet_privacy:"1",wd:parsedSeason.base,read_preference:"",track_id:""});
        seasons=records(result).map(item=>({item,parsed:seasonTitle(item.title)}).parsed?{item,parsed:seasonTitle(item.title)}:null)
          .filter(entry=>entry&&entry.parsed.base===parsedSeason.base)
          .map(({item,parsed})=>({id:validId(item.playlet_id ?? item.id),title:parsed.title,number:parsed.number,suffix:parsed.suffix,cover:item.image_link ?? item.cover ?? "",description:plainText(item.intro ?? item.sub_title ?? "")}));
      } catch {}
      if(!seasons.some(season=>season.id===id))seasons.push({id,title,number:parsedSeason.number,suffix:parsedSeason.suffix,cover:detail.image_link ?? "",description:plainText(detail.intro ?? "")});
      seasons=Array.from(new Map(seasons.map(season=>[season.id,season])).values()).sort((a,b)=>a.number-b.number);
    }
    const cover=detail.image_link || detail.cover || player.image_link || player.cover || "";
    const result={id:"qimao:"+id,type:"url",mediaType:"tv",title,coverUrl:cover,posterPath:cover,backdropPath:cover,description:plainText(detail.intro ?? player.intro ?? ""),link:"qimao://playlet/"+id,episodeItems:episodes.map((ep,index)=>({id:"qimao:"+id+":"+(parsedSeason?.number ?? 1)+":"+(ep.sort ?? index+1),type:"url",mediaType:"tv",title,description:"第"+String(ep.sort ?? index+1)+"集",coverUrl:cover,posterPath:cover,backdropPath:cover,episode:Number(ep.sort)||index+1,episodeNumber:Number(ep.sort)||index+1,season:parsedSeason?.number ?? 1,seasonNumber:parsedSeason?.number ?? 1,link:"qimao://playlet/"+id,playerType:"app"}))};
    if(seasons.length) {
      result.selectedSeasonNumber=parsedSeason.number;
      result.childItems=seasons.map(season=>({id:"qimao:"+season.id,type:"url",mediaType:"tv",title:"第"+season.number+season.suffix,description:season.description || season.title,coverUrl:season.cover || cover,posterPath:season.cover || cover,link:"qimao://playlet/"+season.id,season:season.number,seasonNumber:season.number,isSelected:season.id===id}));
    }
    result.playerType="app";
    return result;
  }
  async function loadResource(params={}) {
    const link=String(params.link ?? ""),match=/^qimao:\/\/playlet\/(\d{1,24})$/.exec(link);
    if(!match)throw new Error("七猫播放链接无效");
    const id=validId(match[1]),selected=Number(params.episode ?? params.episodeNumber ?? 1);
    if(!Number.isSafeInteger(selected)||selected<1)throw new Error("七猫集数无效");
    const api=await client(),data=await api.request(API_READ,"/player/api/v1/playlet/info",{playlet_id:id,is_material:"0"});
    const episodes=Array.isArray(data.play_list)?data.play_list:[];
    const episode=episodes.find((item,index)=>Number(item.sort)===selected||(!item.sort&&index+1===selected));
    const url=episode&&(episode.video_url||episode.video_h265_url);
    if(typeof url!=="string"||!/^https:\/\//.test(url))throw new Error("七猫未返回可播放地址");
    return [{name:"七猫短剧",playerType:"app",url,headers:{},format:/\.m3u8(?:\?|$)/i.test(url)?"hls":"auto",title:String(data.title ?? "七猫短剧"),episode:selected}];
  }
  const WidgetMetadata={id:"forward.qimao.short-drama",title:"七猫短剧",version:"1.0.3",requiredVersion:"0.0.1",author:"balge",site:"",detailCacheDuration:180,description:"七猫短剧的分类、搜索和播放。",modules:[
    {id:"discover",title:"发现",functionName:"loadList",cacheDuration:180,params:[{name:"page",title:"页码",type:"input",value:"1"}]},
    {"id":"tag_featured","title":"精选","functionName":"loadTaggedList","cacheDuration":180,"params":[{"name":"page","title":"页码","type":"page"},{"name":"tag_id","title":"精选","type":"enumeration","value":"0","enumOptions":[{"title":"推荐","value":"0"},{"title":"新剧","value":"-1"}]}]},
    {"id":"tag_background","title":"背景","functionName":"loadTaggedList","cacheDuration":180,"params":[{"name":"page","title":"页码","type":"page"},{"name":"tag_id","title":"背景","type":"enumeration","value":"1273","enumOptions":[{"title":"都市情感","value":"1273"},{"title":"都市","value":"571"},{"title":"古装","value":"1272"},{"title":"玄幻仙侠","value":"1286"},{"title":"年代","value":"572"},{"title":"奇幻","value":"570"},{"title":"乡村","value":"590"},{"title":"民国","value":"573"},{"title":"青春校园","value":"1288"},{"title":"末世","value":"556"},{"title":"武侠","value":"371"},{"title":"科幻","value":"594"}]}]},
    {"id":"tag_plot","title":"情节","functionName":"loadTaggedList","cacheDuration":180,"params":[{"name":"page","title":"页码","type":"page"},{"name":"tag_id","title":"情节","type":"enumeration","value":"400","enumOptions":[{"title":"逆袭","value":"400"},{"title":"复仇","value":"795"},{"title":"打脸虐渣","value":"716"},{"title":"家庭","value":"670"},{"title":"重生","value":"784"},{"title":"穿越","value":"373"},{"title":"追妻火葬场","value":"715"},{"title":"女性成长","value":"1294"},{"title":"闪婚","value":"480"},{"title":"马甲","value":"558"},{"title":"权谋","value":"790"},{"title":"强者回归","value":"402"},{"title":"系统","value":"787"},{"title":"职场","value":"724"},{"title":"商战","value":"723"},{"title":"伦理","value":"1293"},{"title":"宫斗","value":"343"},{"title":"致富","value":"492"},{"title":"宅斗","value":"342"},{"title":"高手下山","value":"1299"},{"title":"异能","value":"727"},{"title":"偷听心声","value":"1258"},{"title":"娱乐明星","value":"1295"},{"title":"脑洞","value":"526"},{"title":"替身","value":"712"},{"title":"穿书","value":"338"},{"title":"社会话题","value":"1290"},{"title":"种田经商","value":"1291"}]}]},
    {"id":"tag_role","title":"角色","functionName":"loadTaggedList","cacheDuration":180,"params":[{"name":"page","title":"页码","type":"page"},{"name":"tag_id","title":"角色","type":"enumeration","value":"624","enumOptions":[{"title":"豪门总裁","value":"624"},{"title":"战神","value":"527"},{"title":"真假千金","value":"812"},{"title":"赘婿","value":"36"},{"title":"神医","value":"1269"},{"title":"欢喜冤家","value":"464"},{"title":"小人物","value":"1296"},{"title":"神豪","value":"37"},{"title":"团宠","value":"545"},{"title":"银发","value":"1297"},{"title":"女帝","value":"617"},{"title":"兵王","value":"28"}]}]},
    {"id":"tag_style","title":"风格","functionName":"loadTaggedList","cacheDuration":180,"params":[{"name":"page","title":"页码","type":"page"},{"name":"tag_id","title":"风格","type":"enumeration","value":"16","enumOptions":[{"title":"虐恋","value":"16"},{"title":"甜宠","value":"21"},{"title":"搞笑","value":"793"},{"title":"悬疑","value":"27"},{"title":"灵异","value":"1287"}]}]},
    {"id":"tag_more_tags","title":"更多题材","functionName":"loadTaggedList","cacheDuration":180,"params":[{"name":"page","title":"页码","type":"page"},{"name":"tag_id","title":"更多题材","type":"enumeration","value":"1300","enumOptions":[{"title":"奔跑吧推荐","value":"1300"},{"title":"婚姻","value":"718"},{"title":"后悔流","value":"1202"},{"title":"女强","value":"708"},{"title":"扮猪吃虎","value":"799"},{"title":"先婚后爱","value":"524"},{"title":"古代","value":"576"},{"title":"金手指","value":"726"},{"title":"破镜重圆","value":"467"},{"title":"玄幻","value":"566"},{"title":"志怪","value":"1383"},{"title":"现代言情","value":"776"},{"title":"修仙","value":"671"},{"title":"架空历史","value":"577"},{"title":"古代言情","value":"777"},{"title":"暗恋","value":"719"},{"title":"大女主","value":"972"},{"title":"种田","value":"317"},{"title":"囤物资","value":"894"},{"title":"现实题材","value":"12"},{"title":"御兽","value":"423"},{"title":"异界","value":"568"},{"title":"丧尸","value":"732"},{"title":"双重生","value":"828"},{"title":"鉴宝","value":"47"},{"title":"通古今","value":"1203"},{"title":"爽文","value":"598"},{"title":"探险","value":"741"},{"title":"日常","value":"878"},{"title":"随身空间","value":"345"},{"title":"女总裁","value":"89"},{"title":"美食","value":"300"},{"title":"替嫁","value":"476"},{"title":"恐怖","value":"599"},{"title":"萌宠","value":"1249"},{"title":"治愈","value":"17"},{"title":"女扮男装","value":"706"},{"title":"废柴","value":"796"},{"title":"嫡女","value":"117"},{"title":"励志","value":"791"},{"title":"娱乐圈","value":"357"},{"title":"公主","value":"113"},{"title":"机甲","value":"733"},{"title":"契约婚姻","value":"355"},{"title":"轻松","value":"3"},{"title":"科技","value":"855"},{"title":"王妃","value":"107"},{"title":"草根崛起","value":"1223"},{"title":"玄学","value":"900"},{"title":"皇帝","value":"62"},{"title":"社会问题","value":"1317"},{"title":"正能量","value":"1298"},{"title":"校园","value":"575"},{"title":"神话","value":"756"},{"title":"热血","value":"1"},{"title":"太子","value":"128"},{"title":"青梅竹马","value":"465"},{"title":"多女主","value":"945"},{"title":"失忆","value":"1251"},{"title":"网游","value":"734"},{"title":"真假少爷","value":"1270"},{"title":"反派","value":"797"},{"title":"直播","value":"419"},{"title":"推理","value":"740"},{"title":"西游","value":"324"},{"title":"仙侠","value":"567"},{"title":"基建","value":"730"},{"title":"皇后","value":"106"},{"title":"都市脑洞","value":"883"},{"title":"医生","value":"156"},{"title":"庶女","value":"118"},{"title":"烧脑","value":"600"},{"title":"万物沟通","value":"1285"},{"title":"历史","value":"583"},{"title":"错嫁","value":"501"},{"title":"王爷","value":"125"},{"title":"摄政王","value":"610"},{"title":"洪荒","value":"559"},{"title":"远古","value":"578"},{"title":"HE","value":"709"},{"title":"盗墓","value":"327"},{"title":"大明","value":"586"},{"title":"龙","value":"444"},{"title":"吞噬","value":"530"},{"title":"兽世","value":"856"},{"title":"久别重逢","value":"1345"},{"title":"奶爸","value":"41"},{"title":"外卖员","value":"958"},{"title":"厨娘","value":"1241"},{"title":"锦鲤","value":"817"}]}]},
    {id:"search",title:"搜索",functionName:"search",cacheDuration:60,params:[{name:"keyword",title:"关键词",type:"input",value:""},{name:"page",title:"页码",type:"input",value:"1"}]},
    {id:"loadResource",title:"播放资源",functionName:"loadResource",type:"stream",cacheDuration:180,params:[]}
  ],search:{title:"搜索",functionName:"search",params:[{name:"keyword",title:"关键词",type:"input"},{name:"page",title:"页码",type:"page"}]}};
  async function loadSearchHints(params={}) {
    const api=await client();
    const data=await api.request(API_STORE,"/api/v1/playlet/search/hot-word",{tab:"playlet",book_privacy:"1",read_preference:""});
    const words=data.search_hot_tags?.hot_words ?? [];
    return words.map(item=>({title:String(item.word ?? item.title ?? item.content ?? ""),type:"url",link:"qimao://search/"+encodeURIComponent(String(item.word ?? item.title ?? item.content ?? ""))})).filter(item=>item.title);
  }
  Object.assign(globalThis,{QimaoClient,signParams,WidgetMetadata,loadList,loadTaggedList,search,loadSearchHints,loadDetail,loadResource});
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
  var NAME = "七猫短剧";
  var META = (typeof WidgetMetadata !== 'undefined') ? WidgetMetadata : {};
  function pid(row) { return String(row.id || '').replace(/^qimao:/, ''); }
  function linkOf(id) { return 'qimao://playlet/' + id; }
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
