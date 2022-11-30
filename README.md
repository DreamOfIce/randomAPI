# randomAPI

![GitHub commit activity](https://img.shields.io/github/commit-activity/m/dreamofice/randomAPI) ![GitHub Repo stars](https://img.shields.io/github/stars/dreamofice/randomAPI) ![GitHub forks](https://img.shields.io/github/forks/dreamofice/randomAPI)

一个使用 node.js 编写的随机 API:

- 丰富的选项
- API 和资源文件分离,自动更新
- 支持自部署,可以使用你自己的资源(图片、视频、一言)
- 模块化架构,易于扩展

包括原神&崩坏 3 精选图片、音乐、视频以及一言.  
喜欢的话麻烦点个`Star`吧ヾ(≧▽≦\\\*)o
欢迎贡献!

## 链接

> 默认的资源存储在[DreamOfIce/HoYoRandomResources](https://github.com/DreamOfIce/HoYoRandomResources)  
> 详细文档位于[DreamOfIce/randomAPI-docs](https://github.com/DreamOfIce/HoYoRandom-docs)  
> 使用 PHP 编写的旧版本:[HoYoRandom-php](https://github.com/DreamOfIce/HoYoRandom-php)(不再更新)  

## TODO

- [x] 一言接口
- [x] 媒体文件接口
- [x] 自部署文档
- [ ] 开发文档
- [ ] 标签(tag)支持
- [ ] 统计系统
- [ ] `TypeScript`重写(v2.x)

## API 端点

我提供的公共 API,服务器位于美国,目前没有速率限制:

> 本站已启用`HSTS`,并加入`Preload List`,故仅支持 https 调用
> https://api.dreamofice.cn/hoyorandom/

---

## 接口

支持的参数列表请见[参数](#参数)一节

> 以下为默认的 API 接口,你可以自行部署不同的接口

### 图片

- 路径: `/img`
- 类型: `media`
- 资源: [HoYoRandomResources/img](https://github.com/DreamOfIce/HoYoRandomResources/tree/master/img)

返回示例:

- Raw
  ![试着刷新页面,这是随机的哦](https://api.dreamofice.cn/hoyorandom/img)
- JSON
  ```json
  {
    "category": "ys",
    "name": "韶光抚月，天下人间",
    "url": "https://cf.dreamofice.cn/p/HoYoRandom/img/ys/%E9%9F%B6%E5%85%89%E6%8A%9A%E6%9C%88%EF%BC%8C%E5%A4%A9%E4%B8%8B%E4%BA%BA%E9%97%B4.webp"
  }
  ```

### 音乐

- 路径: `/music`
- 类型: `media`
- 资源: [HoYoRandomResources/music](https://github.com/DreamOfIce/HoYoRandomResources/tree/master/music)

返回示例:

- Raw
  <audio controls src='https://api.dreamofice.cn/hoyorandom/music' >当前环境似乎不支持播放呢(っ °Д °;)っ</audio>
- JSON
  ```json
  {
    "category": "ys",
    "name": "HOYO-MiX - Ruu's Melody 阿瑠的歌",
    "url": "https://cf.dreamofice.cn/p/hoyorandom/music/ys/HOYO-MiX%20-%20Ruu's%20Melody%20%E9%98%BF%E7%91%A0%E7%9A%84%E6%AD%8C.mp3"
  }
  ```

### 视频

- 路径: `/video`
- 类型: `media`
- 资源: [HoYoRandomResources/video](https://github.com/DreamOfIce/HoYoRandomResources/tree/master/video)

返回示例:

- Raw
  <video controls src="https://api.dreamofice.cn/hoyorandom/video"></video>
- JSON
  ```json
  {
    "category": "ys",
    "name": "295850674-1-208",
    "url": "https://cf.dreamofice.cn/p/hoyorandom/video/ys/295850674-1-208.mp4"
  }
  ```

### 一言

- 路径: `/hitokoto`
- 类型: `hitokoto`
- 资源: [HoYoRandomResources/hitokoto](https://github.com/DreamOfIce/HoYoRandomResources/tree/master/hitokoto)

返回示例:

- text
  ```text
  烟花易逝,人情长存
  ```
- JSON
  ```json
  {
    "hitokoto": "愿风神忽悠你",
    "category": "ys"
  }
  ```
- js

```javascript
document
  .querySeletor('#hitokoto')
  .innerText(
    '你不明白「牺牲是无法避免的」意味着什么,真正可怕的,并不是这个世界夺走了多少人的性命,而是它让多少人对失去生命这件事,习以为常',
  );
```

## 参数

目前支持三种方式传入参数:

> 优先级为从上到下递减

- `URL`参数:
  `https://api.dreamofice.cn/hoyorandom/img?c=ys&f=json`
- `URL`路径:
  > 路径与参数的对应关系依次为:`/endpoint/${category}/${tag}/${format}/${encoding}/${seletor}` > `https://api.dreamofice.cn/hoyorandom/img/ys/all/json`
- `POST`负载(支持`application/json`和`application/x-www-form-urlencoded`):
  ```json
  { "category": "ys", "format": "json" }
  ```

### Media

|  参数名  | 简写 | 默认值  |                                       合法值                                       |              描述              |                       备注                       |
| :------: | :--: | :-----: | :--------------------------------------------------------------------------------: | :----------------------------: | :----------------------------------------------: |
| category |  c   |  `all`  |                   `all` & 有效的类型值(`ys`,`bh3`)或其组成的数组                   |     资源类型,`all`代指所有     |                                                  |
|   tag    |  t   |  `all`  |                          `all` & 有效的标签或其组成的数组                          |  资源的标签(tag)(**开发中**)   |    输入多个值时随机返回符合任意一个条件的资源    |
|  format  |  f   |  `raw`  |                                    `raw`,`json`                                    |           返回的格式           | 具体示例参见[接口-图片](#图片)一节的返回示例部分 |
| encoding |  e   | `utf-8` | 任意[支持的字符编码](https://github.com/ashtuchkin/iconv-lite#supported-encodings) | `format=json`时,返回文本的编码 |                                                  |

### Hitokoto

|  参数名  | 简写 |   默认值    |                                                 合法值                                                 |          描述          |                       备注                       |
| :------: | :--: | :---------: | :----------------------------------------------------------------------------------------------------: | :--------------------: | :----------------------------------------------: |
| category |  c   |    `all`    |                           `all`或有效的类型字符串(`ys`,`bh3`)或其组成的数组                            | 资源类型,`all`代指所有 |                                                  |
|   tag    |  t   |    `all`    |                              `all`或有效的标签或其组成的数组 (**开发中**)                              |    一言的标签(tag)     |    输入多个值时随机返回符合任意一个条件的资源    |
|  format  |  f   |   `json`    |                                           `js`,`json`,`text`                                           |       返回的格式       | 具体示例参见[接口-一言](#一言)的返回示例部分部分 |
| encoding |  e   |   `utf-8`   |           任意[支持的字符编码](https://github.com/ashtuchkin/iconv-lite#supported-encodings)           |     返回文本的编码     |                                                  |
| seletor  |  s   | `#hitokoto` | `format=js`时,要插入一言的元素的[CSS 选择器](https://developer.mozilla.org/docs/Web/CSS/CSS_Selectors) |                        |

## 常见问题(FAQ)

1. 分类(category)和标签(tag)有什么区别?
   > `category`是从某一个方面对所有资源进行归类(例如所属的游戏),而`tag`是一个资源包含的种种特征(例如:是风景画或人物画?是否包含某个角色?是官方还是同人?...).换言之,一个对象只能属于一个分类,但可以拥有多个标签.
2. 你说的这么好,那标签功能什么时候实装?
   > 在做了,在做了 o((>ω< ))o

## License

MIT
