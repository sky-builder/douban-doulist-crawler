const cherrio = require("cheerio");
const axios = require("axios");
const _ = require("lodash");
const path = require("path");
const fs = require("fs");
const async = require('async')
const admin = require('firebase-admin');
var serviceAccount = require("./ebook-b6021-firebase-adminsdk-efxto-724656caf8.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ebook-b6021.firebaseio.com"
});
let db = admin.firestore();

let booksRef = db.collection('books');

async function fetchData(url) {
  let $ = cherrio.load(homePage.data);
  let pageUrlList = [];
  $(".paginator a").each((index, el) => {
    pageUrlList.push(el.attribs.href);
  });
  pageUrlList = _.uniq(pageUrlList);
  let psArr = [];
  pageUrlList.unshift(url);
  pageUrlList.forEach(async page => {
    psArr.push(axios.get(page).catch(err => console.log));
  });

  let bookUrlList = [];
  Promise.all(psArr).then(result => {
    result.forEach(r => {
      let $ = cherrio.load(r.data);
      $(".title a").each((index, el) => {
        bookUrlList.push(el.attribs.href);
      });
    });
    bookUrlList = _.uniq(bookUrlList);
    fs.writeFileSync(path.join(__dirname, "links"), bookUrlList.join("\n"));

    // let dataList = [];
  });
}
async function get(url, index, total) {
  if (index >= total) {
    console.log("done");
    return;
  }
  let result = await axios.get(url);
  let $ = cherrio.load(result.data);
  let intro;
  let authorIntro;
  let name;
  let author;
  let publisher;
  let publishDate;
  let isbn;

  authorSelector.forEach(sel => {
    if (author) return;
    if ($(sel).length > 0) {
      author = $(sel).text();
      author = author.replace(/\s/g, '');
    }
  })
  info = info.split('\n').filter(item => item.trim());
  let list = [];
  info.forEach(item => {
    let tmp = item.split(':');
    let tmp2 = [];
    for(let i = 0; i < tmp.length; i += 1) {
      tmp2.push(tmp[i]);
      if (i < tmp.length -1) {
        tmp2.push(":");
      }
    }
    list = list.concat(tmp2);
  })
  list = list.map(item => item.replace(/\s/g, '')).filter(item => item.trim());
  let indexList = [];
  list.forEach((item, index)=> {
    if (item === ':') {
      indexList.push(index);
    }
  })
  indexList.shift();
  let arr = []
  let prev = 0;
  while(indexList.length) {
    let i = indexList.shift();
    arr.slice(1, )
    let tmp = list.slice(prev, i - 1);
    prev = i - 1;
    arr.push(tmp.join(''));
  }
  name = $("#wrapper > h1 > span").text().trim();
  let cn2enMap = {
    '作者': 'author',
    "出版社": 'publisher',
    "出品方": "producer",
    "译者": "translator",
    "出版年": "publishDate",
    "页数": "pages",
    "定价": "price",
    "装帧": "framing",
    "丛书": "series"
  }
  let obj = {};
  arr.forEach(item => {
    item = item.split(':');
    let key = cn2enMap[item[0]];
    let value = item[1];
    obj[key] = value;
  })
  obj['intro'] = intro;
  obj['authorIntro'] = authorIntro;
  obj['name'] = name;
  console.log(obj);
}
let urls = ["https://book.douban.com/subject/1255625/"];
// get(urls[0], 0, 1);
// const url =
//   "https://www.douban.com/doulist/250576/?start=0&sort=time&playable=0&sub_type=";
// fetchData(url);


/**
 * 
 * @param {String} url 
 */
async function getCollectionPageList(id) {
  let url = 'https://www.douban.com/doulist/' + id;
  let first = await axios.get(url).catch(err => console.log);
  let $ = cherrio.load(first.data);

  let result = [];
  $(".paginator a").each((i, el) => {
    result.push(el.attribs.href);
  })
  result.unshift(url);
  result = _.uniq(result);
  return result;
}

