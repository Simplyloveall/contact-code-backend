var express = require("express");
var router = express.Router();
const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv/config");

const fileUploader = require("../middleware/cloudinary.config");

const isLoggedIn = require("../middleware/isLoggedIn");

const saltRounds = 10;

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/signup", function (req, res, next) {
  //1. Make sure fields are filled out

  if (
    !req.body.contactCode ||
    !req.body.email ||
    !req.body.password ||
    !req.body.firstName ||
    !req.body.lastName
  ) {
    return res.status(400).json({ message: "Please fill out all fields" });
  }

  //2. Make sure username isn't taken

  User.findOne({ contactCode: req.body.contactCode })
    .then((foundUser) => {
      if (foundUser) {
        return res
          .status(400)
          .json({ message: "This contact-code is taken, claim yours now!" });
      } else {
        //3. hash the password
        //3.1 generate the salt
        const salt = bcrypt.genSaltSync(saltRounds);
        //3.2 hash the password
        const hashedPassword = bcrypt.hashSync(req.body.password, salt);

        //4.Create the account
        User.create({
          contactCode: req.body.contactCode,
          email: req.body.email,
          password: hashedPassword,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
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
  if (!req.body.contactCode || !req.body.password) {
    return res.json({ message: "Please fill out all fields" });
  }

  //2. check username
  User.findOne({ contactCode: req.body.contactCode })
    .then((foundUser) => {
      //2.1 Make sure user exists
      if (!foundUser) {
        return res.json({ message: "contact-code or password incorrect" });
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
        return res.json({ message: "contact-code or password incorrect" });
      }
    })
    .catch((err) => {
      res.json(err.message);
    });
});

//UPDATE A USER
router.post("/edit", isLoggedIn, (req, res) => {
  const removeFalsy = (obj) => {
    let newObj = {};
    Object.keys(obj).forEach((prop) => {
      if (obj[prop]) {
        newObj[prop] = obj[prop];
      }
    });
    return newObj;
  };

  let updateInfo = removeFalsy(req.body);
  console.log("message", updateInfo);
  console.log("PIC", updateInfo.profilePicture);
  User.findByIdAndUpdate(
    req.user._id,
    // { contactCode: req.body.contactCode },
    { ...updateInfo, profilePicture: updateInfo.profilePicture },
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
router.post("/delete-profile", isLoggedIn, (req, res, next) => {
  User.findById(req.user._id)
    .then((foundUser) => {
      const doesMatch = bcrypt.compareSync(
        req.body.password,
        foundUser.password
      );
      if (doesMatch) {
        foundUser.delete();
        res.json({ message: "success" });
      } else {
        res.status(401).json({ message: "password doesn't match" });
      }
    })
    .catch((error) => {
      res.status(400).json(error.message);
    });
});

//SNED A Friend:
router.post("/:id/invite", isLoggedIn, (req, res) => {
  User.findOneAndUpdate(
    { contactCode: req.params.id },
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

router.post(
  "/image-test",
  isLoggedIn,
  // fileUploader.single("imageUrl"),
  function (req, res, next) {
    // res.json(req.file);

    User.create({
      contactCode: req.body.contactCode,
      profilePicture: req.body.image,
    })
      .then((createdphoto) => {
        res.json(createdphoto);
      })
      .catch((err) => {
        res.json(err.message);
      });
  }
);

router.get("/profile-info", isLoggedIn, function (req, res, next) {
  User.findById(req.user._id)
    .then((foundUser) => {
      res.json(foundUser);
    })
    .catch((err) => {
      res.json(err.message);
    });
});

router.get("/login-test", isLoggedIn, (req, res) => {
  console.log("USER", req.user);
  User.findById(req.user._id)
    .populate("friendRequest")
    .populate("friends")
    .then((foundUser) => {
      res.json(foundUser);
    })
    .catch((err) => {
      res.json(err.message);
    });
});

router.post(
  "/image-upload",
  isLoggedIn,
  fileUploader.single("imageUrl"),
  function (req, res) {
    res.json(req.file.path);
  }
);

module.exports = router;
