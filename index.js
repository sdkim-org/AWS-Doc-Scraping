const express = require('express');
const app = express();

const request = require('request');
const cheerio = require('cheerio');
const Iconv = require('iconv').Iconv;
const iconv = new Iconv('CP949', 'utf-8//translit//ignore');

/*** app.use() 는 HTTP Method 와 관게없이 무조건 실행 ***/
/*** '/' 에 접속시 '/public' 에 접속 ***/
app.use(express.static(__dirname + '/public'));

app.get("/docs", (req, res) => {
    const url = "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html";

    request({url, encoding: null}, (err, response, body) => {
        let htmlDoc = iconv.convert(body).toString();
        //console.log(htmlDoc); // Get HTML Source

        let results = [];

        const $ = cheerio.load(htmlDoc);

        let docMain = $('div#main-col-body').children().each( (i, elem) => {
            results[i] = $(elem).html().replace(/(\r\n\t|\n|\r\t)/gm, " "); // 개행 제거하기 (플랫폼 상관 없음)
        });
        for(let i=0; i<results.length; i++) {
            results[i] = results[i].replace(/(<([^>]+)>)/ig,"");    // 태그 제거하기
            results[i] = results[i].replace(/\t+/g,"");             // \t 제거하기
            results[i] = results[i].replace(/  +/g, ' ').trim();    // 여러 개의 공백을 하나의 공백으로 변경
            console.log(results[i] + '\n');
        }
        res.send("success");
    });
});

app.listen(3000, () => {
    console.log('listening on port 3000');
});