import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createContext, runInContext } from "node:vm";

const script = readFileSync(new URL("./shadiao.js", import.meta.url), "utf8");
const show = {
  id: "7123456789012345678",
  title: "示例沙雕",
  description: "简介",
  cover: "https://img.example/a.jpg",
  episodes: 12,
  finished: false,
  heat: 9,
  tags: ["沙雕", "搞笑"],
};
const detailBody = {
  ...show,
  lastEpisode: 3,
  episodeList: [{no: 1, title: "1"}, {no: 3, title: "3"}],
};

function load(routes) {
  const urls = [];
  const sandbox = {
    fetch: async (url) => {
      urls.push(String(url));
      const body = routes(String(url));
      if (body == null) throw new Error("unexpected");
      return {ok: true, status: 200, text: async () => JSON.stringify(body)};
    },
  };
  runInContext(script, createContext(sandbox), {filename: "shadiao.js"});
  return {nshort: sandbox.nshort, urls};
}

test("shadiao shelf lists one show and keeps the resume episode", async () => {
  const {nshort, urls} = load((url) => {
    if (url.includes("/api/list?")) return [show, {id: "1", title: "过短编号"}];
    if (url.includes("/api/series/")) return detailBody;
    return null;
  });
  const described = await nshort.describe();
  assert.equal(described.modules.length, 9);
  assert.equal(described.modules[0].id, "hot");
  const page = await nshort.catalog({module: "hot", page: 1});
  assert.equal(page.items.length, 1);
  assert.equal(page.items[0].id, show.id);
  assert.equal(page.items[0].cover, "https://img.example/a.jpg");
  assert.equal(page.hasMore, false);
  assert.equal(urls[0].startsWith("https://nshort.alphatvapp.top/shadiao/api/list?"), true);
  assert.equal(urls[0].includes("kind=hot"), true);
  assert.equal(urls[0].includes("t="), true);
  const info = await nshort.detail({id: show.id});
  assert.equal(info.chapters[1].title, "第3集（上次看到）");
  const media = await nshort.play({episode: {id: info.chapters[1].id}, quality: 720});
  assert.equal(media.quality, 720);
  assert.equal(media.url.includes("/play/" + show.id + "/3.mp4?q=720p&t="), true);
  assert.equal((await nshort.search({keyword: ""})).items.length, 0);
  await assert.rejects(() => nshort.detail({id: "abc"}), /剧集不匹配/);
});
