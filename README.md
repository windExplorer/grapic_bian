# grapic_bian (基于nodejs的彼岸桌面壁纸下载)

## 历史版本
### 1.3
- 更新于 2019/9/14

### 1.2 
- 更新于 2019/3/21

### 1.1
- 更新于 2019/3/21

## 使用须知
1. 将最新的版本文件重命名为base.js 或其他，最好拷贝到一个新的空目录
1. 安装node环境
2. cmd进入该文件的目录
3. 安装组件
  - 方法一：
```
    执行命令 npm install
```
  - 方法二(若方法一不成功)：
```
    运行 install.cmd
```
  - 方法三(若方法二不成功)：
```
    1. 安装request  执行命令 npm install request --save-dev
    2. 安装cheerio   执行命令 npm install cheerio --save-dev
    3. 安装iconv-lite  执行命令 npm install iconv-lite --save-dev
    4. 安装bagpipe 执行命令 npm install bagpipe --save-dev
```

4. 修改该文件的默认配置项目
5. 执行命令 node base.js
6. 若是发现图片不完整或有损毁，可以配置后运行另外一个文件 <b>repair.js</b>
7. 更新模块指令 ncu -u
8. (bug)目前有三个bug：
    - 爬取进程统计偶尔会不准确 
    - *大批量*爬取完毕后，程序不会自动退出,务必手动ctrl + c 退出  
    - 问题较大，偶尔会出现假死(卡死)现象，这时候就ctrl + c重试吧


## 更新日志

### V1.3
1. 修复了request请求超时的大bug
2. 修复了有时候会出现res.statusCode出错的问题
3. 程序还需要继续测试
4. 下个版本将尝试打包成exe文件可以直接运行

### V1.2
1. 优化控制台输出
2. 修复bug若干
3. 优化计数
4. 添加一项配置，请求连接多加一种方式  /s/category/

### V1.1
1. 将axios请求替换为request请求
2. 使用iconv-lite转码非utf-8页面编码
3. 简化抓取
   - (原先有3层，1.先获取列表，2.获取列表中图片的真实地址，3.真实地址后面加入固定分辨率再获取图片真实链接) 
   - (现2层，1.获取列表，2.获取图片的真实链接)
4. 修复bug(原先固定图片尺寸，有限制)
5. 使用bagpipe防止阻塞(大批量图片下载十分容易阻塞)

