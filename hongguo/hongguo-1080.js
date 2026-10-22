// @nshort {"id":"hongguo-1080","name":"红果官方1080p","version":"1.1.0","hosts":["api5-normal-sinfonlineb.fqnovel.com","hongguoduanju.com","p3-reading-sign.fqnovelpic.com","snssdk.com","toutiaovod.com","douyinvod.com","v3-reading-videocdn302.qznovelvod.com"]}
// 纯 JS 复现官方 x-argus / x-gorgon / x-ladon / x-khronos，不加载 libmetasec_ml.so。
// App 高清/CENC 优先，失败回退同集公开网页；需要支持 cencKey 契约的 N果版本。
// 红果播放签名：纯 JS 实现（无 Node/原生依赖，可直接跑在 nshort QuickJS 插件里）
// 覆盖 x-gorgon / x-khronos / x-ss-stub / x-argus / x-ladon。
// 算法来自 libmetasec_ml.so 行为的软件复现，不加载 .so。

const MASK64 = (1n << 64n) - 1n;
const MASK32 = 0xffffffffn;

// ---------- 字节工具 ----------
function utf8(text) {
  const out = [];
  for (let i = 0; i < text.length; i++) {
    let c = text.charCodeAt(i);
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    else if (c < 0xd800 || c >= 0xe000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    else {
      const cp = 0x10000 + ((c - 0xd800) << 10) + (text.charCodeAt(++i) - 0xdc00);
      out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
    }
  }
  return Uint8Array.from(out);
}

function hexBytes(hex) {
  const out = new Uint8Array(hex.length >> 1);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function base64(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i], b = bytes[i + 1], c = bytes[i + 2];
    out += B64[a >> 2];
    out += B64[((a & 3) << 4) | ((b ?? 0) >> 4)];
    out += b === undefined ? "=" : B64[((b & 15) << 2) | ((c ?? 0) >> 6)];
    out += c === undefined ? "=" : B64[c & 63];
  }
  return out;
}

function concat(...parts) {
  let len = 0;
  for (const p of parts) len += p.length;
  const out = new Uint8Array(len);
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
}

function pad16(data) {
  const padding = 16 - (data.length % 16);
  const out = new Uint8Array(data.length + padding);
  out.set(data);
  out.fill(padding, data.length);
  return out;
}

const rotl32 = (x, n) => ((x << n) | (x >>> (32 - n))) >>> 0;
const rotl8 = (x, n) => (((x << n) | (x >>> (8 - n))) & 0xff);
const rotl64 = (x, n) => {
  const k = BigInt(n);
  return ((x << k) | (x >> (64n - k))) & MASK64;
};
const rotr64 = (x, n) => rotl64(x, 64 - n);

function u64le(bytes, at) {
  let v = 0n;
  for (let i = 7; i >= 0; i--) v = (v << 8n) | BigInt(bytes[at + i]);
  return v;
}

function putU64le(out, at, value) {
  let v = value & MASK64;
  for (let i = 0; i < 8; i++) { out[at + i] = Number(v & 0xffn); v >>= 8n; }
}

// ---------- MD5 ----------
const MD5_S = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
const MD5_K = (() => {
  const k = new Uint32Array(64);
  for (let i = 0; i < 64; i++) k[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) >>> 0;
  return k;
})();

function md5(msg) {
  const len = msg.length;
  const total = Math.ceil((len + 9) / 64) * 64;
  const buf = new Uint8Array(total);
  buf.set(msg);
  buf[len] = 0x80;
  const view = new DataView(buf.buffer);
  const bits = len * 8;
  view.setUint32(total - 8, bits >>> 0, true);
  view.setUint32(total - 4, Math.floor(bits / 4294967296), true);

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  const w = new Uint32Array(16);
  for (let off = 0; off < total; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(off + i * 4, true);
    let a = a0, b = b0, c = c0, d = d0;
    for (let i = 0; i < 64; i++) {
      let f, g;
      if (i < 16) { f = (b & c) | (~b & d); g = i; }
      else if (i < 32) { f = (d & b) | (~d & c); g = (5 * i + 1) % 16; }
      else if (i < 48) { f = b ^ c ^ d; g = (3 * i + 5) % 16; }
      else { f = c ^ (b | ~d); g = (7 * i) % 16; }
      const tmp = d;
      d = c;
      c = b;
      b = (b + rotl32((a + f + MD5_K[i] + w[g]) >>> 0, MD5_S[i])) >>> 0;
      a = tmp;
    }
    a0 = (a0 + a) >>> 0; b0 = (b0 + b) >>> 0; c0 = (c0 + c) >>> 0; d0 = (d0 + d) >>> 0;
  }
  const out = new Uint8Array(16);
  const ov = new DataView(out.buffer);
  ov.setUint32(0, a0, true); ov.setUint32(4, b0, true); ov.setUint32(8, c0, true); ov.setUint32(12, d0, true);
  return out;
}

