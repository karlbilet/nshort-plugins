// @nshort {"id":"tangxin","name":"糖心Vlog","version":"1.0.0","hosts":["tangxinvlog.app","*.5gcdn.xyz"]}
// N果 rewrite of the Tangxin Vlog Rex module. Filters and names that target minors are omitted.
const ORIGIN = "https://tangxinvlog.app";
const CDN = "https://t.5gcdn.xyz";
const UA = "Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
const VIDEO_CATEGORIES = [["精选推荐", "featured"], ["Cosplay", "tag/cospaly"], ["黑料吃瓜", "tag/黑料正能量"]];
const TAGS = [["原创","tag/%E5%8E%9F%E5%88%9B"],["丝袜","tag/%E4%B8%9D%E8%A2%9C"],["巨乳","tag/%E5%B7%A8%E4%B9%B3"],["自慰","tag/%E8%87%AA%E6%85%B0"],["后入","tag/%E5%90%8E%E5%85%A5"],["高潮","tag/%E9%AB%98%E6%BD%AE"],["口交","tag/%E5%8F%A3%E4%BA%A4"],["反差","tag/%E5%8F%8D%E5%B7%AE"],["高清无码","tag/%E9%AB%98%E6%B8%85%E6%97%A0%E7%A0%81"],["母狗","tag/%E6%AF%8D%E7%8B%97"],["调教","tag/%E8%B0%83%E6%95%99"],["交合","tag/%E4%BA%A4%E5%90%88"],["御姐","tag/%E5%BE%A1%E5%A7%90"],["情趣","tag/%E6%83%85%E8%B6%A3"],["诱惑","tag/%E8%AF%B1%E6%83%91"],["内射","tag/%E5%86%85%E5%B0%84"],["道具","tag/%E9%81%93%E5%85%B7"],["骑乘","tag/%E9%AA%91%E4%B9%98"],["白虎","tag/%E7%99%BD%E8%99%8E"],["剧情","tag/%E5%89%A7%E6%83%85"],["女神","tag/%E5%A5%B3%E7%A5%9E"],["勾引","tag/%E5%8B%BE%E5%BC%95"],["约炮","tag/%E7%BA%A6%E7%82%AE"],["淫语","tag/%E6%B7%AB%E8%AF%AD"],["制服","tag/%E5%88%B6%E6%9C%8D"],["深喉","tag/%E6%B7%B1%E5%96%89"],["cospaly","tag/cospaly"],["潮喷","tag/%E6%BD%AE%E5%96%B7"],["足交","tag/%E8%B6%B3%E4%BA%A4"],["美臀","tag/%E7%BE%8E%E8%87%80"],["网黄","tag/%E7%BD%91%E9%BB%84"],["中文字幕","tag/%E4%B8%AD%E6%96%87%E5%AD%97%E5%B9%95"],["口爆","tag/%E5%8F%A3%E7%88%86"],["白浆","tag/%E7%99%BD%E6%B5%86"],["福利姬","tag/%E7%A6%8F%E5%88%A9%E5%A7%AC"],["美女","tag/%E7%BE%8E%E5%A5%B3"],["女优","tag/%E5%A5%B3%E4%BC%98"],["长腿","tag/%E9%95%BF%E8%85%BF"],["少妇","tag/%E5%B0%91%E5%A6%87"],["主播","tag/%E4%B8%BB%E6%92%AD"],["人妻","tag/%E4%BA%BA%E5%A6%BB"],["3p","tag/3p"],["免费","tag/%E5%85%8D%E8%B4%B9"],["无码","tag/%E6%97%A0%E7%A0%81"],["国产","tag/%E5%9B%BD%E4%BA%A7"],["高跟","tag/%E9%AB%98%E8%B7%9F"],["雪乳","tag/%E9%9B%AA%E4%B9%B3"],["91系列","tag/91%E7%B3%BB%E5%88%97"],["乱伦","tag/%E4%B9%B1%E4%BC%A6"],["酒店","tag/%E9%85%92%E5%BA%97"],["认证大神","tag/%E8%AE%A4%E8%AF%81%E5%A4%A7%E7%A5%9E"],["美腿","tag/%E7%BE%8E%E8%85%BF"],["国产av","tag/%E5%9B%BD%E4%BA%A7av"],["户外","tag/%E6%88%B7%E5%A4%96"],["偷情","tag/%E5%81%B7%E6%83%85"],["模特","tag/%E6%A8%A1%E7%89%B9"],["大学生","tag/%E5%A4%A7%E5%AD%A6%E7%94%9F"],["自拍","tag/%E8%87%AA%E6%8B%8D"],["喷水","tag/%E5%96%B7%E6%B0%B4"],["露出","tag/%E9%9C%B2%E5%87%BA"],["舔鲍","tag/%E8%88%94%E9%B2%8D"],["2024年度精选","tag/2024%E5%B9%B4%E5%BA%A6%E7%B2%BE%E9%80%89"],["女仆","tag/%E5%A5%B3%E4%BB%86"],["痴女","tag/%E7%97%B4%E5%A5%B3"],["颜射","tag/%E9%A2%9C%E5%B0%84"],["网红","tag/%E7%BD%91%E7%BA%A2"],["偷拍","tag/%E5%81%B7%E6%8B%8D"],["熟女","tag/%E7%86%9F%E5%A5%B3"],["国语","tag/%E5%9B%BD%E8%AF%AD"],["清纯","tag/%E6%B8%85%E7%BA%AF"],["糖心短剧","tag/%E7%B3%96%E5%BF%83%E7%9F%AD%E5%89%A7"],["双马尾","tag/%E5%8F%8C%E9%A9%AC%E5%B0%BE"],["强奸","tag/%E5%BC%BA%E5%A5%B8"],["极品","tag/%E6%9E%81%E5%93%81"],["捆绑","tag/%E6%8D%86%E7%BB%91"],["乳交","tag/%E4%B9%B3%E4%BA%A4"],["群p","tag/%E7%BE%A4p"],["肛交","tag/%E8%82%9B%E4%BA%A4"],["探花","tag/%E6%8E%A2%E8%8A%B1"],["跳舞","tag/%E8%B7%B3%E8%88%9E"]];
const ACTORS = [["岛国梦工厂","a/%E5%B2%9B%E5%9B%BD%E6%A2%A6%E5%B7%A5%E5%8E%82"],["星空无限传媒","a/%E6%98%9F%E7%A9%BA%E6%97%A0%E9%99%90%E4%BC%A0%E5%AA%92"],["糖心AI创意短剧","a/%E7%B3%96%E5%BF%83AI%E5%88%9B%E6%84%8F%E7%9F%AD%E5%89%A7"],["极限反差团","a/%E6%9E%81%E9%99%90%E5%8F%8D%E5%B7%AE%E5%9B%A2"],["玫瑰","a/%E7%8E%AB%E7%91%B0"],["糖心官方君","a/%E7%B3%96%E5%BF%83%E5%AE%98%E6%96%B9%E5%90%9B"],["卡卡西","a/%E5%8D%A1%E5%8D%A1%E8%A5%BF"],["爱豆传媒","a/%E7%88%B1%E8%B1%86%E4%BC%A0%E5%AA%92"],["小野整活部","a/%E5%B0%8F%E9%87%8E%E6%95%B4%E6%B4%BB%E9%83%A8"],["主播真会玩","a/%E4%B8%BB%E6%92%AD%E7%9C%9F%E4%BC%9A%E7%8E%A9"],["ED MOASIC","a/ED%20%20MOASIC"],["Sweetie Fox(小狐狸)","a/Sweetie%20Fox(%E5%B0%8F%E7%8B%90%E7%8B%B8)"],["猛料情报局","a/%E7%8C%9B%E6%96%99%E6%83%85%E6%8A%A5%E5%B1%80"],["桥本香菜","a/%E6%A1%A5%E6%9C%AC%E9%A6%99%E8%8F%9C"],["D先生","a/D%E5%85%88%E7%94%9F"],["饼干姐姐","a/%E9%A5%BC%E5%B9%B2%E5%A7%90%E5%A7%90"],["Nana_taipei","a/Nana_taipei"],["糖心小晚酱接1v1","a/%E7%B3%96%E5%BF%83%E5%B0%8F%E6%99%9A%E9%85%B1%E6%8E%A51v1"],["搬运工","a/%E6%90%AC%E8%BF%90%E5%B7%A5"],["默默是olive呀","a/%E9%BB%98%E9%BB%98%E6%98%AFolive%E5%91%80"],["桃木乃香奈","a/%E6%A1%83%E6%9C%A8%E4%B9%83%E9%A6%99%E5%A5%88"],["Yua🐹","a/Yua%F0%9F%90%B9"],["玩偶姐姐","a/%E7%8E%A9%E5%81%B6%E5%A7%90%E5%A7%90"],["学姐","a/%E5%AD%A6%E5%A7%90"],["狮子座","a/%E7%8B%AE%E5%AD%90%E5%BA%A7"],["米娜学姐","a/%E7%B1%B3%E5%A8%9C%E5%AD%A6%E5%A7%90"],["小辣椒","a/%E5%B0%8F%E8%BE%A3%E6%A4%92"],["柚子","a/%E6%9F%9A%E5%AD%90"],["Applecptv","a/Applecptv"],["情深叉喔","a/%E6%83%85%E6%B7%B1%E5%8F%89%E5%96%94"],["反差婊基地","a/%E5%8F%8D%E5%B7%AE%E5%A9%8A%E5%9F%BA%E5%9C%B0"],["噗噗","a/%E5%99%97%E5%99%97"],["辛尤里","a/%E8%BE%9B%E5%B0%A4%E9%87%8C"],["捅主任","a/%E6%8D%85%E4%B8%BB%E4%BB%BB"],["jeenypinky","a/jeenypinky"],["偷腥一束光","a/%E5%81%B7%E8%85%A5%E4%B8%80%E6%9D%9F%E5%85%89"],["小欣奈","a/%E5%B0%8F%E6%AC%A3%E5%A5%88"],["创可贴贴","a/%E5%88%9B%E5%8F%AF%E8%B4%B4%E8%B4%B4"],["Naomiii hub","a/Naomiii%20hub"],["下面有根棒棒糖","a/%E4%B8%8B%E9%9D%A2%E6%9C%89%E6%A0%B9%E6%A3%92%E6%A3%92%E7%B3%96"],["森泽佳奈","a/%E6%A3%AE%E6%B3%BD%E4%BD%B3%E5%A5%88"],["ssrpeach","a/ssrpeach"],["冉冉学姐","a/%E5%86%89%E5%86%89%E5%AD%A6%E5%A7%90"],["探花档案","a/%E6%8E%A2%E8%8A%B1%E6%A1%A3%E6%A1%88"],["唐伯虎","a/%E5%94%90%E4%BC%AF%E8%99%8E"],["FC2","a/FC2"],["菠萝包","a/%E8%8F%A0%E8%90%9D%E5%8C%85"],["JB_Diary","a/JB_Diary"],["蓝色浪漫","a/%E8%93%9D%E8%89%B2%E6%B5%AA%E6%BC%AB"],["osanpo-milk","a/osanpo-milk"],["Yui🐰ゆい🍑","a/Yui%F0%9F%90%B0%E3%82%86%E3%81%84%F0%9F%8D%91"],["吴梦梦","a/%E5%90%B4%E6%A2%A6%E6%A2%A6"],["我是苏畅","a/%E6%88%91%E6%98%AF%E8%8B%8F%E7%95%85"],["Pinkloves","a/Pinkloves"],["抖妹精选","a/%E6%8A%96%E5%A6%B9%E7%B2%BE%E9%80%89"],["西野加奈","a/%E8%A5%BF%E9%87%8E%E5%8A%A0%E5%A5%88"],["99吃瓜","a/99%E5%90%83%E7%93%9C"],["米胡桃","a/%E7%B1%B3%E8%83%A1%E6%A1%83"],["米菲兔","a/%E7%B1%B3%E8%8F%B2%E5%85%94"],["唐可可","a/%E5%94%90%E5%8F%AF%E5%8F%AF"],["糖心锅锅酱","a/%E7%B3%96%E5%BF%83%E9%94%85%E9%94%85%E9%85%B1"],["鸡教练","a/%E9%B8%A1%E6%95%99%E7%BB%83"],["Couple love-原创","a/Couple%20love-%E5%8E%9F%E5%88%9B"],["初恋小安","a/%E5%88%9D%E6%81%8B%E5%B0%8F%E5%AE%89"],["反差日报","a/%E5%8F%8D%E5%B7%AE%E6%97%A5%E6%8A%A5"],["西门庆","a/%E8%A5%BF%E9%97%A8%E5%BA%86"],["Cos女神堂","a/Cos%E5%A5%B3%E7%A5%9E%E5%A0%82"],["苏小涵","a/%E8%8B%8F%E5%B0%8F%E6%B6%B5"],["Looks199","a/Looks199"],["SLRabbit","a/SLRabbit"],["佐美","a/%E4%BD%90%E7%BE%8E"],["荔枝","a/%E8%8D%94%E6%9E%9D"],["Make性专家","a/Make%E6%80%A7%E4%B8%93%E5%AE%B6"],["miuzxc","a/miuzxc"],["嘿嘿蝴蝶","a/%E5%98%BF%E5%98%BF%E8%9D%B4%E8%9D%B6"],["小敏儿","a/%E5%B0%8F%E6%95%8F%E5%84%BF"],["菜菜不菜","a/%E8%8F%9C%E8%8F%9C%E4%B8%8D%E8%8F%9C"],["萌崽儿","a/%E8%90%8C%E5%B4%BD%E5%84%BF"],["okirakuhuhu","a/okirakuhuhu"],["Yuzukitty柚子猫","a/Yuzukitty%E6%9F%9A%E5%AD%90%E7%8C%AB"]];

