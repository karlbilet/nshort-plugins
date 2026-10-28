import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createContext, runInContext } from "node:vm";

const script = readFileSync(new URL("./bitch.js", import.meta.url), "utf8");
const room = "http://cdn.example/live/room1.flv?wsSecret=abc&wsTime=1&extra=1";
const refreshed = "http://cdn.example/live/room1.flv?extra=1&wsSecret=zzz&wsTime=9";
const list = JSON.stringify({zhubo: [
  {title: "示例房间", address: room, img: "https://img.example/a.jpg"},
  {title: "幼女测试", address: "http://cdn.example/live/bad.flv", img: "https://img.example/b.jpg"},
  {title: "内网", address: "http://10.0.0.8/live/a.flv", img: "https://img.example/c.jpg"},
  {title: "高端口", address: "http://cdn.example:8080/live/a.flv", img: "https://img.example/d.jpg"}
]});
const piped = "@mc管道房间|@dzhttp://cdn.example/live/pipe.flv|@tp1https://img.example/p.jpg";

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
  runInContext(script, createContext(sandbox), {filename: "bitch.js"});
  return {nshort: sandbox.nshort, urls};
}

test("bitch shelf lists adult categories and omits minor-targeted rooms", async () => {
  const {nshort, urls} = load((url) => url.includes("jsonkawayi.txt") ? list : null);
  const described = await nshort.describe();
  assert.equal(JSON.stringify(described.modules.map((row) => String(row.id))), JSON.stringify(["live", "more"]));
  const options = described.modules.flatMap((row) => row.params[0].enumOptions);
  assert.equal(options.length, 133);
  assert.equal(described.modules.every((row) => row.params[0].enumOptions.length <= 80), true);
  const labels = options.map((option) => option.title.toLowerCase());
  assert.equal(labels.some((label) => /萝莉|洛丽塔|lolita|学妹|父女/.test(label)), false);
  const page = await nshort.catalog({page: 1});
  assert.equal(page.items.length, 1);
  assert.equal(page.items[0].title, "示例房间");
  assert.equal(page.items[0].cover, "https://img.example/a.jpg");
  assert.equal(page.items[0].id.length <= 60, true);
  assert.equal(page.hasMore, false);
  assert.equal(urls[0], "http://api.hclyz.com:81/mf/jsonkawayi.txt");
});

test("playback keeps the fresh room url and ignores unsigned addresses", async () => {
  const {nshort, urls} = load((url) => {
    if (url.includes("jsonkawayi.txt") && url.includes("maiyoux")) return null;
    if (url.includes("jsonkawayi.txt")) return list;
    if (url.includes("jsonmihu.txt")) return piped;
    return null;
  });
  const blocked = await nshort.catalog({category: "../kawayi"});
  assert.equal(blocked.items.length, 0);
  assert.equal(urls.length, 0);
  const alias = await nshort.catalog({sort_by: "jsonxiaoxiannv"});
  assert.equal(alias.items.length, 0);
  assert.equal(urls.includes("http://api.hclyz.com:81/mf/jsonxiaoxiannu.txt"), true);
  const first = await nshort.catalog({category: "kawayi"});
  const again = await nshort.catalog({category: "kawayi"});
  assert.equal(first.items[0].id, again.items[0].id);
  const info = await nshort.detail({id: first.items[0].id});
  assert.equal(info.chapters[0].id, first.items[0].id);
  const media = await nshort.play({id: first.items[0].id, episode: {id: first.items[0].id}, quality: 0});
  assert.equal(media.url, room);
  const failover = load((url) => url.includes("maiyoux") && url.includes("jsonkawayi.txt") ? list.replace(room, refreshed) : null);
  const played = await failover.nshort.play({episode: {id: first.items[0].id}});
  assert.equal(played.url, refreshed);
  assert.equal(failover.urls[0].includes("hclyz"), true);
  assert.equal(failover.urls[1], "http://api.maiyoux.com:81/mf/jsonkawayi.txt");
  const pipe = await nshort.catalog({module: "live", category: "mihu"});
  assert.equal(pipe.items[0].title, "管道房间");
  assert.equal(pipe.items[0].cover, "https://img.example/p.jpg");
  await assert.rejects(() => nshort.play({episode: {id: "kawayi:aaaaaaaaaaaaaaaa"}}), /下播|线路/);
  assert.equal((await nshort.search({keyword: "示例"})).items.length, 0);
});
