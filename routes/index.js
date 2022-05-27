var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

module.exports = router;

//NOTE: This file can be deleted, as it doesn't do anything. You also have to remove the imports for this inside app.js though
