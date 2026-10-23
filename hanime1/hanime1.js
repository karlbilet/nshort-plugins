// @nshort {"id":"hanime1","name":"Hanime1","version":"1.1.0","hosts":["hanime1.me","*.hanime1.me","*.sb-cd.com"]}
// N果 rewrite of hanime1 Rex module 2.3.2. Filters whose labels target minors are omitted.
const ORIGIN = "https://hanime1.me";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const OMITTED = {"JK": true, "正太": true, "女兒": true, "母女丼": true};
const SORT = {
  new_release: "最新上市", latest_upload: "最新上傳", daily_rank: "本日排行", weekly_rank: "本週排行",
  monthly_rank: "本月排行", views: "觀看次數", likes: "讚好比例", duration: "時長最長", watching: "他們在看"
};
const GENRE = {
  rifan: "裏番", paomian: "泡麵番", preview: "新番預告", motion: "Motion Anime", "3dcg": "3DCG", "2d": "2D動畫",
  "2_5d": "2.5D", ai: "AI生成", mmd: "MMD", cosplay: "Cosplay"
};
const TIME = {"24h": "過去 24 小時", "2d": "過去 2 天", "1w": "過去 1 週", "1m": "過去 1 個月", "3m": "過去 3 個月", "1y": "過去 1 年"};
const DURATION = {
  "1m_plus": "1 分鐘 +", "5m_plus": "5 分鐘 +", "10m_plus": "10 分鐘 +", "20m_plus": "20 分鐘 +",
  "30m_plus": "30 分鐘 +", "60m_plus": "60 分鐘 +", "0_10m": "0 - 10 分鐘", "0_20m": "0 - 20 分鐘"
};
const SORT_OPTIONS = [
  ["全部", "all"], ["最新上市", "new_release"], ["最新上传", "latest_upload"], ["本日排行", "daily_rank"],
  ["本周排行", "weekly_rank"], ["本月排行", "monthly_rank"], ["观看次数", "views"], ["点赞比例", "likes"],
  ["时长最长", "duration"], ["他们在看", "watching"]
];
const TIME_OPTIONS = [["全部", "all"], ["过去 24 小时", "24h"], ["过去 2 天", "2d"], ["过去 1 周", "1w"], ["过去 1 个月", "1m"], ["过去 3 个月", "3m"], ["过去 1 年", "1y"]];
const DURATION_OPTIONS = [
  ["全部", "all"], ["1 分钟 +", "1m_plus"], ["5 分钟 +", "5m_plus"], ["10 分钟 +", "10m_plus"],
  ["20 分钟 +", "20m_plus"], ["30 分钟 +", "30m_plus"], ["60 分钟 +", "60m_plus"], ["0 - 10 分钟", "0_10m"], ["0 - 20 分钟", "0_20m"]
];
const RANK_OPTIONS = [["他们在看", "watching"], ["本日排行", "daily_rank"], ["本周排行", "weekly_rank"], ["本月排行", "monthly_rank"], ["观看次数", "views"], ["点赞比例", "likes"], ["最新上传", "latest_upload"], ["最新上市", "new_release"], ["时长最长", "duration"]];
const SERIES_GENRE = [["裏番", "rifan"], ["泡麵番", "paomian"], ["新番預告", "preview"]];
const KIND_GENRE = [["全部", "all"], ["Motion Anime", "motion"], ["3DCG", "3dcg"], ["2D 動畫", "2d"], ["2.5D", "2_5d"], ["AI 生成", "ai"], ["MMD", "mmd"], ["Cosplay", "cosplay"]];
const ATTR = [["全部", "all"], ["無碼", "無碼"], ["AI解碼", "AI解碼"], ["中文字幕", "中文字幕"], ["中文配音", "中文配音"], ["同人作品", "同人作品"], ["斷面圖", "斷面圖"], ["ASMR", "ASMR"], ["1080p", "1080p"], ["60FPS", "60FPS"]];
const RELATION = [["全部", "all"], ["近親", "近親"], ["姐", "姐"], ["妹", "妹"], ["母", "母"], ["女兒", "女兒"], ["師生", "師生"], ["情侶", "情侶"], ["青梅竹馬", "青梅竹馬"], ["同事", "同事"]];
const ROLE = [["全部", "all"], ["JK", "JK"], ["處女", "處女"], ["御姐", "御姐"], ["熟女", "熟女"], ["人妻", "人妻"], ["女教師", "女教師"], ["男教師", "男教師"], ["女醫生", "女醫生"], ["女病人", "女病人"], ["護士", "護士"], ["OL", "OL"], ["女警", "女警"], ["大小姐", "大小姐"], ["偶像", "偶像"], ["女僕", "女僕"], ["巫女", "巫女"], ["魔女", "魔女"], ["修女", "修女"], ["風俗娘", "風俗娘"], ["公主", "公主"], ["女忍者", "女忍者"], ["女戰士", "女戰士"], ["女騎士", "女騎士"], ["魔法少女", "魔法少女"], ["異種族", "異種族"], ["天使", "天使"], ["妖精", "妖精"], ["魔物娘", "魔物娘"], ["魅魔", "魅魔"], ["吸血鬼", "吸血鬼"], ["女鬼", "女鬼"], ["獸娘", "獸娘"], ["福瑞", "福瑞"], ["乳牛", "乳牛"], ["機械娘", "機械娘"], ["碧池", "碧池"], ["痴女", "痴女"], ["雌小鬼", "雌小鬼"], ["不良少女", "不良少女"], ["傲嬌", "傲嬌"], ["病嬌", "病嬌"], ["無口", "無口"], ["無表情", "無表情"], ["眼神死", "眼神死"], ["正太", "正太"], ["偽娘", "偽娘"], ["扶他", "扶他"]];
const BODY = [["全部", "all"], ["短髮", "短髮"], ["馬尾", "馬尾"], ["雙馬尾", "雙馬尾"], ["丸子頭", "丸子頭"], ["巨乳", "巨乳"], ["乳環", "乳環"], ["舌環", "舌環"], ["貧乳", "貧乳"], ["黑皮膚", "黑皮膚"], ["曬痕", "曬痕"], ["眼鏡娘", "眼鏡娘"], ["獸耳", "獸耳"], ["尖耳朵", "尖耳朵"], ["異色瞳", "異色瞳"], ["美人痣", "美人痣"], ["肌肉女", "肌肉女"], ["白虎", "白虎"], ["陰毛", "陰毛"], ["腋毛", "腋毛"], ["大屌", "大屌"], ["黑屌", "黑屌"], ["著衣", "著衣"], ["水手服", "水手服"], ["體操服", "體操服"], ["泳裝", "泳裝"], ["比基尼", "比基尼"], ["死庫水", "死庫水"], ["和服", "和服"], ["兔女郎", "兔女郎"], ["圍裙", "圍裙"], ["啦啦隊", "啦啦隊"], ["絲襪", "絲襪"], ["吊襪帶", "吊襪帶"], ["熱褲", "熱褲"], ["迷你裙", "迷你裙"], ["性感內衣", "性感內衣"], ["緊身衣", "緊身衣"], ["丁字褲", "丁字褲"], ["高跟鞋", "高跟鞋"], ["睡衣", "睡衣"], ["婚紗", "婚紗"], ["旗袍", "旗袍"], ["古裝", "古裝"], ["哥德", "哥德"], ["口罩", "口罩"], ["刺青", "刺青"], ["淫紋", "淫紋"], ["身體寫字", "身體寫字"]];
const PLACE = [["全部", "all"], ["校園", "校園"], ["教室", "教室"], ["圖書館", "圖書館"], ["保健室", "保健室"], ["體育倉庫", "體育倉庫"], ["游泳池", "游泳池"], ["愛情賓館", "愛情賓館"], ["醫院", "醫院"], ["辦公室", "辦公室"], ["浴室", "浴室"], ["窗邊", "窗邊"], ["公共廁所", "公共廁所"], ["公眾場合", "公眾場合"], ["戶外野戰", "戶外野戰"], ["電車", "電車"], ["車震", "車震"], ["遊艇", "遊艇"], ["露營帳篷", "露營帳篷"], ["電影院", "電影院"], ["健身房", "健身房"], ["沙灘", "沙灘"], ["溫泉", "溫泉"], ["夜店", "夜店"], ["監獄", "監獄"], ["教堂", "教堂"]];
const PLOT = [["全部", "all"], ["純愛", "純愛"], ["戀愛喜劇", "戀愛喜劇"], ["後宮", "後宮"], ["十指緊扣", "十指緊扣"], ["開大車", "開大車"], ["NTR", "NTR"], ["精神控制", "精神控制"], ["藥物", "藥物"], ["痴漢", "痴漢"], ["阿嘿顏", "阿嘿顏"], ["哭泣", "哭泣"], ["精神崩潰", "精神崩潰"], ["獵奇", "獵奇"], ["BDSM", "BDSM"], ["綑綁", "綑綁"], ["眼罩", "眼罩"], ["項圈", "項圈"], ["調教", "調教"], ["異物插入", "異物插入"], ["尋歡洞", "尋歡洞"], ["肉便器", "肉便器"], ["性奴隸", "性奴隸"], ["胃凸", "胃凸"], ["強制", "強制"], ["輪姦", "輪姦"], ["凌辱", "凌辱"], ["性暴力", "性暴力"], ["逆強制", "逆強制"], ["女王樣", "女王樣"], ["榨精", "榨精"], ["母女丼", "母女丼"], ["姐妹丼", "姐妹丼"], ["出軌", "出軌"], ["醉酒", "醉酒"], ["攝影", "攝影"], ["睡眠姦", "睡眠姦"], ["機械姦", "機械姦"], ["蟲姦", "蟲姦"], ["性轉換", "性轉換"], ["百合", "百合"], ["耽美", "耽美"], ["時間停止", "時間停止"], ["異世界", "異世界"], ["怪獸", "怪獸"], ["哥布林", "哥布林"], ["世界末日", "世界末日"]];
const POSITION = [["全部", "all"], ["手交", "手交"], ["指交", "指交"], ["玩乳頭", "玩乳頭"], ["乳交", "乳交"], ["乳頭交", "乳頭交"], ["肛交", "肛交"], ["雙洞齊下", "雙洞齊下"], ["腳交", "腳交"], ["素股", "素股"], ["拳交", "拳交"], ["3P", "3P"], ["群交", "群交"], ["口交", "口交"], ["跪舔", "跪舔"], ["深喉嚨", "深喉嚨"], ["口爆", "口爆"], ["吞精", "吞精"], ["舔蛋蛋", "舔蛋蛋"], ["舔穴", "舔穴"], ["69", "69"], ["自慰", "自慰"], ["腋交", "腋交"], ["舔腋下", "舔腋下"], ["髮交", "髮交"], ["舔耳朵", "舔耳朵"], ["舔腳", "舔腳"], ["內射", "內射"], ["外射", "外射"], ["顏射", "顏射"], ["潮吹", "潮吹"], ["懷孕", "懷孕"], ["噴奶", "噴奶"], ["放尿", "放尿"], ["排便", "排便"], ["騎乘位", "騎乘位"], ["背後位", "背後位"], ["側面位", "側面位"], ["顏面騎乘", "顏面騎乘"], ["火車便當", "火車便當"], ["一字馬", "一字馬"], ["性玩具", "性玩具"], ["飛機杯", "飛機杯"], ["跳蛋", "跳蛋"], ["毒龙钻", "毒龍鑽"], ["触手", "觸手"], ["兽交", "獸交"], ["颈手枷", "頸手枷"], ["扯头发", "扯頭髮"], ["掐脖子", "掐脖子"], ["打屁股", "打屁股"], ["肉棒打脸", "肉棒打臉"], ["阴道外翻", "陰道外翻"], ["男乳首责", "男乳首責"], ["接吻", "接吻"], ["舌吻", "舌吻"], ["POV", "POV"]];

