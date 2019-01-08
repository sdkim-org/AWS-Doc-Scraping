const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const request = require('request');
const cheerio = require('cheerio');
const Iconv = require('iconv').Iconv;
const iconv = new Iconv('CP949', 'utf-8//translit//ignore');

/*** express 의 view engine 에 ejs 를 설정 ***/
app.set("view engine", "ejs");

/*** app.use() 는 HTTP Method 와 관게없이 무조건 실행 ***/
/*** '/' 에 접속시 '/public' 에 접속 ***/
app.use(express.static(__dirname + '/public'));

/*** bodyParser로 stream의 form data를 req.body에 담기 ***/
app.use(bodyParser.json());                         // json data 를
app.use(bodyParser.urlencoded({extended:true}));    // urlencoded data 를 담는다.

app.get("/docs", testDoc);
app.post("/docs", parseDocs);

app.listen(3005, () => {
    console.log('listening on port 3000');
});

function parseDocs(req, res) {
    const { url } = req.body;
    request({url, encoding: null}, (err, response, body) => {
        if(err) {
            console.log(err);
            res.send("Invalid URL");
            //res.render("error");
            return ;
        }

        let htmlDoc = iconv.convert(body).toString();

        let results = [];
        let str = "";

        const $ = cheerio.load(htmlDoc);

        let docMain = $('div#main-col-body').children().each( (i, elem) => {
            results[i] = $(elem).html().replace(/(\r\n\t|\n|\r\t)/gm, " "); // 개행 제거하기 (플랫폼 상관 없음)
            results[i] = results[i].replace(/\t+/g,"");             // \t 제거하기
            results[i] = results[i].replace(/  +/g, ' ').trim();    // 여러 개의 공백을 하나의 공백으로 변경
            results[i] = results[i].replace(/(<li([^>]+)>)/ig, "@@@");    // li 태그 제거하기
            results[i] = results[i].replace(/<dt>/ig, "@@@");    // dt 태그 제거하기
            results[i] = results[i].replace(/<dd>/ig, "@@@");    // dd 태그 제거하기
            results[i] = results[i].replace(/(<([^>]+)>)/ig,"");    // 태그 제거하기
            results[i] = results[i].replace(/@@@/ig, "<br>");    // @@@ 문자열 <br> 로 대체
            str = str + results[i] + '<br>';
        });
        res.send(str);
        //res.render("result");
    });
}

function testDoc(req, res) {
    const url = "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html";

    request({url, encoding: null}, (err, response, body) => {
        let htmlDoc = iconv.convert(body).toString();
        //console.log(htmlDoc); // Get HTML Source

        let results = [];

        const $ = cheerio.load(htmlDoc);

        let docMain = $('div#main-col-body').children().each( (i, elem) => {
            results[i] = $(elem).html().replace(/(\r\n\t|\n|\r\t)/gm, " "); // 개행 제거하기 (플랫폼 상관 없음)
            results[i] = results[i].replace(/\t+/g,"");             // \t 제거하기
            results[i] = results[i].replace(/  +/g, ' ').trim();    // 여러 개의 공백을 하나의 공백으로 변경
            results[i] = results[i].replace(/(<li([^>]+)>)/ig, "\n");    // li 태그 제거하기
            results[i] = results[i].replace(/<dt>/ig, "\n");    // dt 태그 제거하기
            results[i] = results[i].replace(/<dd>/ig, "\n");    // dd 태그 제거하기
            results[i] = results[i].replace(/(<([^>]+)>)/ig,"");    // 태그 제거하기
            console.log(results[i]);
        });
        res.send("success");
    });
}