# RandomAPI

![GitHub commit activity](https://img.shields.io/github/commit-activity/m/dreamofice/randomapi) ![GitHub Repo stars](https://img.shields.io/github/stars/dreamofice/randomAPI) ![GitHub forks](https://img.shields.io/github/forks/dreamofice/randomapi)

一个使用 node.js 编写的随机 API:

- 开箱即用,同时拥有丰富的选项
- 独立资源存储库,从 Github 自动拉取更新
- 支持自部署,轻松自定义你自己的资源(图片、视频、一言)
- 模块化架构,易于扩展

默认的资源(`HoYoRandom`)包括原神&崩坏 3 精选图片、音乐、视频以及一言.  
喜欢的话麻烦点个`Star`吧ヾ(≧▽≦\\\*)o
欢迎贡献!

## Links

> DEMO: [点击进入](https://api.dreamofice.cn/hoyorandom)
> 默认资源`HoYoRandom` [DreamOfIce/HoYoRandomResources](https://github.com/DreamOfIce/HoYoRandomResources)  
> 详细文档位于 [DreamOfIce/randomAPI-docs](https://github.com/DreamOfIce/randomAPI-docs)  
> 使用 PHP 编写的旧版本 [HoYoRandom-php](https://github.com/DreamOfIce/HoYoRandom-php)(_不再更新_)

## TODO

- [x] 一言接口
- [x] 媒体文件接口
- [x] 自部署文档
- [ ] 开发文档
- [ ] 标签(tag)支持
- [ ] 统计系统
- [ ] `TypeScript`重写(v2.x)

## 资源存储库

- 默认的配置使用[HoYoRandomResources](https://github.com/DreamOfIce/HoYoRandomResources), 包含了原神&崩坏 3 的图片、音乐、视频和一言
- 通过修改`config.json`,可以使用自己的资源存储库,详见[文档-部署](https://docs.dreamofice.cn/hoyorandom/deploy/config)
- 关于资源存储库的格式,请参考[文档-自定义资源](https://docs.dreamofice.cn/hoyorandom/resource)

## 参数

目前支持三种方式传入参数:

> 优先级为从上到下递减

- `URL`参数,如:
  `https://api.dreamofice.cn/hoyorandom/img?c=ys&f=json`
- `URL`路径:
  > 路径与参数的对应关系依次为:`/endpoint/${category}/${tag}/${format}/${encoding}/${seletor}`
  > 如: `https://api.dreamofice.cn/hoyorandom/img/ys/all/json`
- `POST`负载(支持`application/json`和`application/x-www-form-urlencoded`):

  ```json
  { "category": "ys", "format": "json" }
  ```

### Media 类型

|  参数名  | 简写 | 默认值  |                                       合法值                                       |              描述              |                       备注                       |
| :------: | :--: | :-----: | :--------------------------------------------------------------------------------: | :----------------------------: | :----------------------------------------------: |
| category |  c   |  `all`  |                          `all`或有效的类型或其组成的数组                           |     资源类型,`all`代指所有     |                                                  |
|   tag    |  t   |  `all`  |                          `all`或有效的标签或其组成的数组                           |  资源的标签(tag)(**开发中**)   |    输入多个值时随机返回符合任意一个条件的资源    |
|  format  |  f   |  `raw`  |                                    `raw`,`json`                                    |           返回的格式           | 具体示例参见[返回格式-Media](#Media) |
| encoding |  e   | `utf-8` | 任意[支持的字符编码](https://github.com/ashtuchkin/iconv-lite#supported-encodings) | `format=json`时,返回文本的编码 |                                                  |

### Hitokoto 类型

|  参数名  | 简写 |   默认值    |                                                 合法值                                                 |          描述          |                       备注                       |
| :------: | :--: | :---------: | :----------------------------------------------------------------------------------------------------: | :--------------------: | :----------------------------------------------: |
| category |  c   |    `all`    |                                    `all`或有效的类型或其组成的数组                                     | 资源类型,`all`代指所有 |                                                  |
|   tag    |  t   |    `all`    |                              `all`或有效的标签或其组成的数组 (**开发中**)                              |    一言的标签(tag)     |    输入多个值时随机返回符合任意一个条件的资源    |
|  format  |  f   |   `json`    |                                           `js`,`json`,`text`                                           |       返回的格式       | 具体示例参见[返回格式-Hitokoto](#Hitokoto) |
| encoding |  e   |   `utf-8`   |           任意[支持的字符编码](https://github.com/ashtuchkin/iconv-lite#supported-encodings)           |     返回文本的编码     |                                                  |
| seletor  |  s   | `#hitokoto` | `format=js`时,要插入一言的元素的[CSS 选择器](https://developer.mozilla.org/docs/Web/CSS/CSS_Selectors) |                        |

---

## 返回格式

# Media

- `raw` 直接 302 重定向到对应的资源:
  ![raw格式](https://api.dreamofice.cn/hoyorandom/img)
- `json`返回一个 JSON:
  ```json
  {
    "category": "ys",
    "name": "韶光抚月，天下人间",
    "url": "https://cf.dreamofice.cn/p/HoYoRandom/img/ys/%E9%9F%B6%E5%85%89%E6%8A%9A%E6%9C%88%EF%BC%8C%E5%A4%A9%E4%B8%8B%E4%BA%BA%E9%97%B4.webp"
  }
  ```

# Hitokoto

- `text`直接返回文本
  ```text
  烟花易逝,人情长存
  ```
- `json` 返回一个 JSON:
  ```json
  {
    "hitokoto": "愿风神忽悠你",
    "category": "ys"
  }
  ```
- js

```javascript
document.querySeletor('#hitokoto').innerText('你不明白「牺牲是无法避免的」意味着什么,真正可怕的,并不是这个世界夺走了多少人的性命,而是它让多少人对失去生命这件事,习以为常');
```

## HoYoRandom

### API 端点

我提供的公共 `HoYoRandom` API,目前没有速率限制:

> 此域名已启用`HSTS`,并加入`HSTS Preload List`,故仅支持 https 调用
> https://api.dreamofice.cn/hoyorandom/

### 文档
> 敬请期待

## 常见问题(FAQ)

1. 分类(category)和标签(tag)有什么区别?
   > `category`是从某一个方面对所有资源进行归类(例如所属的游戏),而`tag`是一个资源包含的种种特征(例如:是风景画或人物画?是否包含某个角色?是官方还是同人?...).换言之,一个对象只能属于一个分类,但可以拥有多个标签.
2. 你说的这么好,那标签功能什么时候实装?
   > 在做了,在做了 o((>ω< ))o

## License

MIT