function headers() { return {"User-Agent": UA, "Accept": "text/html,application/xhtml+xml", "Referer": ORIGIN + "/"}; }
function pageOf(page) {
  const value = Number(page);
  if (!isFinite(value) || value < 1) return 1;
  return Math.min(1000, Math.floor(value));
}
function options(rows, fallback) {
  const out = [];
  for (let i = 0; i < rows.length; i++) {
    if (OMITTED[rows[i][1]]) continue;
    out.push({title: rows[i][0], value: rows[i][1]});
  }
  let value = fallback;
  let found = false;
  for (let i = 0; i < out.length; i++) if (out[i].value === value) found = true;
  if (!found) value = out[0].value;
  return {value: value, enumOptions: out};
}
function enumeration(name, title, rows, fallback) {
  const built = options(rows, fallback);
  return {name: name, title: title, type: "enumeration", value: built.value, enumOptions: built.enumOptions};
}
function filters(genreRows, genreValue) {
  return [
    enumeration("genre", "分类", genreRows, genreValue),
    enumeration("sort_by", "排序", SORT_OPTIONS, "all"),
    enumeration("upload_time", "日期", TIME_OPTIONS, "all"),
    enumeration("duration_filter", "时长", DURATION_OPTIONS, "all"),
    {name: "page", title: "页码", type: "page"}
  ];
}
function tagModule(id, title, rows, fallback) {
  return {id: id, title: title, kind: "tag", params: [enumeration("tag", title, rows, fallback), enumeration("sort", "排序", SORT_OPTIONS, "all"), {name: "page", title: "页码", type: "page"}]};
}
function moduleTable() {
  return [
    {id: "rank", title: "排行榜", kind: "rank", params: [enumeration("sort_by", "榜单", RANK_OPTIONS, "watching"), {name: "page", title: "页码", type: "page"}]},
    {id: "series", title: "番剧", kind: "filter", params: filters(SERIES_GENRE, "rifan")},
    {id: "kind", title: "分类", kind: "filter", params: filters(KIND_GENRE, "all")},
    tagModule("attr", "影片属性", ATTR, "無碼"),
    tagModule("relation", "人物关系", RELATION, "近親"),
    tagModule("role", "角色设定", ROLE, "御姐"),
    tagModule("body", "外貌身材", BODY, "短髮"),
    tagModule("place", "情境场所", PLACE, "校園"),
    tagModule("plot", "故事剧情", PLOT, "純愛"),
    tagModule("position", "性交体位", POSITION, "手交")
  ];
}
function findModule(id) {
  const table = moduleTable();
  const wanted = String(id || "");
  if (!wanted) return table[0];
  for (let i = 0; i < table.length; i++) if (table[i].id === wanted) return table[i];
  return null;
}
function chosen(mod, args, name) {
  let param = null;
  for (let i = 0; i < mod.params.length; i++) if (mod.params[i].name === name) param = mod.params[i];
  if (!param || param.type !== "enumeration") return "";
  const raw = args && args[name] != null && String(args[name]) !== "" ? String(args[name]) : String(param.value || "");
  const options = param.enumOptions || [];
  for (let i = 0; i < options.length; i++) if (options[i].value === raw) return raw;
  return null;
}
function pushMapped(parts, key, token, table) {
  if (!token || token === "all") return true;
  if (!table[token]) return false;
  parts.push(key + "=" + encodeURIComponent(table[token]));
  return true;
}
function listPath(mod, args, page) {
  if (!mod) return "";
  const parts = [];
  if (mod.kind === "rank") {
    const sort = chosen(mod, args, "sort_by");
    if (sort == null || !pushMapped(parts, "sort", sort, SORT)) return "";
  } else if (mod.kind === "filter") {
    const genre = chosen(mod, args, "genre");
    const sort = chosen(mod, args, "sort_by");
    const time = chosen(mod, args, "upload_time");
    const duration = chosen(mod, args, "duration_filter");
    if (genre == null || sort == null || time == null || duration == null) return "";
    if (!pushMapped(parts, "genre", genre, GENRE)) return "";
    if (!pushMapped(parts, "sort", sort, SORT)) return "";
    if (!pushMapped(parts, "time", time, TIME)) return "";
    if (!pushMapped(parts, "duration", duration, DURATION)) return "";
  } else {
    const tag = chosen(mod, args, "tag");
    const sort = chosen(mod, args, "sort");
    if (tag == null || sort == null || !pushMapped(parts, "sort", sort, SORT)) return "";
    if (tag && tag !== "all") parts.push("tags%5B%5D=" + encodeURIComponent(tag));
  }
  if (page > 1) parts.push("page=" + page);
  return "/search" + (parts.length ? "?" + parts.join("&") : "");
}
function describe() {
  const table = moduleTable();
  const modules = [];
  for (let i = 0; i < table.length; i++) modules.push({id: table[i].id, title: table[i].title, params: table[i].params});
  return {title: "Hanime1", modules: modules, search: {title: "搜索", params: [{name: "keyword", title: "关键词", type: "input"}]}};
}
async function getHtml(path) {
  if (!path || path.indexOf("://") >= 0 || path.indexOf("..") >= 0) return null;
  try {
    const response = await Widget.http.get(ORIGIN + path, {headers: headers()});
    const html = String((response && response.data) || "");
    if (!html || /<title[^>]*>\s*(just a moment|attention required|please wait)/i.test(html)) return null;
    return html;
  } catch (error) {
    return null;
  }
}
function decode(text) {
  return String(text || "").replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}
