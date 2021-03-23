const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "rooms",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  message: String,
});

module.exports = Message = mongoose.model("messages", messageSchema);
