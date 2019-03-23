/**
 * @title "彼岸桌面" 壁纸抓取
 * @version 1.1
 * @link http://www.netbian.com
 * @author windOnCloud
 * @email 1479221500@qq.com
 * @time 2019/03/20 22:22
 * @endTime 2019/03/21 06:40
 * 
 * 使用须知
 * 1.将文件重命名为base.js 或其他，最好拷贝到一个新的空目录
 * 2.安装node环境
 * 3.cmd进入该文件的目录
 * 4.安装request  执行命令 npm install request --save-dev
 * 5.安装cheerio   执行命令 npm install cheerio --save-dev
 * 6.安装iconv-lite  执行命令 npm install iconv-lite --save-dev
 * 7.安装bagpipe 执行命令 npm install bagpipe --save-dev
 * 8.修改该文件的默认配置项目
 * 9.执行命令 node base.js
 * 10.(bug)目前有三个bug：1.爬取进程统计偶尔会不准确 2.*大批量*爬取完毕后，程序不会自动退出,务必手动ctrl + c 退出  3.问题较大，偶尔会出现假死(卡死)现象，这时候就ctrl + c重试吧
 * 11.若是发现图片不完整或有损毁，可以配置后运行另外一个文件 repair.js
 * 
 * 更新日志
 * 1.优化控制台输出
 * 2.修复bug若干
 * 3.优化计数
 * 4.添加一项配置，请求连接多加一种方式  /s/category/
 */

const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')
const iconv = require('iconv-lite')
const Bagpipe = require('bagpipe')

//默认配置项
let config = {
  domain: 'http://www.netbian.com/',  //主机域名，不修改
  prefix_category: false, //前置分类,是否含有前置分类，对于计数有帮助
  category: 'qiche/',  //分类，可酌情修改  fengjing  dongman  dongwu  huahui  weimei  youxi  meinv  s/guidao (计数会有问题,请把prefix_category打开) 
  size: '1920x1080', //一般不可修改[修改也不起作用]
  hostdir: "./imgs/", //保存图片目录，一般不修改
  startPage: 0,  //开始页面，一般不修改
  endPage: 0,  //结束页码，酌情修改，若为0则自动设置为总页码最后一页
  errTimeEnd: 10, //重试次数，酌情修改
  waitTime: 5000, //每页间隔时间(ms)
  standradSize: 100, //(byte)标准文件大小，高于此大小为正常文件，否则将自动重新下载
  showConsole: false, //[true 为完整控制台显示抓取信息，false 为精简控制台输出]
  user_agent_list: [
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/22.0.1207.1 Safari/537.1",
    "Mozilla/5.0 (X11; CrOS i686 2268.111.0) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.1132.57 Safari/536.11",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.6 (KHTML, like Gecko) Chrome/20.0.1092.0 Safari/536.6",
    "Mozilla/5.0 (Windows NT 6.2) AppleWebKit/536.6 (KHTML, like Gecko) Chrome/20.0.1090.0 Safari/536.6",
    "Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/19.77.34.5 Safari/537.1",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/536.5 (KHTML, like Gecko) Chrome/19.0.1084.9 Safari/536.5",
    "Mozilla/5.0 (Windows NT 6.0) AppleWebKit/536.5 (KHTML, like Gecko) Chrome/19.0.1084.36 Safari/536.5",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1063.0 Safari/536.3",
    "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1063.0 Safari/536.3",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_0) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1063.0 Safari/536.3",
    "Mozilla/5.0 (Windows NT 6.2) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1062.0 Safari/536.3",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1062.0 Safari/536.3",
    "Mozilla/5.0 (Windows NT 6.2) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1061.1 Safari/536.3",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1061.1 Safari/536.3",
    "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1061.1 Safari/536.3",
    "Mozilla/5.0 (Windows NT 6.2) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1061.0 Safari/536.3",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.24 (KHTML, like Gecko) Chrome/19.0.1055.1 Safari/535.24",
    "Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/535.24 (KHTML, like Gecko) Chrome/19.0.1055.1 Safari/535.24",
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3724.8 Safari/537.36',
   ], //请求头用户信息，可以添加更多，避免被网站屏蔽
}

let req_config = {
  url: config.domain + config.category, //初始请求域名，不修改
  header: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'Host': 'www.netbian.com',
    'User-Agent': config.user_agent_list[Math.floor(Math.random() * config.user_agent_list.length)],
    'Connection': 'keep-alive',
    //'Content-Type': 'application/json;charset=UTF-8',
    //'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'zh-CN,zh;q=0.9'
  }, //请求头
}

//标志
let flag = {
  successList: [], //成功列表 
  errorPage: [], //失败页面
  planLength: 0, //计划数量 
}

let bagpipe = new Bagpipe(10)
/* 一系列方法 */

let Count = (len) => {
  if(config.prefix_category){
    flag.planLength += len
  }else{
    if(len > 3)
      flag.planLength += (len - 1)
    else
      flag.planLength += len
  }
}

let SimpleConsole = (info) => {
  if(config.showConsole)
    console.log(info)
}

let showProgress = () => {
  console.log('[完成信息] 爬取进程：' + flag.successList.length + '/' + flag.planLength)
}

let downloadImage = (src, dest, id, callback) => {
  request.head(src, (err, res, body) => {
    // console.log('content-type:', res.headers['content-type']);
    // console.log('content-length:', res.headers['content-length']);
    if (src) {
      request(src).pipe(fs.createWriteStream(dest)).on('close', () => {
          callback(null, id)
      })
    }
  })
}


let mkdirSync = (dirname) => {
  if (fs.existsSync(dirname)) {
      return true;
  } else {
      if (mkdirSync(path.dirname(dirname))) {   
          fs.mkdirSync(dirname);
          return true;
      }
  }
  return false
}

