const User = require("../models/User");
const Room = require("../models/Room");
const Message = require("../models/Message");

exports.create = async (req, res) => {
  const { name, _id } = req.body;

  try {
    await Room.findOne({ name: name }).then(async (room) => {
      if (room) {
        return res.status(400).json({
          message: "The Room Already Exists",
        });
      } else {
        const newRoom = new Room({
          name,
        });
        await newRoom.save().then(async (room) => {
          await User.findOneAndUpdate(
            { _id: _id },
            { $push: { rooms: room._id } }
          );
          res.status(200).json({
            room: room,
          });
        });
      }
    });
  } catch (err) {
    return res.status(400).json({
      message: "Server Error",
    });
  }
};

exports.join = async (req, res) => {
  const { name, _id } = req.body;
  try {
    await Room.findOne({ name: name }).then(async (room) => {
      User.findOne({ _id: _id }).then(async (user) => {
        if (user.rooms.includes(room._id)) {
          res.status(200).json({
            room: room,
          });
        } else {
          await User.findOneAndUpdate(
            { _id: _id },
            { $push: { rooms: room._id } }
          );
          res.status(200).json({
            room: room,
          });
        }
      });
    });
  } catch (err) {
    return res.status(400).json({
      message: "Server Error",
    });
  }
};

exports.getRoom = async (req, res) => {
  const _id = req.params.id;

  try {
    await Room.findById({ _id }).then(async (room) => {
      if (!room) {
        return res.status(400).json({
          message: "The Room Not Exist",
        });
      } else {
        await Message.find({ room: room._id })
          .populate("user")
          .then((messages) => {
            return res.status(200).json({
              messages: messages,
              room: room,
            });
          });
      }
    });
  } catch (err) {
    return res.status(400).json({
      message: "Server Error",
    });
  }
};
