# AnimeZRules
AnimeZ的规则仓库，欢迎参与构建>_<

## 源配置文件说明

**标准视频源配置**

```json
{
  "version": "字符串，配置版本号",
  "author": "作者",
  "update_time": "更新时间",
  "sources": [
    {
      // 数据源配置
      //
    }
  ]
}
```

**配置分享支持**
- 标准视频源
- 单个配置对象
- 配置对象数组

**配置基础信息说明**

**1. 基本信息字段**

| 字段名      | 类型 | 必填 | 说明               | 示例                     |
|----------|------|----|------------------|------------------------|
| key      | string | 是  | 数据源唯一标识符         | "key_xxxvideo"         |
| name     | string | 是  | 数据源显示名称          | "XXX动漫"                |
| baseUrl  | string | 是  | 网站基础URL地址        | "https://www.xxx.org/" |
| version  | string | 是  | 数据源版本            | "x.x.x"                |
| description | string | 否  | 数据源介绍            | "XXXXX"                |
| enabled  | boolean | 否  | 是否启用该数据源，默认true  | true                   |
| priority | number | 否  | 数据源优先级，数值越小优先级越高 | 1                      |

**解析器配置 (parserConfig)**

**2. 搜索功能配置 (search)**
```json
"search": {
  "videos": {
    "urlTemplate": "搜索URL模板，支持{keyword}和{page}占位符",
    "listSelector": "搜索结果列表的CSS选择器",
    "urlNeedBaseUrl": "boolean, 搜索结果URL是否需要拼接baseUrl",
    "itemSelectors": {
      "url": "单个视频链接的选择器",
      "imgUrl": "视频封面图的选择器",
      "title": "视频标题的选择器", 
      "episode": "剧集信息的选择器"
    }
  }
}
```

选择器语法说明：

"a" - 提取元素的文本内容

"a@href" - 提取元素的href属性值

"img@data-original" - 提取元素的data-original属性值

**3. 首页数据配置 (homepage)**\
3.1 横幅配置 (banner)
```json
"banner": {
  "listSelector": "横幅列表容器的选择器",
  "urlNeedBaseUrl": "boolean, 横幅项URL是否需要拼接baseUrl",
  "itemSelectors": {
    "url": "单个横幅项链接的选择器",
    "imgUrl": "横幅图片的选择器",
    "title": "横幅标题的选择器",
    "episode": "剧集信息的选择器"
  }
}
```
3.2 分类配置 (category)
```json
"category": {
  "title": "分类标题文本的选择器",
  "titles": "所有分类标题容器的选择器", 
  "moreUrl": "「更多」链接的选择器",
  "moreUrlNeedBaseUrl": "boolean, 更多链接是否需要拼接baseUrl",
  "videoLists": "视频列表容器的选择器",
  "videos": {
    "listSelector": "单个分类中视频列表的选择器",
    "urlNeedBaseUrl": "boolean, 视频URL是否需要拼接baseUrl",
    "itemSelectors": {
      "url": "视频链接的选择器",
      "imgUrl": "视频封面的选择器",
      "title": "视频标题的选择器",
      "episode": "剧集信息的选择器"
    }
  }
}
```
**4. 详情页面配置 (detail)**\
 4.1 基本信息
```json
"detail": {
  "titleSelector": "视频标题的选择器",
  "descSelector": "视频描述的选择器",
  "coverSelector": "封面图片的选择器",
  "categorySelector": "分类信息的选择器（可选）",
  "directorSelector": "导演信息的选择器（可选）",
  "updateTimeSelector": "更新时间的选择器（可选）",
  "protagonistSelector": "主演信息的选择器（可选）"
}
```
 4.2 剧集列表 (episodes)
```json
"episodes": {
  "containerSelector": "剧集列表容器的选择器（单路线）",
  "routeTitlesSelector": "多路线标题的选择器（多路线）",
  "routeContainersSelector": "多路线容器的选择器（多路线）",
  "itemSelector": "单个剧集项的选择器",
  "itemSelectors": {
    "url": "剧集链接的选择器",
    "title": "剧集标题的选择器"
  }
}
```
单路线 vs 多路线：

单路线：使用 containerSelector + itemSelector

多路线：使用 routeTitlesSelector + routeContainersSelector + itemSelector

4.3 推荐视频 (recommends)
```json
"recommends": {
  "listSelector": "推荐列表容器的选择器",
  "urlNeedBaseUrl": "boolean, 推荐项URL是否需要拼接baseUrl",
  "itemSelectors": {
    "url": "推荐视频链接的选择器",
    "imgUrl": "推荐视频封面的选择器",
    "title": "推荐视频标题的选择器",
    "episode": "剧集信息的选择器"
  }
}
```
**5. 视频URL解析配置 (videoUrl)**
```json
"videoUrl": {
  "urlSelector": "包含视频URL的元素选择器",
  "attribute": "包含URL的属性名称",
  "urlExtractor": "提取方式：'regex'或'javascript'",
  "pattern": "正则表达式模式（当urlExtractor为'regex'时使用）",
  "postProcess": "后处理操作字符串"
}
```

postProcess 支持的操作：

"substringBetween('start','end')" - 提取start和end之间的字符串

"replaceAll('old','new')" - 替换字符串

示例：

```json
{
  "urlSelector": "a#play_1",
  "attribute": "onclick", 
  "postProcess": "substringBetween('','$')"
}
```
**配置示例说明**

搜索配置示例
```json
"search": {
  "videos": {
    "urlTemplate": "/search/{keyword}/?page={page}",
    "listSelector": "div.row > div > div",
    "urlNeedBaseUrl": false,
    "itemSelectors": {
      "url": "a@href",
      "imgUrl": "img@data-original",
      "title": "img@alt",
      "episode": "div > div.video_cover > div > span"
    }
  }
}
```
搜索URL：baseUrl + "/search/关键字/?page=1"

在每个 div.row > div > div 元素中提取视频信息

链接从 a 标签的href属性提取

图片从 img 标签的data-original属性提取（非标准src属性）

**最佳实践**

1. 选择器编写

优先使用具有唯一性的class或id

避免使用可能变化的位置选择器（如:nth-child(3)）

使用浏览器开发者工具检查元素结构

2. 属性提取

标准属性："img@src"

自定义属性："img@data-original"

文本内容：直接使用标签选择器

3. URL处理

完整URL：urlNeedBaseUrl: false

相对路径：urlNeedBaseUrl: true