const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const RoomController = require("../controllers/RoomController");

router.post("/create", auth, RoomController.create);
router.post("/join", auth, RoomController.join);
router.get("/messages/:id", auth, RoomController.getRoom);

module.exports = router;
