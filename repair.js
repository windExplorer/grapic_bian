/**
 * 异常文件修复 
 * 主要修改cate以及两个size
 */

const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs')
const iconv = require('iconv-lite')
const Bagpipe = require('bagpipe')
let bagpipe = new Bagpipe(10)

let cate = 'fengjing/'
let path = './imgs/' + cate
let domain = 'http://www.netbian.com/'
let standradSize = 100
let bigSize = 300000  //id>15000

let user_agent_list = [
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
 ]

let header = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
  'Host': 'www.netbian.com',
  'User-Agent': user_agent_list[Math.floor(Math.random() * user_agent_list.length)],
  'Connection': 'keep-alive',
  //'Content-Type': 'application/json;charset=UTF-8',
  //'Accept-Encoding': 'gzip, deflate',
  'Accept-Language': 'zh-CN,zh;q=0.9'
} //请求头


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

let downloadUrl = (req_url, id, item) => {
  bagpipe.push(downloadImage, req_url, item, id, (err, data) => {
    console.log('[下载信息](下载完成) 文件id为：' + data)
  })
  //request(req_url).pipe(fs.createWriteStream(item))
}


let get_Data = (req_url, id, item) => {
  request({
    url: req_url,
    method: "GET",
    headers: header,
    encoding: null //关键代码
  }, (err, res, body) => {
    if (!err && res.statusCode == 200) {
      let html = iconv.decode(body, 'gb2312')
      let $ = cheerio.load(html, {decodeEntities: false})
      let src = $('.pic img').attr('src')
      //console.log('[信息](获取到图片真实链接) id为：' + id + ',链接为：' + src)
      downloadUrl(src, id, item)
      } else {
        console.log('出错：' + err)
    }
  })
}

let Run = (dir) => {
  fs.readdir(dir, (err, files) => {
    if(err){
      console.log('错误' + err)
      return
    }
    files.map((item, index) => {
      let id = item.split('.')[0] 
      item = path + item
      fs.stat(item, (err, stats) => {
        if(!err) {
          //console.log(index + ': ' + item)
          if(id >= 15000 && stats.size < bigSize || id < 15000 && stats.size < standradSize){
            console.log('[信息](文件异常) 重新下载 文件id和大小为 '+ id + '(' + stats.size + ')')
            let id_link = domain + 'desk/' + id + '.htm'
            get_Data(id_link, id, item)
          } else {
            //console.log('[信息](文件正常)')
          }
        } else {
          console.log(err)
        }
      })
    })
  })
}




(() => {
  Run(path)
})()