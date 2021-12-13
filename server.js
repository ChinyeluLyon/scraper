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

  //   server.get("/test/:parameter", function (req, res, next) {
  //     console.log(req.query.hi);
  //     res.send(`Test ${req.params.parameter}`);
  //   });

  //   server.get("/currys", (req, res) => {
  //     try {
  //       axios(currysUrl).then((response) => {
  //         const stuff = [];
  //         html = response.data;

  //         const $ = cheerio.load(html);
  //         $(".blocks__item").each((i, elem) => {
  //           const idk = $(elem)
  //             .find(".block__description")
  //             .find("a")
  //             .attr("title");
  //           stuff.push(idk);
  //         });
  //         res.json(stuff);
  //       });
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   });

  server.get("/scrape", (req, res) => {
    try {
      axios(scrapeUrl).then((response) => {
        const stuff = [];
        html = response.data;

        const $ = cheerio.load(html);
        $(".product_pod").each((i, elem) => {
          const idk = $(elem).find("h3").find("a").attr("title");
          stuff.push(idk);
        });
        res.json(stuff);
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
