// @nshort {"id":"bitch","name":"碧池直播","version":"1.0.0","hosts":["api.hclyz.com","api.maiyoux.com"]}
// N果 rewrite of Bitch Lives Rex 1.0.4. Room titles that target minors are omitted.
const PRIMARY = "http://api.hclyz.com:81/mf/";
const BACKUP = "http://api.maiyoux.com:81/mf/";
const UA = "Mozilla/5.0 (Linux; Android 4.4.2; OPPO R11 Build/NMF26X) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/30.0.0.0 Mobile Safari/537.36";
const PAGE_SIZE = 60;
const CATEGORIES = [["卡哇伊","kawayi"],["咪狐","mihu"],["花蝴蝶","huahudie"],["蜜桃","mitao"],["番茄社区","fanjiashequ"],["LOVE","LOVE"],["小妲己","xiaodaji"],["77直播","77zhibo"],["依依","yiyi"],["日出","richu"],["彩虹","caihong"],["久久","jiujiu"],["亚米","yami"],["蝶恋","dielian"],["夜妖姬","yeyaoji"],["套路","taolu"],["樱花","yinghua"],["享色","xiangse"],["红浪漫","honglangman"],["金鱼","jinyu"],["桃花","taohua"],["花房","huafang"],["小仙女","xiaoxiannu"],["视觉秀","shijuexiu"],["小天使","xiaotianshi"],["一直播","yizhibo"],["彩云","caiyun"],["暗语","anyu"],["咪咪","mimi"],["娇媚","jiaomei"],["黄瓜","huanggua"],["色趣","sequ"],["糯米","nuomi"],["小蜜蜂","xiaomifeng"],["小红帽","xiaohongmao"],["桃花运","taohuayun"],["苦瓜","kugua"],["爱爱你","aiaini"],["樱花雨i","yinghuayui"],["盘他","panta"],["夜色","yese"],["蝴蝶","hudie"],["小天仙","xiaotianxian"],["杏趣","xingqu"],["小坏蛋","xiaohuaidan"],["飘雪","piaoxue"],["樱桃","yingtao"],["奥斯卡","aosika"],["卡路里","kaluli"],["红高粱","honggaoliang"],["付宝","fubao"],["小黄书","xiaohuangshu"],["二嫂","ersao"],["花果山","huaguoshan"],["云鹿","yunlu"],["菠萝","boluo"],["星宝贝","xingbaobei"],["夜艳","yeyan"],["七仙女s","qixiannus"],["夜来香","yelaixiang"],["爱零","ailing"],["十八禁","shibajin"],["兰桂坊","languifang"],["Dancelife","Dancelife"],["小萌猪","xiaomengzhu"],["蝴蝶飞","hudiefei"],["幽梦","youmeng"],["丽柜厅","liguiting"],["蛟龙","jiaolong"],["颜如玉","yanruyu"],["橙秀","chengxiu"],["豹娱l","baoyul"],["小花螺","xiaohualuo"],["皇后","huanghou"],["心之恋","xinzhilian"],["欧美FEATURED","oumeiFEATURED"],["欧美FEMALE","oumeiFEMALE"],["欧美MALE","oumeiMALE"],["欧美COUPLE","oumeiCOUPLE"],["欧美TRANS","oumeiTRANS"],["台妹l","taimeil"],["爱恋","ailian"],["903娱乐","903yule"],["九尾狐","jiuweihu"],["尤物岛","youwudao"],["坦克","tanke"],["好基友","haojiyou"],["夜女郎","yenulang"],["娇喘","jiaochuan"],["芒果派","mangguopai"],["媚颜","meiyan"],["风流","fengliu"],["夜律","yelu"],["玲珑","linglong"],["浴火","yuhuo"],["翠鸟","cuiniao"],["幸运星","xingyunxing"],["她秀","taxiu"],["招财猫","zhaocaimao"],["双碟","shuangdie"],["糖果","tangguo"],["么么哒","memeda"],["小性感","xiaoxinggan"],["小喵宠","xiaomiaochong"],["兔女郎","tunulang"],["睡美人","shuimeiren"],["金呗","jinbei"],["美夕","meixi"],["小妖","xiaoyao"],["约直播","yuezhibo"],["花仙子","huaxianzi"],["土豪","tuhao"],["红妆","hongzhuang"],["妞妞","niuniu"],["艳后","yanhou"],["moon","moon"],["蓝猫","lanmao"],["美人妆","meirenzhuang"],["入巷","ruxiang"],["持久男","chijiunan"],["倾心","qingxin"],["小精灵","xiaojingling"],["偶遇","ouyu"],["灰灰","huihui"],["猫头鹰","maotouying"],["喜欢你","xihuanni"],["夜纯","yechun"],["杏播","xingbo"],["名流","mingliu"],["小辣椒","xiaolajiao"],["蚊香社","wenxiangshe"],["牵手","qianshou"],["情趣","qingqu"]];
const RESTRICTED = /未成年|未[满滿]\s*18|幼女|幼童|儿童|兒童|小[学學]生|初中生|中[学學]生|萝莉|蘿莉|洛丽塔|洛麗塔|lolita|学妹|學妹|校服|父女/i;

