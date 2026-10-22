// @nshort {"id":"missav","name":"MissAV","version":"1.0.0","hosts":["missav.fans","missav.media","missav.ai","missav.ws","*.mrstcdn.store","fourhoi.com"]}
// N果 rewrite of the TuT MissAV module. One genre whose title targets schoolgirls is omitted.
const SITES = ["https://missav.fans", "https://missav.media", "https://missav.ai", "https://missav.ws"];
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const GROUPS = [];
function add(name, endpoint, sort, filters) {
  GROUPS.push({id: "c" + GROUPS.length, name: name, endpoint: endpoint, sort: sort, filters: filters || ""});
}
add("最近更新", "dm539/cn/new", "published_at");
add("中文字幕 · 所有", "dm278/cn/chinese-subtitle", "released_at");
add("中文字幕 · 单人作品", "dm278/cn/chinese-subtitle", "released_at", "individual");
add("中文字幕 · 多人作品", "dm278/cn/chinese-subtitle", "released_at", "multiple");
add("日本AV · 最新发布", "dm632/cn/release", "released_at");
add("日本AV · 本周热门", "dm170/cn/weekly-hot", "released_at");
add("日本AV · 月度热门", "dm266/cn/monthly-hot", "released_at");
[
  ["SIRO", "dm36/cn/siro"], ["LUXU", "dm34/cn/luxu"], ["GANA", "dm32/cn/gana"],
  ["PRESTIGE PREMIUM", "dm999/cn/maan"], ["S-CUTE", "dm38/cn/scute"], ["ARA", "dm34/cn/ara"]
].forEach(function (row) { add("素人 · " + row[0], row[1], "released_at"); });
[
  ["无码流出", "dm816/cn/uncensored-leak"], ["FC2", "dm473/cn/fc2"], ["HEYZO", "dm1977446/cn/heyzo"],
  ["东京热", "dm42/cn/tokyohot"], ["一本道", "dm4364834/cn/1pondo"], ["Caribbeancom", "dm7414012/cn/caribbeancom"],
  ["Caribbeancompr", "dm83900/cn/caribbeancompr"], ["10musume", "dm6341956/cn/10musume"],
  ["pacopacomama", "dm2479243/cn/pacopacomama"], ["Gachinco", "dm150/cn/gachinco"],
  ["XXX-AV", "dm42/cn/xxxav"], ["人妻斬", "dm37/cn/marriedslash"],
  ["顽皮4610", "dm33/cn/naughty4610"], ["顽皮0930", "dm37/cn/naughty0930"]
].forEach(function (row) { add("无码 · " + row[0], row[1], "released_at"); });
[
  ["麻豆传媒", "dm63/cn/madou"], ["TWAV", "dm31/cn/twav"], ["Furuke", "dm15/cn/furuke"],
  ["韩国直播", "cn/klive"], ["中国直播", "cn/clive"]
].forEach(function (row) { add("亚洲 · " + row[0], row[1], "released_at"); });
[
  ["瀬户环奈", "dm179/cn/actresses/%E7%80%AC%E6%88%B8%E7%92%B0%E5%A5%88"],
  ["逢泽みゆ", "dm179/cn/actresses/%E9%80%A2%E6%B2%A2%E3%81%BF%E3%82%86"],
  ["河北彩花", "dm179/cn/actresses/%E6%B2%B3%E5%8C%97%E5%BD%A9%E8%8A%B1"],
  ["松本一香", "dm179/cn/actresses/%E6%9D%BE%E6%9C%AC%E4%B8%80%E9%A6%99"],
  ["美园和花", "dm179/cn/actresses/%E7%BE%8E%E5%9B%AD%E5%92%8C%E8%8A%B1"],
  ["北冈果林", "dm179/cn/actresses/%E5%8C%97%E5%B2%A1%E6%9E%9C%E6%9E%97"],
  ["柏木こなつ", "dm179/cn/actresses/%E6%9F%8F%E6%9C%A8%E3%81%93%E3%81%AA%E3%81%A4"],
  ["浅野こころ", "dm179/cn/actresses/%E6%B5%85%E9%87%8E%E3%81%93%E3%81%93%E3%82%8D"],
  ["北野未奈", "dm179/cn/actresses/%E5%8C%97%E9%87%8E%E6%9C%AA%E5%A5%88"],
  ["清原みゆう", "dm179/cn/actresses/%E6%B8%85%E5%8E%9F%E3%81%BF%E3%82%86%E3%81%86"],
  ["沙月惠奈", "dm179/cn/actresses/%E6%B2%99%E6%9C%88%E6%83%A0%E5%A5%88"],
  ["miru", "dm179/cn/actresses/miru"],
  ["七森莉莉", "dm179/cn/actresses/%E4%B8%83%E6%A3%AE%E8%8E%89%E8%8E%89"],
  ["七濑爱丽丝", "dm179/cn/actresses/%E4%B8%83%E6%BF%91%E7%88%B1%E4%B8%BD%E4%B8%9D"],
  ["鹫尾芽衣", "dm179/cn/actresses/%E9%B9%AB%E5%B0%BE%E8%8A%BD%E8%A1%A3"],
  ["博多彩叶", "dm179/cn/actresses/%E5%8D%9A%E5%A4%9A%E5%BD%A9%E5%8F%B6"],
  ["石川澪", "dm179/cn/actresses/%E7%9F%B3%E5%B7%9D%E6%BE%AA"],
  ["白上咲花", "dm179/cn/actresses/%E7%99%BD%E4%B8%8A%E5%92%B2%E8%8A%B1"],
  ["田野忧", "dm179/cn/actresses/%E7%94%B0%E9%87%8E%E5%BF%A7"],
  ["未步なな", "dm179/cn/actresses/%E6%9C%AA%E6%AD%A5%E3%81%AA%E3%81%AA"],
  ["村上悠华", "dm179/cn/actresses/%E6%9D%91%E4%B8%8A%E6%82%A0%E5%8D%8E"],
  ["三田真铃", "dm179/cn/actresses/%E4%B8%89%E7%94%B0%E7%9C%9F%E9%93%83"],
  ["八挂うみ", "dm179/cn/actresses/%E5%85%AB%E6%8E%9B%E3%81%86%E3%81%BF"],
  ["初美なのか", "dm179/cn/actresses/%E5%88%9D%E7%BE%8E%E3%81%AA%E3%81%AE%E3%81%8B"],
  ["宫下玲奈", "dm179/cn/actresses/%E5%AE%AE%E4%B8%8B%E7%8E%B2%E5%A5%88"],
  ["新有菜", "dm58/actresses/%E6%A9%8B%E6%9C%AC%E6%9C%89%E8%8F%9C%20%28%E6%96%B0%E6%9C%89%E8%8F%9C%29"],
  ["新木希空", "dm179/cn/actresses/%E6%96%B0%E6%9C%A8%E5%B8%8C%E7%A9%BA"],
  ["明里つむぎ", "dm179/cn/actresses/%E6%98%8E%E9%87%8C%E3%81%A4%E3%82%80%E3%81%8E"],
  ["小野六花", "dm179/cn/actresses/%E5%B0%8F%E9%87%8E%E5%85%AD%E8%8A%B1"],
  ["宇都宫紫苑", "dm179/cn/actresses/%E5%AE%87%E9%83%BD%E5%AE%AE%E7%B4%AB%E8%8B%91"],
  ["小宵こなん", "dm179/cn/actresses/%E5%B0%8F%E5%AE%B5%E3%81%93%E3%81%AA%E3%82%93"],
  ["本庄鈴", "dm179/cn/actresses/%E6%9C%AC%E5%BA%84%E9%88%B4"],
  ["桃乃木かな", "dm179/cn/actresses/%E6%A1%83%E4%B9%83%E6%9C%A8%E3%81%8B%E3%81%AA"],
  ["桜空もも", "dm179/cn/actresses/%E6%A1%9C%E7%A9%BA%E3%82%82%E3%82%82"],
  ["楓ふうあ", "dm179/cn/actresses/%E6%A1%AB%E3%81%B5%E3%81%86%E3%81%82"],
  ["楓カレン", "dm179/cn/actresses/%E6%A5%93%E3%82%AB%E3%83%AC%E3%83%B3"],
  ["涼森れむ", "dm179/cn/actresses/%E6%B6%BC%E6%A3%AE%E3%82%8C%E3%82%80"],
  ["瀧本雫葉", "dm179/cn/actresses/%E7%80%A7%E6%9C%AC%E9%9B%AB%E8%91%89"],
  ["田中レモン", "dm179/cn/actresses/%E7%94%B0%E4%B8%AD%E3%83%AC%E3%83%A2%E3%83%B3"],
  ["相沢みなみ", "dm179/cn/actresses/%E7%9B%B8%E6%B2%A2%E3%81%BF%E3%81%AA%E3%81%BF"],
  ["神木麗", "dm179/cn/actresses/%E7%A5%9E%E6%9C%A8%E9%BA%97"],
  ["美ノ嶋めぐり", "dm179/cn/actresses/%E7%BE%8E%E3%83%8E%E5%B6%8B%E3%82%81%E3%81%90%E3%82%8A"],
  ["野々浦暖", "dm179/cn/actresses/%E9%87%8E%E3%80%85%E6%B5%A6%E6%9A%96"],
  ["青空ひかり", "dm179/cn/actresses/%E9%9D%92%E7%A9%BA%E3%81%B2%E3%81%8B%E3%82%8A"],
  ["三上悠亚", "dm179/cn/actresses/%E4%B8%89%E4%B8%8A%E6%82%A0%E4%BA%9A"],
  ["榊原萌", "dm179/cn/actresses/%E6%A6%8A%E5%8E%9F%E8%90%8C"],
  ["彩月七绪", "dm179/cn/actresses/%E5%BD%A9%E6%9C%88%E4%B8%83%E7%BB%AA"],
  ["神宫寺奈绪", "dm179/cn/actresses/%E7%A5%9E%E5%AE%AE%E5%AF%BA%E5%A5%88%E7%BB%AA"],
  ["有村のぞみ", "dm179/cn/actresses/%E6%9C%89%E6%9D%91%E3%81%AE%E3%81%9E%E3%81%BF"]
].forEach(function (row) { add("女优 · " + row[0], row[1], "released_at"); });
[
  ["高清", "dm96/cn/genres/%E9%AB%98%E6%B8%85"], ["独家", "dm139/cn/genres/%E7%8B%AC%E5%AE%B6"],
  ["中出", "dm130/cn/genres/%E4%B8%AD%E5%87%BA"], ["单体作品", "dm122/cn/genres/%E5%8D%95%E4%BD%93%E4%BD%9C%E5%93%81"],
  ["巨乳", "dm120/cn/genres/%E5%B7%A8%E4%B9%B3"], ["人妻", "dm77/cn/genres/%E4%BA%BA%E5%A6%BB"],
  ["熟女", "dm118/cn/genres/%E7%86%9F%E5%A5%B3"], ["素人", "dm123/cn/genres/%E7%B4%A0%E4%BA%BA"],
  ["美少女", "dm437/cn/genres/%E7%BE%8E%E5%B0%91%E5%A5%B3"], ["口交", "dm1301/cn/genres/%E5%8F%A3%E4%BA%A4"],
  ["多人运动", "dm321/cn/genres/%E5%A4%9A%E4%BA%BA%E8%BF%90%E5%8A%A8"], ["薄格", "dm76/cn/genres/%E8%96%84%E6%A0%BC"],
  ["骑乘", "dm486/cn/genres/%E9%AA%91%E4%B9%98"], ["痴女", "dm313/cn/genres/%E7%97%B4%E5%A5%B3"],
  ["4小时以上", "dm738/cn/genres/4%E5%B0%8F%E6%97%B6%E4%BB%A5%E4%B8%8A"],
  ["潮吹", "dm161/cn/genres/%E6%BD%AE%E5%90%B9"], ["苗条", "dm757/cn/genres/%E8%8B%97%E6%9D%A1"],
  ["自拍", "dm978/cn/genres/%E8%87%AA%E6%8B%8D"], ["合集", "dm784/cn/genres/%E5%90%88%E9%9B%86"],
  ["乳交", "dm594/cn/genres/%E4%B9%B3%E4%BA%A4"], ["恋物癖", "dm117/cn/genres/%E6%81%8B%E7%89%A9%E7%99%96"],
  ["美乳", "dm215/cn/genres/%E7%BE%8E%E4%B9%B3"], ["NTR", "dm736/cn/genres/NTR"],
  ["企划", "dm341/cn/genres/%E4%BC%81%E5%88%92"], ["乱伦", "dm56/cn/genres/%E4%B9%B1%E4%BC%A6"],
  ["搭讪", "dm292/cn/genres/%E6%90%AD%E8%AE%AA"], ["颜射", "dm319/cn/genres/%E9%A2%9C%E5%B0%84"],
  ["淫乱", "dm903/cn/genres/%E6%B7%AB%E4%B9%B1"], ["偷拍", "dm516/cn/genres/%E5%81%B7%E6%8B%8D"],
  ["剧情", "dm98/cn/genres/%E5%89%A7%E6%83%85"], ["自慰", "dm7606/cn/genres/%E8%87%AA%E6%85%B0"],
  ["4K", "dm55/cn/genres/4K"], ["手淫", "dm94/cn/genres/%E6%89%8B%E6%B7%AB"],
  ["姐姐", "dm793/cn/genres/%E5%A7%90%E5%A7%90"], ["羞辱", "dm161/cn/genres/%E7%BE%9E%E8%BE%B1"]
].forEach(function (row) { add("类型 · " + row[0], row[1], "released_at"); });
[
  ["Moody's", "dm825/cn/makers/Moody%27s"], ["Prestige", "dm825/cn/makers/Prestige"],
  ["Madonna", "dm825/cn/makers/Madonna"], ["S1", "dm825/cn/makers/S1"], ["SOD", "dm825/cn/makers/SOD"],
  ["IdeaPocket", "dm825/cn/makers/IdeaPocket"], ["Attackers", "dm825/cn/makers/Attackers"],
  ["Glory Quest", "dm825/cn/makers/Glory%20Quest"],
  ["ビッグモーカル", "dm825/cn/makers/%E3%83%93%E3%83%83%E3%82%B0%E3%83%A2%E3%83%BC%E3%82%AB%E3%83%AB"],
  ["NATURAL HIGH", "dm825/cn/makers/NATURAL%20HIGH"], ["Wanz Factory", "dm825/cn/makers/Wanz%20Factory"],
  ["Takara Visual", "dm825/cn/makers/Takara%20Visual"], ["Fc2", "dm825/cn/makers/Fc2"],
  ["Premium", "dm825/cn/makers/Premium"], ["Fitch", "dm825/cn/makers/Fitch"],
  ["VENUS", "dm825/cn/makers/VENUS"], ["DEEP'S", "dm825/cn/makers/DEEP%27S"],
  ["本中", "dm825/cn/makers/%E6%9C%AC%E4%B8%AD"], ["Hunter", "dm825/cn/makers/Hunter"],
  ["溜池ゴロー", "dm825/cn/makers/%E6%BA%9C%E6%B1%A0%E3%82%B4%E3%83%AD%E3%83%BC"],
  ["TMA", "dm825/cn/makers/TMA"],
  ["センタービレッジ", "dm825/cn/makers/%E3%82%BB%E3%83%B3%E3%82%BF%E3%83%BC%E3%83%93%E3%83%AC%E3%83%83%E3%82%B8"],
  ["Das", "dm825/cn/makers/Das"], ["Waap Entertainment", "dm825/cn/makers/Waap%20Entertainment"],
  ["Crystal-Eizou", "dm825/cn/makers/Crystal-Eizou"], ["kawaii", "dm825/cn/makers/kawaii"],
  ["ゴーゴーズ", "dm825/cn/makers/%E3%82%B4%E3%83%BC%E3%82%B4%E3%83%BC%E3%82%BA"],
  ["プラネットプラス", "dm825/cn/makers/%E3%83%97%E3%83%A9%E3%83%8D%E3%83%83%E3%83%88%E3%83%97%E3%83%A9%E3%82%B9"],
  ["OPPAI", "dm825/cn/makers/OPPAI"], ["STAR PARADISE", "dm825/cn/makers/STAR%20PARADISE"],
  ["E-BODY", "dm825/cn/makers/E-BODY"],
  ["セレブの友", "dm825/cn/makers/%E3%82%BB%E3%83%AC%E3%83%96%E3%81%AE%E5%8F%8B"],
  ["ドグマ", "dm825/cn/makers/%E3%83%89%E3%82%B0%E3%83%9E"], ["Alice Japan", "dm825/cn/makers/Alice%20Japan"],
  ["KM Produce", "dm825/cn/makers/KM%20Produce"],
  ["桃太郎映像出版", "dm825/cn/makers/%E6%A1%83%E5%A4%AA%E9%83%8E%E6%98%A0%E5%83%8F%E5%87%BA%E7%89%88"]
].forEach(function (row) { add("发行商 · " + row[0], row[1], "released_at"); });

