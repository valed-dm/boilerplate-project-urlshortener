var mongoose = require("mongoose");

var urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number,
  created: Date
});

module.exports = mongoose.model("urlLIST", urlSchema, "URLs");

