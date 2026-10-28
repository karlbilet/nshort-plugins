// @nshort {"id":"shadiao","name":"沙雕漫剧","version":"1.0.0","hosts":["nshort.alphatvapp.top"]}
// N果 client for the hgsd service. Playback history is shared by this token.
const BASE = "https://nshort.alphatvapp.top/shadiao";
const TOKEN = "fd350ae110ae0ec28c236136f38db9db8d192e69b0a2ca85f0cf613cdee90904";
const PAGE_SIZE = 20;

function enumeration(name, title, options, fallback) {
  const rows = [];
  for (let i = 0; i < options.length; i++) rows.push({title: options[i][0], value: options[i][1]});
  return {name: name, title: title, type: "enumeration", value: fallback, enumOptions: rows};
}
function categoryModule(id, title, cat) {
  return {
    id: id,
    title: title,
    params: [
      {name: "cat", title: "分类", type: "constant", value: cat},
      enumeration("sort", "排序", [["最热", "hot"], ["最新", "new"]], "hot"),
      {name: "page", title: "页码", type: "page"}
    ]
  };
}
function describe() {
  return {
    title: "沙雕漫剧",
    modules: [
      {id: "hot", title: "沙雕热门", params: [{name: "page", title: "页码", type: "page"}]},
      {id: "new", title: "沙雕最新", params: [{name: "page", title: "页码", type: "page"}]},
      categoryModule("funny", "沙雕·搞笑", "funny"),
      categoryModule("xianxia", "沙雕·修仙玄幻", "xianxia"),
      categoryModule("ancient", "沙雕·古代宫廷", "ancient"),
      categoryModule("urban", "沙雕·都市日常", "urban"),
      categoryModule("horror", "沙雕·恐怖怪谈", "horror"),
      categoryModule("system", "沙雕·系统升级", "system"),
      {id: "history", title: "播放记录", params: []}
    ],
    search: {title: "搜索", params: [{name: "keyword", title: "关键词", type: "input"}]}
  };
}
function pageOf(page) {
  const value = Number(page);
  if (!isFinite(value) || value < 1) return 1;
  return Math.min(1000, Math.floor(value));
}
function seriesId(value) {
  const text = String(value || "");
  return /^\d{4,25}$/.test(text) ? text : "";
}
function coverOf(value) {
  const cover = String(value || "").trim();
  if (cover.indexOf("https://") !== 0 || /\s/.test(cover)) return "";
  return cover;
}
function itemFrom(row, title) {
  const show = row || {};
  const id = seriesId(show.id);
  if (!id || !show.title) return null;
  const name = String(title || show.title).slice(0, 120);
  const text = String(show.description || "").slice(0, 500);
  const tags = [];
  const source = show.tags || [];
  for (let i = 0; i < source.length && tags.length < 12; i++) {
    if (typeof source[i] === "string" && source[i]) tags.push(source[i].slice(0, 20));
  }
  return {
    id: id,
    title: name,
    description: text,
    intro: text,
    cover: coverOf(show.cover),
    episodes: Math.max(0, Math.min(5000, Number(show.episodes) || 0)),
    category: "沙雕漫剧",
    tags: tags,
    heat: String(show.heat || ""),
    releaseStatus: show.finished ? "finished" : "ongoing"
  };
}
function historyTitle(row) {
  const show = row || {};
  let suffix = "";
  if (show.completed) suffix = " · 已看完";
  else if (show.hasUpdate) suffix = " · 有更新";
  else if (show.lastEpisode) suffix = " · 看到第" + show.lastEpisode + "集";
  return String(show.title || "") + suffix;
}
function queryString(query) {
  const parts = ["t=" + encodeURIComponent(TOKEN)];
  const keys = Object.keys(query || {});
  for (let i = 0; i < keys.length; i++) {
    const value = query[keys[i]];
    if (value == null || value === "") continue;
    parts.push(encodeURIComponent(keys[i]) + "=" + encodeURIComponent(String(value)));
  }
  return parts.join("&");
}
async function getJSON(path, query) {
  const response = await fetch(BASE + path + "?" + queryString(query));
  let data = null;
  try { data = JSON.parse(await response.text()); }
  catch (error) { throw new Error("沙雕服务返回无效"); }
  if (!data || data.error) throw new Error("沙雕服务暂不可用");
  return data;
}
function publish(rows, history) {
  const items = [];
  const seen = {};
  const list = Array.isArray(rows) ? rows : [];
  for (let i = 0; i < list.length; i++) {
    const item = itemFrom(list[i], history ? historyTitle(list[i]) : "");
    if (!item || seen[item.id]) continue;
    seen[item.id] = true;
    items.push(item);
  }
  return items;
}
async function catalog(input) {
  const args = input || {};
  const moduleId = String(args.module || "hot");
  if (moduleId === "history") {
    return {items: publish(await getJSON("/api/history", {}), true), hasMore: false};
  }
  const known = {hot: "hot", new: "new", funny: "funny", xianxia: "xianxia", ancient: "ancient", urban: "urban", horror: "horror", system: "system"};
  if (!known[moduleId]) return {items: [], hasMore: false};
  const kind = moduleId === "new" || args.sort === "new" ? "new" : "hot";
  const query = {kind: kind, page: pageOf(args.page)};
  if (known[moduleId] !== "hot" && known[moduleId] !== "new") query.cat = known[moduleId];
  const rows = await getJSON("/api/list", query);
  return {items: publish(rows, false), hasMore: Array.isArray(rows) && rows.length >= PAGE_SIZE};
}
async function search(input) {
  const args = input || {};
  const keyword = String(args.keyword || args.query || "").trim();
  if (!keyword) return {items: [], hasMore: false};
  const rows = await getJSON("/api/search", {q: keyword.slice(0, 40), page: pageOf(args.page)});
  return {items: publish(rows, false), hasMore: Array.isArray(rows) && rows.length >= PAGE_SIZE};
}
async function detail(input) {
  const id = seriesId((input || {}).id);
  if (!id) throw new Error("剧集不匹配");
  const row = await getJSON("/api/series/" + id, {});
  const drama = itemFrom(row);
  if (!drama) throw new Error("这部剧暂时打不开");
  const chapters = [];
  const episodes = row.episodeList || [];
  for (let i = 0; i < episodes.length && chapters.length < 5000; i++) {
    const no = Number(episodes[i].no);
    if (!no || no < 1) continue;
    const title = no === Number(row.lastEpisode) ? "第" + no + "集（上次看到）" : "第" + no + "集";
    chapters.push({id: id + ":" + no, title: title});
  }
  if (!chapters.length) throw new Error("这部剧暂时没有分集");
  return {drama: drama, chapters: chapters};
}
function qualityOf(value) {
  const number = Number(value);
  if (number === 720) return "720p";
  if (number === 480) return "480p";
  return "1080p";
}
function play(input) {
  const args = input || {};
  const episode = args.episode && args.episode.id ? args.episode.id : "";
  const match = String(episode).match(/^(\d{4,25}):(\d{1,6})$/);
  if (!match) throw new Error("剧集不匹配");
  const quality = qualityOf(args.quality);
  const height = quality === "720p" ? 720 : quality === "480p" ? 480 : 1080;
  return {
    url: BASE + "/play/" + match[1] + "/" + match[2] + ".mp4?q=" + quality + "&t=" + encodeURIComponent(TOKEN),
    quality: height
  };
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