/**
 * 
 * @param {Array} pageList page link list
 */
async function getCollectionBookList(pageList) {
  let psList = [];
  pageList.forEach(url => {
    psList.push(async () => {
      let list = [];
      let resp = await axios.get(url);
      let $ = cherrio.load(resp.data);
      $('.title a').each((i, el) => {
        list.push(el.attribs.href);
      })
      return list;
    });
  })
  return async.parallel(psList);
}

async function getBook(url) {
  let resp = await axios.get(url);
  let $ = cherrio.load(resp.data);
  let intro;
  let authorIntro;
  let name;
  let author;
  let publisher;
  let publishDate;
  let isbn;
  let coverUrl;
  let introSelector = [
    "#link-report > span.all.hidden > div > div > p",
    "#link-report > div:nth-child(1) > div > p"
  ];
  let authorIntroSelector = [
    '#content > div > div.article > div.related_info > div:nth-child(4) > span.all.hidden > div > p',
    '#content > div > div.article > div.related_info > div:nth-child(4) > span.short > div > p:nth-child(1)',
    "#content > div > div.article > div.related_info > div:nth-child(4) > div > div > p"
  ]
  introSelector.forEach(sel => {
    if (intro) return;
    if ($(sel).length) intro = $(sel).text();
  })
  authorIntroSelector.forEach(sel => {
    if (authorIntro) return;
    if ($(sel).length) authorIntro = $(sel).text();
  })
  let info = $('#info').text();
  let list = [];
  info = info.split('\n').filter(item => item.trim());
  info.forEach(item => {
    let tmp = item.split(':');
    let tmp2 = [];
    for(let i = 0; i < tmp.length; i += 1) {
      tmp2.push(tmp[i]);
      if (i < tmp.length -1) {
        tmp2.push(":");
      }
    }
    list = list.concat(tmp2);
  })
  list = list.map(item => item.replace(/\s/g, '')).filter(item => item.trim());
  let indexList = [];
  list.forEach((item, index)=> {
    if (item === ':') {
      indexList.push(index);
    }
  })
  indexList.shift();
  let arr = []
  let prev = 0;
  while(indexList.length) {
    let i = indexList.shift();
    arr.slice(1, )
    let tmp = list.slice(prev, i - 1);
    prev = i - 1;
    arr.push(tmp.join(''));
  }
  name = $("#wrapper > h1 > span").text().trim();
  let cn2enMap = {
    '作者': 'author',
    "出版社": 'publisher',
    "出品方": "producer",
    "译者": "translator",
    "出版年": "publishDate",
    "页数": "pages",
    "定价": "price",
    "装帧": "framing",
    "丛书": "series"
  }
  let obj = {};
  arr.forEach(item => {
    item = item.split(':');
    let key = cn2enMap[item[0]];
    let value = item[1];
    obj[key] = value;
  })
  obj['intro'] = intro;
  obj['authorIntro'] = authorIntro;
  obj['name'] = name;
  $('#mainpic > a > img').each((i, el) => {
    coverUrl = el.attribs.src;
  })
  obj['coverUrl'] = coverUrl;
  return obj;
}
/**
 * save data in firestore
 * @param {Object} data book data
 */
async function saveData(data) {
  let result = await booksRef.add(data);
  return result;
}

/**
 * 1. get all pages in series
 * 2. crawl pages, get books
 * 3. crawl books, get data
 * 4. save data in firebase
 */
async function main(id) {
  let pageList = await getCollectionPageList(id);
  // console.log(pageList)
  let bookList = await getCollectionBookList(pageList);
  bookList = _.flatten(bookList);
  let psArr = [];
  bookList.forEach(url => {
    psArr.push(async () => {
      let data = await getBook(url);
      console.log(data);
      let saveResult = await saveData(data);
      console.log('save result', saveResult);
    })
  })
  async.series(psArr);
}


main(250576);