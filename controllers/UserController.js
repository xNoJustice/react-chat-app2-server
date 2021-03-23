const User = require("../models/User");
const bcrypt = require("bcrypt");
const multer = require("multer");
const fs = require("fs");
const jwt = require("../JWT");

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    await User.findOne({ email: email }).then(async (user) => {
      if (user) {
        return res.status(400).json({ message: "Email Already Exists" });
      } else {
        await User.findOne({ username: username }).then(async (user) => {
          if (user) {
            return res.status(400).json({ message: "Username Already Exists" });
          } else {
            const user = new User({
              username: username,
              email: email,
              password: password,
            });
            await user.save();

            res.status(200).json({
              success: "Success",
            });
          }
        });
      }
    });
  } catch (err) {
    return res.status(400).json({ message: "Server Error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    await User.findOne({ email: email }).then(async (user) => {
      if (!user) {
        return res.status(400).json({
          message: "User Not Exist",
        });
      }

      await bcrypt.compare(password, user.password).then((isMatch) => {
        if (!isMatch) {
          return res.status(400).json({
            message: "Email or Password wrong!",
          });
        } else {
          const token = jwt.generateAccessToken(user);
          res.status(200).json({
            token: "Bearer " + token,
          });
        }
      });
    });
  } catch (err) {
    return res.status(400).json({ message: "Server Error" });
  }
};

exports.update = async (req, res) => {
  const { user, username, mail, password } = req.body;

  if (
    user !== undefined &&
    username !== undefined &&
    mail !== undefined &&
    password !== undefined
  ) {
    return res.status(400).json({
      message: "Fields are can't be empty!",
    });
  }
  let update = {};
  if (username) {
    update["username"] = username;
  }
  if (mail) {
    update["email"] = mail;
  }
  if (password) {
    const salt = bcrypt.genSalt();
    password = bcrypt.hash(password, salt);
    update["password"] = password;
  }
  User.findOneAndUpdate(
    { _id: user },
    { $set: update },
    { new: true },
    function (err, doc) {
      const token = jwt.generateAccessToken(doc);
      return res.status(200).json({
        token: "Bearer " + token,
      });
    }
  );
};

exports.profile = async (req, res) => {
  const storage = multer.diskStorage({
    destination: "./public/images",
    filename: function (req, file, cb) {
      let ext = file.originalname;
      ext = ext.split(".");
      ext = ext[ext.length - 1];
      cb(null, file.fieldname + "-" + Date.now() + "." + ext);
    },
  });

  const imageFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
      req.fileValidationError = "Only image files are allowed!";
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  };

  let upload = multer({
    storage: storage,
    fileFilter: imageFilter,
  }).single("image");

  upload(req, res, async function (err) {
    if (req.fileValidationError) {
      return res.status(400).json({
        message: req.fileValidationError,
      });
    } else if (!req.file) {
      return res.status(400).json({
        message: "Please select an image to upload",
      });
    } else if (err instanceof multer.MulterError) {
      return res.status(400).json({
        message: err,
      });
    } else if (err) {
      return res.status(400).json({
        message: err,
      });
    } else {
      User.findOne({ _id: req.payload.id }).then((user) => {
        try {
          if (fs.existsSync(__dirname + "/../public/images/" + user.avatar)) {
            fs.unlinkSync(__dirname + "/../public/images/" + user.avatar);
          }
          User.findOneAndUpdate(
            { _id: user._id },
            { $set: { avatar: req.file.filename } },
            { new: true },
            function (err, doc) {
              const token = jwt.generateAccessToken(doc);
              return res.status(200).json({
                token: "Bearer " + token,
              });
            }
          );
        } catch (err) {
          return res.status(400).json({
            message: err,
          });
        }
      });
    }
  });
};
