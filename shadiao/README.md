# 沙雕漫剧源插件

版本：1.0.0。由 N果 `examples/plugins/shadiao.js` 同步。列表和播放都走已部署的 hgsd，不直接请求红果。

导入地址：

```
https://raw.githubusercontent.com/karlbilet/nshort-plugins/main/shadiao/shadiao.js
```

服务地址是 `https://nshort.alphatvapp.top/shadiao/`。热门、最新、六个分类和播放记录可以浏览，搜索只返回沙雕画风。播放地址是解密后的 MP4。脚本内带有服务口令，导入这份插件的设备共用同一份播放记录。

离线验证：`node --test shadiao/shadiao.test.mjs`。本次上传没有下载视频分片。
