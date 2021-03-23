const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const PORT = process.env.PORT || 5000;
const { addUser, getUser, deleteUser, getUsers } = require("./users");
//App Settings
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(__dirname + "/public/images"));
app.use("/api/users", require("./routes/Users"));
app.use("/api/rooms", require("./routes/Rooms"));
//DB Connect
mongoose
  .connect(process.env.dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.log(err));

//Models
const User = require("./models/User");
const Room = require("./models/Room");
const Message = require("./models/Message");

//Socket
require("./users");

io.on("connection", (socket) => {
  socket.on("login", async ({ username, room }, callback) => {
    const { error } = addUser(socket.id, username, room);
    if (error) return callback(error);
    socket.join(room);
    io.in(room).emit("users", getUsers(room));
    callback();
  });
  socket.on("sendMessage", (message) => {
    const user = getUser(socket.id);
    User.findOne({ _id: user.username[0] }).then(async (usr) => {
      Room.findOne({ name: user.room }).then(async (room) => {
        const newMessage = new Message({
          user: usr.id,
          room: room,
          message: message,
        });
        await newMessage.save();
      });
    });
    io.in(user.room).emit("message", {
      user: { username: user.username[1], avatar: user.username[2] },
      message: message,
    });
  });
  socket.on("disconnect", () => {
    const user = deleteUser(socket.id);
    if (user) {
      io.in(user.room).emit("users", getUsers(user.room));
    }
  });
});

app.get("/", (res) => {
  res.status(200).send("Server is up and running");
});

http.listen(PORT, () => {
  console.log(`Listening to ${PORT}`);
});
