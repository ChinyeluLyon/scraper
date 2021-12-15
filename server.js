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
const currysUrlPtA =
  "https://www.currys.co.uk/gbuk/search-keywords/xx_xx_xx_xx_xx/-flashdeals-/";
const currysStartPage = 1;
const currysPageSize = 10;
const currysUrlPtB = "/relevance-desc/xx-criteria.html";
const currysInitUrl = `${currysUrlPtA}${currysStartPage}_${currysPageSize}${currysUrlPtB}`;

app.prepare().then(() => {
  const server = express();

  server.get("/currys", (req, res) => {
    try {
      (async () => {
        // set some options (set headless to false so we can see this automated browsing experience)
        let launchOptions = { headless: false, args: ["--start-maximized"] };
        const browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();
        // set viewport and user agent (just in case for nice viewing)
        await page.setViewport({ width: 1366, height: 768 });
        await page.setUserAgent(
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
        );
        // go to the target page
        await page.goto(currysInitUrl);

        await page.waitForSelector("#onetrust-accept-btn-handler");
        await page.click("#onetrust-accept-btn-handler");

        await page.waitForSelector(".dc-product-listing__products-count");
        let numOfItemsEl = await page.$(".dc-product-listing__products-count");
        let numOfItemsStr = await page.evaluate(
          (el) => el.textContent,
          numOfItemsEl
        );
        const numOfItems = Number(numOfItemsStr.split("items")[0]);
        const numOfPages = Math.ceil(numOfItems / currysPageSize);
        console.log("numOfPages: ", numOfPages);

        const getAllProductInfo = async (pageNum) => {
          await page.waitForSelector(".product");
          let productClassArr = await page.$$(".product");
          // https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#pageselector-1

          productClassArr.forEach(async (el) => {
            const name = await el.$eval(".productTitle", (e) => e.textContent);

            // const preloadHref = await el.$('link[rel=preload]', (el) => el.href);

            console.log(name);
          });
          console.log(`\nNEW PAGE(${pageNum})\n`);
        };

        await getAllProductInfo(1);

        for (let i = 2; i <= numOfPages; i++) {
          await page.goto(
            `${currysUrlPtA}${i}_${currysPageSize}${currysUrlPtB}`
          );

          await getAllProductInfo(i);
        }

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
