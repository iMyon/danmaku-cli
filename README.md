# danmuku-project

bilibili 弹幕归档计划

## 命令行工具

环境依赖：[Node.js](https://nodejs.org/zh-cn/download/) 10+

### 安装

```bash
npm install -g danmuku-project
```

### 弹幕下载

下载视频弹幕，会同时下载`xml`和生成`ass`字幕文件

命令：`danmuku download [video]`

示例：

- av 前缀视频：`danmuku download av135433`
- ss 前缀视频：`danmuku download ss1535`
- ep 前缀视频：`danmuku download ep276626`

帮助文档`danmuku download -h`

```shell
$ danmuku download -h
Usage: download [options] <video>

下载视频弹幕，支持av/ss/ep形式视频。示例：danmuku download av135433

Options:
  -h, --help  output usage information
```

### 弹幕转换：danmuku convert

`xml`弹幕转换为`ass`格式弹幕

示例：

- 转换单个文件：`danmuku convert -f ./test.xml`
- 转换目录下所有文件：`danmuku convert --folder=./`，深度转换，生成同名 ass 文件

更多参数`danmuku convert -h`：

```shell
$ danmuku convert -h
Usage: convert [options]

转换xml弹幕文件为ass格式，支持文件或文件夹的批量转换

Options:
  -f, --file <string>                 需要转换的xml文件
  --folder <string>                   需要处理的文件夹（文件和文件夹二选一）
  --match <string>                    文件名匹配规则 (default: ".xml$")
  --play-res-x <number>               分辨率宽 (default: 1920)
  --play-res-y <number>               分辨率高 (default: 1080)
  --font <string>                     字体 (default: "微软雅黑")
  --bold <boolean>                    是否粗体 (default: true)
  --accurate-danmuku-width <boolean>  提升弹幕宽度精准度，滚动弹幕排版更合理，但是非常影响处理效率，建议处理少量弹幕转换时开启 (default: false)
  --font-size <number>                字体大小 (default: 40)
  --line-limit <number>               最大弹幕行数 (default: 50)
  --speed <number>                    驻留时间（s） (default: 12)
  --alpha <number>                    透明度0-255 (default: 140)
  -h, --help                          output usage information
```

### 官方番剧弹幕爬虫

爬取所有官方番剧弹幕，主要是 ss 类官方番剧

**封禁注意：大量数据爬取会触发 B 站安全策略，如无特殊需求不要使用此命令**

**默认参数是比较温柔的爬虫策略，即每分钟抓取 10 个番剧的弹幕**

命令：`danmuku download-seasons`

帮助文档`danmuku download-seasons -h`：

```shell
$ danmuku download-seasons -h
Usage: download-seasons [options]

下载全部日本地区索引番剧弹幕（ss地址番剧）

Options:
  -n, --page-size <number>    分页大小 (default: 10)
  -s, --start-page <number>   下载开始页 (default: 1)
  --stop-page <number>        下载结束页
  --sleep-time <number>       每页下载完成等待时间（ms），不建议设置太小，造成服务器压力可能被封IP (default: 60000)
  --max-concurrency <number>  弹幕文件下载最大并发数，不建议设置太大，同上 (default: 5)
  -o, --output-path <string>  输出目录 (default: "output")
  -h, --help                  output usage information
```

示例：

- `danmuku download-seasons`：默认配置开始下载
- `danmuku download-seasons -n 5 -s 100 --stop-page=200`：每页下载 5 个番剧，从 100 页开始下载到 200 页停止

### 下载已完结番剧弹幕

主要包含早期 UP 主投稿的番剧和官方完结番剧

命令：`danmuku download-finish-bangumi`

使用方法同上

帮助文档：`danmuku download-finish-bangumi -h`

```shell
$ danmuku download-finish-bangumi -h
Usage: download-finish-bangumi [options]

下载全部已完结动画弹幕

Options:
  -n, --page-size <number>    分页大小 (default: 10)
  -s, --start-page <number>   下载开始页 (default: 1)
  --stop-page <number>        下载结束页
  --sleep-time <number>       每页下载完成等待时间（ms），不建议设置太小，造成服务器压力可能被封IP (default: 60000)
  --max-concurrency <number>  弹幕文件下载最大并发数，不建议设置太大，同上 (default: 5)
  -o, --output-path <string>  输出目录 (default: "output")
  -h, --help                  output usage information

```

### 代理设置

支持 socks5 代理，声明环境变量`DANMUKU_SOCKS_PROXY`后所有网络都通过代理请求。

- bash: `DANMUKU_SOCKS_PROXY='socks5://127.0.0.1:1080'`
- powershell：`$env:DANMUKU_SOCKS_PROXY='socks5://127.0.0.1:1080'`
- windows cmd: `set DANMUKU_SOCKS_PROXY='socks5://127.0.0.1:1080'`