// ---------- SM3 ----------
const SM3_IV = [0x7380166f, 0x4914b2b9, 0x172442d7, 0xda8a0600, 0xa96f30bc, 0x163138aa, 0xe38dee4d, 0xb0fb0e4e];

function sm3(input) {
  const bits = input.length * 8;
  let data = new Uint8Array(Math.ceil((input.length + 9) / 64) * 64);
  data.set(input);
  data[input.length] = 0x80;
  const dv = new DataView(data.buffer);
  dv.setUint32(data.length - 8, Math.floor(bits / 4294967296), false);
  dv.setUint32(data.length - 4, bits >>> 0, false);

  const state = SM3_IV.slice();
  for (let off = 0; off < data.length; off += 64) {
    const words = new Uint32Array(68);
    for (let i = 0; i < 16; i++) words[i] = dv.getUint32(off + i * 4, false);
    for (let i = 16; i < 68; i++) {
      const v = (words[i - 16] ^ words[i - 9] ^ rotl32(words[i - 3], 15)) >>> 0;
      words[i] = (v ^ rotl32(v, 15) ^ rotl32(v, 23) ^ rotl32(words[i - 13], 7) ^ words[i - 6]) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = state;
    for (let i = 0; i < 64; i++) {
      let t, ff, gg;
      if (i < 16) { t = 0x79cc4519; ff = a ^ b ^ c; gg = e ^ f ^ g; }
      else { t = 0x7a879d8a; ff = (a & b) | (a & c) | (b & c); gg = (e & f) | (~e & g); }
      const ss1 = rotl32((rotl32(a, 12) + e + rotl32(t, i % 32)) >>> 0, 7);
      const tt1 = (ff + d + (ss1 ^ rotl32(a, 12)) + (words[i] ^ words[i + 4])) >>> 0;
      const tt2 = (gg + h + ss1 + words[i]) >>> 0;
      d = c; c = rotl32(b, 9); b = a; a = tt1;
      h = g; g = rotl32(f, 19); f = e;
      e = (tt2 ^ rotl32(tt2, 9) ^ rotl32(tt2, 17)) >>> 0;
    }
    state[0] = (state[0] ^ a) >>> 0; state[1] = (state[1] ^ b) >>> 0;
    state[2] = (state[2] ^ c) >>> 0; state[3] = (state[3] ^ d) >>> 0;
    state[4] = (state[4] ^ e) >>> 0; state[5] = (state[5] ^ f) >>> 0;
    state[6] = (state[6] ^ g) >>> 0; state[7] = (state[7] ^ h) >>> 0;
  }
  const out = new Uint8Array(32);
  const ov = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) ov.setUint32(i * 4, state[i], false);
  return out;
}

// ---------- AES-128 ----------
const SBOX = (() => {
  const hex = "637c777bf26b6fc53001672bfed7ab76ca82c97dfa5947f0add4a2af9ca472c0b7fd9326363ff7cc34a5e5f171d8311504c723c31896059a071280e2eb27b27509832c1a1b6e5aa0523bd6b329e32f8453d100ed20fcb15b6acbbe394a4c58cfd0efaafb434d338545f9027f503c9fa851a3408f929d38f5bcb6da2110fff3d2cd0c13ec5f974417c4a77e3d645d197360814fdc222a908846eeb814de5e0bdbe0323a0a4906245cc2d3ac629195e479e7c8376d8dd54ea96c56f4ea657aae08ba78252e1ca6b4c6e8dd741f4bbd8b8a703eb5664803f60e613557b986c11d9ee1f8981169d98e949b1e87e9ce5528df8ca1890dbfe6426841992d0fb054bb16";
  const out = new Uint8Array(256);
  for (let i = 0; i < 256; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
})();

function xtime(a) { return ((a << 1) ^ (a & 0x80 ? 0x1b : 0)) & 0xff; }
function gmul(a, b) {
  let p = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) p ^= a;
    const hi = a & 0x80;
    a = (a << 1) & 0xff;
    if (hi) a ^= 0x1b;
    b >>= 1;
  }
  return p;
}

function aes128ExpandKey(key) {
  const w = new Uint8Array(176);
  w.set(key);
  let rcon = 1;
  for (let i = 16; i < 176; i += 4) {
    let t = w.subarray(i - 4, i);
    if (i % 16 === 0) {
      t = Uint8Array.from([SBOX[t[1]] ^ rcon, SBOX[t[2]], SBOX[t[3]], SBOX[t[0]]]);
      rcon = xtime(rcon);
    }
    for (let j = 0; j < 4; j++) w[i + j] = w[i - 16 + j] ^ t[j];
  }
  return w;
}