function attr(tag, name) {
  const match = String(tag || "").match(new RegExp(name + "\\s*=\\s*([\"'])([\\s\\S]*?)\\1", "i"));
  return match ? match[2] : "";
}
function videoId(value) {
  const text = String(value || "");
  const match = text.match(/^(?:.*[?&]v=)?(\d{1,12})$/);
  return match ? match[1] : "";
}
function coverIn(window) {
  const match = String(window || "").match(/(?:data-src|data-original|src)\s*=\s*["'](https:\/\/[^"']+)["']/i);
  if (!match) return "";
  const host = (match[1].match(/^https:\/\/([^\/?#]+)/i) || [])[1] || "";
  const name = host.toLowerCase();
  return name === "hanime1.me" || name.endsWith(".hanime1.me") ? match[1] : "";
}
function titleIn(window) {
  const marked = String(window || "").match(/class\s*=\s*["'][^"']*(?:home-rows-videos-title|card-mobile-title)[^"']*["'][^>]*>([^<]+)/i);
  if (marked) return decode(marked[1]);
  const plain = String(window || "").match(/<div\s+class\s*=\s*["']title["'][^>]*>([^<]+)/i);
  return plain ? decode(plain[1]) : "";
}
function parseList(html) {
  const items = [];
  const seen = {};
  const re = /href\s*=\s*["']([^"']+)["']/gi;
  let match;
  while ((match = re.exec(html)) && items.length < 80) {
    const href = match[1];
    if (/^https?:\/\//i.test(href) && !/^https:\/\/(?:[\w-]+\.)?hanime1\.me\//i.test(href)) continue;
    const found = href.match(/\/watch\?v=(\d+)/);
    if (!found) continue;
    const id = found[1];
    if (seen[id]) continue;
    const window = html.slice(match.index, match.index + 1800);
    const title = titleIn(window);
    if (!title) continue;
    seen[id] = true;
    items.push({id: id, title: title.slice(0, 120), description: title.slice(0, 120), intro: title.slice(0, 120), cover: coverIn(window), episodes: 1, category: "Hanime1"});
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
    if (match) return decode(match[1]);
  }
  return "";
}
function metaTitle(html) {
  const heading = html.match(/id=["']shareBtn-title["'][^>]*>([^<]+)/i);
  if (heading) return decode(heading[1]).slice(0, 120);
  return metaContent(html, "og:title").slice(0, 120);
}
function chaptersOf(html, id, title) {
  const rows = [];
  const seen = {};
  const re = /class\s*=\s*["'][^"']*playlist-hover-wrap[^"']*["'][^>]*data-href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]{0,500}?)<\/div>/gi;
  let match;
  while ((match = re.exec(html)) && rows.length < 5000) {
    const found = String(match[1]).match(/[?&]v=(\d+)/);
    if (!found || seen[found[1]]) continue;
    seen[found[1]] = true;
    const label = match[2].match(/class\s*=\s*["'][^"']*video-title[^"']*["'][^>]*>([^<]+)/i);
    rows.push({id: found[1], title: (label ? decode(label[1]) : title).slice(0, 120)});
  }
  if (!rows.length) rows.push({id: id, title: title});
  return rows;
}
function mediaHost(url) {
  const host = ((String(url).match(/^https:\/\/([^\/?#]+)/i) || [])[1] || "").toLowerCase();
  return host === "hanime1.me" || host.endsWith(".hanime1.me") || host === "sb-cd.com" || host.endsWith(".sb-cd.com");
}
function sourcesOf(html) {
  const rows = [];
  const seen = {};
  const re = /<source\b([^>]*)>/gi;
  let match;
  while ((match = re.exec(html))) {
    const src = attr(match[0], "src").replace(/&amp;/g, "&");
    const quality = Number(attr(match[0], "size")) || 0;
    if (!src || !quality || !mediaHost(src) || seen[src]) continue;
    seen[src] = true;
    rows.push({url: src.split("#")[0], quality: quality});
  }
  if (!rows.length) {
    const found = String(html).match(/https:\/\/[^"'\\\s]+\.mp4[^"'\\\s]*/i);
    if (found && mediaHost(found[0])) rows.push({url: found[0].replace(/&amp;/g, "&").split("#")[0], quality: 0});
  }
  rows.sort(function (a, b) { return b.quality - a.quality; });
  return rows;
}
function choose(rows, quality, referer) {
  const wanted = Number(quality) || 0;
  let picked = rows[0];
  for (let i = 0; i < rows.length; i++) {
    if (wanted && rows[i].quality === wanted) { picked = rows[i]; break; }
    if (rows[i].quality > picked.quality) picked = rows[i];
  }
  const variants = [];
  for (let i = 0; i < rows.length && variants.length < 16; i++) {
    if (rows[i].url === picked.url) continue;
    variants.push({url: rows[i].url, quality: rows[i].quality, referer: referer});
  }
  return {url: picked.url, quality: picked.quality || wanted, referer: referer, variants: variants};
}
function emptyList() { return {items: [], hasMore: false}; }
async function catalog(input) {
  const args = input || {};
  const page = pageOf(args.page);
  const mod = findModule(args.module);
  const path = listPath(mod, args, page);
  if (!path) return emptyList();
  const html = await getHtml(path);
  if (!html) return emptyList();
  return {items: parseList(html), hasMore: hasNext(html, page)};
}
async function search(input) {
  const args = input || {};
  const query = String(args.query || args.keyword || "").trim();
  const page = pageOf(args.page);
  if (!query) return catalog({page: page, module: "rank"});
  if (query.length > 80 || query.indexOf("..") >= 0) return emptyList();
  const path = "/search?query=" + encodeURIComponent(query) + (page > 1 ? "&page=" + page : "");
  const html = await getHtml(path);
  if (!html) return emptyList();
  return {items: parseList(html), hasMore: hasNext(html, page)};
}
async function detail(input) {
  const id = videoId((input || {}).id);
  if (!id) throw new Error("剧集不匹配");
  const html = await getHtml("/watch?v=" + id);
  if (!html) throw new Error("详情不可用");
  const title = metaTitle(html) || id;
  const intro = metaContent(html, "og:description");
  const chapters = chaptersOf(html, id, title);
  return {drama: {id: id, title: title, description: intro, intro: intro, cover: metaCover(html) || coverIn(html), episodes: chapters.length, category: "Hanime1"}, chapters: chapters};
}
function metaCover(html) {
  const content = metaContent(html, "og:image");
  return content.indexOf("https://") === 0 && mediaHost(content) && content.indexOf(".mp4") < 0 ? content : "";
}
async function play(input) {
  const args = input || {};
  const episode = args.episode && args.episode.id ? args.episode.id : args.id;
  const id = videoId(episode);
  if (!id) throw new Error("剧集不匹配");
  const html = await getHtml("/watch?v=" + id);
  if (!html) throw new Error("播放页不可用");
  const rows = sourcesOf(html);
  if (!rows.length) throw new Error("未找到播放地址");
  return choose(rows, args.quality, ORIGIN + "/watch?v=" + id);
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