function enumeration(name, title, rows, fallback) {
  const options = [];
  for (let i = 0; i < rows.length; i++) options.push({title: rows[i][0], value: rows[i][1]});
  return {name: name, title: title, type: "enumeration", value: fallback, enumOptions: options};
}
function moduleTable() {
  const first = CATEGORIES.slice(0, 80);
  const rest = CATEGORIES.slice(80);
  return [
    {id: "live", title: "碧池直播", rows: first, params: [enumeration("category", "类型", first, first[0][1]), {name: "page", title: "页码", type: "page"}]},
    {id: "more", title: "更多直播", rows: rest, params: [enumeration("category", "类型", rest, rest[0][1]), {name: "page", title: "页码", type: "page"}]}
  ];
}
function findModule(id) {
  const table = moduleTable();
  const wanted = String(id || "");
  if (!wanted) return table[0];
  for (let i = 0; i < table.length; i++) if (table[i].id === wanted) return table[i];
  return null;
}
function pageOf(page) {
  const value = Number(page);
  if (!isFinite(value) || value < 1) return 1;
  return Math.min(1000, Math.floor(value));
}
function normalizeCategory(value) {
  let text = String(value || "").trim();
  if (!text) return "";
  if (/(?:^|\/)json\.txt(?:[?#]|$)/i.test(text) || /(?:^|\/)yuncaidan\.txt(?:[?#]|$)/i.test(text)) return "";
  if (/^https?:\/\//i.test(text)) {
    const match = text.match(/\/mf\/([^/?#]+?)(?:\.txt)?(?:[?#].*)?$/i);
    text = match ? match[1] : "";
  }
  text = text.replace(/^\/+/, "").replace(/\.txt(?:[?#].*)?$/i, "").replace(/^json/i, "");
  if (text === "xiaoxiannv") text = "xiaoxiannu";
  if (!/^[a-z\d_-]+$/i.test(text)) return "";
  return text;
}
function categoryOf(mod, args) {
  if (!mod) return "";
  const source = args || {};
  let explicit = "";
  if (source.category != null && String(source.category) !== "") explicit = String(source.category);
  else if (source.sort_by != null && String(source.sort_by) !== "") explicit = String(source.sort_by);
  const fallback = String((mod.params[0] && mod.params[0].value) || "");
  const normalized = explicit ? normalizeCategory(explicit) : fallback;
  if (!normalized) return "";
  const options = (mod.params[0] && mod.params[0].enumOptions) || [];
  for (let i = 0; i < options.length; i++) if (options[i].value === normalized) return normalized;
  return "";
}
function describe() {
  const table = moduleTable();
  const modules = [];
  for (let i = 0; i < table.length; i++) modules.push({id: table[i].id, title: table[i].title, params: table[i].params});
  return {title: "碧池直播", modules: modules, search: {title: "搜索", params: [{name: "keyword", title: "关键词", type: "input"}]}};
}
function hashIdentity(text) {
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b1;
  const value = String(text || "");
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 0x01000193);
    h2 = Math.imul(h2 ^ (code + i), 0x01000193);
  }
  function hex(n) { return ("00000000" + (n >>> 0).toString(16)).slice(-8); }
  return hex(h1) + hex(h2);
}
function streamIdentity(raw) {
  const text = String(raw || "").split("#")[0];
  const parts = text.split("?");
  const kept = (parts[1] || "").split("&").filter(function (item) { return item && !/^(?:wsSecret|wsTime)=/i.test(item); });
  return parts[0] + (kept.length ? "?" + kept.join("&") : "");
}
function playableAddress(raw) {
  const text = String(raw || "").trim();
  if (!text || /\s/.test(text) || text.indexOf("#") >= 0 || text.indexOf("@") >= 0) return false;
  const match = text.match(/^(https?):\/\/([^/?#]+)(\/\S*)?$/i);
  if (!match) return false;
  const hostport = match[2];
  const colon = hostport.lastIndexOf(":");
  const host = colon >= 0 ? hostport.slice(0, colon) : hostport;
  const port = colon >= 0 ? hostport.slice(colon + 1) : "";
  if (!host || host.indexOf(".") < 0 || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return false;
  const scheme = match[1].toLowerCase();
  if (scheme === "http" && port && port !== "80" && port !== "81") return false;
  if (scheme === "https" && port && port !== "443") return false;
  return true;
}
function roomFrom(row) {
  const item = row || {};
  return {
    address: String(item.address || item.dz || item.url || "").trim(),
    title: String(item.title || item.mc || item.name || "").trim(),
    image: String(item.img || item.xinimg || item.tp1 || item.image || "").trim()
  };
}
function parseYuncaidan(text) {
  const body = String(text || "").replace(/^\uFEFF/, "").trim().replace(/^\s*\{/, "").replace(/\}\s*$/, "");
  const start = body.search(/(?:@|^)mc/);
  const source = start >= 0 ? body.slice(start) : body;
  const rooms = [];
  let current = null;
  const parts = source.split("|");
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim().replace(/^\{/, "").replace(/\}$/, "");
    if (!part) continue;
    if (part.indexOf("@mc") === 0 || part.indexOf("mc=") === 0) {
      if (current && current.address) rooms.push(current);
      current = {title: part.slice(3).trim(), address: "", image: ""};
    } else if (current && (part.indexOf("@tp1") === 0 || part.indexOf("tp1=") === 0)) current.image = part.slice(4).trim();
    else if (current && (part.indexOf("@dz") === 0 || part.indexOf("dz=") === 0)) current.address = part.slice(3).trim();
  }
  if (current && current.address) rooms.push(current);
  return rooms;
}
function parseRooms(text) {
  const raw = String(text || "").replace(/^\uFEFF/, "").trim();
  if (!raw) throw new Error("无效的直播数据格式");
  let data = null;
  let parsed = false;
  try { data = JSON.parse(raw); parsed = true; }
  catch (error) {
    if (/^\{\s*["']zhubo["']\s*:/i.test(raw)) {
      try { data = JSON.parse(raw + "}"); parsed = true; } catch (again) { parsed = false; }
    }
  }
  if (parsed && data && Array.isArray(data.zhubo)) {
    const rooms = [];
    for (let i = 0; i < data.zhubo.length; i++) rooms.push(roomFrom(data.zhubo[i]));
    return rooms;
  }
  if (parsed && Array.isArray(data)) {
    const rooms = [];
    for (let i = 0; i < data.length; i++) rooms.push(roomFrom(data[i]));
    return rooms;
  }
  if (parsed && data && typeof data.data === "string") return parseYuncaidan(data.data);
  if (parsed && typeof data === "string") return parseYuncaidan(data);
  const piped = parseYuncaidan(raw);
  if (!piped.length) throw new Error("无效的直播数据格式");
  return piped;
}
function coverOf(image) {
  let cover = String(image || "").trim();
  if (cover.indexOf("//") === 0) cover = "https:" + cover;
  if (cover.indexOf("https://") !== 0 || /\s/.test(cover)) return "";
  return cover;
}
function itemsFrom(rooms, category) {
  const items = [];
  const seen = {};
  for (let i = 0; i < rooms.length; i++) {
    const room = rooms[i];
    if (!room.title || !playableAddress(room.address) || RESTRICTED.test(room.title)) continue;
    const id = category + ":" + hashIdentity(streamIdentity(room.address));
    if (seen[id] || id.length > 60) continue;
    seen[id] = true;
    const title = room.title.slice(0, 120);
    items.push({id: id, title: title, description: title, intro: title, cover: coverOf(room.image), episodes: 1, category: "碧池直播", address: room.address});
  }
  return items;
}
async function loadCategory(category) {
  const urls = [PRIMARY + "json" + category + ".txt", BACKUP + "json" + category + ".txt"];
  let last = new Error("直播列表不可用");
  for (let i = 0; i < urls.length; i++) {
    try {
      const response = await fetch(urls[i], {headers: {"User-Agent": UA, "Content-Type": "application/octet-stream"}});
      const text = await response.text();
      return itemsFrom(parseRooms(text), category);
    } catch (error) {
      last = error;
    }
  }
  throw last;
}
function emptyList() { return {items: [], hasMore: false}; }
function publish(items) {
  const rows = [];
  for (let i = 0; i < items.length; i++) {
    const row = items[i];
    rows.push({id: row.id, title: row.title, description: row.description, intro: row.intro, cover: row.cover, episodes: row.episodes, category: row.category});
  }
  return rows;
}
async function catalog(input) {
  const args = input || {};
  const mod = findModule(args.module);
  const category = categoryOf(mod, args);
  if (!category) return emptyList();
  let items = [];
  try { items = await loadCategory(category); }
  catch (error) { return emptyList(); }
  const page = pageOf(args.page);
  const start = (page - 1) * PAGE_SIZE;
  return {items: publish(items.slice(start, start + PAGE_SIZE)), hasMore: start + PAGE_SIZE < items.length};
}
async function search() { return emptyList(); }
function roomId(value) {
  const match = String(value || "").match(/^([a-zA-Z0-9_-]+):([0-9a-f]{16})$/);
  return match ? match[0] : "";
}
async function findRoom(id) {
  const parsed = roomId(id);
  if (!parsed) return null;
  const category = parsed.split(":")[0];
  let known = false;
  for (let i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i][1] === category) known = true;
  if (!known) return null;
  const items = await loadCategory(category);
  for (let i = 0; i < items.length; i++) if (items[i].id === parsed) return items[i];
  return null;
}
async function detail(input) {
  const id = roomId((input || {}).id);
  if (!id) throw new Error("剧集不匹配");
  const room = await findRoom(id);
  if (!room) throw new Error("主播已下播或线路已变更，请刷新列表");
  return {drama: {id: room.id, title: room.title, description: room.title, intro: room.title, cover: room.cover, episodes: 1, category: "碧池直播"}, chapters: [{id: room.id, title: room.title}]};
}
async function play(input) {
  const args = input || {};
  const episode = args.episode && args.episode.id ? args.episode.id : args.id;
  const id = roomId(episode);
  if (!id) throw new Error("剧集不匹配");
  const room = await findRoom(id);
  if (!room || !playableAddress(room.address)) throw new Error("主播已下播或线路已变更，请刷新列表");
  return {url: room.address, quality: Number(args.quality) || 0};
}
globalThis.nshort = {
  describe: describe, catalog: catalog, search: search, detail: detail, play: play,
  danmaku: async function () { return {items: []}; },
  seriesSeasons: async function () { return {items: []}; }
};
