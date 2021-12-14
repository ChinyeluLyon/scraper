const next = require("next");
const express = require("express");

const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const port = 3000;
const scrapeUrl = "http://books.toscrape.com/";
const currysUrl =
  "https://www.currys.co.uk/gbuk/search-keywords/xx_xx_xx_xx_xx/-flashdeals-/1_1000/relevance-desc/xx-criteria.html";

app.prepare().then(() => {
  const server = express();

  server.get("/currys", (req, res) => {
    try {
      (async () => {
        // set some options (set headless to false so we can see
        // this automated browsing experience)
        let launchOptions = { headless: false, args: ["--start-maximized"] };

        const browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();

        // set viewport and user agent (just in case for nice viewing)
        await page.setViewport({ width: 1366, height: 768 });
        await page.setUserAgent(
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
        );

        // go to the target web
        await page.goto(currysUrl);

        // wait for element defined by XPath appear in page
        await page.waitForXPath('//*[@id="onetrust-accept-btn-handler"]');

        // evaluate XPath expression of the target selector (it return array of ElementHandle)
        let elHandle = await page.$x('//*[@id="onetrust-accept-btn-handler"]');

        // prepare to get the textContent of the selector above (use page.evaluate)
        // let selectedText = await page.evaluate(
        //   (el) => el.textContent,
        //   elHandle[0]
        // );

        await page.click("[id='onetrust-accept-btn-handler']");

        // close the browser
        // await browser.close();
      })();
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
    else console.log(`server gwarning on port ${port} 👌`);
  });
});