function headers() { return {"User-Agent": UA, "Accept": "text/html,application/xhtml+xml", "Referer": ORIGIN + "/"}; }
function pageOf(page) {
  const value = Number(page);
  if (!isFinite(value) || value < 1) return 1;
  return Math.min(1000, Math.floor(value));
}
function enumeration(name, title, rows, fallback) {
  const options = [];
  for (let i = 0; i < rows.length; i++) options.push({title: rows[i][0], value: rows[i][1]});
  return {name: name, title: title, type: "enumeration", value: fallback, enumOptions: options};
}
function moduleTable() {
  return [
    {id: "home", title: "推荐", kind: "home", params: [{name: "page", title: "页码", type: "page"}]},
    {id: "videos", title: "视频", kind: "videos", params: [enumeration("category", "分类", VIDEO_CATEGORIES, "featured"), {name: "page", title: "页码", type: "page"}]},
    {id: "tags", title: "标签", kind: "path", field: "tag", params: [enumeration("tag", "标签", TAGS, TAGS[0][1]), {name: "page", title: "页码", type: "page"}]},
    {id: "actors", title: "演员", kind: "path", field: "actor", params: [enumeration("actor", "演员", ACTORS, ACTORS[0][1]), {name: "page", title: "页码", type: "page"}]}
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
function listPath(mod, args, page) {
  if (!mod) return "";
  let base = "";
  if (mod.kind === "home") base = page > 1 ? "featured/" + page : "";
  else if (mod.kind === "videos") {
    const category = chosen(mod, args, "category");
    if (category == null || category.indexOf("..") >= 0) return "";
    base = category + (page > 1 ? "/" + page : "");
  } else {
    const path = chosen(mod, args, mod.field);
    if (path == null || path.indexOf("..") >= 0 || path.indexOf("://") >= 0) return "";
    base = path + (page > 1 ? "/" + page : "");
  }
  return "/" + base + (base ? "/" : "");
}
function describe() {
  const table = moduleTable();
  const modules = [];
  for (let i = 0; i < table.length; i++) modules.push({id: table[i].id, title: table[i].title, params: table[i].params});
  return {title: "糖心Vlog", modules: modules, search: {title: "搜索", params: [{name: "keyword", title: "关键词", type: "input"}]}};
}
async function getHtml(path) {
  if (!path || path.indexOf("://") >= 0 || path.indexOf("..") >= 0) return null;
  try {
    const response = await Widget.http.get(ORIGIN + path, {headers: headers()});
    return String((response && response.data) || "");
  } catch (error) {
    return null;
  }
}
function decodeText(text) {
  return String(text || "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
}
function videoId(value) {
  const text = String(value || "");
  const match = text.match(/^(?:tangxin:v:|tangxin_v_)?([A-Za-z0-9]{1,40})$/);
  return match ? match[1] : "";
}
function attr(tag, name) {
  const match = String(tag || "").match(new RegExp(name + "\\s*=\\s*([\"'])([\\s\\S]*?)\\1", "i"));
  return match ? match[2] : "";
}
function parseList(html) {
  const items = [];
  const seen = {};
  const re = /<a\b([^>]*\bcover-link\b[^>]*)>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = re.exec(html)) && items.length < 80) {
    const href = attr(match[1], "href");
    const id = ((href.match(/\/v\/([^\/]+)/) || [])[1] || "");
    if (!videoId(id) || seen[id]) continue;
    const block = match[2] || "";
    const image = block.match(/<img\b[^>]*src=["']([^"']+)["']/i);
    const alt = block.match(/<img\b[^>]*alt=["']([^"']*)["']/i);
    const title = decodeText(attr(match[1], "aria-label") || (alt && alt[1]) || "");
    if (!title) continue;
    seen[id] = true;
    let cover = image ? image[1] : CDN + "/videos/" + id + "/cover.jpg";
    if (cover.indexOf("//") === 0) cover = "https:" + cover;
    else if (cover.charAt(0) === "/") cover = ORIGIN + cover;
    if (cover.indexOf("https://") !== 0) cover = "";
    items.push({id: id, title: title.slice(0, 120), description: title.slice(0, 120), intro: title.slice(0, 120), cover: cover, episodes: 1, category: "糖心Vlog"});
  }
  return items;
}
function hasNext(html, page) {
  return new RegExp("/" + (page + 1) + "/").test(html) || /rel=["']next["']/i.test(html);
}
function metaTitle(html) {
  const heading = String(html || "").match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  return heading ? decodeText(heading[1]).slice(0, 120) : "";
}
function mediaOf(html, id) {
  const found = String(html || "").match(/https?:\/\/[^"'<\s]+\.m3u8[^"'<\s]*/i);
  if (found && found[0].indexOf("https://") === 0) return found[0].split("#")[0];
  return CDN + "/videos/" + id + "/index.m3u8";
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
async function search() { return emptyList(); }
async function detail(input) {
  const id = videoId((input || {}).id);
  if (!id) throw new Error("剧集不匹配");
  const html = await getHtml("/v/" + id + "/");
  if (!html) throw new Error("详情不可用");
  const title = metaTitle(html) || id;
  const poster = (html.match(/<video\b[^>]*poster=["']([^"']+)["']/i) || [])[1] || (CDN + "/videos/" + id + "/cover.jpg");
  return {drama: {id: id, title: title, description: title, intro: title, cover: poster.indexOf("https://") === 0 ? poster : "", episodes: 1, category: "糖心Vlog"}, chapters: [{id: id, title: title}]};
}
async function play(input) {
  const args = input || {};
  const episode = args.episode && args.episode.id ? args.episode.id : args.id;
  const id = videoId(episode);
  if (!id) throw new Error("剧集不匹配");
  const html = await getHtml("/v/" + id + "/");
  if (!html) throw new Error("播放页不可用");
  return {url: mediaOf(html, id), quality: Number(args.quality) || 0, referer: ORIGIN + "/"};
}
globalThis.nshort = {
  describe: describe, catalog: catalog, search: search, detail: detail, play: play,
  danmaku: async function () { return {items: []}; },
  seriesSeasons: async function () { return {items: []}; }
};
