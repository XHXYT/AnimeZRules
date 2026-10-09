# Changelog

## 2026-10-10

- 写源指南（source-guide.html）：proxy 章节同步 KEY/MAP 改写说明；技能文档（SKILL.md）自检清单同步
- 写源指南（source-guide.html）：登录配置一节重写（api/cookie 双类型 + 虚构站 cookie 示例 + 错误消息字段兼容）、POST 请求 body 值变换说明、videoUrl json 模式 urlTemplate 进阶示例、编辑器映射表同步
- 技能文档（animez-source SKILL.md）自检清单同步上述能力

## 2026-10-07

- 写源指南（source-guide.html）：steps 章节新增「请求指令」（`{"__request":true,...}` 各键含义 + 可复制的脚本示例）与每步自动重试说明；proxy 章节新增 `urlPattern` 条件代理；编辑器映射表同步（步骤后处理指令提示、本地代理「代理URL过滤」输入框）
- 技能文档（SKILL.md）自检清单同步上述能力
- README 源表格改为脚本自动生成（新增 `scripts/update-readme.js`），类型标签新增 `+ steps`

## 2026-10-06

- 写源指南与技能文档同步 recommends 实战经验（JSON 模式必须 `jsonUrlTemplate`、过滤参数需验证生效、推荐卡片类名勿照搬搜索配置、独立推荐页模式、`{rand}` 随机翻页）

## 2026-10-04

- 引擎（HTML 模式）支持 `homepage.banner.urlTemplate` 指定独立轮播页：留空=解析首页本身（旧行为），填地址=单独请求该页解析；无真轮播的站点可用其它数据充当
- JSON 模式业务码判定放宽：响应 `code` 为 `0` 或 `200` 均视为成功，其余抛 `msg` 业务错误（适配 `code:200` 约定的接口站）
- 编辑器轮播「基础URL拼接模板」提示文案同步新语义；写源指南与技能文档同步更新

## 2026-10-03

- 引擎支持 POST 型 JSON 接口，编辑器映射表已同步
- 新增源级 `adFilter` 可选字段：`true`=该源参与 m3u8 广告拦截（跟随应用全局开关，全局开才过滤），未配置/`false`=该源强制不过滤；源编辑页工具栏提供勾选
- 广告分片路径特征扩充：adjump/redtraffic/alimama/chenggao/laomaotao 及分隔符包围的 ad/advert/promo/sponsor 路径段（取自 MoviePilot lunatvsource 默认规则）

## 2026-09-30

- 播放地址旧版字符串后处理新增 `jsonDecode()`：按 JSON 字符串解码 `\/` 与 `\uXXXX` 转义
- 新增周表（schedule）能力：`parserConfig.schedule` 可选节点，`{weekday}` 占位符（1=周一..7=周日），结构同列表卡片
- 周表支持"首页多区块"形态（仅 HTML）：`weekdayBlocksSelector` + `weekdayTitleSelector` 按区块标题文本（星期X/周X/日语曜日/英文星期）定位当天区块，适配"一周各天分区在同一页面"的站点（区块顺序轮转无关）

## 2026-09-29

- 详情扩展字段 `actors` 在应用内更名为「声优」（键名不变，与旧"角色声优"合并为一个字段）
- 详情的导演/声优统一走 `extra`，旧基础字段 `directorSelector` / `protagonistSelector` 仅保留兼容（extra 优先）
- cycani / tvtfun / xifan 源迁移：`directorSelector` / `protagonistSelector` 改为 `extra.director` / `extra.actors`
- 写源指南与技能文档同步更新（详情字段示例、编辑器映射表、扩展字段表）

## 2026-09-26

- 源配置统一移入 `sources/` 目录
- 新增 fqdm / acgfta / cycani / tvtfun / xifan / girigirilove 几个不同形态的示例源
- 新增 docs/source-guide.html 写源指南（含编辑器映射表、验证码与扩展字段说明）
- 新增 skills/animez-source 技能文档（写源自检清单）
- README 新增（可用规则表、导入与贡献流程）

