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
| `ezdmw_data_source.json` | HTML + steps 多步提取 + tsStrip 代理 | 播放地址藏在多层页面后（播放页→播放器页→直链）：`videoUrl.steps` 纯 HTTP 逐页提取；分片伪装成 PNG 壳 TS 时配 `videoUrl.proxy`；多路线页签无父子关系用 `routeItemSelectors` + `routeTitleProcess` |
| `baimao_data_source.json` | HTML + 链接透传 + WebView 嗅探 + 桌面 UA | 反爬栈站点（时间戳 cookie/接口 403）：`pattern:"link"` 交给 WebView 嗅探，源级 `userAgent` 填桌面 Chrome UA；推荐只在播放页时用 `recommends.urlTemplate` 的 `{link#正则#替换}` 把详情地址改写成播放页地址 |
| `cycani_data_source.json` | JSON API + 登录（api 模式） | 需要登录 / token 的接口站（登录响应 JSON 取 token，附加 Authorization 头） |
| `tvtfun_data_source.json` | JSON + 链接透传 + WebView JS | 直链必须执行页面 JS 才能拿到的站 |
| `xifan_data_source.json` | JSON + Supabase PostgREST + WebView JS | PostgREST 风格接口站（请求头鉴权、RPC 搜索、详情响应内嵌剧集子数组） |
| `girigirilove_data_source.json` | HTML + 搜索验证码 + base64/URL 解码 | MacCMS 模板站变体：搜索触发图片验证码（`search.captcha` 配置），播放地址 encrypt=2 需 `base64Decode();decodeUri()` 后处理 |
| `mutefun_data_source.json` | HTML + 搜索验证码（JS 注入图片） | 验证码图片由站点 JS 注入、响应无 img 元素的站：用 `captcha.imageUrlTemplate` 固定地址兜底 |
| `milimili_data_source.json` | JSON + Connect-RPC + POST + 登录（cookie 模式） | 全 POST 型接口站：端点配 `method`/`body`，搜索结果只存业务 ID、详情用 `detail.urlTemplate` 拼 `{link}` 端点，`dataPath` 空串=响应根对象；相关推荐走同服务 RPC（recommends 的 `method`/`body`/`boards.0.items` 数组下标路径）；播放接口需登录会话——`login.type:"cookie"` 捕获登录 Set-Cookie，`videoUrl.urlTemplate` 指定取流端点 + `body` 值变换从选集链接提取剧集编号 |
| `sorani_data_source.json` | JSON + REST GET | 简单 REST 接口站：`code:200` 业务成功码直接可用；接口返回相对路径封面（`/uploads/...`）时列表各处显式 `urlNeedBaseUrl: true`；无独立推荐端点，recommends 用同分类列表接口（`categoryId={video.categoryId}` 注入过滤参数，结构照搬 search） |

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
- [ ] JSON 模式业务码：响应对象含 `code` 字段时，`0` 与 `200` 均视为成功，其余抛 `msg` 业务错误——站点用 `code:200` 当成功码（如 sorani）无需特殊处理
- [ ] 选择器取属性用 `选择器@属性`（如 `a@href`）；在列表条目内相对条目本身取属性时 selector 可为空串（`""` 配 `@href`）
- [ ] `pattern: "regex"` 的 `urlSelector`：捕获组 1 = 播放地址；注意 JSON 字符串转义（`\\`）
- [ ] 播放地址藏在多层页面后时用 `videoUrl.steps`（纯 HTTP 逐页提取，配置后优先于 pattern 生效，两种模式通用；每步 `pattern` selector/regex + `urlSelector` + 可选 postProcess，参考 ezdmw；步骤页获取失败自动同地址重试一次）；链路中含 POST 表单接口（如解析器 api.php）或需带特定请求头的 GET 时，用步骤 `script:` 后处理 return 请求指令 `{"__request":true,"url":"...","method":"POST","body":"...","headers":{...},"fallbackUrl":"..."}`（下一步按指令发请求；`fallbackUrl` 为主地址失败时的备用域名，指令不能作为最后一步；脚本运行在内置 JS 引擎、完整 ES 标准库，可内联 Base64/AES 等算法）；直链分片有伪装壳（PNG 壳 TS）或需特定 Referer 时叠加 `videoUrl.proxy`（`{"type":"tsStrip","referer":"..."}`，仅显式配置生效；AES-128 加密流密钥/初始化段防盗链站点直接配 `referer` 即可，`#EXT-X-KEY:`/`#EXT-X-MAP:` URI 会一并改写走代理，密文分片找不到 TS 同步头时原样透传）；同站直链与 m3u8 混出时配 `proxy.urlPattern` 正则（如 `"\\.m3u8"`，仅匹配的最终地址走代理，mp4 直链保持直连；缺省=总是包装）
- [ ] 多路线页签页（线路按钮与剧集组无父子关系）用 `routeItemSelectors[]`（每路线一个选择器，与 `routeTitlesSelector` 按序配对），标题带角标时配 `routeTitleProcess`，无效路线用 `routeExcludeKeywords` 过滤（HTML/JSON 模式均支持）
- [ ] WebView 嗅探类站点（反爬 cookie/接口 403/JS 动态算链接）配 `pattern:"link"` + `iframeSelector`，并按需配源级 `userAgent`（桌面 Chrome UA）——移动 UA 常被站点分发 APP 跳转版导致嗅探全空
- [ ] 相对 URL 交给引擎补全，不要手工拼 `baseUrl`（模板里可用 `{baseUrl}`）；注意 `urlNeedBaseUrl` 默认值分模式——HTML 列表/卡片默认开，JSON 模式卡片/轮播默认关：接口返回相对路径（如封面 `/uploads/...`）时必须显式 `true`，否则图片 URL 无效（sorani 教训）
- [ ] 旧版字符串 postProcess 仅 `substringBetween('a','b')` / `replaceAll('old','new')` / `base64Decode()` / `decodeUri()` 四种（可组合，如 `base64Decode();decodeUri()`）；复杂处理用对象形态（6 种 ProcessConfig + 4 种 StringProcessConfig，见指南"字段后处理"）
- [ ] itemSelectors 除 url/imgUrl/title/episode 外支持可选字段键 `playCount` / `year` / `month` / `director` / `actors` / `tags`（挂在 VideoInfo 上，源里有什么配什么；`actors` 在应用内显示为「声优」）；htmlsoup 支持 `nth-child(n)` / `nth-of-type(n)` 伪类取同容器第 n 个元素，也支持 `:contains(文本)` 按文本筛选（行数不固定的信息行优先用它，如 `.slide-info.partition:contains(导演)`，避免缺行时错位）
- [ ] 详情的导演/声优等扩展信息统一配在 `detail.extra`（HTML=CSS 选择器 / JSON=模板，键同上，支持后处理），编辑器里收在详情页签「更多字段」开关下；旧基础字段 `directorSelector` / `protagonistSelector` 仅为兼容保留（extra 优先），新源不要再使用
- [ ] 搜索需图片验证码的站（MacCMS dsn2 模板常见）：在 `search` 下加 `captcha` 配置（detectSelector / imageUrlSelector / verifyUrlTemplate / successContains），验证码弹窗由搜索页自动弹出，前提是站点验证流程为「图片 + 提交校验 + 会话 Cookie 重放」；图片由站点 JS 注入、响应里没有 img 元素时，用 `imageUrlTemplate` 固定地址模板兜底（配合 `imageCacheBustParam` 防缓存）
- [ ] 站点有"每日更新表"接口时配 `parserConfig.schedule`（可选）：`urlTemplate` 带 `{weekday}` 占位符（1=周一..7=周日），`listSelector`/`itemSelectors` 同列表卡片；配好后该源成为应用内 设置 → 周表数据源 的候选（cycani 为参考实现）
- [ ] 轮播图（homepage.banner，HTML 模式）：`urlTemplate` 留空=解析首页本身；站内无真轮播时可填独立列表页地址（如"剧场版"页，相对拼 baseUrl 或绝对均可）让引擎单独请求；首页已有可用区块时用组合器+`:contains` 定位（参考 mgnacg：`div.title:contains(剧场版) + div div.public-list-box`）
- [ ] 首页区块/轮播条目的 DOM 类名可能与搜索结果不同（mgnacg：搜索 `.thumb-txt` vs 首页 `.time-title`），轮播与卡片的字段选择器必须按目标区块实际 HTML 逐字段验证，不能照搬搜索配置
- [ ] 推荐区块（recommends，可选）：HTML 模式默认仅用 `listSelector`（无 containerSelector，作用域=详情页文档），区块无专属容器时用 `:contains` + 相邻组合器定位（参考 mgnacg/akianime：`div.title:contains(相关作品) + div div.public-list-box`）；推荐卡片类名常与搜索卡片不同，逐字段验证勿照搬
- [ ] 详情页无推荐区块、但站内有热门列表/热门搜索页时：HTML 模式 recommends 配 `urlTemplate` 指向该页（相对拼 baseUrl 或绝对），引擎单独请求解析（失败仅放弃推荐不影响详情）；该页与搜索结果页同构时 itemSelectors 可直接照搬 search（参考 ezdmw）；地址中固定中文关键词写 URL 编码形式，支持 `{rand:最小,最大,步长}` 随机翻页占位符（如 `page={rand:0,200,10}`，让每次进详情看到不同推荐）
- [ ] 多 tab 推荐区（按题材分 tab 展示相关内容）：多个 ul 通常仅当前 tab 带 `current` 类，用 `容器 ul.current li` 限定首个 tab（参考 dm84）
- [ ] JSON 模式 recommends 必须配 `jsonUrlTemplate`（不填恒为空）；支持 `method`/`body`（POST 型推荐接口，占位符取详情字段）；详情响应只有 ID 数组或无相关字段时，可用「同分类列表」接口注入详情分类字段充当（如 `categoryId={video.categoryId}`，结构照搬 search；先确认过滤参数真实生效——不识别的参数会被静默忽略，对比有无参数的 total）；连过滤参数都没有、详情页也无推荐区块时留空跳过
- [ ] HTML 模式详情的 `titleSelector`/`descSelector` 支持 `selector@attr` 取属性（如 `meta[name=description]@content`）与 `{ selector, postProcess }` 对象形态（编辑器中勾「后处理」）
- [ ] JSON 模式详情：搜索结果只能存业务 ID 时，配 `detail.urlTemplate`（`{link}` 占位符渲染详情端点，相对路径拼 baseUrl，可配合 POST body `"id":"{link}"`）；详情数据与剧集数组平级、无统一包裹字段时，`dataPath` 显式填空串 `""`（编辑器输入 `.`）表示响应根对象，不填默认 `data`
- [ ] 站点接口为 POST 型 JSON（如 Connect-RPC）时：对应端点加 `"method": "POST"` + `"body"` 请求体模板（占位符按端点上下文取值并做 JSON 转义：搜索 `{keyword}/{page}`、周表 `{weekday}`、详情/播放地址 `{link}`，选集/推荐用详情字段点分路径，见指南"POST 请求"一节）；POST 端点 `urlTemplate` 可为绝对地址；所需请求头（如 `Connect-Protocol-Version`）配源级 `requestHeaders`
- [ ] 播放/业务接口需要登录态时配 `login`：`type: "api"`（默认）=登录响应 JSON 按 `tokenPath` 取凭证、附加 `authHeaderName` 头（如 `Authorization: Bearer {token}`）；`type: "cookie"`=捕获登录响应 Set-Cookie 作会话凭证、`authHeaderName` 配 `"Cookie"` 回放（Connect-RPC 等只认会话 Cookie 的站点用它，milimili 为范例）；`extraBody` 支持布尔值；登录与业务错误消息兼容 `msg` 与 `message` 字段
- [ ] 选集链接与播放接口地址不同源时（`videoUrl.pattern: "json"`）：配 `videoUrl.urlTemplate` 指定取流端点（相对拼 baseUrl 或绝对，选集链接仅作 `{link}` 占位符上下文），`body` 值变换占位符 `{link#正则#替换}` 可从链接中提取参数注入请求体（如 `{link#^.*[?&]ep=(\d+).*$#$1}` 从 watch 链接提取剧集编号，参考 milimili 源）
- [ ] 站点 m3u8 播放列表确认注入贴片广告分片（adjump/alimama/promo 等路径特征）时，在源级加 `"adFilter": true`（该源参与广告拦截、跟随应用全局开关；未配置/false 则该源强制不过滤）
- [ ] 最终文件必须能通过 `JSON.parse`（无注释、无尾逗号、UTF-8 无 BOM）

### 5. 交付与验证
- 让用户在应用内验证：视频源页（我的 → 设置 → 视频源）→ 更多菜单 → 导入数据源（选文件；同 key 已存在时选**覆盖导入**）→ 逐项测试：搜索 → 主页各板块 → 详情 → 切换路线 / 选集 → 播放 →（有登录的源）账号登录
- 失败定位速查：列表为空 → 容器 / 字段选择器错；详情字段空 → detail 各选择器；播放失败 → videoUrl 的 pattern 与实际响应形态不符，或 WebView JS 返回了 `ERR_`
- 验证通过后向本仓库提交 PR：**只包含新增的 `*_data_source.json` 文件**（按 README「参与贡献」的约定命名、校验、验证），并在 PR 说明中写清测试通过的站点功能与设备；README 源列表、写源指南等文档由维护者维护，PR 中不要修改

## 完成后

- 若发现指南未覆盖或有出入的引擎行为，**不要自行修改本仓库的指南和文档**：通过 Issue 反馈，或直接向 [AnimeZ 引擎仓库](https://github.com/XHXYT/AnimeZ) 提交 PR（接受引擎段 PR）；文档由维护者随引擎同步更新
