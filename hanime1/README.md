# Hanime1 源插件

版本：1.1.0。由 N果 `examples/plugins/hanime1.js` 同步，对应 Rex 模块 2.3.2。

导入地址：

```
https://raw.githubusercontent.com/karlbilet/nshort-plugins/main/hanime1/hanime1.js
```

在带 Hanime1 源权限的 N果版本中，通过「设置 → JS 源插件 → 从 URL 导入」保存地址，手动启用后从「插件」页进入。账号需要 `*` 或显式的 `hanime`。显式授权还要先执行迁移 `0010`。

筛选里去掉了 JK、正太、女兒和母女丼。首页目前会被 Cloudflare 验证页拦住，合成测试不代表真实源已经可打开。

离线验证：`node --test hanime1/hanime1.test.mjs`。
