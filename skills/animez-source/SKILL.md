---
name: animez-source
description: 为 AnimeZ（HarmonyOS 追番应用）编写、适配、调试视频数据源配置。当用户想"写源"、"适配某动漫网站"、"新建/修改数据源"、"把这个网站做成 AnimeZ 源"，或提供站点 URL 要求生成数据源 JSON 时使用。Use when the user wants to write, adapt, or debug an AnimeZ video source (DataSourceConfig).
---

# AnimeZ 视频源编写

## 文件定位

本技能引用的写源指南（`docs/source-guide.html`）与全部现成源示例（`sources/*_data_source.json`）都在 **AnimeZRules 仓库**中（源文件位于 `sources/` 目录）。若当前工作目录下找不到这些文件：先在用户最近打开的工程/目录中查找 AnimeZRules；仍找不到则向用户确认仓库位置，或从 GitHub 克隆 <https://github.com/XHXYT/AnimeZRules>。

## 产出物

单个 JSON 文件（UTF-8，无注释、无尾逗号），命名 `<源名>_data_source.json`，放在 AnimeZRules 仓库的 `sources/` 目录：

```json
{
  "version": "1.0.0",
  "author": "作者名",
  "update_time": "2026-09-24",
  "sources": [ { "...": "一个 DataSourceConfig 对象" } ]
}
```

应用导入也兼容单个源对象 / 源对象数组，但提交到仓库请统一用上面的完整格式。文件级 `author`/`update_time` 导入时会自动下沉到未自带该字段的源（源级优先）。

## 动手前必读（按顺序）

1. **`docs/source-guide.html`**（仓库内）— 唯一权威指南：文件结构、基础字段、HTML 选择器语法（`a@href`）、JSON 路径与 `{ }` 模板、四大功能块（search / homepage / detail / episodes / videoUrl）逐字段说明、ProcessConfig 后处理、WebView JS 解析、完整示例、调试 FAQ。**写源过程中随时回查，不要凭记忆猜字段名。**
2. **一个与目标站形态最接近的现成源**（仓库 `sources/` 目录）：

| 文件 | 形态 | 适合参考的场景 |
|---|---|---|
| `fqdm_data_source.json` | HTML + 正则抠直链 | 苹果 CMS（MacCMS）模板站，大多数站属于此类 |
| `acgfta_data_source.json` | HTML | 普通服务端渲染站点 |
| `age_sources_config.json` | HTML | 多分页 / 复杂分类的站点 |
| `cycani_data_source.json` | JSON API + 登录 | 需要登录 / token 的接口站 |
| `tvtfun_data_source.json` | JSON + 链接透传 + WebView JS | 直链必须执行页面 JS 才能拿到的站 |
| `xifan_data_source.json` | JSON + Supabase PostgREST + WebView JS | PostgREST 风格接口站（请求头鉴权、RPC 搜索、详情响应内嵌剧集子数组） |
| `girigirilove_data_source.json` | HTML + 搜索验证码 + base64/URL 解码 | MacCMS 模板站变体：搜索触发图片验证码（`search.captcha` 配置），播放地址 encrypt=2 需 `base64Decode();decodeUri()` 后处理 |

## 工作流

### 1. 判定 sourceType
- 服务端渲染网页（查看源代码能看到番剧信息）→ `"sourceType": "html"`
- 有 JSON 接口（浏览器 F12 Network / 抓包）→ `"sourceType": "json"`
- 苹果 CMS 模板站结构高度一致：fqdm 源几乎可以直接换 `baseUrl` 复用，改前先对比 class 名。

### 2. 站点勘察
- HTML：打开 搜索页 / 首页 / 详情页 / 播放页，记录列表容器、条目、各字段的 CSS 选择器与翻页参数。
- JSON：记录各接口的 URL、方法 / 请求体、响应结构（JSON 路径）、鉴权方式（是否需要 login 配置）。

### 3. 逐块起草（最小可用优先）
按 search → detail → episodes → videoUrl 顺序先打通"搜索 → 详情 → 选集 → 播放"主干；homepage（轮播 / 分类卡片）、recommends 都是可选块，主干可用后再补。

