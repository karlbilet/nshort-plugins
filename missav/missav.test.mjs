import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createContext, runInContext } from "node:vm";

const script = readFileSync(new URL("./missav.js", import.meta.url), "utf8");
const listHtml = `<div class="thumbnail"><img data-src="https://fourhoi.com/ssis-001/cover-t.jpg"><a class="text-secondary" href="https://missav.fans/cn/ssis-001">SSIS-001 标题</a></div>
<div class="thumbnail"><a class="text-secondary" href="/cn/mide-002-chinese-subtitle">MIDE-002</a></div>
<div class="thumbnail"><a class="text-secondary" href="https://missav.fans/dm4448/cn/genres/%E5%A5%B3%E9%AB%98%E4%B8%AD%E7%94%9F">女高中生</a></div>
<a class="text-secondary" href="https://evil.example/cn/abcd-999">外部</a>
<link rel="next" href="?page=2">`;
const detailHtml = `<meta property="og:title" content="SSIS-001 标题"><meta property="og:description" content="简介">
<script>eval(function(p,a,c,k,e,d){return p}('0://1.2/3/4.m3u8',36,5,'https|surrit|example|aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee|playlist'.split('|'))))</script>`;
const master = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=1280x720
720p/video.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1920x1080
1080p/video.m3u8
`;

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
      get: async (url, options) => {
        const response = await sandbox.fetch(url, {headers: (options && options.headers) || {}});
        return {data: await response.text(), statusCode: 200, headers: {}};
      },
    },
  };
  runInContext(script, createContext(sandbox), {filename: "missav.js"});
  return {nshort: sandbox.nshort, urls};
}

test("missav modules stay bounded and omit the schoolgirl genre", async () => {
  const {nshort, urls} = load((url) => url.includes("/dm539/cn/new") ? listHtml : null);
  const described = await nshort.describe();
  assert.equal(described.modules.length, 9);
  assert.equal(described.modules[0].id, "recent");
  assert.equal(described.modules[0].title, "最近更新");
  assert.equal(JSON.stringify(described).includes("女高中生"), false);
  assert.equal(new Set(described.modules.map((row) => row.id)).size, 9);
  const page = await nshort.catalog({page: 1});
  assert.equal(page.items.length, 2);
  assert.equal(page.items[0].id, "cn/ssis-001");
  assert.equal(page.items[1].id, "cn/mide-002-chinese-subtitle");
  assert.equal(page.items[0].cover, "https://fourhoi.com/ssis-001/cover-t.jpg");
  assert.equal(page.items[1].cover, "https://fourhoi.mrstcdn.store/mide-002/cover-t.jpg");
  assert.equal(page.hasMore, true);
  assert.deepEqual(urls, ["https://missav.fans/dm539/cn/new?sort=published_at"]);
});

test("unknown category and empty search do not become open urls", async () => {
  const {nshort, urls} = load((url) => url.includes("/dm539/cn/new") ? listHtml : null);
  const blocked = await nshort.catalog({module: "../cn"});
  assert.equal(blocked.items.length, 0);
  assert.equal(urls.length, 0);
  const recent = await nshort.search({query: "", page: 2});
  assert.equal(urls.at(-1), "https://missav.fans/dm539/cn/new?sort=published_at&page=2");
  assert.equal(recent.items[0].id, "cn/ssis-001");
  await nshort.catalog({module: "actress", endpoint: "dm179/cn/actresses/miru"});
  assert.match(urls.at(-1), /\/dm179\/cn\/actresses\/miru\?sort=released_at$/);
});

test("search and playback stay on declared hosts", async () => {
  const {nshort, urls} = load((url) => {
    if (url.includes("/cn/search/SSIS-001")) return listHtml;
    if (url.includes("/cn/ssis-001")) return detailHtml;
    if (url.includes("/playlist.m3u8")) return master;
    return null;
  });
  const found = await nshort.search({keyword: "SSIS-001"});
  assert.equal(found.items[0].id, "cn/ssis-001");
  assert.equal(urls[0], "https://missav.fans/cn/search/SSIS-001");
  const media = await nshort.play({id: "cn/ssis-001", quality: 720});
  assert.equal(media.url, "https://surrit.mrstcdn.store/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/720p/video.m3u8");
  assert.equal(media.quality, 720);
  assert.equal(media.referer, "https://missav.fans/");
  assert.equal(media.variants.length, 1);
  assert.equal(media.variants[0].quality, 1080);
  assert.equal(media.variants[0].referer, "https://missav.fans/");
  const info = await nshort.detail({id: "cn/ssis-001"});
  assert.equal(info.drama.title, "SSIS-001 标题");
  assert.equal(info.drama.description, "简介");
  assert.equal(info.chapters[0].id, "cn/ssis-001");
  assert.equal((await nshort.danmaku({})).items.length, 0);
  assert.equal((await nshort.seriesSeasons({})).items.length, 0);
  assert.equal(urls.some((url) => url.includes("missav.live") || url.includes("%E5%A5%B3%E9%AB%98%E4%B8%AD%E7%94%9F")), false);
});