function headers(site) { return {"User-Agent": UA, "Referer": site + "/"}; }
function pageOf(page) {
  const value = Number(page);
  if (!isFinite(value) || value < 1) return 1;
  return Math.min(1000, Math.floor(value));
}
const MODULE_IDS = {"最近更新": "recent", "中文字幕": "subtitle", "日本AV": "japan", "素人": "amateur", "无码": "uncensored", "亚洲": "asia", "女优": "actress", "类型": "genre", "发行商": "maker"};
let MODULES = null;
function moduleTable() {
  if (MODULES) return MODULES;
  const titles = [];
  const grouped = {};
  for (let i = 0; i < GROUPS.length; i++) {
    const row = GROUPS[i];
    const cut = row.name.indexOf(" · ");
    const title = cut < 0 ? row.name : row.name.slice(0, cut);
    if (!grouped[title]) {
      grouped[title] = [];
      titles.push(title);
    }
    grouped[title].push(row);
  }
  MODULES = [];
  for (let i = 0; i < titles.length; i++) {
    const title = titles[i];
    const rows = grouped[title];
    const params = [{name: "page", title: "页码", type: "page"}];
    if (rows.length > 1 && title === "中文字幕") {
      const options = [];
      for (let j = 0; j < rows.length; j++) options.push({title: rows[j].name.split(" · ")[1], value: rows[j].filters});
      params.push({name: "filters", title: "筛选", type: "enumeration", value: rows[0].filters, enumOptions: options});
    } else if (rows.length > 1) {
      const options = [];
      for (let j = 0; j < rows.length; j++) options.push({title: rows[j].name.split(" · ")[1], value: rows[j].endpoint});
      params.push({name: "endpoint", title: "分类", type: "enumeration", value: rows[0].endpoint, enumOptions: options});
    }
    MODULES.push({id: MODULE_IDS[title], title: title, sort: rows[0].sort, rows: rows, params: params});
  }
  return MODULES;
}
function entryFor(args) {
  const table = moduleTable();
  const id = String((args && args.module) || "");
  let mod = null;
  if (!id) mod = table[0];
  else {
    for (let i = 0; i < table.length; i++) if (table[i].id === id) mod = table[i];
  }
  if (!mod || !mod.id) return null;
  if (mod.rows.length === 1) return mod.rows[0];
  const param = mod.params[1];
  const raw = args && args[param.name] != null ? String(args[param.name]) : String(param.value || "");
  for (let i = 0; i < mod.rows.length; i++) {
    const token = param.name === "filters" ? mod.rows[i].filters : mod.rows[i].endpoint;
    if (token === raw) return mod.rows[i];
  }
  return null;
}
function describe() {
  const table = moduleTable();
  const modules = [];
  for (let i = 0; i < table.length; i++) modules.push({id: table[i].id, title: table[i].title, params: table[i].params});
  return {title: "MissAV", modules: modules, search: {title: "搜索", params: [{name: "keyword", title: "关键词", type: "input"}]}};
}
function listPath(entry, page) {
  if (!entry || entry.endpoint.indexOf("://") >= 0 || entry.endpoint.indexOf("..") >= 0) return "";
  const params = [];
  if (entry.filters) params.push("filters=" + encodeURIComponent(entry.filters));
  if (entry.sort) params.push("sort=" + encodeURIComponent(entry.sort));
  if (page > 1) params.push("page=" + page);
  return "/" + entry.endpoint + (params.length ? "?" + params.join("&") : "");
}
function blocked(html) {
  const text = String(html || "");
  return !text || /Just a moment|cf-browser-verification|challenge-platform|Attention Required/i.test(text);
}
function usable(html) {
  if (blocked(html)) return false;
  return html.indexOf("text-secondary") >= 0 || html.indexOf("thumbnail") >= 0 || html.indexOf("fourhoi") >= 0 || html.indexOf("surrit") >= 0 || html.indexOf("og:title") >= 0;
}
async function getHtml(path) {
  if (!path || path.indexOf("://") >= 0 || path.indexOf("..") >= 0) return null;
  for (let i = 0; i < SITES.length; i++) {
    try {
      const response = await Widget.http.get(SITES[i] + path, {headers: headers(SITES[i])});
      const html = String((response && response.data) || "");
      if (usable(html)) return {site: SITES[i], html: html};
    } catch (error) {}
  }
  return null;
}
function decode(text) {
  return String(text || "").replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");
}
function attr(tag, name) {
  const match = tag.match(new RegExp(name + "\\s*=\\s*([\"'])([\\s\\S]*?)\\1", "i"));
  return match ? match[2] : "";
}
function anchor(window) {
  const re = /<a\b[^>]*>/gi;
  let match;
  while ((match = re.exec(window))) {
    const tag = match[0];
    const cls = attr(tag, "class") || tag;
    if (cls.toLowerCase().indexOf("text-secondary") < 0) continue;
    const href = attr(tag, "href");
    if (!href) continue;
    const close = window.indexOf("</a>", match.index);
    const raw = close > match.index ? window.slice(match.index + tag.length, close) : "";
    return {href: href, title: decode(raw.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim()};
  }
  return null;
}
function videoPath(href) {
  let path = String(href || "").split("#")[0].split("?")[0].trim().replace(/^https?:\/\/[^/]+/i, "").replace(/^\/\/[^/]+/i, "").replace(/^\/+/, "");
  if (path.length > 60) path = path.split("/").pop() || "";
  if (!path || path.length > 60 || path.indexOf("..") >= 0 || !/^[A-Za-z0-9._~/-]+$/.test(path)) return "";
  const last = path.split("/").pop();
  if (!last || !/\d/.test(last) || /\/(genres|actresses|makers|search)\//i.test("/" + path + "/")) return "";
  return path;
}
function codeOf(path) {
  return String(path || "").split("/").pop().toLowerCase().replace(/-(?:uncensored-leak|chinese-subtitle)$/i, "");
}
function cdnHost(host) {
  return host === "fourhoi.com" || host === "mrstcdn.store" || host.endsWith(".mrstcdn.store");
}
function canonicalMedia(url) {
  const match = String(url || "").match(/^https:\/\/([^\/?#]+)([^?#]*)/i);
  if (!match) return "";
  let host = match[1].toLowerCase();
  let path = match[2] || "/";
  const surrit = path.match(/^\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})(\/.*)?$/i);
  if (/^surrit\./i.test(host) && surrit) {
    if (!cdnHost(host)) host = "surrit.mrstcdn.store";
    if (!surrit[2] || surrit[2] === "/") path = "/" + surrit[1] + "/playlist.m3u8";
    return "https://" + host + path;
  }
  return cdnHost(host) ? "https://" + host + path : "";
}
function coverFor(path, html) {
  const re = /https?:\/\/[^"'\\\s>]+\.(?:jpg|jpeg|png|webp)/gi;
  let match;
  while ((match = re.exec(html || ""))) {
    const url = canonicalMedia(match[0]);
    if (url) return url;
  }
  const code = codeOf(path);
  return /^[a-z0-9._~-]+$/.test(code) ? "https://fourhoi.mrstcdn.store/" + code + "/cover-t.jpg" : "";
}
function parseList(html, categoryName) {
  const items = [];
  const seen = {};
  const re = /thumbnail/gi;
  let match;
  while ((match = re.exec(html)) && items.length < 80) {
    const link = anchor(html.slice(match.index, match.index + 2500));
    if (!link) continue;
    const path = videoPath(link.href);
    if (!path || seen[path]) continue;
    seen[path] = true;
    const title = link.title || codeOf(path).toUpperCase();
    items.push({id: path, title: title.slice(0, 120), description: codeOf(path).toUpperCase(), intro: codeOf(path).toUpperCase(), cover: coverFor(path, html.slice(match.index, match.index + 2500)), episodes: 1, category: categoryName});
  }
  return items;
}
function hasNext(html, page) {
  return /rel=["']next["']/i.test(html) || new RegExp("[?&]page=" + (page + 1) + "(?:&|[\"']|\\s|$)").test(html);
}
function metaContent(html, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp("<meta[^>]+(?:property|name)=[\"']" + escaped + "[\"'][^>]+content=[\"']([^\"']*)[\"']", "i"),
    new RegExp("<meta[^>]+content=[\"']([^\"']*)[\"'][^>]+(?:property|name)=[\"']" + escaped + "[\"']", "i")
  ];
  for (let i = 0; i < patterns.length; i++) {
    const match = html.match(patterns[i]);
    if (match) return decode(match[1]).replace(/\s+/g, " ").trim();
  }
  return "";
}
function metaTitle(html) {
  const title = metaContent(html, "og:title");
  if (title) return title.slice(0, 120);
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return h1 ? decode(h1[1].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim().slice(0, 120) : "";
}
function unpackPacker(html) {
  const re = /eval\s*\(\s*function\s*\(\s*p\s*,\s*a\s*,\s*c\s*,\s*k\s*,\s*e\s*,\s*d\s*\)[\s\S]+?\}\s*\(\s*'([\s\S]+?)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([\s\S]+?)'[\s\S]+?\)/g;
  let out = "";
  let match;
  while ((match = re.exec(html))) {
    let payload = match[1].replace(/\\'/g, "'");
    const words = match[4].split("|");
    let index = parseInt(match[3], 10);
    while (index > 0) {
      index--;
      if (words[index]) payload = payload.replace(new RegExp("\\b" + index.toString(36) + "\\b", "g"), words[index]);
    }
    out += payload + "\n";
  }
  return out;
}
function extractVideoUrl(html) {
  const text = String(html || "").replace(/\\\//g, "/");
  const direct = text.match(/https:\/\/surrit\.[^"'\\\s<]+\/[a-f0-9-]+\/[^"'\s<]*\.m3u8/i);
  const fromDirect = direct ? canonicalMedia(direct[0]) : "";
  if (fromDirect) return fromDirect;
  const unpacked = unpackPacker(text);
  const found = unpacked ? unpacked.match(/https:\/\/surrit\.[^"'\\\s<]+\/[a-f0-9-]+\/[^"'\s<]*\.m3u8/i) : null;
  const fromPacker = found ? canonicalMedia(found[0]) : "";
  if (fromPacker) return fromPacker;
  const hostUuid = text.match(/https:\/\/(surrit\.[^/"'\s]+)\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
  if (hostUuid) return canonicalMedia("https://" + hostUuid[1] + "/" + hostUuid[2] + "/playlist.m3u8");
  if (text.indexOf("eval(function") >= 0) {
    const uuid = text.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i);
    if (uuid) return "https://surrit.mrstcdn.store/" + uuid[0] + "/playlist.m3u8";
  }
  return "";
}
function resolveMedia(base, next) {
  if (/^https:\/\//i.test(next)) return canonicalMedia(next);
  if (next.charAt(0) === "/") {
    const host = base.match(/^https:\/\/[^/]+/i);
    return host ? canonicalMedia(host[0] + next) : "";
  }
  const cut = base.split("/");
  cut.pop();
  return canonicalMedia(cut.join("/") + "/" + next.replace(/^\.\//, ""));
}
function variantsFrom(body, master, referer) {
  const lines = String(body || "").split(/\r?\n/);
  const rows = [];
  const seen = {};
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.indexOf("#EXT-X-STREAM-INF") !== 0) continue;
    const next = (lines[i + 1] || "").trim();
    if (!next || next.charAt(0) === "#") continue;
    const height = line.match(/RESOLUTION=\d+x(\d+)/i);
    const url = resolveMedia(master, next);
    if (!url || seen[url]) continue;
    seen[url] = true;
    rows.push({url: url, quality: height ? Number(height[1]) : 0, referer: referer});
  }
  return rows;
}
function choose(rows, quality) {
  const wanted = Number(quality) || 0;
  let picked = rows[0];
  for (let i = 0; i < rows.length; i++) {
    if (wanted && rows[i].quality === wanted) { picked = rows[i]; break; }
    if (rows[i].quality > picked.quality) picked = rows[i];
  }
  const variants = [];
  for (let i = 0; i < rows.length && variants.length < 16; i++) {
    if (rows[i].url === picked.url) continue;
    variants.push({url: rows[i].url, quality: rows[i].quality, referer: rows[i].referer});
  }
  return {url: picked.url, quality: picked.quality || wanted, referer: picked.referer, variants: variants};
}
function emptyList() { return {items: [], hasMore: false}; }
async function catalog(input) {
  const args = input || {};
  const page = pageOf(args.page);
  const entry = entryFor(args);
  if (!entry) return emptyList();
  const loaded = await getHtml(listPath(entry, page));
  if (!loaded) return emptyList();
  return {items: parseList(loaded.html, entry.name), hasMore: hasNext(loaded.html, page)};
}
async function search(input) {
  const args = input || {};
  const query = String(args.query || args.keyword || "").trim();
  const page = pageOf(args.page);
  if (!query) return catalog({page: page});
  if (query.length > 80) return emptyList();
  const loaded = await getHtml("/cn/search/" + encodeURIComponent(query) + (page > 1 ? "?page=" + page : ""));
  if (!loaded) return emptyList();
  return {items: parseList(loaded.html, "搜索"), hasMore: hasNext(loaded.html, page)};
}
async function detail(input) {
  const path = videoPath((input || {}).id);
  if (!path) throw new Error("剧集不匹配");
  const loaded = await getHtml("/" + path);
  if (!loaded) throw new Error("详情不可用");
  const title = metaTitle(loaded.html) || codeOf(path).toUpperCase();
  const intro = metaContent(loaded.html, "og:description");
  return {drama: {id: path, title: title, description: intro, intro: intro, cover: coverFor(path, loaded.html), episodes: 1, category: "MissAV"}, chapters: [{id: path, title: title}]};
}
async function play(input) {
  const args = input || {};
  const path = videoPath(args.id);
  if (!path) throw new Error("剧集不匹配");
  const loaded = await getHtml("/" + path);
  if (!loaded) throw new Error("播放页不可用");
  const media = extractVideoUrl(loaded.html);
  if (!media) throw new Error("未找到播放地址");
  const referer = loaded.site + "/";
  let body = "";
  try {
    const response = await Widget.http.get(media, {headers: headers(loaded.site)});
    body = String((response && response.data) || "");
  } catch (error) {}
  const rows = variantsFrom(body, media, referer);
  if (!rows.length) return {url: media, quality: Number(args.quality) || 0, referer: referer};
  return choose(rows, args.quality);
}
globalThis.nshort = {
  describe: describe,
  catalog: catalog,
  search: search,
  detail: detail,
  play: play,
  danmaku: async function () { return {items: []}; },
  seriesSeasons: async function () { return {items: []}; }
};