function aesEncryptBlock(roundKeys, block) {
  const s = Uint8Array.from(block);
  for (let i = 0; i < 16; i++) s[i] ^= roundKeys[i];
  for (let round = 1; round <= 10; round++) {
    for (let i = 0; i < 16; i++) s[i] = SBOX[s[i]];
    const t = Uint8Array.from(s);
    s[1] = t[5]; s[5] = t[9]; s[9] = t[13]; s[13] = t[1];
    s[2] = t[10]; s[6] = t[14]; s[10] = t[2]; s[14] = t[6];
    s[3] = t[15]; s[7] = t[3]; s[11] = t[7]; s[15] = t[11];
    if (round !== 10) {
      for (let c = 0; c < 4; c++) {
        const a = c * 4;
        const b0 = s[a], b1 = s[a + 1], b2 = s[a + 2], b3 = s[a + 3];
        s[a] = gmul(b0, 2) ^ gmul(b1, 3) ^ b2 ^ b3;
        s[a + 1] = b0 ^ gmul(b1, 2) ^ gmul(b2, 3) ^ b3;
        s[a + 2] = b0 ^ b1 ^ gmul(b2, 2) ^ gmul(b3, 3);
        s[a + 3] = gmul(b0, 3) ^ b1 ^ b2 ^ gmul(b3, 2);
      }
    }
    for (let i = 0; i < 16; i++) s[i] ^= roundKeys[round * 16 + i];
  }
  return s;
}

function aes128cbcEncrypt(key, iv, data) {
  const roundKeys = aes128ExpandKey(key);
  const out = new Uint8Array(data.length);
  let prev = Uint8Array.from(iv);
  for (let off = 0; off < data.length; off += 16) {
    const block = new Uint8Array(16);
    for (let i = 0; i < 16; i++) block[i] = data[off + i] ^ prev[i];
    const enc = aesEncryptBlock(roundKeys, block);
    out.set(enc, off);
    prev = enc;
  }
  return out;
}

// ---------- 签名 ----------
const ARGUS_KEY = hexBytes("ac1adaae95a7af94a5114ab3b3a97dd80050aa0a39314c40528caec95256c28c");

function protoVarint(bytes, field, value) {
  // field: 1-based; wire type 0
  return concat(bytes, uvarint(field * 8), uvarint(value));
}
function protoBytes(bytes, field, value) {
  return concat(bytes, uvarint(field * 8 + 2), uvarint(value.length), value);
}
function uvarint(value) {
  let v = BigInt(value);
  const out = [];
  while (v >= 0x80n) { out.push(Number((v & 0x7fn) | 0x80n)); v >>= 7n; }
  out.push(Number(v));
  return Uint8Array.from(out);
}

