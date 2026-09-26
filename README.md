# AnimeZRules

AnimeZ 规则仓库 —— 为 [AnimeZ](https://github.com/XHXYT/AnimeZ) 编写源配置，欢迎参与构建沃

只要会看浏览器开发者工具，你就能为自己的追番网站写一个源。**不会写代码也没关系**：大部分网站只需要填几十行 JSON 就能跑起来，跟着[写源指南](https://xhxyt.github.io/AnimeZRules/docs/source-guide.html)从零开始，半小时就能提交你的第一个源。

## 可用规则

| 规则 | 类型 | 说明 | 文件 |
|------|------|------|------|
| 番茄动漫 | HTML | www.fqdm.cc，模板站经典结构 | [fqdm_data_source.json](sources/fqdm_data_source.json) |
| 饭团动漫 | HTML | www.acgfta.com | [acgfta_data_source.json](sources/acgfta_data_source.json) |
| AGE 动漫 | HTML | www.agedm.io | [age_sources_config.json](sources/age_sources_config.json) |
| 次元城动画 | JSON API | www.cycani.org，接口源示例（播放需账号登录） | [cycani_data_source.json](sources/cycani_data_source.json) |
| tvtfun | JSON + WebView | www.tvtfun.net，播放可能需手动辅助（应用内自动尝试两次后弹出） | [tvtfun_data_source.json](sources/tvtfun_data_source.json) |
| 稀饭动漫 | JSON + WebView | next.xifanacg.com（接口 api.xifanacg.com），Supabase PostgREST 接口源（选集内嵌详情接口） | [xifan_data_source.json](sources/xifan_data_source.json) |
| girigirilove | HTML + 搜索验证码 | ani.girigirilove.com，MacCMS 模板站（播放地址 base64 + URL 解码，搜索需输入图片验证码） | [girigirilove_data_source.json](sources/girigirilove_data_source.json) |

## 如何导入

1. 下载本仓库 `sources/` 目录中的任意 `*_data_source.json`（或直接使用其 raw 链接）；
2. 打开 AnimeZ → 我的 → 设置 → 视频源 → 更多菜单 → **导入数据源**；
3. 选择本地文件或粘贴链接导入，更新配置时请选择**覆盖导入**（修改配置后必须重新导入才会生效）。

## 如何编写一个源

完整字段说明、选择器语法、模板语法、写源实战教程见 **[写源指南](https://xhxyt.github.io/AnimeZRules/docs/source-guide.html)**。

两种写法任选：

- **电脑写 JSON 导入**：结构最接近的现有源文件复制一份，改 `baseUrl` 和各选择器；
- **应用内直接填写**：视频源页（我的 → 设置 → 视频源）→ 更多菜单 → 添加新数据源（或点击已有源编辑），每个输入框都有提示文案，指南的[应用内编辑器对照](https://xhxyt.github.io/AnimeZRules/docs/source-guide.html#editor)一节把每个输入框与配置字段逐一对应，纯手机也能写源。

快速印象——一个 HTML 源的核心就是"在哪找列表、每项取哪些字段"：

```json
"search": {
  "videos": {
    "urlTemplate": "/index.php/vod/search/wd/{keyword}.html",
    "listSelector": "div.module-card-item",
    "urlNeedBaseUrl": true,
    "itemSelectors": {
      "url": "a.module-card-item-poster@href",
      "imgUrl": "img@data-original",
      "title": ".module-card-item-title",
      "episode": ".module-item-note"
    }
  }
}
```

## 用 AI 写源

不想手动分析选择器？本仓库自带一个面向 AI 的写源技能 [`skills/animez-source/SKILL.md`](skills/animez-source/SKILL.md)（标准 Agent Skills 格式）。把仓库克隆到本地后：

- **Claude Code** 等支持 skills 的工具：将该文件夹复制（或软链）到 `~/.claude/skills/`（或项目的 `.claude/skills/`）；
- 其他 AI 工具：直接把 `SKILL.md` 连同它引用的 [写源指南](https://xhxyt.github.io/AnimeZRules/docs/source-guide.html) 和任一现成源文件发给 AI 即可。

之后对 AI 说"帮我给 xx 网站写一个 AnimeZ 源"，它会按照技能里的工作流（判定模式 → 站点勘察 → 起草 → 自检 → 验证）产出配置。

## 参与贡献

欢迎为任何影视/动漫网站提交新源或修复已有源，步骤：

1. Fork 本仓库；
2. 新增源请以 `你的源名_data_source.json` 命名（一行一个源，`sources` 数组），放在 `sources/` 目录；
3. 确保文件是**合法 JSON**（可用任意 JSON 校验工具检查）；
4. 在真机/模拟器上通过"导入数据源"实际验证：搜索、首页、详情、选集、播放全部可用；
5. 提交 Pull Request，说明测试通过的站点功能与设备。

约定：

- `key` 全局唯一，建议 `key_` + 拼音/英文缩写（如 `key_fqdmdm`）；
- `version` 语义化，每次修改记得递增；
- `update_time` 与实际修改日期一致；
- 站点接口若需要固定请求头，写在 `parserConfig.requestHeaders`，不要硬编码进 URL；
- 不要提交任何账号、密码、Cookie 等私人信息。

## 反馈

源失效、字段写法有疑问、想要某个站点的新源？欢迎开 Issue 讨论。

## 免责声明

本仓库所有规则仅供学习交流使用，规则本身不包含任何视频资源，一切内容均来自目标站点自身公开接口/页面。请支持正版，如有侵权请联系删除。
