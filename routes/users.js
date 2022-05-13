var express = require("express");
var router = express.Router();
const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv/config");

const isLoggedIn = require("../middleware/isLoggedIn");

const saltRounds = 10;

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/signup", function (req, res, next) {
  //1. Make sure fields are filled out

  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ message: "Please fill out all fields" });
  }

  //2. Make sure username isn't taken

  User.findOne({ username: req.body.username })
    .then((foundUser) => {
      if (foundUser) {
        return res.status(400).json({ message: "Username is taken" });
      } else {
        //3. hash the password
        //3.1 generate the salt
        const salt = bcrypt.genSaltSync(saltRounds);
        //3.2 hash the password
        const hashedPassword = bcrypt.hashSync(req.body.password, salt);

        //4.Create the account
        User.create({
          username: req.body.username,
          password: hashedPassword,
        })
          .then((createdUser) => {
            //5. Create the JSON Web Token (JWT)
            //5.1 Create the payload
            const payload = { _id: createdUser._id };

            //5.2 Create the token

            const token = jwt.sign(payload, process.env.SECRET, {
              algorithm: "HS256",
              expiresIn: "24hr",
            });

            res.json({ token: token });
          })
          .catch((err) => {
            res.json(err.message);
          });
      }
    })
    .catch((err) => {
      res.json(err.message);
    });
});

router.post("/login", function (req, res, next) {
  //1. make sure fields are valid
  if (!req.body.username || !req.body.password) {
    return res.json({ message: "Please fill out all fields" });
  }

  //2. check username
  User.findOne({ username: req.body.username })
    .then((foundUser) => {
      //2.1 Make sure user exists
      if (!foundUser) {
        return res.json({ message: "Username or password incorrect" });
      }

      //2.2 Make sure passwords match
      const doesMatch = bcrypt.compareSync(
        req.body.password,
        foundUser.password
      );

      //3 create the token
      if (doesMatch) {
        //3.1 Create the payload
        const payload = { _id: foundUser._id };

        //3.2 Create the token

        const token = jwt.sign(payload, process.env.SECRET, {
          algorithm: "HS256",
          expiresIn: "24hr",
        });

        res.json({ token: token });
      } else {
        return res.json({ message: "Username or password incorrect" });
      }
    })
    .catch((err) => {
      res.json(err.message);
    });
});

//UPDATE A USER
router.post("/edit", isLoggedIn, (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    { username: req.body.username },
    { new: true }
  )
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      res.json(err.message);
    });
});

//DELETE A USER
router.post("/delete", isLoggedIn, (req, res) => {
  User.findByIdAndDelete(req.user._id, { new: true })
    .then((deletedUser) => {
      res.json(deletedUser);
    })
    .catch((err) => {
      res.json(err.message);
    });
});

//SNED A Friend:
router.post("/:id/invite", isLoggedIn, (req, res) => {
  User.findByIdAndUpdate(
    req.params.id,
    { $push: { friendRequest: req.user._id } },
    { new: true }
  )
    .then((foundUser) => {
      res.json(foundUser);
    })
    .catch((err) => {
      res.json(err.message);
    });
});

//ACCEPT
router.post("/:id/accept", isLoggedIn, (req, res) => {
  User.findByIdAndUpdate(
    req.params.id,
    { $push: { friends: req.user._id } },
    { new: true }
  )
    .then((foundUser) => {
      User.findByIdAndUpdate(
        req.user._id,
        {
          $push: { friends: req.params.id },
          $pull: { friendRequest: req.params.id },
        },
        { new: true }
      )
        .then((updatedUser) => {
          res.json(updatedUser);
        })
        .catch((err) => {
          res.json(err.message);
        });
    })
    .catch((err) => {
      res.json(err.message);
    });
});

//REJECT
router.post("/:id/reject", isLoggedIn, (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    { $pull: { friendRequest: req.params.id } },
    { new: true }
  )
    .then((removedUser) => {
      res.json(removedUser);
    })
    .catch((err) => {
      res.json(err.message);
    });
});

router.get("/login-test", isLoggedIn, (req, res) => {
  console.log("USER", req.user);
  res.json({ message: "You are logged in" });
});

module.exports = router;
