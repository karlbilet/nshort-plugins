import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createContext, runInContext } from "node:vm";

const script = readFileSync(new URL("./hanime1.js", import.meta.url), "utf8");
const listHtml = `<a href="https://hanime1.me/watch?v=1001"><img data-src="https://cdn.hanime1.me/1001.jpg"><div class="home-rows-videos-title">示例番</div></a>
<a href="https://hanime1.me/watch?v=1002"><div class="card-mobile-title">第二部</div></a>
<a href="https://evil.example/watch?v=1003"><div class="home-rows-videos-title">外站</div></a>
<link rel="next" href="?page=2">`;
const detailHtml = `<meta property="og:title" content="示例番"><meta property="og:description" content="简介"><meta property="og:image" content="https://cdn.hanime1.me/1001.jpg">
<div id="shareBtn-title">示例番</div>
<video><source src="https://vdownload-1.sb-cd.com/1001/1080.mp4" size="1080"><source src="https://vdownload-1.sb-cd.com/1001/720.mp4" size="720"></video>
<div class="playlist-hover-wrap clickable-row" data-href="/watch?v=1001"><a class="video-title">第一集</a></div>
<div class="playlist-hover-wrap clickable-row" data-href="/watch?v=1002"><a class="video-title">第二集</a></div>`;

function load(routes) {
  const urls = [];
  const sandbox = {
    fetch: async (url) => {
      urls.push(String(url));
      const body = routes(String(url));
      if (body == null) throw new Error("unexpected " + url);
      return {ok: true, status: 200, text: async () => body};
    },
  };
  sandbox.Widget = {
    http: {
      get: async (url) => {
        const response = await sandbox.fetch(url);
        return {data: await response.text(), statusCode: 200, headers: {}};
      },
    },
  };
  runInContext(script, createContext(sandbox), {filename: "hanime1.js"});
  return {nshort: sandbox.nshort, urls};
}

test("hanime modules omit minor-targeted filters", async () => {
  const {nshort, urls} = load((url) => url.includes("/search?") ? listHtml : null);
  const described = await nshort.describe();
  assert.equal(described.modules.length, 10);
  assert.equal(described.modules[0].id, "rank");
  const role = described.modules.find((row) => row.id === "role");
  const relation = described.modules.find((row) => row.id === "relation");
  const plot = described.modules.find((row) => row.id === "plot");
  const values = [role, relation, plot].flatMap((row) => row.params[0].enumOptions.map((option) => option.value));
  assert.equal(values.includes("JK") || values.includes("正太") || values.includes("女兒") || values.includes("母女丼"), false);
  assert.equal(role.params[0].value, "御姐");
  const seriesModule = described.modules.find((row) => row.id === "series");
  assert.equal(seriesModule.params[0].enumOptions.some((option) => option.value === "preview"), true);
  assert.equal(described.modules[0].params[0].enumOptions.length, 9);
  const page = await nshort.catalog({page: 1});
  assert.equal(page.items.length, 2);
  assert.equal(page.items[0].id, "1001");
  assert.equal(page.items[0].cover, "https://cdn.hanime1.me/1001.jpg");
  assert.equal(page.items[1].cover, "");
  assert.equal(page.hasMore, true);
  assert.equal(decodeURIComponent(urls[0]), "https://hanime1.me/search?sort=他們在看");
});

test("unknown filters do not become open urls and a challenge page stays empty", async () => {
  const challenge = `<title>Just a moment...</title><a href="/watch?v=1001"><div class="home-rows-videos-title">诱饵</div></a>`;
  const {nshort, urls} = load((url) => url.includes("tags") ? challenge : listHtml);
  const blocked = await nshort.catalog({module: "../cn"});
  assert.equal(blocked.items.length, 0);
  assert.equal(urls.length, 0);
  await nshort.catalog({module: "role", tag: "JK"});
  assert.equal(urls.length, 0);
  const hidden = await nshort.catalog({module: "attr", tag: "無碼"});
  assert.equal(hidden.items.length, 0);
  assert.equal(urls.length, 1);
  const series = await nshort.catalog({module: "series", genre: "rifan", page: 2});
  assert.equal(series.items[0].id, "1001");
  assert.equal(decodeURIComponent(urls.at(-1)), "https://hanime1.me/search?genre=裏番&page=2");
  const sorted = await nshort.catalog({module: "place", tag: "體育倉庫", sort: "views"});
  assert.equal(decodeURIComponent(urls.at(-1)), "https://hanime1.me/search?sort=觀看次數&tags[]=體育倉庫");
  await nshort.catalog({module: "series", genre: "preview"});
  assert.equal(decodeURIComponent(urls.at(-1)), "https://hanime1.me/search?genre=新番預告");
});

test("search detail and playback stay on declared hosts", async () => {
  const {nshort, urls} = load((url) => url.includes("/search?") ? listHtml : detailHtml);
  const found = await nshort.search({keyword: "示例"});
  assert.equal(found.items[0].id, "1001");
  assert.equal(decodeURIComponent(urls[0]), "https://hanime1.me/search?query=示例");
  const info = await nshort.detail({id: "1001"});
  assert.equal(info.drama.title, "示例番");
  assert.equal(info.drama.cover, "https://cdn.hanime1.me/1001.jpg");
  assert.equal(JSON.stringify(info.chapters.map((row) => row.id)), JSON.stringify(["1001", "1002"]));
  const media = await nshort.play({id: "1001", episode: {id: "1002"}, quality: 720});
  assert.equal(media.url, "https://vdownload-1.sb-cd.com/1001/720.mp4");
  assert.equal(media.quality, 720);
  assert.equal(media.referer, "https://hanime1.me/watch?v=1002");
  assert.equal(media.variants[0].url, "https://vdownload-1.sb-cd.com/1001/1080.mp4");
  assert.equal((await nshort.danmaku({})).items.length, 0);
  assert.equal(urls.some((url) => url.includes("evil.example")), false);
});
