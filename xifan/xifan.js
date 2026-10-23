// @nshort {"id":"xifan","name":"喜番短剧","version":"1.0.1","hosts":["tube.e.kuaishou.com","*.adukwai.com","*.kwaicdn.com"]}
/*! 喜番短剧 — ported from the Rex module of the same source. */
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
/*! 喜番纯 JavaScriptCore 核心；协议固定材料非用户凭据。 */
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
  const unbase64=s=>{if(typeof s!=='string'||s.length%4||!/^[A-Za-z0-9+/]*={0,2}$/.test(s))throw Error('喜番数据编码无效');return Uint8Array.from(atob(s),c=>c.charCodeAt(0));};
  const KEY=utf8('GWL8jXHLnzp63QDH');
  /* Bundled pako license (retained in every self-contained artifact):
(The MIT License)

Copyright (C) 2014-2017 by Vitaly Puzrin and Andrei Tuputcyn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
  */
  const pakoModule={exports:{}};
  (function(module,exports){
!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).pako=t()}}(function(){return function r(s,o,l){function h(e,t){if(!o[e]){if(!s[e]){var a="function"==typeof require&&require;if(!t&&a)return a(e,!0);if(d)return d(e,!0);var i=new Error("Cannot find module '"+e+"'");throw i.code="MODULE_NOT_FOUND",i}var n=o[e]={exports:{}};s[e][0].call(n.exports,function(t){return h(s[e][1][t]||t)},n,n.exports,r,s,o,l)}return o[e].exports}for(var d="function"==typeof require&&require,t=0;t<l.length;t++)h(l[t]);return h}({1:[function(t,e,a){"use strict";var s=t("./zlib/deflate"),o=t("./utils/common"),l=t("./utils/strings"),n=t("./zlib/messages"),r=t("./zlib/zstream"),h=Object.prototype.toString,d=0,f=-1,_=0,u=8;function c(t){if(!(this instanceof c))return new c(t);this.options=o.assign({level:f,method:u,chunkSize:16384,windowBits:15,memLevel:8,strategy:_,to:""},t||{});var e=this.options;e.raw&&0<e.windowBits?e.windowBits=-e.windowBits:e.gzip&&0<e.windowBits&&e.windowBits<16&&(e.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new r,this.strm.avail_out=0;var a=s.deflateInit2(this.strm,e.level,e.method,e.windowBits,e.memLevel,e.strategy);if(a!==d)throw new Error(n[a]);if(e.header&&s.deflateSetHeader(this.strm,e.header),e.dictionary){var i;if(i="string"==typeof e.dictionary?l.string2buf(e.dictionary):"[object ArrayBuffer]"===h.call(e.dictionary)?new Uint8Array(e.dictionary):e.dictionary,(a=s.deflateSetDictionary(this.strm,i))!==d)throw new Error(n[a]);this._dict_set=!0}}function i(t,e){var a=new c(e);if(a.push(t,!0),a.err)throw a.msg||n[a.err];return a.result}c.prototype.push=function(t,e){var a,i,n=this.strm,r=this.options.chunkSize;if(this.ended)return!1;i=e===~~e?e:!0===e?4:0,"string"==typeof t?n.input=l.string2buf(t):"[object ArrayBuffer]"===h.call(t)?n.input=new Uint8Array(t):n.input=t,n.next_in=0,n.avail_in=n.input.length;do{if(0===n.avail_out&&(n.output=new o.Buf8(r),n.next_out=0,n.avail_out=r),1!==(a=s.deflate(n,i))&&a!==d)return this.onEnd(a),!(this.ended=!0);0!==n.avail_out&&(0!==n.avail_in||4!==i&&2!==i)||("string"===this.options.to?this.onData(l.buf2binstring(o.shrinkBuf(n.output,n.next_out))):this.onData(o.shrinkBuf(n.output,n.next_out)))}while((0<n.avail_in||0===n.avail_out)&&1!==a);return 4===i?(a=s.deflateEnd(this.strm),this.onEnd(a),this.ended=!0,a===d):2!==i||(this.onEnd(d),!(n.avail_out=0))},c.prototype.onData=function(t){this.chunks.push(t)},c.prototype.onEnd=function(t){t===d&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=o.flattenChunks(this.chunks)),this.chunks=[],this.err=t,this.msg=this.strm.msg},a.Deflate=c,a.deflate=i,a.deflateRaw=function(t,e){return(e=e||{}).raw=!0,i(t,e)},a.gzip=function(t,e){return(e=e||{}).gzip=!0,i(t,e)}},{"./utils/common":3,"./utils/strings":4,"./zlib/deflate":8,"./zlib/messages":13,"./zlib/zstream":15}],2:[function(t,e,a){"use strict";var f=t("./zlib/inflate"),_=t("./utils/common"),u=t("./utils/strings"),c=t("./zlib/constants"),i=t("./zlib/messages"),n=t("./zlib/zstream"),r=t("./zlib/gzheader"),b=Object.prototype.toString;function s(t){if(!(this instanceof s))return new s(t);this.options=_.assign({chunkSize:16384,windowBits:0,to:""},t||{});var e=this.options;e.raw&&0<=e.windowBits&&e.windowBits<16&&(e.windowBits=-e.windowBits,0===e.windowBits&&(e.windowBits=-15)),!(0<=e.windowBits&&e.windowBits<16)||t&&t.windowBits||(e.windowBits+=32),15<e.windowBits&&e.windowBits<48&&0==(15&e.windowBits)&&(e.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new n,this.strm.avail_out=0;var a=f.inflateInit2(this.strm,e.windowBits);if(a!==c.Z_OK)throw new Error(i[a]);if(this.header=new r,f.inflateGetHeader(this.strm,this.header),e.dictionary&&("string"==typeof e.dictionary?e.dictionary=u.string2buf(e.dictionary):"[object ArrayBuffer]"===b.call(e.dictionary)&&(e.dictionary=new Uint8Array(e.dictionary)),e.raw&&(a=f.inflateSetDictionary(this.strm,e.dictionary))!==c.Z_OK))throw new Error(i[a])}function o(t,e){var a=new s(e);if(a.push(t,!0),a.err)throw a.msg||i[a.err];return a.result}s.prototype.push=function(t,e){var a,i,n,r,s,o=this.strm,l=this.options.chunkSize,h=this.options.dictionary,d=!1;if(this.ended)return!1;i=e===~~e?e:!0===e?c.Z_FINISH:c.Z_NO_FLUSH,"string"==typeof t?o.input=u.binstring2buf(t):"[object ArrayBuffer]"===b.call(t)?o.input=new Uint8Array(t):o.input=t,o.next_in=0,o.avail_in=o.input.length;do{if(0===o.avail_out&&(o.output=new _.Buf8(l),o.next_out=0,o.avail_out=l),(a=f.inflate(o,c.Z_NO_FLUSH))===c.Z_NEED_DICT&&h&&(a=f.inflateSetDictionary(this.strm,h)),a===c.Z_BUF_ERROR&&!0===d&&(a=c.Z_OK,d=!1),a!==c.Z_STREAM_END&&a!==c.Z_OK)return this.onEnd(a),!(this.ended=!0);o.next_out&&(0!==o.avail_out&&a!==c.Z_STREAM_END&&(0!==o.avail_in||i!==c.Z_FINISH&&i!==c.Z_SYNC_FLUSH)||("string"===this.options.to?(n=u.utf8border(o.output,o.next_out),r=o.next_out-n,s=u.buf2string(o.output,n),o.next_out=r,o.avail_out=l-r,r&&_.arraySet(o.output,o.output,n,r,0),this.onData(s)):this.onData(_.shrinkBuf(o.output,o.next_out)))),0===o.avail_in&&0===o.avail_out&&(d=!0)}while((0<o.avail_in||0===o.avail_out)&&a!==c.Z_STREAM_END);return a===c.Z_STREAM_END&&(i=c.Z_FINISH),i===c.Z_FINISH?(a=f.inflateEnd(this.strm),this.onEnd(a),this.ended=!0,a===c.Z_OK):i!==c.Z_SYNC_FLUSH||(this.onEnd(c.Z_OK),!(o.avail_out=0))},s.prototype.onData=function(t){this.chunks.push(t)},s.prototype.onEnd=function(t){t===c.Z_OK&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=_.flattenChunks(this.chunks)),this.chunks=[],this.err=t,this.msg=this.strm.msg},a.Inflate=s,a.inflate=o,a.inflateRaw=function(t,e){return(e=e||{}).raw=!0,o(t,e)},a.ungzip=o},{"./utils/common":3,"./utils/strings":4,"./zlib/constants":6,"./zlib/gzheader":9,"./zlib/inflate":11,"./zlib/messages":13,"./zlib/zstream":15}],3:[function(t,e,a){"use strict";var i="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;a.assign=function(t){for(var e,a,i=Array.prototype.slice.call(arguments,1);i.length;){var n=i.shift();if(n){if("object"!=typeof n)throw new TypeError(n+"must be non-object");for(var r in n)e=n,a=r,Object.prototype.hasOwnProperty.call(e,a)&&(t[r]=n[r])}}return t},a.shrinkBuf=function(t,e){return t.length===e?t:t.subarray?t.subarray(0,e):(t.length=e,t)};var n={arraySet:function(t,e,a,i,n){if(e.subarray&&t.subarray)t.set(e.subarray(a,a+i),n);else for(var r=0;r<i;r++)t[n+r]=e[a+r]},flattenChunks:function(t){var e,a,i,n,r,s;for(e=i=0,a=t.length;e<a;e++)i+=t[e].length;for(s=new Uint8Array(i),e=n=0,a=t.length;e<a;e++)r=t[e],s.set(r,n),n+=r.length;return s}},r={arraySet:function(t,e,a,i,n){for(var r=0;r<i;r++)t[n+r]=e[a+r]},flattenChunks:function(t){return[].concat.apply([],t)}};a.setTyped=function(t){t?(a.Buf8=Uint8Array,a.Buf16=Uint16Array,a.Buf32=Int32Array,a.assign(a,n)):(a.Buf8=Array,a.Buf16=Array,a.Buf32=Array,a.assign(a,r))},a.setTyped(i)},{}],4:[function(t,e,a){"use strict";var l=t("./common"),n=!0,r=!0;try{String.fromCharCode.apply(null,[0])}catch(t){n=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(t){r=!1}for(var h=new l.Buf8(256),i=0;i<256;i++)h[i]=252<=i?6:248<=i?5:240<=i?4:224<=i?3:192<=i?2:1;function d(t,e){if(e<65534&&(t.subarray&&r||!t.subarray&&n))return String.fromCharCode.apply(null,l.shrinkBuf(t,e));for(var a="",i=0;i<e;i++)a+=String.fromCharCode(t[i]);return a}h[254]=h[254]=1,a.string2buf=function(t){var e,a,i,n,r,s=t.length,o=0;for(n=0;n<s;n++)55296==(64512&(a=t.charCodeAt(n)))&&n+1<s&&56320==(64512&(i=t.charCodeAt(n+1)))&&(a=65536+(a-55296<<10)+(i-56320),n++),o+=a<128?1:a<2048?2:a<65536?3:4;for(e=new l.Buf8(o),n=r=0;r<o;n++)55296==(64512&(a=t.charCodeAt(n)))&&n+1<s&&56320==(64512&(i=t.charCodeAt(n+1)))&&(a=65536+(a-55296<<10)+(i-56320),n++),a<128?e[r++]=a:(a<2048?e[r++]=192|a>>>6:(a<65536?e[r++]=224|a>>>12:(e[r++]=240|a>>>18,e[r++]=128|a>>>12&63),e[r++]=128|a>>>6&63),e[r++]=128|63&a);return e},a.buf2binstring=function(t){return d(t,t.length)},a.binstring2buf=function(t){for(var e=new l.Buf8(t.length),a=0,i=e.length;a<i;a++)e[a]=t.charCodeAt(a);return e},a.buf2string=function(t,e){var a,i,n,r,s=e||t.length,o=new Array(2*s);for(a=i=0;a<s;)if((n=t[a++])<128)o[i++]=n;else if(4<(r=h[n]))o[i++]=65533,a+=r-1;else{for(n&=2===r?31:3===r?15:7;1<r&&a<s;)n=n<<6|63&t[a++],r--;1<r?o[i++]=65533:n<65536?o[i++]=n:(n-=65536,o[i++]=55296|n>>10&1023,o[i++]=56320|1023&n)}return d(o,i)},a.utf8border=function(t,e){var a;for((e=e||t.length)>t.length&&(e=t.length),a=e-1;0<=a&&128==(192&t[a]);)a--;return a<0?e:0===a?e:a+h[t[a]]>e?a:e}},{"./common":3}],5:[function(t,e,a){"use strict";e.exports=function(t,e,a,i){for(var n=65535&t|0,r=t>>>16&65535|0,s=0;0!==a;){for(a-=s=2e3<a?2e3:a;r=r+(n=n+e[i++]|0)|0,--s;);n%=65521,r%=65521}return n|r<<16|0}},{}],6:[function(t,e,a){"use strict";e.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],7:[function(t,e,a){"use strict";var o=function(){for(var t,e=[],a=0;a<256;a++){t=a;for(var i=0;i<8;i++)t=1&t?3988292384^t>>>1:t>>>1;e[a]=t}return e}();e.exports=function(t,e,a,i){var n=o,r=i+a;t^=-1;for(var s=i;s<r;s++)t=t>>>8^n[255&(t^e[s])];return-1^t}},{}],8:[function(t,e,a){"use strict";var l,_=t("../utils/common"),h=t("./trees"),u=t("./adler32"),c=t("./crc32"),i=t("./messages"),d=0,f=4,b=0,g=-2,m=-1,w=4,n=2,p=8,v=9,r=286,s=30,o=19,k=2*r+1,y=15,x=3,z=258,B=z+x+1,S=42,E=113,A=1,Z=2,R=3,C=4;function N(t,e){return t.msg=i[e],e}function O(t){return(t<<1)-(4<t?9:0)}function D(t){for(var e=t.length;0<=--e;)t[e]=0}function I(t){var e=t.state,a=e.pending;a>t.avail_out&&(a=t.avail_out),0!==a&&(_.arraySet(t.output,e.pending_buf,e.pending_out,a,t.next_out),t.next_out+=a,e.pending_out+=a,t.total_out+=a,t.avail_out-=a,e.pending-=a,0===e.pending&&(e.pending_out=0))}function U(t,e){h._tr_flush_block(t,0<=t.block_start?t.block_start:-1,t.strstart-t.block_start,e),t.block_start=t.strstart,I(t.strm)}function T(t,e){t.pending_buf[t.pending++]=e}function F(t,e){t.pending_buf[t.pending++]=e>>>8&255,t.pending_buf[t.pending++]=255&e}function L(t,e){var a,i,n=t.max_chain_length,r=t.strstart,s=t.prev_length,o=t.nice_match,l=t.strstart>t.w_size-B?t.strstart-(t.w_size-B):0,h=t.window,d=t.w_mask,f=t.prev,_=t.strstart+z,u=h[r+s-1],c=h[r+s];t.prev_length>=t.good_match&&(n>>=2),o>t.lookahead&&(o=t.lookahead);do{if(h[(a=e)+s]===c&&h[a+s-1]===u&&h[a]===h[r]&&h[++a]===h[r+1]){r+=2,a++;do{}while(h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&r<_);if(i=z-(_-r),r=_-z,s<i){if(t.match_start=e,o<=(s=i))break;u=h[r+s-1],c=h[r+s]}}}while((e=f[e&d])>l&&0!=--n);return s<=t.lookahead?s:t.lookahead}function H(t){var e,a,i,n,r,s,o,l,h,d,f=t.w_size;do{if(n=t.window_size-t.lookahead-t.strstart,t.strstart>=f+(f-B)){for(_.arraySet(t.window,t.window,f,f,0),t.match_start-=f,t.strstart-=f,t.block_start-=f,e=a=t.hash_size;i=t.head[--e],t.head[e]=f<=i?i-f:0,--a;);for(e=a=f;i=t.prev[--e],t.prev[e]=f<=i?i-f:0,--a;);n+=f}if(0===t.strm.avail_in)break;if(s=t.strm,o=t.window,l=t.strstart+t.lookahead,h=n,d=void 0,d=s.avail_in,h<d&&(d=h),a=0===d?0:(s.avail_in-=d,_.arraySet(o,s.input,s.next_in,d,l),1===s.state.wrap?s.adler=u(s.adler,o,d,l):2===s.state.wrap&&(s.adler=c(s.adler,o,d,l)),s.next_in+=d,s.total_in+=d,d),t.lookahead+=a,t.lookahead+t.insert>=x)for(r=t.strstart-t.insert,t.ins_h=t.window[r],t.ins_h=(t.ins_h<<t.hash_shift^t.window[r+1])&t.hash_mask;t.insert&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[r+x-1])&t.hash_mask,t.prev[r&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=r,r++,t.insert--,!(t.lookahead+t.insert<x)););}while(t.lookahead<B&&0!==t.strm.avail_in)}function j(t,e){for(var a,i;;){if(t.lookahead<B){if(H(t),t.lookahead<B&&e===d)return A;if(0===t.lookahead)break}if(a=0,t.lookahead>=x&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+x-1])&t.hash_mask,a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),0!==a&&t.strstart-a<=t.w_size-B&&(t.match_length=L(t,a)),t.match_length>=x)if(i=h._tr_tally(t,t.strstart-t.match_start,t.match_length-x),t.lookahead-=t.match_length,t.match_length<=t.max_lazy_match&&t.lookahead>=x){for(t.match_length--;t.strstart++,t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+x-1])&t.hash_mask,a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart,0!=--t.match_length;);t.strstart++}else t.strstart+=t.match_length,t.match_length=0,t.ins_h=t.window[t.strstart],t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+1])&t.hash_mask;else i=h._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++;if(i&&(U(t,!1),0===t.strm.avail_out))return A}return t.insert=t.strstart<x-1?t.strstart:x-1,e===f?(U(t,!0),0===t.strm.avail_out?R:C):t.last_lit&&(U(t,!1),0===t.strm.avail_out)?A:Z}function K(t,e){for(var a,i,n;;){if(t.lookahead<B){if(H(t),t.lookahead<B&&e===d)return A;if(0===t.lookahead)break}if(a=0,t.lookahead>=x&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+x-1])&t.hash_mask,a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),t.prev_length=t.match_length,t.prev_match=t.match_start,t.match_length=x-1,0!==a&&t.prev_length<t.max_lazy_match&&t.strstart-a<=t.w_size-B&&(t.match_length=L(t,a),t.match_length<=5&&(1===t.strategy||t.match_length===x&&4096<t.strstart-t.match_start)&&(t.match_length=x-1)),t.prev_length>=x&&t.match_length<=t.prev_length){for(n=t.strstart+t.lookahead-x,i=h._tr_tally(t,t.strstart-1-t.prev_match,t.prev_length-x),t.lookahead-=t.prev_length-1,t.prev_length-=2;++t.strstart<=n&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+x-1])&t.hash_mask,a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),0!=--t.prev_length;);if(t.match_available=0,t.match_length=x-1,t.strstart++,i&&(U(t,!1),0===t.strm.avail_out))return A}else if(t.match_available){if((i=h._tr_tally(t,0,t.window[t.strstart-1]))&&U(t,!1),t.strstart++,t.lookahead--,0===t.strm.avail_out)return A}else t.match_available=1,t.strstart++,t.lookahead--}return t.match_available&&(i=h._tr_tally(t,0,t.window[t.strstart-1]),t.match_available=0),t.insert=t.strstart<x-1?t.strstart:x-1,e===f?(U(t,!0),0===t.strm.avail_out?R:C):t.last_lit&&(U(t,!1),0===t.strm.avail_out)?A:Z}function M(t,e,a,i,n){this.good_length=t,this.max_lazy=e,this.nice_length=a,this.max_chain=i,this.func=n}function P(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=p,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new _.Buf16(2*k),this.dyn_dtree=new _.Buf16(2*(2*s+1)),this.bl_tree=new _.Buf16(2*(2*o+1)),D(this.dyn_ltree),D(this.dyn_dtree),D(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new _.Buf16(y+1),this.heap=new _.Buf16(2*r+1),D(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new _.Buf16(2*r+1),D(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function Y(t){var e;return t&&t.state?(t.total_in=t.total_out=0,t.data_type=n,(e=t.state).pending=0,e.pending_out=0,e.wrap<0&&(e.wrap=-e.wrap),e.status=e.wrap?S:E,t.adler=2===e.wrap?0:1,e.last_flush=d,h._tr_init(e),b):N(t,g)}function q(t){var e,a=Y(t);return a===b&&((e=t.state).window_size=2*e.w_size,D(e.head),e.max_lazy_match=l[e.level].max_lazy,e.good_match=l[e.level].good_length,e.nice_match=l[e.level].nice_length,e.max_chain_length=l[e.level].max_chain,e.strstart=0,e.block_start=0,e.lookahead=0,e.insert=0,e.match_length=e.prev_length=x-1,e.match_available=0,e.ins_h=0),a}function G(t,e,a,i,n,r){if(!t)return g;var s=1;if(e===m&&(e=6),i<0?(s=0,i=-i):15<i&&(s=2,i-=16),n<1||v<n||a!==p||i<8||15<i||e<0||9<e||r<0||w<r)return N(t,g);8===i&&(i=9);var o=new P;return(t.state=o).strm=t,o.wrap=s,o.gzhead=null,o.w_bits=i,o.w_size=1<<o.w_bits,o.w_mask=o.w_size-1,o.hash_bits=n+7,o.hash_size=1<<o.hash_bits,o.hash_mask=o.hash_size-1,o.hash_shift=~~((o.hash_bits+x-1)/x),o.window=new _.Buf8(2*o.w_size),o.head=new _.Buf16(o.hash_size),o.prev=new _.Buf16(o.w_size),o.lit_bufsize=1<<n+6,o.pending_buf_size=4*o.lit_bufsize,o.pending_buf=new _.Buf8(o.pending_buf_size),o.d_buf=1*o.lit_bufsize,o.l_buf=3*o.lit_bufsize,o.level=e,o.strategy=r,o.method=a,q(t)}l=[new M(0,0,0,0,function(t,e){var a=65535;for(a>t.pending_buf_size-5&&(a=t.pending_buf_size-5);;){if(t.lookahead<=1){if(H(t),0===t.lookahead&&e===d)return A;if(0===t.lookahead)break}t.strstart+=t.lookahead,t.lookahead=0;var i=t.block_start+a;if((0===t.strstart||t.strstart>=i)&&(t.lookahead=t.strstart-i,t.strstart=i,U(t,!1),0===t.strm.avail_out))return A;if(t.strstart-t.block_start>=t.w_size-B&&(U(t,!1),0===t.strm.avail_out))return A}return t.insert=0,e===f?(U(t,!0),0===t.strm.avail_out?R:C):(t.strstart>t.block_start&&(U(t,!1),t.strm.avail_out),A)}),new M(4,4,8,4,j),new M(4,5,16,8,j),new M(4,6,32,32,j),new M(4,4,16,16,K),new M(8,16,32,32,K),new M(8,16,128,128,K),new M(8,32,128,256,K),new M(32,128,258,1024,K),new M(32,258,258,4096,K)],a.deflateInit=function(t,e){return G(t,e,p,15,8,0)},a.deflateInit2=G,a.deflateReset=q,a.deflateResetKeep=Y,a.deflateSetHeader=function(t,e){return t&&t.state?2!==t.state.wrap?g:(t.state.gzhead=e,b):g},a.deflate=function(t,e){var a,i,n,r;if(!t||!t.state||5<e||e<0)return t?N(t,g):g;if(i=t.state,!t.output||!t.input&&0!==t.avail_in||666===i.status&&e!==f)return N(t,0===t.avail_out?-5:g);if(i.strm=t,a=i.last_flush,i.last_flush=e,i.status===S)if(2===i.wrap)t.adler=0,T(i,31),T(i,139),T(i,8),i.gzhead?(T(i,(i.gzhead.text?1:0)+(i.gzhead.hcrc?2:0)+(i.gzhead.extra?4:0)+(i.gzhead.name?8:0)+(i.gzhead.comment?16:0)),T(i,255&i.gzhead.time),T(i,i.gzhead.time>>8&255),T(i,i.gzhead.time>>16&255),T(i,i.gzhead.time>>24&255),T(i,9===i.level?2:2<=i.strategy||i.level<2?4:0),T(i,255&i.gzhead.os),i.gzhead.extra&&i.gzhead.extra.length&&(T(i,255&i.gzhead.extra.length),T(i,i.gzhead.extra.length>>8&255)),i.gzhead.hcrc&&(t.adler=c(t.adler,i.pending_buf,i.pending,0)),i.gzindex=0,i.status=69):(T(i,0),T(i,0),T(i,0),T(i,0),T(i,0),T(i,9===i.level?2:2<=i.strategy||i.level<2?4:0),T(i,3),i.status=E);else{var s=p+(i.w_bits-8<<4)<<8;s|=(2<=i.strategy||i.level<2?0:i.level<6?1:6===i.level?2:3)<<6,0!==i.strstart&&(s|=32),s+=31-s%31,i.status=E,F(i,s),0!==i.strstart&&(F(i,t.adler>>>16),F(i,65535&t.adler)),t.adler=1}if(69===i.status)if(i.gzhead.extra){for(n=i.pending;i.gzindex<(65535&i.gzhead.extra.length)&&(i.pending!==i.pending_buf_size||(i.gzhead.hcrc&&i.pending>n&&(t.adler=c(t.adler,i.pending_buf,i.pending-n,n)),I(t),n=i.pending,i.pending!==i.pending_buf_size));)T(i,255&i.gzhead.extra[i.gzindex]),i.gzindex++;i.gzhead.hcrc&&i.pending>n&&(t.adler=c(t.adler,i.pending_buf,i.pending-n,n)),i.gzindex===i.gzhead.extra.length&&(i.gzindex=0,i.status=73)}else i.status=73;if(73===i.status)if(i.gzhead.name){n=i.pending;do{if(i.pending===i.pending_buf_size&&(i.gzhead.hcrc&&i.pending>n&&(t.adler=c(t.adler,i.pending_buf,i.pending-n,n)),I(t),n=i.pending,i.pending===i.pending_buf_size)){r=1;break}T(i,r=i.gzindex<i.gzhead.name.length?255&i.gzhead.name.charCodeAt(i.gzindex++):0)}while(0!==r);i.gzhead.hcrc&&i.pending>n&&(t.adler=c(t.adler,i.pending_buf,i.pending-n,n)),0===r&&(i.gzindex=0,i.status=91)}else i.status=91;if(91===i.status)if(i.gzhead.comment){n=i.pending;do{if(i.pending===i.pending_buf_size&&(i.gzhead.hcrc&&i.pending>n&&(t.adler=c(t.adler,i.pending_buf,i.pending-n,n)),I(t),n=i.pending,i.pending===i.pending_buf_size)){r=1;break}T(i,r=i.gzindex<i.gzhead.comment.length?255&i.gzhead.comment.charCodeAt(i.gzindex++):0)}while(0!==r);i.gzhead.hcrc&&i.pending>n&&(t.adler=c(t.adler,i.pending_buf,i.pending-n,n)),0===r&&(i.status=103)}else i.status=103;if(103===i.status&&(i.gzhead.hcrc?(i.pending+2>i.pending_buf_size&&I(t),i.pending+2<=i.pending_buf_size&&(T(i,255&t.adler),T(i,t.adler>>8&255),t.adler=0,i.status=E)):i.status=E),0!==i.pending){if(I(t),0===t.avail_out)return i.last_flush=-1,b}else if(0===t.avail_in&&O(e)<=O(a)&&e!==f)return N(t,-5);if(666===i.status&&0!==t.avail_in)return N(t,-5);if(0!==t.avail_in||0!==i.lookahead||e!==d&&666!==i.status){var o=2===i.strategy?function(t,e){for(var a;;){if(0===t.lookahead&&(H(t),0===t.lookahead)){if(e===d)return A;break}if(t.match_length=0,a=h._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++,a&&(U(t,!1),0===t.strm.avail_out))return A}return t.insert=0,e===f?(U(t,!0),0===t.strm.avail_out?R:C):t.last_lit&&(U(t,!1),0===t.strm.avail_out)?A:Z}(i,e):3===i.strategy?function(t,e){for(var a,i,n,r,s=t.window;;){if(t.lookahead<=z){if(H(t),t.lookahead<=z&&e===d)return A;if(0===t.lookahead)break}if(t.match_length=0,t.lookahead>=x&&0<t.strstart&&(i=s[n=t.strstart-1])===s[++n]&&i===s[++n]&&i===s[++n]){r=t.strstart+z;do{}while(i===s[++n]&&i===s[++n]&&i===s[++n]&&i===s[++n]&&i===s[++n]&&i===s[++n]&&i===s[++n]&&i===s[++n]&&n<r);t.match_length=z-(r-n),t.match_length>t.lookahead&&(t.match_length=t.lookahead)}if(t.match_length>=x?(a=h._tr_tally(t,1,t.match_length-x),t.lookahead-=t.match_length,t.strstart+=t.match_length,t.match_length=0):(a=h._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++),a&&(U(t,!1),0===t.strm.avail_out))return A}return t.insert=0,e===f?(U(t,!0),0===t.strm.avail_out?R:C):t.last_lit&&(U(t,!1),0===t.strm.avail_out)?A:Z}(i,e):l[i.level].func(i,e);if(o!==R&&o!==C||(i.status=666),o===A||o===R)return 0===t.avail_out&&(i.last_flush=-1),b;if(o===Z&&(1===e?h._tr_align(i):5!==e&&(h._tr_stored_block(i,0,0,!1),3===e&&(D(i.head),0===i.lookahead&&(i.strstart=0,i.block_start=0,i.insert=0))),I(t),0===t.avail_out))return i.last_flush=-1,b}return e!==f?b:i.wrap<=0?1:(2===i.wrap?(T(i,255&t.adler),T(i,t.adler>>8&255),T(i,t.adler>>16&255),T(i,t.adler>>24&255),T(i,255&t.total_in),T(i,t.total_in>>8&255),T(i,t.total_in>>16&255),T(i,t.total_in>>24&255)):(F(i,t.adler>>>16),F(i,65535&t.adler)),I(t),0<i.wrap&&(i.wrap=-i.wrap),0!==i.pending?b:1)},a.deflateEnd=function(t){var e;return t&&t.state?(e=t.state.status)!==S&&69!==e&&73!==e&&91!==e&&103!==e&&e!==E&&666!==e?N(t,g):(t.state=null,e===E?N(t,-3):b):g},a.deflateSetDictionary=function(t,e){var a,i,n,r,s,o,l,h,d=e.length;if(!t||!t.state)return g;if(2===(r=(a=t.state).wrap)||1===r&&a.status!==S||a.lookahead)return g;for(1===r&&(t.adler=u(t.adler,e,d,0)),a.wrap=0,d>=a.w_size&&(0===r&&(D(a.head),a.strstart=0,a.block_start=0,a.insert=0),h=new _.Buf8(a.w_size),_.arraySet(h,e,d-a.w_size,a.w_size,0),e=h,d=a.w_size),s=t.avail_in,o=t.next_in,l=t.input,t.avail_in=d,t.next_in=0,t.input=e,H(a);a.lookahead>=x;){for(i=a.strstart,n=a.lookahead-(x-1);a.ins_h=(a.ins_h<<a.hash_shift^a.window[i+x-1])&a.hash_mask,a.prev[i&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=i,i++,--n;);a.strstart=i,a.lookahead=x-1,H(a)}return a.strstart+=a.lookahead,a.block_start=a.strstart,a.insert=a.lookahead,a.lookahead=0,a.match_length=a.prev_length=x-1,a.match_available=0,t.next_in=o,t.input=l,t.avail_in=s,a.wrap=r,b},a.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":3,"./adler32":5,"./crc32":7,"./messages":13,"./trees":14}],9:[function(t,e,a){"use strict";e.exports=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}},{}],10:[function(t,e,a){"use strict";e.exports=function(t,e){var a,i,n,r,s,o,l,h,d,f,_,u,c,b,g,m,w,p,v,k,y,x,z,B,S;a=t.state,i=t.next_in,B=t.input,n=i+(t.avail_in-5),r=t.next_out,S=t.output,s=r-(e-t.avail_out),o=r+(t.avail_out-257),l=a.dmax,h=a.wsize,d=a.whave,f=a.wnext,_=a.window,u=a.hold,c=a.bits,b=a.lencode,g=a.distcode,m=(1<<a.lenbits)-1,w=(1<<a.distbits)-1;t:do{c<15&&(u+=B[i++]<<c,c+=8,u+=B[i++]<<c,c+=8),p=b[u&m];e:for(;;){if(u>>>=v=p>>>24,c-=v,0===(v=p>>>16&255))S[r++]=65535&p;else{if(!(16&v)){if(0==(64&v)){p=b[(65535&p)+(u&(1<<v)-1)];continue e}if(32&v){a.mode=12;break t}t.msg="invalid literal/length code",a.mode=30;break t}k=65535&p,(v&=15)&&(c<v&&(u+=B[i++]<<c,c+=8),k+=u&(1<<v)-1,u>>>=v,c-=v),c<15&&(u+=B[i++]<<c,c+=8,u+=B[i++]<<c,c+=8),p=g[u&w];a:for(;;){if(u>>>=v=p>>>24,c-=v,!(16&(v=p>>>16&255))){if(0==(64&v)){p=g[(65535&p)+(u&(1<<v)-1)];continue a}t.msg="invalid distance code",a.mode=30;break t}if(y=65535&p,c<(v&=15)&&(u+=B[i++]<<c,(c+=8)<v&&(u+=B[i++]<<c,c+=8)),l<(y+=u&(1<<v)-1)){t.msg="invalid distance too far back",a.mode=30;break t}if(u>>>=v,c-=v,(v=r-s)<y){if(d<(v=y-v)&&a.sane){t.msg="invalid distance too far back",a.mode=30;break t}if(z=_,(x=0)===f){if(x+=h-v,v<k){for(k-=v;S[r++]=_[x++],--v;);x=r-y,z=S}}else if(f<v){if(x+=h+f-v,(v-=f)<k){for(k-=v;S[r++]=_[x++],--v;);if(x=0,f<k){for(k-=v=f;S[r++]=_[x++],--v;);x=r-y,z=S}}}else if(x+=f-v,v<k){for(k-=v;S[r++]=_[x++],--v;);x=r-y,z=S}for(;2<k;)S[r++]=z[x++],S[r++]=z[x++],S[r++]=z[x++],k-=3;k&&(S[r++]=z[x++],1<k&&(S[r++]=z[x++]))}else{for(x=r-y;S[r++]=S[x++],S[r++]=S[x++],S[r++]=S[x++],2<(k-=3););k&&(S[r++]=S[x++],1<k&&(S[r++]=S[x++]))}break}}break}}while(i<n&&r<o);i-=k=c>>3,u&=(1<<(c-=k<<3))-1,t.next_in=i,t.next_out=r,t.avail_in=i<n?n-i+5:5-(i-n),t.avail_out=r<o?o-r+257:257-(r-o),a.hold=u,a.bits=c}},{}],11:[function(t,e,a){"use strict";var Z=t("../utils/common"),R=t("./adler32"),C=t("./crc32"),N=t("./inffast"),O=t("./inftrees"),D=1,I=2,U=0,T=-2,F=1,i=852,n=592;function L(t){return(t>>>24&255)+(t>>>8&65280)+((65280&t)<<8)+((255&t)<<24)}function r(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new Z.Buf16(320),this.work=new Z.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function s(t){var e;return t&&t.state?(e=t.state,t.total_in=t.total_out=e.total=0,t.msg="",e.wrap&&(t.adler=1&e.wrap),e.mode=F,e.last=0,e.havedict=0,e.dmax=32768,e.head=null,e.hold=0,e.bits=0,e.lencode=e.lendyn=new Z.Buf32(i),e.distcode=e.distdyn=new Z.Buf32(n),e.sane=1,e.back=-1,U):T}function o(t){var e;return t&&t.state?((e=t.state).wsize=0,e.whave=0,e.wnext=0,s(t)):T}function l(t,e){var a,i;return t&&t.state?(i=t.state,e<0?(a=0,e=-e):(a=1+(e>>4),e<48&&(e&=15)),e&&(e<8||15<e)?T:(null!==i.window&&i.wbits!==e&&(i.window=null),i.wrap=a,i.wbits=e,o(t))):T}function h(t,e){var a,i;return t?(i=new r,(t.state=i).window=null,(a=l(t,e))!==U&&(t.state=null),a):T}var d,f,_=!0;function H(t){if(_){var e;for(d=new Z.Buf32(512),f=new Z.Buf32(32),e=0;e<144;)t.lens[e++]=8;for(;e<256;)t.lens[e++]=9;for(;e<280;)t.lens[e++]=7;for(;e<288;)t.lens[e++]=8;for(O(D,t.lens,0,288,d,0,t.work,{bits:9}),e=0;e<32;)t.lens[e++]=5;O(I,t.lens,0,32,f,0,t.work,{bits:5}),_=!1}t.lencode=d,t.lenbits=9,t.distcode=f,t.distbits=5}function j(t,e,a,i){var n,r=t.state;return null===r.window&&(r.wsize=1<<r.wbits,r.wnext=0,r.whave=0,r.window=new Z.Buf8(r.wsize)),i>=r.wsize?(Z.arraySet(r.window,e,a-r.wsize,r.wsize,0),r.wnext=0,r.whave=r.wsize):(i<(n=r.wsize-r.wnext)&&(n=i),Z.arraySet(r.window,e,a-i,n,r.wnext),(i-=n)?(Z.arraySet(r.window,e,a-i,i,0),r.wnext=i,r.whave=r.wsize):(r.wnext+=n,r.wnext===r.wsize&&(r.wnext=0),r.whave<r.wsize&&(r.whave+=n))),0}a.inflateReset=o,a.inflateReset2=l,a.inflateResetKeep=s,a.inflateInit=function(t){return h(t,15)},a.inflateInit2=h,a.inflate=function(t,e){var a,i,n,r,s,o,l,h,d,f,_,u,c,b,g,m,w,p,v,k,y,x,z,B,S=0,E=new Z.Buf8(4),A=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!t||!t.state||!t.output||!t.input&&0!==t.avail_in)return T;12===(a=t.state).mode&&(a.mode=13),s=t.next_out,n=t.output,l=t.avail_out,r=t.next_in,i=t.input,o=t.avail_in,h=a.hold,d=a.bits,f=o,_=l,x=U;t:for(;;)switch(a.mode){case F:if(0===a.wrap){a.mode=13;break}for(;d<16;){if(0===o)break t;o--,h+=i[r++]<<d,d+=8}if(2&a.wrap&&35615===h){E[a.check=0]=255&h,E[1]=h>>>8&255,a.check=C(a.check,E,2,0),d=h=0,a.mode=2;break}if(a.flags=0,a.head&&(a.head.done=!1),!(1&a.wrap)||(((255&h)<<8)+(h>>8))%31){t.msg="incorrect header check",a.mode=30;break}if(8!=(15&h)){t.msg="unknown compression method",a.mode=30;break}if(d-=4,y=8+(15&(h>>>=4)),0===a.wbits)a.wbits=y;else if(y>a.wbits){t.msg="invalid window size",a.mode=30;break}a.dmax=1<<y,t.adler=a.check=1,a.mode=512&h?10:12,d=h=0;break;case 2:for(;d<16;){if(0===o)break t;o--,h+=i[r++]<<d,d+=8}if(a.flags=h,8!=(255&a.flags)){t.msg="unknown compression method",a.mode=30;break}if(57344&a.flags){t.msg="unknown header flags set",a.mode=30;break}a.head&&(a.head.text=h>>8&1),512&a.flags&&(E[0]=255&h,E[1]=h>>>8&255,a.check=C(a.check,E,2,0)),d=h=0,a.mode=3;case 3:for(;d<32;){if(0===o)break t;o--,h+=i[r++]<<d,d+=8}a.head&&(a.head.time=h),512&a.flags&&(E[0]=255&h,E[1]=h>>>8&255,E[2]=h>>>16&255,E[3]=h>>>24&255,a.check=C(a.check,E,4,0)),d=h=0,a.mode=4;case 4:for(;d<16;){if(0===o)break t;o--,h+=i[r++]<<d,d+=8}a.head&&(a.head.xflags=255&h,a.head.os=h>>8),512&a.flags&&(E[0]=255&h,E[1]=h>>>8&255,a.check=C(a.check,E,2,0)),d=h=0,a.mode=5;case 5:if(1024&a.flags){for(;d<16;){if(0===o)break t;o--,h+=i[r++]<<d,d+=8}a.length=h,a.head&&(a.head.extra_len=h),512&a.flags&&(E[0]=255&h,E[1]=h>>>8&255,a.check=C(a.check,E,2,0)),d=h=0}else a.head&&(a.head.extra=null);a.mode=6;case 6:if(1024&a.flags&&(o<(u=a.length)&&(u=o),u&&(a.head&&(y=a.head.extra_len-a.length,a.head.extra||(a.head.extra=new Array(a.head.extra_len)),Z.arraySet(a.head.extra,i,r,u,y)),512&a.flags&&(a.check=C(a.check,i,u,r)),o-=u,r+=u,a.length-=u),a.length))break t;a.length=0,a.mode=7;case 7:if(2048&a.flags){if(0===o)break t;for(u=0;y=i[r+u++],a.head&&y&&a.length<65536&&(a.head.name+=String.fromCharCode(y)),y&&u<o;);if(512&a.flags&&(a.check=C(a.check,i,u,r)),o-=u,r+=u,y)break t}else a.head&&(a.head.name=null);a.length=0,a.mode=8;case 8:if(4096&a.flags){if(0===o)break t;for(u=0;y=i[r+u++],a.head&&y&&a.length<65536&&(a.head.comment+=String.fromCharCode(y)),y&&u<o;);if(512&a.flags&&(a.check=C(a.check,i,u,r)),o-=u,r+=u,y)break t}else a.head&&(a.head.comment=null);a.mode=9;case 9:if(512&a.flags){for(;d<16;){if(0===o)break t;o--,h+=i[r++]<<d,d+=8}if(h!==(65535&a.check)){t.msg="header crc mismatch",a.mode=30;break}d=h=0}a.head&&(a.head.hcrc=a.flags>>9&1,a.head.done=!0),t.adler=a.check=0,a.mode=12;break;case 10:for(;d<32;){if(0===o)break t;o--,h+=i[r++]<<d,d+=8}t.adler=a.check=L(h),d=h=0,a.mode=11;case 11:if(0===a.havedict)return t.next_out=s,t.avail_out=l,t.next_in=r,t.avail_in=o,a.hold=h,a.bits=d,2;t.adler=a.check=1,a.mode=12;case 12:if(5===e||6===e)break t;case 13:if(a.last){h>>>=7&d,d-=7&d,a.mode=27;break}for(;d<3;){if(0===o)break t;o--,h+=i[r++]<<d,d+=8}switch(a.last=1&h,d-=1,3&(h>>>=1)){case 0:a.mode=14;break;case 1:if(H(a),a.mode=20,6!==e)break;h>>>=2,d-=2;break t;case 2:a.mode=17;break;case 3:t.msg="invalid block type",a.mode=30}h>>>=2,d-=2;break;case 14:for(h>>>=7&d,d-=7&d;d<32;){if(0===o)break t;o--,h+=i[r++]<<d,d+=8}if((65535&h)!=(h>>>16^65535)){t.msg="invalid stored block lengths",a.mode=30;break}if(a.length=65535&h,d=h=0,a.mode=15,6===e)break t;case 15:a.mode=16;case 16:if(u=a.length){if(o<u&&(u=o),l<u&&(u=l),0===u)break t;Z.arraySet(n,i,r,u,s),o-=u,r+=u,l-=u,s+=u,a.length-=u;break}a.mode=12;break;case 17:for(;d<14;){if(0===o)break t;o--,h+=i[r++]<<d,d+=8}if(a.nlen=257+(31&h),h>>>=5,d-=5,a.ndist=1+(31&h),h>>>=5,d-=5,a.ncode=4+(15&h),h>>>=4,d-=4,286<a.nlen||30<a.ndist){t.msg="too many length or distance symbols",a.mode=30;break}a.have=0,a.mode=18;case 18:for(;a.have<a.ncode;){for(;d<3;){if(0===o)break t;o--,h+=i[r++]<<d,d+=8}a.lens[A[a.have++]]=7&h,h>>>=3,d-=3}for(;a.have<19;)a.lens[A[a.have++]]=0;if(a.lencode=a.lendyn,a.lenbits=7,z={bits:a.lenbits},x=O(0,a.lens,0,19,a.lencode,0,a.work,z),a.lenbits=z.bits,x){t.msg="invalid code lengths set",a.mode=30;break}a.have=0,a.mode=19;case 19:for(;a.have<a.nlen+a.ndist;){for(;m=(S=a.lencode[h&(1<<a.lenbits)-1])>>>16&255,w=65535&S,!((g=S>>>24)<=d);){if(0===o)break t;o--,h+=i[r++]<<d,d+=8}if(w<16)h>>>=g,d-=g,a.lens[a.have++]=w;else{if(16===w){for(B=g+2;d<B;){if(0===o)break t;o--,h+=i[r++]<<d,d+=8}if(h>>>=g,d-=g,0===a.have){t.msg="invalid bit length repeat",a.mode=30;break}y=a.lens[a.have-1],u=3+(3&h),h>>>=2,d-=2}else if(17===w){for(B=g+3;d<B;){if(0===o)break t;o--,h+=i[r++]<<d,d+=8}d-=g,y=0,u=3+(7&(h>>>=g)),h>>>=3,d-=3}else{for(B=g+7;d<B;){if(0===o)break t;o--,h+=i[r++]<<d,d+=8}d-=g,y=0,u=11+(127&(h>>>=g)),h>>>=7,d-=7}if(a.have+u>a.nlen+a.ndist){t.msg="invalid bit length repeat",a.mode=30;break}for(;u--;)a.lens[a.have++]=y}}if(30===a.mode)break;if(0===a.lens[256]){t.msg="invalid code -- missing end-of-block",a.mode=30;break}if(a.lenbits=9,z={bits:a.lenbits},x=O(D,a.lens,0,a.nlen,a.lencode,0,a.work,z),a.lenbits=z.bits,x){t.msg="invalid literal/lengths set",a.mode=30;break}if(a.distbits=6,a.distcode=a.distdyn,z={bits:a.distbits},x=O(I,a.lens,a.nlen,a.ndist,a.distcode,0,a.work,z),a.distbits=z.bits,x){t.msg="invalid distances set",a.mode=30;break}if(a.mode=20,6===e)break t;case 20:a.mode=21;case 21:if(6<=o&&258<=l){t.next_out=s,t.avail_out=l,t.next_in=r,t.avail_in=o,a.hold=h,a.bits=d,N(t,_),s=t.next_out,n=t.output,l=t.avail_out,r=t.next_in,i=t.input,o=t.avail_in,h=a.hold,d=a.bits,12===a.mode&&(a.back=-1);break}for(a.back=0;m=(S=a.lencode[h&(1<<a.lenbits)-1])>>>16&255,w=65535&S,!((g=S>>>24)<=d);){if(0===o)break t;o--,h+=i[r++]<<d,d+=8}if(m&&0==(240&m)){for(p=g,v=m,k=w;m=(S=a.lencode[k+((h&(1<<p+v)-1)>>p)])>>>16&255,w=65535&S,!(p+(g=S>>>24)<=d);){if(0===o)break t;o--,h+=i[r++]<<d,d+=8}h>>>=p,d-=p,a.back+=p}if(h>>>=g,d-=g,a.back+=g,a.length=w,0===m){a.mode=26;break}if(32&m){a.back=-1,a.mode=12;break}if(64&m){t.msg="invalid literal/length code",a.mode=30;break}a.extra=15&m,a.mode=22;case 22:if(a.extra){for(B=a.extra;d<B;){if(0===o)break t;o--,h+=i[r++]<<d,d+=8}a.length+=h&(1<<a.extra)-1,h>>>=a.extra,d-=a.extra,a.back+=a.extra}a.was=a.length,a.mode=23;case 23:for(;m=(S=a.distcode[h&(1<<a.distbits)-1])>>>16&255,w=65535&S,!((g=S>>>24)<=d);){if(0===o)break t;o--,h+=i[r++]<<d,d+=8}if(0==(240&m)){for(p=g,v=m,k=w;m=(S=a.distcode[k+((h&(1<<p+v)-1)>>p)])>>>16&255,w=65535&S,!(p+(g=S>>>24)<=d);){if(0===o)break t;o--,h+=i[r++]<<d,d+=8}h>>>=p,d-=p,a.back+=p}if(h>>>=g,d-=g,a.back+=g,64&m){t.msg="invalid distance code",a.mode=30;break}a.offset=w,a.extra=15&m,a.mode=24;case 24:if(a.extra){for(B=a.extra;d<B;){if(0===o)break t;o--,h+=i[r++]<<d,d+=8}a.offset+=h&(1<<a.extra)-1,h>>>=a.extra,d-=a.extra,a.back+=a.extra}if(a.offset>a.dmax){t.msg="invalid distance too far back",a.mode=30;break}a.mode=25;case 25:if(0===l)break t;if(u=_-l,a.offset>u){if((u=a.offset-u)>a.whave&&a.sane){t.msg="invalid distance too far back",a.mode=30;break}u>a.wnext?(u-=a.wnext,c=a.wsize-u):c=a.wnext-u,u>a.length&&(u=a.length),b=a.window}else b=n,c=s-a.offset,u=a.length;for(l<u&&(u=l),l-=u,a.length-=u;n[s++]=b[c++],--u;);0===a.length&&(a.mode=21);break;case 26:if(0===l)break t;n[s++]=a.length,l--,a.mode=21;break;case 27:if(a.wrap){for(;d<32;){if(0===o)break t;o--,h|=i[r++]<<d,d+=8}if(_-=l,t.total_out+=_,a.total+=_,_&&(t.adler=a.check=a.flags?C(a.check,n,_,s-_):R(a.check,n,_,s-_)),_=l,(a.flags?h:L(h))!==a.check){t.msg="incorrect data check",a.mode=30;break}d=h=0}a.mode=28;case 28:if(a.wrap&&a.flags){for(;d<32;){if(0===o)break t;o--,h+=i[r++]<<d,d+=8}if(h!==(4294967295&a.total)){t.msg="incorrect length check",a.mode=30;break}d=h=0}a.mode=29;case 29:x=1;break t;case 30:x=-3;break t;case 31:return-4;case 32:default:return T}return t.next_out=s,t.avail_out=l,t.next_in=r,t.avail_in=o,a.hold=h,a.bits=d,(a.wsize||_!==t.avail_out&&a.mode<30&&(a.mode<27||4!==e))&&j(t,t.output,t.next_out,_-t.avail_out)?(a.mode=31,-4):(f-=t.avail_in,_-=t.avail_out,t.total_in+=f,t.total_out+=_,a.total+=_,a.wrap&&_&&(t.adler=a.check=a.flags?C(a.check,n,_,t.next_out-_):R(a.check,n,_,t.next_out-_)),t.data_type=a.bits+(a.last?64:0)+(12===a.mode?128:0)+(20===a.mode||15===a.mode?256:0),(0===f&&0===_||4===e)&&x===U&&(x=-5),x)},a.inflateEnd=function(t){if(!t||!t.state)return T;var e=t.state;return e.window&&(e.window=null),t.state=null,U},a.inflateGetHeader=function(t,e){var a;return t&&t.state?0==(2&(a=t.state).wrap)?T:((a.head=e).done=!1,U):T},a.inflateSetDictionary=function(t,e){var a,i=e.length;return t&&t.state?0!==(a=t.state).wrap&&11!==a.mode?T:11===a.mode&&R(1,e,i,0)!==a.check?-3:j(t,e,i,i)?(a.mode=31,-4):(a.havedict=1,U):T},a.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":3,"./adler32":5,"./crc32":7,"./inffast":10,"./inftrees":12}],12:[function(t,e,a){"use strict";var D=t("../utils/common"),I=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],U=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],T=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],F=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];e.exports=function(t,e,a,i,n,r,s,o){var l,h,d,f,_,u,c,b,g,m=o.bits,w=0,p=0,v=0,k=0,y=0,x=0,z=0,B=0,S=0,E=0,A=null,Z=0,R=new D.Buf16(16),C=new D.Buf16(16),N=null,O=0;for(w=0;w<=15;w++)R[w]=0;for(p=0;p<i;p++)R[e[a+p]]++;for(y=m,k=15;1<=k&&0===R[k];k--);if(k<y&&(y=k),0===k)return n[r++]=20971520,n[r++]=20971520,o.bits=1,0;for(v=1;v<k&&0===R[v];v++);for(y<v&&(y=v),w=B=1;w<=15;w++)if(B<<=1,(B-=R[w])<0)return-1;if(0<B&&(0===t||1!==k))return-1;for(C[1]=0,w=1;w<15;w++)C[w+1]=C[w]+R[w];for(p=0;p<i;p++)0!==e[a+p]&&(s[C[e[a+p]]++]=p);if(0===t?(A=N=s,u=19):1===t?(A=I,Z-=257,N=U,O-=257,u=256):(A=T,N=F,u=-1),w=v,_=r,z=p=E=0,d=-1,f=(S=1<<(x=y))-1,1===t&&852<S||2===t&&592<S)return 1;for(;;){for(c=w-z,s[p]<u?(b=0,g=s[p]):s[p]>u?(b=N[O+s[p]],g=A[Z+s[p]]):(b=96,g=0),l=1<<w-z,v=h=1<<x;n[_+(E>>z)+(h-=l)]=c<<24|b<<16|g|0,0!==h;);for(l=1<<w-1;E&l;)l>>=1;if(0!==l?(E&=l-1,E+=l):E=0,p++,0==--R[w]){if(w===k)break;w=e[a+s[p]]}if(y<w&&(E&f)!==d){for(0===z&&(z=y),_+=v,B=1<<(x=w-z);x+z<k&&!((B-=R[x+z])<=0);)x++,B<<=1;if(S+=1<<x,1===t&&852<S||2===t&&592<S)return 1;n[d=E&f]=y<<24|x<<16|_-r|0}}return 0!==E&&(n[_+E]=w-z<<24|64<<16|0),o.bits=y,0}},{"../utils/common":3}],13:[function(t,e,a){"use strict";e.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],14:[function(t,e,a){"use strict";var l=t("../utils/common"),o=0,h=1;function i(t){for(var e=t.length;0<=--e;)t[e]=0}var d=0,s=29,f=256,_=f+1+s,u=30,c=19,g=2*_+1,m=15,n=16,b=7,w=256,p=16,v=17,k=18,y=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],x=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],z=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],B=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],S=new Array(2*(_+2));i(S);var E=new Array(2*u);i(E);var A=new Array(512);i(A);var Z=new Array(256);i(Z);var R=new Array(s);i(R);var C,N,O,D=new Array(u);function I(t,e,a,i,n){this.static_tree=t,this.extra_bits=e,this.extra_base=a,this.elems=i,this.max_length=n,this.has_stree=t&&t.length}function r(t,e){this.dyn_tree=t,this.max_code=0,this.stat_desc=e}function U(t){return t<256?A[t]:A[256+(t>>>7)]}function T(t,e){t.pending_buf[t.pending++]=255&e,t.pending_buf[t.pending++]=e>>>8&255}function F(t,e,a){t.bi_valid>n-a?(t.bi_buf|=e<<t.bi_valid&65535,T(t,t.bi_buf),t.bi_buf=e>>n-t.bi_valid,t.bi_valid+=a-n):(t.bi_buf|=e<<t.bi_valid&65535,t.bi_valid+=a)}function L(t,e,a){F(t,a[2*e],a[2*e+1])}function H(t,e){for(var a=0;a|=1&t,t>>>=1,a<<=1,0<--e;);return a>>>1}function j(t,e,a){var i,n,r=new Array(m+1),s=0;for(i=1;i<=m;i++)r[i]=s=s+a[i-1]<<1;for(n=0;n<=e;n++){var o=t[2*n+1];0!==o&&(t[2*n]=H(r[o]++,o))}}function K(t){var e;for(e=0;e<_;e++)t.dyn_ltree[2*e]=0;for(e=0;e<u;e++)t.dyn_dtree[2*e]=0;for(e=0;e<c;e++)t.bl_tree[2*e]=0;t.dyn_ltree[2*w]=1,t.opt_len=t.static_len=0,t.last_lit=t.matches=0}function M(t){8<t.bi_valid?T(t,t.bi_buf):0<t.bi_valid&&(t.pending_buf[t.pending++]=t.bi_buf),t.bi_buf=0,t.bi_valid=0}function P(t,e,a,i){var n=2*e,r=2*a;return t[n]<t[r]||t[n]===t[r]&&i[e]<=i[a]}function Y(t,e,a){for(var i=t.heap[a],n=a<<1;n<=t.heap_len&&(n<t.heap_len&&P(e,t.heap[n+1],t.heap[n],t.depth)&&n++,!P(e,i,t.heap[n],t.depth));)t.heap[a]=t.heap[n],a=n,n<<=1;t.heap[a]=i}function q(t,e,a){var i,n,r,s,o=0;if(0!==t.last_lit)for(;i=t.pending_buf[t.d_buf+2*o]<<8|t.pending_buf[t.d_buf+2*o+1],n=t.pending_buf[t.l_buf+o],o++,0===i?L(t,n,e):(L(t,(r=Z[n])+f+1,e),0!==(s=y[r])&&F(t,n-=R[r],s),L(t,r=U(--i),a),0!==(s=x[r])&&F(t,i-=D[r],s)),o<t.last_lit;);L(t,w,e)}function G(t,e){var a,i,n,r=e.dyn_tree,s=e.stat_desc.static_tree,o=e.stat_desc.has_stree,l=e.stat_desc.elems,h=-1;for(t.heap_len=0,t.heap_max=g,a=0;a<l;a++)0!==r[2*a]?(t.heap[++t.heap_len]=h=a,t.depth[a]=0):r[2*a+1]=0;for(;t.heap_len<2;)r[2*(n=t.heap[++t.heap_len]=h<2?++h:0)]=1,t.depth[n]=0,t.opt_len--,o&&(t.static_len-=s[2*n+1]);for(e.max_code=h,a=t.heap_len>>1;1<=a;a--)Y(t,r,a);for(n=l;a=t.heap[1],t.heap[1]=t.heap[t.heap_len--],Y(t,r,1),i=t.heap[1],t.heap[--t.heap_max]=a,t.heap[--t.heap_max]=i,r[2*n]=r[2*a]+r[2*i],t.depth[n]=(t.depth[a]>=t.depth[i]?t.depth[a]:t.depth[i])+1,r[2*a+1]=r[2*i+1]=n,t.heap[1]=n++,Y(t,r,1),2<=t.heap_len;);t.heap[--t.heap_max]=t.heap[1],function(t,e){var a,i,n,r,s,o,l=e.dyn_tree,h=e.max_code,d=e.stat_desc.static_tree,f=e.stat_desc.has_stree,_=e.stat_desc.extra_bits,u=e.stat_desc.extra_base,c=e.stat_desc.max_length,b=0;for(r=0;r<=m;r++)t.bl_count[r]=0;for(l[2*t.heap[t.heap_max]+1]=0,a=t.heap_max+1;a<g;a++)c<(r=l[2*l[2*(i=t.heap[a])+1]+1]+1)&&(r=c,b++),l[2*i+1]=r,h<i||(t.bl_count[r]++,s=0,u<=i&&(s=_[i-u]),o=l[2*i],t.opt_len+=o*(r+s),f&&(t.static_len+=o*(d[2*i+1]+s)));if(0!==b){do{for(r=c-1;0===t.bl_count[r];)r--;t.bl_count[r]--,t.bl_count[r+1]+=2,t.bl_count[c]--,b-=2}while(0<b);for(r=c;0!==r;r--)for(i=t.bl_count[r];0!==i;)h<(n=t.heap[--a])||(l[2*n+1]!==r&&(t.opt_len+=(r-l[2*n+1])*l[2*n],l[2*n+1]=r),i--)}}(t,e),j(r,h,t.bl_count)}function X(t,e,a){var i,n,r=-1,s=e[1],o=0,l=7,h=4;for(0===s&&(l=138,h=3),e[2*(a+1)+1]=65535,i=0;i<=a;i++)n=s,s=e[2*(i+1)+1],++o<l&&n===s||(o<h?t.bl_tree[2*n]+=o:0!==n?(n!==r&&t.bl_tree[2*n]++,t.bl_tree[2*p]++):o<=10?t.bl_tree[2*v]++:t.bl_tree[2*k]++,r=n,(o=0)===s?(l=138,h=3):n===s?(l=6,h=3):(l=7,h=4))}function W(t,e,a){var i,n,r=-1,s=e[1],o=0,l=7,h=4;for(0===s&&(l=138,h=3),i=0;i<=a;i++)if(n=s,s=e[2*(i+1)+1],!(++o<l&&n===s)){if(o<h)for(;L(t,n,t.bl_tree),0!=--o;);else 0!==n?(n!==r&&(L(t,n,t.bl_tree),o--),L(t,p,t.bl_tree),F(t,o-3,2)):o<=10?(L(t,v,t.bl_tree),F(t,o-3,3)):(L(t,k,t.bl_tree),F(t,o-11,7));r=n,(o=0)===s?(l=138,h=3):n===s?(l=6,h=3):(l=7,h=4)}}i(D);var J=!1;function Q(t,e,a,i){var n,r,s,o;F(t,(d<<1)+(i?1:0),3),r=e,s=a,o=!0,M(n=t),o&&(T(n,s),T(n,~s)),l.arraySet(n.pending_buf,n.window,r,s,n.pending),n.pending+=s}a._tr_init=function(t){J||(function(){var t,e,a,i,n,r=new Array(m+1);for(i=a=0;i<s-1;i++)for(R[i]=a,t=0;t<1<<y[i];t++)Z[a++]=i;for(Z[a-1]=i,i=n=0;i<16;i++)for(D[i]=n,t=0;t<1<<x[i];t++)A[n++]=i;for(n>>=7;i<u;i++)for(D[i]=n<<7,t=0;t<1<<x[i]-7;t++)A[256+n++]=i;for(e=0;e<=m;e++)r[e]=0;for(t=0;t<=143;)S[2*t+1]=8,t++,r[8]++;for(;t<=255;)S[2*t+1]=9,t++,r[9]++;for(;t<=279;)S[2*t+1]=7,t++,r[7]++;for(;t<=287;)S[2*t+1]=8,t++,r[8]++;for(j(S,_+1,r),t=0;t<u;t++)E[2*t+1]=5,E[2*t]=H(t,5);C=new I(S,y,f+1,_,m),N=new I(E,x,0,u,m),O=new I(new Array(0),z,0,c,b)}(),J=!0),t.l_desc=new r(t.dyn_ltree,C),t.d_desc=new r(t.dyn_dtree,N),t.bl_desc=new r(t.bl_tree,O),t.bi_buf=0,t.bi_valid=0,K(t)},a._tr_stored_block=Q,a._tr_flush_block=function(t,e,a,i){var n,r,s=0;0<t.level?(2===t.strm.data_type&&(t.strm.data_type=function(t){var e,a=4093624447;for(e=0;e<=31;e++,a>>>=1)if(1&a&&0!==t.dyn_ltree[2*e])return o;if(0!==t.dyn_ltree[18]||0!==t.dyn_ltree[20]||0!==t.dyn_ltree[26])return h;for(e=32;e<f;e++)if(0!==t.dyn_ltree[2*e])return h;return o}(t)),G(t,t.l_desc),G(t,t.d_desc),s=function(t){var e;for(X(t,t.dyn_ltree,t.l_desc.max_code),X(t,t.dyn_dtree,t.d_desc.max_code),G(t,t.bl_desc),e=c-1;3<=e&&0===t.bl_tree[2*B[e]+1];e--);return t.opt_len+=3*(e+1)+5+5+4,e}(t),n=t.opt_len+3+7>>>3,(r=t.static_len+3+7>>>3)<=n&&(n=r)):n=r=a+5,a+4<=n&&-1!==e?Q(t,e,a,i):4===t.strategy||r===n?(F(t,2+(i?1:0),3),q(t,S,E)):(F(t,4+(i?1:0),3),function(t,e,a,i){var n;for(F(t,e-257,5),F(t,a-1,5),F(t,i-4,4),n=0;n<i;n++)F(t,t.bl_tree[2*B[n]+1],3);W(t,t.dyn_ltree,e-1),W(t,t.dyn_dtree,a-1)}(t,t.l_desc.max_code+1,t.d_desc.max_code+1,s+1),q(t,t.dyn_ltree,t.dyn_dtree)),K(t),i&&M(t)},a._tr_tally=function(t,e,a){return t.pending_buf[t.d_buf+2*t.last_lit]=e>>>8&255,t.pending_buf[t.d_buf+2*t.last_lit+1]=255&e,t.pending_buf[t.l_buf+t.last_lit]=255&a,t.last_lit++,0===e?t.dyn_ltree[2*a]++:(t.matches++,e--,t.dyn_ltree[2*(Z[a]+f+1)]++,t.dyn_dtree[2*U(e)]++),t.last_lit===t.lit_bufsize-1},a._tr_align=function(t){var e;F(t,2,3),L(t,w,S),16===(e=t).bi_valid?(T(e,e.bi_buf),e.bi_buf=0,e.bi_valid=0):8<=e.bi_valid&&(e.pending_buf[e.pending++]=255&e.bi_buf,e.bi_buf>>=8,e.bi_valid-=8)}},{"../utils/common":3}],15:[function(t,e,a){"use strict";e.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}},{}],"/":[function(t,e,a){"use strict";var i={};(0,t("./lib/utils/common").assign)(i,t("./lib/deflate"),t("./lib/inflate"),t("./lib/zlib/constants")),e.exports=i},{"./lib/deflate":1,"./lib/inflate":2,"./lib/utils/common":3,"./lib/zlib/constants":6}]},{},[])("/")});

  })(pakoModule,pakoModule.exports);
  const gzip=pakoModule.exports.gzip,gunzip=pakoModule.exports.ungzip;
  function mul(a,b){let n=0;for(;b;b>>>=1,a=(a<<1)^((a&128)?283:0))if(b&1)n^=a;return n&255;}
  const S=Array.from({length:256},(_,x)=>{let y=0;if(x){y=1;for(let i=0;i<254;i++)y=mul(y,x);}let s=y;for(let i=1;i<5;i++)s^=(y<<i)|(y>>>(8-i));return(s^99)&255;}),IS=[];
  S.forEach((v,i)=>IS[v]=i);
  const schedule=Array.from(KEY);let rc=1;
  for(let i=16;i<176;i+=4){let t=schedule.slice(i-4,i);if(i%16===0){t.push(t.shift());t=t.map(v=>S[v]);t[0]^=rc;rc=mul(rc,2);}for(let j=0;j<4;j++)schedule[i+j]=schedule[i+j-16]^t[j];}
  function block(input,decrypt){let s=Array.from(input);
    const add=r=>s=s.map((v,i)=>v^schedule[r*16+i]);
    const shift=inv=>{const p=s.slice();for(let c=0;c<4;c++)for(let r=0;r<4;r++)s[4*c+r]=p[4*((c+(inv?4-r:r))%4)+r];};
    const mix=inv=>{for(let c=0;c<4;c++){let i=4*c,a=s.slice(i,i+4),m=inv?[14,11,13,9]:[2,3,1,1];for(let r=0;r<4;r++)s[i+r]=a.reduce((n,v,j)=>n^mul(v,m[(j-r+4)%4]),0);}};
    if(decrypt){add(10);for(let r=9;r>=0;r--){shift(true);s=s.map(v=>IS[v]);add(r);if(r)mix(true);}}
    else{add(0);for(let r=1;r<=10;r++){s=s.map(v=>S[v]);shift(false);if(r<10)mix(false);add(r);}}
    return s;
  }
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
    return Uint8Array.from([a0,b0,c0,d0].flatMap(n=>[0,1,2,3].map(i=>(n >>> (i*8))&255)));
  }
const SALT = utf8('ca8e86efb32e');
const PACKAGE_AND_CERT = utf8('com.kwai.theater1c48a12657a227fa339710301806365b');
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (~crc) >>> 0;
}
function checksumXor(bytes) {
  let sum = 0;
  for (let i = 0; i < bytes.length - 1; i++) sum += bytes[i];
  if (sum > 255) sum = -sum;
  for (let i = 0; i < bytes.length - 1; i++) bytes[i] ^= (sum ^ i) & 255;
  bytes[bytes.length - 1] = sum & 255;
  return bytes;
}
function xifanSig1(input) {
  const bytes = typeof input === 'string' ? utf8(input) : input;
  const salted = new Uint8Array(bytes.length + SALT.length);
  salted.set(bytes); salted.set(SALT, bytes.length);
  const digest = new Uint8Array(md5Bytes(salted));
  if (digest.length !== 16) throw new Error('MD5 callback must return 16 raw bytes');
  checksumXor(digest);
  const packed = new Uint8Array(24);
  packed.set([1, 1, 1]);
  new DataView(packed.buffer).setUint32(3, crc32(PACKAGE_AND_CERT), true);
  packed.set(digest, 7);
  checksumXor(packed);
  return Array.from(packed, byte => byte.toString(16).padStart(2, '0')).join('');
}

  // Preserve integers before JSON.parse can round native long identifiers.
  function xifanParseJSON(source){
    const s=String(source);let out='',i=0;
    while(i<s.length){
      if(s[i]==='"'){const start=i++;while(i<s.length){if(s[i]==='\\'){i+=2;continue;}if(s[i++]==='"')break;}out+=s.slice(start,i);continue;}
      if(s[i]==='-'||/[0-9]/.test(s[i])){const m=/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(s.slice(i));if(m){const token=m[0];out+=/^-?\d+$/.test(token)&&!Number.isSafeInteger(Number(token))?JSON.stringify(token):token;i+=token.length;continue;}}
      out+=s[i++];
    }
    return JSON.parse(out);
  }
  function xifanEncrypt(value){const raw=gzip(utf8(JSON.stringify(value))),pad=16-raw.length%16,b=new Uint8Array(raw.length+pad);b.set(raw);b.fill(pad,raw.length);for(let i=0;i<b.length;i+=16)b.set(block(b.slice(i,i+16),false),i);return base64(b);}
  function xifanDecrypt(value){try{const raw=unbase64(value);if(!raw.length||raw.length%16)throw Error();const b=new Uint8Array(raw.length);for(let i=0;i<b.length;i+=16)b.set(block(raw.slice(i,i+16),true),i);const pad=b[b.length-1];if(pad<1||pad>16||!b.slice(-pad).every(v=>v===pad))throw Error();return xifanParseJSON(text(gunzip(b.slice(0,-pad))));}catch{throw Error('喜番接口数据解密失败');}}
  function randomHex(n){let s='';while(s.length<n)s+=Math.floor(Math.random()*0x100000000).toString(16).padStart(8,'0');return s.slice(0,n);}
  const uuid=()=>randomHex(8)+'-'+randomHex(4)+'-4'+randomHex(3)+'-a'+randomHex(3)+'-'+randomHex(12);
  const validId=value=>{if(typeof value==='number'&&!Number.isSafeInteger(value))throw Error('喜番剧集 ID 精度无效');const s=String(value??'');if(!/^\d{1,30}$/.test(s))throw Error('喜番剧集 ID 无效');return s;};
  const pageNumber=value=>{const n=Number(value??1);if(!Number.isSafeInteger(n)||n<1||n>10000)throw Error('喜番页码无效');return n;};
  const episodeNumber=value=>{const n=Number(value??1);if(!Number.isSafeInteger(n)||n<1||n>10000)throw Error('喜番集数无效');return n;};
  const clean=value=>String(value??'').replace(/<[^>]*>/g,'').trim();
  const mediaURL=value=>typeof value==='string'&&/^https?:\/\/[^\s]+$/.test(value);
  class XifanClient {
    constructor(widget){this.widget=widget;this.identity=null;this.initializing=null;}
    async init(){if(!this.initializing)this.initializing=(async()=>{let d;try{d=await this.widget.storage?.get?.('xifan:identity:v1');if(typeof d==='string')d=JSON.parse(d);}catch{}
      if(!d||!/^ANDROID_[0-9a-f]{32}$/.test(d.deviceId)||!/^[0-9a-f-]{36}$/.test(d.randomDeviceId)){d={deviceId:'ANDROID_'+randomHex(32),randomDeviceId:uuid()};try{await this.widget.storage?.set?.('xifan:identity:v1',JSON.stringify(d));}catch{}}
      this.identity={deviceId:d.deviceId,randomDeviceId:d.randomDeviceId};})();await this.initializing;}
    common(){const d=this.identity;return {appVersion:'3.10.1.2',kpn:'XIFAN',channel:'XIFAN',originChannel:'XIFAN',protocolVersion:'2.0',kwaiMerchantSdkVersion:'1.1.0',SDKVersion:'3.3.55.2',SDKVersionCode:3035502,sdkApiVersion:'3.3.55.2',sdkApiVersionCode:3035502,sdkType:2,appInfo:{appId:'1091400011',name:'喜番免费短剧',packageName:'com.kwai.theater',version:'3.10.1.2'},clientFunction:{},networkInfo:{connectionType:1},geoInfo:{},kGeoInfo:{},deviceInfo:{osType:1,osBit:64,osApi:33,osVersion:'13',language:'zh',deviceId:d.deviceId,randomDeviceId:d.randomDeviceId,deviceIdTag:0,deviceModel:'Pixel 5',deviceBrand:'google',deviceVendor:'Google',screenWidth:1080,screenHeight:2340,deviceWidth:393,deviceHeight:851,platform:1,deviceBit:1,abi:'arm64',arch:'arm64-v8a'},ext:{},appUserInfo:{userRecoBit:1},requestSessionData:'',tkVersion:'5.1.4',adSdkVersion:'3.3.55.2',clientDynamicType:'0',abi:'arm64',timestamp:Date.now()};}
    async request(path,extra={}){if(!/^(?:app\/(?:homepage|search\/result|feed)|bullet\/select)$/.test(path))throw Error('喜番接口路径无效');await this.init();const p='/rest/e/tube/'+path,data=JSON.stringify({version:'3.3.55.2',appVersion:'3.10.1.2',appId:'1091400011',apiVersion:38,message:xifanEncrypt({...this.common(),...extra,timestamp:Date.now()})});
      const r=await this.widget.http.request({url:'https://tube.e.kuaishou.com'+p,method:'POST',base64Data:true,timeout:25,headers:{'Content-Type':'application/json; charset=utf-8','Ks-Encoding':'2','Ks-PkgId':'com.kwai.theater1c48a12657a227fa339710301806365b','Ks-Sig1':xifanSig1(p+'&&'+data),'User-Agent':'okhttp/3.12.13'},data});
      const status=Number(r?.statusCode??r?.status??0);if(status<200||status>=300)throw Error('喜番接口 HTTP '+status);let outer;try{outer=xifanParseJSON(text(unbase64(r.data)));}catch{throw Error('喜番接口响应数据无效');}
      if(Number(outer?.result)!==1)throw Error('喜番接口请求失败（'+String(outer?.result??'unknown')+'）');
      if(typeof outer.data!=='string')throw Error('喜番接口加密数据无效');return xifanDecrypt(outer.data);
    }
  }
  function tubeCard(t){if(!t||typeof t!=='object')throw Error('喜番列表数据无效');const id=validId(t.tubeId),total=Number(t.totalEpisodeCount??0);const tubeType=Number(t.tubeType);return {id,tubeType:[1,2,3].includes(tubeType)?tubeType:null,title:clean(t.name)||'喜番短剧',description:clean(t.summary),coverUrl:mediaURL(t.coverUrl)?t.coverUrl:mediaURL(t.thumbnailUrl)?t.thumbnailUrl:'',totalEpisodeCount:Number.isSafeInteger(total)&&total>=0?total:0};}
  function listResult(data,key,page,unwrap){if(!Array.isArray(data?.[key])||typeof data.hasMore!=='boolean')throw Error('喜番列表分页数据无效');const seen=new Set(),items=[];for(const row of data[key]){const item=tubeCard(unwrap?row?.tubeInfo:row);if(!seen.has(item.id)){seen.add(item.id);items.push(item);}}return {items,hasMore:data.hasMore,page,...(Array.isArray(data.selectInfo)?{selectInfo:data.selectInfo}:{})};}
  function parseManifest(video){if(typeof video?.manifest!=='string'||!video.manifest) return {resources:[],durationSeconds:0};let manifest;try{manifest=xifanParseJSON(video.manifest);}catch{throw Error('喜番播放清单无效');}if(!Array.isArray(manifest?.adaptationSet))throw Error('喜番播放清单无效');
    const candidates=[],durations=[];for(const set of manifest.adaptationSet){const duration=Number(set.duration);if(Number.isFinite(duration)&&duration>0)durations.push(duration/1000);if(!Array.isArray(set.representation))continue;for(const rep of set.representation){if(rep.hidden===true||rep.hidden===1)continue;const codec=[rep.codecs,rep.videoCodec,set.vcodec].map(v=>typeof v==='string'?v.trim().toLowerCase():'').map(v=>/avc|h264|h\.264/.test(v)?'avc':/hevc|hvc|h265|h\.265/.test(v)?'hevc':null).find(Boolean),avc=codec==='avc';const urls=[rep.url,...(Array.isArray(rep.backupUrl)?rep.backupUrl:[])].filter(mediaURL);if(urls.length)candidates.push({urls,avc,quality:Number(rep.height??rep.quality??0)||0,label:clean(rep.qualityLabel)});}}
    candidates.sort((a,b)=>Number(b.avc)-Number(a.avc)||b.quality-a.quality);const selected=candidates[0],resources=selected?[...new Set(selected.urls)].map((url,i)=>({url,name:'喜番短剧'+(selected.label?' '+selected.label:'')+(i?' 备用'+i:''),format:/\.m3u8(?:\?|$)/i.test(url)?'hls':'auto'})):[];return {resources,durationSeconds:Math.max(0,...durations)};
  }
  class XifanService {
    constructor(client){this.client=client;this.details=new Map();}
    async list(page=1){page=pageNumber(page);const d=await this.client.request('app/homepage',{tubeParam:{pcursor:page,recommendType:1,historyTubeIdList:[],teenagerMode:false,selectInfoList:[]}});return listResult(d,'tubeInfoList',page,false);}
    async search(keyword,page=1){page=pageNumber(page);keyword=String(keyword??'').trim();if(!keyword)return {items:[],hasMore:false,page};const d=await this.client.request('app/search/result',{searchParam:{searchContent:keyword,pcursor:page,pcount:15,pageSource:1,moduleSource:'USER_INPUT_BAR',landingPageSelectInfos:[],historyQueryList:[]}});return listResult(d,'resultList',page,true);}
    async detail(id){id=validId(id);let item,total,pages=1;const episodes=[],ids=new Set(),numbers=new Set();
      for(let page=1;page<=pages;page++){const d=await this.client.request('app/feed',{tubeParam:{tubeId:id,pcursor:page,pcount:30,jumpSource:0,feedJumpSource:0}});if(validId(d?.tubeInfo?.tubeId)!==id)throw Error('喜番剧集返回不匹配');const current=Number(d.tubeInfo.totalEpisodeCount);if(!Number.isSafeInteger(current)||current<1||current>10000)throw Error('喜番总集数无效');if(page===1){item=tubeCard(d.tubeInfo);total=current;pages=Math.ceil(total/30);}else if(current!==total)throw Error('喜番分页总集数变化');
        if(!Array.isArray(d.tubeAppFeedDetailList)||!d.tubeAppFeedDetailList.length)throw Error('喜番分集分页缺失');let added=0;
        for(const row of d.tubeAppFeedDetailList){const photo=row?.photoInfo,e=photo?.tubeEpisode;if(!e)throw Error('喜番分集数据无效');if(validId(e.tubeId)!==id)throw Error('喜番分集剧集不匹配');if(row.tubeInfo&&validId(row.tubeInfo.tubeId)!==id)throw Error('喜番分集剧集不匹配');const episodeId=validId(e.episodeId),origin=validId(e.episodeIdOrigin),number=episodeNumber(e.episodeNumber);if(number>total){total=number;pages=Math.max(pages,Math.ceil(total/30));}if(ids.has(episodeId)||numbers.has(number))throw Error('喜番分集分页重复');ids.add(episodeId);numbers.add(number);added++;
          const cover=mediaURL(photo.coverInfo?.coverUrl)?photo.coverInfo.coverUrl:item.coverUrl,m=parseManifest(photo.videoInfo);episodes.push({episodeId,episodeIdOrigin:origin,episodeNumber:number,locked:e.locked!==false,paid:Number(e.free)===2&&(item.tubeType===3||item.tubeType===null),free:e.free,coverUrl:cover,durationSeconds:m.durationSeconds,resources:m.resources});
        }if(!added)throw Error('喜番分集分页未推进');
      }
      if(episodes.length===0)throw Error('喜番分集分页不完整');episodes.sort((a,b)=>a.episodeNumber-b.episodeNumber);for(let i=0;i<episodes.length;i++)if(episodes[i].episodeNumber!==i+1)throw Error('喜番分集编号不完整');const result={...item,totalEpisodeCount:total,episodes};this.details.set(id,result);return result;
    }
    async resources(id,episode=1){const number=episodeNumber(episode),detail=await this.detail(id),e=detail.episodes.find(x=>x.episodeNumber===number);if(!e)throw Error('喜番集数不存在');if(e.locked||e.paid)throw Error('喜番锁定或付费剧集暂不提供');if(!e.resources.length)throw Error('喜番未返回公开播放地址');return e.resources.map(r=>({...r,playerType:'app',headers:{},title:detail.title,episode:number}));}
    async comments(id,episode=1,options={}){id=validId(id);const number=episodeNumber(episode),detail=this.details.get(id)??await this.detail(id),e=detail.episodes.find(x=>x.episodeNumber===number);if(!e)throw Error('喜番集数不存在');if(!(e.durationSeconds>0)||e.durationSeconds>21600)throw Error('喜番分集时长无效');let first=1,last=Math.ceil(e.durationSeconds/30);if(options.segmentTime!==undefined){const t=Number(options.segmentTime);if(!Number.isFinite(t)||t<0)throw Error('喜番弹幕时间无效');if(t>=e.durationSeconds)return [];first=Math.floor(t/30)+1;last=first;}
      const seen=new Set(),comments=[];for(let block=first;block<=last;block++){const rows=await this.client.request('bullet/select',{bulletParam:{episodeId:e.episodeId,pcursor:block}});if(!Array.isArray(rows))throw Error('喜番弹幕数据无效');for(const row of rows){const bulletId=validId(row?.bulletId),position=Number(row.position);if(!Number.isSafeInteger(position)||position<0)throw Error('喜番弹幕时间数据无效');if(options.segmentTime!==undefined&&(position<(first-1)*30000||position>=Math.min(first*30000,e.durationSeconds*1000)))continue;if(seen.has(bulletId))continue;seen.add(bulletId);const text=clean(row.content);if(!text)continue;const color=parseColor(row.color),id='xifan:'+e.episodeId+':'+bulletId;comments.push({id,cid:id,p:[position/1000,1,color,25].join(','),time:position/1000,text,color,mode:1,source:'xifan',episodeId:e.episodeId});}}
      return comments.sort((a,b)=>a.time-b.time||a.id.localeCompare(b.id));
    }
  }
  function parseColor(value){if(typeof value==='number'&&Number.isSafeInteger(value))return value&0xffffff;const s=String(value??'');if(/^#?[0-9a-f]{6}$/i.test(s))return parseInt(s.replace('#',''),16);if(/^\d+$/.test(s)&&Number.isSafeInteger(Number(s)))return Number(s)&0xffffff;return 0xffffff;}
  let service;const getService=()=>service||(service=new XifanService(new XifanClient(Widget)));
  const XifanAPI={list:(...a)=>getService().list(...a),search:(...a)=>getService().search(...a),detail:(...a)=>getService().detail(...a),resources:(...a)=>getService().resources(...a),comments:(...a)=>getService().comments(...a)};
  Object.assign(globalThis,{XifanAPI,XifanClient,XifanService,xifanSig1,xifanEncrypt,xifanDecrypt,xifanParseJSON});
})();

/*! 喜番短剧 Rex 独立模块适配器；由 build-xifan.mjs 与共享核心组装。 */
(() => {
  const api=globalThis.XifanAPI;
  const card=item=>({id:'xifan:'+item.id,type:'url',mediaType:'tv',title:item.title,description:item.description,coverUrl:item.coverUrl,posterPath:item.coverUrl,backdropPath:item.coverUrl,remark:item.totalEpisodeCount?'全'+item.totalEpisodeCount+'集':'',link:'xifan://drama/'+item.id});
  function linkId(link){const m=typeof link==='string'&&/^xifan:\/\/drama\/(\d{1,30})$/.exec(link);if(!m)throw Error('喜番链接无效');return m[1];}
  async function loadList(params={}){return (await api.list(params.page)).items.map(card);}
  async function search(params={}){return (await api.search(params.keyword??params.query,params.page)).items.map(card);}
  async function loadDetail(link){const id=linkId(link),detail=await api.detail(id),item=card(detail);item.playerType='app';item.episodeItems=detail.episodes.map(e=>({id:'xifan:'+id+':1:'+e.episodeNumber,type:'url',mediaType:'tv',title:item.title,description:'第'+e.episodeNumber+'集'+(e.paid?' · 付费':e.locked?' · 锁定':''),coverUrl:e.coverUrl,posterPath:e.coverUrl,backdropPath:e.coverUrl,episode:e.episodeNumber,episodeNumber:e.episodeNumber,season:1,seasonNumber:1,link:item.link,playerType:'app'}));return item;}
  async function loadResource(params={}){return api.resources(linkId(params.link),params.episode??params.episodeNumber??1);}
  const WidgetMetadata={id:'forward.xifan.short-drama',title:'喜番短剧',version:'1.0.0',requiredVersion:'0.0.1',author:'balge',site:'',detailCacheDuration:120,description:'喜番短剧的分类、搜索和播放。',modules:[
    {id:'discover',title:'剧场',functionName:'loadList',cacheDuration:120,params:[{name:'page',title:'页码',type:'page'}]},
    {id:'search',title:'搜索',functionName:'search',cacheDuration:60,params:[{name:'keyword',title:'关键词',type:'input'},{name:'page',title:'页码',type:'page'}]},
    {id:'loadResource',title:'播放资源',functionName:'loadResource',type:'stream',cacheDuration:0,params:[]}
  ],search:{title:'搜索',functionName:'search',params:[{name:'keyword',title:'关键词',type:'input'},{name:'page',title:'页码',type:'page'}]}};
  Object.assign(globalThis,{WidgetMetadata,loadList,search,loadDetail,loadResource});
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
  var NAME = "喜番短剧";
  var META = (typeof WidgetMetadata !== 'undefined') ? WidgetMetadata : {};
  function pid(row) { return String(row.id || '').replace(/^xifan:/, ''); }
  function linkOf(id) { return 'xifan://drama/' + id; }
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
