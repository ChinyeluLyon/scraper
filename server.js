const next = require("next");
const express = require("express");

const axios = require("axios");
const cheerio = require("cheerio");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const port = 3000;
const scrapeUrl = "http://books.toscrape.com/";
const currysUrl = "https://www.currys.co.uk/gbuk/index.html";

app.prepare().then(() => {
  const server = express();

  server.get("/currys", (req, res) => {
    try {
      axios(currysUrl).then((response) => {
        const stuff = [];
        html = response.data;

        const $ = cheerio.load(html);
        $(".ProductListItem__DivWrapper-sc-pb4x98-7 .cgxObq").each(
          (i, elem) => {
            const idk = $(elem)
              .find(
                ".ProductListItem__ProductPrices-sc-pb4x98-5 .beyIVb .productPrices"
              )
              .find(".ProductPriceBlock__Price-eXioPm .eTWvaA")
              .text();
            stuff.push(idk);
          }
        );
        res.json(stuff);
      });
    } catch (error) {
      console.log(error);
    }
  });

  server.get("/scrape", (req, res) => {
    try {
      axios(scrapeUrl).then((response) => {
        const bookTitlesArr = [];

        const $ = cheerio.load(response.data);
        $(".product_pod").each((i, elem) => {
          const bookTitle = $(elem).find("h3").find("a").attr("title");
          bookTitlesArr.push(bookTitle);
        });
        res.json(bookTitlesArr);
      });
    } catch (error) {
      console.log(error);
    }
  });

  server.get("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    else console.log(`server gwarning on port ${port}`);
  });
});