// 官方播放接口 x-argus
function argus(query, body, timestamp, deviceId, nonce) {
  const md5body = body ? md5(body) : null;
  const bodyHash = body ? sm3(md5body) : sm3(new Uint8Array(16));
  const queryHash = sm3(utf8(query || ""));

  let counters = protoVarint(new Uint8Array(0), 1, 1);
  counters = protoVarint(counters, 2, 1);
  counters = protoVarint(counters, 3, 1);
  counters = protoVarint(counters, 7, 3348294860);

  let environment = protoBytes(new Uint8Array(0), 1, utf8("25053RT47C"));
  environment = protoBytes(environment, 2, utf8("16"));
  environment = protoBytes(environment, 3, utf8("update_64"));
  environment = protoVarint(environment, 4, 2147483648);

  let msg = protoVarint(new Uint8Array(0), 1, 0x20200929 * 2);
  msg = protoVarint(msg, 2, 2);
  msg = protoVarint(msg, 3, (nonce[6] | (nonce[7] << 8) | (nonce[8] << 16) | (nonce[9] << 24)) & 0x7fffffff);
  msg = protoBytes(msg, 4, utf8("8662"));
  msg = protoBytes(msg, 5, utf8(deviceId));
  msg = protoBytes(msg, 6, utf8("1611921764"));
  msg = protoBytes(msg, 7, utf8("7.3.5.32"));
  msg = protoBytes(msg, 8, utf8("v04.07.01-ml-android"));
  msg = protoVarint(msg, 9, 135135744);
  msg = protoBytes(msg, 10, new Uint8Array(8));
  msg = protoVarint(msg, 11, 0);
  msg = protoVarint(msg, 12, timestamp * 2);
  msg = protoBytes(msg, 13, bodyHash.subarray(0, 6));
  msg = protoBytes(msg, 14, queryHash.subarray(0, 6));
  msg = protoBytes(msg, 15, counters);
  msg = protoBytes(msg, 16, new Uint8Array(0));
  msg = protoBytes(msg, 20, utf8("none"));
  msg = protoVarint(msg, 21, 738);
  msg = protoBytes(msg, 23, environment);
  msg = protoVarint(msg, 25, 2);

  let data = pad16(msg);

  const seed = concat(ARGUS_KEY, Uint8Array.from([0x3c, 0xcc, 0x56, 0x7b]), ARGUS_KEY);
  const derived = sm3(seed);
  const rounds = new Array(72);
  const dv = new DataView(derived.buffer);
  for (let i = 0; i < 4; i++) rounds[i] = dv.getBigUint64(i * 8, true);
  let acc = 0;
  for (let i = 4; i < 72; i++) {
    let mixed = rotr64(rounds[i - 1], 3) ^ rounds[i - 3];
    mixed = (mixed ^ rotr64(mixed, 1)) & MASK64;
    const shift = BigInt((i - 4) % 62);
    const bit = (0x3dc94c3a046d678bn >> shift) & 1n;
    rounds[i] = ((~rounds[i - 4]) & MASK64) ^ mixed ^ bit ^ 3n;
  }

  for (let off = 0; off < data.length; off += 16) {
    let left = u64le(data, off), right = u64le(data, off + 8);
    for (const round of rounds) {
      const next = (left ^ (rotl64(right, 1) & rotl64(right, 8)) ^ rotl64(right, 2) ^ round) & MASK64;
      left = right; right = next;
    }
    putU64le(data, off, left);
    putU64le(data, off + 8, right);
  }

  const xorKey = [0xd0, 0x4f, 0xfd, 0xff, 0xd0, 0x4f, 0xfd, 0xff];
  for (let i = 0; i < data.length; i++) data[i] ^= xorKey[i % 8];
  const prefixed = concat(Uint8Array.from(xorKey), data);
  const reversed = Uint8Array.from(prefixed).reverse();

  let container = concat(Uint8Array.from([0xa6, 0xe7, 0x83, 0xee, 0x70, 0x01, 0x10, 0x09, 0x18]), reversed);
  container = pad16(concat(container, Uint8Array.from([0x56, 0x7b])));

  const aesKey = md5(ARGUS_KEY.subarray(0, 16));
  const iv = md5(ARGUS_KEY.subarray(16, 32));
  const cipherText = aes128cbcEncrypt(aesKey, iv, container);
  return base64(concat(Uint8Array.from([0x3c, 0xcc]), cipherText));
}

// 官方播放接口 x-ladon
function ladon(aid, timestamp, prefix) {
  const digestBytes = utf8(hexString(md5(concat(prefix, utf8(aid)))));
  let left = u64le(digestBytes, 0);
  let right = u64le(digestBytes, 8);
  let queue = [u64le(digestBytes, 16), u64le(digestBytes, 24)];
  const keys = new Array(34);
  for (let i = 0; i < 34; i++) {
    keys[i] = left;
    const mixed = ((rotr64(right, 8) + left) & MASK64) ^ BigInt(i);
    queue.push(mixed);
    left = (mixed ^ rotl64(left, 3)) & MASK64;
    right = queue.shift();
  }
  let data = pad16(utf8(`${timestamp}-1611921764-${aid}`));
  for (let off = 0; off < data.length; off += 16) {
    let l = u64le(data, off), r = u64le(data, off + 8);
    for (const key of keys) {
      r = (key ^ ((l + rotr64(r, 8)) & MASK64)) & MASK64;
      l = (r ^ rotl64(l, 3)) & MASK64;
    }
    putU64le(data, off, l);
    putU64le(data, off + 8, r);
  }
  return base64(concat(prefix, data));
}

function hexString(bytes) {
  let s = "";
  for (const b of bytes) s += b.toString(16).padStart(2, "0");
  return s;
}

// x-gorgon（播放接口与普通接口同一套变换）
function gorgon(rawQuery, body, timestamp) {
  const qh = md5(utf8(rawQuery || ""));
  const payload = new Uint8Array(20);
  payload.set(qh.subarray(0, 4), 0);
  let stub = null;
  if (body) {
    const bh = md5(body);
    payload.set(bh.subarray(0, 4), 4);
    stub = hexString(bh).toUpperCase();
  }
  payload.set([0, 6, 11, 28], 12);
  new DataView(payload.buffer).setUint32(16, timestamp, false);
  const key = [0x44, 0xb9, 0xb9, 0xd9, 0xa4, 0xae, 0xf9, 0xfc, 0xa4, 0x93, 0xaa, 0x75, 0x7c, 0xa3, 0xc2, 0xc4, 0xa4, 0x96, 0x93, 0x8f];
  for (let i = 0; i < 20; i++) payload[i] ^= key[i];
  for (let i = 0; i < 20; i++) {
    const mixed = rotl8(payload[i], 4) ^ payload[(i + 1) % 20];
    payload[i] = reverse8(mixed) ^ 0xff ^ 20;
  }
  const signature = concat(Uint8Array.from([0x84, 0x04, 0x40, 0x1c, 0, 0]), payload);
  return { gorgon: hexString(signature), ssStub: stub };
}

