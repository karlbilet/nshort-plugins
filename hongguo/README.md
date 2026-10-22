# 红果 JS 插件 1.0.1

把 `hongguo-1080.js` 导入 N果「设置 → JS 源插件」，手动启用后点击「浏览」。插件页面中的剧集使用独立插件身份，首页内置红果仍使用内置线路。普通账号只要已获红果源权限即可使用。

本次 App 的域名与海报组件修复也需要配套安装。只更新 JS，旧 App 可能仍会将图片域名判为未映射权限，或没有海报显示组件。

## 1.0.1 更新

- 清单新增实际图片主机 `p3-reading-sign.fqnovelpic.com`；海报保留源站原地址。
- App 取流优先；没有可用明文候选或 App 请求失败时，解析网页 `VideoObject.contentUrl`。
- 网页回退只接受当前剧集、当前分集的公开地址，并检查免费试看范围，避免串集或把限制集的试看当完整播放。

App 同时将 `fqnovelpic.com` 归入红果权限范围，并为插件列表接入现有海报组件及 HEIC 转换。访问仍要求清单列出精确主机：只写 `fqnovelpic.com` 不会授权所有子域；不开放任意域名和本机网络。

## 请求方式

| 功能 | 入口 |
| --- | --- |
| 目录 | 签名 POST `/reading/distribution/category/landpage/v/`，分类首页 18 条 |
| 搜索 | `hongguoduanju.com/search/<关键词>` 的 `_ROUTER_DATA` |
| 详情 | 签名 POST `/novel/player/video_detail/v1/` |
| 播放 | 签名 POST `/novel/player/video_model/v1/`，失败后网页公开地址 |

签名算法保留纯 JS 的 MD5、SM3、AES-128、Argus、Gorgon 和 Ladon 实现，不需要 Node、原生 `.so` 或账号凭证。导入和更新后默认停用，需重新启用。

## 画质与范围

文件名中的 1080p 表示可选候选，**不保证所有剧集都能以 1080p 播放**。当前插件契约只能返回 URL 和画质，不能传递 CENC 密钥；脚本跳过加密候选和 bytevc2，优先选择最高可用明文档位。网页公开回退的实际清晰度可能只有 360p。需要 CENC 1080p 的剧集仍需内置 App 线路。

目录目前只读取分类第一页，未实现翻页游标。搜索依赖网页结构，源站变化可能影响返回。弹幕和多季方法暂返回空列表。视频 CDN 也必须按 App 的精确主机规则授权；不把根域声明当通配符。

## 本地验证

```sh
node --test hongguo/hongguo-1080.test.mjs
```

测试使用合成响应，不访问真实源站或图片。覆盖海报声明、海报 URL 保留、App 明文优先、空响应/加密候选网页回退，以及分集和试看范围拒绝。真实模拟器验收记录在 NShortApp 仓库的 `docs/acceptance/js-plugin-posters-2026-10-22.md`。
