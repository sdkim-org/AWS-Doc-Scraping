const express = require('express');
const app = express();

const request = require('request');
const cheerio = require('cheerio');
const Iconv = require('iconv').Iconv;
const iconv = new Iconv('CP949', 'utf-8//translit//ignore');

app.get("/docs", (req, res) => {
    const url = "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html";

    request({url, encoding: null}, (err, response, body) => {
        let htmlDoc = iconv.convert(body).toString();
        //console.log(htmlDoc); // Get HTML Source

        let results = [];

        const $ = cheerio.load(htmlDoc);
        /*
        let docMain = $('div#main-col-body').each( (i, elem) => {
            results[i] = $(elem).html()
        });
        */
        let docMain = $('div#main-col-body').children().each( (i, elem) => {
            results[i] = $(elem).html();
        });
        for(let i=0; i<results.length; i++)
            console.log(">> "+results[i]);
        res.send("success");
    });
});

app.listen(3000, () => {
    console.log('listening on port 3000');
});
3