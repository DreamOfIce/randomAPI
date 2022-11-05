# HoYoRandom

![GitHub commit activity](https://img.shields.io/github/commit-activity/m/dreamofice/HoYoRandom) ![GitHub Repo stars](https://img.shields.io/github/stars/dreamofice/HoYoRandom) ![GitHub forks](https://img.shields.io/github/forks/dreamofice/HoYoRandom)

一个使用 node.js 编写的随机 API:

- 丰富的选项
- API 和资源文件分离,自动更新
- 支持自部署,可以使用你自己的资源(图片、视频、一言)
- 模块化架构,易于扩展

包括原神&崩坏 3 精选图片、音乐、视频以及一言.  
喜欢的话麻烦点个`Star`ヾ(≧▽≦\*)o
欢迎[Fork](https://github.com/DreamOfIce/
HoYoRandom/fork)和[PR](https://github.com/DreamOfIce/HoYoRandom/pulls);

## 链接

> 默认的资源存储在[此处](https://github.com/DreamOfIce/HoYoRandomResources)
> 使用 PHP 编写的旧版本:[HoYoRandom-php](https://github.com/DreamOfIce/HoYoRandom-php)(不再更新)

## TODO

- [x] 一言接口
- [x] 媒体文件接口
- [ ] 自部署文档
- [ ] 开发文档
- [ ] 标签(tag)支持
- [ ] 统计系统
- [ ] `TypeScript`重写

## API 端点

我提供的公共 API,服务器位于美国,目前没有速率限制:

> 本站已启用`HSTS`,并加入`Preload List`,故仅支持 https 调用
> https://api.dreamofice.cn/hoyorandom

---

## 接口

> 以下为默认的 API 接口,你可以自行部署不同的接口

### 图片

- 路径: `/img`
- 类型: `media`
- 参数: [见此处](#Media)
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
- 参数: [见此处](#Media)
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
- 参数: [见此处](#Media)
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

## 参数

目前支持三种方式传入参数:

- `URL`参数:
  `https://api.dreamofice.cn/hoyorandom/img?c=ys&f=json`
- `URL`路径:
> 路径与参数的对应关系依次为:`/endpoint/${category}/${tag}/${format}/${encoding}/${seletor}`
  `https://api.dreamofice.cn/hoyorandom/img/ys/all/json`
- `POST`负载(支持`application/json`和`application/x-www-form-urlencoded`):
  ```json
  { "category": "ys", "format": "json"}
  ```

以下为不同类型接口的参数:

### Media

### Hitokoto

## License

MIT
