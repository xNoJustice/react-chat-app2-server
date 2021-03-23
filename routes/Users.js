const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const UserController = require("../controllers/UserController");

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/update", auth, UserController.update);
router.post("/profile", auth, UserController.profile);

module.exports = router;