### 4. 自检（硬规则，违反必翻车）
- [ ] `key` 全局唯一（建议字母数字下划线，如 `fqdm`）；`name` 可中文；`baseUrl` 必填，带协议、带尾斜杠
- [ ] **任何写入配置的 JS（如 `iframeSelector`）严禁包含 `_|_` 子串**（引擎内部分隔符）
- [ ] WebView JS：成功 `return '直链字符串'`；失败 `return 'ERR_失败原因'`；不要抛异常、不要依赖弹窗交互
- [ ] JSON 模式的字段一律填 `{ }` 模板（如 `{title}`、`{baseUrl}/api/...`），HTML 模式的字段一律填 CSS 选择器，不要混用；`{keyword}` 自动 URL 编码、`{page}` 翻页
- [ ] 选择器取属性用 `选择器@属性`（如 `a@href`）；在列表条目内相对条目本身取属性时 selector 可为空串（`""` 配 `@href`）
- [ ] `pattern: "regex"` 的 `urlSelector`：捕获组 1 = 播放地址；注意 JSON 字符串转义（`\\`）
- [ ] 相对 URL 交给引擎补全（`urlNeedBaseUrl` 默认开），不要手工拼 `baseUrl`（模板里可用 `{baseUrl}`）
- [ ] 旧版字符串 postProcess 仅 `substringBetween('a','b')` / `replaceAll('old','new')` / `base64Decode()` / `decodeUri()` 四种（可组合，如 `base64Decode();decodeUri()`）；复杂处理用对象形态（6 种 ProcessConfig + 4 种 StringProcessConfig，见指南"字段后处理"）
- [ ] itemSelectors 除 url/imgUrl/title/episode 外支持可选字段键 `playCount` / `year` / `month` / `director` / `actors` / `tags`（挂在 VideoInfo 上，源里有什么配什么；`actors` 在应用内显示为「声优」）；htmlsoup 支持 `nth-child(n)` / `nth-of-type(n)` 伪类取同容器第 n 个元素，也支持 `:contains(文本)` 按文本筛选（行数不固定的信息行优先用它，如 `.slide-info.partition:contains(导演)`，避免缺行时错位）
- [ ] 详情的导演/声优等扩展信息统一配在 `detail.extra`（HTML=CSS 选择器 / JSON=模板，键同上，支持后处理），编辑器里收在详情页签「更多字段」开关下；旧基础字段 `directorSelector` / `protagonistSelector` 仅为兼容保留（extra 优先），新源不要再使用
- [ ] 搜索需图片验证码的站（MacCMS dsn2 模板常见）：在 `search` 下加 `captcha` 配置（detectSelector / imageUrlSelector / verifyUrlTemplate / successContains），验证码弹窗由搜索页自动弹出，前提是站点验证流程为「图片 + 提交校验 + 会话 Cookie 重放」
- [ ] 站点有"每日更新表"接口时配 `parserConfig.schedule`（可选）：`urlTemplate` 带 `{weekday}` 占位符（1=周一..7=周日），`listSelector`/`itemSelectors` 同列表卡片；配好后该源成为应用内 设置 → 周表数据源 的候选（cycani 为参考实现）
- [ ] 最终文件必须能通过 `JSON.parse`（无注释、无尾逗号、UTF-8 无 BOM）

### 5. 交付与验证
- 让用户在应用内验证：视频源页（我的 → 设置 → 视频源）→ 更多菜单 → 导入数据源（选文件；同 key 已存在时选**覆盖导入**）→ 逐项测试：搜索 → 主页各板块 → 详情 → 切换路线 / 选集 → 播放 →（有登录的源）账号登录
- 失败定位速查：列表为空 → 容器 / 字段选择器错；详情字段空 → detail 各选择器；播放失败 → videoUrl 的 pattern 与实际响应形态不符，或 WebView JS 返回了 `ERR_`
- 验证通过后向本仓库提交 PR：**只包含新增的 `*_data_source.json` 文件**（按 README「参与贡献」的约定命名、校验、验证），并在 PR 说明中写清测试通过的站点功能与设备；README 源列表、写源指南等文档由维护者维护，PR 中不要修改

## 完成后

- 若发现指南未覆盖或有出入的引擎行为，**不要自行修改本仓库的指南和文档**：通过 Issue 反馈，或直接向 [AnimeZ 引擎仓库](https://github.com/XHXYT/AnimeZ) 提交 PR（接受引擎段 PR）；文档由维护者随引擎同步更新
