# MissAV 源插件

版本：1.0.0。由 N果现有 `examples/plugins/missav.js` 原样同步，采用 N果 JS 插件接口和模块分类。

导入地址：

```
https://raw.githubusercontent.com/karlbilet/nshort-plugins/main/missav/missav.js
```

在 N果 0.1.0 (34) 或更新版本中，通过「设置 → JS 源插件 → 从 URL 导入」保存地址，手动启用后从「插件」页进入。之后可检查更新，一键更新会保留启用状态。访问仍受账号源权限控制，不会绕过服务端授权。

本次只验证脚本语法和合成契约，不代表已完成真实源海报或播放验收。上游站点可用性及账号源权限会影响实际使用。

离线验证：`node --test missav/missav.test.mjs`。
