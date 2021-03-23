const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
});

module.exports = Room = mongoose.model("rooms", roomSchema);
