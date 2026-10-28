# NShortApp JS 源插件

在 NShortApp → 设置 → JS 源插件 → 从 URL 导入，粘贴对应 `.js` 的 raw 地址即可。

| 插件 | raw 地址 |
| --- | --- |
| 红果官方 1080p | `https://raw.githubusercontent.com/karlbilet/nshort-plugins/main/hongguo/hongguo-1080.js` |
| 黄果视频 | `https://raw.githubusercontent.com/karlbilet/nshort-plugins/main/huangguo/huangguo-video.js` |
| 黄果 AI | `https://raw.githubusercontent.com/karlbilet/nshort-plugins/main/huangguo/huangguo-ai.js` |
| MissAV | `https://raw.githubusercontent.com/karlbilet/nshort-plugins/main/missav/missav.js` |
| Hanime1 | `https://raw.githubusercontent.com/karlbilet/nshort-plugins/main/hanime1/hanime1.js` |
| 51吃瓜 | `https://raw.githubusercontent.com/karlbilet/nshort-plugins/main/chigua/chigua.js` |
| 好看免费短剧 | `https://raw.githubusercontent.com/karlbilet/nshort-plugins/main/haokan/haokan.js` |
| 河马剧场 | `https://raw.githubusercontent.com/karlbilet/nshort-plugins/main/hema/hema.js` |
| 火龙免费短剧 | `https://raw.githubusercontent.com/karlbilet/nshort-plugins/main/huolong/huolong.js` |
| 每日大赛 | `https://raw.githubusercontent.com/karlbilet/nshort-plugins/main/mrds/mrds.js` |
| 七猫短剧 | `https://raw.githubusercontent.com/karlbilet/nshort-plugins/main/qimao/qimao.js` |
| 围观短剧 | `https://raw.githubusercontent.com/karlbilet/nshort-plugins/main/weiguan/weiguan.js` |
| 喜番短剧 | `https://raw.githubusercontent.com/karlbilet/nshort-plugins/main/xifan/xifan.js` |
| 星芽免费短剧 | `https://raw.githubusercontent.com/karlbilet/nshort-plugins/main/xingya/xingya.js` |
| 柚漫剧 | `https://raw.githubusercontent.com/karlbilet/nshort-plugins/main/youman/youman.js` |
| 碧池直播 | `https://raw.githubusercontent.com/karlbilet/nshort-plugins/main/bitch/bitch.js` |

黄果视频、黄果 AI 插件说明见 [黄果目录](huangguo/README.md)。两插件需要 N果 0.1.0 (34) 或更新版本提供的 `builtinSource` 内置解析绑定。旧 App 无法启用这两个插件。

说明见各目录下的 README。插件默认禁用，导入后需手动启用。

MissAV 插件与离线验证范围见 [MissAV 目录](missav/README.md)。账号、源权限和同步沿用 App 的现有规则。

## 新增模块兼容性

Hanime1 和本批 10 个新增模块需要宿主包含对应的源域名、请求头及权限映射。已发布的 N果 0.1.0 (37) 尚不含这批宿主适配，仅更新或导入 JS 无法补齐；请配合后续包含该适配的 App 版本使用。账号、源权限与同步规则保持由 App 管理。

本批新增插件原样同步，做语法检查与真实 QuickJS 运行时的 `describe` 加载、清单/模块契约离线验证；本次上传没有请求上游源站，也没有验证真实海报、搜索或播放可用性。Hanime1 的既有离线用例见其目录；源站 Cloudflare 限制仍以该目录说明为准。

碧池直播另外要求宿主放行公网 HTTP 的 80 和 81 端口，并把 FLV 交给本机播放器。只导入 JS 不能补齐这项宿主能力，说明见 [碧池直播目录](bitch/README.md)。
