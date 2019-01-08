# sdkim-org

### \# 1. doc 분석

추출대상은 `<div id="main-content"> ... <div id="main-col-body"> ` 태그로 감싸져 있음.



### \#2. doc 추출작업

사용한 모듈.

> request
>
> cheerio
>
> iconv



문제점

> `<ul>` 태그로 되어 있는 것들 한줄로 처리됨. 안에는  `<li>` 태그 세트들이 존재.
>
> `<dl>` 태그로 구현되어 있는 것들도 한줄로 처리됨. 안에는 `<dt>`, `<dd>` 태그 세트가 여럿 있음.



### \#3. 다듬기. 심플 View 페이지 

view engine 은 ejs 사용. 

`<div id="main-content"> ... <div id="main-col-body">` 태그의 자식태그를 기준으로 한줄 씩 출력. (자손들은 제외)

추가로 `<li>` 태그 세트들과 `<dt>` `<dd>` 태그 세트들이 한줄로 한번에 출력되어 이를  `<br>` 태그로 구준지음.