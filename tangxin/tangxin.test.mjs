import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createContext, runInContext } from "node:vm";

const script = readFileSync(new URL("./tangxin.js", import.meta.url), "utf8");
const listHtml = `<a class="cover-link" href="/v/6acd3f75e47626720d0b0134/" aria-label="示例视频"><img src="https://t.5gcdn.xyz/videos/6acd3f75e47626720d0b0134/cover.jpg" alt="示例视频"></a>
<a class="cover-link" href="/v/../secret/" aria-label="坏路径"></a>
<a href="https://evil.example/v/aaaaaaaaaaaaaaaaaaaaaaaa/">外站</a>
<link rel="next" href="/featured/2/">`;
const detailHtml = `<h1>示例视频</h1><video poster="https://t.5gcdn.xyz/videos/6acd3f75e47626720d0b0134/cover.jpg"></video><script>https://t.5gcdn.xyz/videos/6acd3f75e47626720d0b0134/index.m3u8</script>`;

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
  sandbox.Widget = {http: {get: async (url) => ({data: await (await sandbox.fetch(url)).text(), statusCode: 200, headers: {}})}};
  runInContext(script, createContext(sandbox), {filename: "tangxin.js"});
  return {nshort: sandbox.nshort, urls};
}

test("tangxin shelf omits minor-targeted labels and lists the home page", async () => {
  const {nshort, urls} = load((url) => url.endsWith("tangxinvlog.app/") ? listHtml : null);
  const described = await nshort.describe();
  assert.equal(JSON.stringify(described.modules.map((row) => String(row.id))), JSON.stringify(["home", "videos", "tags", "actors"]));
  const labels = described.modules.flatMap((row) => row.params.flatMap((param) => (param.enumOptions || []).map((option) => option.title.toLowerCase())));
  assert.equal(labels.some((label) => label === "jk" || /萝莉|洛丽塔|lolita|少女|学妹|父女/.test(label)), false);
  const page = await nshort.catalog({page: 1});
  assert.equal(page.items.length, 1);
  assert.equal(page.items[0].id, "6acd3f75e47626720d0b0134");
  assert.equal(page.items[0].cover, "https://t.5gcdn.xyz/videos/6acd3f75e47626720d0b0134/cover.jpg");
  assert.equal(page.hasMore, true);
  assert.equal(urls[0], "https://tangxinvlog.app/");
});

test("unknown filters do not fetch and playback keeps the site referer", async () => {
  const {nshort, urls} = load((url) => url.includes("/v/") ? detailHtml : listHtml);
  const blocked = await nshort.catalog({module: "videos", category: "../featured"});
  assert.equal(blocked.items.length, 0);
  assert.equal(urls.length, 0);
  const featured = await nshort.catalog({module: "videos", category: "featured", page: 2});
  assert.equal(featured.items[0].id, "6acd3f75e47626720d0b0134");
  assert.equal(urls.at(-1), "https://tangxinvlog.app/featured/2/");
  const info = await nshort.detail({id: "6acd3f75e47626720d0b0134"});
  assert.equal(info.drama.title, "示例视频");
  assert.equal(info.chapters[0].id, "6acd3f75e47626720d0b0134");
  const media = await nshort.play({id: "6acd3f75e47626720d0b0134", episode: {id: "6acd3f75e47626720d0b0134"}});
  assert.equal(media.url, "https://t.5gcdn.xyz/videos/6acd3f75e47626720d0b0134/index.m3u8");
  assert.equal(media.referer, "https://tangxinvlog.app/");
  assert.equal((await nshort.search({keyword: "示例"})).items.length, 0);
});