function reverse8(x) {
  let v = x & 0xff, out = 0;
  for (let i = 0; i < 8; i++) { out = (out << 1) | (v & 1); v >>= 1; }
  return out & 0xff;
}

// 一次生成全部请求头
function signPlayerRequest({ query = "", body = null, deviceId = "", aid = "1967", timestamp = Math.floor(Date.now() / 1000), nonce = null }) {
  const n = nonce || Uint8Array.from(Array.from({ length: 11 }, () => Math.floor(Math.random() * 256)));
  const ts = timestamp >>> 0;
  const bodyBytes = body == null ? null : (typeof body === "string" ? utf8(body) : body);
  const { gorgon: xGorgon, ssStub } = gorgon(query, bodyBytes, ts);
  const headers = {
    "X-Khronos": String(ts),
    "X-Gorgon": xGorgon,
    "X-SS-Req-Ticket": String(Date.now()),
    "X-Argus": argus(query, bodyBytes, ts, deviceId, n),
    "X-Ladon": ladon(aid, ts, n.subarray(2, 6)),
  };
  if (ssStub) headers["X-SS-STUB"] = ssStub;
  return headers;
}

// ---------- 红果官方接口 ----------
const API = "https://api5-normal-sinfonlineb.fqnovel.com";
const WEB = "https://hongguoduanju.com";
const AID = "8662";
const UA = "Mozilla/5.0 (Linux; Android 16; 25053RT47C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36";

// 固定游客设备身份，避免每次请求被当成新设备
const DEVICE_ID = "3186729450137468217";
const IID = "3186729450137468217";
const CDID = "6f5a1c3e-9b84-4c2d-8a17-2e0d5b9c4f01";

// 目录分类：与 nshort 内置红果分类 key 一致
const GENRES = {
  short_play: { scene: "default", name: "真人剧" },
  comic_series: { scene: "comic_series", name: "漫剧" },
  ai_series: { scene: "ai_series", name: "AI剧" },
};

function baseQuery() {
  return [
    "ac=wifi",
    "aid=" + AID,
    "app_name=novelread",
    "cdid=" + CDID,
    "channel=update_64",
    "device_brand=Redmi",
    "device_id=" + DEVICE_ID,
    "device_platform=android",
    "device_type=25053RT47C",
    "dpi=520",
    "iid=" + IID,
    "language=zh",
    "manifest_version_code=73532",
    "os=android",
    "os_api=36",
    "os_version=16",
    "resolution=1280*2772",
    "ssmix=a",
    "update_version_code=73532",
    "version_code=73532",
    "version_name=7.3.5.32",
  ].join("&");
}

async function apiRequest(path, payload, player = false) {
  const query = baseQuery() + (player
    ? "&host_abi=arm64-v8a&dragon_device_type=phone&pv_player=71332&compliance_status=0&need_personal_recommend=1&player_so_load=1&is_android_pad_screen=0"
    : "");
  const body = JSON.stringify(payload);
  const headers = signPlayerRequest({ query, body, deviceId: DEVICE_ID, aid: AID });
  headers["Content-Type"] = "application/json";
  const response = await fetch(API + path + "?" + query, { method: "POST", headers, body });
  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (_) {
    throw Error("接口返回非 JSON");
  }
  if (json && json.code != null && Number(json.code) !== 0) {
    throw Error("接口错误 " + json.code + " " + (json.message || ""));
  }
  return json;
}

async function webText(path) {
  const response = await fetch(WEB + path, {
    method: "GET",
    headers: { "User-Agent": UA, "Referer": WEB + "/", "Accept": "text/html" },
  });
  return response.text();
}

// 网页把状态放在 window._ROUTER_DATA = {...}
function parseRouterData(html) {
  const match = /_ROUTER_DATA\s*=\s*/.exec(html);
  if (!match) return null;
  let at = match.index + match[0].length;
  while (at < html.length && html[at] !== "{") at++;
  const start = at;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (; at < html.length; at++) {
    const ch = html[at];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        at++;
        break;
      }
    }
  }
  try {
    return JSON.parse(html.slice(start, at));
  } catch (_) {
    return null;
  }
}

