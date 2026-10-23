# 糖心Vlog 源插件

版本：1.0.0。由 N果 `examples/plugins/tangxin.js` 同步。

导入地址：

```
https://raw.githubusercontent.com/karlbilet/nshort-plugins/main/tangxin/tangxin.js
```

在插件目录启用。推荐、视频、标签和演员可以浏览。播放地址是站点详情页里的 HLS，请求需要站点 Referer。筛选项里去掉了萝莉、JK、少女、学妹、学生、校服、洛丽塔和父女相关条目。演员名单只保留前 80 个未省略的名字。

离线验证：`node --test tangxin/tangxin.test.mjs`。真实首页目录和一条 AES-128 播放列表已在本机核对过。