let downloadUrl = (req_url, id) => {
  SimpleConsole('[下载信息](开始下载)，id为：' + id)
  let tru_name = req_url.substr(req_url.lastIndexOf('/') + 1)
  let name = id + req_url.substr(req_url.lastIndexOf('.'))
  let dir = config.hostdir + config.category
  let file = dir + name
  SimpleConsole('[下载信息](文件相对路径) ' + file)
  if(mkdirSync(dir)) {
    fs.exists(file, (exists) => {
      if(!exists) {
        bagpipe.push(downloadImage, req_url, file, id, (err, data) => {
          SimpleConsole('[下载信息](下载完成) 文件id为：' + data)
          flag.successList.push(id)
            showProgress()
        })
        //request(req_url).pipe(fs.createWriteStream(file)) 
      } else {
        SimpleConsole('[下载信息](文件已存在，若想修复文件请运行 repair.js) 文件id为：' + id)
        flag.successList.push(id)
        showProgress()
        /* fs.stat(file, (err, stats) => {
          if(stats.size <= config.standradSize){
            console.log('[下载信息](文件大小不足) 重新下载，文件id为：' + id)
            request(req_url).pipe(fs.createWriteStream(file))
            //console.log('[下载信息](文件修复完成) 文件id为：' + id + '\n')
          }else{
            console.log('[下载信息](文件正常,退出下载) 文件id为：' + id)
            return
          }
        }) */
      }
    })
  }
}

let reTry = (req_url, page, id, errTime) => {
    get_Data(req_url, 2, page, id, errTime + 1)
}

let check_had = (id) => {
  return flag.successList.includes(id)
}

let req_List = ($, list, page) => {
  if(page == 1)
    console.log('\n\n[页面](开始进行) *第' + page + '页*,链接: ' + req_config.url)
  else
    console.log('\n\n[页面](开始进行) *第' + page + '页*,链接: ' + req_config.url + 'index_' + page + '.htm')
  
  list.map((item) => {
    let link = $(item).find('a').attr('href')
    if(link.indexOf('htm') > -1){
      let id = link.split('/desk/')[1].split('.')[0]
      let id_link = config.domain + 'desk/' + id + '.htm'
      get_Data(id_link, 2, page, id)
    }
  })

  if(page < config.endPage){
    page ++
    setTimeout(() => {
      get_Data(req_config.url + 'index_' + page+ '.htm', 1, page)
    }, config.waitTime)
  } else {
    return
    //console.log('\n[结束信息](**程序运行结束,感谢使用**)\n')
  }
}


/**
 * 
 * @param {*} req_url 请求url
 * @param {*} page  当前页面
 * @param {*} id  图片id
 * @param {*} type  0.首页   1.2-totalPage  2.获取图片真实url并下载图片
 * @param {*} errTime 错误次数
 */
const get_Data = (req_url, type = 0, page = 0, id = 0, errTime = 0) => {
  if(page === 0)
    page ++
  request({
      url: req_url,
      method: "GET",
      headers: config.header,
      encoding: null //关键代码
  }, (err, res, body) => {
      if (!err && res.statusCode == 200) {
        let html = iconv.decode(body, 'gb2312')
        let $ = cheerio.load(html, {decodeEntities: false})
        switch(type) {
          case 0:
            //首页[获取并判断]
            let totalPage = $('.page a:nth-last-child(2)').text()
            console.log('[开始信息](**总页码**) ' + totalPage)
            if(config.startPage > totalPage){
              console.log('[错误](初始页面不得多于总页码) 程序退出！')
              return
            }
            if(config.endPage > totalPage){
              console.log('[警告](设定终止页码多于总页码) 将终止页码设置为总页码')
              config.endPage = totalPage
            }
            if(config.endPage == 0){
              console.log('[警告](设定终止页码为0) 将终止页码设置为总页码')
              config.endPage = totalPage
            }
            if(config.startPage == 0){
              if($('div.list ul').length == 0)
                return
              let list = $('div.list ul')[0].children
              Count(list.length)
              req_List($, list, page)
            } else {
              console.log('[信息](初始页面不为0) 将从指定页面开始')
              get_Data(req_config.url + 'index_' + config.startPage + '.htm', 1, config.startPage)
            } 
            break
          case 1: 
            if($('div.list ul').length == 0)
              return
            let list = $('div.list ul')[0].children
            Count(list.length)
            req_List($, list, page)
            break
          case 2: 
            if(check_had(id)){
              SimpleConsole('[信息](已爬取成功) 退出爬取，文件id为：' + id )
              return
            } else {
              let src = $('.pic img').attr('src')
              if(!src) {
                SimpleConsole('[错误](无法获取图片真实链接) id为：' + id + ',链接为：' + src)
                flag.planLength --
              } else {
                SimpleConsole('[信息](获取到图片真实链接) id为：' + id + ',链接为：' + src)
                downloadUrl(src, id)
              }
              
            }
            break
          default: 
            SimpleConsole('[error](类型错误) 程序退出！')
            break
        }
      } else if(res.statusCode == 503 && type == 2 && errTime < config.errTimeEnd){
        SimpleConsole('[重试信息](请求资源失败，状态码 503) 进行第' + errTime+1 +'次重试,id为 ' + id)
        reTry(req_url, page, id, errTime)
      } else {
        SimpleConsole('[错误] 信息如下：')
        SimpleConsole(res.statusCode)
        if(type == 2 && !check_had(id)){
          flag.successList.push(id)
          showProgress()
        }
        
      }
  })

}











(() => {
  get_Data(req_config.url)
})()