function loaderPage(data, prefix) {
  const loader = data && data.loaderData;
  if (!loader || typeof loader !== "object") return null;
  const keys = Object.keys(loader);
  for (const key of keys) if (key.indexOf(prefix) === 0 && key.indexOf("/page") >= 0) return loader[key];
  for (const key of keys) if (key.indexOf(prefix) === 0 && loader[key] && typeof loader[key] === "object") return loader[key];
  return null;
}

function numericID(value) {
  const text = String(value == null ? "" : value);
  return /^\d+$/.test(text) ? text : "";
}

function dramaFromAny(row, genre) {
  if (!row || typeof row !== "object") return null;
  const vd = row.video_data && typeof row.video_data === "object" ? row.video_data : row;
  const id = numericID(vd.series_id_str || vd.series_id || row.series_id_str || row.series_id || vd.keyword || row.keyword);
  if (!id) return null;
  const title = vd.series_title || vd.series_name || vd.title || row.series_name || row.name || id;
  const item = { id, title: String(title), intro: String(vd.series_intro || vd.video_desc || row.series_intro || "") };
  const cover = vd.series_cover || vd.cover || row.series_cover;
  if (typeof cover === "string" && /^https:\/\//.test(cover)) item.cover = cover;
  const count = Number(vd.episode_cnt || row.episode_cnt || 0);
  if (count > 0) item.episodes = count;
  if (genre) item.genre = genre;
  return item;
}

// ---------- 目录 / 搜索 / 详情 ----------
async function catalog({ category = "" } = {}) {
  const key = GENRES[category] ? category : "short_play";
  const genre = GENRES[key];
  const json = await apiRequest("/reading/distribution/category/landpage/v/", {
    req_scene: genre.scene,
    offset: 0,
    limit: 18,
    req_type: "only_content",
    need_selector_panel: false,
    client_req_type: 3,
    session_id: "",
    filter_ids: "",
    select_items: {
      genre: [key],
      sort: ["online_time"],
      gender: [],
      category_dim_theme: [],
      category_dim_role: [],
      category_dim_epoch: [],
      online_time: [],
      creation_status: [],
    },
  });
  const data = (json && json.data) || {};
  const rows = Array.isArray(data.video_data) ? data.video_data : [];
  const items = [];
  const seen = {};
  for (const row of rows) {
    const item = dramaFromAny(row, genre.name);
    if (item && !seen[item.id]) {
      seen[item.id] = true;
      items.push(item);
    }
  }
  return { items, hasMore: Boolean(data.has_more) };
}

async function search({ query = "" } = {}) {
  const keyword = String(query).trim();
  if (!keyword) return { items: [], hasMore: false };
  const html = await webText("/search/" + encodeURIComponent(keyword));
  const page = loaderPage(parseRouterData(html), "search_");
  if (!page) throw Error("搜索页未返回数据");
  const rows = Array.isArray(page.searchList) ? page.searchList : [];
  const items = [];
  const seen = {};
  for (const row of rows) {
    const item = dramaFromAny(row, "短剧");
    if (item && !seen[item.id]) {
      seen[item.id] = true;
      items.push(item);
    }
  }
  return { items, hasMore: false };
}

async function detail({ id } = {}) {
  const seriesID = numericID(id);
  if (!seriesID) throw Error("剧集编号无效");
  const json = await apiRequest("/novel/player/video_detail/v1/", { series_id: seriesID });
  const data = (json && json.data && json.data.video_data) || {};
  const returned = numericID(data.series_id_str || data.series_id);
  if (returned && returned !== seriesID) throw Error("接口返回了其他剧集");
  const list = Array.isArray(data.video_list) ? data.video_list : [];
  const chapters = [];
  const seen = {};
  for (const row of list) {
    const vid = numericID(row && row.vid);
    const index = Number(row && row.vid_index);
    if (!vid || !(index >= 1) || seen[vid]) continue;
    if (row.series_id && numericID(row.series_id) && numericID(row.series_id) !== seriesID) continue;
    seen[vid] = true;
    chapters.push({ id: vid, title: "第" + index + "集", index });
  }
  chapters.sort((left, right) => left.index - right.index);
  if (!chapters.length) throw Error("目录为空，可稍后重试");
  const drama = dramaFromAny({...data, series_id_str:seriesID});
  return { drama, chapters };
}

// ---------- 播放 ----------
function pickModel(json, episodeID) {
  const data = (json && json.data) || {};
  const parse = (value) => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch (_) {
        return null;
      }
    }
    return value && typeof value === "object" ? value : null;
  };
  let model = parse(data.video_model);
  if (!model && data[episodeID]) model = parse(data[episodeID].video_model);
  if (!model) throw Error("未取得视频模型");
  return model;
}

function variantList(model) {
  const raw = model.video_list;
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") return Object.keys(raw).sort().map((key) => raw[key]);
  return [];
}

