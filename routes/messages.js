var express = require("express");
var router = express.Router();
var User = require("../models/User.model");
var isLoggedIn = require("../middleware/isLoggedIn");

require("dotenv/config");

const accountSid = process.env.SID;
const authToken = process.env.AUTH_TOKEN;
const fromPhone = process.env.FROM_PHONE;

//NOTE: remove console.log() and commented out lines
console.log("accountSid", accountSid);
console.log("authToken", authToken);
console.log("fromPhone", fromPhone);
// const toPhone = process.env.TO_PHONE;

const client = require("twilio")(accountSid, authToken);

/* GET home page. */
router.post("/", isLoggedIn, function (req, res, next) {
  client.messages
    .create({
      to: req.body.number,
      from: fromPhone,
      body: req.body.message,
    })
    .then((message) => console.log(message.sid))
    .catch((err) => {
      //NOTE: add .status(400) to prevent side effects on the client
      //NOTE: add .json(), not console.log
      console.log("error", err.message);
    });
});

router.post("/:recipientId/send", isLoggedIn, function (req, res, next) {
  User.findById(req.params.recipientId)
    .then((foundUser) => {
      client.messages
        .create({
          to: foundUser.phone,
          //NOTE: remove commented out line
          // to: req.body.number,
          from: fromPhone,
          body: req.body.message,
        })
        .then((message) => res.json(message.sid))
        .catch((err) => {
          //NOTE: add .status(400) to prevent side effects on the client
          //NOTE: add .json(), not console.log
          console.log("error", err.message);
        });
    })
    .catch((err) => {
      //NOTE: add .status(400) to prevent side effects on the client
      //NOTE: add .json(), not console.log
      console.log("error", err.message);
    });
});
module.exports = router;
