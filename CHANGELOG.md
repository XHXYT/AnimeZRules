# Changelog

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

