require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const api = require("./api");
const urlDBModel = require("./dbSchema.js");
const validURL = require("urlregex");
let previous_short_url;
let requested_original_url;

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({ extended: false }));
app.use("/api", api);

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});

//this is valed-dm API endpoint ...
app.post(
  "/api/shorturl",
  async function(req, res, next) {
    previous_short_url = await urlDBModel
      .find()
      .sort("-short_url")
      .limit(1)
      .exec();
    next();
  },
  function(req, res) {
    //user-input evaluation with imported package "urlregex"
    if (!validURL("http").test(req.body["url"])) {
      res.json({ error: "invalid url" });
    } else {
      var newOriginalURL = new urlDBModel({
        original_url: req.body["url"],
        short_url: previous_short_url[0]["short_url"] + 1,
        created: new Date()
      });
      newOriginalURL.save(function(err, data) {
        if (err) {
          console.log(err);
        } else {
          res.json({
            original_url: req.body["url"],
            short_url: previous_short_url[0]["short_url"] + 1
          });
        }
      });
    }
  }
);

app.get(
  "/api/shorturl/:short_url",
  async function(req, res, next) {
    console.log(req.params.short_url);
    requested_original_url = await urlDBModel.find({
      short_url: req.params.short_url
    });
    next();
  },
  function(req, res) {
    res.redirect(303, requested_original_url[0]["original_url"]);
  }
);

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
