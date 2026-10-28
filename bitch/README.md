# 碧池直播源插件

版本：1.0.0。由 N果 `examples/plugins/bitch.js` 同步，对应 Rex「Bitch Lives」1.0.4 的重写。

导入地址：

```
https://raw.githubusercontent.com/karlbilet/nshort-plugins/main/bitch/bitch.js
```

分类列表走明文 HTTP 81 端口，主地址 `api.hclyz.com`，备用 `api.maiyoux.com`。房间是 HTTP FLV。133 个分类拆成「碧池直播」和「更多直播」两个模块。没有站内搜索。标题里涉及未成年的房间会被省略。

已发布的 App 若仍拒绝 80/81 端口的公网 HTTP，导入后无法拉取列表，也不能把 FLV 交给播放器。Apple TV 可以拉列表，AVPlayer 不能播放 FLV。

离线验证：`node --test bitch/bitch.test.mjs`。本次上传没有请求上游源站，也没有下载视频分片。
