# 今日盒子

一个单页：每天自动换的数据 + 11 个小工具 + 一个 AI 小帮手。纯静态，放 GitHub Pages 就能跑，不用服务器、不用数据库。

## 页面里有什么

**今天的数据**（每天自动更新）
- GitHub 最近 7 天新增星数最多的 10 个新项目
- 人民币对美元、欧元、日元、英镑、港币的汇率
- 每日一句（本地固定 12 条，按日子轮）

**小工具**（11 个，全在浏览器里算）
时间戳 · JSON 美化/压缩 · Base64 · URL 编解码 · 随机密码 · 字数统计 · 图片压缩 · 颜色转换 · 日期差 · 人民币大写 · 文本对比

**小帮手**
用你自己的 key 调接口，6 个动作：总结三点、说人话、翻成英文、起标题、挑错、扩写。
Key 只存在浏览器 localStorage 里；最近 12 次问答也存在本地，可清空。

## 上线（手机也能做完）

1. GitHub 新建一个仓库，名字随意，比如 `today-box`。
2. 把本目录里除了 `index.html.bak` 之外的文件全传上去。
   手机可以用 GitHub 网页的 **Add file → Upload files**，一次把整个文件夹拖/选进去。
3. 打开仓库 **Settings → Pages**，Source 选 `Deploy from a branch`，分支 `main`，目录 `/ (root)`，保存。
4. 等一分钟，访问 `https://你的用户名.github.io/today-box/`。
5. 打开仓库 **Actions** 页，点 `每天更新数据` → `Run workflow` 跑一次，确认能跑通。
   之后每天北京时间早上 6:10 自动跑（workflow 里写的是 UTC 22:10）。

放到 Cloudflare Pages 也行：连仓库、构建命令留空、输出目录填 `/`。

## AI 小帮手怎么用

点「设置接口」，填三样：
- 接口地址：`https://api.deepseek.com/chat/completions`（任何 OpenAI 兼容接口都行）
- 模型名：`deepseek-chat`
- Key：你自己的

然后「记在这台手机上」。注意：有的接口不允许网页直接调用（跨域），会报 CORS 错。真遇到就得加一层 Cloudflare Worker 代理，那是下一步的事。

## 换数据源

改 `scripts/fetch-daily.mjs` 里的 `fetchRepos()` 或 `fetchRates()`，返回的字段保持和 `data/daily.json` 一致就行。
抓不到的时候脚本会保留旧数据，不会把页面搞挂。

## 文件

```
index.html                  页面本体（样式和脚本都在这一个文件里）
index.html.bak              重写前的旧版本，本地备份，不要传上去
manifest.webmanifest        加到手机主屏幕用
icon.svg                    图标
sw.js                       离线缓存
data/daily.json             页面读的数据（自动更新）
scripts/fetch-daily.mjs     抓数据的脚本
.github/workflows/daily.yml 每天定时跑
```

## 本地预览

`fetch` 不能从 `file://` 读，所以起个小服务：

```bash
cd today-box
python3 -m http.server 8000
```

然后开 `http://localhost:8000`。

## 以后想加

- 多存几天的数据，做成小趋势图
- 加一个 Cloudflare Worker，解决 AI 接口的跨域问题，顺便藏 key
- 工具再加：二维码、Markdown 预览、单位换算
