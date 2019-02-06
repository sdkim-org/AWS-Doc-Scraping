const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const fs = require('fs');

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
    console.log('listening on port 3005');
});

function parseDocs(req, res) {
    const { url, cloud } = req.body;
    request({url, encoding: null}, (err, response, body) => {
        if(err) {
            console.log(err);
            //res.send("Invalid URL");
            res.render("error");
            return ;
        }

        let htmlDoc = iconv.convert(body).toString();

        let results = [];
        let str = '';
        const clouds = {
            aws : 'div#main-col-body',
            azure : 'main#main',
            googleCloud : 'article.devsite-article-inner'
        };

        const $ = cheerio.load(htmlDoc);

        let title='';
        if(cloud == 'googleCloud') { // <h1 itemprop="name" class="devsite-page-title"> ... </h1>
            $('.devsite-page-title').each((i, elem) => {
                title = $(elem).html().replace(/(\r\n\t|\n|\r\t)/gm, "").trim();
            });
        } else { // <title> ... </title>
            title = /<title>.+<\/title>/.exec(htmlDoc);
            title = title.toString().replace(/<title>/, "").replace(/<\/title>/, "");
        }

        $(clouds[cloud]).children().each( (i, elem) => {
            results[i] = $(elem).html().replace(/(\r\n\t|\n|\r\t)/gm, " "); // 개행 제거하기 (플랫폼 상관 없음)
            results[i] = results[i].replace(/\t+/g,"");             // \t 제거하기
            results[i] = results[i].replace(/  +/g, ' ').trim();    // 여러 개의 공백을 하나의 공백으로 변경
            results[i] = results[i].replace(/(<li([^>]+)>)/ig, "@@@");    // li 태그 <br> 태그로 변경
            results[i] = results[i].replace(/<\/h.>/ig, "@@@");    // </h.> 태그 <br> 태그로 변경
            results[i] = results[i].replace(/<\/li>/ig, "@@@");    // </li> 태그 <br> 태그로 변경
            results[i] = results[i].replace(/<ol>/ig, "@@@");    // ol 태그 <br> 태그로 변경
            results[i] = results[i].replace(/<dt>/ig, "@@@");    // dt 태그 <br> 태그로 변경
            results[i] = results[i].replace(/<dd>/ig, "@@@");    // dd 태그 <br> 태그로 변경
            results[i] = results[i].replace(/(<([^>]+)>)/ig,"");    // 태그 제거하기
            results[i] = results[i].replace(/@@@/ig, "\n");
            results[i] = results[i].replace(/\. /ig, ".\n");
            str = str + results[i] + '\n';
        });

        fs.writeFile(`./result/${cloud}_${title}.txt`, str, 'utf-8', (err, data) => {
            if(err) console.error(err);
            else {
                console.log('save files');
            }
        });

        //res.send('success');
        res.render("result");
    });
}

function testDoc(req, res) {
    const urlAws = "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html";
    const urlAzure = "https://docs.microsoft.com/en-us/azure/virtual-machines/linux/";
    const urlGoogleCloud = "https://cloud.google.com/kubernetes-engine/docs/tutorials/hello-app";

    request({urlAws, encoding: null}, (err, response, body) => {
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