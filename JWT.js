const jwt = require("jsonwebtoken");

function generateAccessToken(user) {
  const payload = {
    id: user._id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
  };
  return jwt.sign(payload, process.env.SECRET, { expiresIn: "1h" });
}

module.exports = { generateAccessToken };