function decodeBase64(value, limit) {
  if (typeof value !== "string" || value.length > limit) throw Error("Base64 数据无效");
  const text = value.trim();
  if (!text || text.length % 4 === 1 || !/^[A-Za-z0-9+/]*={0,2}$/.test(text) ||
      (text.indexOf("=") >= 0 && text.length % 4 !== 0)) throw Error("Base64 编码无效");
  const out = [];
  let accumulator = 0, bits = 0;
  for (const char of text.replace(/=+$/, "")) {
    accumulator = (accumulator << 6) | B64.indexOf(char);
    bits += 6;
    if (bits >= 8) { bits -= 8; out.push((accumulator >>> bits) & 255); }
  }
  if (bits && (accumulator & ((1 << bits) - 1))) throw Error("Base64 尾部无效");
  return Uint8Array.from(out);
}

// Same synthetic-vector-verified content-key decoder as builtin hongguoContentKey / ContentKey.decode.
function contentKeyHex(spade) {
  const raw = decodeBase64(spade, 1024);
  if (raw.length < 3) throw Error("CENC 密钥结构无效");
  const tagLength = (raw[0] ^ raw[1] ^ raw[2]) - 48;
  const count = raw.length - tagLength - 1;
  if (tagLength < 1 || count < 33 || count >= raw.length) throw Error("CENC 密钥结构无效");
  const seed = raw[raw.length - tagLength - 2] ^ raw[raw.length - tagLength - 1];
  const tag = Array.from(raw.slice(raw.length - tagLength), b => String.fromCharCode(b ^ seed)).join("");
  if (tag === "app_v2" || tag === "web_v2") throw Error("CENC 密钥版本暂不支持");
  let even = 250, odd = 85;
  const decoded = [];
  for (let i = 0; i < count; i++) {
    const current = raw[i + 1], previous = i % 2 === 0 ? even : odd;
    if (i % 2 === 0) even = current; else odd = current;
    let bit = i, ones = 0;
    while (bit) { ones += bit & 1; bit >>>= 1; }
    decoded.push(((previous ^ current) - 21 - ones) & 255);
  }
  const padding = parseInt(String.fromCharCode(decoded[0]), 36);
  const key = decoded.slice(1, 33).map(b => String.fromCharCode(b)).join("");
  if (!Number.isFinite(padding) || count - padding - 1 !== 32 || !/^[0-9a-fA-F]{32}$/.test(key)) throw Error("CENC 密钥内容无效");
  return key.toLowerCase();
}

