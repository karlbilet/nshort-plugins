# 红果官方 1080p 播放签名（纯 JS）

## 结论

可以，而且**不需要 libmetasec_ml.so**。

`x-argus / x-gorgon / x-ladon / x-khronos` 的算法已经在 `guoapp3/native/core/provider_hongguo_player_sign.go` 里用 Go 完整复现并通过真实请求（HTTP 200、返回 1080p 候选）。本轮把它逐字节移植成纯 JS，再包成 nshort 的 JS 源插件。

没有走「在 Android 设备上 Frida hook .so」的路线：`libmetasec_ml.so` 只有 `arm64-v8a` 一个 ABI，macOS/服务器上跑不了；hook 方案还要长期养一台设备或模拟器。

## 文件

| 文件 | 作用 |
| --- | --- |
| `hongguo-sign.mjs` | 签名库 + CLI，可单独在 Node 里用 |
| `plugin-body.js` | nshort 插件业务逻辑（目录/详情/播放） |
| `build-plugin.mjs` | 把上面两个拼成单文件插件 |
| `hongguo-1080.js` | **产物**，直接导入 nshort |

重新生成：

```sh
node build-plugin.mjs
```

## 接入 nshort

nshort → 设置 → JS 源插件 → 从文件导入 `hongguo-1080.js` → 启用。

不用改任何常量：目录、搜索、详情、播放都走官方接口，适用于红果全部剧集。

`hosts` 已在插件首行声明，全部落在 nshort 的 `hongguo` 可信域名族里（`fqnovel.com / hongguoduanju.com / snssdk.com / toutiaovod.com / douyinvod.com`），`Scope()` 返回 `hongguo`，可以直接启用。

## 请求流程

| 方法 | 入口 | 说明 |
| --- | --- | --- |
| `catalog` | `POST /reading/distribution/category/landpage/v/` | 按分类（`short_play` / `comic_series` / `ai_series`）取首页 18 条 |
| `search` | `GET hongguoduanju.com/search/<关键词>` | 解析网页里的 `window._ROUTER_DATA` → `searchList` |
| `detail` | `POST /novel/player/video_detail/v1/` | body `{series_id}` → `video_data.video_list` 分集表 |
| `play` | `POST /novel/player/video_model/v1/` | body `{video_id, need_all_video_definition:true, …}` → 各档位地址 |

`play` 的档位选择：跳过 `bytevc2`、跳过加密档位，按 `vheight/definition` 取最高（H.264 优先），返回 `{url, quality}`；全部加密时回落到网页播放页 `/player/<剧>/<集>` 的明文试看地址。

## 签名组成

- `X-Khronos`：Unix 秒
- `X-SS-STUB`：`%X(md5(body))`
- `X-Gorgon`：md5(query)/md5(body) 前 4 字节 + 固定尾 + 20 字节异或/位变换
- `X-Argus`：protobuf 消息（SM3 摘要、设备信息、时间戳）+ 72 轮自定义变换 + AES-128-CBC
- `X-Ladon`：md5(prefix+aid) 派生 34 个 key，做 64 位 Feistel 式变换

MD5、SM3、AES-128 全部自己实现，因为 nshort 的 QuickJS 沙箱没有 `crypto`、`Buffer`、`TextEncoder`。

## 已验证

1. **签名逐字节一致**：同一组固定输入（query、body、device_id、timestamp、nonce）下，JS 与 `guoapp3` 的 Go 实现输出完全相同：

   ```
   ARGUS=PMyLS9OddVTIX2pNS+zTUxuN6Q49anOZyT5Y9PWcBLRNvykyVzq+v4RSM6eTNeLIj7Z5e9JNV2Yzrf7gPrUnKPEzORmObt8un7Mg5fcf8ErEpqAgcZf7+vINlTA7dTCpSO1pRgi+PDjPvq8WUe904OuzASUZLtGMjDaF3tbQFz1z2HOjIFeRx79bk8A6GyUASctSgaEACTBysCESz50cevZ9tkz4jmTTqUp75X+q8+NfGuMNbj4zlFl3ITRHhgQ2Rqf+oMpUr21hFIm/O1TRmX3FBwi8sDlTkSEOrZZ+3HrHqw==
   LADON=AgMEBR+OjcbbkjVX7e+p2XQWURtDlNx8riVQMSe8kCjvACif
   GORGON=8404401c0000ad1cc59b878b76837022103fad22c9692e436641
   STUB=E85CD0D7C01FFEA84901311F87D4AC67
   ```

2. **在真实 nshort QuickJS 沙箱里跑通**（`plugins.Run`，假 fetch）：`catalog` / `search` / `detail` / `play` 四个方法都返回预期结构；`play` 从「720p 加密 / 1080p 未加密 / 1080p bytevc2」中选中 1080p H.264；全部加密时正确回落到网页试看地址（720p）；5 个签名头齐全，`Scope()=hongguo`。

3. 算法本身已由 `guoapp3` 对真实源站验证过（见 `nshortapp/docs/investigations/2026-10-22-hongguo-restart-comparison.md`：三次请求 HTTP 200、返回 1080p 候选、Range 读取成功）。本轮**没有**再对真实源站发请求。

## 限制

- **插件契约只能返回 `url` 和 `quality`**，没有 CENC 密钥字段。红果部分档位带 `spade_a`（`cenc-aes-ctr`），插件播不了：脚本会先挑未加密档位，全都加密时回落到网页试看地址（只有免费集有），仍然没有就报错。要覆盖加密档位得走内置 Go 源或改插件契约。
- `catalog` 只取分类首页 18 条（`hasMore` 由服务端 `has_more` 决定），没有做翻页游标持久化。
- `search` 依赖 `hongguoduanju.com` 网页结构和 `_ROUTER_DATA`，站点改版会失效。
- `detail` 依赖 `/novel/player/video_detail/v1/`；该接口此前出现过「HTTP 200 但响应 0 字节」，此时会报「目录为空」。
- 媒体地址的 CDN 域名必须在上面 5 个可信根里，否则 `ValidateURL` 会拒绝。
- nshort 插件沙箱的 `fetch` 永远返回 `ok:true, status:200`，拿不到真实 HTTP 状态，只能靠响应体里的 `code` 判断。

## 其他说明

- `libmetasec_ml.so` 是 `arm64-v8a` 的 Android ELF（bionic 链接），在 macOS/服务器上不能直接 `dlopen`；要跑只能 qemu-user + bionic stub 或 Frida，属于另一条维护成本更高的路线。
- 本目录下没有改动 nshort 源码，插件以独立文件形式提供。
