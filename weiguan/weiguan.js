// @nshort {"id":"weiguan","name":"围观短剧","version":"1.0.1","hosts":["*.9ddm.com"]}
/*! 围观短剧 — ported from the Rex module of the same source. */
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
/*! 围观短剧独立模块；会话密钥仅保存在内存中，请勿记录。 */
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

  const utf8=s=>new TextEncoder().encode(String(s)),text=b=>new TextDecoder().decode(b);
  const base64=b=>btoa(Array.from(b,x=>String.fromCharCode(x)).join(''));
  const unbase64=s=>{if(typeof s!=='string'||s.length%4||!/^[A-Za-z0-9+/]*={0,2}$/.test(s))throw Error('围观编码无效');return Uint8Array.from(atob(s),c=>c.charCodeAt(0));};
  const hex=b=>Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');
  const fromHex=s=>Uint8Array.from(s.match(/../g)||[],x=>parseInt(x,16));
  const concat=(...rows)=>{const out=new Uint8Array(rows.reduce((n,x)=>n+x.length,0));let pos=0;for(const r of rows){out.set(r,pos);pos+=r.length;}return out;};
  const big=b=>BigInt('0x'+hex(b)),bytes=(n,size)=>fromHex(n.toString(16).padStart(size*2,'0'));
  // Match the existing JSC device identity fallback when WebCrypto is unavailable.
  function randomBytes(n){const b=new Uint8Array(n);if(globalThis.crypto?.getRandomValues)return globalThis.crypto.getRandomValues(b);for(let i=0;i<n;i++)b[i]=Math.floor(Math.random()*256);return b;}
  const nonce=()=>hex(randomBytes(16));
  const P=0xffffffff00000001000000000000000000000000ffffffffffffffffffffffffn;
  const N=0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n;
  const G=[0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296n,0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5n];
  const B=0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604bn;
  const EC_HEADER=fromHex('3059301306072a8648ce3d020106082a8648ce3d03010703420004');
  const mod=(x,m=P)=>(x%m+m)%m;
  function inverse(a){let low=mod(a),high=P,x=1n,y=0n;if(!low)throw Error('围观曲线点无效');while(low>1n){const q=high/low;[low,high]=[high-low*q,low];[x,y]=[y-x*q,x];}return mod(x);}
  function ecAdd(a,b){if(!a)return b;if(!b)return a;const[x,y]=a,[u,v]=b;if(x===u&&mod(y+v)===0n)return null;const slope=x===u?mod((3n*x*x-3n)*inverse(2n*y)):mod((v-y)*inverse(u-x));const z=mod(slope*slope-x-u);return[z,mod(slope*(x-z)-y)];}
  function ecMul(s,p){if(s<=0n||s>=N)throw Error('围观临时私钥无效');let out=null;while(s){if(s&1n)out=ecAdd(out,p);p=ecAdd(p,p);s>>=1n;}if(!out)throw Error('围观曲线点无效');return out;}
  function parsePoint(encoded){const raw=unbase64(encoded);if(raw.length!==91||hex(raw.slice(0,27))!==hex(EC_HEADER))throw Error('围观服务公钥无效');const x=big(raw.slice(27,59)),y=big(raw.slice(59));if(x>=P||y>=P||mod(y*y-x*x*x+3n*x-B)!==0n)throw Error('围观服务曲线点无效');return[x,y];}
  function ecPublic(privateHex){const[x,y]=ecMul(BigInt('0x'+privateHex),G);return base64(concat(EC_HEADER,bytes(x,32),bytes(y,32)));}
  function ecSecret(privateHex,peer){const[x]=ecMul(BigInt('0x'+privateHex),parsePoint(peer));return base64(bytes(x,32));}
  function der(raw,offset=0){const tag=raw[offset++];let len=raw[offset++];if(len&128){let n=len&127;len=0;while(n--)len=len*256+raw[offset++];}if(!Number.isSafeInteger(len)||offset+len>raw.length)throw Error('围观 RSA 公钥无效');return{tag,start:offset,end:offset+len};}
  function rsaWrap(value,key){const raw=unbase64(key.replace(/-----[^-]+-----|\s/g,'')),seq=der(raw),alg=der(raw,seq.start),bit=der(raw,alg.end),inner=der(raw,bit.start+1),m=der(raw,inner.start),e=der(raw,m.end);if(seq.tag!==48||bit.tag!==3||m.tag!==2||e.tag!==2)throw Error('围观 RSA 公钥无效');let mb=raw.slice(m.start,m.end);if(mb[0]===0)mb=mb.slice(1);const k=mb.length,payload=utf8(value);if(k<128||payload.length>k-11)throw Error('围观 RSA 数据长度无效');const padded=new Uint8Array(k);padded[1]=2;for(let i=2;i<k-payload.length-1;i++){let r=0;while(!r)r=randomBytes(1)[0];padded[i]=r;}padded.set(payload,k-payload.length);const modulus=big(mb);let b=big(padded),exponent=big(raw.slice(e.start,e.end)),result=1n;while(exponent){if(exponent&1n)result=result*b%modulus;b=b*b%modulus;exponent>>=1n;}return base64(bytes(result,k));}
  const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  function sha256(input){const b=new Uint8Array(Math.ceil((input.length+9)/64)*64);b.set(input);b[input.length]=128;const view=new DataView(b.buffer);view.setUint32(b.length-8,Math.floor(input.length/0x20000000));view.setUint32(b.length-4,input.length*8);const h=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19],w=new Uint32Array(64),rr=(x,n)=>x>>>n|x<<(32-n);
    for(let offset=0;offset<b.length;offset+=64){for(let i=0;i<16;i++)w[i]=view.getUint32(offset+i*4);for(let i=16;i<64;i++){const a=w[i-15],z=w[i-2];w[i]=(rr(a,7)^rr(a,18)^a>>>3)+w[i-16]+(rr(z,17)^rr(z,19)^z>>>10)+w[i-7];}let[a,c,d,e,f,g,j,k]=h;for(let i=0;i<64;i++){const t=(k+(rr(f,6)^rr(f,11)^rr(f,25))+(f&g^~f&j)+K[i]+w[i])|0,u=((rr(a,2)^rr(a,13)^rr(a,22))+(a&c^a&d^c&d))|0;[a,c,d,e,f,g,j,k]=[(t+u)|0,a,c,d,(e+t)|0,f,g,j];}const v=[a,c,d,e,f,g,j,k];for(let i=0;i<8;i++)h[i]=(h[i]+v[i])|0;}const out=new Uint8Array(32),dv=new DataView(out.buffer);h.forEach((v,i)=>dv.setUint32(i*4,v));return out;
  }
  function hmac(key,message){let k=utf8(key);if(k.length>64)k=sha256(k);const inner=new Uint8Array(64).fill(54),outer=new Uint8Array(64).fill(92);k.forEach((v,i)=>{inner[i]^=v;outer[i]^=v;});return hex(sha256(concat(outer,sha256(concat(inner,utf8(message))))));}
  function mul(a,b){let n=0;for(;b;b>>>=1,a=(a<<1)^((a&128)?283:0))if(b&1)n^=a;return n&255;}
  const S=Array.from({length:256},(_,x)=>{let y=0;if(x){y=1;for(let i=0;i<254;i++)y=mul(y,x);}let s=y;for(let i=1;i<5;i++)s^=(y<<i)|(y>>>(8-i));return(s^99)&255;}),IS=[];S.forEach((v,i)=>IS[v]=i);
  function decryptPlay(envelope,key){const raw=unbase64(envelope),keyBytes=unbase64(key);if(![16,24,32].includes(keyBytes.length)||raw.length<32||raw.length%16)throw Error('围观播放密文无效');const nk=keyBytes.length,rounds=nk/4+6,schedule=Array.from(keyBytes);let rc=1;for(let i=nk;i<(rounds+1)*16;i+=4){let t=schedule.slice(i-4,i);if(i%nk===0){t.push(t.shift());t=t.map(v=>S[v]);t[0]^=rc;rc=mul(rc,2);}else if(nk===32&&i%nk===16)t=t.map(v=>S[v]);for(let j=0;j<4;j++)schedule[i+j]=schedule[i+j-nk]^t[j];}
    const out=new Uint8Array(raw.length-16);for(let offset=16;offset<raw.length;offset+=16){let s=Array.from(raw.slice(offset,offset+16));const add=r=>s=s.map((v,i)=>v^schedule[r*16+i]);add(rounds);for(let r=rounds-1;r>=0;r--){const previous=s.slice();for(let c=0;c<4;c++)for(let row=0;row<4;row++)s[4*c+row]=IS[previous[4*((c+4-row)%4)+row]];add(r);if(r)for(let c=0;c<4;c++){let i=4*c,a=s.slice(i,i+4),m=[14,11,13,9];for(let row=0;row<4;row++)s[i+row]=a.reduce((n,v,j)=>n^mul(v,m[(j-row+4)%4]),0);}}out.set(s.map((v,i)=>v^raw[offset-16+i]),offset-16);}const pad=out[out.length-1];if(pad<1||pad>16||!out.slice(-pad).every(v=>v===pad))throw Error('围观播放密文填充无效');return JSON.parse(text(out.slice(0,-pad)));
  }
  const API='https://api.drama.9ddm.com/drama/',SITE='https://h5.drama.9ddm.com';
  const pageNumber=x=>{const n=Number(x??1);if(!Number.isSafeInteger(n)||n<1||n>10000)throw Error('围观页码无效');return n;};
  const validId=x=>{const s=String(x??'');if(!/^\d{1,24}$/.test(s))throw Error('围观剧集 ID 无效');return s;};
  const linkId=link=>{const m=typeof link==='string'&&/^weiguan:\/\/drama\/(\d{1,24})$/.exec(link);if(!m)throw Error('围观链接无效');return m[1];};
  const clean=x=>String(x??'').replace(/<[^>]*>/g,'').trim();
  const query=obj=>new URLSearchParams(obj).toString();
  class WeiguanClient {
    constructor(widget){this.widget=widget;this.deviceId='';this.identityPromise=null;this.session=null;this.sessionPromise=null;}
    async init(){if(!this.identityPromise)this.identityPromise=(async()=>{let id;try{id=await this.widget.storage?.get?.('weiguan:device:v1');}catch{}if(typeof id!=='string'||!/^device_[a-z0-9_]{10,100}$/.test(id))id='device_'+Date.now()+'_'+nonce();this.deviceId=id;try{await this.widget.storage?.set?.('weiguan:device:v1',id);}catch{}})();await this.identityPromise;}
    async raw(path,params={},body,headers={}){const opt={url:API+path+'?'+query(params),method:body===undefined?'GET':'POST',timeout:25,base64Data:true,headers:{'Content-Type':typeof body==='string'?'application/x-www-form-urlencoded; charset=utf-8':'application/json; charset=utf-8','User-Agent':'okhttp/5.1.0',...headers}};if(body!==undefined)opt.data=typeof body==='string'?body:JSON.stringify(body);const r=await this.widget.http.request(opt),status=Number(r?.statusCode??r?.status??200);if(status<200||status>=300){const error=Error('围观接口 HTTP '+status);error.status=status;throw error;}let d;try{d=JSON.parse(text(unbase64(r.data)));}catch{throw Error('围观接口数据无效');}if(Number(d?.code)!==200){if(Number(d?.code)===1005)throw Error('围观该集需要购买，暂不提供付费播放');const error=Error('围观接口请求失败（'+String(d?.code??'unknown')+'）');error.status=Number(d?.code);throw error;}return d;}
    common(){return{os_type:'1',clientInfo:this.deviceId,version_code:'2831',version_name:'2.8.31'};}
    async ensureSession(){await this.init();if(this.session)return this.session;if(!this.sessionPromise)this.sessionPromise=(async()=>{const config=await this.raw('config/indexV2',this.common(),{userId:0,deviceId:this.deviceId,cpu:'arm64-v8a',memory:4,coldStartCount:1,hasPlayRecord:false});const key=config?.data?.cs;if(typeof key!=='string'||!key)throw Error('围观未返回当前公钥');let secret;do{secret=hex(randomBytes(32));}while(BigInt('0x'+secret)===0n||BigInt('0x'+secret)>=N);const publicKey=ecPublic(secret),params={...this.common(),nonce:nonce(),timestamp:String(Date.now()),deviceId:this.deviceId,deviceName:'sdk_gphone64_arm64',osType:'1'};// Rex normalizes %2B in URLs to +; keep RSA base64 in the form body.
const form=query({encryptedClientPublicKey:rsaWrap(publicKey,key)}),d=await this.raw('session/create',params,form),s=d?.data;if(!s?.sessionId||!s.serverEphemeralPublicKey)throw Error('围观游客会话建立失败');const shared=ecSecret(secret,s.serverEphemeralPublicKey);secret='';this.session={id:s.sessionId,key:shared};return this.session;})().finally(()=>this.sessionPromise=null);return this.sessionPromise;}
    async request(path,body){for(let attempt=0;attempt<2;attempt++){const session=await this.ensureSession(),params=this.common(),timestamp=String(Date.now()),salt=nonce(),merged={...params,...body};const message=Object.keys(merged).sort().map(k=>k+String(merged[k])).join('')+timestamp+salt;try{return await this.raw(path,params,body,{'X-Session-Id':session.id,'X-Timestamp':timestamp,'X-Nonce':salt,'X-Sign':hmac(session.key,message)});}catch(error){if(attempt||error.status!==403)throw error;if(this.session===session)this.session=null;}}}
    async detail(id,episode=1){await this.init();const d=await this.raw('play/h5/detail',{os_type:'2',deviceId:this.deviceId,oneId:id,playOrder:String(episode)});const info=d.data;if(!info||String(info.oneId)!==id||!Number.isSafeInteger(Number(info.episodeCount))||Number(info.episodeCount)<1||Number(info.episodeCount)>10000)throw Error('围观详情或集数无效');return info;}
  }
  let instance;const client=()=>instance||(instance=new WeiguanClient(Widget));
  function card(x){const id=validId(x.oneId),cover=x.vertPoster||x.horzPoster||'';return{id:'weiguan:'+id,type:'url',mediaType:'tv',title:clean(x.title)||'围观短剧',description:clean(x.description),coverUrl:cover,posterPath:cover,backdropPath:cover,remark:x.episodeCount?'全'+x.episodeCount+'集':'',link:'weiguan://drama/'+id};}
  async function list(params,keyword){const body={audience:keyword?'':String(params.audience||'全部'),order:keyword?'':String(params.order||'最新'),page:pageNumber(params.page),pageSize:30,searchWord:keyword,subject:String(params.category||''),shortPlayType:String(params.shortPlayType||''),episodeCount:''};const d=await client().request('home/searchV2',body);if(!Array.isArray(d.data))throw Error('围观列表数据无效');const seen=new Set();return d.data.filter(x=>x&&/^\d{1,24}$/.test(String(x.oneId))&&!seen.has(String(x.oneId))&&seen.add(String(x.oneId))).map(card);}
  async function loadList(params={}){return list(params,'');}
  async function search(params={}){const word=String(params.keyword??params.query??'').trim();return word?list(params,word):[];}
  async function loadDetail(link){const id=linkId(link),d=await client().detail(id),item=card(d);item.playerType='app';item.episodeItems=Array.from({length:Number(d.episodeCount)},(_,i)=>({id:'weiguan:'+id+':1:'+(i+1),type:'url',mediaType:'tv',title:item.title,description:'第'+(i+1)+'集',coverUrl:item.coverUrl,posterPath:item.posterPath,backdropPath:item.backdropPath,episode:i+1,episodeNumber:i+1,season:1,seasonNumber:1,link:item.link,playerType:'app'}));return item;}
  async function loadResource(params={}){const id=linkId(params.link),episode=Number(params.episode??params.episodeNumber??1);if(!Number.isSafeInteger(episode)||episode<1)throw Error('围观集数无效');const d=await client().detail(id,episode);if(episode>Number(d.episodeCount))throw Error('围观集数不存在');if(!d.h5PlayUrl||!d.h5PlayKey)throw Error('围观未返回免费播放地址');const media=decryptPlay(d.h5PlayUrl,d.h5PlayKey),rows=[['超清',media.super],['高清',media.high],['标清',media.normal]],seen=new Set();const out=rows.filter(([,url])=>typeof url==='string'&&/^https?:\/\/[^\s]+$/.test(url)&&!seen.has(url)&&seen.add(url)).map(([quality,url])=>({name:'围观短剧 '+quality,playerType:'app',url,headers:{},format:/\.m3u8(?:\?|$)/i.test(url)?'hls':'auto',title:clean(d.title),episode}));if(!out.length)throw Error('围观播放地址无效');return out;}
  const genres=['逆袭','都市','家庭','古装','复仇','正能量','穿越','爱情','重生','奇幻','甜宠','乡村','虐恋','悬疑','职场','年代','异能','总裁','修仙','战神','萌宝','神豪','宫廷','喜剧','青春','科幻','神医','武侠','赘婿'];
  const enumeration=(name,title,values,value='')=>({name,title,type:'enumeration',value,enumOptions:values.map(x=>typeof x==='string'?{title:x,value:x}:x)});
  const WidgetMetadata={id:'forward.weiguan.short-drama',title:'围观短剧',version:'1.0.0',requiredVersion:'0.0.1',author:'balge',site:SITE,description:'围观短剧的分类、搜索和播放。',detailCacheDuration:120,modules:[{id:'discover',title:'剧库',functionName:'loadList',cacheDuration:120,params:[{name:'page',title:'页码',type:'page'},enumeration('category','题材',[{title:'全部',value:''},...genres]),enumeration('audience','受众',['全部','男频','女频'],'全部'),enumeration('shortPlayType','剧种',[{title:'全部',value:''},'真人剧','AI剧','漫剧']),enumeration('order','排序',['最新','最热','首发','最多收藏','7天内上新'],'最新')]},{id:'search',title:'搜索',functionName:'search',cacheDuration:60,params:[{name:'keyword',title:'关键词',type:'input'},{name:'page',title:'页码',type:'page'}]},{id:'loadResource',title:'播放资源',functionName:'loadResource',type:'stream',cacheDuration:0,params:[]}],search:{title:'搜索',functionName:'search',params:[{name:'keyword',title:'关键词',type:'input'},{name:'page',title:'页码',type:'page'}]}};
  Object.assign(globalThis,{WidgetMetadata,WeiguanClient,WeiguanCrypto:{ecPublic,ecSecret,rsaWrap,hmac,decryptPlay},loadList,search,loadDetail,loadResource});
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
  var NAME = "围观短剧";
  var META = (typeof WidgetMetadata !== 'undefined') ? WidgetMetadata : {};
  function pid(row) { return String(row.id || '').replace(/^weiguan:/, ''); }
  function linkOf(id) { return 'weiguan://drama/' + id; }
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
