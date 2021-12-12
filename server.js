const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const express = require("express");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const port = 3000;

app.prepare().then(() => {
  const server = express();

  //   server.get("/test/:parameter", function (req, res, next) {
  //     console.log(req.query.hi);
  //     res.send(`Test ${req.params.parameter}`);
  //   });

  server.get("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    else console.log(`server gwarning on port ${port}`);
  });
});