const MEDIA_HOSTS = ["hongguoduanju.com", "snssdk.com", "toutiaovod.com", "douyinvod.com", "v3-reading-videocdn302.qznovelvod.com"];
function mediaAddresses(variant) {
  const out = [], seen = new Set();
  for (const row of [variant, variant.video_meta || {}]) {
    for (const name of ["main_url", "backup_url", "backup_url_1", "backup_url_2", "backup_urls", "url_list"]) {
      const values = Array.isArray(row[name]) ? row[name] : [row[name]];
      for (const value of values) {
        let raw = typeof value === "string" ? value : value && value.url;
        if (typeof raw !== "string" || raw.length > 16384) continue;
        try {
          if (!/^https:\/\//i.test(raw)) raw = decodeURIComponent(Array.from(decodeBase64(raw, 16384), b => "%" + b.toString(16).padStart(2, "0")).join(""));
        } catch (_) { continue; }
        const host = /^https:\/\/([a-z0-9.-]+)(?::443)?(?:[/?]|$)/i.exec(raw);
        if (!host || raw.length > 8192 || raw.indexOf("#") >= 0 || !MEDIA_HOSTS.includes(host[1].toLowerCase())) continue;
        raw = raw.replace(/^https:/i, "https:");
        if (!seen.has(raw)) { seen.add(raw); out.push(raw); }
      }
    }
  }
  return out;
}

function mediaAddress(variant) {
  return mediaAddresses(variant)[0] || "";
}

function heightOf(variant) {
  const meta = variant.video_meta || {};
  let height = Number(variant.vheight || meta.vheight || 0);
  const definition = String(variant.definition || meta.definition || "").match(/\d+/);
  if (definition) height = Number(definition[0]) || height;
  if (!height) {
    const width = Number(variant.vwidth || meta.vwidth || 0);
    if (width) height = width;
  }
  const width = Number(variant.vwidth || meta.vwidth || 0);
  if (!definition && width > 0 && height > 0) height = Math.min(width, height);
  return height;
}

function isEncrypted(variant) {
  const encryption = variant.encrypt_info || {};
  const flag = value => value === true || value === 1 || value === "1" || String(value).toLowerCase() === "true";
  return Boolean(
    variant.spade_a || encryption.spade_a || flag(variant.encrypt) || flag(encryption.encrypt) ||
    variant.encryption_method === "cenc-aes-ctr" || encryption.encryption_method === "cenc-aes-ctr"
  );
}

// Keep each URL paired with its own content key. Media decryption belongs to the host player.
function bestVariant(model) {
  const choices = [], seen = new Set();
  for (const variant of variantList(model).slice(0, 200)) {
    if (!variant || typeof variant !== "object") continue;
    const meta = variant.video_meta || {};
    const codec = String(variant.codec_type || meta.codec_type || "").toLowerCase();
    const gear = String(variant.gear_des_key || meta.gear_des_key || "").toLowerCase();
    if (codec.includes("bytevc2") || gear.includes("bytevc2")) continue;
    let cencKey;
    if (isEncrypted(variant)) {
      const encryption = variant.encrypt_info || {};
      try { cencKey = contentKeyHex(variant.spade_a || encryption.spade_a || ""); }
      catch (_) { continue; }
    }
    const height = heightOf(variant);
    if (!Number.isFinite(height) || height < 0 || height > 16384) continue;
    const score = height * 10 + (codec === "h264" || codec === "avc1" ? 1 : 0);
    for (const url of mediaAddresses(variant)) {
      const identity = url + "\0" + (cencKey || "") + "\0" + height;
      if (seen.has(identity)) continue;
      seen.add(identity);
      const value = {url, quality:height};
      if (cencKey) value.cencKey = cencKey;
      choices.push({score, value});
    }
  }
  choices.sort((a, b) => b.score - a.score);
  if (!choices.length) return null;
  return {...choices[0].value, variants:choices.slice(1, 17).map(row => row.value)};
}

// 网页试看兜底：免费集才有明文直链
function publicVideoAddress(html, episodeID) {
  const scripts = html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const match of scripts) {
    let value;
    try { value = JSON.parse(match[1]); } catch (_) { continue; }
    if (value && value["@type"] === "VideoObject" && typeof value.contentUrl === "string" &&
        value.contentUrl.indexOf("https://hongguoduanju.com/video/public/" + episodeID + "/") === 0) {
      return value.contentUrl;
    }
  }
  return "";
}

async function webPlay(seriesID, episodeID) {
  const html = await webText("/player/" + encodeURIComponent(seriesID) + "/" + encodeURIComponent(episodeID));
  const page = loaderPage(parseRouterData(html), "player_");
  if (!page) throw Error("网页未返回播放数据");
  if (numericID(page.vid) !== episodeID || numericID(page.series_id) !== seriesID) {
    throw Error("网页返回了其他剧集");
  }
  const detail = page.seriesDetail || {};
  const limit = Number(detail.accessible_episode_cnt || 0);
  if (limit > 0) {
    const index = Array.isArray(detail.vid_list) ? detail.vid_list.map(numericID).indexOf(episodeID) + 1 : 0;
    if (!index || index > limit) throw Error("该集超出网页免费试看范围，请使用内置 App 线路");
  }
  const url = publicVideoAddress(html, episodeID) || mediaAddress(page.video_player_info || {});
  if (!url) throw Error("该集没有公开播放地址");
  const seo = page.publicVideoSeo || {};
  let height = Number(seo.height || 0);
  const width = Number(seo.width || 0);
  if (width > 0 && (!height || width < height)) height = width;
  return { url, quality: height };
}

globalThis.nshort = {
  catalog: async (input) => catalog(input || {}),
  search: async (input) => search(input || {}),
  detail: async (input) => detail(input || {}),
  play: async ({ id, episode } = {}) => {
    const seriesID = numericID(id);
    const episodeID = numericID(episode && episode.id);
    if (!seriesID || !episodeID) throw Error("剧集或分集编号无效");
    for (const preload of [false, true]) {
      const payload = {
        biz_param:{detail_page_version:0,device_level:3,disable_digg_stat:false,
          need_all_video_definition:true,need_mp4_align:false,use_os_player:false,use_server_dns:false,video_platform:1024},
        mixed_video_id_map:{"1004":[episodeID]},
      };
      if (preload) payload.dr_scene = "preload";
      try {
        const json = await apiRequest(preload ? "/novel/player/multi_video_model/preload/v1/" : "/novel/player/multi_video_model/v1/", payload, true);
        const best = bestVariant(pickModel(json, episodeID));
        if (best) return best;
      } catch (_) {
        // Only this episode is requested; the normal route precedes preload and public web.
      }
    }
    return webPlay(seriesID, episodeID);
  },
  danmaku: async () => ({ items: [] }),
  seriesSeasons: async () => ({ items: [] }),
};
